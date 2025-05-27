<?php
  include('../server/properties.php');
  session_start();
  define('API_PATH', DOMAIN.'/'.CONTENTS_NAME.'/server/api/');
  define('SESSION_STRING', isset($_SESSION['session_string']) ? "'".$_SESSION['session_string']."'" : "''");
  define('OWNER_ID', isset($_SESSION['owner_id']) ? "'".$_SESSION['owner_id']."'" : "''");
  define('EMAIL', isset($_SESSION['email']) ? "'".$_SESSION['email']."'" : "''");
  define('USER_NAME', isset($_SESSION['name']) ? "'".$_SESSION['name']."'" : "''");
  define('IS_MASTER', isset($_SESSION['is_master']) ? $_SESSION['is_master'] : 0);
  define('IS_TEACHER', isset($_SESSION['is_teacher']) ? $_SESSION['is_teacher'] : 0);
  define('COMMENT', isset($_SESSION['comment']) ? "'".$_SESSION['comment']."'" : "''");
?>

<!DOCTYPE html>
<html lang="ja">
<head>
  <?php echo HEAD_LINKS; ?>
</head>
<body style="background-color: #B2DFDB;">
  <div id="app">
    <header data-parts-id="common-01">
      <div class="header-left">
        <div v-if="sessionString === ''">
          <!-- ログインしていないユーザー向けのダミー要素 -->
          <div></div>
        </div>
        <button v-else data-parts-id="common-01-exises-01" @click.stop="toggleHamburgerMenu()">
          <!-- ハンバーガーメニューアイコン -->
          ☰
        </button>
        <hamburger-menu
          ref="hamburgerMenuRef"
          :flag="flag"
          :login-user="loginUser"
          @reset-flag="resetFlag"
          @open-account-edit="openAccountRegistUpdateForm"
          @open-account-delete="openAccountDelete"
        ></hamburger-menu>
      </div>
      <div class="header-center" align="center">
        <div class="d-block">
          <a href="#" data-parts-id="common-01" class="title-logo" @click="openTitleLogo"><?php echo BUNNER; ?></a>
        </div>
        <div class="d-block">
          <small class="white--text">Supported(Created) by "Gemini Code-Assist".</small>
        </div>
      </div>
      <div class="header-right">
        <button data-parts-id="common-01-nonses-01"
          :disabled="!isReady"
          v-if="sessionString === '' && isLoginButtonVisible"
          @click="openLoginForm"
          title="ログインフォームを開きます"
        ><v-icon color="white" class="">mdi-login</v-icon></button>
        <button data-parts-id="common-01-nonses-02"
          :disabled="!isReady"
          v-if="sessionString === '' && isSearchButtonVisible"
          @click="openSearchForm"
          title="検索フォームを開きます"
        ><v-icon color="white" class="">mdi-magnify</v-icon></button>
        <button data-parts-id="common-01-exises-02"
          :disabled="!isReady"
          v-if="sessionString !== ''"
          @click="openLogoutConfirm"
          title="ログアウトモーダルを開きます"
        ><v-icon color="white" class="">mdi-logout</v-icon></button>
      </div>
    </header>
    <br />
    <main>
      <!-- メインエリアのコンテンツはここに配置され、Vueによって動的にレンダリングされる -->
      <get-csv-list :path="axiosPath" :functions="functions" @fetch-csv-list="handleCsvList"></get-csv-list>
      <div class="fader" data-parts-id="common-02" v-if="flag.isTitleLogoOpen">
        <slogan :login-user="loginUser"></slogan>
        <digi-clock></digi-clock>
      </div>
      <div class="fader" data-parts-id="common-03" v-if="flag.isSearchFormOpen">
        <v-app>
          <search-form
            :dialog="dialog"
            :flag="flag"
            :functions="functions"
            :login-user="loginUser"
            :path="axiosPath"
            :search-form="searchForm"
            :selected-record="selectedRecord"
            :session-string="sessionString"
            @get-searched-hit-list="handleRenderDataListArea"
          ></search-form>
        </v-app>
      </div>
      <div class="fader" data-parts-id="common-04" v-if="flag.isHitNoteAreaOpen">
        <v-app>
          <searched-hit-note-area
            :flag="flag"
            :functions="functions"
            :login-user="loginUser"
            :path="axiosPath"
            :search-result="searchedList.notes"
            :selected-note="selectedRecord.note"
            :search-form="searchForm"
            @get-selected-note="handleNoteSelected"
          ></searched-hit-note-area>
        </v-app>
      </div>
      <div class="fader" data-parts-id="common-05" v-if="flag.isHitVideoAreaOpen">
        <v-app>
          <searched-hit-video-area
            :flag="flag"
            :functions="functions"
            :login-user="loginUser"
            :path="axiosPath"
            :search-result="searchedList.videos"
            :selected-video="selectedRecord.video"
            @get-selected-video="handleVideoSelected"
          ></searched-hit-video-area>
        </v-app>
      </div>
      <div class="fader" data-parts-id="nonses-01" v-if="flag.isLoginFormOpen">
        <login-form
          :flag="flag" :functions="functions" :login-user="loginUser" :path="axiosPath"
          @open-account-regist-form="handleOpenAccountRegistForm"
          @open-password-reset-mail-form="handleOpenPasswordResetMailForm"
        ></login-form>
      </div>
      <div class="fader" data-parts-id="nonses-02" v-if="flag.isAccountRegistFormOpen">
        <non-ses-user-regist-form :path="axiosPath" :flag="flag" :functions="functions" :dialog="dialog"></non-ses-user-regist-form>
      </div>
      <div class="fader" data-parts-id="nonses-03" v-if="flag.isPasswordResetMailFormOpen">
        <reset-pass-mail-send-form :flag="flag" :functions="functions" :path="axiosPath"></reset-pass-mail-send-form>
      </div>
      <div class="fader" data-parts-id="exises-02 exises-03" v-if="flag.isAccountRegistUpdateFormOpen">
        <v-app>
          <user-regist-update-form
            ref="userForm"
            :path="axiosPath"
            :flag="flag"
            :functions="functions"
            :dialog="dialog"
            :selected-user="selectedUser"
            :login-user="loginUser"
            @request-logout="doLogout"
          ></user-regist-update-form>
        </v-app>
      </div>
      <div class="fader" data-parts-id="exises-04 exises-05" v-if="flag.isUsersNotesTableView">
        <v-app>
          <note-regist-update-form
            :dialog="dialog"
            :flag="flag"
            :search-form="searchForm"
            :login-user="loginUser"
            :functions="functions"
            :path="axiosPath"
            :is-update-mode="isUpdate.note"
          ></note-regist-update-form>
        </v-app>
      </div>
      <div class="fader" data-parts-id="exises-06 exises-07" v-if="flag.isUsersVideosTableView">
        <v-app>
          <video-regist-update-form
            :path="axiosPath"
            :flag="flag"
            :functions="functions"
            :dialog="dialog"
            :login-user="loginUser"
            :is-update-mode="isUpdate.video"
          ></video-regist-update-form>
        </v-app>
      </div>
      <div class="fader" data-parts-id="exises-08 exises-09 exises-10" v-if="flag.isUsersNotesCsvTableView">
        <v-app>
          <archive-note-csvs
            :login-user="loginUser"
            :path="axiosPath"
            :functions="functions"
            :flag="flag"
            :dialog="dialog"
          ></archive-note-csvs>
        </v-app>
      </div>
      <div class="fader" data-parts-id="exises-11 exises-12 exises-13" v-if="flag.isUsersVideosCsvTableView">
        <v-app>
          <archive-video-csvs
            :login-user="loginUser"
            :path="axiosPath"
            :functions="functions"
            :flag="flag"
          ></archive-video-csvs>
        </v-app>
      </div>
      <div class="fader" data-parts-id="exises-14" v-if="flag.isBookmarkSitesView">
        <v-app>
          <bookmark-regist-update-form
            :path="axiosPath"
            :flag="flag"
            :functions="functions"
            :dialog="dialog"
            :login-user="loginUser"
            :is-update-mode="isUpdate.bookmark"
          ></bookmark-regist-update-form>
        </v-app>
      </div>
      <div class="fader" data-parts-id="exises-15" v-if="isMaster && isDeleteStoppedAccountsOpen">
        <v-app>
          <delete-stop-accounts-and-datas
            :path="axiosPath"
            :functions="functions"
            :login-user="loginUser"          
          ></delete-stop-accounts-and-datas>
        </v-app>
      </div>

      <logout-modals
        :dialog="dialog" :login-user="loginUser" :path="axiosPath" :functions="functions"
        @update:close-confirm="dialog.isLogoutConfirmOpen = false"
        @update:open-complete="handleLogoutComplete"
        @update:close-complete="dialog.isLogoutCompleteOpen = false"
      ></logout-modals>

      <return-top-button></return-top-button>
    </main>
  </div>
  
  <?php echo SCRIPT_LINKS; ?>
  <script  type="module">
    import commonFunctions from '../static/js/variables/commonFunctions.js';
    import dialogParams from '../static/js/variables/dialogParams.js';
    import flagParams from '../static/js/variables/flagParams.js';
    import loginUserParams from '../static/js/variables/loginUserParams.js';
    import searchFormParams from '../static/js/variables/searchFormParams.js';
    import selectedRecordParams from '../static/js/variables/selectedRecordParams.js';
    import digiClock from '../static/js/components/digiClock.js';
    import slogan from '../static/js/components/slogan.js';
    import loginForm from '../static/js/components/loginForm.js';
    import logoutModals from '../static/js/components/logoutModals.js';
    import nonSesUserRegistForm from '../static/js/components/nonSesUserRegistForm.js';
    import resetPassMailSendForm from '../static/js/components/resetPassMailSendForm.js';
    import searchForm from '../static/js/components/searchForm.js';
    import hamburgerMenu from '../static/js/components/hamburgerMenu.js';
    import clickOutside from '../static/js/directives/clickOutside.js';
    import userRegistUpdateForm from '../static/js/components/userRegistUpdateForm.js';
    import noteRegistUpdateForm from '../static/js/components/noteRegistUpdateForm.js';
    import videoRegistUpdateForm from '../static/js/components/videoRegistUpdateForm.js';
    import bookmarkRegistUpdateForm from '../static/js/components/bookmarkRegistUpdateForm.js';
    import getCsvList from '../static/js/components/getCsvList.js';
    import searchedHitNoteArea from '../static/js/components/searchedHitNoteArea.js';
    import searchedHitVideoArea from '../static/js/components/searchedHitVideoArea.js';
    import archiveNoteCsvs from '../static/js/components/archiveNoteCsvs.js';
    import archiveVideoCsvs from '../static/js/components/archiveVideoCsvs.js';
    import deleteStopAccountsAndDatas from '../static/js/components/deleteStopAccountsAndDatas.js';
    import returnTopButton from '../static/js/components/returnTopButton.js';

    new Vue({
      el: '#app',
      vuetify: new Vuetify(),
      directives: {
        clickOutside
      },
      data: {
        dialog: dialogParams,
        flag: flagParams,
        functions: commonFunctions,
        loginUser: loginUserParams,
        axiosPath: {
          loginJudge: <?php echo '"'.API_PATH.'loginJudge.php'.'"'; ?>,
          logoutProcess: <?php echo '"'.API_PATH.'logoutProcess.php'.'"'; ?>,
          accountRegistUpdate: <?php echo '"'.API_PATH.'accountRegistUpdate.php'.'"'; ?>,
          getAccountsList: <?php echo '"'.API_PATH.'getAccountsList.php'.'"'; ?>,
          noteRegistUpdate: <?php echo '"'.API_PATH.'noteRegistUpdate.php'.'"'; ?>,
          getCsvList: <?php echo '"'.API_PATH.'getCsvList.php'.'"'; ?>,
          getCsvRowList: <?php echo '"'.API_PATH.'getCsvRowList.php'.'"'; ?>,
          getNotesList: <?php echo '"'.API_PATH.'getNotesList.php'.'"'; ?>,
          videoRegistUpdate: <?php echo '"'.API_PATH.'videoRegistUpdate.php'.'"'; ?>,
          getVideosList: <?php echo '"'.API_PATH.'getVideosList.php'.'"'; ?>,
          bookmarkRegistUpdate: <?php echo '"'.API_PATH.'bookmarkRegistUpdate.php'.'"'; ?>,
          getBookmarksList: <?php echo '"'.API_PATH.'getBookmarksList.php'.'"'; ?>,
          getSearchedDataList: <?php echo '"'.API_PATH.'getSearchedDataList.php'.'"'; ?>,
          getSelectedData: <?php echo '"'.API_PATH.'getSelectedData.php'.'"'; ?>,
          generateMail: <?php echo '"'.API_PATH.'generateMail.php'.'"'; ?>,
          aboutStoppedAccounts: <?php echo '"'.API_PATH.'aboutStoppedAccounts.php'.'"'; ?>,
        },
        searchForm: searchFormParams,
        searchedList: { notes: [], video: [] },
        selectedRecord: selectedRecordParams,
        selectedUser: null,
        initial: {
          dialog: JSON.parse(JSON.stringify(dialogParams)),
          flag: JSON.parse(JSON.stringify(flagParams)),
          loginUser: JSON.parse(JSON.stringify(loginUserParams)),
          searchForm: JSON.parse(JSON.stringify(searchFormParams)),
          selectedRecord: JSON.parse(JSON.stringify(selectedRecordParams)),
        },
        sessionString: '',
        isLoginButtonVisible: false,
        isSearchButtonVisible: false,
        isDeleteStoppedAccountsOpen: false,
        isUpdate: {
          note: 0,
          video: 0,
          bookmark: 0,
        },
        isReady: false,
      },
      computed: {
        isMaster() {
          return (this.loginUser && this.loginUser.isMaster === 1)
        },
      },
      mounted() {
        this.sessionString = <?php echo SESSION_STRING; ?>;
        if(this.sessionString!=''){ // PHPから渡されたセッション情報で loginUser を更新
          this.loginUser.ownerId = <?php echo OWNER_ID ?>;
          this.loginUser.email = <?php echo EMAIL ?>;
          this.loginUser.userName = <?php echo USER_NAME ?>;
          this.loginUser.isTeacher = <?php echo IS_TEACHER ?>;
          this.loginUser.isMaster = <?php echo IS_MASTER ?>;
          this.loginUser.comment = this.functions.unescapeText(<?php echo COMMENT ?>);
          this.initial.loginUser = JSON.parse(JSON.stringify(this.loginUser)); // loginUserの初期値も更新しておく
        }
        this.openTitleLogo();
        this.isReady = true;
      },
      methods: {
        handleCsvList(payload) {
          this.searchForm.csvList = payload.csvData;
        },
        handleOpenAccountRegistForm() { // ログイン画面からの新規登録
          this.resetFlag();
          this.flag.isAccountRegistFormOpen = true;
          this.setNonSesHeaderButtons(true, true);
        },
        handleOpenPasswordResetMailForm() { // ログイン画面からのパスワードリセット
          this.resetFlag();
          this.flag.isPasswordResetMailFormOpen = true;
          this.setNonSesHeaderButtons(true, true);
        },
        handleRenderDataListArea(payload) {
          this.searchedList = payload.list;
          this.searchForm = payload.searched;
          this.flag.isHitNoteAreaOpen = true;
          this.flag.isHitVideoAreaOpen = true;
        },
        handleNoteSelected(payload) {
          this.selectedRecord.note = payload;
          this.flag.isSelectedNoteAreaOpen = true;
          this.flag.isHitVideoAreaOpen = false;
        },
        handleVideoSelected(payload) {
          this.selectedRecord.video = payload;
          this.flag.isSelectedVideoAreaOpen = true;
          this.flag.isHitNoteAreaOpen = false;
        },
        openTitleLogo() {
          this.resetFlag();
          this.flag.isTitleLogoOpen = true;
          this.setNonSesHeaderButtons(true, true);
        },
        openLoginForm() {
          this.resetFlag();
          this.flag.isLoginFormOpen = true;
          this.setNonSesHeaderButtons(false, true);
        },
        openSearchForm() {
          this.resetFlag();
          this.flag.isSearchFormOpen = true;
          this.setNonSesHeaderButtons(true, false);
        },
        openAccountRegistUpdateForm() { // ハンバーガーメニューからユーザー登録編集フォームを開く
          this.resetFlag();
          this.selectedUser = { ...this.loginUser }; // スプレッド構文でコピー
          this.flag.isAccountRegistUpdateFormOpen = true;
        },
        openAccountDelete(payload) {
          this.resetFlag();
          this.isDeleteStoppedAccountsOpen = payload;
        },
        setNonSesHeaderButtons(loginBtnBool, searchBtnBool) { // ヘッダーボタン制御
          if (this.sessionString === '') {
            this.isLoginButtonVisible = loginBtnBool;
            this.isSearchButtonVisible = searchBtnBool;
          }
        },
        toggleHamburgerMenu() {
          if (this.$refs.hamburgerMenuRef) this.$refs.hamburgerMenuRef.toggleMenu();
        },
        resetFlag() { // リセット処理
          Object.assign(this.flag, this.initial.flag);
          this.isDeleteStoppedAccountsOpen = false;
        },
        resetDialog() {
          Object.assign(this.dialog, this.initial.dialog);
        },
        doLogout() { // ログアウト処理
          const data = {
            type: "logout",
            ownerId: this.loginUser.ownerId,
            token: this.functions.generateRandomAlphanumericString(16),
          };

          let param = this.functions.convertObjectToURLSearchParams(data);
          axios
            .post(this.axiosPath.logoutProcess, param)
            .then((response) => {
              if (response && response.data) {
                this.functions.reloadPageAfterDelay(3);
              } else {
                console.error("予期しないレスポンスが発生しました:", response.data);
              }
            })
            .catch((error) => {
              console.error("Logout Error:", error);
              if (error.response) {
                console.log("error.response", error.response);
              } else if (error.request) {
                console.log("error.request", error.request);
              } else {
                console.log("error", error);
              }
            });
        },
        openLogoutConfirm() {
          this.resetDialog();
          this.dialog.isLogoutConfirmOpen = true;
        },
        handleLogoutComplete() {
          this.dialog.isLogoutConfirmOpen = false;
          this.dialog.isLogoutCompleteOpen = true;
        },
      }
    });
  </script>
</body>
</html>
