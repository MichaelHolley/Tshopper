import { eq } from 'drizzle-orm';
import { db } from './db';
import { preferences, store, PREFERENCES_ID, type Preferences } from './db/schema';
import { notifyChange } from './events';

const EMPTY: Preferences = { id: PREFERENCES_ID, defaultStoreId: null };

/**
 * The singleton row is created lazily, so its absence is a valid empty state rather than an
 * error. A default store that no longer exists is cleared on read: the FK's `set null` covers
 * deletes made through the app, but a stale row shouldn't strand the app on a missing store.
 */
export async function getPreferences(): Promise<Preferences> {
	const [row] = await db
		.select({ prefs: preferences, storeId: store.id })
		.from(preferences)
		.leftJoin(store, eq(preferences.defaultStoreId, store.id))
		.where(eq(preferences.id, PREFERENCES_ID));

	if (!row) return EMPTY;
	if (row.prefs.defaultStoreId !== null && row.storeId === null) return setDefaultStore(null);
	return row.prefs;
}

export async function setDefaultStore(storeId: string | null): Promise<Preferences> {
	if (storeId !== null) {
		const [exists] = await db.select({ id: store.id }).from(store).where(eq(store.id, storeId));
		if (!exists) throw new Error('Store not found');
	}

	const [saved] = await db
		.insert(preferences)
		.values({ id: PREFERENCES_ID, defaultStoreId: storeId })
		.onConflictDoUpdate({ target: preferences.id, set: { defaultStoreId: storeId } })
		.returning();
	notifyChange();
	return saved;
}
