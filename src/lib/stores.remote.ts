import { query, command } from '$app/server';
import { z } from 'zod';
import { requireAuth } from '$lib/server/auth';
import { changes } from '$lib/server/events';
import * as shopping from '$lib/server/shopping';

export const getStores = query.live(async function* () {
	requireAuth();
	yield await shopping.listStores();
	for await (const change of changes()) {
		void change;
		yield await shopping.listStores();
	}
});

export const addStore = command(
	z.object({ name: z.string(), color: z.string() }),
	async ({ name, color }) => {
		requireAuth();
		await shopping.addStore(name, color);
	}
);

export const updateStore = command(
	z.object({ id: z.string(), name: z.string(), color: z.string() }),
	async ({ id, name, color }) => {
		requireAuth();
		await shopping.updateStore(id, name, color);
	}
);

export const deleteStore = command(z.string(), async (id) => {
	requireAuth();
	await shopping.deleteStore(id);
});
