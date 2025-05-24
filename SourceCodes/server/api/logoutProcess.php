<?php
include('../db.php');
include('../functions.php');

session_start();
// apiに直接アクセスした場合、画面には0とだけ表示されるように設定
$res = 0;
try {
  if (isset($_POST["type"]) && $_POST["type"] == 'logout') {
    // tokenが設定されており、その値が半角英数字16桁の場合にログアウト処理（セッション初期化）に移行する
    if (isset($_POST["token"]) && isAlphanumeric16($_POST["token"])) {
      session_destroy();
      $res = 1;
    }
  }
} catch (Exception $e) {
  // エラーが発生した場合
  http_response_code(500);
  $errorResponse = [
    'type' => 'error',
    'message' => 'サーバーエラーが発生しました。',
    'detail' => $e->getMessage(),
  ];
  header('Content-Type: application/json');
  echo json_encode($errorResponse);
  exit;
}

echo $res;
exit;