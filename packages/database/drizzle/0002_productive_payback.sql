PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_products` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`stall_id` text NOT NULL,
	`user_id` text NOT NULL,
	`identifier` text NOT NULL,
	`product_name` text NOT NULL,
	`description` text,
	`currency` text,
	`quantity` integer NOT NULL,
	`extra_cost` numeric DEFAULT '0' NOT NULL,
	`banned` integer DEFAULT false NOT NULL,
	`product_type` text DEFAULT 'simple' NOT NULL,
	`parent_id` text,
	`price` numeric NOT NULL,
	FOREIGN KEY (`stall_id`) REFERENCES `stalls`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`parent_id`) REFERENCES `products`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_products`("id", "created_at", "updated_at", "stall_id", "user_id", "identifier", "product_name", "description", "currency", "quantity", "extra_cost", "banned", "product_type", "parent_id", "price") SELECT "id", "created_at", "updated_at", "stall_id", "user_id", "identifier", "product_name", "description", "currency", "quantity", "extra_cost", "banned", "product_type", "parent_id", "price" FROM `products`;--> statement-breakpoint
DROP TABLE `products`;--> statement-breakpoint
ALTER TABLE `__new_products` RENAME TO `products`;--> statement-breakpoint
PRAGMA foreign_keys=ON;