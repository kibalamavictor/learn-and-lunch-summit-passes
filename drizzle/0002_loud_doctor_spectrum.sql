CREATE TABLE `mail_outbox` (
	`id` text PRIMARY KEY NOT NULL,
	`pass_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created` text NOT NULL,
	`sent` text,
	`attempts` integer DEFAULT 0 NOT NULL,
	`error` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `mail_outbox_pass_id_unique` ON `mail_outbox` (`pass_id`);--> statement-breakpoint
ALTER TABLE `passes` ADD `lunch_token` text;--> statement-breakpoint
ALTER TABLE `passes` ADD `lunch_code` text;--> statement-breakpoint
CREATE UNIQUE INDEX `passes_lunch_token_unique` ON `passes` (`lunch_token`);--> statement-breakpoint
CREATE UNIQUE INDEX `passes_lunch_code_unique` ON `passes` (`lunch_code`);