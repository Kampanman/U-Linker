<?php
include('../db.php');
include('../functions.php');
include('../properties.php');
session_start();

$res = ['type' => 'success', 'list' => []];
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
  $ownerId = $_POST['owner_id'] ?? null;
  $isTeacher = (int) $_POST['is_teacher'] ?? null;

  if ($requestType === 'getRelateNoteList') { // type: 'getRelateNoteList' の場合
    if (!isset($_POST['keyword']) || !isset($ownerId) || !isset($_POST['list'])) {
      throw new Exception('getRelateNoteList に必要なパラメータ (keyword, owner_id, list) が不足しています。', 400);
    }

    $keyword = $_POST['keyword'];
    $searchListJson = $_POST['list'];
    $searchList = json_decode($searchListJson, true); // listパラメータをデコード（trueで連想配列ではなく通常の配列にする）
    if (json_last_error() !== JSON_ERROR_NONE || !is_array($searchList)) throw new Exception('listパラメータの形式が不正です。JSON配列形式で指定してください。', 400);
    $foundItems = []; // 結果を一時的に格納する配列 (重複排除用)
    $needsDbSearch = false;

    // CSVファイル検索
    foreach ($searchList as $item) {
      if (is_string($item) && str_ends_with(strtolower($item), '.csv')) { // 要素が文字列で、末尾が ".csv" (大文字小文字区別なし) かを判定
        $csvFileName = basename($item);
        if (strpos($csvFileName, '/') !== false || strpos($csvFileName, '\\') !== false || strpos($csvFileName, '..') !== false) {
          throw new Exception("不正なCSVファイル名が指定されました: " . $item, 400);
        }
        $csvFilePath = BASEDIR . '/storage/csv/' . $csvFileName; // CSVファイルのフルパス

        if (!file_exists($csvFilePath)) { // CSVファイルが存在するか確認
          error_log("Warning: Specified CSV file not found in getRelateNoteList: " . $csvFilePath);
          continue; // 次のアイテムへ
        }

        $handle = fopen($csvFilePath, 'r'); // ファイルを開く (読み込みモード)
        if ($handle === false) {
          error_log("Warning: Could not open CSV file: " . $csvFilePath);
          continue; // ファイルは存在するが開けない場合(パーミッション等)は次のアイテムへ
        }
        fgets($handle); // ヘッダー行を読み飛ばす (2行目から処理するため)

        // 行ごとに読み込んで処理する
        while (($row = fgetcsv($handle)) !== false) {
          if (count($row) >= 11 && isset($row[0], $row[1], $row[5], $row[10])) {
            $contentId = $row[0];
            $title = $row[1];
            $publicity = $row[5];
            $createdUserId = $row[10];

            // 検索対象レコードの条件に、publicity=1、またはcreated_user_id=$ownerIdであるものを追加
            if (($publicity == 1 || $createdUserId == $ownerId) && mb_stripos($title, $keyword) !== false) {
              if (!isset($foundItems[$contentId])) {
              $foundItems[$contentId] = [
                'contentsId' => $contentId,
                'title' => $title,
                'common_word' => ''
              ];
              }
            }
          }
        }
        fclose($handle); // ファイルを閉じる

      } else {
        $needsDbSearch = true; // リスト内にCSVファイル名でない要素が見つかった場合、DB検索フラグを立てる
      }
    }

    // データベース検索
    if ($needsDbSearch) { // リスト内にCSVファイル名でない要素が含まれていた場合に実行
      $dbKeyword = '%' . $keyword . '%'; // LIKE検索用にキーワードをエスケープし、%で囲む

      $noteSql = "SELECT `contents_id`, `title` FROM " . NOTE_TABLE .
        " WHERE `title` LIKE :keyword" .
        " AND (`created_user_id` = :owner_id OR `publicity` = 1)";

      $stmt = $connection->prepare($noteSql);
      $stmt->bindValue(':keyword', $dbKeyword, PDO::PARAM_STR);
      $stmt->bindValue(':owner_id', $ownerId);
      $stmt->execute();
      $notes = $stmt->fetchAll(PDO::FETCH_ASSOC);

      // 取得したノートを結果配列に追加
      foreach ($notes as $note) {
        $contentId = $note['contents_id'];
        if (!isset($foundItems[$contentId])) { // 重複チェック (contentsIdをキーにする)
          $foundItems[$contentId] = [
            'contentsId' => $contentId,
            'title' => $note['title'],
            'common_word' => ''
          ];
        }
      }
    }
    $res['list'] = array_values($foundItems); // 連想配列から値のみを取り出し、通常の配列に変換してレスポンスに格納
    if (empty($res['list'])) $res['message'] = '関連するノートが見つかりませんでした。'; // 結果が空の場合のメッセージ設定

  }
  
  elseif ($requestType === 'search') { // type: 'search' の場合
    $keyword = trim($_POST['keyword']);
    $excludeWord = isset($_POST['excludeWord']) && trim($_POST['excludeWord']) !== '' ? trim($_POST['excludeWord']) : null;
    $includeFor = isset($_POST['includeFor']) ? (int)$_POST['includeFor'] : 0; // 0: title/name, 1: content/tags/note
    $andOr = isset($_POST['andOr']) ? (int)$_POST['andOr'] : 0; // 0: AND, 1: OR
    $createdBy = isset($_POST['createdBy']) && trim($_POST['createdBy']) !== '' ? trim($_POST['createdBy']) : null;
    $startDate = isset($_POST['startDate']) && trim($_POST['startDate']) !== '' ? $_POST['startDate'] : null;
    $endDate = isset($_POST['endDate']) && trim($_POST['endDate']) !== '' ? $_POST['endDate'] : null;
    $limitNum = (int)$_POST['limitNum'];
    $selectedDBJson = $_POST['selectedDB'];
    $selectedDB = json_decode($selectedDBJson, true); // listパラメータをデコード（trueで連想配列ではなく通常の配列にする）
    if (json_last_error() !== JSON_ERROR_NONE || !is_array($selectedDB)) throw new Exception('listパラメータの形式が不正です。JSON配列形式で指定してください。', 400);
    $currentOwnerId = $_POST['owner_id']; // 検索実行ユーザーのID
    if ($limitNum <= 0) throw new Exception('limitNum は1以上の整数である必要があります。', 400);

    $createdById = null;
    if ($createdBy) {
      try {
        $sql = "SELECT owner_id FROM " . ACCOUNT_TABLE . " WHERE name = :name";
        $stmt = $connection->prepare($sql);
        $stmt->bindValue(':name', $createdBy);
        $stmt->execute();
        $fetch = $stmt->fetch(PDO::FETCH_ASSOC);
        if($fetch!=false) $createdById = $fetch['owner_id'];
      } catch (PDOException $e) {
        error_log("Error fetching owner_id for name '{$createdBy}' from table " . ACCOUNT_TABLE . ": " . $e->getMessage());
        return null;
      }
    }

    $searchParams = [
      'keyword' => $keyword,
      'excludeWord' => $excludeWord,
      'includeFor' => $includeFor,
      'andOr' => $andOr,
      'createdBy' => $createdBy, // createdById を渡すために name も保持 (関数内で使用)
      'createdById' => $createdById, // 変換後のID
      'startDate' => $startDate,
      'endDate' => $endDate,
      'currentOwnerId' => $currentOwnerId,
      'isTeacher' => $isTeacher,
    ];

    $res['list'] = ['notes' => [], 'videos' => []]; // レスポンス初期化
    $foundNoteCount = 0;
    $foundVideoCount = 0;
    $debugSqlList = []; // デバッグ用SQL格納配列 (不要なら削除可)

    // 検索対象がCSVかDBかを判定
    $containsCsv = false;
    $containsDb = false;
    $csvFilesToSearch = [];
    $dbTablesToSearch = [];

    // $selectedDB の内容を判定
    foreach ($selectedDB as $dbSource) {
      if (is_string($dbSource) && str_ends_with(strtolower($dbSource), '.csv')) {
        $containsCsv = true;
        $csvFilesToSearch[] = $dbSource;
      } elseif ($dbSource === NOTE_TABLE || $dbSource === VIDEO_TABLE) {
        $containsDb = true;
        $dbTablesToSearch[] = $dbSource;
      } else {
        throw new Exception("不明なデータソースが指定されました: " . $dbSource, 400);
      }
    }

    if ($containsDb) { // DB検索が必要な場合 (DBのみ、またはDB+CSV)
      foreach ($dbTablesToSearch as $tableName) {
        if ($tableName === NOTE_TABLE && $foundNoteCount < $limitNum) {
          // searchDatabaseTable は成功/失敗を示す boolean を返すか、例外を投げることを想定
          try {
            searchDatabaseTable(
              $connection,
              $tableName,
              $searchParams,
              $limitNum, // DB検索時点での上限
              $foundNoteCount, // 参照渡しで更新される
              $res['list']['notes'], // 参照渡しで結果が追加される
              $debugSqlList
            );
          } catch (Exception $e) {
            error_log("Error during database search for $tableName: " . $e->getMessage());
          }
        } elseif ($tableName === VIDEO_TABLE && $foundVideoCount < $limitNum) {
          try {
            searchDatabaseTable(
              $connection,
              $tableName,
              $searchParams,
              $limitNum, // DB検索時点での上限
              $foundVideoCount, // 参照渡しで更新される
              $res['list']['videos'], // 参照渡しで結果が追加される
              $debugSqlList
            );
          } catch (Exception $e) {
            error_log("Error during database search for $tableName: " . $e->getMessage());
          }
        }
      }
    }

    if ($containsCsv) { // CSV検索が必要な場合 (CSVのみ、またはDB+CSV)
      // DB検索後でも、上限に達していない場合はCSVを検索する
      if ($foundNoteCount < $limitNum || $foundVideoCount < $limitNum) {
        try {
          searchCsvFiles(
            $csvFilesToSearch, // 検索対象CSVファイルリスト
            $searchParams,     // 検索条件
            $limitNum,         // 上限数 (関数内でノート/ビデオそれぞれの上限をチェック)
            $foundNoteCount,   // ノート件数 (参照渡しで更新)
            $foundVideoCount,  // ビデオ件数 (参照渡しで更新)
            $res['list']['notes'], // ノート結果配列 (参照渡しで追加)
            $res['list']['videos'] // ビデオ結果配列 (参照渡しで追加)
          );
        } catch (Exception $e) {
          error_log("Error during csv searching: " . $e->getMessage());
        }
      }
    }

    // デバッグ情報
    if (!empty($debugSqlList)) $res['debug'] = $debugSqlList; // SQLが実行された場合のみ追加

    // 最終的な件数チェックとメッセージ設定
    if ($foundNoteCount === 0 && $foundVideoCount === 0) {
      $res['message'] = '検索条件に一致するデータが見つかりませんでした。';
    } else {
      unset($res['message']); // 結果が存在する場合はメッセージを削除

      // 最終的に上限数で切り詰める
      $res['list']['notes'] = array_slice($res['list']['notes'], 0, $limitNum);
      $res['list']['videos'] = array_slice($res['list']['videos'], 0, $limitNum);
    }

    http_response_code(200); // 検索処理完了 (結果の有無に関わらず)
  }

  elseif($requestType === 'setPageToken') { // type: 'setPageToken' の場合
    $_SESSION['page_token'] = $_POST['token'];
    $_SESSION['selected_note_id'] = $_POST['contents_id'];
    $_SESSION['selected_note_title'] = $_POST['title'];
    $_SESSION['selected_note_text'] = $_POST['text'];
    $res['view_url'] = DOMAIN.'/'.CONTENTS_NAME.'/pages/secondHand.php?page_token=' . $_POST['token'];

    http_response_code(200); // 検索処理完了 (結果の有無に関わらず)
} else {
  throw new Exception('不明なリクエストタイプです。', 400); // 不明なリクエストタイプ (変更なし)
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

// レスポンス返却
header('Content-Type: application/json;charset=utf-8');
echo json_encode($res);

exit;
