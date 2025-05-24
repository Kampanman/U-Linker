<?php
include('../db.php');
include('../functions.php');
include('../properties.php');

require '../../vendor/autoload.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception as PHPMailerException;

$res = ['type' => 'success', 'message' => ""];
http_response_code(200); // デフォルトは成功 (200 OK)

try {
  if (
    $_SERVER['REQUEST_METHOD'] !== 'POST' ||
    !isset($_POST['token']) || !isAlphanumeric16($_POST['token']) || // トークンの存在と形式チェック
    !isset($_POST['type']) // type の存在チェック
  ) { // 不正なリクエストまたは共通パラメータ不足の場合
    throw new Exception('不正なリクエストまたは必須パラメータが不足しています。', 400); // 400 Bad Request
  }
  $requestType = $_POST['type'];
  $email = $_POST['loginId'] ?? null;
  $gmail = $_POST['gmail'] ?? null;
  $password = $_POST['password'] ?? null;

  if ($requestType === 'generateResetPassMail') { // type: 'getRelateNoteList' の場合
    if (!isset($email) || !isset($gmail) || !isset($password)) throw new Exception('必要なパラメータが不足しています。', 400);

    // $emailの値が[ulinker_accounts]の「email」に設定されているアカウントを取得する
    $accountSql = "SELECT `owner_id`, `name`, `email` FROM " . ACCOUNT_TABLE . " WHERE email = :email";
    $stmt = $connection->prepare($accountSql);
    $stmt->bindValue(':email', $email, PDO::PARAM_STR);
    $stmt->execute();
    $account = $stmt->fetch(PDO::FETCH_ASSOC);

    // アカウントが存在しない場合はエラーメッセージを表示
    if (!$account){
      $res = ['type' => 'error', 'message' => '指定されたメールアドレスのアカウントは見つかりませんでした。'];
    } else {
      // アカウントが存在する場合：パスワードリセットメール生成・送信処理

      // ワンタイムトークン生成 (ランダムな半角英数字 16 文字)
      $onetimeToken = generateRandomAlphanumericString(16);

      // 有効期限時間設定 (メール送信処理成功時から 30 分後)
      $tokenLimit = date('Y-m-d H:i:s', strtotime('+30 minutes'));

      // 「ulinker_accounts」内では対象ユーザーの「token」にワンタイムトークンを設定する
      // 「ulinker_accounts」内では対象ユーザーの「token_limit」に有効期限時間を設定する
      $updateTokenSql = "UPDATE " . ACCOUNT_TABLE . " SET token = :token, token_limit = :token_limit WHERE owner_id = :owner_id";
      $updateStmt = $connection->prepare($updateTokenSql);
      $updateStmt->bindValue(':token', $onetimeToken, PDO::PARAM_STR);
      $updateStmt->bindValue(':token_limit', $tokenLimit, PDO::PARAM_STR);
      $updateStmt->bindValue(':owner_id', $account['owner_id']);
      $updateStmt->execute();

      // 管理者名を取得する
      // テーブル「ulinker_accounts」で、「is_teacher」が 1 のユーザーのうち owner_id が最も若いユーザーの name
      $adminName = '管理者'; // デフォルト値
      $adminSql = "SELECT `name` FROM " . ACCOUNT_TABLE . " WHERE `is_teacher` = 1 ORDER BY `owner_id` ASC LIMIT 1";
      $adminStmt = $connection->prepare($adminSql);
      $adminStmt->execute();
      $adminAccount = $adminStmt->fetch(PDO::FETCH_ASSOC);
      if ($adminAccount) $adminName = $adminAccount['name'];

      $baseUrl = DOMAIN.'/'.CONTENTS_NAME.'/';
      $contentsName = CONTENTS_NAME;
      $resetPassLink = $baseUrl . 'pages/resetpass.php?onetime_token=' . urlencode($onetimeToken); // パスワード再設定ページリンク
      $indexPage = $baseUrl . 'pages/index.php';
      $subject = "【". $contentsName ."】パスワード再設定のご案内"; // メール件名

      // メール本文(ヒアドキュメントを使用)
      $body = <<<EOT
いつも {$contentsName} をご利用いただき、ありがとうございます。

パスワード再設定のリクエストを受け付けました。
下記のリンクからパスワードの再設定を行ってください。
このリンクは安全のため、30 分後に無効となります。

{$resetPassLink}

このメールに心当たりがない場合は、このメールを無視していただくか、
{$contentsName} 管理者 {$adminName} までご連絡ください。

※このメールは送信専用のため、返信いただいてもお答え致しかねます。
------------------------------
{$contentsName} 管理者 {$adminName}
{$indexPage}
EOT;

      // メール送信処理
      $mail = new PHPMailer(true);

      try {
        // デバッグ設定
        // $mail->SMTPDebug = SMTP::DEBUG_SERVER; // 詳細なデバッグ情報を出力 (クライアントとサーバーのやり取り)
        $mail->SMTPDebug = SMTP::DEBUG_OFF; // ★重要: 本番環境ではデバッグ出力をオフにする
        
        $mail->isSMTP();                          // SMTPサーバー設定
        $mail->Host       = 'smtp.gmail.com';     // GmailのSMTPサーバー
        $mail->SMTPAuth   = true;                 // SMTP認証を有効にする
        $mail->Username   = $gmail;               // 送信元Gmailアドレス (POSTで受け取った値)
        $mail->Password   = $password;            // 送信元Gmailのパスワード (POSTで受け取った値)
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; // TLS暗号化を有効にする
        $mail->Port       = 587;                  // TLS用のTCPポート (SSLの場合は465)
        $mail->CharSet = 'UTF-8';                 // 文字コード設定

        $mail->setFrom(SENDFROM, CONTENTS_NAME);     // 送信元メールアドレスと送信者名
        $mail->addAddress($gmail, $account['name']); // 送信先メールアドレスと受信者名

        // メール内容
        $mail->isHTML(false); // HTMLメールではない (プレーンテキスト)
        $mail->Subject = $subject;
        $mail->Body    = $body;

        if ($mail->send()) {
          // メール送信成功時のレスポンスデータを生成
          $res = ['type' => 'success', 'message' => "パスワードリセットメールを送信しました。メール内リンクから30分以内に再設定をお願いします。"];
        } else {
          // PHPMailerがfalseを返した場合 (通常は例外がスローされるが念のため)
          error_log("PHPMailer send failed (no exception): " . $mail->ErrorInfo . " to: " . $email . " from generateMail.php using " . $gmail);
          $res = ['type' => 'error', 'message' => 'メールの送信に失敗しました。: ' . $mail->ErrorInfo];
        }
      } catch (PHPMailerException $e) {
        error_log("PHPMailer Exception: " . $e->errorMessage() . " to: " . $email . " from generateMail.php using " . $gmail);
        $res = ['type' => 'error', 'message' => "申し訳ありません。エラー発生によりメールを送信できませんでした。: " . $e->errorMessage()];
      } catch (Exception $e) { // PHPMailer以外の予期せぬエラー
        error_log("General Exception during mail sending: " . $e->getMessage() . " to: " . $email . " from generateMail.php using " . $gmail);
        $res = ['type' => 'error', 'message' => "メール送信処理中に予期せぬエラーが発生しました。: " . $e->getMessage()];
      }
    }
  }
} catch (PDOException $e) { // データベースエラー処理
  http_response_code(500); // 500 Internal Server Error
  $res = ['type' => 'error', 'message' => 'データベース処理中にエラーが発生しました。', 'detail' => $e->getMessage()];
  if (isset($connection) && $connection->inTransaction()) { // DB接続が確立している場合、トランザクションが開いていればロールバック試行
    $connection->rollBack();
    error_log("Transaction rolled back due to PDOException: " . $e->getMessage());
  }
} catch (Exception $e) { // その他のエラー処理
  $statusCode = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
  http_response_code($statusCode);
  $res = ['type' => ($statusCode >= 500 ? 'error' : 'fail'), 'message' => $e->getMessage()];
  if (isset($connection) && $connection->inTransaction()) { // DB接続が確立している場合、トランザクションが開いていればロールバック試行
    $connection->rollBack();
    error_log("Transaction rolled back due to Exception: " . $e->getMessage());
  }
}

header('Content-Type: application/json;charset=utf-8'); // レスポンス返却
echo json_encode($res);

exit;
