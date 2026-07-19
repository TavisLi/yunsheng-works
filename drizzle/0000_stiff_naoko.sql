CREATE TABLE `purchase_entitlements` (
	`reader_account_id` text NOT NULL,
	`work_id` text NOT NULL,
	`work_slug` text NOT NULL,
	`status` text NOT NULL,
	`purchase_record_id` text,
	`granted_at` text NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`reader_account_id`, `work_id`),
	FOREIGN KEY (`reader_account_id`) REFERENCES `reader_accounts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`purchase_record_id`) REFERENCES `purchase_records`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `purchase_entitlements_account_idx` ON `purchase_entitlements` (`reader_account_id`);--> statement-breakpoint
CREATE TABLE `purchase_records` (
	`id` text PRIMARY KEY NOT NULL,
	`reader_account_id` text NOT NULL,
	`work_id` text NOT NULL,
	`work_slug` text NOT NULL,
	`source` text NOT NULL,
	`external_order_id` text NOT NULL,
	`status` text NOT NULL,
	`purchased_at` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`reader_account_id`) REFERENCES `reader_accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `purchase_records_account_idx` ON `purchase_records` (`reader_account_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `purchase_records_source_order_idx` ON `purchase_records` (`source`,`external_order_id`);--> statement-breakpoint
CREATE TABLE `reader_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`external_identity` text NOT NULL,
	`normalized_email` text NOT NULL,
	`display_name` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `reader_accounts_external_identity_idx` ON `reader_accounts` (`external_identity`);--> statement-breakpoint
CREATE UNIQUE INDEX `reader_accounts_email_idx` ON `reader_accounts` (`normalized_email`);--> statement-breakpoint
CREATE TABLE `reader_states` (
	`reader_account_id` text NOT NULL,
	`work_id` text NOT NULL,
	`work_slug` text NOT NULL,
	`chapter_id` text NOT NULL,
	`chapter_slug` text NOT NULL,
	`anchor` text,
	`progress` integer NOT NULL,
	`font_size` text NOT NULL,
	`theme` text NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`reader_account_id`, `work_id`),
	FOREIGN KEY (`reader_account_id`) REFERENCES `reader_accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `reader_states_account_idx` ON `reader_states` (`reader_account_id`);