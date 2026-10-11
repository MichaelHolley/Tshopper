import type { ShoppingItem } from '#lib/server/db/schema.js';

export function storeItems(items: ShoppingItem[], storeId: string | null): ShoppingItem[] {
	return items.filter((i) => i.storeId === storeId);
}

export function openItems(items: ShoppingItem[], storeId: string | null): ShoppingItem[] {
	return storeItems(items, storeId).filter((i) => i.checked === null);
}
