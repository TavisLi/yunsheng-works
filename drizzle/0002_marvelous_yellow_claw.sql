CREATE TABLE `reader_auth_rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`attempts` integer DEFAULT 1 NOT NULL,
	`expires_at` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `reader_auth_rate_limits_expiry_idx` ON `reader_auth_rate_limits` (`expires_at`);--> statement-breakpoint
ALTER TABLE `reader_password_credentials` ADD `version` integer DEFAULT 1 NOT NULL;