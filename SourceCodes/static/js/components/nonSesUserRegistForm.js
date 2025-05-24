// nonSesUserRegistForm.js

let nonSesUserRegistForm = Vue.component("non-ses-user-regist-form", {
  template: `
    <v-app>
    <div class="login-form-container">
      <v-card class="pa-4 rounded-card" color="#efebde" width="93%" outlined>
        <v-form ref="form" class="form-contents">
          <v-card-title class="headline">
            <span class="area-title">ユーザー新規登録フォーム</span>
          </v-card-title>
          <v-card-text>
            <v-text-field v-model="accountRegistUpdateForm.userName" label="ユーザー名（30字以内）" data-parts-id="nonses-02-01" required maxlength="30" counter="30"></v-text-field>
            <p class="valid-errors" v-if="validError.includeInvalidStrUserName" @click="validError.includeInvalidStrUserName=false" v-text="validError.message.includeInvalidStrUserName"></p>
            <br />
            <v-text-field v-model="accountRegistUpdateForm.loginId" label="ログインID（emailアドレス｜100字以内）" data-parts-id="nonses-02-02" required maxlength="100" counter="100"></v-text-field>
            <p class="valid-errors" v-if="validError.notEmail" @click="validError.notEmail=false" v-text="validError.message.notEmail"></p>
            <p class="valid-errors" v-if="validError.includeInvalidStrLoginId" @click="validError.includeInvalidStrLoginId=false" v-text="validError.message.includeInvalidStrLoginId"></p>
            <br />
            <v-text-field v-model="accountRegistUpdateForm.password1" label="パスワード（半角英数字8文字以上16文字以内）" type="password" data-parts-id="nonses-02-03" required></v-text-field>
            <p class="valid-errors" v-if="validError.invalidPassRange" @click="validError.invalidPassRange=false" v-text="validError.message.invalidPassRange"></p>
            <br />
            <v-text-field v-model="accountRegistUpdateForm.password2" label="パスワード（上と同じ内容を再入力してください）" type="password" data-parts-id="nonses-02-04" required></v-text-field>
            <p class="valid-errors" v-if="validError.notSamePassword" @click="validError.notSamePassword=false" v-text="validError.message.notSamePassword"></p>
            <br />
            <v-text-field v-model="accountRegistUpdateForm.comment" label="コメント（100字以内）" data-parts-id="nonses-02-05" maxlength="100" counter="100"></v-text-field>
          </v-card-text>
          <v-card-actions justify="center">
            <v-row justify="center" class="w-100 mt-4">
              <v-btn :disabled="!abled" color="#8d0000" class="white--text mr-1" data-parts-id="nonses-02-06" @click="submit">新規登録</v-btn>
              <v-btn class="white-button" @click="resetForm" data-parts-id="nonses-02-07">リセット</v-btn>
            </v-row>
          </v-card-actions>
          <v-dialog v-model="dialog.isUserRegistUpdateConfirmOpen" persistent max-width="500">
            <v-card>
              <v-card-title class="headline">{{ thisDialog.confirm.title }}</v-card-title>
              <v-card-text>{{ thisDialog.confirm.message }}</v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="green darken-1" text @click="dialog.isUserRegistUpdateConfirmOpen=false;submitConfirmed()">はい</v-btn>
                <v-btn color="red darken-1" text @click="dialog.isUserRegistUpdateConfirmOpen=false">いいえ</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="dialog.isUserRegistUpdateCompleteOpen" persistent max-width="500">
            <v-card>
              <v-card-title class="headline">{{ thisDialog.complete.title }}</v-card-title>
              <v-card-text>{{ thisDialog.complete.message }}</v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="red darken-1" text @click="dialog.isUserRegistUpdateCompleteOpen=false">閉じる</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-form>
      </v-card>
    </div>
    </v-app>
  `,
  props: {
    path: Object,
    flag: Object,
    dialog: Object,
    functions: Object,
  },
  data() {
    return {
      abled: false,
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
      thisDialog: {
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
        userName: "",
        loginId: "",
        password1: "",
        password2: "",
        comment: "",
      },
    };
  },
  watch: {
    'accountRegistUpdateForm.userName': function () { this.checkAbled(); },
    'accountRegistUpdateForm.loginId': function () { this.checkAbled(); },
    'accountRegistUpdateForm.password1': function () { this.checkAbled(); },
    'accountRegistUpdateForm.password2': function () { this.checkAbled(); },
  },
  methods: {
    doValidation() {
      // accountRegistUpdateForm.loginIdがメールアドレスの形式になっていなければvalidError.notEmailをfalseにする
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      this.validError.notEmail = !emailRegex.test(this.accountRegistUpdateForm.loginId);
      // accountRegistUpdateForm.loginIdに全角文字や日本語、[&$%#`]などの不適切な文字が含まれていたらvalidError.includeInvalidStrLoginIdをtrueにする
      const invalidCharRegex = /[^\x20-\x7E]|[ぁ-んァ-ン一-龥]|[\&$%#`]/;
      this.validError.includeInvalidStrLoginId = invalidCharRegex.test(this.accountRegistUpdateForm.loginId);
      // accountRegistUpdateForm.password1が半角英数字8文字以上16文字以内で、かつ半角数字を1文字以上含む形式になっていなければvalidError.invalidPassRangeをtrueにする
      const passwordRegex = /^(?=.*[0-9])[a-zA-Z0-9]{8,16}$/;
      this.validError.invalidPassRange = !passwordRegex.test(this.accountRegistUpdateForm.password1);
      // accountRegistUpdateForm.userNameに[$%#`@]といった不適切な文字が含まれていた場合は、validError.includeInvalidUserNameStrをtrueにする
      const userNameInvalidStrTest = /[%$#`@]/.test(this.accountRegistUpdateForm.userName);
      this.validError.includeInvalidStrUserName = userNameInvalidStrTest;
      // accountRegistUpdateForm.password1がaccountRegistUpdateForm.password2と異なる場合は、validError.notSamePasswordをtrueにする
      this.validError.notSamePassword = this.accountRegistUpdateForm.password1 !== this.accountRegistUpdateForm.password2;

      let res = true;
      if (
        this.validError.notEmail ||
        this.validError.includeInvalidStrLoginId ||
        this.validError.invalidPassRange ||
        this.validError.includeInvalidStrUserName ||
        this.validError.notSamePassword
      ) res = false;
      return res;
    },
    submit() {
      if (!this.doValidation()) return;
      if (this.$refs.form.validate()) this.dialog.isUserRegistUpdateConfirmOpen = true;
    },
    submitConfirmed() {
      this.accountRegistUpdateForm.comment = this.functions.escapeText(this.accountRegistUpdateForm.comment);
      const data = {
        type: "regist",
        userName: this.accountRegistUpdateForm.userName,
        email: this.accountRegistUpdateForm.loginId,
        password: this.accountRegistUpdateForm.password1,
        isTeacher: 0,
        isOwner: 0,
        comment: this.accountRegistUpdateForm.comment,
        token: this.functions.generateRandomAlphanumericString(16),
      };

      let param = this.functions.convertObjectToURLSearchParams(data);
      axios
        .post(this.path.accountRegistUpdate, param)
        .then((response) => {
          if (response.data) {
            if (response.data.type === "success") {
              this.thisDialog.complete.title = "ユーザー情報登録完了";
              this.thisDialog.complete.message = "ユーザー登録を完了しました。リロードします。";
              this.dialog.isUserRegistUpdateCompleteOpen = true;
              this.functions.reloadPageAfterDelay(3);
            } else {
              this.thisDialog.complete.title = "エラー";
              this.thisDialog.complete.message = "申し訳ありません。ユーザー登録できませんでした。";
              this.dialog.isUserRegistUpdateCompleteOpen = true;
            }
          }
        })
        .catch((error) => {
          this.thisDialog.complete.title = "エラー";
          if (error.response) {
            console.log(error.response);
            if (error.response.status === 500) {
              if (error.response.data && error.response.data.message) {
                this.thisDialog.complete.message = error.response.data.message;
              } else {
                this.thisDialog.complete.message = "サーバーエラーが発生しました。";
              }
            } else {
              this.thisDialog.complete.message = "通信エラーが発生しました。";
            }
          } else if (error.request) {
            this.thisDialog.complete.message = "サーバーに接続できませんでした。";
          } else {
            this.thisDialog.complete.message = "リクエストの設定中にエラーが発生しました。";
          }
          this.dialog.isUserRegistUpdateCompleteOpen = true;
        });
    },
    resetForm() {
      this.$refs.form.reset();
      this.validError.notEmail = false;
      this.validError.includeInvalidStrLoginId = false;
      this.validError.invalidPassRange = false;
      this.validError.includeInvalidUserNameStr = false;
      this.validError.notSamePassword = false;
    },
    checkAbled() {
      this.abled = !!(
        this.accountRegistUpdateForm.userName &&
        this.accountRegistUpdateForm.loginId &&
        this.accountRegistUpdateForm.password1 &&
        this.accountRegistUpdateForm.password2
      );
    },
  },
});

export default nonSesUserRegistForm;
