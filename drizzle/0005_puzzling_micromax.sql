CREATE TABLE `scheduled_mail_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`scheduled_at` text NOT NULL,
	`status` text NOT NULL,
	`recipient_ids` text NOT NULL,
	`recipient_count` integer NOT NULL,
	`created` text NOT NULL,
	`started` text,
	`finished` text,
	`provider_id` text,
	`error` text
);
