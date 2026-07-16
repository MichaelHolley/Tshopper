import { redirect } from '@sveltejs/kit';
import * as preferences from '$lib/server/preferences';
import type { LayoutServerLoad } from './$types';

/** Resolves the opening list before first paint, so the app never flashes Unassigned first. */
export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.authenticated) redirect(303, '/login');

	const { defaultStoreId } = await preferences.getPreferences();
	return { defaultStoreId };
};
