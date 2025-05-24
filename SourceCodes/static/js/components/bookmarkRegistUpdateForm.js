// bookmarkRegistUpdateForm.js
import usersBookmarkArea from './usersBookmarkArea.js';

let bookmarkRegistUpdateForm = Vue.component("bookmark-regist-update-form", {
  template: `
    <div class="bookmark-regist-update-form-group">
      <div class="user-bookmark-area">
        <users-bookmark-area
          ref="usersBookmarkArea"
          :path="path"
          :flag="flag"
          :functions="functions"
          :dialog="dialog"
          :login-user="loginUser"
          @request-show-form="handleShowForm"
          @request-close-form="handleCloseForm"
          @request-delete-confirmation="handleDeleteConfirmation"
        ></users-bookmark-area>
      </div>
      <v-card class="pa-4 rounded-card fader" color="#efebde" outlined v-if="isFormVisible">
        <v-form ref="form">
          <v-card-title class="headline">
            <span class="area-title">{{ formTitle }}</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="bookmarkRegistUpdateForm.title"
                    label="サイト名"
                    maxlength="100"
                    required
                    counter="100"
                    data-parts-id="exises-14-03-01"
                    :data-contents-id="bookmarkRegistUpdateForm.contentsId || ''"
                  ></v-text-field>
                  <p class="valid-errors" v-if="validError.requiredTitle" @click="validError.requiredTitle=false">{{ validError.message.required }}</p>
                  <p class="valid-errors" v-if="validError.invalidTitleChars" @click="validError.invalidTitleChars=false">{{ validError.message.invalidTitleChars }}</p>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="bookmarkRegistUpdateForm.url"
                    label="URL"
                    required
                    data-parts-id="exises-14-03-02"
                  ></v-text-field>
                  <p class="valid-errors" v-if="validError.requiredUrl" @click="validError.requiredUrl=false">{{ validError.message.required }}</p>
                  <p class="valid-errors" v-if="validError.invalidUrlFormat" @click="validError.invalidUrlFormat=false">{{ validError.message.invalidUrlFormat }}</p>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions justify="center">
            <v-row justify="center" class="w-100 mt-4">
              <v-btn
                v-if="bookmarkRegistUpdateForm.isUpdateMode === 0"
                :disabled="!isSubmitEnabled"
                color="#8d0000"
                class="white--text mr-1"
                data-parts-id="exises-14-03-03"
                @click="submitForm"
              >登録</v-btn>
              <v-btn
                v-if="bookmarkRegistUpdateForm.isUpdateMode === 1"
                :disabled="!isSubmitEnabled"
                color="#8d0000"
                class="white--text mr-1"
                data-parts-id="exises-14-03-03"
                @click="submitForm"
              >更新</v-btn>
            </v-row>
          </v-card-actions>
        </v-form>

        <!-- 登録・更新確認ダイアログ -->
        <v-dialog v-model="dialog.isSiteRegistUpdateConfirmOpen" persistent max-width="500">
          <v-card>
            <v-card-title class="headline">{{ confirmDialog.title }}</v-card-title>
            <v-card-text>{{ confirmDialog.message }}</v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="green darken-1" text @click="dialog.isSiteRegistUpdateConfirmOpen=false; submitConfirmed()">はい</v-btn>
              <v-btn color="red darken-1" text @click="dialog.isSiteRegistUpdateConfirmOpen=false">いいえ</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- 登録・更新完了ダイアログ -->
        <v-dialog v-model="dialog.isSiteRegistUpdateCompleteOpen" persistent max-width="500">
          <v-card>
            <v-card-title class="headline">{{ completeDialog.title }}</v-card-title>
            <v-card-text>{{ completeDialog.message }}</v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="red darken-1" text @click="dialog.isSiteRegistUpdateCompleteOpen=false">閉じる</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-card>

      <!-- 削除確認ダイアログ -->
      <v-dialog v-model="dialog.isSiteDeleteConfirmOpen" persistent max-width="500">
        <v-card>
          <v-card-title class="headline">削除確認</v-card-title>
          <v-card-text>ホントに消しますよ？後悔しませんね！？</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green darken-1" text @click="submitDelete()">いいから消せ</v-btn>
            <v-btn color="red darken-1" text @click="cancelDeleteConfirmation()">やっぱやめとく</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- 削除完了ダイアログ -->
      <v-dialog v-model="dialog.isSiteDeleteCompleteOpen" persistent max-width="500">
        <v-card>
          <v-card-title class="headline">{{ deleteCompleteDialog.title }}</v-card-title>
          <v-card-text>{{ deleteCompleteDialog.message }}</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red darken-1" text @click="dialog.isSiteDeleteCompleteOpen=false">閉じる</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  `,
  props: {
    functions: Object,
    flag: Object,
    path: Object,
    dialog: Object,
    loginUser: Object,
  },
  components: {
    usersBookmarkArea,
  },
  data() {
    return {
      isFormVisible: false,
      bookmarkRegistUpdateForm: {
        isUpdateMode: 0,
        contents_id: null,
        title: "",
        url: "",
      },
      selectedDeleteContentsId: null, // 削除対象のIDを保持
      defaultUpdateForm: null, // 更新モード時の初期データ保持用
      validError: {
        requiredTitle: false,
        requiredUrl: false,
        invalidTitleChars: false,
        invalidUrlFormat: false,
        message: {
          required: '入力必須項目です。',
          invalidTitleChars: "サイト名に使用できない文字が含まれています。",
          invalidUrlFormat: "入力内容がURL形式ではありません。",
        }
      },
      validationRules: {
        titleRegex: /(?=.*[a-zA-Z0-9ａ-ｚＡ-Ｚ０-９\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF々].*[a-zA-Z0-9ａ-ｚＡ-Ｚ０-９\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF々])/,
        urlRegex: /^(https?:\/\/)?([a-zA-Z0-9\-\.]+)\.([a-zA-Z]{2,})(\/[^\s]*)?$/,
      },
      confirmDialog: {
        title: "",
        message: "",
      },
      completeDialog: {
        title: "",
        message: "",
      },
      deleteCompleteDialog: {
        title: "",
        message: "",
      },
    };
  },
  computed: {
    formTitle() {
      return this.bookmarkRegistUpdateForm.isUpdateMode === 1 ? "お気に入りサイト情報更新" : "お気に入りサイト新規登録";
    },
    isSubmitEnabled() {
      return !!this.bookmarkRegistUpdateForm.title && !!this.bookmarkRegistUpdateForm.url;
    },
  },
  methods: {
    resetValidationErrors() {
      this.validError.requiredTitle = false;
      this.validError.requiredUrl = false;
      this.validError.invalidTitleChars = false;
      this.validError.invalidUrlFormat = false;
    },
    doValidation() {
      this.resetValidationErrors(); // まずエラーをリセット
      let isValid = true;

      if (!this.bookmarkRegistUpdateForm.title) { // サイト名必須チェック
        this.validError.requiredTitle = true;
        isValid = false;
      } else {
        if (!this.validationRules.titleRegex.test(this.bookmarkRegistUpdateForm.title)) { // サイト名文字種チェック
          this.validError.invalidTitleChars = true;
          isValid = false;
        }
      }

      if (!this.bookmarkRegistUpdateForm.url) { // URL必須チェック
        this.validError.requiredUrl = true;
        isValid = false;
      } else {
        if (!this.validationRules.urlRegex.test(this.bookmarkRegistUpdateForm.url)) { // URL形式チェック
          this.validError.invalidUrlFormat = true;
          isValid = false;
        }
      }

      return isValid;
    },
    submitForm() {
      if (this.doValidation()) { // バリデーションOKなら確認ダイアログ表示
        this.confirmDialog.title = this.bookmarkRegistUpdateForm.isUpdateMode === 1 ? "サイト情報更新確認" : "サイト情報登録確認";
        this.confirmDialog.message = this.bookmarkRegistUpdateForm.isUpdateMode === 1 ? "この内容で更新します。よろしいですか？" : "これで登録します。よろしいですか？";
        this.dialog.isSiteRegistUpdateConfirmOpen = true;
      } else {
        console.log("Validation failed");
      }
    },
    async submitConfirmed() {
      const data = {
        type: this.bookmarkRegistUpdateForm.isUpdateMode === 1 ? "update" : "regist",
        contents_id: this.bookmarkRegistUpdateForm.isUpdateMode === 1 ? this.bookmarkRegistUpdateForm.contents_id : undefined, // contents_id を使用
        title: this.functions.escapeText(this.bookmarkRegistUpdateForm.title),
        url: this.bookmarkRegistUpdateForm.url,
        owner_id: this.loginUser.ownerId,
        token: this.functions.generateRandomAlphanumericString(16),
      };

      Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);
      let param = this.functions.convertObjectToURLSearchParams(data);

      axios
        .post(this.path.bookmarkRegistUpdate, param)
        .then((response) => {
          if (response.data && response.data.type === "success") { // axiosの実行で「response.data.type = 'success'」を受け取った場合
            this.completeDialog.title = this.bookmarkRegistUpdateForm.isUpdateMode === 1 ? "更新完了" : "登録完了";
            this.completeDialog.message = `${this.bookmarkRegistUpdateForm.isUpdateMode === 1 ? 'お気に入りサイト情報を更新' : 'お気に入りサイトを登録'}しました。3秒後にリロードします。`;
            this.dialog.isSiteRegistUpdateCompleteOpen = true;
            this.functions.reloadPageAfterDelay(3); // 3秒後にリロードする
          } else { // axiosの実行で「response.data.type = 'success'」を受け取れなかった場合
            this.completeDialog.title = "エラー";
            this.completeDialog.message = response.data?.message || (this.bookmarkRegistUpdateForm.isUpdateMode === 1 ? "申し訳ありません。お気に入りサイト更新できませんでした。" : "申し訳ありません。お気に入りサイト登録できませんでした。");
            this.dialog.isSiteRegistUpdateCompleteOpen = true;
          }
        })
        .catch((error) => { // .catch部のエラーに該当する場合の記述も、変数を現在dataに設定されている該当のダイアログのものに書き換える
          this.completeDialog.title = "エラー";
          let errorMessage = this.bookmarkRegistUpdateForm.isUpdateMode === 1 ? "お気に入りサイト更新中にエラーが発生しました。" : "お気に入りサイト登録中にエラーが発生しました。";
          if (error.response) {
            console.error("Error Response:", error.response);
            // APIからのエラーメッセージがあればそれを優先し、なければデフォルトメッセージにステータスコードを追加
            errorMessage = error.response.data?.message || `通信エラーが発生しました。(Status: ${error.response.status}) ${errorMessage}`;
          } else if (error.request) {
            console.error("Error Request:", error.request);
            errorMessage = "サーバーに接続できませんでした。";
          } else {
            console.error("Error:", error.message);
            errorMessage = "リクエストの設定中にエラーが発生しました。";
          }
          this.completeDialog.message = errorMessage;
          this.dialog.isSiteRegistUpdateCompleteOpen = true;
        });
    },
    handleShowForm(payload) {
      this.isFormVisible = true;
      this.bookmarkRegistUpdateForm.isUpdateMode = payload.mode === 'update' ? 1 : 0;
      this.resetValidationErrors();

      if (payload.mode === 'update' && payload.bookmarkData) {
        this.defaultUpdateForm = JSON.parse(JSON.stringify(payload.bookmarkData)); // 更新前のデータをディープコピーして保持 (リセット用)
        this.bookmarkRegistUpdateForm.contents_id = payload.bookmarkData.contents_id; // contents_id を使用
        this.bookmarkRegistUpdateForm.title = payload.bookmarkData.title || "";
        this.bookmarkRegistUpdateForm.url = payload.bookmarkData.url || "";
      } else { // 新規登録モードの場合、フォームをクリア
        this.defaultUpdateForm = null;
        this.bookmarkRegistUpdateForm.contents_id = null; // contents_id を使用
        this.bookmarkRegistUpdateForm.title = "";
        this.bookmarkRegistUpdateForm.url = "";
      }
    },
    handleCloseForm() {
      this.isFormVisible = false;
      this.resetValidationErrors(); // フォームを閉じる際にもエラーをリセットする
    },
    handleDeleteConfirmation(payload) { // 削除確認処理
      if (payload && payload.bookmarkData && payload.bookmarkData.contents_id) {
        this.selectedDeleteContentsId = payload.bookmarkData.contents_id;
        this.dialog.isSiteDeleteConfirmOpen = true; // 削除確認用ダイアログを開く
      } else {
        console.error("削除対象のデータが見つかりません。", payload);
      }
    },
    cancelDeleteConfirmation() { // 削除キャンセル処理
      this.selectedDeleteContentsId = null;
      this.dialog.isSiteDeleteConfirmOpen = false;
    },
    async submitDelete() { // 削除実行処理
      this.dialog.isSiteDeleteConfirmOpen = false;

      if (!this.selectedDeleteContentsId) {
        console.error("削除対象のIDが選択されていません。");
        this.deleteCompleteDialog.title = "エラー";
        this.deleteCompleteDialog.message = "削除対象が見つかりません。";
        this.dialog.isSiteDeleteCompleteOpen = true;
        return;
      }

      const data = {
        type: "delete",
        contents_id: this.selectedDeleteContentsId,
        createdUserId: this.loginUser.ownerId, // ログインユーザーIDを使用
        token: this.functions.generateRandomAlphanumericString(16),
      };

      Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);
      let param = this.functions.convertObjectToURLSearchParams(data);

      axios
        .post(this.path.bookmarkRegistUpdate, param) // ブックマーク用のAPIエンドポイントを使用
        .then((response) => {
          if (response.data && response.data.type === "success") { // axiosの実行で「response.data.type = 'success'」を受け取った場合
            this.deleteCompleteDialog.title = "削除完了";
            this.deleteCompleteDialog.message = '削除しました。3秒後にリロードします。';
            this.dialog.isSiteDeleteCompleteOpen = true;
            this.functions.reloadPageAfterDelay(3); // 3秒後にリロードする
          } else { // axiosの実行で「response.data.type = 'success'」を受け取れなかった場合
            this.deleteCompleteDialog.title = "エラー";
            this.deleteCompleteDialog.message = response.data?.message || "申し訳ありません。お気に入りサイト削除できませんでした。";
            this.dialog.isSiteDeleteCompleteOpen = true;
          }
        })
        .catch((error) => {
          this.deleteCompleteDialog.title = "エラー";
          let errorMessage = "お気に入りサイト削除中にエラーが発生しました。";
          if (error.response) {
            console.error("Error Response:", error.response);
            errorMessage = error.response.data?.message || `通信エラーが発生しました。(Status: ${error.response.status}) ${errorMessage}`;
          } else if (error.request) {
            console.error("Error Request:", error.request);
            errorMessage = "サーバーに接続できませんでした。";
          } else {
            console.error("Error:", error.message);
            errorMessage = "リクエストの設定中にエラーが発生しました。";
          }
          this.deleteCompleteDialog.message = errorMessage;
          this.dialog.isSiteDeleteCompleteOpen = true; // 完了ダイアログを開く
        })
        .finally(() => { // 成功・失敗に関わらず、削除対象IDをリセット
          this.selectedDeleteContentsId = null;
        });
    },
  },
});

export default bookmarkRegistUpdateForm;
