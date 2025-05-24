<?php
include('../functions.php');

// レスポンスの初期化（成功時のデフォルト構造）
$res = ['type' => 'success', 'list' => []];

try {
  if ($_SERVER['REQUEST_METHOD'] === 'POST') { // POSTリクエストか確認
      // POSTデータにtokenが設定されており、形式が正しいか判定
      if (isset($_POST['token']) && isAlphanumeric16($_POST['token'])) {
        // POSTのtypeが"getCsvList"か判定
        if (isset($_POST['type']) && $_POST['type'] === 'getCsvList') {
          // CSVファイルが格納されているディレクトリのパスを指定
          $csvDirectory = __DIR__ . '/../../storage/csv/';

          // ディレクトリが存在するか確認
          if (is_dir($csvDirectory)) {
            // glob関数を使用してディレクトリ内のCSVファイルを取得（'*.csv' パターンにマッチするファイルのパスを配列で返す）
            $csvFiles = glob($csvDirectory . '*.csv');
            if ($csvFiles === false) throw new Exception("CSVファイルの検索中にエラーが発生しました。"); // glob関数がエラーを返した場合
            if (!empty($csvFiles)) { // ファイルパス全体ではなく、ファイル名のみを抽出してリストに格納
              $fileNames = array_map('basename', $csvFiles);
              $res['list'] = $fileNames;
            } else { // CSVファイルが見つからなかった場合 (処理自体は成功)
              $res['message'] = 'CSVファイルが見つかりませんでした。';
            }
          } else { // 指定されたディレクトリが存在しない場合
            throw new Exception("CSVファイルを格納するディレクトリが見つかりません: " . $csvDirectory);
          }
        } else { // typeが"getCsvList"でない場合
          $res = ['type' => 'fail', 'message' => 'リクエストタイプが不正です。'];
          http_response_code(400); // Bad Request
        }
      } else { // tokenがない、または形式が不正な場合
        $res = ['type' => 'fail', 'message' => '不正なリクエストまたはトークンです。'];
        http_response_code(400); // Bad Request
      }
  } else { // POSTリクエストでない場合
    $res = ['type' => 'fail', 'message' => '不正なリクエストメソッドです。POSTメソッドを使用してください。'];
    http_response_code(405); // Method Not Allowed
  }
} catch (Exception $e) { // エラーハンドリング (ディレクトリが存在しない、globエラーなど)
    http_response_code(500); // Internal Server Error
    $res = ['type' => 'error', 'message' => 'サーバー内部でエラーが発生しました。'];
}

header('Content-Type: application/json; charset=utf-8');
echo json_encode($res);
exit;
