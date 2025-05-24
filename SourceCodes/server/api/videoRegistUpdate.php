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
    // tokenが設定されており、その値が半角英数字16桁の場合にアカウント登録処理に移行する
    if (isset($_POST["token"]) && isAlphanumeric16($_POST["token"])) {
      // クライアント側から取得してきたパラメータを定義
      $title = h($_POST["title"]);
      $url = $_POST["url"];
      $tags = ($_POST["tags"] === "") ? null : h($_POST["tags"]); // 空文字の場合はNULLに変換
      $publicity = $_POST["publicity"];
      $owner_id = $_POST["owner_id"];

      // 新規登録レコードのcontents_idに格納する数値を設定
      $contents_id = getCurrentDateTimeWithMilliseconds();

      // 初期レスポンス
      $res = ['type' => 'fail', 'message' => ''];

      // 新規登録処理
      $insertSql = "INSERT INTO " . VIDEO_TABLE . " ("
        . "contents_id, title, url, tags, publicity, created_at, updated_at, created_user_id"
        . ") VALUES ("
        . ":contents_id, :title, :url, :tags, :publicity, NOW(), NOW(), :created_user_id"
        . ")";
      $stmt = $connection->prepare($insertSql);

      
      $connection->beginTransaction(); // トランザクション開始

      // レコード挿入
      if ($stmt->execute([
        ':contents_id' => $contents_id,
        ':title' => $title,
        ':url' => $url,
        ':tags' => $tags, // NULLまたはタグ文字列が渡される
        ':publicity' => $publicity,
        ':created_user_id' => $owner_id,
      ])) { // コミット
        $connection->commit();
        $res = ['type' => 'success', 'owner_id' => $owner_id, 'message' => 'ビデオ登録を完了'];

        // 新規登録成功時のレスポンス設定
        http_response_code(201); // Created
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($res);
        exit;
      } else { // ロールバック
        $connection->rollBack();
        throw new Exception("登録処理に失敗しました");
      }
    }
  } else if (isset($_POST["type"]) && $_POST["type"] == 'update') { // 更新の場合
    // tokenが設定されており、その値が半角英数字16桁の場合にアカウント更新処理に移行する
    if (isset($_POST["token"]) && isAlphanumeric16($_POST["token"]) && isset($_POST["contents_id"])) {
      // クライアント側から取得してきたパラメータを定義
      $contents_id = $_POST["contents_id"];
      $title = h($_POST["title"]);
      $url = $_POST["url"];
      $tags = ($_POST["tags"] === "") ? null : h($_POST["tags"]); // 空文字の場合はNULLに変換
      $publicity = $_POST["publicity"];
      $owner_id = $_POST["owner_id"];

      // 初期レスポンス
      $res = ['type' => 'fail', 'message' => ''];
      http_response_code(400); // デフォルトはBad Request

      // 更新処理SQL
      $updateSql = "UPDATE " . VIDEO_TABLE . " SET "
        . "title=:title, url=:url, tags=:tags, publicity=:publicity, updated_at=NOW()";

      $params = [
        ':contents_id' => $contents_id,
        ':title' => $title,
        ':url' => $url,
        ':tags' => $tags, // NULLまたはタグ文字列が渡される
        ':publicity' => $publicity,
      ];
      $updateSql .= " WHERE contents_id = :contents_id";
      $stmt = $connection->prepare($updateSql);

      $connection->beginTransaction(); // トランザクション開始

      if ($stmt->execute($params)) {
        $connection->commit(); // コミット
        $res = ['type' => 'success', 'message' => 'ビデオ情報を更新しました。'];

        // 更新成功時のレスポンス設定
        http_response_code(200);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($res);
        exit;
      } else { // SQL実行自体が失敗した場合
        $connection->rollBack();
        throw new Exception("ビデオ情報の更新処理中にエラーが発生しました。");
      }
    } else { // トークンやuserIdがない場合
        $res['message'] = '不正なリクエストまたはパラメータが不足しています。';
        http_response_code(400);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($res);
        exit;
    }
  } else if (isset($_POST["type"]) && $_POST["type"] == 'delete') {
    // tokenとcontents_idが存在し、tokenが正しい形式かチェック
    if (isset($_POST["token"]) && isAlphanumeric16($_POST["token"]) && isset($_POST["contents_id"]) && isset($_POST["createdUserId"])) {
      $contents_id = $_POST["contents_id"];
      $owner_id = $_POST["createdUserId"];

      // 初期レスポンス (このブロック内でのデフォルト)
      $res = ['type' => 'fail', 'message' => 'ビデオの削除に失敗しました。'];
      http_response_code(400); // デフォルトはBad Request

      // 削除処理SQL
      $deleteSql = "DELETE FROM " . VIDEO_TABLE . " WHERE contents_id = :contents_id AND created_user_id = :owner_id";
      $stmt = $connection->prepare($deleteSql);

      $connection->beginTransaction(); // トランザクション開始

      try {
        if ($stmt->execute([':contents_id' => $contents_id, ':owner_id' => $owner_id])) {
          if ($stmt->rowCount() > 0) { // 削除された行数をチェック
            $connection->commit(); // 成功した場合：コミット
            $res = ['type' => 'success', 'message' => 'ビデオを削除しました。'];
            http_response_code(200); // OK (削除成功)
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode($res);
            exit;
          } else {
            $connection->rollBack(); // 対象のレコードが見つからなかった場合：ロールバック
            $res = ['type' => 'fail', 'message' => '削除対象のビデオが見つかりませんでした。'];
            http_response_code(404); // Not Found
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode($res);
            exit;
          }
        } else {
          $connection->rollBack(); // SQL実行自体が失敗した場合：ロールバックして例外をスロー
          throw new Exception("ビデオ削除処理のSQL実行に失敗しました。");
        }
      } catch (PDOException $e) { // トランザクション内でPDO例外が発生した場合もロールバック
        if ($connection->inTransaction()) $connection->rollBack(); // トランザクション中であればロールバック試行
        throw $e;
      } catch (Exception $e) { // トランザクション内でその他の例外が発生した場合もロールバック
        if ($connection->inTransaction()) $connection->rollBack();
        throw $e;
      }
    } else { // トークン、contents_idがない、または形式が不正な場合
      $res['message'] = '不正なリクエスト、または必要なパラメータが不足しているか、形式が正しくありません。';
      http_response_code(400); // Bad Request
      header('Content-Type: application/json; charset=utf-8');
      echo json_encode($res);
      exit;
    }
  } else {
    throw new Exception("リクエストが登録・更新・削除いずれの処理にも該当しませんでした");
  }

} catch (PDOException $e) { // データベース関連のエラーの場合
  // トランザクションが開いている可能性があるのでロールバックを試みる
  if (isset($connection) && $connection->inTransaction()) $connection->rollBack();
  http_response_code(500);
  $errorResponse = [ 'type' => 'error', 'message' => 'データベースエラーが発生しました。', 'detail' => $e->getMessage() ];
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode($errorResponse);
  exit;

} catch (Exception $e) { // その他のエラーの場合
  if (isset($connection) && $connection->inTransaction()) $connection->rollBack();
  http_response_code(500);
  $errorResponse = [ 'type' => 'error', 'message' => 'サーバーエラーが発生しました。', 'detail' => $e->getMessage() ];
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode($errorResponse);
  exit;
}
