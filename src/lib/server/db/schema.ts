import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const store = sqliteTable('store', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text('name').notNull(),
	color: text('color').notNull()
});

export const shoppingItem = sqliteTable('shopping_item', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	item: text('item').notNull(),
	quantity: text('quantity').notNull().default(''),
	checked: integer('checked', { mode: 'timestamp' }),
	sortOrder: integer('sort_order').notNull().default(0),
	storeId: text('store_id').references(() => store.id, { onDelete: 'set null' })
});

export const basicItem = sqliteTable(
	'basic_item',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		storeId: text('store_id')
			.notNull()
			.references(() => store.id, { onDelete: 'cascade' }),
		name: text('name').notNull(),
		normalizedName: text('normalized_name').notNull()
	},
	(table) => [uniqueIndex('basic_item_store_name_idx').on(table.storeId, table.normalizedName)]
);

export const itemHistory = sqliteTable(
	'item_history',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		storeId: text('store_id')
			.notNull()
			.references(() => store.id, { onDelete: 'cascade' }),
		name: text('name').notNull(),
		normalizedName: text('normalized_name').notNull(),
		lastUsedAt: integer('last_used_at', { mode: 'timestamp' }).notNull()
	},
	(table) => [uniqueIndex('item_history_store_name_idx').on(table.storeId, table.normalizedName)]
);

/** Global singleton — one household, one preferences row. */
export const preferences = sqliteTable('preferences', {
	id: text('id').primaryKey().default('global'),
	defaultStoreId: text('default_store_id').references(() => store.id, { onDelete: 'set null' })
});

export const PREFERENCES_ID = 'global';

export type Store = typeof store.$inferSelect;
export type ShoppingItem = typeof shoppingItem.$inferSelect;
export type BasicItem = typeof basicItem.$inferSelect;
export type ItemHistoryEntry = typeof itemHistory.$inferSelect;
export type Preferences = typeof preferences.$inferSelect;
