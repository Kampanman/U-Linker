<?php
/**
 * API: ノート・アーカイブCSV横断 キーワード該当行抽出
 * Endpoint: /SourceCodes/server/api/getKeywordLinesList.php
 */

session_start();

require_once '../properties.php';
require_once '../functions.php';

// DB接続（接続失敗時も安全にハンドリング）
$connection = null;
try {
    require_once '../db.php';
} catch (Throwable $e) {
    error_log("Database connection failed in getKeywordLinesList.php: " . $e->getMessage());
}

header('Content-Type: application/json; charset=utf-8');

// 1. ログイン認証チェック
if (!isset($_SESSION['session_string']) || $_SESSION['session_string'] === '' || !isset($_SESSION['owner_id'])) {
    http_response_code(401);
    echo json_encode([
        'status'  => 'unauthorized',
        'message' => 'ログインセッションが無効です。',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$ownerId = (int)$_SESSION['owner_id'];
$isTeacher = isset($_SESSION['is_teacher']) ? (int)$_SESSION['is_teacher'] : 0;

// 2. リクエスト受信・パース (JSON または POST)
$rawInput = file_get_contents('php://input');
$inputData = json_decode($rawInput, true);

if (!is_array($inputData)) {
    $inputData = $_POST;
}

$token   = isset($inputData['token']) ? (string)$inputData['token'] : '';
$keyword = isset($inputData['keyword']) ? (string)$inputData['keyword'] : '';
$sources = isset($inputData['sources']) && is_array($inputData['sources']) ? $inputData['sources'] : [];
$limit   = isset($inputData['limit']) ? (int)$inputData['limit'] : 50;

// 3. バリデーション
if (!isAlphanumeric16($token)) {
    http_response_code(400);
    echo json_encode([
        'status'  => 'error',
        'message' => '不正なリクエストトークンです。',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if (trim($keyword) === '') {
    http_response_code(400);
    echo json_encode([
        'status'  => 'error',
        'message' => '検索キーワードを入力してください。',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if (count($sources) < 1 || count($sources) > 4) {
    http_response_code(400);
    echo json_encode([
        'status'  => 'error',
        'message' => '検索対象ソースは1件以上4件以内で指定してください。',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!in_array($limit, [10, 50, 100, 500], true)) {
    $limit = 50;
}

// キーワード正規化（スペース区切りの先頭1ワードのみを抽出）
$splitWords = preg_split('/[\s\x{3000}]+/u', trim($keyword), 2);
$targetKeyword = $splitWords[0] ?? '';

if ($targetKeyword === '') {
    http_response_code(400);
    echo json_encode([
        'status'  => 'error',
        'message' => '検索キーワードを入力してください。',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 4. ヘルパー関数定義

/**
 * U-Linker独自エスケープおよびHTMLエンティティをデコード（アンエスケープ）
 */
function unescapeUlinkerText(string $text): string {
    $customMap = [
        '&nbsp;' => ' ',
        '&com;'  => ',',
        '&yen;'  => '\\',
        '&copy;' => '©',
    ];
    $text = str_replace(array_keys($customMap), array_values($customMap), $text);
    return htmlspecialchars_decode($text, ENT_QUOTES | ENT_HTML5);
}

/**
 * 閲覧権限判定（DB・CSV共通）
 * 1: 作成者一致、2: 公開 (1)、3: 講師かつ講師限定 (2)
 */
function canViewRecord(int $createdUserId, int $publicity, int $ownerId, int $isTeacher): bool {
    if ($createdUserId === $ownerId) {
        return true;
    }
    if ($publicity === 1) { // 1: 公開
        return true;
    }
    if ($isTeacher === 1 && $publicity === 2) { // 2: 講師にのみ公開
        return true;
    }
    return false;
}

/**
 * 本文から改行コードで分割し、検索キーワードを含む行を抽出
 * （CSV由来やエスケープ由来のリテラル文字列 '\n' も通常の改行として取り扱う）
 */
function extractMatchedLines(string $noteText, string $keyword): array {
    // 1. CSV由来等のリテラル文字列としての '\r\n', '\r', '\n' を実改行コード "\n" に置換・正規化
    $normalizedText = str_replace(['\r\n', '\r', '\n'], "\n", $noteText);

    // 2. 実改行コード（CRLF / CR / LF）で統一的に行分割（各行のインデント等は保持）
    $lines = preg_split('/\r\n|\r|\n/', $normalizedText);
    $matched = [];
    foreach ($lines as $line) {
        // 空白のみの行はスキップ
        if (trim($line) === '') {
            continue;
        }

        // 大文字小文字を区別せず部分一致検索
        if (mb_stripos($line, $keyword, 0, 'UTF-8') !== false) {
            $matched[] = $line;
        }
    }
    return $matched;
}

// 5. ソース別検索処理
$results = [];
$csvBaseDir = realpath(__DIR__ . '/../../storage/csv');
if ($csvBaseDir === false) {
    $csvBaseDir = __DIR__ . '/../../storage/csv';
}

foreach ($sources as $source) {
    if (count($results) >= $limit) {
        break;
    }

    $source = (string)$source;

    // A. DB検索 (ulinker_notes)
    if ($source === 'ulinker_notes') {
        if ($connection instanceof PDO) {
            try {
                $sql = "SELECT `contents_id`, `title`, `note`, `publicity`, `created_user_id` FROM `ulinker_notes` ORDER BY `contents_id` ASC";
                $stmt = $connection->prepare($sql);
                $stmt->execute();

                while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    if (!canViewRecord((int)$row['created_user_id'], (int)$row['publicity'], $ownerId, $isTeacher)) {
                        continue;
                    }

                    $plainTitle = unescapeUlinkerText((string)$row['title']);
                    $plainNote  = unescapeUlinkerText((string)$row['note']);
                    $matchedLines = extractMatchedLines($plainNote, $targetKeyword);

                    if (count($matchedLines) > 0) {
                        $results[] = [
                            'recordKey'    => 'DB_' . (int)$row['contents_id'],
                            'contentsId'   => (int)$row['contents_id'],
                            'sourceType'   => 'DB',
                            'sourceName'   => 'ulinker_notes',
                            'title'        => $plainTitle,
                            'matchedLines' => $matchedLines,
                        ];

                        if (count($results) >= $limit) {
                            break;
                        }
                    }
                }
            } catch (PDOException $e) {
                error_log("DB search error in getKeywordLinesList.php: " . $e->getMessage());
            }
        } else {
            error_log("Database connection is not available for DB search in getKeywordLinesList.php");
        }
        continue;
    }

    // B. CSV検索 (ulinker_notes*.csv)
    if (preg_match('/^ulinker_notes[a-zA-Z0-9_\-]*\.csv$/', $source) === 1) {
        // パストラバーサル防止チェック
        if (basename($source) !== $source) {
            continue;
        }

        $csvFilePath = $csvBaseDir . '/' . $source;
        if (!file_exists($csvFilePath) || !is_readable($csvFilePath)) {
            continue;
        }

        $handle = @fopen($csvFilePath, 'r');
        if ($handle === false) {
            continue;
        }

        // ヘッダー行を読み飛ばす
        $header = fgetcsv($handle);

        $csvRows = [];
        while (($row = fgetcsv($handle)) !== false) {
            // 最低11列必要 (contents_id=0, title=1, ..., note=4, publicity=5, ..., created_user_id=10)
            if (count($row) < 11) {
                continue;
            }
            if (!is_numeric($row[0])) {
                continue;
            }

            $csvRows[] = [
                'contentsId'    => (int)$row[0],
                'title'         => (string)($row[1] ?? ''),
                'note'          => (string)($row[4] ?? ''),
                'publicity'     => (int)($row[5] ?? 0),
                'createdUserId' => (int)($row[10] ?? 0),
            ];
        }
        fclose($handle);

        // contents_id 昇順にソート（作成-昇順基準）
        usort($csvRows, function ($a, $b) {
            return $a['contentsId'] <=> $b['contentsId'];
        });

        foreach ($csvRows as $row) {
            if (!canViewRecord($row['createdUserId'], $row['publicity'], $ownerId, $isTeacher)) {
                continue;
            }

            $plainTitle = unescapeUlinkerText($row['title']);
            $plainNote  = unescapeUlinkerText($row['note']);
            $matchedLines = extractMatchedLines($plainNote, $targetKeyword);

            if (count($matchedLines) > 0) {
                $results[] = [
                    'recordKey'    => 'CSV_' . $source . '_' . $row['contentsId'],
                    'contentsId'   => $row['contentsId'],
                    'sourceType'   => 'CSV',
                    'sourceName'   => $source,
                    'title'        => $plainTitle,
                    'matchedLines' => $matchedLines,
                ];

                if (count($results) >= $limit) {
                    break;
                }
            }
        }
    }
}

// 6. 正常レスポンス返却
echo json_encode([
    'status'          => 'success',
    'keyword'         => $targetKeyword,
    'totalHitRecords' => count($results),
    'records'         => $results,
], JSON_UNESCAPED_UNICODE);
exit;
