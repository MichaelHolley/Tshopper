import { query, command } from '$app/server';
import { z } from 'zod';
import { requireAuth } from '#lib/server/auth.js';
import { changes } from '#lib/server/events.js';
import * as shopping from '#lib/server/shopping.js';

/**
 * Basic items and history share one live query: each one holds a connection open, and browsers
 * cap HTTP/1.1 at six per origin, so a seventh stalls every later request.
 */
export const getStoreCatalog = query.live(z.string(), async function* (storeId) {
	requireAuth();
	yield await shopping.getStoreCatalog(storeId);
	for await (const _ of changes()) {
		yield await shopping.getStoreCatalog(storeId);
	}
});

export const addBasicItem = command(
	z.object({ storeId: z.string(), name: z.string() }),
	async ({ storeId, name }) => {
		requireAuth();
		await shopping.addBasicItem(storeId, name);
	}
);

export const deleteBasicItem = command(z.string(), async (id) => {
	requireAuth();
	await shopping.deleteBasicItem(id);
});

export const deleteHistoryEntry = command(z.string(), async (id) => {
	requireAuth();
	await shopping.deleteHistoryEntry(id);
});
