CREATE TABLE `auctions` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	`stall_id` text NOT NULL,
	`user_id` text NOT NULL,
	`auction_name` text NOT NULL,
	`description` text NOT NULL,
	`starting_bid_amount` integer NOT NULL,
	`start_date` integer NOT NULL,
	`end_date` integer NOT NULL,
	`images` text,
	`currency` text NOT NULL,
	`specs` text,
	`shipping_cost` integer,
	`status` text NOT NULL,
	`featured` integer NOT NULL,
	FOREIGN KEY (`stall_id`) REFERENCES `stalls`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `bids` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	`auction_id` text NOT NULL,
	`user_id` text NOT NULL,
	`bid_amount` integer NOT NULL,
	`bid_status` text NOT NULL,
	FOREIGN KEY (`auction_id`) REFERENCES `auctions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`cat_id` integer PRIMARY KEY NOT NULL,
	`cat_name` text NOT NULL,
	`description` text NOT NULL,
	`parent_id` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	`event_author` text NOT NULL,
	`event_kind` integer NOT NULL,
	`event` text NOT NULL,
	FOREIGN KEY (`event_author`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`invoice_id` integer PRIMARY KEY NOT NULL,
	`order_id` integer NOT NULL,
	`invoice_date` integer NOT NULL,
	`total_amount` integer NOT NULL,
	`invoice_status` text NOT NULL,
	`payment_method` text NOT NULL,
	`payment_details` text NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`order_id` integer NOT NULL,
	`product_id` integer PRIMARY KEY NOT NULL,
	`qty` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	`seller_user_id` integer NOT NULL,
	`buyer_user_id` integer NOT NULL,
	`status` text NOT NULL,
	`shipping_id` text,
	`address` text NOT NULL,
	`zip` text NOT NULL,
	`city` text NOT NULL,
	`region` text NOT NULL,
	`contact_name` text NOT NULL,
	`contact_phone` text NOT NULL,
	`contact_email` text NOT NULL,
	`observations` text,
	FOREIGN KEY (`seller_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`buyer_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`shipping_id`) REFERENCES `shipping`(`shipping_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `payment_details` (
	`payment_id` integer PRIMARY KEY NOT NULL,
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
	`cat_id` integer NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`cat_id`) REFERENCES `categories`(`cat_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	`stall_id` text NOT NULL,
	`user_id` text NOT NULL,
	`product_name` text NOT NULL,
	`description` text NOT NULL,
	`price` integer NOT NULL,
	`product_type` text NOT NULL,
	`images` text,
	`currency` text NOT NULL,
	`stock_qty` integer NOT NULL,
	`specs` text,
	`shipping_cost` integer,
	`featured` integer NOT NULL,
	`parent_id` text NOT NULL,
	FOREIGN KEY (`stall_id`) REFERENCES `stalls`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `shipping` (
	`stall_id` text NOT NULL,
	`shipping_id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`shipping_method` text NOT NULL,
	`shipping_details` text NOT NULL,
	`base_cost` integer NOT NULL,
	`default` integer NOT NULL,
	FOREIGN KEY (`stall_id`) REFERENCES `stalls`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `shipping_zones` (
	`shipping_id` text NOT NULL,
	`shipping_zone_id` text PRIMARY KEY NOT NULL,
	`region_code` text NOT NULL,
	`country_code` text NOT NULL,
	FOREIGN KEY (`shipping_id`) REFERENCES `shipping`(`shipping_id`) ON UPDATE no action ON DELETE no action
);
