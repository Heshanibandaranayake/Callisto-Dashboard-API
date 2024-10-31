/*
/*
SQLyog Community v13.1.5  (64 bit)
MySQL - 8.0.19 : Database - modem_manager
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`modem_manager` /*!40100 DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

/*Table structure for table `activity_logs` */

use modem_manager;

DROP TABLE IF EXISTS `activity_logs`;

CREATE TABLE `activity_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user` int DEFAULT NULL,
  `tab` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `prop` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `val` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `login_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `FK_ALOGS_USER_ID` (`user`),
  CONSTRAINT `FK_ALOGS_USER_ID` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

/*Data for the table `activity_logs` */


/*Table structure for table `login_logs` */

DROP TABLE IF EXISTS `login_logs`;

CREATE TABLE `login_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user` int DEFAULT NULL,
  `login_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `FK_LLOGS_USER_ID` (`user`),
  CONSTRAINT `FK_LLOGS_USER_ID` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

/*Data for the table `login_logs` */

/*Table structure for table `users` */

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) CHARACTER SET utf8mb4 NOT NULL,
  `fullname` varchar(100) CHARACTER SET utf8mb4 NOT NULL,
  `password` text CHARACTER SET utf8mb4 NOT NULL,
  `token` text CHARACTER SET utf8mb4,
  `role` varchar(50) CHARACTER SET utf8mb4 NOT NULL,
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4;

/*Data for the table `users` */

insert  into `users`(`id`,`username`,`fullname`,`password`,`token`,`role`,`last_updated`) values 
(24,'admin','Admin','$2b$10$/XGL3jD9XKu.n7Sf6Hhtt.hZ1w80lDBHB3pnoq8j8FDtLzwkJ98bK','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjI0LCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE2NTQ3NjAwMTYsImV4cCI6MjM3NDc2MDAxNn0.BA9QKBc36u1tgtC-nD-IGEJc2cMVAWBUWezeCKGAKgM','Admin','2022-06-09 13:03:36'),
(25,'user','User','$2b$10$NQqSOY3UVZqpiqlmQPy6luAuTj9uCU4Hzgl0TGXB81TxkqIafRMui','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjI1LCJyb2xlIjoiVXNlciIsImlhdCI6MTY1NDc1OTI1MywiZXhwIjoyMzc0NzU5MjUzfQ.ml_Wvox_gBMl_Waj8F4E4D_0kctCjtU-ks2SfWJVlb8','User','2022-06-09 12:50:53');

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

CREATE TABLE `alarm_logs` (  `id` int(11) NOT NULL AUTO_INCREMENT,  `alarm_type` varchar(255) DEFAULT NULL,  `date_time` timestamp NULL DEFAULT current_timestamp(),  PRIMARY KEY (`id`)) ENGINE=InnoDB AUTO_INCREMENT=464 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE users
ADD failedAttempts INT DEFAULT 0,
ADD locked BOOLEAN DEFAULT FALSE;

INSERT INTO modem_manager.users
(id, username, fullname, password, token, `role`, last_updated, failedAttempts, locked)
VALUES(37, 'SuperAdmin', 'SuperAdmin', '$2b$10$7EgJzH/Q9EzyAOPMm/HTduM/SSaG/Qfvwi2wZV/klz9GiijQIsJbS', 
'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjM3LCJyb2xlIjoic3VwZXJhZG1pbiIsImlhdCI6MTcxMTYxMDA4NCwiZXhwIjoxNzE4ODEwMDg0fQ.kawLp8GwRW1tfG3y6yzyQtlBosbfms1LCwuCyTlnKG0', 
'superadmin', '2024-03-28 12:44:44.000', 0, 0);