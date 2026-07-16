import * as preferences from '$lib/server/preferences';
import type { PageServerLoad } from './$types';

/** Resolves the opening list before first paint, so the app never flashes Unassigned first. */
export const load: PageServerLoad = async () => {
	const { defaultStoreId } = await preferences.getPreferences();
	return { defaultStoreId };
};
