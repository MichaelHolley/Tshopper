import { eq } from 'drizzle-orm';
import { db } from './db';
import { preferences, store, PREFERENCES_ID, type Preferences } from './db/schema';
import { notifyChange } from './events';

const EMPTY: Preferences = { id: PREFERENCES_ID, defaultStoreId: null };

/** The singleton row is created lazily, so its absence is a valid empty state rather than an error. */
export async function getPreferences(): Promise<Preferences> {
	const [row] = await db.select().from(preferences).where(eq(preferences.id, PREFERENCES_ID));
	return row ?? EMPTY;
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
