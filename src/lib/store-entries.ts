import type { Store } from '#lib/server/db/schema.js';

export type StoreEntry = { id: string | null; name: string; color: string | null };

export const UNASSIGNED: StoreEntry = { id: null, name: 'Unassigned', color: null };

export function orderStoreEntries(stores: Store[], defaultStoreId: string | null): StoreEntry[] {
	const ordered: StoreEntry[] = [...stores, UNASSIGNED];
	const defaultIndex = ordered.findIndex((e) => e.id === defaultStoreId);
	if (defaultIndex > 0) ordered.unshift(...ordered.splice(defaultIndex, 1));
	return ordered;
}
