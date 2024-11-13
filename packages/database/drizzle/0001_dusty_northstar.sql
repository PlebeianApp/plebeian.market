ALTER TABLE `products` ADD `banned` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `stalls` ADD `banned` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `banned` integer DEFAULT false NOT NULL;