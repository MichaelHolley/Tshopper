import { and, asc, desc, eq, inArray, isNotNull, isNull, max, ne } from 'drizzle-orm';
import { db } from './db';
import { shoppingItem, store, type ShoppingItem, type Store } from './db/schema';
import { notifyChange } from './events';

const CHECKED_TTL_MS = 1000 * 60 * 60 * 24 * 7;

function storeFilter(storeId: string | null) {
	return storeId === null ? isNull(shoppingItem.storeId) : eq(shoppingItem.storeId, storeId);
}

/** Highest sort order among unchecked items in a store; append target sits at `result + 1`. */
async function maxUncheckedSortOrder(storeId: string | null, excludeId?: string): Promise<number> {
	const conditions = [storeFilter(storeId), isNull(shoppingItem.checked)];
	if (excludeId) conditions.push(ne(shoppingItem.id, excludeId));
	const [row] = await db
		.select({ value: max(shoppingItem.sortOrder) })
		.from(shoppingItem)
		.where(and(...conditions));
	return row?.value ?? 0;
}

/**
 * Unchecked items by manual order, then checked items newest-first. Checked items older
 * than 7 days are dropped so the list does not grow without bound.
 */
export async function listItems(storeId: string | null): Promise<ShoppingItem[]> {
	const items = await db
		.select()
		.from(shoppingItem)
		.where(storeFilter(storeId))
		.orderBy(asc(shoppingItem.sortOrder), desc(shoppingItem.checked));

	const cutoff = Date.now() - CHECKED_TTL_MS;
	const unchecked: ShoppingItem[] = [];
	const checked: ShoppingItem[] = [];
	for (const item of items) {
		if (item.checked === null) {
			unchecked.push(item);
		} else if (item.checked.getTime() > cutoff) {
			checked.push(item);
		}
	}
	checked.sort((a, b) => b.checked!.getTime() - a.checked!.getTime());
	return [...unchecked, ...checked];
}

export async function addItem(
	item: string,
	quantity: string,
	storeId: string | null
): Promise<ShoppingItem> {
	const name = item.trim();
	if (!name) throw new Error('Item name cannot be empty');

	const sortOrder = (await maxUncheckedSortOrder(storeId)) + 1;
	const [created] = await db
		.insert(shoppingItem)
		.values({ item: name, quantity: quantity.trim(), storeId, sortOrder })
		.returning();
	notifyChange();
	return created;
}

export async function updateItem(
	id: string,
	item: string,
	quantity: string
): Promise<ShoppingItem> {
	const name = item.trim();
	if (!name) throw new Error('Item name cannot be empty');

	const [updated] = await db
		.update(shoppingItem)
		.set({ item: name, quantity: quantity.trim() })
		.where(eq(shoppingItem.id, id))
		.returning();
	if (!updated) throw new Error('Item not found');
	notifyChange();
	return updated;
}

export async function checkItem(id: string): Promise<ShoppingItem> {
	const [updated] = await db
		.update(shoppingItem)
		.set({ checked: new Date() })
		.where(eq(shoppingItem.id, id))
		.returning();
	if (!updated) throw new Error('Item not found');
	notifyChange();
	return updated;
}

export async function uncheckItem(id: string): Promise<ShoppingItem> {
	const [current] = await db.select().from(shoppingItem).where(eq(shoppingItem.id, id));
	if (!current) throw new Error('Item not found');

	const sortOrder = (await maxUncheckedSortOrder(current.storeId, id)) + 1;
	const [updated] = await db
		.update(shoppingItem)
		.set({ checked: null, sortOrder })
		.where(eq(shoppingItem.id, id))
		.returning();
	notifyChange();
	return updated;
}

export async function deleteItem(id: string): Promise<void> {
	await db.delete(shoppingItem).where(eq(shoppingItem.id, id));
	notifyChange();
}

export async function clearChecked(storeId: string | null): Promise<void> {
	await db
		.delete(shoppingItem)
		.where(and(storeFilter(storeId), isNotNull(shoppingItem.checked)));
	notifyChange();
}

export async function moveItem(id: string, targetStoreId: string | null): Promise<ShoppingItem> {
	const sortOrder = (await maxUncheckedSortOrder(targetStoreId, id)) + 1;
	const [updated] = await db
		.update(shoppingItem)
		.set({ storeId: targetStoreId, sortOrder })
		.where(eq(shoppingItem.id, id))
		.returning();
	if (!updated) throw new Error('Item not found');
	notifyChange();
	return updated;
}

/**
 * Persist a manual order for the unchecked items of a store. `orderedIds` must be exactly
 * the unchecked items in that store; sort order follows their position. Checked items and
 * cross-store ids are rejected so a stale client can't scramble the list.
 */
export async function reorderItems(orderedIds: string[], storeId: string | null): Promise<void> {
	if (orderedIds.length === 0) return;

	const items = await db
		.select()
		.from(shoppingItem)
		.where(and(storeFilter(storeId), isNull(shoppingItem.checked), inArray(shoppingItem.id, orderedIds)));

	if (items.length !== orderedIds.length) {
		throw new Error('Reorder set does not match the unchecked items in this store');
	}

	await db.transaction(async (tx) => {
		for (let i = 0; i < orderedIds.length; i++) {
			await tx
				.update(shoppingItem)
				.set({ sortOrder: i + 1 })
				.where(eq(shoppingItem.id, orderedIds[i]));
		}
	});
	notifyChange();
}

export async function listStores(): Promise<Store[]> {
	return db.select().from(store).orderBy(asc(store.name));
}

export async function addStore(name: string, color: string): Promise<Store> {
	const trimmed = name.trim();
	if (!trimmed) throw new Error('Store name cannot be empty');
	if (!color.trim()) throw new Error('Store color cannot be empty');

	const [created] = await db.insert(store).values({ name: trimmed, color }).returning();
	notifyChange();
	return created;
}

export async function updateStore(id: string, name: string, color: string): Promise<Store> {
	const trimmed = name.trim();
	if (!trimmed) throw new Error('Store name cannot be empty');
	if (!color.trim()) throw new Error('Store color cannot be empty');

	const [updated] = await db
		.update(store)
		.set({ name: trimmed, color })
		.where(eq(store.id, id))
		.returning();
	if (!updated) throw new Error('Store not found');
	notifyChange();
	return updated;
}

/** Items keep their rows; the `set null` FK drops them into the unassigned list. */
export async function deleteStore(id: string): Promise<void> {
	await db.delete(store).where(eq(store.id, id));
	notifyChange();
}
