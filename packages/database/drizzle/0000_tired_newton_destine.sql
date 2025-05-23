CREATE TABLE `app_settings` (
	`instance_pk` text PRIMARY KEY NOT NULL,
	`instance_sk` text NOT NULL,
	`is_first_time_running` integer DEFAULT true NOT NULL,
	`instance_name` text DEFAULT 'Plebeian Market' NOT NULL,
	`logo_url` text DEFAULT '/logo.svg' NOT NULL,
	`contact_email` text,
	`owner_pk` text,
	`allow_register` integer DEFAULT true NOT NULL,
	`default_currency` text DEFAULT 'BTC' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `app_meta` (
	`id` text PRIMARY KEY NOT NULL,
	`app_id` text,
	`meta_name` text NOT NULL,
	`key` text,
	`value_text` text,
	`value_boolean` integer,
	`value_number` numeric,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`app_id`) REFERENCES `app_settings`(`instance_pk`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`meta_name`) REFERENCES `meta_types`(`name`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `auctions` (
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
	`starting_bid_amount` numeric NOT NULL,
	`status` text NOT NULL,
	`start_date` integer DEFAULT (unixepoch()),
	`end_date` integer,
	FOREIGN KEY (`stall_id`) REFERENCES `stalls`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `bids` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`auction_id` text NOT NULL,
	`user_id` text NOT NULL,
	`bid_amount` numeric NOT NULL,
	`bid_status` text DEFAULT 'pending' NOT NULL,
	FOREIGN KEY (`auction_id`) REFERENCES `auctions`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `event_tags` (
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
CREATE TABLE `invoices` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`order_id` text NOT NULL,
	`total_amount` numeric NOT NULL,
	`type` text NOT NULL,
	`invoice_status` text DEFAULT 'pending' NOT NULL,
	`observations` text,
	`payment_details_id` text NOT NULL,
	`payment_request` text,
	`proof` text,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `meta_types` (
	`name` text PRIMARY KEY NOT NULL,
	`description` text,
	`scope` text NOT NULL,
	`data_type` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`order_id` text NOT NULL,
	`product_id` text NOT NULL,
	`qty` integer NOT NULL,
	PRIMARY KEY(`order_id`, `product_id`),
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`seller_user_id` text NOT NULL,
	`buyer_user_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`shipping_id` text,
	`stall_id` text NOT NULL,
	`address` text NOT NULL,
	`zip` text NOT NULL,
	`city` text NOT NULL,
	`country` text NOT NULL,
	`region` text,
	`contact_name` text NOT NULL,
	`contact_phone` text,
	`contact_email` text,
	`additionalInfo` text,
	FOREIGN KEY (`seller_user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`shipping_id`) REFERENCES `shipping`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`stall_id`) REFERENCES `stalls`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `payment_details` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`stall_id` text,
	`payment_method` text NOT NULL,
	`payment_details` text NOT NULL,
	`default` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`stall_id`) REFERENCES `stalls`(`id`) ON UPDATE cascade ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `product_images` (
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
CREATE TABLE `product_meta` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text,
	`auction_id` text,
	`meta_name` text NOT NULL,
	`key` text,
	`value_text` text,
	`value_boolean` integer,
	`value_number` numeric,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`auction_id`) REFERENCES `auctions`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`meta_name`) REFERENCES `meta_types`(`name`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `product_shipping` (
	`product_id` text,
	`shipping_id` text NOT NULL,
	`extra_cost` numeric NOT NULL,
	PRIMARY KEY(`product_id`, `shipping_id`),
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`shipping_id`) REFERENCES `shipping`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `products` (
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
	FOREIGN KEY (`parent_id`) REFERENCES `products`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`stall_id`,`currency`) REFERENCES `stalls`(`id`,`currency`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `shipping` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`stall_id` text,
	`user_id` text NOT NULL,
	`name` text,
	`base_cost` numeric NOT NULL,
	`default` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`stall_id`) REFERENCES `stalls`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `shipping_zones` (
	`id` text PRIMARY KEY NOT NULL,
	`shipping_id` text NOT NULL,
	`shipping_user_id` text NOT NULL,
	`stall_id` text,
	`region_code` text,
	`country_code` text,
	FOREIGN KEY (`shipping_id`) REFERENCES `shipping`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`stall_id`) REFERENCES `stalls`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `shipping_zones_shipping_id_region_code_country_code_unique` ON `shipping_zones` (`shipping_id`,`region_code`,`country_code`);--> statement-breakpoint
CREATE TABLE `stall_meta` (
	`id` text PRIMARY KEY NOT NULL,
	`stall_id` text,
	`meta_name` text NOT NULL,
	`key` text,
	`value_text` text,
	`value_boolean` integer,
	`value_number` numeric,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`stall_id`) REFERENCES `stalls`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`meta_name`) REFERENCES `meta_types`(`name`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `stalls` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`banned` integer DEFAULT false NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`identifier` text NOT NULL,
	`currency` text NOT NULL,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `stalls_id_currency_unique` ON `stalls` (`id`,`currency`);--> statement-breakpoint
CREATE TABLE `user_meta` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`meta_name` text NOT NULL,
	`key` text,
	`value_text` text,
	`value_boolean` integer,
	`value_number` numeric,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`meta_name`) REFERENCES `meta_types`(`name`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`banned` integer DEFAULT false NOT NULL,
	`name` text,
	`display_name` text,
	`about` text,
	`image` text,
	`banner` text,
	`nip05` text,
	`lud06` text,
	`lud16` text,
	`website` text,
	`zap_Service` text,
	`last_login` integer
);
