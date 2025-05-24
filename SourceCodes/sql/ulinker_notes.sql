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
-- テーブルの構造 `ulinker_notes`
--

CREATE TABLE `ulinker_notes` (
  `contents_id` varchar(16) NOT NULL COMMENT 'ノートの一意識別のためのID値',
  `title` varchar(108) NOT NULL COMMENT 'ノートのタイトル',
  `url` text COMMENT 'ノートのURL',
  `url_sub` text CHARACTER SET utf8 COMMENT 'ノートのサブリンクURL。登録者のみ閲覧可能',
  `note` text NOT NULL COMMENT 'ノートの本文',
  `publicity` int(2) NOT NULL DEFAULT '0' COMMENT 'ノートの公開範囲。0が非公開、1が公開、2が講師にのみ公開',
  `relate_notes` text COMMENT 'ノートに紐づく関連ノートデータ',
  `relate_video_urls` text COMMENT 'ノートの関連動画URL',
  `created_at` datetime NOT NULL COMMENT 'ノートの登録日。登録形式は「yyyy-MM-dd hh:mm:ss」',
  `updated_at` datetime NOT NULL COMMENT 'ノートの更新日。登録形式は「yyyy-MM-dd hh:mm:ss」',
  `created_user_id` varchar(16) NOT NULL COMMENT 'ノートの登録者のID。[ulinker_accounts.owner_id]の値がここに格納される'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='「U-Linker」で各ユーザーが登録したノートのデータを格納する';

--
-- テーブルのインデックス `ulinker_notes`
--

ALTER TABLE `ulinker_notes`
  ADD PRIMARY KEY (`contents_id`);
COMMIT;
