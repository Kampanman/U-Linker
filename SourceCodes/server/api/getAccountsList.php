<?php
include('../db.php');
include('../functions.php');
include('../properties.php');

// レスポンスの初期化（成功時のデフォルト構造）
$res = ['type' => 'success', 'list' => []]; // データ格納用のキーを追加

try {
  // POSTリクエストかつトークンが存在し、形式が正しいかチェック
  if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['token']) && isAlphanumeric16($_POST['token'])) {
    // owner_idが設定されており、かつtypeが「getAccountsList」であるか確認
    if (isset($_POST['ownerId']) && isset($_POST['type']) && $_POST['type'] === 'getAccountsList') {
      $ownerIdToExclude = $_POST['ownerId']; // 除外する owner_id
      $accountSql = "SELECT ".
                      "`owner_id` AS 'ownerId', `name` AS 'userName', ".
                      "`email`, `comment`, ".
                      "`is_teacher` AS 'isTeacher', ".
                      "`is_master` AS 'isMaster', ".
                      "`is_stopped` AS 'isStopped', ".
                      "`created_at` AS 'created' ".
                    "FROM " . ACCOUNT_TABLE . " WHERE owner_id != :owner_id";
      $stmt = $connection->prepare($accountSql);
      $stmt->bindValue(':owner_id', $ownerIdToExclude);
      $stmt->execute();
      $members = $stmt->fetchAll(PDO::FETCH_ASSOC);

      // 取得したデータをレスポンスに格納
      if ($members) {
        $res['list'] = $members;
      } else {
        $res['message'] = '該当するアカウントが見つかりませんでした。';
      }
    } else {
      // type や owner_id が不正な場合
      $res = ['type' => 'fail', 'message' => '不正なリクエストパラメータです。'];
      http_response_code(400);
    }
  } else { // POSTリクエストでない、またはトークンがない/不正な場合
    $res = ['type' => 'fail', 'message' => '不正なリクエストまたはトークンです。'];
    http_response_code(400); // Bad Request ステータスコードを設定
  }
} catch (PDOException $e) { // データベース関連のエラーハンドリング
  http_response_code(500); // Internal Server Error
  $res = [
    'type' => 'error',
    'message' => 'データベース処理中にエラーが発生しました。',
  ];
} catch (Exception $e) { // その他の予期せぬエラーハンドリング
  http_response_code(500);
  $res = [
    'type' => 'error',
    'message' => 'サーバー内部でエラーが発生しました。',
  ];
}

header('Content-Type: application/json; charset=utf-8');
echo json_encode($res);
exit;
