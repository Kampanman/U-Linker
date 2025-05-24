// userRegistUpdateForm.js
import accountTableArea from './accountTableArea.js';

let userRegistUpdateForm = Vue.component("user-regist-update-form", {
  template: `
    <div>
      <div class="login-form-container">
        <account-table-area
          v-if="loginUser.isTeacher==1"
          :path="path"
          :flag="flag"
          :functions="functions"
          :dialog="dialog"
          :login-user="loginUser"
          :is-editing-own-account="isFormEditingOwnAccount"
          @open-regist-form="handleOpenRegistForm"
          @open-update-form="handleOpenUpdateForm"
          @request-stop-user="handleRequestStopUser"
          @request-restart-user="handleRequestRestartUser"
        ></account-table-area>
        <v-card class="mt-4 pa-4 rounded-card" color="#efebde" width="93%" outlined>
          <v-form ref="form" class="form-contents">
            <v-card-title class="headline">
              <span class="area-title">ユーザー登録・更新フォーム</span>
            </v-card-title>
            <v-card-text>
              <v-text-field
                v-model="accountRegistUpdateForm.userName"
                :disabled="accountRegistUpdateForm.isUpdateMode && !accountRegistUpdateForm.isOwnAccount"
                label="ユーザー名（30字以内）"
                data-parts-id="exises-03-01-01 exises-03-02-01"
                required maxlength="30" counter="30"
              ></v-text-field>
              <p class="valid-errors" v-if="validError.includeInvalidStrUserName" @click="validError.includeInvalidStrUserName=false" v-text="validError.message.includeInvalidStrUserName"></p>
              <br />
              <v-text-field
                v-model="accountRegistUpdateForm.loginId"
                :disabled="accountRegistUpdateForm.isUpdateMode && !accountRegistUpdateForm.isOwnAccount"
                label="ログインID（emailアドレス｜100字以内）"
                data-parts-id="exises-03-01-02 exises-03-02-02"
                required maxlength="100" counter="100"></v-text-field>
              <p class="valid-errors" v-if="validError.notEmail" @click="validError.notEmail=false" v-text="validError.message.notEmail"></p>
              <p class="valid-errors" v-if="validError.includeInvalidStrLoginId" @click="validError.includeInvalidStrLoginId=false" v-text="validError.message.includeInvalidStrLoginId"></p>
              <br />
              <v-col class="d-flex justify-center" v-if="accountRegistUpdateForm.isUpdateMode">
                <v-btn
                  v-if="!isPasswordEdit"
                  :disabled="!accountRegistUpdateForm.isOwnAccount"
                  color="#8d0000"
                  class="white--text mr-1"
                  data-parts-id="exises-03-02-03-01"
                  @click="isPasswordEdit = true"
                >パスワード入力エリアを表示</v-btn>
                <v-btn
                  v-if="isPasswordEdit"
                  :disabled="!accountRegistUpdateForm.isOwnAccount"
                  class="white-button"
                  data-parts-id="exises-03-02-03-02"
                  @click="isPasswordEdit = false"
                >パスワードは更新しない</v-btn>
              </v-col>
              <br v-if="accountRegistUpdateForm.isUpdateMode && accountRegistUpdateForm.isOwnAccount" />
              <v-text-field
                v-model="accountRegistUpdateForm.password1"
                label="パスワード（半角英数字8文字以上16文字以内）"
                type="password"
                data-parts-id="exises-03-01-03
                exises-03-02-03-01-01" required
                v-if="!accountRegistUpdateForm.isUpdateMode || (accountRegistUpdateForm.isUpdateMode && isPasswordEdit)"
              ></v-text-field>
              <p class="valid-errors"
                @click="validError.invalidPassRange=false"
                v-text="validError.message.invalidPassRange"
                v-if="(!accountRegistUpdateForm.isUpdateMode || (accountRegistUpdateForm.isUpdateMode && isPasswordEdit)) && validError.invalidPassRange"
              ></p>
              <br v-if="!accountRegistUpdateForm.isUpdateMode || (accountRegistUpdateForm.isUpdateMode && isPasswordEdit)" />
              <v-text-field
                v-model="accountRegistUpdateForm.password2"
                label="パスワード（上と同じ内容を再入力してください）"
                type="password"
                data-parts-id="exises-03-01-04
                exises-03-02-03-01-02" required
                v-if="!accountRegistUpdateForm.isUpdateMode || (accountRegistUpdateForm.isUpdateMode && isPasswordEdit)"
              ></v-text-field>
              <p class="valid-errors"
                @click="validError.notSamePassword=false"
                v-text="validError.message.notSamePassword"
                v-if="(!accountRegistUpdateForm.isUpdateMode || (accountRegistUpdateForm.isUpdateMode && isPasswordEdit)) && validError.notSamePassword"
              ></p>
              <br v-if="!accountRegistUpdateForm.isUpdateMode || (accountRegistUpdateForm.isUpdateMode && isPasswordEdit)" />
              <v-text-field
                v-model="accountRegistUpdateForm.comment"
                :disabled="accountRegistUpdateForm.isUpdateMode && !accountRegistUpdateForm.isOwnAccount"
                label="コメント（100字以内）"
                data-parts-id="exises-03-01-05 exises-03-02-04" maxlength="100"
              ></v-text-field>
              <v-select
                class="auth-selector"
                v-model="accountRegistUpdateForm.authType"
                :disabled="isAuthSelectDisabled"
                :items="['一般', '講師']"
                label="ユーザー権限"
                data-parts-id="exises-03-02-05"
                item-value="value"
                item-text="text"
                v-if="accountRegistUpdateForm.isUpdateMode"
              >
                <template v-slot:item="{ item }">
                  <span data-parts-id="exises-03-02-05-01">{{ item }}</span>
                </template>
              </v-select>
            </v-card-text>
            <v-card-actions justify="center">
              <v-row justify="center" class="w-100 mt-4">
                <v-btn
                  v-if="!accountRegistUpdateForm.isUpdateMode"
                  :disabled="!abled"
                  color="#8d0000"
                  class="white--text mr-1"
                  data-parts-id="exises-03-01-06"
                  @click="submit"
                >新規登録</v-btn>
                <v-btn
                  v-if="accountRegistUpdateForm.isUpdateMode && (loginUser.isTeacher == 1 || (loginUser.isTeacher == 0 && accountRegistUpdateForm.isOwnAccount))"
                  :disabled="!abled"
                  color="#8d0000"
                  class="white--text mr-1"
                  data-parts-id="exises-03-02-06"
                  @click="submit"
                >更新</v-btn>
                <v-btn class="white-button" @click="resetForm" data-parts-id="exises-03-01-07 exises-03-02-07">リセット</v-btn>
              </v-row>
            </v-card-actions>
            <v-dialog v-model="dialog.isUserRegistUpdateConfirmOpen" persistent max-width="500">
              <v-card>
                <v-card-title class="headline">{{ registUpdateDialog.confirm.title }}</v-card-title>
                <v-card-text>{{ registUpdateDialog.confirm.message }}</v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="green darken-1" text @click="dialog.isUserRegistUpdateConfirmOpen=false;submitConfirmed()">はい</v-btn>
                  <v-btn color="red darken-1" text @click="dialog.isUserRegistUpdateConfirmOpen=false">いいえ</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-dialog v-model="dialog.isUserRegistUpdateCompleteOpen" persistent max-width="500">
              <v-card>
                <v-card-title class="headline">{{ registUpdateDialog.complete.title }}</v-card-title>
                <v-card-text>{{ registUpdateDialog.complete.message }}</v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="red darken-1" text @click="dialog.isUserRegistUpdateCompleteOpen=false">閉じる</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-dialog v-model="dialog.accountStopConfirmOpen" persistent max-width="500">
              <v-card>
                <v-card-title class="headline">アカウント停止確認</v-card-title>
                <v-card-text>選択されたアカウントを停止します。よろしいですか？</v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <!-- 「はい」ボタンのクリックイベントを confirmStopUser に変更 -->
                  <v-btn color="green darken-1" text @click="confirmStopUser">はい</v-btn>
                  <v-btn color="red darken-1" text @click="dialog.accountStopConfirmOpen=false">いいえ</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-dialog v-model="dialog.accountStopRestartCompleteOpen" persistent max-width="500">
              <v-card>
                <v-card-title class="headline">{{ statusCompleteTitle }}</v-card-title>
                <v-card-text>{{ statusCompleteMessage }}</v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="red darken-1" text @click="dialog.accountStopRestartCompleteOpen=false">閉じる</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-form>
        </v-card>
      </div>
    </div>
  `,
  props: {
    path: Object,
    flag: Object,
    dialog: Object,
    functions: Object,
    selectedUser: Object,
    loginUser: Object,
  },
  components: {
    accountTableArea,
  },
  data() {
    return {
      abled: false,
      isFormEditingOwnAccount: false,
      isPasswordEdit: false,
      userToStop: null,
      statusCompleteTitle: '',
      statusCompleteMessage: '',
      validError: {
        notEmail: false,
        includeInvalidStrLoginId: false,
        includeInvalidStrUserName: false,
        invalidPassRange: false,
        notSamePassword: false,
        message: {
          notEmail: "ログインIDがメールアドレスの形式ではありません",
          includeInvalidStrLoginId: "ログインIDに不適切な文字が含まれています",
          includeInvalidStrUserName: "ユーザー名に不適切な文字が含まれています",
          invalidPassRange: "パスワードが半角英数字8文字以上16文字以内の形式（半角数字を1文字以上含む）ではありません",
          notSamePassword: "パスワードが一致しません",
        }
      },
      registUpdateDialog: {
        confirm: {
          title: "ユーザー情報登録確認",
          message: "これで登録します。よろしいですか？",
        },
        complete: {
          title: "",
          message: "",
        },
      },
      accountRegistUpdateForm: {
        isUpdateMode: true,
        isOwnAccount: true,
        userName: "",
        loginId: "",
        password1: "",
        password2: "",
        authType: '一般',
        comment: "",
      },
    };
  },
  computed: {
    /**
     * ユーザー権限の v-select を無効にするかどうかを判定します。
     * @returns {boolean} 無効にする場合は true
     */
    isAuthSelectDisabled() {
      const isGeneralUser = this.loginUser.isTeacher === 0;
      const isTeacherUser = this.loginUser.isTeacher === 1 && this.loginUser.isMaster === 0;
      const isMasterUser = this.loginUser.isMaster === 1;
      const isEditingOwnAccount = this.accountRegistUpdateForm.isOwnAccount;
      // selectedUserが存在し、かつそのユーザーがマスターユーザーかどうか
      const isEditingMasterUser = this.selectedUser && this.selectedUser.isMaster === 1;

      // ログインユーザーが一般ユーザーの場合は常に無効
      if (isGeneralUser) return true;

      // ログインユーザーが講師の場合
      if (isTeacherUser) {
        // 自分のアカウントを編集している場合、または編集対象がマスターユーザーの場合は無効
        return isEditingOwnAccount || isEditingMasterUser;
      }

      // ログインユーザーがマスターユーザーの場合
      if (isMasterUser) {
        // 自分のアカウントを編集している場合は無効
        return isEditingOwnAccount;
      }

      // 上記のいずれにも該当しない場合
      return false;
    }
  },
  watch: {
    // selectedUser プロパティの変更を監視
    selectedUser(newUser, oldUser) {
      // selectedUser が変更されたらフォームの状態を更新する
      if (newUser !== oldUser) this.initializeFormBasedOnSelectedUser(newUser);
    },
    'accountRegistUpdateForm.userName': function () { this.checkAbled(); },
    'accountRegistUpdateForm.loginId': function () { this.checkAbled(); },
    'accountRegistUpdateForm.password1': function () { this.checkAbled(); },
    'accountRegistUpdateForm.password2': function () { this.checkAbled(); },
    'accountRegistUpdateForm.authType': function () { this.checkAbled(); },
    isPasswordEdit(newVal) {
      if (!newVal && this.accountRegistUpdateForm.isUpdateMode) {
        this.accountRegistUpdateForm.password1 = "";
        this.accountRegistUpdateForm.password2 = "";
        this.validError.invalidPassRange = false;
        this.validError.notSamePassword = false;
      }
      this.checkAbled();
    },
  },
  methods: {
    initializeFormBasedOnSelectedUser(user) {
      // selectedUser に基づいてフォームの初期状態を設定する
      if (user && user.ownerId) {
        if (user.ownerId === this.loginUser.ownerId) {
          // 自分自身の編集モード
          this.updateOwnAccountMode();
        } else {
          // 他のユーザーの編集モード
          this.reflectParamsInForm(user);
        }
      } else {
        // 新規登録モード (selectedUser が null や undefined の場合)
        this.registNewAccountMode();
      }
    },
    /**
     * フォームの共通状態（Vuetifyバリデーション、カスタムエラー、パスワード編集フラグ）をリセット
     * @private
     */
    resetCommonFormState() {
      // Vuetifyのバリデーション状態をリセット
      if (this.$refs.form) this.$refs.form.resetValidation();
      // カスタムバリデーションエラーフラグをリセット
      this.resetValidationErrors();
      // パスワード編集フラグをリセット
      this.isPasswordEdit = false;
    },
    resetValidationErrors() {
      // バリデーションエラーフラグをリセット
      this.validError.notEmail = false;
      this.validError.includeInvalidStrLoginId = false;
      this.validError.includeInvalidStrUserName = false;
      this.validError.invalidPassRange = false;
      this.validError.notSamePassword = false;
    },
    doValidation() {
      // メールアドレス形式チェック
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      this.validError.notEmail = !emailRegex.test(this.accountRegistUpdateForm.loginId);
      // ログインIDの不正文字チェック
      const invalidCharRegex = /[^\x20-\x7E]|[ぁ-んァ-ン一-龥]|[\&$%#`]/;
      this.validError.includeInvalidStrLoginId = invalidCharRegex.test(this.accountRegistUpdateForm.loginId);
      // ユーザー名の不正文字チェック
      const userNameInvalidStrTest = /[%$#`@]/.test(this.accountRegistUpdateForm.userName);
      this.validError.includeInvalidStrUserName = userNameInvalidStrTest;

      // パスワード関連のバリデーション (新規登録時、または更新モードでパスワード編集中の場合)
      if (!this.accountRegistUpdateForm.isUpdateMode || this.isPasswordEdit) {
        // パスワード形式チェック
        const passwordRegex = /^(?=.*[0-9])[a-zA-Z0-9]{8,16}$/;
        this.validError.invalidPassRange = !passwordRegex.test(this.accountRegistUpdateForm.password1);
        // パスワード一致チェック
        this.validError.notSamePassword = this.accountRegistUpdateForm.password1 !== this.accountRegistUpdateForm.password2;
      } else {
        // 更新モードでパスワードを編集しない場合はエラーをクリア
        this.validError.invalidPassRange = false;
        this.validError.notSamePassword = false;
      }

      // いずれかのエラーがあれば false を返す
      return !(
        this.validError.notEmail ||
        this.validError.includeInvalidStrLoginId ||
        this.validError.includeInvalidStrUserName ||
        this.validError.invalidPassRange ||
        this.validError.notSamePassword
      );
    },
    reflectParamsInForm() {
      // selectedUser プロパティの変更を監視してフォーム内容を更新する
      if (this.selectedUser && this.selectedUser.ownerId) {
        // ログインユーザー自身の編集の場合は updateOwnAccountMode で処理されるので、それ以外のユーザーの編集の場合のみを対象とする。
        if (this.selectedUser.ownerId !== this.loginUser.ownerId) {
          if (this.$refs.form) this.$refs.form.resetValidation();
          this.accountRegistUpdateForm = {
            isUpdateMode: true,
            isOwnAccount: false,
            ownerId: this.selectedUser.ownerId,
            userName: this.selectedUser.userName || "",
            loginId: this.selectedUser.email || "",
            password1: "",
            password2: "",
            authType: this.selectedUser.isTeacher === 1 ? '講師' : '一般',
            comment: this.functions.decodeText ? this.functions.decodeText(this.selectedUser.comment || "") : (this.selectedUser.comment || ""),
          };
          this.isPasswordEdit = false;
          this.resetValidationErrors();
          this.checkAbled();
        }
      }
    },
    reflectParamsInForm(user) {
      // user が渡されていない、または ownerId がない場合は何もしない
      if (!user || !user.ownerId) return;
      // ログインユーザー自身の編集の場合はupdateOwnAccountModeで処理されるので、ここでは何もしない
      if (user.ownerId == this.loginUser.ownerId) {
        this.updateOwnAccountMode();
        return;
      }

      // 他のユーザーの編集処理
      this.resetCommonFormState();
      this.isFormEditingOwnAccount = false;

      this.accountRegistUpdateForm = {
        isUpdateMode: true,
        isOwnAccount: false,
        ownerId: user.ownerId,
        userName: user.userName || "",
        loginId: user.email || "",
        password1: "",
        password2: "",
        authType: user.isTeacher === 1 ? '講師' : '一般',
        comment: this.functions.decodeText ? this.functions.decodeText(user.comment || "") : (user.comment || ""),
      };
      this.checkAbled();
    },
    registNewAccountMode() {
      this.resetCommonFormState();
      this.isFormEditingOwnAccount = false;

      // フォームデータを新規登録用に初期化
      this.accountRegistUpdateForm = {
        isUpdateMode: false,
        isOwnAccount: false,
        ownerId: null,
        userName: "",
        loginId: "",
        password1: "",
        password2: "",
        authType: '一般',
        comment: "",
      };
      this.checkAbled();
    },
    updateOwnAccountMode() {
      this.resetCommonFormState();
      this.isFormEditingOwnAccount = true;

      // フォームデータをログインユーザー情報で初期化
      this.accountRegistUpdateForm = {
        isUpdateMode: true,
        isOwnAccount: true,
        ownerId: this.loginUser.ownerId,
        userName: this.loginUser.userName,
        loginId: this.loginUser.email,
        password1: "",
        password2: "",
        authType: (this.loginUser.isTeacher == 1) ? '講師' : '一般',
        // コメントはデコードして表示
        comment: this.functions.decodeText ? this.functions.decodeText(this.loginUser.comment || "") : (this.loginUser.comment || ""),
      };
      this.checkAbled();
    },
    submit() {
      if (!this.doValidation()) return;
      if (this.$refs.form.validate()) {
        this.registUpdateDialog.confirm.title = this.accountRegistUpdateForm.isUpdateMode ? "ユーザー情報更新確認" : "ユーザー情報登録確認";
        this.registUpdateDialog.confirm.message = this.accountRegistUpdateForm.isUpdateMode ? "この内容で更新します。よろしいですか？" : "これで登録します。よろしいですか？";
        this.dialog.isUserRegistUpdateConfirmOpen = true;
      }
    },
    submitConfirmed() {
      // コメントのエスケープ処理
      const escapedComment = this.functions.escapeText(this.accountRegistUpdateForm.comment);
      const data = {
        type: this.accountRegistUpdateForm.isUpdateMode ? "update" : "regist",
        userId: this.accountRegistUpdateForm.isUpdateMode ? this.accountRegistUpdateForm.ownerId : undefined,
        userName: this.accountRegistUpdateForm.userName,
        email: this.accountRegistUpdateForm.loginId,
        // パスワードは新規登録時、または更新モードで isPasswordEdit が true の場合のみ送信
        password: (!this.accountRegistUpdateForm.isUpdateMode || this.isPasswordEdit) ? this.accountRegistUpdateForm.password1 : undefined,
        // authType ('一般' or '講師') を isTeacher (0 or 1) に変換して送信
        isTeacher: this.accountRegistUpdateForm.authType === '講師' ? 1 : 0,
        comment: escapedComment,
        token: this.functions.generateRandomAlphanumericString(16),
      };

      // 不要なプロパティ (undefined) を削除
      Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

      let param = this.functions.convertObjectToURLSearchParams(data);
      axios
        .post(this.path.accountRegistUpdate, param)
        .then((response) => {
          if (response.data.type === "success") {
            // 実行された処理が「更新」かつ、更新対象がログインユーザーのアカウントか判定
            if (this.accountRegistUpdateForm.isUpdateMode && this.accountRegistUpdateForm.isOwnAccount) {
              // 更新対象がログインユーザー自身の場合
              this.registUpdateDialog.complete.title = "ユーザー情報更新完了";
              // メッセージを変更してログアウトが必要であることを伝える
              this.registUpdateDialog.complete.message = "ユーザー情報を更新しました。セキュリティのため、ログアウトします。";
              this.dialog.isUserRegistUpdateCompleteOpen = true;
              // 親コンポーネントにログアウト処理を依頼するイベントを発行
              this.$emit('request-logout');
            } else {
              // 新規登録の場合、または他のユーザーを更新した場合
              this.registUpdateDialog.complete.title = this.accountRegistUpdateForm.isUpdateMode ? "ユーザー情報更新完了" : "ユーザー情報登録完了";
              this.registUpdateDialog.complete.message = this.accountRegistUpdateForm.isUpdateMode ? "ユーザー情報を更新しました。3秒後にリロードします。" : "ユーザー登録を完了しました。3秒後にリロードします。";
              this.dialog.isUserRegistUpdateCompleteOpen = true;
              this.functions.reloadPageAfterDelay(3);
            }
          } else {
            // APIからエラーが返却された場合 (既存の処理)
            this.registUpdateDialog.complete.title = "エラー";
            this.registUpdateDialog.complete.message = response.data.message || (this.accountRegistUpdateForm.isUpdateMode ? "申し訳ありません。ユーザー更新できませんでした。" : "申し訳ありません。ユーザー登録できませんでした。");
            this.dialog.isUserRegistUpdateCompleteOpen = true;
          }
        })
        .catch((error) => {
          this.registUpdateDialog.complete.title = "エラー";
          if (error.response) {
            console.error("Error Response:", error.response);
            const defaultErrorMessage = this.accountRegistUpdateForm.isUpdateMode ? "ユーザー更新中にエラーが発生しました。" : "ユーザー登録中にエラーが発生しました。";
            this.registUpdateDialog.complete.message = error.response.data?.message || `通信エラーが発生しました。(Status: ${error.response.status}) ${defaultErrorMessage}`;
          } else if (error.request) {
            console.error("Error Request:", error.request);
            this.registUpdateDialog.complete.message = "サーバーに接続できませんでした。";
          } else {
            console.error("Error:", error.message);
            this.registUpdateDialog.complete.message = "リクエストの設定中にエラーが発生しました。";
          }
          this.dialog.isUserRegistUpdateCompleteOpen = true;
        });
    },
    resetForm() {
      if (this.$refs.form) this.$refs.form.resetValidation();

      // 現在のモードに応じてリセット処理を分岐
      if (this.accountRegistUpdateForm.isUpdateMode) {
        // 更新モードの場合
        if (this.accountRegistUpdateForm.isOwnAccount) {
          // 自分のアカウントを編集中の場合、再度自分の情報で初期化
          this.updateOwnAccountMode();
        } else {
          // 他のユーザーを編集中の場合、再度そのユーザーの情報で初期化
          this.reflectParamsInForm(this.selectedUser);
        }
      } else {
        // 新規登録モードの場合、完全にクリア
        this.registNewAccountMode();
      }

      this.resetValidationErrors();
      this.isPasswordEdit = false;
      this.checkAbled();
    },
    checkAbled() {
      let isBasicInfoFilled = !!(
        this.accountRegistUpdateForm.userName &&
        this.accountRegistUpdateForm.loginId
      );

      let isPasswordFilled = true;
      if (!this.accountRegistUpdateForm.isUpdateMode || this.isPasswordEdit) {
        isPasswordFilled = !!(
          this.accountRegistUpdateForm.password1 &&
          this.accountRegistUpdateForm.password2
        );
      }
      let isAuthSelected = true;
      this.abled = isBasicInfoFilled && isPasswordFilled && isAuthSelected;
    },
    // 親要素から呼ばれる際に用いられるイベントハンドラー
    handleOpenRegistForm() {
      this.registNewAccountMode();
    },
    handleOpenUpdateForm(user) {
      this.initializeFormBasedOnSelectedUser(user);
    },
    handleRequestStopUser(user) {
      this.userToStop = user;
      this.dialog.accountStopConfirmOpen = true;
    },
    handleRequestRestartUser(user) {
      this.changeUsersActiveness(user, 0);
    },
    confirmStopUser() {
      this.dialog.accountStopConfirmOpen = false;
      // 保存しておいたユーザー情報を使って changeUsersActiveness を呼び出す
      if (this.userToStop) {
        this.changeUsersActiveness(this.userToStop, 1);
        this.userToStop = null;
      } else {
        this.statusCompleteMessage = "停止対象のユーザー情報が見つかりません。";
        this.dialog.accountStopRestartCompleteOpen = true;
      }
    },
    changeUsersActiveness(user, type) {
      // ユーザーオブジェクトとそのIDの存在を確認
      if (!user || user.ownerId === undefined || user.ownerId === null) {
          this.statusCompleteMessage = "処理対象のユーザー情報が無効です。";
          this.dialog.accountStopRestartCompleteOpen = true;
          return;
      }

      const actionDescription = type === 1 ? '停止' : '再開';
      const isStopValue = type === 1 ? 1 : 0;
      const data = {
        type: "changeStatus",
        userId: user.ownerId,
        isStop: isStopValue,
        updatedUserId: this.loginUser.ownerId,
        token: this.functions.generateRandomAlphanumericString(16),
      };

      // 不要なプロパティ (undefined) を削除
      Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

      let param = this.functions.convertObjectToURLSearchParams(data);
      axios
        .post(this.path.accountRegistUpdate, param)
        .then((response) => {
          if (response.data && response.data.type === "success") {
            this.statusCompleteTitle = '停止・再開完了'; // 成功時のタイトル設定
            this.statusCompleteMessage = `アカウントの${actionDescription}処理が完了しました。3秒後にリロードします。`;
            this.dialog.accountStopRestartCompleteOpen = true;
            this.functions.reloadPageAfterDelay(3);
          } else {
            this.statusCompleteTitle = 'エラー'; // APIからのエラー時のタイトル設定
            const errorMessage = response.data?.message || `アカウントの${actionDescription}処理に失敗しました。`;
            this.statusCompleteMessage = `${errorMessage}`;
            this.dialog.accountStopRestartCompleteOpen = true;
            console.error(`アカウント${actionDescription}エラー:`, response.data);
          }
        })
        .catch((error) => {
          this.statusCompleteTitle = 'エラー'; // 通信エラー時のタイトル設定
          console.error(`アカウント${actionDescription} APIエラー:`, error);
          let errorMessage = `アカウントの${actionDescription}処理中にエラーが発生しました。`;
          if (error.response) {
            errorMessage += ` (Status: ${error.response.status})`;
            if (error.response.data && error.response.data.message) {
              errorMessage += ` ${error.response.data.message}`;
            }
            console.error("Error Response:", error.response);
          } else if (error.request) {
            errorMessage = "サーバーに接続できませんでした。ネットワークを確認してください。";
            console.error("Error Request:", error.request);
          } else {
            errorMessage = "リクエストの設定中に予期せぬエラーが発生しました。";
            console.error("Error:", error.message);
          }
          this.statusCompleteMessage = `${errorMessage}`;
          this.dialog.accountStopRestartCompleteOpen = true;
        });
    },
  },
  mounted() {
    this.initializeFormBasedOnSelectedUser(this.selectedUser);
  },
});

export default userRegistUpdateForm;
