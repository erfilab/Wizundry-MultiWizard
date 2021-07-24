# Wizard Of Oz
<p>
  <a href="https://circleci.com/gh/vuejs/vue/tree/dev"><img src="https://img.shields.io/circleci/project/github/vuejs/vue/dev.svg?sanitize=true" alt="Build Status"></a>
  <a href="https://www.npmjs.com/package/vue"><img src="https://img.shields.io/npm/l/vue.svg?sanitize=true" alt="License"></a>
</p>

---

## Info
> This is the platform tailored for the wizard of oz experiment, which can support Multi-Wizard/ Socket Chat and so on  
## Tech
1. VueJs
2. Express (NodeJs)
3. MySQL
4. Google Cloud Speech Recognition
5. Socket.io
6. TipTap Editor
7. YJS Socket Real-Time Collaborative Editor
8. Firebase Authentication
## Environment
* **MYSQL**: please check that your mysql server is available
* **yarn**: package manager, by `npm install -g yarn`

## Structure
* **Server** (expressJS) => serve at localhost:3000
* **Client** (vueJS) => serve at localhost:8080 or can be built for server used
* **Database** (mySQL:8)
    * Make sure the server is running
    * Check the Root User with password: `mysql -uroot -p`
    * Create a database called `wizard_of_oz`: `create database wizard_of_oz`
    * Change the `.env` with your mySQL settings
* **Google Cloud Speech Recognition**
  * Go to Google Cloud Platform
  * Enabled Cloud Speech Recognition API
  * Download Private Key as JSON
  * Change the `.env`, `GOOGLE_APPLICATION_CREDENTIALS` to the JSON file location
* **Firebase**
  * [Follow this Firebase Tutorial](https://firebase.google.com/docs/web/setup#with-npm_1)
  * Add the credentials to `.env` with the keyName as `.env.example` 

## Initialize DB
### Logs Tables
```mysql-sql
CREATE TABLE `anchor_log` (
	`id` BIGINT(20) NOT NULL AUTO_INCREMENT,
	`projectId` INT(12) NOT NULL,
	`clientX` INT(10) NOT NULL,
	`clientY` INT(10) NOT NULL,
	`innerHTML` TEXT NULL COLLATE 'latin1_swedish_ci',
	`anchor` INT(10) NOT NULL,
	`timestamp` BIGINT(20) NOT NULL,
	PRIMARY KEY (`id`) USING BTREE
)
COLLATE='latin1_swedish_ci'
ENGINE=InnoDB;
```
```mysql-sql
CREATE TABLE `behavior_log` (
	`id` BIGINT(20) NOT NULL AUTO_INCREMENT,
	`projectId` INT(12) NOT NULL,
	`status` TINYINT(2) NOT NULL DEFAULT '0',
	`type` VARCHAR(32) NOT NULL COLLATE 'latin1_swedish_ci',
	`timestamp` BIGINT(20) NOT NULL,
	PRIMARY KEY (`id`) USING BTREE
)
COLLATE='latin1_swedish_ci'
ENGINE=InnoDB;
```
```mysql-sql
CREATE TABLE `text_data` (
	`id` BIGINT(20) NOT NULL AUTO_INCREMENT,
	`type` VARCHAR(32) NOT NULL COLLATE 'latin1_swedish_ci',
	`lastContent` TEXT NULL COLLATE 'latin1_swedish_ci',
	`newContent` TEXT NULL COLLATE 'latin1_swedish_ci',
	`projectId` INT(10) NOT NULL,
	`projectName` VARCHAR(64) NOT NULL COLLATE 'latin1_swedish_ci',
	`username` VARCHAR(64) NOT NULL COLLATE 'latin1_swedish_ci',
	`userRole` VARCHAR(32) NOT NULL COLLATE 'latin1_swedish_ci',
	`timestamp` BIGINT(20) NOT NULL,
	PRIMARY KEY (`id`) USING BTREE
)
COLLATE='latin1_swedish_ci'
ENGINE=InnoDB;
```
### Basic Info
```mysql-sql
CREATE TABLE `project_info` (
	`id` BIGINT(20) NOT NULL AUTO_INCREMENT,
	`project_name` VARCHAR(64) NOT NULL COLLATE 'latin1_swedish_ci',
	`creator` VARCHAR(64) NOT NULL COLLATE 'latin1_swedish_ci',
	`participant` VARCHAR(64) NOT NULL COLLATE 'latin1_swedish_ci',
	`createdAt` BIGINT(20) NOT NULL,
	PRIMARY KEY (`id`) USING BTREE
)
COLLATE='latin1_swedish_ci'
ENGINE=InnoDB;
```
```mysql-sql
CREATE TABLE `user_info` (
	`id` BIGINT(20) NOT NULL AUTO_INCREMENT,
	`uid` VARCHAR(64) NOT NULL DEFAULT '' COLLATE 'latin1_swedish_ci',
	`email` VARCHAR(64) NOT NULL COLLATE 'latin1_swedish_ci',
	`password` VARCHAR(64) NOT NULL DEFAULT '' COLLATE 'latin1_swedish_ci',
	`username` VARCHAR(64) NOT NULL COLLATE 'latin1_swedish_ci',
	`role` VARCHAR(32) NOT NULL COLLATE 'latin1_swedish_ci',
	`createdAt` BIGINT(20) NOT NULL,
	PRIMARY KEY (`id`) USING BTREE
)
COLLATE='latin1_swedish_ci'
ENGINE=InnoDB;
```
