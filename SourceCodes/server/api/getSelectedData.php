<?php
include('../db.php');
include('../functions.php');
include('../properties.php');

$res = ['type' => 'success', 'note' => null, 'video' => null, 'message' => ''];
http_response_code(200); // デフォルトは成功 (200 OK)

try {

  if (!isset($_POST['type'], $_POST['token'], $_POST['contents_id'], $_POST['from'])) {
    setErrorResponse($res, '必須パラメータが不足しています。(type, token, contents_id, from)');
  } elseif (!isAlphanumeric16($_POST['token'])) {
    setErrorResponse($res, '無効なトークン形式です。');
  } else {
    $type = $_POST['type'];
    $contentsId = $_POST['contents_id'];
    $from = $_POST['from'];
    $ownerId = isset($_POST['owner_id']) ? $_POST['owner_id'] : null; // owner_idはnoteの場合のみ必須
    $isCsv = strtolower(substr($from, -4)) === '.csv'; // fromパラメータの末尾が.csvか判定

    if ($type === 'getNoteRecord') {
      if ($ownerId === null) {
        setErrorResponse($res, '必須パラメータが不足しています。(owner_id)');
      } else {
        $noteObject = null;
        if ($isCsv) {
          $csvFileName = basename($from); // CSVファイル名検証 (ディレクトリトラバーサル対策)
          if ($csvFileName !== $from) {
            setErrorResponse($res, '無効なファイル名です。');
          } else {
            $csvFilePath = BASEDIR . '/storage/csv/' . $csvFileName;
            $noteObject = getRecordFromCsv($csvFilePath, $contentsId);
          }
        } else {
          $noteObject = getRecordFromDb($connection, NOTE_TABLE, $contentsId);
        }

        // ノートオブジェクトが取得でき、エラーがなく、作成者IDが存在する場合に作成者名を取得
        if ($noteObject && !isset($noteObject['error']) && isset($noteObject['created_user_id'])) {
          try {
            // ACCOUNT_TABLE から作成者名を取得
            $accountSql = "SELECT `owner_id`, `name` FROM " . ACCOUNT_TABLE . " WHERE `owner_id` = :created_user_id";
            $stmt = $connection->prepare($accountSql);
            $stmt->bindValue(':created_user_id', $noteObject['created_user_id']); // ノートの作成者IDを使用
            $stmt->execute();
            $account = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($account) {
              $noteObject['created_user_id'] = $account['owner_id'];
              $noteObject['created_by'] = $account['name'];
            } else {
              $noteObject['created_user_id'] = '';
              $noteObject['created_by'] = '該当なし'; // 見つからなかった場合は「該当なし」を設定
            }
          } catch (PDOException $e) {
            $noteObject['created_by'] = '該当なし'; // DBエラー時も「該当なし」を設定
            error_log("Database error fetching user name in getSelectedData: " . $e->getMessage());
          }
        }

        if (isset($noteObject['error'])) {
          setErrorResponse($res, $noteObject['error'], 404); // 見つからない場合は404
        } elseif ($noteObject) {
          $isLoginUsersRecord = isset($noteObject['created_user_id']) && $noteObject['created_user_id'] === $ownerId;
          if (!$isLoginUsersRecord && isset($noteObject['url_sub'])) $noteObject['url_sub'] = ''; // 所有者でない場合はurl_subを空にする
          $res['note'] = $noteObject;
        } else {
          setErrorResponse($res, 'ノートレコードの取得に失敗しました。', 404);
        }
      }

    } elseif ($type === 'getVideoRecord') {
      $videoObject = null;
      
      if ($isCsv) {
        $csvFileName = basename($from); // CSVファイル名検証 (ディレクトリトラバーサル対策)
        if ($csvFileName !== $from) {
          setErrorResponse($res, '無効なファイル名です。');
        } else {
          $csvFilePath = BASEDIR . '/storage/csv/' . $csvFileName;
          $videoObject = getRecordFromCsv($csvFilePath, $contentsId);
        }
      } else {
        if (!defined('VIDEO_TABLE')) { // VIDEO_TABLE定数を使用 (properties.phpで定義されている想定)
          setErrorResponse($res, 'VIDEO_TABLE定数が定義されていません。', 500);
        } else {
          $videoObject = getRecordFromDb($connection, VIDEO_TABLE, $contentsId);
        }
      }

      // ビデオオブジェクトが取得でき、エラーがなく、作成者IDが存在する場合に作成者名を取得
      if ($videoObject && !isset($videoObject['error']) && isset($videoObject['created_user_id'])) {
        try {

          $accountSql = "SELECT `owner_id`, `name` FROM " . ACCOUNT_TABLE . " WHERE `owner_id` = :created_user_id";
          $stmt = $connection->prepare($accountSql);
          $stmt->bindValue(':created_user_id', $videoObject['created_user_id']); // ビデオの作成者IDを使用
          $stmt->execute();
          $account = $stmt->fetch(PDO::FETCH_ASSOC);
          if ($account) {
            $videoObject['created_user_id'] = $account['owner_id'];
            $videoObject['created_by'] = $account['name'];
          } else {
            $videoObject['created_user_id'] = '';
            $videoObject['created_by'] = '該当なし'; // 見つからなかった場合は「該当なし」を設定
          }
        } catch (PDOException $e) {
          $videoObject['created_by'] = '該当なし'; // DBエラー時も「該当なし」を設定
          error_log("Database error fetching user name in getSelectedData: " . $e->getMessage());
        }
      }

      if (isset($videoObject['error'])) {
        setErrorResponse($res, $videoObject['error'], 404); // 見つからない場合は404
      } elseif ($videoObject) {
        $res['video'] = $videoObject;
      } else {
        setErrorResponse($res, 'ビデレコードの取得に失敗しました。', 404);
      }

    } else {
      setErrorResponse($res, '無効なtypeパラメータです。');
    }
  }

} catch (Exception $e) { // 予期せぬエラー
  error_log("getSelectedData.php Error: " . $e->getMessage()); // エラーログ推奨
  setErrorResponse($res, 'サーバー内部エラーが発生しました。', 500);
}

// レスポンス返却
header('Content-Type: application/json;charset=utf-8');
echo json_encode($res);
exit;
