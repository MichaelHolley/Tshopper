import { query, command } from '$app/server';
import { z } from 'zod';
import { requireAuth } from '#lib/server/auth.js';
import * as shopping from '#lib/server/shopping.js';
import { getStoreCatalog } from '#lib/basic-items.remote.js';
import { getPreferences } from '#lib/preferences.remote.js';

export const getStores = query(async () => {
	requireAuth();
	return shopping.listStores();
});

/**
 * Catches up on what other sessions changed, in one request. Calling `refresh()` on the client
 * instead leaves a query rejected when the request fails, which would swap the last good data
 * for an error every time the phone wakes without reception.
 */
export const refreshStoreData = command(z.string().nullable(), async (activeStoreId) => {
	requireAuth();
	void getStores().refresh();
	void getPreferences().refresh();
	if (activeStoreId !== null) void getStoreCatalog(activeStoreId).refresh();
});

export const addStore = command(
	z.object({ name: z.string(), color: z.string() }),
	async ({ name, color }) => {
		requireAuth();
		await shopping.addStore(name, color);
		void getStores().refresh();
	}
);

export const updateStore = command(
	z.object({ id: z.string(), name: z.string(), color: z.string() }),
	async ({ id, name, color }) => {
		requireAuth();
		await shopping.updateStore(id, name, color);
		void getStores().refresh();
	}
);

export const deleteStore = command(z.string(), async (id) => {
	requireAuth();
	await shopping.deleteStore(id);
	void getStores().refresh();
	void getPreferences().refresh();
});
