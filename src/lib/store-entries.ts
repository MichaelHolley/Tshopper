import type { Store } from '$lib/server/db/schema';

export type StoreEntry = { id: string | null; name: string; color: string | null };

export function orderStoreEntries(stores: Store[], defaultStoreId: string | null): StoreEntry[] {
	const ordered: StoreEntry[] = [
		...stores.map((s) => ({
			id: s.id as string | null,
			name: s.name,
			color: s.color as string | null
		})),
		{ id: null, name: 'Unassigned', color: null }
	];
	const defaultIndex = ordered.findIndex((e) => e.id === defaultStoreId);
	if (defaultIndex > 0) ordered.unshift(...ordered.splice(defaultIndex, 1));
	return ordered;
}
