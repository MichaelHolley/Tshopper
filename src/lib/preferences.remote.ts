import { query, command } from '$app/server';
import { z } from 'zod';
import { requireAuth } from '$lib/server/auth';
import { changes } from '$lib/server/events';
import * as preferences from '$lib/server/preferences';

export const getPreferences = query.live(async function* () {
	requireAuth();
	yield await preferences.getPreferences();
	for await (const _ of changes()) {
		yield await preferences.getPreferences();
	}
});

export const setDefaultStore = command(z.string().nullable(), async (storeId) => {
	requireAuth();
	await preferences.setDefaultStore(storeId);
});
