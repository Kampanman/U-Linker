<?php
  include('../server/properties.php');
  session_start();
  define('PAGE_TOKEN', isset($_SESSION['page_token']) ? "'".$_SESSION['page_token']."'" : "''");
  define('URL_PARAM', isset($_GET['page_token']) ? "'".$_GET['page_token']."'" : "''");
  define('NOTE_ID', isset($_SESSION['selected_note_id']) ? "'".$_SESSION['selected_note_id']."'" : "''");
  define('NOTE_TITLE', isset($_SESSION['selected_note_title']) ? "'".$_SESSION['selected_note_title']."'" : "''");
  define('NOTE_TEXT', isset($_SESSION['selected_note_text']) ? "'" . str_replace("\n", "\\n", $_SESSION['selected_note_text']) . "'" : "''");
?>

<!DOCTYPE html>
<html lang="ja">
<head>
  <?php echo HEAD_LINKS; ?>
</head>
<body style="background-color: #B2DFDB;">
  <div id="app">
    <header data-parts-id="secondhand-01">
      <div class="header-center">
        <a href="#" data-parts-id="secondhand-01-01" class="title-logo"><?php echo BUNNER; ?></a>
      </div>
    </header><br />
    <main>
      <v-app>
        <v-card v-if="isReady" data-parts-id="secondhand-02"
          class="pa-4 rounded-card"
          color="#efebde" width="93%" outlined>
          <v-row v-if="errorType>0" justify="center">
            <p v-if="errorType==1" class="mt-5 redtext" v-text="'ページトークンが設定されていない為、ノートを表示できません。'"></p>
            <p v-if="errorType==2" class="mt-5 redtext" v-text="'パラメータのページトークンがセッション値と異なる為、ノートを表示できません。'"></p>
          </v-row>
          <div v-else>
            <div class="mb-3" data-parts-id="secondhand-02-01" :contents-id="selectedNote.contentsId">
              <v-icon color="green" class="me-2">mdi-book-open</v-icon>
              <span class="mr-2">タイトル: {{ unescapedTitle }}</span>
            </div>
            <div class="mb-3" data-parts-id="secondhand-02-02">
              <hr class="my-5" />
              <p v-for="line in processedTextList" :key="line.index" :id="'row_' + line.index">{{ line.text }}</p>
              <hr class="my-5" />
            </div>
          </div>
          <v-row justify="center" class="mb-3">
            <v-btn class="white--text" color="#8d0000" data-parts-id="secondhand-02-03" @click="closeWindow" v-text="'閉じる'"></v-btn>
          </v-row>
        </v-card>
      </v-app>
      <return-top-button></return-top-button>
    </main>
  </div>
  <?php echo SCRIPT_LINKS; ?>
  <script type="module">
    import commonFunctions from '../static/js/variables/commonFunctions.js';
    import returnTopButton from '../static/js/components/returnTopButton.js';

    new Vue({
      el: '#app',
      vuetify: new Vuetify(),
      data: {
        functions: commonFunctions,
        isReady: false,
        pageToken: <?php echo PAGE_TOKEN ?>,
        selectedNote: {
          contentsId: <?php echo NOTE_ID ?>,
          title: <?php echo NOTE_TITLE ?>,
          text: <?php echo NOTE_TEXT ?>,
        },
        urlParam: <?php echo URL_PARAM ?>,
      },
      computed: {
        errorType() {
          let errorType = 0;
          if(this.urlParam == '') errorType = 1;
          if(this.urlParam != this.pageToken) errorType = 2;

          return errorType;
        },
        unescapedTitle() { return this.functions.unescapeText(this.selectedNote.title) },
        processedTextList() {
          const textList = this.functions.unescapeText(this.selectedNote.text).split('\n');
          const resObjects = textList.map((row, i) => {
            return { index: (i+1), text: row }
          });

          return resObjects;
        },
      },
      mounted() {
        this.isReady = true;
      },
      methods: {
        closeWindow() {
          window.close();
        }
      }
    });
  </script>
</body>
</html>
