CREATE TABLE `community_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileKey` varchar(64) NOT NULL,
	`canonicalName` varchar(160) NOT NULL,
	`email` varchar(320),
	`phone` varchar(48),
	`ventureName` varchar(200) NOT NULL DEFAULT '',
	`sector` varchar(120) NOT NULL DEFAULT '',
	`stage` varchar(120) NOT NULL DEFAULT '',
	`location` varchar(160) NOT NULL DEFAULT '',
	`directoryListed` boolean NOT NULL DEFAULT false,
	`sources` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `community_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `community_profiles_profileKey_unique` UNIQUE(`profileKey`)
);
