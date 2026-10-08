import { query, command } from '$app/server';
import { z } from 'zod';
import { requireAuth } from '#lib/server/auth.js';
import { changes } from '#lib/server/events.js';
import * as shopping from '#lib/server/shopping.js';

export const getBasicItems = query.live(z.string(), async function* (storeId) {
	requireAuth();
	yield await shopping.listBasicItems(storeId);
	for await (const _ of changes()) {
		yield await shopping.listBasicItems(storeId);
	}
});

export const getSuggestions = query.live(z.string(), async function* (storeId) {
	requireAuth();
	yield await shopping.listSuggestions(storeId);
	for await (const _ of changes()) {
		yield await shopping.listSuggestions(storeId);
	}
});

export const getItemHistory = query.live(z.string(), async function* (storeId) {
	requireAuth();
	yield await shopping.listItemHistory(storeId);
	for await (const _ of changes()) {
		yield await shopping.listItemHistory(storeId);
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
