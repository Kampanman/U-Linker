<?php
include('../functions.php');

$res = ['type' => 'success', 'list' => []]; // レスポンスの初期化

try {
  if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // トークンとリクエストタイプのチェック
    if (isset($_POST['token']) && isAlphanumeric16($_POST['token']) &&
      isset($_POST['type']) && isset($_POST['name']) && isset($_POST['ownerId'])) {

      $fileName = $_POST['name'];
      $ownerId = $_POST['ownerId'];
      $filePath = __DIR__ . '/../../storage/csv/' . basename($fileName);

      if (file_exists($filePath)) { // ファイルの存在チェック
        $dataList = [];
        $header = null;

        // CSVファイルを開いて読み込みを行う
        if (($handle = fopen($filePath, "r")) !== FALSE) {
          $rowNumber = 0;

          while (($row = fgetcsv($handle)) !== FALSE) {
            if ($rowNumber === 0) { // ヘッダー行の処理
              $header = array_flip($row); // キーと値を反転させて、ヘッダー名をキーにした連想配列を作成
            } else { // データ行の処理
              if (isset($header['created_user_id']) && $row[$header['created_user_id']] == $ownerId) {

                if ($_POST['type']=='note'){
                  // 必要なカラムのインデックスがヘッダーに存在するか確認
                  if (isset($header['contents_id'], $header['title'], $header['publicity'], $header['created_at'], $header['updated_at'])) {
                    $dataRow = [
                      'contents_id' => $row[$header['contents_id']] ?? null,
                      'title' => $row[$header['title']] ?? null,
                      'publicity' => $row[$header['publicity']] ?? null,
                      'created_at' => $row[$header['created_at']] ?? null,
                      'updated_at' => $row[$header['updated_at']] ?? null,
                    ];
                    $dataList[] = $dataRow;
                  }

                } else if ($_POST['type']=='getNoteDetail') {
                  $postContentsId = $_POST['contentsId'];
                  if ($row[$header['contents_id']] == $postContentsId) {
                    $addData = [
                      'url' => $row[$header['url']] ?? null,
                      'url_sub' => $row[$header['url_sub']] ?? null,
                      'note' => $row[$header['note']] ?? null,
                      'relate_notes' => $row[$header['relate_notes']] ?? null,
                      'relate_video_urls' => $row[$header['relate_video_urls']] ?? null,
                    ];
                    $res['add_info'] = $addData;
                  }

                } else if ($_POST['type']=='video') {
                  $dataRow = [
                    'contents_id' => $row[$header['contents_id']] ?? null,
                    'title' => $row[$header['title']] ?? null,
                    'url' => $row[$header['url']] ?? null,
                    'tags' => $row[$header['tags']] ?? null,
                    'publicity' => $row[$header['publicity']] ?? null,
                    'created_at' => $row[$header['created_at']] ?? null,
                    'updated_at' => $row[$header['updated_at']] ?? null,
                  ];
                  $dataList[] = $dataRow;
                } else {
                  $res = ['type' => 'fail', 'message' => '不正なリクエストです。typeパラメータの形式が正しくありません。'];
                  http_response_code(400); // Bad Request
                }
              }
            }
            $rowNumber++;
          }
          fclose($handle);

          // $dataList を updated_at で降順ソート
          // $dataList が空でないことを確認してからソートを実行
          if (!empty($dataList)) {
            usort($dataList, function ($a, $b) {
              // updated_at が存在し、有効な日付文字列であることを想定
              // 存在しない、または不正な形式の場合は 0 (エポックタイムスタンプの最初期) として扱う
              $timestampA = isset($a['updated_at']) && !empty($a['updated_at']) ? strtotime($a['updated_at']) : 0;
              $timestampB = isset($b['updated_at']) && !empty($b['updated_at']) ? strtotime($b['updated_at']) : 0;

              // 降順ソートのため、$timestampB と $timestampA を比較
              if ($timestampA == $timestampB) return 0;
              return ($timestampA < $timestampB) ? 1 : -1;
            });
          }

          $res['list'] = $dataList;
        } else {
          throw new Exception("CSVファイルを開くことができません。");
        }
      } else {
        throw new Exception("指定されたCSVファイルが見つかりません。");
      }
    } else {
      $res = ['type' => 'fail', 'message' => '不正なリクエストです。必要なパラメータが不足しているか、形式が正しくありません。'];
      http_response_code(400); // Bad Request
    }
  } else {
    $res = ['type' => 'fail', 'message' => '不正なリクエストメソッドです。POSTメソッドを使用してください。'];
    http_response_code(405); // Method Not Allowed
  }
} catch (Exception $e) {
  $res = ['type' => 'error', 'message' => $e->getMessage()];
  http_response_code(500); // Internal Server Error
}

header('Content-Type: application/json; charset=utf-8');
echo json_encode($res);
exit;
