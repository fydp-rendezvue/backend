CREATE TABLE `Users` (
	`userId` int(32) NOT NULL AUTO_INCREMENT,
	`username` varchar(255) NOT NULL UNIQUE,
	`firstName` varchar(255) NOT NULL,
	`lastName` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	PRIMARY KEY (`userId`)
);

CREATE TABLE `Locations` (
	`locationId` int(32) NOT NULL AUTO_INCREMENT,
	`userId` int(32) NOT NULL,
	`longitude` FLOAT(32) NOT NULL,
	`latitude` FLOAT(32) NOT NULL,
	`markerMetadata` blob(64) NOT NULL,
	`roomId` int(32) NOT NULL,
	PRIMARY KEY (`locationId`)
);

CREATE TABLE `Rooms` (
	`roomId` int(32) NOT NULL AUTO_INCREMENT,
	`userId` int(32) NOT NULL,
	PRIMARY KEY (`roomId`,`userId`)
);

ALTER TABLE `Locations` ADD CONSTRAINT `Locations_fk0` FOREIGN KEY (`userId`) REFERENCES `Users`(`userId`);

ALTER TABLE `Locations` ADD CONSTRAINT `Locations_fk1` FOREIGN KEY (`roomId`) REFERENCES `Rooms`(`roomId`);

ALTER TABLE `Rooms` ADD CONSTRAINT `Rooms_fk0` FOREIGN KEY (`userId`) REFERENCES `Users`(`userId`);
