<?php
session_start();

require_once '../../server/properties.php';
require_once '../../server/functions.php';

// ログイン状態判定
$isLoggedIn = (isset($_SESSION['session_string']) && $_SESSION['session_string'] !== '' && isset($_SESSION['owner_id']));
$ownerId    = $isLoggedIn ? (int)$_SESSION['owner_id'] : 0;
$isTeacher  = ($isLoggedIn && isset($_SESSION['is_teacher'])) ? (int)$_SESSION['is_teacher'] : 0;

// API通信用ワンタイムトークン生成（半角英数字16文字）
$apiToken = '';
if ($isLoggedIn) {
    $apiToken = generateRandomAlphanumericString(16);
    $_SESSION['api_token'] = $apiToken;
}
?>
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ノート・CSVキーワード該当行検索 - <?= CONTENTS_NAME ?></title>

  <!-- ファビコン -->
  <link rel="icon" type="image/png" sizes="16x16" href="../../storage/images/favicon-16x16.png">
  <meta name="theme-color" content="#1565C0">

  <!-- スタイルシート -->
  <link rel="stylesheet" href="../../static/style.css">
  <link rel="stylesheet" href="../../static/keywordLinesSearch.css">
  <link href="https://cdn.jsdelivr.net/npm/vuetify@2.x/dist/vuetify.min.css" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Icons" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/@mdi/font@5.x/css/materialdesignicons.min.css" rel="stylesheet">
</head>
<body class="kls-page-wrapper">

  <!-- 青テイスト共通ヘッダー -->
  <header class="kls-header">
    <h1 class="kls-header-title">
      <span class="mdi mdi-text-box-search-outline" style="font-size: 1.5rem;"></span>
      <span>U-Linker ノート・CSVキーワード該当行検索</span>
    </h1>
    <div class="kls-header-links">
      <button type="button" class="kls-header-link" onclick="window.close()" title="このタブを閉じます">
        <span class="mdi mdi-close"></span>
        <span>タブを閉じる</span>
      </button>
    </div>
  </header>

  <main>
    <?php if (!$isLoggedIn): ?>
      <!-- 未ログイン時エラー表示カード（検索UIは非表示） -->
      <div class="kls-error-card">
        <div class="kls-error-icon">
          <span class="mdi mdi-alert-circle-outline"></span>
        </div>
        <h2 class="kls-error-title">ログインが必要です</h2>
        <p class="kls-error-text">
          ログイン状態が確認できませんでした。<br>
          U-Linker本体の画面からログインした状態で再度アクセスしてください。
        </p>
        <a href="../index.php" class="kls-btn kls-btn-primary">
          <span class="mdi mdi-login"></span>
          <span>U-Linker トップ画面へ移動</span>
        </a>
      </div>
    <?php else: ?>
      <!-- ログイン済み時：メインVueアプリケーション -->
      <div id="app" v-cloak>
        <v-app style="background: transparent;">
          <keyword-lines-search-app
            :owner-id="<?= $ownerId ?>"
            :is-teacher="<?= $isTeacher ?>"
            api-token="<?= htmlspecialchars($apiToken, ENT_QUOTES, 'UTF-8') ?>"
          ></keyword-lines-search-app>
        </v-app>
      </div>

      <!-- CDN ライブラリ読み込み -->
      <script src="https://cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/axios/0.18.0/axios.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/vuetify@2.x/dist/vuetify.js"></script>

      <!-- メインVueコンポーネント読み込み＆マウント -->
      <script type="module">
        import KeywordLinesSearchApp from '../../static/js/components/keywordLinesSearchApp.js';

        Vue.component('keyword-lines-search-app', KeywordLinesSearchApp);

        new Vue({
          el: '#app',
          vuetify: new Vuetify({
            theme: {
              themes: {
                light: {
                  primary: '#0D47A1',
                  secondary: '#1976D2',
                  accent: '#82B1FF',
                },
              },
            },
          }),
        });
      </script>
    <?php endif; ?>
  </main>

</body>
</html>
