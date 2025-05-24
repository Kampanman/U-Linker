-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- ホスト: mysql1029.db.sakura.ne.jp
-- 生成日時: 2025 年 5 月 25 日 02:50
-- サーバのバージョン： 5.7.40-log
-- PHP のバージョン: 8.2.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- テーブルの構造 `ulinker_bookmarksites`
--

CREATE TABLE `ulinker_bookmarksites` (
  `contents_id` varchar(16) NOT NULL COMMENT 'レコードの一意識別のためのID値',
  `title` varchar(108) NOT NULL COMMENT 'サイトのタイトル',
  `url` text NOT NULL COMMENT 'サイトのURL',
  `created_at` datetime NOT NULL COMMENT 'サイトデータの登録日。登録形式は「yyyy-MM-dd hh:mm:ss」',
  `updated_at` datetime NOT NULL COMMENT 'サイトデータの更新日。登録形式は「yyyy-MM-dd hh:mm:ss」',
  `created_user_id` varchar(16) NOT NULL COMMENT 'サイトデータの登録者のID。[ulinker_accounts.owner_id]の値がここに格納される'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='「U-Linker」で各ユーザーが登録したお気に入りサイトのデータを格納する';

--
-- テーブルのデータのダンプ `ulinker_bookmarksites`
--

INSERT INTO `ulinker_bookmarksites` (`contents_id`, `title`, `url`, `created_at`, `updated_at`, `created_user_id`) VALUES
('2025041421083534', 'Amazon&nbsp;トップページ', 'https://www.amazon.co.jp/', '2025-04-14 21:08:35', '2025-04-14 21:13:15', '2025040801563714');

--
-- テーブルのインデックス `ulinker_bookmarksites`
--
ALTER TABLE `ulinker_bookmarksites`
  ADD PRIMARY KEY (`contents_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
