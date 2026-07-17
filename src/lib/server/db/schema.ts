import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

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

/** Global singleton — one household, one preferences row. */
export const preferences = sqliteTable('preferences', {
	id: text('id').primaryKey().default('global'),
	defaultStoreId: text('default_store_id').references(() => store.id, { onDelete: 'set null' })
});

export const PREFERENCES_ID = 'global';

export type Store = typeof store.$inferSelect;
export type ShoppingItem = typeof shoppingItem.$inferSelect;
export type Preferences = typeof preferences.$inferSelect;
