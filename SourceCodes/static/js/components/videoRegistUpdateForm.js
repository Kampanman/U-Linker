// videoRegistUpdateForm.js
import usersVideoArea from './usersVideoArea.js';

let videoRegistUpdateForm = Vue.component("video-regist-update-form", {
  template: `
    <div class="video-regist-update-form-group">
      <div class="user-video-area">
        <users-video-area
          ref="usersVideoArea"
          :path="path"
          :flag="flag"
          :functions="functions"
          :dialog="dialog"
          :login-user="loginUser"
          @request-show-form="handleShowForm"
          @request-close-form="handleCloseForm"
          @request-delete-confirmation="handleDeleteConfirmation"
        ></users-video-area>
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
                    v-model="videoRegistUpdateForm.title"
                    label="タイトル"
                    maxlength="100"
                    required
                    counter="100"
                    data-parts-id="exises-07-01"
                    :data-contents-id="videoRegistUpdateForm.contents_id || ''"
                  ></v-text-field>
                  <p class="valid-errors" v-if="validError.requiredTitle" @click="validError.requiredTitle=false">{{ validError.message.required }}</p>
                  <p class="valid-errors" v-if="validError.invalidTitleChars" @click="validError.invalidTitleChars=false">{{ validError.message.invalidTitleChars }}</p>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="videoRegistUpdateForm.url"
                    label="URL"
                    required
                    data-parts-id="exises-07-02"
                  ></v-text-field>
                  <p class="valid-errors" v-if="validError.requiredUrl" @click="validError.requiredUrl=false">{{ validError.message.required }}</p>
                  <p class="valid-errors" v-if="validError.invalidUrlFormat" @click="validError.invalidUrlFormat=false">{{ validError.message.invalidUrlFormat }}</p>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="videoRegistUpdateForm.tags"
                    label="タグワード (カンマ区切り)"
                    maxlength="100"
                    counter="100"
                    data-parts-id="exises-07-03"
                  ></v-text-field>
                  <p class="valid-errors" v-if="validError.invalidTagChars" @click="validError.invalidTagChars=false">{{ validError.message.invalidTagChars }}</p>
                </v-col>
                <v-col cols="12" sm="3">
                  <v-select
                    v-model="videoRegistUpdateForm.publicity"
                    :items="publicityItems"
                    item-text="text"
                    item-value="value"
                    label="公開設定"
                    required
                    data-parts-id="exises-07-04-01"
                  ></v-select>
                  <p class="valid-errors" v-if="validError.requiredPublicity" @click="validError.requiredPublicity=false">{{ validError.message.requiredSelect }}</p>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions justify="center">
            <v-row justify="center" class="w-100 mt-4">
              <v-btn
                v-if="videoRegistUpdateForm.isUpdateMode === 0"
                :disabled="!isSubmitEnabled"
                color="#8d0000"
                class="white--text mr-1"
                data-parts-id="exises-07-05-01"
                @click="submitForm"
              >これで登録する</v-btn>
              <v-btn
                v-if="videoRegistUpdateForm.isUpdateMode === 1"
                :disabled="!isSubmitEnabled"
                color="#8d0000"
                class="white--text mr-1"
                data-parts-id="exises-07-05-02"
                @click="submitForm"
              >これで更新する</v-btn>
              <v-btn class="white-button" data-parts-id="exises-07-05-03" @click="resetForm">リセット</v-btn>
            </v-row>
          </v-card-actions>
        </v-form>

        <!-- 登録・更新確認ダイアログ -->
        <v-dialog v-model="dialog.isVideoRegistUpdateConfirmOpen" persistent max-width="500">
          <v-card>
            <v-card-title class="headline">{{ registUpdateConfirmDialog.title }}</v-card-title>
            <v-card-text>{{ registUpdateConfirmDialog.message }}</v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="green darken-1" text @click="dialog.isVideoRegistUpdateConfirmOpen=false; submitConfirmed()">はい</v-btn>
              <v-btn color="red darken-1" text @click="dialog.isVideoRegistUpdateConfirmOpen=false">いいえ</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- 登録・更新完了ダイアログ -->
        <v-dialog v-model="dialog.isVideoRegistUpdateCompleteOpen" persistent max-width="500">
          <v-card>
            <v-card-title class="headline">{{ registUpdateCompleteDialog.title }}</v-card-title>
            <v-card-text>{{ registUpdateCompleteDialog.message }}</v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="red darken-1" text @click="dialog.isVideoRegistUpdateCompleteOpen=false">閉じる</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-card>

      <!-- 削除確認ダイアログ -->
      <v-dialog v-model="dialog.isVideoDeleteConfirmOpen" persistent max-width="500">
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
      <v-dialog v-model="dialog.isVideoDeleteCompleteOpen" persistent max-width="500">
        <v-card>
          <v-card-title class="headline">{{ deleteCompleteDialog.title }}</v-card-title>
          <v-card-text>{{ deleteCompleteDialog.message }}</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red darken-1" text @click="dialog.isVideoDeleteCompleteOpen=false">閉じる</v-btn>
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
    usersVideoArea,
  },
  data() {
    return {
      isFormVisible: false,
      videoRegistUpdateForm: {
        isUpdateMode: 0,
        contents_id: null,
        title: "",
        url: "",
        tags: "",
        publicity: 1, // デフォルトは「公開」
      },
      selectedDeleteContentsId: null, // 削除対象のIDを保持
      defaultUpdateForm: null,
      publicityItems: [
        { text: "公開", value: 1 },
        { text: "講師にのみ公開", value: 2 },
        { text: "非公開", value: 0 },
      ],
      validError: {
        requiredTitle: false,
        requiredUrl: false,
        requiredPublicity: false,
        invalidTitleChars: false,
        invalidTagChars: false,
        invalidUrlFormat: false,
        message: {
          required: '入力必須項目です。',
          requiredSelect: '選択必須項目です。',
          invalidTitleChars: "タイトルに使用できない文字が含まれています。",
          invalidTagChars: "タグに使用できない文字が含まれています。",
          invalidUrlFormat: "有効なYouTube動画のURL形式ではありません。",
        }
      },
      validationRules: {
        titleRegex: /(?=.*[a-zA-Z0-9ａ-ｚＡ-Ｚ０-９\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF々].*[a-zA-Z0-9ａ-ｚＡ-Ｚ０-９\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF々])/,
        tagRegex: /(?=.*[a-zA-Z0-9ａ-ｚＡ-Ｚ０-９\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF々].*[a-zA-Z0-9ａ-ｚＡ-Ｚ０-９\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF々])/,
        youtubeRegex: /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+(&.*)?$/,
      },
      registUpdateConfirmDialog: {
        title: "",
        message: "",
      },
      registUpdateCompleteDialog: {
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
      return this.videoRegistUpdateForm.isUpdateMode === 1 ? "ビデオ情報更新" : "ビデオ新規登録";
    },
    isSubmitEnabled() {
      return !!this.videoRegistUpdateForm.title && !!this.videoRegistUpdateForm.url;
    },
  },
  methods: {
    resetValidationErrors() {
      this.validError.requiredTitle = false;
      this.validError.requiredUrl = false;
      this.validError.requiredPublicity = false;
      this.validError.invalidTitleChars = false;
      this.validError.invalidTagChars = false;
      this.validError.invalidUrlFormat = false;
    },
    doValidation() {
      this.resetValidationErrors(); // まずエラーをリセット
      let isValid = true;

      if (!this.videoRegistUpdateForm.title) { // タイトル必須チェック
        this.validError.requiredTitle = true;
        isValid = false;
      } else {
        if (!this.validationRules.titleRegex.test(this.videoRegistUpdateForm.title)) { // タイトル文字種チェック
          this.validError.invalidTitleChars = true;
          isValid = false;
        }
      }

      if (!this.videoRegistUpdateForm.url) { // URL必須チェック
        this.validError.requiredUrl = true;
        isValid = false;
      } else {
        if (!this.validationRules.youtubeRegex.test(this.videoRegistUpdateForm.url)) { // URL形式チェック
          this.validError.invalidUrlFormat = true;
          isValid = false;
        }
      }

      if (this.videoRegistUpdateForm.tags && !this.validationRules.tagRegex.test(this.videoRegistUpdateForm.tags.replace(/,/g, ''))) { // タグ文字種チェック (空でなければ)
        this.validError.invalidTagChars = true;
        isValid = false;
      }

      if (this.videoRegistUpdateForm.publicity === null || this.videoRegistUpdateForm.publicity === undefined) { // 公開設定必須チェック
        this.validError.requiredPublicity = true;
        isValid = false;
      }

      return isValid;
    },
    resetForm() {
      this.resetValidationErrors(); // カスタムエラーをリセット

      if (this.videoRegistUpdateForm.isUpdateMode === 1 && this.defaultUpdateForm) {
        // 更新モードの場合は編集開始時のデータ (defaultUpdateForm) に戻す
        this.videoRegistUpdateForm.contents_id = this.defaultUpdateForm.contents_id;
        this.videoRegistUpdateForm.title = this.defaultUpdateForm.title || "";
        this.videoRegistUpdateForm.url = this.defaultUpdateForm.url || "";
        this.videoRegistUpdateForm.tags = this.defaultUpdateForm.tags || "";
        this.videoRegistUpdateForm.publicity = typeof this.defaultUpdateForm.publicity === 'number' ? this.defaultUpdateForm.publicity : 1;
      } else {
        // 新規登録モードの場合 (または defaultUpdateForm がない場合): フォームを完全に空にする
        this.videoRegistUpdateForm.isUpdateMode = 0; // モードを新規登録にする
        this.videoRegistUpdateForm.contents_id = null;
        this.videoRegistUpdateForm.title = "";
        this.videoRegistUpdateForm.url = "";
        this.videoRegistUpdateForm.tags = "";
        this.videoRegistUpdateForm.publicity = 1;
      }
    },
    submitForm() {
      // カスタムバリデーションを実行
      if (this.doValidation()) { // バリデーションOKなら確認ダイアログ表示
        this.registUpdateConfirmDialog.title = this.videoRegistUpdateForm.isUpdateMode === 1 ? "ビデオ情報更新確認" : "ビデオ情報登録確認";
        this.registUpdateConfirmDialog.message = this.videoRegistUpdateForm.isUpdateMode === 1 ? "この内容で更新します。よろしいですか？" : "これで登録します。よろしいですか？";
        this.dialog.isVideoRegistUpdateConfirmOpen = true;
      } else {
        console.log("Validation failed");
      }
    },
    async submitConfirmed() {
      const data = {
        type: this.videoRegistUpdateForm.isUpdateMode === 1 ? "update" : "regist",
        contents_id: this.videoRegistUpdateForm.isUpdateMode === 1 ? this.videoRegistUpdateForm.contents_id : undefined,
        title: this.functions.escapeText(this.videoRegistUpdateForm.title),
        url: this.videoRegistUpdateForm.url,
        tags: this.functions.escapeText(this.videoRegistUpdateForm.tags),
        publicity: this.videoRegistUpdateForm.publicity,
        owner_id: this.loginUser.ownerId,
        token: this.functions.generateRandomAlphanumericString(16),
      };

      Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);
      let param = this.functions.convertObjectToURLSearchParams(data);

      axios
        .post(this.path.videoRegistUpdate, param)
        .then((response) => {
          if (response.data && response.data.type === "success") { // axiosの実行で「response.data.type = 'success'」を受け取った場合
            this.registUpdateCompleteDialog.title = this.videoRegistUpdateForm.isUpdateMode === 1 ? "更新完了" : "登録完了";
            this.registUpdateCompleteDialog.message = `${this.videoRegistUpdateForm.isUpdateMode === 1 ? 'ビデオ情報を更新' : 'ビデオを登録'}しました。3秒後にリロードします。`;
            this.dialog.isVideoRegistUpdateCompleteOpen = true;
            this.functions.reloadPageAfterDelay(3); // 3秒後にリロードする
          } else { // axiosの実行で「response.data.type = 'success'」を受け取れなかった場合
            this.registUpdateCompleteDialog.title = "エラー"; // APIからエラーが返却された場合の記述は、変数を現在dataに設定されている該当のダイアログのものに書き換える
            this.registUpdateCompleteDialog.message = response.data?.message || (this.videoRegistUpdateForm.isUpdateMode === 1 ? "申し訳ありません。ビデオ更新できませんでした。" : "申し訳ありません。ビデオ登録できませんでした。");
            this.dialog.isVideoRegistUpdateCompleteOpen = true;
          }
        })
        .catch((error) => {
          this.registUpdateCompleteDialog.title = "エラー"; // .catch部のエラーに該当する場合の記述も、変数を現在dataに設定されている該当のダイアログのものに書き換える
          let errorMessage = this.videoRegistUpdateForm.isUpdateMode === 1 ? "ビデオ更新中にエラーが発生しました。" : "ビデオ登録中にエラーが発生しました。";
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
          this.registUpdateCompleteDialog.message = errorMessage;
          this.dialog.isVideoRegistUpdateCompleteOpen = true;
        });
    },
    handleShowForm(payload) {
      this.isFormVisible = true;
      this.videoRegistUpdateForm.isUpdateMode = payload.mode === 'update' ? 1 : 0;
      this.resetValidationErrors();

      if (payload.mode === 'update' && payload.videoData) {
        this.defaultUpdateForm = JSON.parse(JSON.stringify(payload.videoData));
        this.videoRegistUpdateForm.contents_id = payload.videoData.contents_id;
        this.videoRegistUpdateForm.title = payload.videoData.title || "";
        this.videoRegistUpdateForm.url = payload.videoData.url || "";
        this.videoRegistUpdateForm.tags = payload.videoData.tags || "";
        this.videoRegistUpdateForm.publicity = typeof payload.videoData.publicity === 'number' ? payload.videoData.publicity : 1;
      } else {
        this.defaultUpdateForm = null;
        this.videoRegistUpdateForm.contents_id = null;
        this.videoRegistUpdateForm.title = "";
        this.videoRegistUpdateForm.url = "";
        this.videoRegistUpdateForm.tags = "";
        this.videoRegistUpdateForm.publicity = 1;
      }
    },
    handleCloseForm() {
      this.isFormVisible = false;
      this.resetValidationErrors(); // フォームを閉じる際にもエラーをリセットする
    },
    handleDeleteConfirmation(payload) { // 削除対象のIDを保存し、確認ダイアログを開く
      this.isFormVisible = true;
      this.selectedDeleteContentsId = payload.videoData.contents_id;
      this.dialog.isVideoDeleteConfirmOpen = true;
    },
    cancelDeleteConfirmation() { // 削除対象IDをリセットし、確認ダイアログを閉じる
      this.selectedDeleteContentsId = null;
      this.dialog.isVideoDeleteConfirmOpen = false;
    },
    async submitDelete() { // 確認ダイアログ「いいから消せ」クリック時の処理 (API呼び出し)
      this.dialog.isVideoDeleteConfirmOpen = false;
      if (!this.selectedDeleteContentsId) {
        console.error("削除対象のIDが選択されていません。");
        this.deleteCompleteDialog.title = "エラー";
        this.deleteCompleteDialog.message = "削除対象が見つかりません。";
        this.dialog.isVideoDeleteCompleteOpen = true;
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
        .post(this.path.videoRegistUpdate, param) // video用のAPIエンドポイントを使用
        .then((response) => {
          if (response.data && response.data.type === "success") { // axiosの実行で「response.data.type = 'success'」を受け取った場合
            this.deleteCompleteDialog.title = "削除完了";
            this.deleteCompleteDialog.message = '削除しました。3秒後にリロードします。';
            this.dialog.isVideoDeleteCompleteOpen = true;
            this.functions.reloadPageAfterDelay(3); // 3秒後にリロードする
          } else { // axiosの実行で「response.data.type = 'success'」を受け取れなかった場合
            this.deleteCompleteDialog.title = "エラー";
            this.deleteCompleteDialog.message = response.data?.message || "申し訳ありません。ビデオ削除できませんでした。";
            this.dialog.isVideoDeleteCompleteOpen = true;
          }
        })
        .catch((error) => {
          this.deleteCompleteDialog.title = "エラー";
          let errorMessage = "ビデオ削除中にエラーが発生しました。";
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
          this.dialog.isVideoDeleteCompleteOpen = true; // 完了ダイアログを開く
        })
        .finally(() => { // 成功・失敗に関わらず、削除対象IDをリセット
          this.selectedDeleteContentsId = null;
        });
    },
  },
});

export default videoRegistUpdateForm;
