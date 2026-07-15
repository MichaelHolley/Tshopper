import { query, command } from '$app/server';
import { z } from 'zod';
import { requireAuth } from '$lib/server/auth';
import { changes } from '$lib/server/events';
import * as shopping from '$lib/server/shopping';

const storeId = z.string().nullable();

export const getItems = query.live(storeId, async function* (storeId) {
	requireAuth();
	yield await shopping.listItems(storeId);
	for await (const _ of changes()) {
		yield await shopping.listItems(storeId);
	}
});

export const addItem = command(
	z.object({ item: z.string(), quantity: z.string(), storeId }),
	async ({ item, quantity, storeId }) => {
		requireAuth();
		await shopping.addItem(item, quantity, storeId);
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

export const moveItem = command(
	z.object({ id: z.string(), targetStoreId: storeId }),
	async ({ id, targetStoreId }) => {
		requireAuth();
		await shopping.moveItem(id, targetStoreId);
	}
);
