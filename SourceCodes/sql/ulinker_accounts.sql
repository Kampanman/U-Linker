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
-- テーブルの構造 `ulinker_accounts`
--

CREATE TABLE `ulinker_accounts` (
  `owner_id` varchar(16) NOT NULL,
  `name` varchar(32) CHARACTER SET utf8 NOT NULL COMMENT 'ユーザー名',
  `email` varchar(256) CHARACTER SET utf8 NOT NULL COMMENT 'メールアドレス。ログイン時に入力する',
  `password` text CHARACTER SET utf8 NOT NULL COMMENT 'パスワード。ログイン時に入力する',
  `is_master` int(2) NOT NULL DEFAULT '0' COMMENT '1の場合に本テーブルの統括管理者であることを示す。「is_teacher」が1のユーザーのうちidが最も若いユーザーが該当する。統括管理者以外のアカウントは自動的に0に設定される',
  `is_teacher` int(2) NOT NULL DEFAULT '0' COMMENT '講師権限。0が一般（講師権限なし）、1が講師',
  `token` varchar(16) CHARACTER SET utf8 DEFAULT NULL COMMENT 'パスワードリセットメール送信時に設定されるワンタイムトークン。URLパラメータに設定された「onetime_token」の値と合致している場合に、パスワード再設定ページが表示される。ユーザーがログインするとNULLにリセットされる',
  `token_limit` datetime DEFAULT NULL COMMENT 'ワンタイムトークンの有効期限。ユーザーがログインするとNULLにリセットされる',
  `comment` varchar(108) CHARACTER SET utf8 DEFAULT NULL COMMENT 'ユーザーの個別コメント',
  `is_stopped` int(2) NOT NULL DEFAULT '0' COMMENT '利用停止フラグ。1が停止中を示す。停止中でなければ0',
  `created_at` datetime NOT NULL COMMENT 'アカウントの登録日',
  `updated_at` datetime NOT NULL COMMENT 'アカウントの更新日',
  `updated_user_id` varchar(16) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='「U-Linker」の各ユーザーのアカウントデータを格納する';

--
-- テーブルのデータのダンプ `ulinker_accounts`
--

INSERT INTO `ulinker_accounts` (`owner_id`, `name`, `email`, `password`, `is_master`, `is_teacher`, `token`, `token_limit`, `comment`, `is_stopped`, `created_at`, `updated_at`, `updated_user_id`) VALUES
('2025040801563714', 'カンパンマン', 'kampan.newsoul@mymail.com', '$2y$10$K1AGPRHVGERzSFOWsnoB6u.Lp33mOm6FhTGjVXXEVFcgilORCYiKa', 1, 1, NULL, NULL, 'パスワードは「Kampan1234」。', 0, '2025-04-08 01:56:37', '2025-04-08 01:56:37', '2025040801563714'),
('2025051003074218', 'ボラえもん', 'Boraemon.newsoul@mymail.com', '$2y$10$uVeotWCL83FJmfiPV/bQE.IxT8kZ1MFcjBhCT451q7vmuyP2qn1jC', 0, 1, NULL, NULL, 'パスワードは、Boraemon1234。', 0, '2025-05-10 03:07:42', '2025-05-10 03:07:58', '2025051003074218'),
('2025051003085787', '福田早苗', 'Sanae-Fukuda.newsoul@mymail.com', '$2y$10$UCK.gfkiSRRq.COVmRCRbONAMnaEsYRIhGwOTg5gekwEoc0fw3rU6', 0, 1, NULL, NULL, 'パスワードは、Sanaesan1234。', 0, '2025-05-10 03:08:57', '2025-05-10 03:09:15', '2025051003085787'),
('2025051003095703', '荒川江南', 'Konan-Arakawa.newsoul@mymail.com', '$2y$10$tIC7dMX9twG1VQ1x/7Mk/u.HJgNR2AFeMkE9uhGLbGmxDTWPyJDhm', 0, 0, NULL, NULL, 'パスワードは、Konan1234。', 0, '2025-05-10 03:09:57', '2025-05-21 16:04:52', '2025051003095703'),
('2025051003104791', '篠原進之介', 'Shinnosuke-Shinohara.newsoul@mymail.com', '$2y$10$iklyP9vaeeGvsQe.uarkr.4JOWO87WUtjvTAzFHfBxBdo23gTQS3K', 0, 0, NULL, NULL, 'パスワードは、Shinnosuke1234。', 0, '2025-05-10 03:10:47', '2025-05-10 03:10:47', '2025051003104791');

--
-- テーブルのインデックス `ulinker_accounts`
--
ALTER TABLE `ulinker_accounts`
  ADD PRIMARY KEY (`owner_id`);
COMMIT;
