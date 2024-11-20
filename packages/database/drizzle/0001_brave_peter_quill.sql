PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_event_tags` (
	`tag_name` text NOT NULL,
	`tag_value` text NOT NULL,
	`second_tag_value` text,
	`third_tag_value` text,
	`event_id` text NOT NULL,
	`user_id` text NOT NULL,
	`event_kind` integer NOT NULL,
	PRIMARY KEY(`tag_name`, `tag_value`, `event_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_event_tags`("tag_name", "tag_value", "second_tag_value", "third_tag_value", "event_id", "user_id", "event_kind") SELECT "tag_name", "tag_value", "second_tag_value", "third_tag_value", "event_id", "user_id", "event_kind" FROM `event_tags`;--> statement-breakpoint
DROP TABLE `event_tags`;--> statement-breakpoint
ALTER TABLE `__new_event_tags` RENAME TO `event_tags`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_product_images` (
	`product_id` text,
	`auction_id` text,
	`image_url` text,
	`image_type` text DEFAULT 'gallery' NOT NULL,
	`image_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	PRIMARY KEY(`product_id`, `auction_id`, `image_url`),
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`auction_id`) REFERENCES `auctions`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_product_images`("product_id", "auction_id", "image_url", "image_type", "image_order", "created_at") SELECT "product_id", "auction_id", "image_url", "image_type", "image_order", "created_at" FROM `product_images`;--> statement-breakpoint
DROP TABLE `product_images`;--> statement-breakpoint
ALTER TABLE `__new_product_images` RENAME TO `product_images`;