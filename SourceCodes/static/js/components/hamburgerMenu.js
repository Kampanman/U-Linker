// hamburgerMenu.js

let hamburgerMenu = Vue.component("hamburger-menu", {
  template: `
    <div v-if="isMenuOpen" class="hamburger-menu-container" v-click-outside="closeMenu">
      <ul class="hamburger-menu">
        <li data-parts-id="exises-01-01" @click="handleMenuItemClick('search')">検索モードに切り替える</li>
        <li data-parts-id="exises-01-02" @click="handleMenuItemClick('bookmark')">お気に入りサイトリストを表示する</li>
        <li data-parts-id="exises-01-03" @click="handleMenuItemClick('curl')">別タブで「cURL About」を開く</li>
        <li data-parts-id="exises-01-04" @click="handleMenuItemClick('notes')">ノート登録編集モードに切り替える</li>
        <li data-parts-id="exises-01-05" @click="handleMenuItemClick('videos')">ビデオ登録編集モードに切り替える</li>
        <li data-parts-id="exises-01-06" @click="handleMenuItemClick('notesCsv')">アーカイブノート一覧モードに切り替える</li>
        <li data-parts-id="exises-01-07" @click="handleMenuItemClick('videosCsv')">アーカイブビデオ一覧モードに切り替える</li>
        <li data-parts-id="exises-01-08" @click="handleMenuItemClick('account')">ユーザー登録編集モードに切り替える</li>
        <li data-parts-id="exises-01-09" @click="handleMenuItemClick('deleteAccount')" v-if="isMaster">停止アカウント・ユーザー登録データ削除モードに切り替える</li>
      </ul>
    </div>
  `,
  props: {
    flag: {
      type: Object,
      required: true,
    },
    loginUser: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      isMenuOpen: false,
      isDangerZoneFormOpen: false,
    };
  },
  computed: {
    isMaster() {
      return (this.loginUser && this.loginUser.isMaster === 1)
    },
  },
  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },
    closeMenu() {
      this.isMenuOpen = false;
    },
    // メニュー項目がクリックされたときの処理
    handleMenuItemClick(action) {
      this.$emit('reset-flag'); // 親コンポーネントにフラグリセットイベントを通知

      // アクションに応じてフラグを更新
      switch (action) {
        case 'search':
          this.flag.isSearchFormOpen = true;
          break;
        case 'bookmark':
          this.flag.isBookmarkSitesView = true;
          break;
        case 'curl':
          window.open('https://empower-util.sakura.ne.jp/documents/cURL-About/index.php', '_blank');
          this.flag.isTitleLogoOpen = true;
          break;
        case 'notes':
          this.flag.isUsersNotesTableView = true;
          break;
        case 'videos':
          this.flag.isUsersVideosTableView = true;
          break;
        case 'notesCsv':
          this.flag.isUsersNotesCsvTableView = true;
          break;
        case 'videosCsv':
          this.flag.isUsersVideosCsvTableView = true;
          break;
        case 'account':
          this.$emit('open-account-edit'); // 親コンポーネント (index.php) にイベントを発行
          break;
        case 'deleteAccount':
          this.isDangerZoneFormOpen = true;
          this.$emit('open-account-delete', this.isDangerZoneFormOpen); // 親コンポーネント (index.php) にイベントを発行
          break;
        default:
          console.warn('Unknown menu action:', action);
      }
      this.closeMenu(); // メニュー項目をクリックしたらメニューを閉じる
    },
  },
});

export default hamburgerMenu;