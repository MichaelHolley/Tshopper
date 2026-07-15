CREATE TABLE `preferences` (
	`id` text PRIMARY KEY DEFAULT 'global' NOT NULL,
	`default_store_id` text,
	FOREIGN KEY (`default_store_id`) REFERENCES `store`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `shopping_item` (
	`id` text PRIMARY KEY NOT NULL,
	`item` text NOT NULL,
	`quantity` text DEFAULT '' NOT NULL,
	`checked` integer,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`store_id` text,
	FOREIGN KEY (`store_id`) REFERENCES `store`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `store` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`color` text NOT NULL
);
