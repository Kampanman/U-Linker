<?php
// BASEDIR が定義されていない場合は定義する
// if (!defined('BASEDIR')) define('BASEDIR', dirname(__DIR__)); // functions.phpはserverディレクトリにある

// HTMLエスケープ処理を行う（但し文字列中の'&'が特定のカスタムエンティティの一部である場合はエスケープしない）
function h($var)
{
  if (is_array($var)) { // 配列の場合は各要素に対して再帰的にこの関数を適用する
    return array_map('h', $var);
  } elseif (is_string($var)) { // 文字列の場合のみカスタムエスケープ処理を行う
    // JavaScript側でエスケープされた可能性のあるエンティティのリスト
    $allowed_entities = ['#39;', 'quot;', 'com;', 'amp;', 'lt;', 'gt;', 'nbsp;', 'yen;', 'copy;'];
    // & の後に許可されたエンティティが続く場合 (&(?:#39;|quot;|...);)、または、エスケープが必要な文字 (&, <, >, ", ')
    $pattern = '/&(' . implode('|', array_map('preg_quote', $allowed_entities, ['/'])) . ')|[&<>"\''.']/u';

    return preg_replace_callback(
      $pattern,
      function ($matches) {
        // $matches[0] にはマッチした文字列全体が入る
        // $matches[1] には、許可されたエンティティ部分 (#39;, quot; など) が入る (もし & + 許可エンティティ にマッチした場合)
        if (isset($matches[1])) { // マッチしたのが許可されたエンティティ (& + $matches[1]) の場合
          // これはJavaScript側でエスケープされたものなので、そのまま返す
          return $matches[0];
        } else { // マッチしたのが単独の'&'または'<','>','"',"'"の場合
          switch ($matches[0]) {
            case '&':
            return '&amp;'; // 単独の'&'は'&amp;'にエスケープ
            case '<':
            return '&lt;';
            case '>':
            return '&gt;';
            case '"':
            return '&quot;'; // ダブルクォートをエスケープ
            case "'":
            return '&#039;'; // シングルクォートをエスケープ (htmlspecialchars の ENT_QUOTES 相当)
            default:
            return $matches[0];
          }
        }
      },
      $var
    );
  } else { // 文字列でも配列でもない場合はそのまま返す
    return $var;
  }
}

// パスワードのハッシュ化
function hashpass($pass): string
{
  $options = array('cost' => 10); // ハッシュ処理の計算コストを指定する
  return password_hash($pass, PASSWORD_DEFAULT, $options); // 方式にPASSWORD_DEFAULTを指定してハッシュ化したパスワードを返す
}

// 現在の日時を西暦年、月、日、時、分、秒（小数点以下2桁）の形式で取得して16桁の数値で返す
function getCurrentDateTimeWithMilliseconds(): string
{
  $microtime = microtime(true); // 現在のタイムスタンプを取得（マイクロ秒を含む）
  $seconds = floor($microtime); // 秒部分を整数として取得
  $milliseconds = round(($microtime - $seconds) * 100); // マイクロ秒部分を小数点以下として取得
  $dateTime = date('YmdHis', $seconds); // 現在の日時をフォーマット（秒は整数）
  $formattedDateTime = $dateTime . sprintf('%02d', $milliseconds); // 秒に小数点以下2桁を追加
  return $formattedDateTime;
}

// 指定された文字列が半角英数字16文字であるかどうかを判定する
function isAlphanumeric16(string $str): bool
{
  if (strlen($str) !== 16) return false; // 文字列の長さが16文字であるかどうかを確認
  if (!ctype_alnum($str)) return false; // 文字列が半角英数字のみで構成されているかを確認
  return true; // 上記のチェックをすべて通過した場合、半角英数字16文字であるためtrueを返す
}

// 引数に指定した数値の分だけランダムな半角英数字を付け足した文字列を返す
function generateRandomAlphanumericString(int $length): string
{
  if (!is_int($length) || $length <= 0) throw new InvalidArgumentException('lengthは正の整数である必要があります。');
  $characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  $result = '';
  for ($i = 0; $i < $length; $i++) {
    $result .= $characters[random_int(0, strlen($characters) - 1)];
  }
  return $result;
}

// 指定されたテキストがキーワード条件（AND/OR）に一致するか判定する
function matchesKeyword(string $text, string $keyword, int $andOr): bool {
  if (empty(trim($keyword))) return true; // キーワードが空なら常にtrue
  $keywords = explode(' ', $keyword);
  $keywords = array_filter($keywords, 'strlen'); // 空の要素を除去
  if (empty($keywords)) return true; // スペースのみの場合もtrue
  if ($andOr === 0) { // AND検索
    foreach ($keywords as $kw) {
      if (mb_stripos($text, $kw) === false) return false; // 一つでも含まれなければfalse
    }
    return true; // すべて含まれていればtrue
  } else { // OR検索
    foreach ($keywords as $kw) {
      if (mb_stripos($text, $kw) !== false) return true; // 一つでも含まれていればtrue
    }
    return false; // 一つも含まれなければfalse
  }
}

// 指定された日付文字列が、指定された期間内にあるか判定する
function isDateInRange(?string $dateStr, ?string $startDate, ?string $endDate): bool {
  if (!$dateStr) return false; // 比較対象の日付がない

  try {
    $targetDate = new DateTime($dateStr);
    $start = $startDate ? new DateTime($startDate) : null;
    $end = $endDate ? (new DateTime($endDate))->setTime(23, 59, 59) : null; // endDateはその日の終わり (23:59:59) まで含むように設定

    if ($start && $end) {
      return $targetDate >= $start && $targetDate <= $end;
    } elseif ($start) {
      return $targetDate >= $start;
    } elseif ($end) {
      return $targetDate <= $end;
    }
    return true; // $start も $end も null だが、$dateStr は存在する場合
  } catch (Exception $e) { // 日付形式が無効な場合
    error_log("Invalid date format encountered in isDateInRange: dateStr='{$dateStr}', startDate='{$startDate}', endDate='{$endDate}'");
    return false;
  }
  return false; //add this
}

// 指定されたテーブルから条件に一致するデータを検索し、結果配列に追加する
function searchDatabaseTable(
  PDO $connection,
  string $tableName,
  array $searchParams,
  int $limitNum,
  int &$foundCount,
  array &$resultsList,
  array &$debugSql = [] // デバッグ用
): bool {
    if ($foundCount >= $limitNum) return true; // すでに上限に達している場合は処理をスキップ

    $isNoteTable = ($tableName === NOTE_TABLE);
    $isVideoTable = ($tableName === VIDEO_TABLE);

    if (!$isNoteTable && !$isVideoTable) { // テーブル名がノートかビデオ以外ならエラーログを出して終了
      error_log("Invalid table name provided to searchDatabaseTable: " . $tableName);
      return false;
    }

    // 検索パラメータを展開 (null合体演算子 ?? でデフォルト値を設定)
    $keyword = trim($searchParams['keyword'] ?? '');
    $excludeWord = isset($searchParams['excludeWord']) && trim($searchParams['excludeWord']) !== '' ? trim($searchParams['excludeWord']) : null;
    $includeFor = $searchParams['includeFor'] ?? 0;
    $andOr = $searchParams['andOr'] ?? 0;
    $createdById = $searchParams['createdById'] ?? null; // 事前にIDに変換しておく
    $startDate = ($searchParams['startDate'] === 'null' || $searchParams['startDate'] === '') ? null : $searchParams['startDate']; // "null" 文字列を null に変換
    $endDate = ($searchParams['endDate'] === 'null' || $searchParams['endDate'] === '') ? null : $searchParams['endDate']; // "null" 文字列を null に変換
    $currentOwnerId = $searchParams['currentOwnerId'] ?? 0;
    $isTeacher = $searchParams['isTeacher'] ?? 0;

    // カラム名の設定
    $titleCol = 'title';
    $contentCol = $isNoteTable ? 'note' : 'tags';
    $dateCol = 'created_at';
    $userCol = 'created_user_id';
    $publicityCol = 'publicity';

    // SQLとパラメータの初期化
    $sql = "SELECT `contents_id`, `title`, `url`, `publicity`, `created_at`, `updated_at`, `created_user_id` FROM {$tableName} WHERE 1=1 ";
    $params = array();

    // $isNoteTable が true ならば、`url_sub` カラムも取得対象とする
    if ($isNoteTable) {
      $sql = "SELECT `contents_id`, `title`, `url`, `url_sub`, `publicity`, `created_at`, `updated_at`, `created_user_id` FROM {$tableName} WHERE 1=1 ";
    }

    // 公開設定条件
    $publicityConditions = '';
    $publicityParams = array();
    if ($currentOwnerId == 0) { // 未ログインの場合: 公開のみ
      $publicityConditions = " AND {$publicityCol} = 1";
    } else { // ログインしている場合
      if ($isTeacher == 1) { // 教師の場合: 公開、教師限定、自分の投稿
        $publicityConditions = " AND ({$publicityCol} = 1 OR {$publicityCol} = 2 OR {$userCol} = :currentOwnerId)";
        $publicityParams[':currentOwnerId'] = $currentOwnerId;
      } else { // 一般ユーザーの場合: 公開、自分の投稿
        $publicityConditions = " AND ({$publicityCol} = 1 OR {$userCol} = :currentOwnerId)";
        $publicityParams[':currentOwnerId'] = $currentOwnerId;
      }
    }

    // 除外キーワード条件
    if ($excludeWord) {
      $excludeTargetCol = ($includeFor === 0) ? $titleCol : $contentCol;
      // title/note/tags が NULL でないか、または LIKE 条件に一致しないレコードを対象とする
      $sql .= " AND ({$excludeTargetCol} IS NULL OR {$excludeTargetCol} NOT LIKE :excludeWord) ";
      $params[':excludeWord'] = '%' . $excludeWord . '%';
    }

    // 検索キーワード条件
    if (!empty($keyword)) {
      $keywordTargetCol = ($includeFor === 0) ? $titleCol : $contentCol;
      $keywords = array_filter(explode(' ', $keyword), 'strlen'); // スペースで区切られたキーワードを配列にする (空要素は除去)
      if (!empty($keywords)) {
        $sql .= " AND (";
        $keywordConditions = array();
        foreach ($keywords as $i => $kw) {
          $paramName = ":keyword" . $i;
          // title/note/tags が NULL でない、かつ LIKE 条件に一致するレコードを対象とする
          $keywordConditions[] = "({$keywordTargetCol} IS NOT NULL AND {$keywordTargetCol} LIKE {$paramName})";
          $params[$paramName] = '%' . $kw . '%';
        }
        $glue = ($andOr === 0) ? " AND " : " OR ";
        $sql .= implode($glue, $keywordConditions);
        $sql .= ") ";
      }
    }

    // 作成者条件
    if (isset($searchParams['createdBy']) && $searchParams['createdBy'] !== null) { // createdBy (name) が指定されているかチェック
      if ($createdById === null) { // 対応するIDが見つからなかった場合、結果が0件になる条件を追加
        $sql .= " AND 1=0 ";
      } else { // IDが見つかった場合、そのIDで絞り込む
        $sql .= " AND {$userCol} = :createdById ";
        $params[':createdById'] = $createdById;
      }
    }

    // 日付範囲条件
    $validStartDate = $startDate !== null;
    $validEndDate = $endDate !== null;

    if ($validStartDate && $validEndDate) { // 開始日・終了日 両方指定
      $sql .= " AND {$dateCol} >= :startDate AND {$dateCol} < :endDateNextDay "; // 終了日は翌日の0時より前
      $params[':startDate'] = $startDate;
      try {
        $endDateObj = new DateTime($endDate);
        $endDateObj->modify('+1 day'); // 終了日の翌日を計算
        $params[':endDateNextDay'] = $endDateObj->format('Y-m-d');
      } catch (Exception $e) {
        throw new Exception("endDate の日付形式が無効です: " . $endDate, 400); // 不正な日付形式の場合、エラーとして例外をスロー
      }
    } elseif ($validStartDate) { // 開始日のみ指定
      $sql .= " AND {$dateCol} >= :startDate ";
      $params[':startDate'] = $startDate;
    } elseif ($validEndDate) { // 終了日のみ指定
      $sql .= " AND {$dateCol} < :endDateNextDay "; // 終了日は翌日の0時より前
      try {
        $endDateObj = new DateTime($endDate);
        $endDateObj->modify('+1 day');
        $params[':endDateNextDay'] = $endDateObj->format('Y-m-d');
      } catch (Exception $e) {
        throw new Exception("endDate の日付形式が無効です: " . $endDate, 400);
      }
    }

    $sql .= $publicityConditions;
    $params = array_merge($params, $publicityParams); // 公開設定用のパラメータ (:currentOwnerId) をメインのパラメータ配列にマージ

    $currentLimit = $limitNum - $foundCount; // 現在の取得済み件数を考慮して、あと何件取得できるか計算
    if ($currentLimit <= 0) return true; // 既に上限に達している場合は検索不要
    $sql .= " ORDER BY updated_at DESC LIMIT " . (int)$currentLimit;

    // $debugSql[] = ['sql' => $sql, 'params' => $params]; // デバッグ用にSQLとパラメータを保存

    try {
      $stmt = $connection->prepare($sql);
      $stmt->execute($params);
      $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

      // 取得した結果をループで処理
      foreach ($results as $row) {
        if ($foundCount >= $limitNum) break; // ループの途中でも上限に達したら抜ける
        $row['from'] = $tableName; // どのテーブルから取得したかの情報を追加
        $resultsList[] = $row;     // 結果を格納する配列 (参照渡し) に追加
        $foundCount++;             // 見つかった件数 (参照渡し) をインクリメント
      }
      return true; // 検索処理成功

    } catch (PDOException $e) {
      // DBエラーが発生した場合、エラーログを出力して false を返す
      error_log("Database search error for table '{$tableName}': " . $e->getMessage() . " SQL: " . $sql . " Params: " . json_encode($params));
      return false; // 検索処理失敗
    }
}

// 指定されたCSVファイルリストを検索し、条件に一致するデータを結果配列に追加する
function searchCsvFiles(
  array $csvFilesToSearch,
  array $searchParams,
  int $limitNum,
  int &$foundNoteCount,
  int &$foundVideoCount,
  array &$noteResults,
  array &$videoResults
): void {
  // searchParams から必要な値を変数に展開する
  $keyword = $searchParams['keyword'];
  $excludeWord = $searchParams['excludeWord'];
  $includeFor = $searchParams['includeFor'];
  $andOr = $searchParams['andOr'];
  $createdBy = $searchParams['createdBy']; // createdById を使うのでこれは直接は使わないが、条件分岐のために保持
  $createdById = $searchParams['createdById'];
  $startDate = $searchParams['startDate'];
  $endDate = $searchParams['endDate'];
  $currentOwnerId = $searchParams['currentOwnerId']; // publicity チェックで使用

  foreach ($csvFilesToSearch as $csvSource) {
    // 各タイプの取得上限に達したら次のファイルへ (ただし、ループ全体を抜けるわけではない)

    $csvFileName = basename($csvSource);
    if (strpos($csvFileName, '/') !== false || strpos($csvFileName, '\\') !== false || strpos($csvFileName, '..') !== false) {
      throw new Exception("不正なCSVファイル名が指定されました: " . $csvSource, 400); // 不正なパス操作を防ぐ基本的なチェック
    }
    $csvFilePath = BASEDIR . '/storage/csv/' . $csvFileName;

    // ファイルタイプを判定 (ファイル名に "_notes" or "_videos" が含まれるかで判断)
    $isNoteCsv = str_contains(strtolower($csvFileName), '_notes');
    $isVideoCsv = str_contains(strtolower($csvFileName), '_videos');

    // 既に上限に達しているタイプのCSVファイルはスキップ
    if (($isNoteCsv && $foundNoteCount >= $limitNum) || ($isVideoCsv && $foundVideoCount >= $limitNum)) continue;

    if (!file_exists($csvFilePath)) {
      error_log("CSV search warning: File not found: " . $csvFilePath);
      continue; // ファイルが存在しない場合はログに残して次へ
    }

    $handle = @fopen($csvFilePath, 'r'); // エラーを抑制し、後でチェック
    if ($handle === false) {
      error_log("CSV search error: Could not open file: " . $csvFilePath);
      continue; // ファイルが開けない場合はログに残して次へ
    }

    fgets($handle); // ヘッダー行を読み飛ばす
    while (($row = fgetcsv($handle)) !== false) {
      if ($isNoteCsv && $foundNoteCount >= $limitNum) break;
      if ($isVideoCsv && $foundVideoCount >= $limitNum) break;

      $targetListKey = null; // 結果を格納する配列のキー ('notes' or 'videos')
      $currentTypeFoundCountRef = null; // 参照渡し用の一時変数
      $titleColIndex = -1;
      $contentColIndex = -1; // note or tags
      $dateColIndex = -1;    // created_at
      $userColIndex = -1;    // created_user_id
      $publicityColIndex = -1;
      $urlColIndex = -1;
      $urlSubColIndex = -1; // note のみ
      $updatedAtColIndex = -1;
      $contentsIdColIndex = 0; // 固定

      // CSVの列構造に合わせてインデックスを設定
      if ($isNoteCsv && count($row) >= 11) { // notes_*.csv の想定列数 (最低11列)
        $targetListKey = 'notes';
        $currentTypeFoundCountRef = &$foundNoteCount; // 参照を代入
        $titleColIndex = 1;
        $urlColIndex = 2;
        $urlSubColIndex = 3;
        $contentColIndex = 4; // note
        $publicityColIndex = 5;
        $dateColIndex = 8; // created_at
        $updatedAtColIndex = 9;
        $userColIndex = 10; // created_user_id
      } elseif ($isVideoCsv && count($row) >= 8) { // videos_*.csv の想定列数 (最低8列)
        $targetListKey = 'videos';
        $currentTypeFoundCountRef = &$foundVideoCount; // 参照を代入
        $titleColIndex = 1;
        $urlColIndex = 2;
        $contentColIndex = 3; // tags
        $publicityColIndex = 4;
        $dateColIndex = 5; // created_at
        $updatedAtColIndex = 6;
        $userColIndex = 7; // created_user_id
      } else {
        continue; // 想定される列数に満たない行はスキップ
      }

      // 検索条件の適用
      $contentsId = $row[$contentsIdColIndex] ?? null;
      $title = $row[$titleColIndex] ?? '';
      $content = $row[$contentColIndex] ?? ''; // note または tags
      $publicity = isset($row[$publicityColIndex]) ? (int)$row[$publicityColIndex] : 0; // 公開設定 (デフォルト非公開)
      $createdAt = $row[$dateColIndex] ?? null;
      $rowOwnerId = $row[$userColIndex] ?? null;

      // 公開設定と所有者のチェック (DB検索のWHERE句相当)
      if (!($publicity == 1 || $rowOwnerId == $currentOwnerId)) continue; // 公開されているか、自分が作成者であるデータのみを対象とする

      // 除外キーワードのチェック
      if ($excludeWord) {
        $excludeTargetText = ($includeFor === 0) ? $title : $content;
        if (mb_stripos($excludeTargetText, $excludeWord) !== false) continue;
      }

      // 検索キーワードのチェック
      $keywordTargetText = ($includeFor === 0) ? $title : $content;
      if (!matchesKeyword($keywordTargetText, $keyword, $andOr)) continue;

      // createdById が null (DBに存在しない名前) または 行の作成者IDと一致しない場合はスキップ
      if ($createdBy) if ($createdById === null || $rowOwnerId !== $createdById) continue;

      // 日付範囲のチェック
      $checkStartDate = ($startDate !== null && $startDate !== 'null');
      $checkEndDate = ($endDate !== null && $endDate !== 'null');
      if ($checkStartDate && $checkEndDate) {
        if (!isDateInRange($createdAt, $startDate, $endDate)) continue;
      } elseif ($checkStartDate) {
        if (!isDateInRange($createdAt, $startDate, null)) continue;
      } elseif ($checkEndDate) {
        if (!isDateInRange($createdAt, null, $endDate)) continue;
      }

      // 条件に一致した場合、結果を整形して追加
      $urlFromCsv = $row[$urlColIndex] ?? null;
      $urlSubFromCsv = $row[$urlSubColIndex] ?? null;
      $updatedAtFromCsv = $row[$updatedAtColIndex] ?? null;

      $rowData = [
        'contents_id' => $contentsId,
        'title' => $title,
        'url' => ($urlFromCsv === 'NULL') ? null : $urlFromCsv,
        'publicity' => $publicity,
        'created_at' => $createdAt,
        'updated_at' => ($updatedAtFromCsv === 'NULL') ? null : $updatedAtFromCsv,
        'from' => $csvFileName // どのCSVファイルから見つかったかを示す情報
      ];
      $rowData['created_user_id'] = $rowOwnerId;
      
      // $targetListKey が 'notes' の場合は 'url_sub' も追加する
      if ($targetListKey === 'notes') $rowData['url_sub'] = ($urlSubFromCsv === 'NULL') ? null : $urlSubFromCsv;

      // 対応する結果配列に追加し、カウントを増やす
      if ($targetListKey === 'notes') {
        $noteResults[] = $rowData;
        $currentTypeFoundCountRef++; // 参照先の $foundNoteCount がインクリメントされる
      } elseif ($targetListKey === 'videos') {
        $videoResults[] = $rowData;
        $currentTypeFoundCountRef++; // 参照先の $foundVideoCount がインクリメントされる
      }
    }
    fclose($handle); // ファイルを閉じる
  }
}

// エラーレスポンスを設定
function setErrorResponse(&$res, $message, $statusCode = 400) {
  $res['type'] = 'error';
  $res['message'] = $message;
  http_response_code($statusCode);
}

// CSVからレコードを取得
function getRecordFromCsv($csvFilePath, $contentsId) {
  if (!file_exists($csvFilePath) || !is_readable($csvFilePath)) return ['error' => 'CSVファイルが見つからないか、読み取り権限がありません。'];

  $fileHandle = fopen($csvFilePath, 'r');
  if ($fileHandle === false) return ['error' => 'CSVファイルを開けませんでした。'];

  $header = fgetcsv($fileHandle);
  if ($header === false) {
    fclose($fileHandle);
    return ['error' => 'CSVヘッダーの読み取りに失敗しました。'];
  }

  $contentsIdIndex = array_search('contents_id', $header);
  if ($contentsIdIndex === false) {
    fclose($fileHandle);
    return ['error' => 'CSVヘッダーに "contents_id" カラムが見つかりません。'];
  }

  $recordObject = null;
  while (($row = fgetcsv($fileHandle)) !== false) {
    if (isset($row[$contentsIdIndex]) && $row[$contentsIdIndex] === $contentsId) {
      if (count($header) === count($row)) { // ヘッダーと行データの要素数が一致するか確認
        $recordObject = array_combine($header, $row); // ヘッダーをキー、行データを値とする連想配列を作成
        foreach ($recordObject as $key => $value) { // 値が "NULL" 文字列の場合、null に変換する
          if ($value === 'NULL') $recordObject[$key] = null;
        }
      } else {
        continue;
      }
      break; // 一致する最初のレコードが見つかったらループを抜ける
    }
  }
  fclose($fileHandle);

  if ($recordObject === null) return ['error' => '指定されたcontents_idを持つレコードがCSVファイルに見つかりませんでした。'];

  return $recordObject;
}

// DBからレコードを取得
function getRecordFromDb($connection, $tableName, $contentsId) {
  try {
    $sql = "SELECT * FROM " . $tableName . " WHERE `contents_id` = :contents_id";
    $stmt = $connection->prepare($sql);
    $stmt->bindParam(':contents_id', $contentsId, PDO::PARAM_STR);
    $stmt->execute();
    $recordObject = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($recordObject === false) return ['error' => '指定されたcontents_idを持つレコードがデータベースに見つかりませんでした。'];
    return $recordObject;
  } catch (PDOException $e) {
    return ['error' => 'データベースエラーが発生しました。']; // 本番環境では詳細なエラーメッセージをログに記録するなど検討
  }
}
