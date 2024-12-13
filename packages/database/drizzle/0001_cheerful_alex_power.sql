PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_payment_details` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`stall_id` text,
	`payment_method` text NOT NULL,
	`payment_details` text NOT NULL,
	`default` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`stall_id`) REFERENCES `stalls`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_payment_details`("id", "user_id", "stall_id", "payment_method", "payment_details", "default") SELECT "id", "user_id", "stall_id", "payment_method", "payment_details", "default" FROM `payment_details`;--> statement-breakpoint
DROP TABLE `payment_details`;--> statement-breakpoint
ALTER TABLE `__new_payment_details` RENAME TO `payment_details`;--> statement-breakpoint
PRAGMA foreign_keys=ON;