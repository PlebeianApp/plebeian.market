CREATE TABLE `app_meta` (
	`id` text PRIMARY KEY NOT NULL,
	`app_id` text,
	`meta_name` text NOT NULL,
	`key` text,
	`value_text` text,
	`value_boolean` integer,
	`value_integer` numeric,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`app_id`) REFERENCES `app_settings`(`instance_pk`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`meta_name`) REFERENCES `meta_types`(`name`) ON UPDATE cascade ON DELETE cascade
);
