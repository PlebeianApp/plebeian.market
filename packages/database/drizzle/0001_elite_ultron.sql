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
