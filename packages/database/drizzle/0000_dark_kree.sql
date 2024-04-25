CREATE TABLE `auctions` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`stall_id` text NOT NULL,
	`user_id` text NOT NULL,
	`auction_name` text NOT NULL,
	`description` text NOT NULL,
	`starting_bid_amount` integer NOT NULL,
	`start_date` integer DEFAULT (unixepoch()) NOT NULL,
	`end_date` integer NOT NULL,
	`currency` text NOT NULL,
	`specs` text,
	`shipping_cost` integer NOT NULL,
	`status` text NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`stall_id`) REFERENCES `stalls`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `bids` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`auction_id` text NOT NULL,
	`user_id` text NOT NULL,
	`bid_amount` integer NOT NULL,
	`bid_status` text NOT NULL,
	FOREIGN KEY (`auction_id`) REFERENCES `auctions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`cat_id` text PRIMARY KEY NOT NULL,
	`cat_name` text NOT NULL,
	`description` text NOT NULL,
	`parent_id` text,
	FOREIGN KEY (`parent_id`) REFERENCES `categories`(`cat_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `digital_products` (
	`product_id` text PRIMARY KEY NOT NULL,
	`license_key` text,
	`download_link` text,
	`mime_type` text,
	`sha256_hash` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`event_author` text NOT NULL,
	`event_kind` integer NOT NULL,
	`event` text NOT NULL,
	FOREIGN KEY (`event_author`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`invoice_id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`invoice_date` integer NOT NULL,
	`total_amount` integer NOT NULL,
	`invoice_status` text NOT NULL,
	`payment_method` text NOT NULL,
	`payment_details` text NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`order_id` text NOT NULL,
	`product_id` text NOT NULL,
	`qty` integer NOT NULL,
	PRIMARY KEY(`order_id`, `product_id`),
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`seller_user_id` text NOT NULL,
	`buyer_user_id` text NOT NULL,
	`status` text NOT NULL,
	`shipping_id` text NOT NULL,
	`stall_id` text NOT NULL,
	`address` text NOT NULL,
	`zip` text NOT NULL,
	`city` text NOT NULL,
	`region` text NOT NULL,
	`contact_name` text NOT NULL,
	`contact_phone` text,
	`contact_email` text,
	`observations` text,
	FOREIGN KEY (`seller_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`buyer_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`shipping_id`,`stall_id`) REFERENCES `shipping`(`shipping_id`,`stall_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `payment_details` (
	`payment_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`stall_id` text NOT NULL,
	`payment_method` text NOT NULL,
	`payment_details` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`stall_id`) REFERENCES `stalls`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `product_categories` (
	`product_id` text NOT NULL,
	`cat_id` text NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`cat_id`) REFERENCES `categories`(`cat_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `product_images` (
	`product_id` text PRIMARY KEY NOT NULL,
	`image_url` text NOT NULL,
	`image_type` text NOT NULL,
	`image_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`stall_id` text NOT NULL,
	`user_id` text NOT NULL,
	`product_name` text NOT NULL,
	`description` text NOT NULL,
	`price` integer NOT NULL,
	`product_type` text NOT NULL,
	`currency` text NOT NULL,
	`stock_qty` integer NOT NULL,
	`specs` text,
	`shipping_cost` integer,
	`featured` integer DEFAULT false NOT NULL,
	`is_digital` integer DEFAULT false NOT NULL,
	`parent_id` text,
	FOREIGN KEY (`stall_id`) REFERENCES `stalls`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`parent_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `shipping` (
	`stall_id` text NOT NULL,
	`shipping_id` text NOT NULL,
	`name` text NOT NULL,
	`shipping_method` text NOT NULL,
	`shipping_details` text NOT NULL,
	`base_cost` numeric NOT NULL,
	`default` integer NOT NULL,
	PRIMARY KEY(`shipping_id`, `stall_id`),
	FOREIGN KEY (`stall_id`) REFERENCES `stalls`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `shipping_zones` (
	`shipping_id` text NOT NULL,
	`stall_id` text NOT NULL,
	`shipping_zone_id` text PRIMARY KEY NOT NULL,
	`region_code` text NOT NULL,
	`country_code` text NOT NULL,
	FOREIGN KEY (`shipping_id`,`stall_id`) REFERENCES `shipping`(`shipping_id`,`stall_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `stalls` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`currency` text NOT NULL,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`display_name` text NOT NULL,
	`about` text NOT NULL,
	`image` text,
	`banner` text,
	`nip05` text,
	`lud06` text,
	`lud16` text,
	`website` text,
	`zap_Service` text,
	`last_login` integer DEFAULT (unixepoch()) NOT NULL
);
