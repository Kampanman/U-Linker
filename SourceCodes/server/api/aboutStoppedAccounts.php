<?php
include('../db.php');
include('../functions.php');
include('../properties.php');

// 初期レスポンスを定義（不正なリクエストの場合など）
$res = ['type' => 'fail', 'message' => '不正なリクエストです。'];
// デフォルトのHTTPステータスコード
http_response_code(400); // Bad Request

try {
  // POSTリクエストかつトークンが存在し、形式が正しいかチェック
  if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['token']) && isAlphanumeric16($_POST['token'])) {
    if (isset($_POST['type'])) {
      $type = $_POST['type'];
      $isMasterAuthorized = false;
      if (isset($_POST['master_id']) && isset($_POST['is_master']) && $_POST['is_master'] == '1') {
        $master_id = $_POST['master_id'];
        $authSql = "SELECT owner_id FROM " . ACCOUNT_TABLE . " WHERE owner_id = :master_id AND is_master = 1";
        $authStmt = $connection->prepare($authSql);
        $authStmt->bindValue(':master_id', $master_id, PDO::PARAM_STR);
        $authStmt->execute();
        if ($authStmt->fetch()) $isMasterAuthorized = true;
      }

      if (!$isMasterAuthorized) {
        $res['message'] = '権限がありません。マスターアカウントでログインしている必要があります。';
        http_response_code(403); // Forbidden
        echo json_encode($res);
        exit;
      }

      if ($type == 'getStoppedAccounts') {
        $stoppedAccountsSql = "SELECT owner_id, name, is_stopped FROM " . ACCOUNT_TABLE . " WHERE is_stopped = 1";
        $stmt = $connection->prepare($stoppedAccountsSql);
        $stmt->execute();
        $stoppedAccounts = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $resultList = [];
        foreach ($stoppedAccounts as $account) {
          $ownerId = $account['owner_id'];

          // ノート件数取得
          $notesCountSql = "SELECT COUNT(contents_id) FROM " . NOTE_TABLE . " WHERE created_user_id = :owner_id";
          $notesStmt = $connection->prepare($notesCountSql);
          $notesStmt->bindValue(':owner_id', $ownerId, PDO::PARAM_STR);
          $notesStmt->execute();
          $notesCount = $notesStmt->fetchColumn();
          $account['notes_count'] = (int)$notesCount;

          // ビデオ件数取得
          $videosCountSql = "SELECT COUNT(contents_id) FROM " . VIDEO_TABLE . " WHERE created_user_id = :owner_id";
          $videosStmt = $connection->prepare($videosCountSql);
          $videosStmt->bindValue(':owner_id', $ownerId, PDO::PARAM_STR);
          $videosStmt->execute();
          $videosCount = $videosStmt->fetchColumn();
          $account['videos_count'] = (int)$videosCount;

          $resultList[] = $account;
        }

        $res = ['type' => 'success', 'list' => $resultList];
        http_response_code(200);
      } elseif ($type == 'deleteAccounts') {
        if (isset($_POST['delete_owner_ids'])) {
          $deleteOwnerIdsJson = $_POST['delete_owner_ids'];
          $deleteOwnerIds = json_decode($deleteOwnerIdsJson, true);

          if (is_array($deleteOwnerIds) && !empty($deleteOwnerIds)) {
            $connection->beginTransaction();
            try {
              foreach ($deleteOwnerIds as $ownerIdToDelete) {
                $ownerIdToDelete = h($ownerIdToDelete); // サニタイズ

                // 登録ノート削除
                $deleteNotesSql = "DELETE FROM " . NOTE_TABLE . " WHERE created_user_id = :owner_id";
                $stmtNotes = $connection->prepare($deleteNotesSql);
                $stmtNotes->bindValue(':owner_id', $ownerIdToDelete, PDO::PARAM_STR);
                $stmtNotes->execute();

                // 登録ビデオ削除
                $deleteVideosSql = "DELETE FROM " . VIDEO_TABLE . " WHERE created_user_id = :owner_id";
                $stmtVideos = $connection->prepare($deleteVideosSql);
                $stmtVideos->bindValue(':owner_id', $ownerIdToDelete, PDO::PARAM_STR);
                $stmtVideos->execute();

                // 登録サイト削除
                $deleteBookmarksSql = "DELETE FROM " . BOOKMARK_TABLE . " WHERE created_user_id = :owner_id";
                $stmtBookmarks = $connection->prepare($deleteBookmarksSql);
                $stmtBookmarks->bindValue(':owner_id', $ownerIdToDelete, PDO::PARAM_STR);
                $stmtBookmarks->execute();

                // アカウント削除
                $deleteAccountSql = "DELETE FROM " . ACCOUNT_TABLE . " WHERE owner_id = :owner_id AND is_stopped = 1"; // 念のためis_stoppedも条件に
                $stmtAccount = $connection->prepare($deleteAccountSql);
                $stmtAccount->bindValue(':owner_id', $ownerIdToDelete, PDO::PARAM_STR);
                $stmtAccount->execute();
              }
              $connection->commit();
              $res = ['type' => 'success', 'message' => '選択されたアカウントと関連データの削除が完了しました。'];
              http_response_code(200);
            } catch (Exception $e) {
              $connection->rollBack();
              throw new Exception("削除処理中にエラーが発生しました: " . $e->getMessage());
            }
          } else {
            $res['message'] = '削除対象のIDリストが不正です。';
            http_response_code(400);
          }
        } else {
          $res['message'] = '削除対象のIDが指定されていません。';
          http_response_code(400);
        }
      } else {
        $res['message'] = '無効な操作タイプです。';
        http_response_code(400);
      }
    } else {
      $res['message'] = '操作タイプが指定されていません。';
      http_response_code(400);
    }
  } else { // トークンがない、または不正な場合は、初期設定のレスポンスとステータスコードが使用される
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
      $res['message'] = '不正なリクエストメソッドです。';
      http_response_code(405); // Method Not Allowed
    } elseif (!isset($_POST['token'])) {
      $res['message'] = 'トークンがありません。';
    } elseif (!isAlphanumeric16($_POST['token'])) {
      $res['message'] = 'トークンの形式が不正です。';
    }
  }
} catch (PDOException $e) {
  if ($connection->inTransaction()) $connection->rollBack();
  http_response_code(500); // Internal Server Error
  $res = ['type' => 'error', 'message' => 'データベース処理中にエラーが発生しました。', 'detail' => $e->getMessage()];
} catch (Exception $e) {
  if (isset($connection) && $connection->inTransaction()) $connection->rollBack();
  if (http_response_code() === 200 || http_response_code() === 400) http_response_code(500);
  $res = ['type' => 'error', 'message' => 'サーバー内部でエラーが発生しました。', 'detail' => $e->getMessage()];
}

header('Content-Type: application/json; charset=utf-8');
echo json_encode($res);
exit;
