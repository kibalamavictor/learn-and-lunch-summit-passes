CREATE TABLE `invitation_deliveries` (
	`pass_id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`status` text NOT NULL,
	`created` text NOT NULL,
	`updated` text NOT NULL,
	`provider_id` text,
	`error` text,
	`version` text NOT NULL,
	`staff` text NOT NULL
);
