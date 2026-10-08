CREATE TABLE `item_history` (
	`id` text PRIMARY KEY NOT NULL,
	`store_id` text NOT NULL,
	`name` text NOT NULL,
	`normalized_name` text NOT NULL,
	`last_used_at` integer NOT NULL,
	FOREIGN KEY (`store_id`) REFERENCES `store`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `item_history_store_name_idx` ON `item_history` (`store_id`,`normalized_name`);