CREATE TABLE `directory_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`publicFounderCount` int NOT NULL,
	`ventureProfiles` int NOT NULL,
	`sectorsRepresented` int NOT NULL,
	`locationsRepresented` int NOT NULL,
	`sourceRowCount` int NOT NULL,
	`uniqueCommunityRecords` int NOT NULL,
	`duplicateRecordsCollapsed` int NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `directory_metrics_id` PRIMARY KEY(`id`)
);
