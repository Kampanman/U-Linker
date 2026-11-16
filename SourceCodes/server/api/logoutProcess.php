<?php
require_once __DIR__ . '/../functions.php';

// セッションが開始されていない場合のみ開始
if (session_status() === PHP_SESSION_NONE) {
  session_start();
}

// apiに直接アクセスした場合、画面には0とだけ表示されるように設定
$res = 0;
try {
  if (isset($_POST["type"]) && $_POST["type"] === 'logout') {
    // tokenが設定されており、その値が半角英数字16桁の場合にログアウト処理（セッション初期化）に移行する
    if (isset($_POST["token"]) && isAlphanumeric16($_POST["token"])) {
      // セッション変数を全て解除
      $_SESSION = [];

      // クッキーにセッションIDが存在する場合は破棄
      if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(
          session_name(),
          '',
          time() - 42000,
          $params["path"],
          $params["domain"],
          $params["secure"],
          $params["httponly"]
        );
      }

      // セッションを破棄
      session_destroy();
      $res = 1;
    }
  }
} catch (Throwable $e) {
  // エラーが発生した場合
  http_response_code(500);
  $errorResponse = [
    'type' => 'error',
    'message' => 'サーバーエラーが発生しました。',
    'detail' => $e->getMessage(),
  ];
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode($errorResponse);
  exit;
}

echo $res;
exit;
