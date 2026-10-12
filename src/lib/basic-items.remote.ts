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

export const deleteBasicItem = command(
	z.object({ id: z.string(), storeId: z.string() }),
	async ({ id, storeId }) => {
		requireAuth();
		await shopping.deleteBasicItem(id);
		void getStoreCatalog(storeId).refresh();
	}
);

export const deleteHistoryEntry = command(
	z.object({ id: z.string(), storeId: z.string() }),
	async ({ id, storeId }) => {
		requireAuth();
		await shopping.deleteHistoryEntry(id);
		void getStoreCatalog(storeId).refresh();
	}
);
