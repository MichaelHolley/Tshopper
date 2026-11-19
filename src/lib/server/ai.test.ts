import { rmSync } from 'node:fs';
import { asSchema, type Tool } from 'ai';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { shoppingTools } from './ai';
import { db } from './db';
import { basicItem, shoppingItem, store } from './db/schema';
import * as shopping from './shopping';

const databaseDirectory = await vi.hoisted(async () => {
	const { mkdtempSync } = await import('node:fs');
	return mkdtempSync('.test-db-');
});

vi.mock('./db', async () => {
	const { drizzle } = await import('drizzle-orm/libsql/node');
	const schema = await import('./db/schema');
	return { db: drizzle({ connection: { url: `file:${databaseDirectory}/test.db` }, schema }) };
});

async function callTool<Input, Output>(tool: Tool<Input, Output>, input: unknown) {
	const result = await asSchema(tool.inputSchema).validate!(input);
	if (!result.success) throw result.error;
	return tool.execute!(result.value, { toolCallId: 'test', messages: [], context: undefined });
}

const tools = shoppingTools('store-a');
const listBasics = tools.list_basic_items!;
const addBasics = tools.add_basic_items!;
const updateBasic = tools.update_basic_item!;
const removeBasics = tools.remove_basic_items!;

beforeAll(async () => {
	await migrate(db, { migrationsFolder: 'drizzle' });
});

beforeEach(async () => {
	await db.delete(shoppingItem);
	await db.delete(basicItem);
	await db.delete(store);
	await db.insert(store).values([
		{ id: 'store-a', name: 'Store A', color: '#000000' },
		{ id: 'store-b', name: 'Store B', color: '#ffffff' }
	]);
});

afterAll(() => {
	db.$client.close();
	rmSync(databaseDirectory, { recursive: true, force: true });
});

describe('basic-item tools', () => {
	it('lists only the active store basics, with ids and names', async () => {
		await expect(callTool(listBasics, {})).resolves.toEqual([]);
		await shopping.addBasicItem('store-a', 'Milk');
		await shopping.addBasicItem('store-b', 'Bread');
		const [milk] = await shopping.listBasicItems('store-a');

		await expect(callTool(listBasics, {})).resolves.toEqual([{ id: milk.id, name: 'Milk' }]);
	});

	it('adds a batch of trimmed, deduplicated basics without changing shopping items', async () => {
		await shopping.addItem('Milk', '2 l', 'store-a');
		await shopping.addBasicItem('store-b', 'Milk');
		const originalShoppingItems = await shopping.listAllItems();

		await expect(
			callTool(addBasics, {
				items: [{ name: ' Milk ' }, { name: 'Eggs' }, { name: 'milk' }]
			})
		).resolves.toEqual({
			basicItems: [
				{ id: expect.any(String), name: 'Eggs' },
				{ id: expect.any(String), name: 'Milk' }
			]
		});
		await callTool(addBasics, { items: [{ name: 'MILK' }] });

		expect(await shopping.listBasicItems('store-a')).toHaveLength(2);
		expect(await shopping.listBasicItems('store-b')).toHaveLength(1);
		expect(await shopping.listAllItems()).toEqual(originalShoppingItems);
	});

	it('renames a basic item and updates its normalized name without renaming shopping items', async () => {
		await shopping.addBasicItem('store-a', 'Milk');
		await shopping.addItem('Milk', '2 l', 'store-a');
		const [milk] = await shopping.listBasicItems('store-a');
		const originalShoppingItems = await shopping.listAllItems();

		await expect(callTool(updateBasic, { id: milk.id, name: ' Oat Milk ' })).resolves.toEqual({
			id: milk.id,
			name: 'Oat Milk'
		});
		await callTool(addBasics, { items: [{ name: 'oat milk' }, { name: 'Milk' }] });

		const basics = await shopping.listBasicItems('store-a');
		expect(basics).toHaveLength(2);
		expect(basics).toContainEqual({ ...milk, name: 'Oat Milk', normalizedName: 'oat milk' });
		expect(await shopping.listAllItems()).toEqual(originalShoppingItems);
	});

	it('preserves existing basics when a rename would create a duplicate', async () => {
		await shopping.addBasicItem('store-a', 'Milk');
		await shopping.addBasicItem('store-a', 'Eggs');
		const original = await shopping.listBasicItems('store-a');
		const milk = original.find((item) => item.name === 'Milk')!;

		await expect(callTool(updateBasic, { id: milk.id, name: 'eggs' })).rejects.toThrow();
		expect(await shopping.listBasicItems('store-a')).toEqual(original);
	});

	it('rejects renames outside the active store and missing ids', async () => {
		await shopping.addBasicItem('store-b', 'Bread');
		const [bread] = await shopping.listBasicItems('store-b');

		for (const id of [bread.id, 'missing']) {
			await expect(callTool(updateBasic, { id, name: 'Milk' })).rejects.toThrow(
				'Basic item not found'
			);
		}
		expect(await shopping.listBasicItems('store-b')).toEqual([bread]);
	});

	it('removes a batch only from the active store and reports actual deletions', async () => {
		await shopping.addBasicItem('store-a', 'Milk');
		await shopping.addBasicItem('store-a', 'Eggs');
		await shopping.addBasicItem('store-b', 'Bread');
		await shopping.addItem('Milk', '', 'store-a');
		const [eggs, milk] = await shopping.listBasicItems('store-a');
		const [bread] = await shopping.listBasicItems('store-b');
		const originalShoppingItems = await shopping.listAllItems();

		await expect(
			callTool(removeBasics, { ids: [eggs.id, milk.id, milk.id, bread.id, 'missing'] })
		).resolves.toEqual({ removed: 2 });
		expect(await shopping.listBasicItems('store-a')).toEqual([]);
		expect(await shopping.listBasicItems('store-b')).toEqual([bread]);
		expect(await shopping.listAllItems()).toEqual(originalShoppingItems);
	});

	it('keeps basics when adding them to the shopping list', async () => {
		await callTool(addBasics, { items: [{ name: 'Milk' }] });
		const basics = await shopping.listBasicItems('store-a');
		await callTool(tools.add_items, { items: basics.map(({ name }) => ({ name, quantity: '' })) });

		expect(await shopping.listBasicItems('store-a')).toEqual(basics);
		expect(await shopping.listItems('store-a')).toEqual([
			expect.objectContaining({ item: 'Milk', quantity: '' })
		]);
	});

	it('does not expose basic-item tools for Unassigned', () => {
		const unassignedTools = shoppingTools(null);
		expect(Object.keys(unassignedTools).filter((name) => name.includes('basic'))).toEqual([]);
		expect(unassignedTools.add_items).toBeDefined();
		expect(unassignedTools.list_items).toBeDefined();
	});
});

describe('basic-item tool validation', () => {
	it.each(['', ' ', '\n\t'])(
		'rejects blank names (%j) before executing a batch or rename',
		async (name) => {
			await shopping.addBasicItem('store-a', 'Bread');
			const original = await shopping.listBasicItems('store-a');

			await expect(callTool(addBasics, { items: [{ name: 'Milk' }, { name }] })).rejects.toThrow();
			await expect(callTool(updateBasic, { id: original[0].id, name })).rejects.toThrow();
			expect(await shopping.listBasicItems('store-a')).toEqual(original);
		}
	);

	it('bounds additions to 1–50 items and removals to 1–200 ids', async () => {
		const addSchema = asSchema(addBasics.inputSchema);
		const removeSchema = asSchema(removeBasics.inputSchema);

		for (const count of [0, 1, 50, 51]) {
			const result = await addSchema.validate!({ items: Array(count).fill({ name: 'Milk' }) });
			expect(result.success).toBe(count >= 1 && count <= 50);
		}
		for (const count of [0, 1, 200, 201]) {
			const result = await removeSchema.validate!({ ids: Array(count).fill('item-id') });
			expect(result.success).toBe(count >= 1 && count <= 200);
		}
	});

	it('retains service-layer validation for callers that bypass the tool schemas', async () => {
		await expect(shopping.addBasicItem('store-a', ' ')).rejects.toThrow(
			'Item name cannot be empty'
		);
		await expect(shopping.updateBasicItem('missing', 'store-a', ' ')).rejects.toThrow(
			'Item name cannot be empty'
		);
	});
});
