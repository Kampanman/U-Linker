<?php
include('../db.php');
include('../functions.php');
include('../properties.php');

session_start();
header('Content-Type: application/json; charset=utf-8');

// 初期レスポンス（認証失敗時のデフォルト）
$res = ['type' => 'fail', 'class' => 'error-message', 'message' => 'メールアドレスまたはパスワードに誤りがあるようです。'];

try {
  if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['token'])) { // POSTリクエストかつトークンが存在するかチェック
    $email = h($_POST['email']);
    $password = $_POST['password'];

    $accountSql = "SELECT `owner_id`, `name`, `email`, `password`, `is_master`, `comment`, `is_teacher`, `is_stopped` FROM " . ACCOUNT_TABLE . " WHERE email = :email";
    $stmt = $connection->prepare($accountSql);
    $stmt->bindValue(':email', $email);
    $stmt->execute();

    // fetchの結果を連想配列で取得し、ユーザーが存在するか確認
    $member = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($member) { // ユーザーが見つかった場合
      if (password_verify($password, $member['password'])) { // パスワードを検証
        if ($member['is_stopped'] == 0) { // アカウントが停止されていないか確認
          // DBのユーザー情報をセッションに保存
          $_SESSION['session_string'] = generateRandomAlphanumericString(16);
          $_SESSION['session_contents'] = CONTENTS_NAME;
          $_SESSION['owner_id'] = $member['owner_id'];
          $_SESSION['email'] = $member['email'];
          $_SESSION['name'] = $member['name'];
          $_SESSION['is_master'] = $member['is_master'];
          $_SESSION['is_teacher'] = $member['is_teacher'];
          $_SESSION['comment'] = $member['comment'];

          // ログインアカウントの「token」「token_limit」をNULLに更新する
          $updateTokenSql = "UPDATE " . ACCOUNT_TABLE . " SET token = NULL, token_limit = NULL WHERE owner_id = :owner_id";
          $updateStmt = $connection->prepare($updateTokenSql);
          $updateStmt->bindValue(':owner_id', $member['owner_id']);
          $updateStmt->execute();

          // ログイン成功時のレスポンスデータを生成
          $res = ['type' => 'success', 'class' => 'success-message', 'message' => 'ログインIDとパスワードの認証に成功しました。'];
        } else { // 停止されているアカウントだった場合
          $res = [
            'type' => 'fail',
            'class' => 'error-message',
            'message' => 'このアカウントは現在停止されています。管理者にお問い合わせください。'
          ];
        }
      }
    }
  } else { // POSTリクエストでない、またはトークンがない場合
    $res['message'] = '不正なリクエストです。';
    http_response_code(400); // Bad Request ステータスコードを設定
  }
} catch (PDOException $e) { // データベース関連のエラーハンドリング
  http_response_code(500); // Internal Server Error
  $res = [
    'type' => 'error',
    'class' => 'error-message',
    'message' => 'データベース処理中にエラーが発生しました。',
  ];
} catch (Exception $e) { // その他の予期せぬエラーハンドリング
  http_response_code(500);
  $res = [
    'type' => 'error',
    'class' => 'error-message',
    'message' => 'サーバー内部でエラーが発生しました。',
  ];
}

echo json_encode($res);
exit;