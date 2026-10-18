CREATE TABLE `event_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `passes` ADD `university` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `passes` ADD `registered` text;--> statement-breakpoint
ALTER TABLE `passes` ADD `contact_issue` integer DEFAULT 0 NOT NULL;