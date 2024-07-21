CREATE TABLE `product_shipping` (
	`product_id` text,
	`shipping_id` text NOT NULL,
	`extra_cost` numeric NOT NULL,
	PRIMARY KEY(`product_id`, `shipping_id`),
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`shipping_id`) REFERENCES `shipping`(`id`) ON UPDATE no action ON DELETE cascade
);
