ALTER TABLE auctions ADD `extra_cost` numeric DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE product_meta ADD `key` text;--> statement-breakpoint
ALTER TABLE products ADD `extra_cost` numeric DEFAULT '0' NOT NULL;