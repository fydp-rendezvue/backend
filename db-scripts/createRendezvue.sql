CREATE USER IF NOT EXISTS 'newuser'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
GRANT ALL PRIVILEGES ON * . * TO 'newuser'@'localhost';
FLUSH PRIVILEGES;

DROP TABLE IF EXISTS Locations;
DROP TABLE IF EXISTS UserRoom;
DROP TABLE IF EXISTS Rooms;
DROP TABLE IF EXISTS Users;

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
	`altitude` FLOAT(32) NOT NULL,
	`markerMetadata` varchar(255) NOT NULL,
	`roomId` int(32) NOT NULL,
	PRIMARY KEY (`locationId`)
);

CREATE TABLE `UserRoom` (
	`roomId` int(32) NOT NULL,
	`userId` int(32) NOT NULL,
	PRIMARY KEY (`roomId`,`userId`)
);

CREATE TABLE `Rooms` (
	`roomId` int(32) NOT NULL AUTO_INCREMENT,
	`roomName` varchar(255),
	PRIMARY KEY (`roomId`)
);

ALTER TABLE `Locations` ADD CONSTRAINT `Locations_fk0` FOREIGN KEY (`userId`) REFERENCES `Users`(`userId`);

ALTER TABLE `Locations` ADD CONSTRAINT `Locations_fk1` FOREIGN KEY (`roomId`) REFERENCES `UserRoom`(`roomId`);

ALTER TABLE `UserRoom` ADD CONSTRAINT `UserRoom_fk0` FOREIGN KEY (`roomId`) REFERENCES `Rooms`(`roomId`);

ALTER TABLE `UserRoom` ADD CONSTRAINT `UserRoom_fk1` FOREIGN KEY (`userId`) REFERENCES `Users`(`userId`);

INSERT INTO `Users` (
  `userId`, `username`, `firstName`, `lastName`, `password`
) VALUES (
  1, 'fydp', 'rendezvue', 'RJTM', 'password'
);

INSERT INTO `Rooms` (
	`roomId`, `roomName`
) VALUES (
	1, '202 Lester'
), (
	2, 'UWP'
);

INSERT INTO `UserRoom` (
	`roomId`, `userId`
) VALUES (
	1, 1
), (
	2, 1
);

INSERT INTO `Locations` (
	`locationId`, `userId`, `longitude`, `latitude`, `altitude`, `markerMetadata`, `roomId`
) VALUES (
	1, 1, -80.53306633319255, 43.46973120592646, 318, 'end of lester st', 1
), (
	2, 1, -80.53305430430403, 43.46972609896514, 319, 'UWP', 2
);