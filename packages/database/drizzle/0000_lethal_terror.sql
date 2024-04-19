CREATE TABLE `stalls` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`currency` text NOT NULL,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer,
	`updated_at` integer,
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
	`last_login` integer
);
