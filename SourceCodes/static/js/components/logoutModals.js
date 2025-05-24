// logoutModals.js
let logoutModals = Vue.component("logout-modals", {
  template: `
    <v-app>
    <div class="logout-modals-container">
      <v-dialog :value="dialog.isLogoutConfirmOpen" persistent max-width="500">
        <v-card>
          <v-card-title class="headline">{{ thisDialog.confirm.title }}</v-card-title>
          <v-card-text>{{ thisDialog.confirm.message }}</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green darken-1" text @click="handleConfirmYes">はい</v-btn>
            <v-btn color="red darken-1" text @click="handleConfirmNo">いいえ</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog :value="dialog.isLogoutCompleteOpen" persistent max-width="500">
        <v-card>
          <v-card-title class="headline">{{ thisDialog.complete.title }}</v-card-title>
          <v-card-text>{{ thisDialog.complete.message }}</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red darken-1" text @click="handleCompleteClose">閉じる</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
    </v-app>
  `,
  props: {
    dialog: Object,
    functions: Object,
    loginUser: Object,
    path: Object,
  },
  data() {
    return {
      thisDialog: {
        confirm: {
          title: "ログアウト確認",
          message: "ログアウトします。よろしいですか？",
        },
        complete: {
          title: "ログアウト完了",
          message: "ログアウトしました。リロードします。",
        },
      },
    };
  },
  methods: {
    // 確認モーダル「はい」クリック時の処理
    handleConfirmYes() {
      // 1. 親に確認モーダルを閉じるイベントを発行
      this.$emit('update:close-confirm');
      // 2. ログアウト処理を実行
      this.logoutConfirmed();
    },
    // 確認モーダル「いいえ」クリック時の処理
    handleConfirmNo() {
      this.$emit('update:close-confirm'); // 親に確認モーダルを閉じるイベントを発行
    },
    // 完了モーダル「閉じる」クリック時の処理
    handleCompleteClose() {
      // 1. 親に完了モーダルを閉じるイベントを発行
      this.$emit('update:close-complete');
      // 2. ページリロードを実行
      this.doReload();
    },
    // ログアウト処理本体
    logoutConfirmed() {
      const data = {
        type: "logout",
        ownerId: this.loginUser.ownerId,
        token: this.functions.generateRandomAlphanumericString(16),
      };
      let param = this.functions.convertObjectToURLSearchParams(data);
      axios
        .post(this.path.logoutProcess, param)
        .then((response) => {
          if (response && response.data) {
            this.$emit('update:open-complete'); // 親に完了モーダルを開くイベントを発行
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
        })
    },
    // ページリロード
    doReload() {
      location.reload();
    },
  },
});

export default logoutModals;
