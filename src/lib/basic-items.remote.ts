import { query, command } from '$app/server';
import { z } from 'zod';
import { requireAuth } from '#lib/server/auth.js';
import * as shopping from '#lib/server/shopping.js';

export const getStoreCatalog = query(z.string(), async (storeId) => {
	requireAuth();
	return shopping.getStoreCatalog(storeId);
});

export const addBasicItem = command(
	z.object({ storeId: z.string(), name: z.string() }),
	async ({ storeId, name }) => {
		requireAuth();
		await shopping.addBasicItem(storeId, name);
		void getStoreCatalog(storeId).refresh();
	}
);

export const deleteBasicItem = command(z.string(), async (id) => {
	requireAuth();
	const storeId = await shopping.deleteBasicItem(id);
	if (storeId !== null) void getStoreCatalog(storeId).refresh();
});

export const deleteHistoryEntry = command(z.string(), async (id) => {
	requireAuth();
	const storeId = await shopping.deleteHistoryEntry(id);
	if (storeId !== null) void getStoreCatalog(storeId).refresh();
});
