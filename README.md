# Wizundry: A Cooperative Wizard of Oz Platform for Simulating Future Speech-based Interfaces with Multiple Wizards
### Authors
- Siying Hu Department of Computer Science, City University of Hong Kong, Hong Kong, China
- Hen Chen Yen Computer Science, City University of Hong Kong, Kowloon Tong, Hong Kong
- Mingjian ZHAO School of Computer Science, City University of Hong Kong, Hong Kong, China
- Ziwei Yu School of Design, Hunan University, Changsha, Hunan, China
- Dr Katie Seaborn Department of Industrial Engineering and Economics, Tokyo Institute of Technology, Tokyo, Japan
- Dr Can Liu School of Creative Media, City University of Hong Kong, Hong Kong, China


### Abstract
Wizard of Oz (WoZ) as a prototyping method has been used to simulate intelligent user interfaces, particularly for speech-based systems. However, as our societies' expectations on artificial intelligence (AI) grows, the question remains whether a single Wizard is sufficient for it to simulate smarter systems and more complex interactions. Optimistic visions of 'what artificial intelligence (AI) can do' places demands on WoZ platforms to simulate smarter systems and more complex interactions. This raises the question of whether the typical approach of employing a single Wizard is sufficient. Moreover, while existing work has employed multiple Wizards in WoZ studies, a Multi-Wizard approach has not been systematically studied in terms of feasibility, effectiveness, and challenges. We offer Wizundry, a real-time, web-based WoZ platform that allows multiple Wizards to collaboratively operate a speech-to-text based system remotely. We outline the design and technical specifications of our open-source platform, which we iterated over two design phases. We report on two studies in which participant-Wizards were tasked with negotiating how to cooperatively simulate an interface that can handle natural speech for dictation and text editing as well as other intelligent text processing tasks. We offer qualitative findings on the Multi-Wizard experience for Dyads and Triads of Wizards. Our findings reveal the promises and challenges of the Multi-Wizard approach and open up new research questions.


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
* **Firesbase**: place your firebase config file (JSON) to `server/config/firebase.js`

## Structure
* **Server** (expressJS) => serve at localhost:3000
* **Client** (vueJS) => serve at localhost:8080 or can be built for server used
* **Database** (mySQL:8)
    * Make sure the server is running
    * Check the Root User with password: `mysql -uroot -p`
    * Create a database called `wizard_of_oz`: `create database wizard_of_oz;`
    * Change the `.env` with your mySQL settings
* **Google Cloud Speech Recognition**
  * Go to Google Cloud Platform
  * Enabled Cloud Speech Recognition API
  * Download Private Key as JSON
  * Change the `.env`, `GOOGLE_APPLICATION_CREDENTIALS` to the JSON file location
* **Firebase**
  * [Follow this Firebase Tutorial](https://firebase.google.com/docs/web/setup#with-npm_1)
  * Add the credentials to `.env` with the keyName as `.env.example`
  * OR, adding the credential JSON file to the root folder and specify it in the `server/config/firebase.js`


## Install dependencies
1. `cd server && yarn`
2. `cd platform && npm install`

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


## Run the Code
Before running the code, make sure:
1. MYSQL database is running and initialized
2. Firebase and Google Cloud credential file has been specified in `.env` or config folder
3. All the dependencies has been installed by `yarn` or `npm`

To run the code:
1. go to the server folder, `yarn local:dev`
2. go to the platform folder, `npm run serve`
