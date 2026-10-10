import { query, command } from '$app/server';
import { z } from 'zod';
import { requireAuth } from '#lib/server/auth.js';
import * as preferences from '#lib/server/preferences.js';

export const getPreferences = query(async () => {
	requireAuth();
	return preferences.getPreferences();
});

export const setDefaultStore = command(z.string().nullable(), async (storeId) => {
	requireAuth();
	await preferences.setDefaultStore(storeId);
	void getPreferences().refresh();
});
