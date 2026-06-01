-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: scriptify
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `playlists`
--

DROP TABLE IF EXISTS `playlists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `playlists` (
  `tkt_id` bigint NOT NULL AUTO_INCREMENT,
  `tkt_created_at` datetime(6) DEFAULT NULL,
  `tkt_description` text,
  `tkt_is_public` bit(1) NOT NULL,
  `tkt_name` varchar(255) NOT NULL,
  `tkt_thumbnail_url` varchar(255) DEFAULT NULL,
  `tkt_updated_at` datetime(6) DEFAULT NULL,
  `tkt_user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`tkt_id`),
  KEY `FKrjunx0cer351p6pvbqc1iknx2` (`tkt_user_id`),
  CONSTRAINT `FKrjunx0cer351p6pvbqc1iknx2` FOREIGN KEY (`tkt_user_id`) REFERENCES `tkt_users` (`tkt_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `playlists`
--

LOCK TABLES `playlists` WRITE;
/*!40000 ALTER TABLE `playlists` DISABLE KEYS */;
/*!40000 ALTER TABLE `playlists` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tkt_albums`
--

DROP TABLE IF EXISTS `tkt_albums`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tkt_albums` (
  `tkt_id` bigint NOT NULL AUTO_INCREMENT,
  `tkt_cover_image_url` varchar(255) DEFAULT NULL,
  `tkt_release_year` int DEFAULT NULL,
  `tkt_title` varchar(255) DEFAULT NULL,
  `tkt_artist_id` bigint DEFAULT NULL,
  PRIMARY KEY (`tkt_id`),
  KEY `FK7atcvkgoc79932nl24ogvyivv` (`tkt_artist_id`),
  CONSTRAINT `FK7atcvkgoc79932nl24ogvyivv` FOREIGN KEY (`tkt_artist_id`) REFERENCES `tkt_artists` (`tkt_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tkt_albums`
--

LOCK TABLES `tkt_albums` WRITE;
/*!40000 ALTER TABLE `tkt_albums` DISABLE KEYS */;
/*!40000 ALTER TABLE `tkt_albums` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tkt_artists`
--

DROP TABLE IF EXISTS `tkt_artists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tkt_artists` (
  `tkt_id` bigint NOT NULL AUTO_INCREMENT,
  `tkt_bio` text,
  `tkt_image_url` varchar(255) DEFAULT NULL,
  `tkt_name` varchar(255) NOT NULL,
  PRIMARY KEY (`tkt_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tkt_artists`
--

LOCK TABLES `tkt_artists` WRITE;
/*!40000 ALTER TABLE `tkt_artists` DISABLE KEYS */;
INSERT INTO `tkt_artists` VALUES (5,'Nguyễn Thanh Tùng, thường được biết đến với nghệ danh Sơn Tùng M-TP, là một nam ca sĩ kiêm nhạc sĩ sáng tác bài hát, nhà sản xuất thu âm, rapper và diễn viên người Việt Nam','artists/97aba2db-87d5-4e49-8624-be20324d5bf5_ST.png','Sơn Tùng M-TP'),(6,'Nguyễn Hoàng Long, thường được biết đến với nghệ danh Low G, là một nam rapper, nhạc sĩ sáng tác bài hát kiêm vũ công người Việt Nam','artists/b0fda0c6-e10e-4b60-ab76-6921a10a7ae1_LowG.png','Low G'),(7,'Justin Drew Bieber là một nam ca sĩ kiêm sáng tác nhạc người Canada. Bieber nổi tiếng nhờ khả năng kết hợp đa dạng nhiều dòng nhạc và là nghệ sĩ đóng vai trò quan trọng trong nền âm nhạc đại chúng hiện nay','artists/95b0fe85-9fc4-47dc-b2e8-26a1cfc60155_Justin_Bieber.jpg','Justin Bieber'),(8,'Alan Olav Walker, thường được biết đến với nghệ danh Alan Walker, là một nam DJ, nhạc sĩ kiêm nhà sản xuất thu âm người Na Uy gốc Anh','artists/42f906ff-167a-473c-b64f-52573e397364_AlanWalkerjpg.jpg','Alan Walker'),(9,'HOYO-MiX là một nhóm nhạc và phòng thu âm trực thuộc miHoYo, chủ yếu chịu trách nhiệm sản xuất các bài hát và nhạc phim cho nhiều trò chơi của miHoYo, bao gồm series Honkai, Tears of Themis và Genshin Impact. Phòng thu do Cai Jinhan, giám đốc âm nhạc của miHoYo, đứng đầu.','artists/2b5359e6-5d21-4839-b5f4-6eb82e417997_HoYoMix.jpg','HOYO-MiX'),(10,'Lê Ánh Nhật, thường được biết đến với nghệ danh Miu Lê, là một nữ ca sĩ kiêm diễn viên người Việt Nam.','artists/4cb4acf4-4c94-4c46-906c-b775f5834def_MiuLe.png','Miu Lê'),(11,'Nguyễn Trung Hiếu, thường được biết đến với nghệ danh Chi Dân là một nam ca sĩ, vũ công kiêm sáng tác nhạc người Việt Nam.','artists/dea407eb-58c4-4999-9d30-bf3c9e597663_ChiDan.png','Chi Dân'),(12,'Hoàng Thùy Linh là một nữ ca sĩ, diễn viên kiêm người mẫu người Việt Nam. Bắt đầu được biết đến sau khi tham gia đóng chính trong phim truyền hình Nhật ký Vàng Anh, cô chuyển hướng sang con đường ca hát chuyên nghiệp vào năm 2010.','artists/47366461-ddce-4066-86d4-663105a603e3_HoangThuyLinh.png','Hoàng Thùy Linh'),(13,'Vũ Xuân Bình, thường biết đến với nghệ danh Bình Gold hoặc Donald Gold, là một thợ xăm và rapper người Việt Nam. Các bài rap của Bình Gold như OBGTLH, BCDBL, hay Em iu đã thu hút được hàng chục triệu lượt xem và nghe trên Spotify hay YouTube.','artists/78b73b9b-0c2c-4b87-a2b8-8174824a636f_BinhGold.png','Bình Gold');
/*!40000 ALTER TABLE `tkt_artists` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tkt_playlist_songs`
--

DROP TABLE IF EXISTS `tkt_playlist_songs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tkt_playlist_songs` (
  `tkt_playlist_id` bigint NOT NULL,
  `tkt_song_id` bigint NOT NULL,
  PRIMARY KEY (`tkt_playlist_id`,`tkt_song_id`),
  KEY `FKba0i4vrouifl8iyif6kunq8sw` (`tkt_song_id`),
  CONSTRAINT `FK7c3tquv9wj0566gtk06il8c2a` FOREIGN KEY (`tkt_playlist_id`) REFERENCES `tkt_playlists` (`tkt_id`),
  CONSTRAINT `FKba0i4vrouifl8iyif6kunq8sw` FOREIGN KEY (`tkt_song_id`) REFERENCES `tkt_songs` (`tkt_id`),
  CONSTRAINT `FKic5cu6qc52jbcgm46nyftv3ml` FOREIGN KEY (`tkt_playlist_id`) REFERENCES `playlists` (`tkt_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tkt_playlist_songs`
--

LOCK TABLES `tkt_playlist_songs` WRITE;
/*!40000 ALTER TABLE `tkt_playlist_songs` DISABLE KEYS */;
/*!40000 ALTER TABLE `tkt_playlist_songs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tkt_playlists`
--

DROP TABLE IF EXISTS `tkt_playlists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tkt_playlists` (
  `tkt_id` bigint NOT NULL AUTO_INCREMENT,
  `tkt_created_at` datetime(6) DEFAULT NULL,
  `tkt_description` text,
  `tkt_is_public` bit(1) NOT NULL,
  `tkt_name` varchar(255) NOT NULL,
  `tkt_thumbnail_url` varchar(255) DEFAULT NULL,
  `tkt_updated_at` datetime(6) DEFAULT NULL,
  `tkt_user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`tkt_id`),
  KEY `FKmf14dg99xsf3y1mpds08de557` (`tkt_user_id`),
  CONSTRAINT `FKmf14dg99xsf3y1mpds08de557` FOREIGN KEY (`tkt_user_id`) REFERENCES `tkt_users` (`tkt_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tkt_playlists`
--

LOCK TABLES `tkt_playlists` WRITE;
/*!40000 ALTER TABLE `tkt_playlists` DISABLE KEYS */;
INSERT INTO `tkt_playlists` VALUES (1,'2026-05-15 16:34:52.862555','Mẹ mày béo',_binary '','Deck','playlists/5fd3d5bc-9f1f-4196-a191-67677c799b35_z5168363216307_7adabd3bc02158703556a897d07ec6f0.jpg','2026-05-15 16:34:52.862571',2);
/*!40000 ALTER TABLE `tkt_playlists` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tkt_songs`
--

DROP TABLE IF EXISTS `tkt_songs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tkt_songs` (
  `tkt_id` bigint NOT NULL AUTO_INCREMENT,
  `tkt_created_at` datetime(6) DEFAULT NULL,
  `tkt_duration` int NOT NULL,
  `tkt_file_path` varchar(255) NOT NULL,
  `tkt_image_url` varchar(255) DEFAULT NULL,
  `tkt_like_count` int DEFAULT NULL,
  `tkt_title` varchar(255) NOT NULL,
  `tkt_view_count` bigint DEFAULT NULL,
  `tkt_album_id` bigint DEFAULT NULL,
  `tkt_artist_id` bigint NOT NULL,
  PRIMARY KEY (`tkt_id`),
  KEY `FKc6yhqdulc2uctjr9m0okkiyrh` (`tkt_album_id`),
  KEY `FKdurqb55wh6x8skakny6tiaw0o` (`tkt_artist_id`),
  CONSTRAINT `FKc6yhqdulc2uctjr9m0okkiyrh` FOREIGN KEY (`tkt_album_id`) REFERENCES `tkt_albums` (`tkt_id`),
  CONSTRAINT `FKdurqb55wh6x8skakny6tiaw0o` FOREIGN KEY (`tkt_artist_id`) REFERENCES `tkt_artists` (`tkt_id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tkt_songs`
--

LOCK TABLES `tkt_songs` WRITE;
/*!40000 ALTER TABLE `tkt_songs` DISABLE KEYS */;
INSERT INTO `tkt_songs` VALUES (8,'2026-05-19 05:20:24.366188',263,'music/dbf80aae-cea5-49d0-b2e5-895eb5101a71.mp3','images/27b2405e-ea64-4d55-b346-a43473916888.jpg',0,'HÃY TRAO CHO ANH ',0,NULL,5),(9,'2026-05-19 05:21:27.185903',251,'music/19e8afaf-ecce-4617-aca4-7c0aaf96a839.mp3','images/7121efc2-8299-4378-ad41-5cf53930789c.jpg',0,'OBGTLH',2,NULL,13),(10,'2026-05-19 05:22:37.285980',274,'music/92a4f9af-b370-4b0d-9336-36cb6ebb7a74.mp3','images/5cb2c2a6-c2e9-4206-a39e-c9391b5ed2fc.jpg',0,'CHẠY NGAY ĐI',2,NULL,5),(11,'2026-05-19 05:24:13.039256',213,'music/08351504-3b25-45f8-a27f-83a81f346032.mp3','images/82187318-5ea7-407f-a7a9-c48e470a65f2.jpg',0,'BCDBL',1,NULL,13),(12,'2026-05-19 06:30:03.057463',187,'music/dfa1e164-82c1-4d49-af58-8aeb260f9f28.mp3','images/d939d354-8d32-4396-9375-ced18d7a4a17.jpg',0,'Ripples of Past Reverie (English Ver.)',0,NULL,9),(13,'2026-05-19 06:31:07.462009',115,'music/6715c7d5-dc85-4a55-8600-8368f3dd25f9.mp3','images/5da0db3c-6669-4926-a5ce-e9530f9f9726.jpg',0,'Ravings',0,NULL,9),(14,'2026-05-19 06:32:41.837147',213,'music/ed0af152-9c41-4a37-8352-47cc239c7d87.mp3','images/9154c381-8a43-4b60-acc8-744aa459ba4d.jpg',0,'Faded',1,NULL,8),(15,'2026-05-19 06:34:20.503932',218,'music/12c8b1f5-5ef9-4f0b-bbc4-e3c3bc5833dc.mp3','images/957449cd-2a61-4eda-8cda-8baaeec3a7aa.jpg',0,'Wildfire',2,NULL,9),(16,'2026-05-19 06:37:14.317941',163,'music/f028797d-d157-4b65-9188-aed82aa722e0.mp3','images/d40527e6-fc91-4d66-bce6-5ff1bb6d05fb.jpg',0,'Alone',0,NULL,8),(17,'2026-05-19 06:37:33.636058',219,'music/af617739-ce1b-4563-b0c5-10dbfca24afb.mp3','images/f45fba88-902f-4f58-9b17-d7eb4f7c6927.jpg',0,'Baby',1,NULL,7),(18,'2026-05-19 06:39:03.376185',240,'music/1be508f4-4b6c-4113-9325-77972092a95c.mp3','images/cc38c73a-d23b-4b9a-b534-68c3494f8742.jpg',0,'DarkSide',0,NULL,8),(19,'2026-05-19 06:41:52.103018',256,'music/2e888375-4b7c-4417-bcd0-f21e387fdd96.mp3','images/edf496dd-09ec-46cc-a032-ebf4539d889a.jpg',0,'HOP ON DA SHOW',0,NULL,6),(20,'2026-05-19 06:44:11.016111',246,'music/8f07aae0-3c23-4987-af59-ce582a92c737.mp3','images/282609e2-b714-4dee-be10-691f9c39364e.jpg',0,'1234',0,NULL,11),(21,'2026-05-19 06:44:55.292699',237,'music/0995e676-03ab-45d3-ab78-741efd82271c.mp3','images/0b51e8ba-f31f-429d-8cdb-e8c4ad4eb341.jpg',0,'See Tình',0,NULL,12),(22,'2026-05-19 06:46:14.637276',282,'music/18f4c199-7c63-43a0-a110-e4733f4bc2b8.mp3','images/2cfdb1c8-830d-42a3-8712-2813d44dd558.jpg',0,'Để Mị Nói Cho Mà Nghe',0,NULL,12),(23,'2026-05-19 06:46:41.439762',265,'music/32cc50f6-c40b-45d2-80eb-d896578fc96f.mp3','images/3574849b-7519-45a1-bb5e-4fa4dc9eaf81.jpg',0,'Yêu Một Người Có Lẽ',0,NULL,10),(24,'2026-05-19 06:49:22.270266',270,'music/06437fd0-d356-43d7-b065-2f3b439128a3.mp3','images/260ff6d9-e4df-443f-9b42-747b19c97802.jpg',0,'Kẻ Cắp Gặp Bà Già',1,NULL,12);
/*!40000 ALTER TABLE `tkt_songs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tkt_user_favourites`
--

DROP TABLE IF EXISTS `tkt_user_favourites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tkt_user_favourites` (
  `tkt_user_id` bigint NOT NULL,
  `tkt_song_id` bigint NOT NULL,
  PRIMARY KEY (`tkt_user_id`,`tkt_song_id`),
  KEY `FK7imyc1m3xpohnynvqyfhg46rg` (`tkt_song_id`),
  CONSTRAINT `FK7imyc1m3xpohnynvqyfhg46rg` FOREIGN KEY (`tkt_song_id`) REFERENCES `tkt_songs` (`tkt_id`),
  CONSTRAINT `FKfoeuq4icx8eufbjl0dame9p9o` FOREIGN KEY (`tkt_user_id`) REFERENCES `tkt_users` (`tkt_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tkt_user_favourites`
--

LOCK TABLES `tkt_user_favourites` WRITE;
/*!40000 ALTER TABLE `tkt_user_favourites` DISABLE KEYS */;
/*!40000 ALTER TABLE `tkt_user_favourites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tkt_users`
--

DROP TABLE IF EXISTS `tkt_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tkt_users` (
  `tkt_id` bigint NOT NULL AUTO_INCREMENT,
  `tkt_avatar_url` varchar(255) DEFAULT NULL,
  `tkt_created_at` datetime(6) DEFAULT NULL,
  `tkt_email` varchar(255) NOT NULL,
  `tkt_enabled` bit(1) NOT NULL,
  `tkt_nickname` varchar(255) NOT NULL,
  `tkt_password` varchar(255) NOT NULL,
  `tkt_role` enum('ADMIN','USER') DEFAULT NULL,
  `tkt_updated_at` datetime(6) DEFAULT NULL,
  `tkt_verification_code` varchar(255) DEFAULT NULL,
  `tkt_verification_expiration` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`tkt_id`),
  UNIQUE KEY `UKrbpn8r6x3nobn31mr870ckru8` (`tkt_email`),
  UNIQUE KEY `UK46633q96399gmy753qqercgwj` (`tkt_nickname`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tkt_users`
--

LOCK TABLES `tkt_users` WRITE;
/*!40000 ALTER TABLE `tkt_users` DISABLE KEYS */;
INSERT INTO `tkt_users` VALUES (1,'avatars/cb6188a0-123f-4a29-a9b5-9447ccad2ddc_mornye_upscayl_2x_upscayl-standard-4x.png','2026-05-15 13:19:35.251173','kimtam486@gmail.com',_binary '','Scriptify','$2a$10$Ee/jUkAkD1gsY0ixjFvlae5qeyXl.k1ExXy16a0VzdO43lIUE64MK','ADMIN','2026-05-15 13:19:59.807095',NULL,NULL),(2,'avatars/57e9b2e8-b185-42af-b154-4bebc94104ea_IMG_0002.JPEG','2026-05-15 15:16:11.966248','nguyenvankhai2262@gmail.com',_binary '','Mizu','$2a$10$XdQ59C3ZZmSk0RIdr.KoIOCHOa0b7Pos49sOsNY6dpgbNPLdWNy9u','ADMIN','2026-05-15 15:16:44.259901',NULL,NULL),(3,'users/4f724467-eafa-43b9-858e-93d0757f30dd_republic-of-gamers-1920x1080-9523.jpg','2026-05-17 13:20:56.556250','conheosaumui2005@gmail.com',_binary '','Tuan','$2a$10$IFkwygdpaMsxdcaJDB53huZMfXaMXVcuokePLgJxdqT.YIIyB4nOa','ADMIN','2026-05-17 13:26:05.797185',NULL,NULL),(4,'avatars/fee0fca1-e54c-4ec1-91b2-a4218aa7eb4a_387747679_1963970930644836_9150534841220581670_n.jpg','2026-05-18 04:26:13.234870','khainguyenfelix2005@gmail.com',_binary '\0','Test001','$2a$10$OpdpO1YQym0nRsFn1e684uddtp0/ckJ5vaOrYrwtorZHPFX5WyBwe','USER','2026-05-18 04:26:17.444294','859425','2026-05-18 04:36:13.353775'),(5,'avatars/d7151b0b-d4b4-4a0c-ae8c-847a35f50079_yeu1nguoicole.jpg','2026-05-19 06:51:03.943819','tamvip2005@gmail.com',_binary '','Test01','$2a$10$M.DSoDGSAvfg7eiriYHq5u8IXx4Xv6S/Je1BnBWQcnHtWFUeXQJBK','USER','2026-05-19 07:26:01.241032',NULL,NULL);
/*!40000 ALTER TABLE `tkt_users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-20 18:04:56
