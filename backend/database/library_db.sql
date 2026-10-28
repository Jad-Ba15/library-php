-- LibraryPro database: tables, demo data and the overdue_loans view.
-- Import in phpMyAdmin or: mysql -u root < library_db.sql
CREATE DATABASE IF NOT EXISTS `library_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `library_db`;

/*M!999999\- enable the sandbox mode */ 

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES
(2,'Novel','Fiction and stories'),
(3,'History','History of people and places'),
(4,'Science','Physics, biology, space and more'),
(5,'Self-help','Personal growth and productivity'),
(6,'jad','mmm');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `books`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `books` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `author` varchar(150) NOT NULL,
  `isbn` varchar(20) DEFAULT NULL,
  `year` int(11) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `total_copies` int(11) NOT NULL DEFAULT 1,
  `available_copies` int(11) NOT NULL DEFAULT 1,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `isbn` (`isbn`),
  KEY `fk_books_category` (`category_id`),
  CONSTRAINT `fk_books_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `chk_copies` CHECK (`available_copies` >= 0 and `available_copies` <= `total_copies`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `books` WRITE;
/*!40000 ALTER TABLE `books` DISABLE KEYS */;
INSERT INTO `books` VALUES
(1,'Learning PHP','David Sklar','9781491933572',2016,NULL,3,2,NULL,'2026-10-28 08:51:52','2026-10-28 08:51:52'),
(2,'Clean Code','Robert C. Martin','9780132350884',2008,NULL,2,1,NULL,'2026-10-28 08:51:52','2026-10-28 08:51:52'),
(3,'JavaScript: The Good Parts','Douglas Crockford','9780596517748',2008,NULL,2,2,NULL,'2026-10-28 08:51:52','2026-10-28 08:51:52'),
(4,'The Little Prince','Antoine de Saint-Exupery','9780156012195',1943,2,4,3,NULL,'2026-10-28 08:51:52','2026-10-28 08:51:52'),
(5,'1984','George Orwell','9780451524935',1934,NULL,3,2,NULL,'2026-10-28 08:51:52','2026-10-28 11:34:40'),
(6,'Sapiens','Yuval Noah Harari','9780062316097',2011,3,2,2,NULL,'2026-10-28 08:51:52','2026-10-28 08:51:52'),
(7,'Guns, Germs, and Steel','Jared Diamond','9780393317558',1997,3,1,1,NULL,'2026-10-28 08:51:52','2026-10-28 08:51:52'),
(8,'A Brief History of Time','Stephen Hawking','9780553380163',1988,4,2,1,NULL,'2026-10-28 08:51:52','2026-10-28 08:51:52'),
(9,'Cosmos','Carl Sagan','9780345539434',1980,4,1,1,NULL,'2026-10-28 08:51:52','2026-10-28 08:51:52'),
(10,'Atomic Habits','James Clear','9780735211292',2018,5,3,3,NULL,'2026-10-28 08:51:52','2026-10-28 08:51:52');
/*!40000 ALTER TABLE `books` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `members` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `status` enum('active','blocked') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `members` WRITE;
/*!40000 ALTER TABLE `members` DISABLE KEYS */;
INSERT INTO `members` VALUES
(1,'Ali Hassan','ali@example.com','70111222','Beirut','active','2026-10-28 08:51:52'),
(2,'Sara Khoury','sara@example.com','71333444','Tripoli','active','2026-10-28 08:51:52'),
(3,'Omar Haddad','omar@example.com','76555666','Saida','active','2026-10-28 08:51:52'),
(4,'Lina Saleh','lina@example.com','03777888','Jounieh','active','2026-10-28 08:51:52'),
(5,'Karim Nassar','karim@example.com','81999000','Zahle','blocked','2026-10-28 08:51:52');
/*!40000 ALTER TABLE `members` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin','librarian') NOT NULL DEFAULT 'librarian',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(1,'Admin','admin@library.com','$2y$10$g7ADmzKEGMzgmC9RNGZQQ.ReoWbwqT.oT8M.IHoH6sPDwpNqxQ8Wu','admin','2026-10-28 08:51:52'),
(2,'Librarian','librarian@library.com','$2y$10$g7ADmzKEGMzgmC9RNGZQQ.ReoWbwqT.oT8M.IHoH6sPDwpNqxQ8Wu','librarian','2026-10-28 08:51:52');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `loans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `loans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `book_id` int(11) NOT NULL,
  `member_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `loan_date` date NOT NULL,
  `due_date` date NOT NULL,
  `return_date` date DEFAULT NULL,
  `fine` decimal(8,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`),
  KEY `fk_loans_book` (`book_id`),
  KEY `fk_loans_member` (`member_id`),
  KEY `fk_loans_user` (`user_id`),
  KEY `idx_loans_open` (`return_date`),
  KEY `idx_loans_due` (`due_date`),
  CONSTRAINT `fk_loans_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_loans_member` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_loans_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `loans` WRITE;
/*!40000 ALTER TABLE `loans` DISABLE KEYS */;
INSERT INTO `loans` VALUES
(1,1,1,1,'2026-10-25','2026-11-08',NULL,0.00),
(2,4,2,2,'2026-10-23','2026-11-06',NULL,0.00),
(3,2,3,1,'2026-10-08','2026-10-22',NULL,0.00),
(4,5,4,2,'2026-10-10','2026-10-24',NULL,0.00),
(5,8,1,1,'2026-10-13','2026-10-27',NULL,0.00),
(6,3,2,1,'2026-09-18','2026-10-02','2026-10-01',0.00),
(7,6,3,2,'2026-09-23','2026-10-07','2026-10-11',2.00),
(8,10,4,1,'2026-09-28','2026-10-12','2026-10-12',0.00);
/*!40000 ALTER TABLE `loans` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `overdue_loans`;
/*!50001 DROP VIEW IF EXISTS `overdue_loans`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `overdue_loans` AS SELECT
 1 AS `id`,
  1 AS `title`,
  1 AS `full_name`,
  1 AS `email`,
  1 AS `loan_date`,
  1 AS `due_date`,
  1 AS `days_late` */;
SET character_set_client = @saved_cs_client;
/*!50001 DROP VIEW IF EXISTS `overdue_loans`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 */
/*!50001 VIEW `overdue_loans` AS select `l`.`id` AS `id`,`b`.`title` AS `title`,`m`.`full_name` AS `full_name`,`m`.`email` AS `email`,`l`.`loan_date` AS `loan_date`,`l`.`due_date` AS `due_date`,to_days(curdate()) - to_days(`l`.`due_date`) AS `days_late` from ((`loans` `l` join `books` `b` on(`b`.`id` = `l`.`book_id`)) join `members` `m` on(`m`.`id` = `l`.`member_id`)) where `l`.`return_date` is null and `l`.`due_date` < curdate() */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

