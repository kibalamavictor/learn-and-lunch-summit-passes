CREATE TABLE `passes` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`token` text NOT NULL,
	`code` text NOT NULL,
	`demo` integer DEFAULT 0 NOT NULL,
	`created` text NOT NULL,
	`checked_in` text,
	`redeemed` text,
	`redeemed_by` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `passes_token_unique` ON `passes` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `passes_code_unique` ON `passes` (`code`);--> statement-breakpoint
CREATE UNIQUE INDEX `owner_email` ON `passes` (`owner`,`email`);