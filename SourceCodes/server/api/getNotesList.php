<?php
include('../db.php');
include('../functions.php');
include('../properties.php');

// レスポンスの初期化（成功時のデフォルト構造）
$res = ['type' => 'success', 'list' => [], 'note' => null]; // データ格納用のキーを追加

try {

  // POSTリクエストかつトークンが存在し、形式が正しいかチェック
  if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['token']) && isAlphanumeric16($_POST['token'])) {
    // owner_idが設定されており、かつtypeが「getAccountsList」であるか確認
    if (isset($_POST['ownerId']) && isset($_POST['type']) && $_POST['type'] === 'getNotesList') {
      $noteSql = "SELECT `contents_id`, `title`, `url`, `publicity`, `created_at`, `updated_at` ".
                    "FROM " . NOTE_TABLE . " WHERE created_user_id = :owner_id ".
                    "ORDER BY updated_at DESC";
      $stmt = $connection->prepare($noteSql);
      $stmt->bindValue(':owner_id', $_POST['ownerId']);
      $stmt->execute();
      $notes = $stmt->fetchAll(PDO::FETCH_ASSOC);

      // 取得したデータをレスポンスに格納
      if ($notes) {
        $res['list'] = $notes;
      } else {
        $res['message'] = '該当するノートが見つかりませんでした。';
      }
    } else if(isset($_POST['contentsId']) && isset($_POST['type']) && $_POST['type'] === 'getNote') {
      $noteSql = "SELECT `contents_id`, `title`, `url`, `url_sub`, `note`, `publicity`, ".
                    "`relate_notes`, `relate_video_urls`, `created_at` ".
                    "FROM " . NOTE_TABLE . " WHERE contents_id = :contents_id";
      $stmt = $connection->prepare($noteSql);
      $stmt->bindValue(':contents_id', $_POST['contentsId']);
      $stmt->execute();
      $note = $stmt->fetch(PDO::FETCH_ASSOC);

      // 取得したデータをレスポンスに格納
      if ($note) {
        $res['note'] = $note;
      } else {
        $res['message'] = '該当するノートが見つかりませんでした。';
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
