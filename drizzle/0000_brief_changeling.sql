CREATE TABLE `partner_enquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationName` varchar(200) NOT NULL,
	`contactName` varchar(160) NOT NULL,
	`contactEmail` varchar(320) NOT NULL,
	`organizationType` varchar(80) NOT NULL,
	`intendedSupport` varchar(100) NOT NULL,
	`activationTiming` varchar(80) NOT NULL,
	`message` text,
	`status` enum('new','reviewing','closed') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `partner_enquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
