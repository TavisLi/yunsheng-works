CREATE TABLE `reader_identities` (
	`id` text PRIMARY KEY NOT NULL,
	`reader_account_id` text NOT NULL,
	`kind` text NOT NULL,
	`normalized_identifier` text NOT NULL,
	`verified` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`reader_account_id`) REFERENCES `reader_accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `reader_identities_kind_identifier_idx` ON `reader_identities` (`kind`,`normalized_identifier`);--> statement-breakpoint
CREATE INDEX `reader_identities_account_idx` ON `reader_identities` (`reader_account_id`);--> statement-breakpoint
CREATE TABLE `reader_password_credentials` (
	`reader_account_id` text PRIMARY KEY NOT NULL,
	`algorithm` text NOT NULL,
	`iterations` integer NOT NULL,
	`salt` text NOT NULL,
	`derived_key` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`reader_account_id`) REFERENCES `reader_accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `reader_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`reader_account_id` text NOT NULL,
	`token_hash` text NOT NULL,
	`expires_at` text NOT NULL,
	`revoked_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`reader_account_id`) REFERENCES `reader_accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `reader_sessions_token_idx` ON `reader_sessions` (`token_hash`);--> statement-breakpoint
CREATE INDEX `reader_sessions_account_idx` ON `reader_sessions` (`reader_account_id`);--> statement-breakpoint
DROP INDEX `reader_accounts_external_identity_idx`;--> statement-breakpoint
DROP INDEX `reader_accounts_email_idx`;--> statement-breakpoint
ALTER TABLE `reader_accounts` ADD `preferred_locale` text DEFAULT 'zh-Hant' NOT NULL;--> statement-breakpoint
ALTER TABLE `reader_accounts` ADD `region` text DEFAULT 'global' NOT NULL;--> statement-breakpoint
ALTER TABLE `reader_accounts` ADD `marketing_opt_in` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `reader_accounts` ADD `marketing_consent_at` text;--> statement-breakpoint
ALTER TABLE `reader_accounts` ADD `marketing_notice_version` text DEFAULT '2026-07-19' NOT NULL;--> statement-breakpoint
INSERT INTO `reader_identities` (`id`, `reader_account_id`, `kind`, `normalized_identifier`, `verified`)
SELECT 'legacy_' || lower(hex(randomblob(16))), `id`, 'chatgpt', `external_identity`, true
FROM `reader_accounts`;--> statement-breakpoint
UPDATE `reader_accounts`
SET `marketing_opt_in` = false, `marketing_consent_at` = NULL;--> statement-breakpoint
ALTER TABLE `reader_accounts` DROP COLUMN `external_identity`;--> statement-breakpoint
ALTER TABLE `reader_accounts` DROP COLUMN `normalized_email`;
