/***CREATING ALL TABLES*/
CREATE TABLE `user_info` (
	`id` BIGINT(20) NOT NULL AUTO_INCREMENT,
	`uid` VARCHAR(64) NOT NULL DEFAULT '' COLLATE 'latin1_swedish_ci',
	`password` VARCHAR(64) NOT NULL DEFAULT '' COLLATE 'latin1_swedish_ci',
	`username` VARCHAR(64) NOT NULL COLLATE 'latin1_swedish_ci',
	`roles` VARCHAR(64) NOT NULL COLLATE 'latin1_swedish_ci',
	`token` VARCHAR(128) NULL COLLATE 'latin1_swedish_ci',
	`createdAt` BIGINT(20) NOT NULL,
	PRIMARY KEY (`id`) USING BTREE
)
ENGINE=InnoDB;

CREATE TABLE `multi_doc_logs` (
	`id` BIGINT(20) NOT NULL AUTO_INCREMENT,
	`username` VARCHAR(64) NOT NULL COLLATE 'latin1_swedish_ci',
	`timestamp` TIMESTAMP NULL,
	`type` VARCHAR(32) NULL COLLATE 'latin1_swedish_ci',
	`value` TEXT NULL COLLATE 'latin1_swedish_ci',
	`status` TINYINT(2) NULL,
	PRIMARY KEY (`id`) USING BTREE
)
ENGINE=InnoDB;
