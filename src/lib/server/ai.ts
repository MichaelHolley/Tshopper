import { tool } from 'ai';
import { z } from 'zod';
import * as shopping from './shopping';

/**
 * Tools run through the same service layer as the UI commands, so every mutation the
 * assistant makes calls `notifyChange()` and lands in the live queries on its own.
 * Each tool is bound to the caller's active store — the model never picks a store.
 */
export function shoppingTools(storeId: string | null) {
	return {
		list_items: tool({
			description:
				'List the current shopping items for the active store. Call this before update_item or remove_item to get accurate ids.',
			inputSchema: z.object({}),
			execute: async () => {
				const items = await shopping.listItems(storeId);
				return items.map((i) => ({
					id: i.id,
					name: i.item,
					quantity: i.quantity,
					checked: i.checked !== null
				}));
			}
		}),

		add_item: tool({
			description: 'Add a new item to the shopping list.',
			inputSchema: z.object({
				name: z.string().describe('Item name'),
				quantity: z
					.string()
					.describe(
						"Quantity or amount, e.g. '2', '1 kg', '500 ml'. Use an empty string if not specified."
					)
			}),
			execute: async ({ name, quantity }) => {
				const created = await shopping.addItem(name, quantity, storeId);
				return { id: created.id, name: created.item, quantity: created.quantity };
			}
		}),

		update_item: tool({
			description:
				"Update an existing item's name or quantity. Call list_items first to get the correct item id.",
			inputSchema: z.object({
				id: z.string().describe('Item id from list_items'),
				name: z.string().describe('New item name'),
				quantity: z.string().describe('New quantity')
			}),
			execute: async ({ id, name, quantity }) => {
				const updated = await shopping.updateItem(id, name, quantity);
				return { id: updated.id, name: updated.item, quantity: updated.quantity };
			}
		}),

		set_item_checked: tool({
			description:
				'Check a single item off the list, or un-check one that is already checked. Call list_items first to get the correct item id.',
			inputSchema: z.object({
				id: z.string().describe('Item id from list_items'),
				checked: z.boolean().describe('true to check the item off, false to un-check it')
			}),
			execute: async ({ id, checked }) => {
				const updated = checked ? await shopping.checkItem(id) : await shopping.uncheckItem(id);
				return { id: updated.id, name: updated.item, checked: updated.checked !== null };
			}
		}),

		remove_item: tool({
			description:
				'Remove a single item from the shopping list. Call list_items first to get the correct item id.',
			inputSchema: z.object({ id: z.string().describe('Item id from list_items') }),
			execute: async ({ id }) => {
				await shopping.deleteItem(id);
				return { removed: 1 };
			}
		}),

		remove_items: tool({
			description:
				'Remove multiple items at once. Prefer this over repeated remove_item calls when removing more than one item.',
			inputSchema: z.object({
				ids: z.array(z.string()).describe('Item ids from list_items')
			}),
			execute: async ({ ids }) => {
				for (const id of ids) await shopping.deleteItem(id);
				return { removed: ids.length };
			}
		}),

		clear_checked: tool({
			description:
				'Remove all checked items from the active store in one operation. Prefer this over removing checked items one by one.',
			inputSchema: z.object({}),
			execute: async () => {
				await shopping.clearChecked(storeId);
				return { cleared: true };
			}
		}),

		reorder_items: tool({
			description:
				'Reorder the unchecked items on the shopping list, e.g. to group related items together. Call list_items first, then pass every unchecked item id in the new order — the array must contain exactly the current unchecked items, just rearranged.',
			inputSchema: z.object({
				orderedIds: z.array(z.string()).describe('Ids of all unchecked items, in the desired order')
			}),
			execute: async ({ orderedIds }) => {
				await shopping.reorderItems(orderedIds, storeId);
				return { reordered: orderedIds.length };
			}
		})
	};
}

export function systemPrompt(storeName: string): string {
	return [
		'You are a helpful shopping list assistant for Tshopper.',
		`The user's active list is: ${storeName}. Every tool you call is already scoped to it.`,
		'Help users manage their shopping list using natural language.',
		'Rules:',
		'- Always call list_items before update_item, set_item_checked or remove_item to get accurate ids.',
		'- Checking an item off keeps it on the list; removing deletes it. Do not confuse the two.',
		'- For ambiguous requests, ask one concise clarifying question.',
		'- You can execute multiple operations for a single user message.',
		'- When operating on many items, use remove_items or clear_checked and batch tool calls in a single turn rather than one at a time.',
		'- To reorder the list, call reorder_items with every unchecked item id in the new order.',
		'- Keep responses brief — just confirm what you did or ask what you need.',
		'- Reply in plain sentences. Do not use markdown formatting.'
	].join('\n');
}
