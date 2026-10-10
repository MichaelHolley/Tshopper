import { query, command } from '$app/server';
import { z } from 'zod';
import { requireAuth } from '#lib/server/auth.js';
import { changes } from '#lib/server/events.js';
import * as shopping from '#lib/server/shopping.js';
import { getStoreCatalog } from '#lib/basic-items.remote.js';

const storeId = z.string().nullable();

/**
 * The app's only live query, covering every store: each one holds a connection open, and
 * browsers cap HTTP/1.1 at six per origin across all tabs.
 */
export const getItems = query.live(async function* () {
	requireAuth();
	yield await shopping.listAllItems();
	for await (const _ of changes()) {
		yield await shopping.listAllItems();
	}
});

export const addItem = command(
	z.object({ item: z.string(), quantity: z.string(), storeId }),
	async ({ item, quantity, storeId }) => {
		requireAuth();
		await shopping.addItem(item, quantity, storeId);
		if (storeId !== null) void getStoreCatalog(storeId).refresh();
	}
);

export const updateItem = command(
	z.object({ id: z.string(), item: z.string(), quantity: z.string() }),
	async ({ id, item, quantity }) => {
		requireAuth();
		await shopping.updateItem(id, item, quantity);
	}
);

export const checkItem = command(z.string(), async (id) => {
	requireAuth();
	await shopping.checkItem(id);
});

export const uncheckItem = command(z.string(), async (id) => {
	requireAuth();
	await shopping.uncheckItem(id);
});

export const deleteItem = command(z.string(), async (id) => {
	requireAuth();
	await shopping.deleteItem(id);
});

export const clearChecked = command(storeId, async (storeId) => {
	requireAuth();
	await shopping.clearChecked(storeId);
});

export const reorderItems = command(
	z.object({ orderedIds: z.array(z.string()), storeId }),
	async ({ orderedIds, storeId }) => {
		requireAuth();
		await shopping.reorderItems(orderedIds, storeId);
	}
);

export const moveItem = command(
	z.object({ id: z.string(), targetStoreId: storeId }),
	async ({ id, targetStoreId }) => {
		requireAuth();
		await shopping.moveItem(id, targetStoreId);
	}
);
