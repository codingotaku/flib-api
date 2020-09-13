-- phpMyAdmin SQL Dump
-- version 4.9.5deb2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Sep 13, 2020 at 08:12 PM
-- Server version: 8.0.21
-- PHP Version: 7.4.9

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `flib_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `flib_books`
--

CREATE TABLE `flib_books` (
  `id` int NOT NULL,
  `user` int DEFAULT NULL,
  `license` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `tags` json DEFAULT NULL,
  `cover` varchar(100) DEFAULT NULL,
  `anonymous` tinyint(1) DEFAULT NULL,
  `published` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `flib_pages`
--

CREATE TABLE `flib_pages` (
  `id` int NOT NULL,
  `book` int NOT NULL,
  `title` varchar(100) NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `published` tinyint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `flib_users`
--

CREATE TABLE `flib_users` (
  `id` int NOT NULL,
  `uname` varchar(100) NOT NULL,
  `email` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `password` varchar(150) NOT NULL,
  `name` varchar(150) DEFAULT NULL,
  `links` json DEFAULT NULL,
  `subscriptions` json DEFAULT NULL,
  `profile_desc` text,
  `profile_pic` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `flib_books`
--
ALTER TABLE `flib_books`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Title Index` (`title`,`license`),
  ADD KEY `user_id` (`user`);

--
-- Indexes for table `flib_pages`
--
ALTER TABLE `flib_pages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `book` (`book`,`title`);

--
-- Indexes for table `flib_users`
--
ALTER TABLE `flib_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uname_index` (`uname`),
  ADD UNIQUE KEY `email_index` (`email`) USING BTREE;

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `flib_books`
--
ALTER TABLE `flib_books`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `flib_pages`
--
ALTER TABLE `flib_pages`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `flib_users`
--
ALTER TABLE `flib_users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `flib_books`
--
ALTER TABLE `flib_books`
  ADD CONSTRAINT `autor_id` FOREIGN KEY (`user`) REFERENCES `flib_users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
