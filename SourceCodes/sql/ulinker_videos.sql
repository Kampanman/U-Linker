-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- テーブルの構造 `ulinker_videos`
--

CREATE TABLE `ulinker_videos` (
  `contents_id` varchar(16) NOT NULL COMMENT 'ビデオの一意識別のためのID値',
  `title` varchar(108) NOT NULL COMMENT 'ビデオのタイトル',
  `url` text NOT NULL COMMENT 'ビデオのURL',
  `tags` varchar(108) DEFAULT NULL COMMENT 'ビデオのタグ',
  `publicity` int(2) NOT NULL DEFAULT '0' COMMENT 'ビデオの公開範囲。0が非公開、1が公開、2が講師にのみ公開',
  `created_at` datetime NOT NULL COMMENT 'ビデオの登録日。登録形式は「yyyy-MM-dd hh:mm:ss」',
  `updated_at` datetime NOT NULL COMMENT 'ビデオの更新日。登録形式は「yyyy-MM-dd hh:mm:ss」',
  `created_user_id` varchar(16) NOT NULL COMMENT 'ビデオの登録者のID。[ulinker_accounts.owner_id]の値がここに格納される'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='「U-Linker」で各ユーザーが登録したビデオ（動画）のデータを格納する';

--
-- テーブルのインデックス `ulinker_videos`
--
ALTER TABLE `ulinker_videos`
  ADD PRIMARY KEY (`contents_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
