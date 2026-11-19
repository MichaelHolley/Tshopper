import {
	and,
	asc,
	desc,
	eq,
	inArray,
	isNotNull,
	isNull,
	max,
	ne,
	notExists,
	sql,
	type SQL
} from 'drizzle-orm';
import { db } from './db';
import {
	basicItem,
	itemHistory,
	shoppingItem,
	store,
	type BasicItem,
	type ItemHistoryEntry,
	type ShoppingItem,
	type Store
} from './db/schema';
import { notifyChange } from './events';
import { normalizeItemName } from '../item-name';

const CHECKED_TTL_MS = 1000 * 60 * 60 * 24 * 7;

function storeFilter(storeId: string | null) {
	return storeId === null ? isNull(shoppingItem.storeId) : eq(shoppingItem.storeId, storeId);
}

async function maxUncheckedSortOrder(storeId: string | null, excludeId?: string): Promise<number> {
	const conditions = [storeFilter(storeId), isNull(shoppingItem.checked)];
	if (excludeId) conditions.push(ne(shoppingItem.id, excludeId));
	const [row] = await db
		.select({ value: max(shoppingItem.sortOrder) })
		.from(shoppingItem)
		.where(and(...conditions));
	return row?.value ?? 0;
}

async function listVisibleItems(where?: SQL): Promise<ShoppingItem[]> {
	const items = await db
		.select()
		.from(shoppingItem)
		.where(where)
		.orderBy(asc(shoppingItem.sortOrder));

	const cutoff = Date.now() - CHECKED_TTL_MS;
	const unchecked = items.filter((i) => i.checked === null);
	const checked = items
		.filter((i) => i.checked !== null && i.checked.getTime() > cutoff)
		.sort((a, b) => b.checked!.getTime() - a.checked!.getTime());
	return [...unchecked, ...checked];
}

export async function listItems(storeId: string | null): Promise<ShoppingItem[]> {
	return listVisibleItems(storeFilter(storeId));
}

export async function listAllItems(): Promise<ShoppingItem[]> {
	return listVisibleItems();
}

export async function addItem(
	item: string,
	quantity: string,
	storeId: string | null
): Promise<ShoppingItem> {
	const [created] = await addItems([{ item, quantity }], storeId);
	return created;
}

export async function addItems(
	items: Array<{ item: string; quantity: string }>,
	storeId: string | null
): Promise<ShoppingItem[]> {
	const normalized = items.map(({ item, quantity }) => {
		const name = item.trim();
		if (!name) throw new Error('Item name cannot be empty');
		return { item: name, quantity: quantity.trim() };
	});
	if (normalized.length === 0) return [];

	const sortOrder = await maxUncheckedSortOrder(storeId);
	const created = await db.transaction(async (tx) => {
		const inserted = await tx
			.insert(shoppingItem)
			.values(
				normalized.map((item, index) => ({ ...item, storeId, sortOrder: sortOrder + index + 1 }))
			)
			.returning();
		if (storeId !== null) {
			const lastUsedAt = new Date();
			const history = new Map(
				normalized.map(({ item }) => {
					const normalizedName = normalizeItemName(item);
					return [normalizedName, { storeId, name: item, normalizedName, lastUsedAt }];
				})
			);
			await tx
				.insert(itemHistory)
				.values([...history.values()])
				.onConflictDoUpdate({
					target: [itemHistory.storeId, itemHistory.normalizedName],
					set: { name: sql`excluded.name`, lastUsedAt: sql`excluded.last_used_at` }
				});
		}
		return inserted;
	});
	notifyChange();
	return created.sort((a, b) => a.sortOrder - b.sortOrder);
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
	await db.delete(shoppingItem).where(and(storeFilter(storeId), isNotNull(shoppingItem.checked)));
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

export async function reorderItems(orderedIds: string[], storeId: string | null): Promise<void> {
	if (orderedIds.length === 0) return;

	const items = await db
		.select()
		.from(shoppingItem)
		.where(
			and(storeFilter(storeId), isNull(shoppingItem.checked), inArray(shoppingItem.id, orderedIds))
		);

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
	return updated;
}

export async function deleteStore(id: string): Promise<void> {
	await db.delete(store).where(eq(store.id, id));
	// The foreign key moves the store's items to Unassigned, so the live list changes too.
	notifyChange();
}

export async function listBasicItems(storeId: string): Promise<BasicItem[]> {
	const items = await db.select().from(basicItem).where(eq(basicItem.storeId, storeId));
	// SQLite orders by byte value, which would sort `Äpfel` after `Zucchini`.
	return items.sort((a, b) => a.name.localeCompare(b.name));
}

export async function addBasicItems(storeId: string, names: string[]): Promise<void> {
	const trimmed = names.map((name) => name.trim());
	if (trimmed.some((name) => !name)) throw new Error('Item name cannot be empty');
	if (trimmed.length === 0) return;

	await db
		.insert(basicItem)
		.values(trimmed.map((name) => ({ storeId, name, normalizedName: normalizeItemName(name) })))
		.onConflictDoNothing();
}

export async function updateBasicItem(
	id: string,
	storeId: string,
	name: string
): Promise<BasicItem> {
	const trimmed = name.trim();
	if (!trimmed) throw new Error('Item name cannot be empty');
	const normalizedName = normalizeItemName(trimmed);

	const [duplicate] = await db
		.select({ id: basicItem.id })
		.from(basicItem)
		.where(
			and(
				eq(basicItem.storeId, storeId),
				eq(basicItem.normalizedName, normalizedName),
				ne(basicItem.id, id)
			)
		)
		.limit(1);
	if (duplicate) throw new Error(`A basic item named "${trimmed}" already exists`);

	const [updated] = await db
		.update(basicItem)
		.set({ name: trimmed, normalizedName })
		.where(and(eq(basicItem.id, id), eq(basicItem.storeId, storeId)))
		.returning();
	if (!updated) throw new Error('Basic item not found');
	return updated;
}

export async function deleteBasicItem(id: string, storeId: string): Promise<boolean> {
	const deleted = await db
		.delete(basicItem)
		.where(and(eq(basicItem.id, id), eq(basicItem.storeId, storeId)))
		.returning({ id: basicItem.id });
	return deleted.length > 0;
}

export async function listItemHistory(storeId: string): Promise<ItemHistoryEntry[]> {
	return db
		.select()
		.from(itemHistory)
		.where(
			and(
				eq(itemHistory.storeId, storeId),
				notExists(
					db
						.select()
						.from(basicItem)
						.where(
							and(
								eq(basicItem.storeId, itemHistory.storeId),
								eq(basicItem.normalizedName, itemHistory.normalizedName)
							)
						)
				)
			)
		)
		.orderBy(desc(itemHistory.lastUsedAt));
}

export async function deleteHistoryEntry(id: string): Promise<void> {
	await db.delete(itemHistory).where(eq(itemHistory.id, id));
}

export type StoreCatalog = { basicItems: BasicItem[]; history: ItemHistoryEntry[] };

export async function getStoreCatalog(storeId: string): Promise<StoreCatalog> {
	const [basicItems, history] = await Promise.all([
		listBasicItems(storeId),
		listItemHistory(storeId)
	]);
	return { basicItems, history };
}
