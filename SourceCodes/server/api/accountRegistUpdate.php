<?php
include('../db.php');
include('../functions.php');
include('../properties.php');

// 初期レスポンスを定義（不正なリクエストの場合など）
$res = ['type' => 'fail', 'message' => '不正なリクエストです。'];
// デフォルトのHTTPステータスコード
http_response_code(400); // Bad Request

try {
  if (isset($_POST["type"]) && $_POST["type"] == 'regist') { // 新規登録の場合
    if (isset($_POST["token"]) && isAlphanumeric16($_POST["token"])) {
      // tokenが設定されており、その値が半角英数字16桁の場合にアカウント登録処理に移行する

      // クライアント側から取得してきたパラメータを定義
      $name = h($_POST["userName"]);
      $email = h($_POST["email"]);
      $hashpass = hashpass($_POST["password"]);
      $comment = h($_POST["comment"]);
      $isTeacher = $_POST["isTeacher"];
      $owner_id = getCurrentDateTimeWithMilliseconds(); // 新規登録レコードのowner_idに格納する数値を設定

      $res = ['type' => 'fail', 'message' => '']; // 初期レスポンス

      // emailの重複確認
      $judgeSql_email = "SELECT COUNT(owner_id) FROM " . ACCOUNT_TABLE . " WHERE email = :email";
      $stmt = $connection->prepare($judgeSql_email);
      $stmt->execute([':email' => $email]);
      if ($stmt->fetchColumn() > 0) {
        $res['message'] = "既に同一のメールアドレスが使われています。";
        echo json_encode($res);
        exit;
      }

      // nameの重複確認
      $judgeSql_name = "SELECT COUNT(owner_id) FROM " . ACCOUNT_TABLE . " WHERE name = :name";
      $stmt = $connection->prepare($judgeSql_name);
      $stmt->execute([':name' => $name]);
      if ($stmt->fetchColumn() > 0) {
        $res['message'] = "既に同一のユーザー名が使われています。";
        echo json_encode($res);
        exit;
      }

      // 新規登録処理
      $insertSql = "INSERT INTO " . ACCOUNT_TABLE . " ("
        . "owner_id, name, email, password, is_master, is_teacher, token, token_limit, comment, is_stopped, created_at, updated_at, updated_user_id"
        . ") VALUES ("
        . ":owner_id, :name, :email, :password, 0, :is_teacher, NULL, NULL, :comment, 0, NOW(), NOW(), :updated_user_id"
        . ")";
      $stmt = $connection->prepare($insertSql);

      $connection->beginTransaction(); // トランザクション開始

      // レコード挿入
      if ($stmt->execute([
        ':owner_id' => $owner_id,
        ':name' => $name,
        ':email' => $email,
        ':password' => $hashpass,
        ':is_teacher' => $isTeacher,
        ':comment' => $comment,
        ':updated_user_id' => $owner_id,
      ])) {
        $connection->commit(); // コミット
        $res = ['type' => 'success', 'owner_id' => $owner_id, 'message' => 'ユーザー登録を完了'];

        // 新規登録成功時のレスポンス設定
        http_response_code(201); // Created
        header('Content-Type: application/json; charset=utf-8'); // ヘッダー設定
        echo json_encode($res);

        exit;
      } else { // ロールバック
        $connection->rollBack();
        throw new Exception("登録処理に失敗しました");
      }
    }
  } else if (isset($_POST["type"]) && $_POST["type"] == 'update') {
    // 更新の場合

    if (isset($_POST["token"]) && isAlphanumeric16($_POST["token"]) && isset($_POST["userId"])) {
      // tokenが設定されており、その値が半角英数字16桁の場合にアカウント更新処理に移行する

      // クライアント側から取得してきたパラメータを定義
      $owner_id = $_POST["userId"];
      $name = h($_POST["userName"]);
      $email = h($_POST["email"]);
      $password = $_POST["password"] ?? null; // パスワードは入力がある場合のみ更新する
      $comment = h($_POST["comment"]);
      $isTeacher = $_POST["isTeacher"];
      $updated_user_id = $owner_id;

      // 初期レスポンス
      $res = ['type' => 'fail', 'message' => ''];
      http_response_code(400); // デフォルトはBad Request

      // emailの重複確認 (自分自身を除く)
      $judgeSql_email = "SELECT COUNT(owner_id) FROM " . ACCOUNT_TABLE . " WHERE email = :email AND owner_id != :owner_id";
      $stmt = $connection->prepare($judgeSql_email);
      $stmt->execute([':email' => $email, ':owner_id' => $owner_id]);
      if ($stmt->fetchColumn() > 0) {
        $res['message'] = "既に同一のメールアドレスが他のユーザーに使われています。";
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($res);
        exit;
      }

      // nameの重複確認 (自分自身を除く)
      $judgeSql_name = "SELECT COUNT(owner_id) FROM " . ACCOUNT_TABLE . " WHERE name = :name AND owner_id != :owner_id";
      $stmt = $connection->prepare($judgeSql_name);
      $stmt->execute([':name' => $name, ':owner_id' => $owner_id]);
      if ($stmt->fetchColumn() > 0) {
        $res['message'] = "既に同一のユーザー名が他のユーザーに使われています。";
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($res);
        exit;
      }

      // 更新処理SQL (パスワードは入力がある場合のみ更新)
      $updateSql = "UPDATE " . ACCOUNT_TABLE . " SET "
        . "name = :name, email = :email, is_teacher = :is_teacher, comment = :comment, updated_at = NOW(), updated_user_id = :updated_user_id";

      $params = [
        ':name' => $name,
        ':email' => $email,
        ':is_teacher' => $isTeacher,
        ':comment' => $comment,
        ':updated_user_id' => $updated_user_id,
        ':owner_id' => $owner_id
      ];
      if (!empty($password)) { // パスワードが入力されていれば、ハッシュ化してUPDATE文に追加
        $hashpass = hashpass($password);
        $updateSql .= ", password = :password";
        $params[':password'] = $hashpass;
      }
      $updateSql .= " WHERE owner_id = :owner_id";
      $stmt = $connection->prepare($updateSql);

      $connection->beginTransaction(); // トランザクション開始

      // レコード更新
      if ($stmt->execute($params)) {
        if ($stmt->rowCount() > 0) { // 更新された行数をチェック
          $connection->commit(); // コミット
          $res = ['type' => 'success', 'message' => 'ユーザー情報を更新しました。'];
          http_response_code(200);
        } else { // 対象のユーザーが見つからない、または更新内容が既存データと同じ場合
          $connection->rollBack();
          $res = ['type' => 'fail', 'message' => '更新対象のユーザーが見つからないか、情報が変更されていません。'];
          http_response_code(404);
        }
      } else {
        $connection->rollBack(); // ロールバック
        throw new Exception("更新処理に失敗しました");
      }
    } else { // トークンやuserIdがない場合
      $res['message'] = '不正なリクエストまたはパラメータが不足しています。';
      http_response_code(400);
    }
  } else if (isset($_POST["type"]) && $_POST["type"] == 'changeStatus') {
    // ステータス変更の場合

    // token, userId, isStop が存在し、tokenが正しい形式か、isStopが0か1かチェック
    if (
      isset($_POST["token"]) && isAlphanumeric16($_POST["token"]) &&
      isset($_POST["userId"]) &&
      isset($_POST["isStop"]) && ($_POST["isStop"] === '0' || $_POST["isStop"] === '1')
    ) {
      $owner_id = $_POST["userId"];
      $is_stopped = (int)$_POST["isStop"];
      $updated_user_id = $owner_id;

      // 初期レスポンス (このブロック内でのデフォルト)
      $res = ['type' => 'fail', 'message' => 'ステータス変更処理に失敗しました。'];
      http_response_code(400);

      // 更新処理SQL
      $updateSql = "UPDATE " . ACCOUNT_TABLE . " SET "
                    . "is_stopped = :is_stopped, updated_at = NOW(), updated_user_id = :updated_user_id "
                    . "WHERE owner_id = :owner_id";
      $params = [
        ':is_stopped' => $is_stopped,
        ':updated_user_id' => $updated_user_id,
        ':owner_id' => $owner_id
      ];
      $stmt = $connection->prepare($updateSql);

      $connection->beginTransaction(); // トランザクション開始

      try { // レコード更新
        if ($stmt->execute($params)) { // 更新された行数をチェック
          if ($stmt->rowCount() > 0) { // コミット
            $connection->commit();
            $status_message = $is_stopped === 1 ? '停止' : '有効';
            $res = ['type' => 'success', 'message' => 'アカウントのステータスを「' . $status_message . '」に変更しました。'];
            http_response_code(200);
          } else { // 対象のユーザーが見つからない、またはステータスが既に同じ値だった場合
            $connection->rollBack();
            $res = ['type' => 'fail', 'message' => '更新対象のユーザーが見つからないか、ステータスが既に指定された状態です。'];
            http_response_code(404); // Not Found or No Change
          }
        } else { // SQL実行自体が失敗した場合
          $connection->rollBack();
          throw new Exception("ステータス更新SQLの実行に失敗しました。"); // エラー情報は $stmt->errorInfo() などで取得できる場合がある
        }
      } catch (PDOException $e) { // トランザクション内でPDO例外が発生した場合もロールバックを試みる
        if ($connection->inTransaction()) $connection->rollBack();
        throw $e; // 例外を再スローして外側のcatchブロックで処理させる
      } catch (Exception $e) { // トランザクション内でその他の例外が発生した場合もロールバックを試みる
        if ($connection->inTransaction()) $connection->rollBack();
        throw $e; // 例外を再スローして外側のcatchブロックで処理させる
      }
    } else { // トークン、userId、isStopがない、または形式が不正な場合
      $res['message'] = '不正なリクエスト、または必要なパラメータが不足しているか、形式が正しくありません。';
      http_response_code(400); // Bad Request
    }
  } else if (isset($_POST["type"]) && $_POST["type"] == 'resetPass') {
    // パスワード再設定の場合

    if (
      isset($_POST["token"]) && isAlphanumeric16($_POST["token"]) &&
      isset($_POST["password"]) &&
      isset($_POST["accountToken"])
    ) { // password, accountToken, tokenが存在し、tokenが正しい形式か
      $password = $_POST["password"];
      $accountToken = $_POST["accountToken"];

      // 初期レスポンス
      $res = ['type' => 'fail', 'message' => 'パスワードの再設定に失敗しました。'];
      http_response_code(400); // デフォルトはBad Request

      $connection->beginTransaction(); // トランザクション開始
      try {
        // トークンでアカウントを検索
        $sql = "SELECT `owner_id`, `token_limit` FROM " . ACCOUNT_TABLE . " WHERE `token` = :accountToken";
        $stmt = $connection->prepare($sql);
        $stmt->bindValue(':accountToken', $accountToken, PDO::PARAM_STR);
        $stmt->execute();
        $account = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$account) {
          $res['message'] = '無効なトークンです。パスワード再設定リンクを再発行してください。';
          http_response_code(400);
        } else {
          // トークンの有効期限をチェック
          $tokenLimitTime = strtotime($account['token_limit']);
          $currentTime = time();

          if ($tokenLimitTime < $currentTime) {
            $res['message'] = 'パスワード再設定の有効期限が切れています。再度手続きを行ってください。';
            http_response_code(400);
          } else {
            // パスワードを更新し、トークンを無効化
            $hashpass = hashpass($password);
            $updateSql = "UPDATE " . ACCOUNT_TABLE . " SET `password` = :password, `token` = NULL, `token_limit` = NULL, `updated_at` = NOW() WHERE `owner_id` = :owner_id";
            $updateStmt = $connection->prepare($updateSql);
            $updateStmt->bindValue(':password', $hashpass, PDO::PARAM_STR);
            $updateStmt->bindValue(':owner_id', $account['owner_id'], PDO::PARAM_STR);

            if ($updateStmt->execute()) {
              $connection->commit();
              $res = ['type' => 'success', 'message' => 'パスワードが正常に再設定されました。'];
              http_response_code(200);
            } else {
              throw new Exception("パスワード更新処理に失敗しました。");
            }
          }
        }
      } catch (Exception $e) { // トランザクション内で例外が発生した場合もロールバック
        if ($connection->inTransaction()) $connection->rollBack();
        throw $e; // 例外を再スローして外側のcatchブロックで処理させる
      }
    } else { // リクエストパラメータのいずれかがない、または形式が不正な場合
      $res['message'] = '不正なリクエスト、または必要なパラメータが不足しているか、形式が正しくありません。';
      http_response_code(400); // Bad Request
    }
  } else {
    throw new Exception("リクエストが登録・更新いずれの処理にも該当しませんでした");
  }

  echo json_encode($res); // リクエスト先とapi直接アクセス時の画面にはこの値を返す
} catch (PDOException $e) { // データベース関連のエラーの場合
  $connection->rollBack();
  http_response_code(500);
  $errorResponse = [ 'type' => 'error', 'message' => 'データベースエラーが発生しました。', 'detail' => $e->getMessage() ];
  header('Content-Type: application/json');
  echo json_encode($errorResponse);
  
  exit;
} catch (Exception $e) { // その他のエラーの場合
  http_response_code(500);
  $errorResponse = [ 'type' => 'error', 'message' => 'サーバーエラーが発生しました。', 'detail' => $e->getMessage() ];
  header('Content-Type: application/json');
  echo json_encode($errorResponse);
  
  exit;
}
