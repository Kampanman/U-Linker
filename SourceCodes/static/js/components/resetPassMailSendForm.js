// resetPassMailSendForm.js
let resetPassMailSendForm = Vue.component("reset-pass-mail-send-form", {
  template: `
    <v-app>
    <div class="login-form-container">
      <v-card class="pa-4 rounded-card" color="#efebde" width="93%" outlined>
        <v-form ref="form" class="form-contents">
          <v-card-title class="headline">
            <span class="area-title">パスワードリセットメール送信フォーム</span>
          </v-card-title>
          <v-card-text>
            <v-text-field data-parts-id="nonses-03-01"
              v-model="resetMailForm.loginId"
              label="ログインID（emailアドレス｜100字以内）"
              required
              :disabled="!inputable"
              maxlength="100"
              counter="100"
            ></v-text-field>
            <p class="valid-errors" v-if="validError.notEmail" @click="validError.notEmail=false" v-text="validError.message.notEmail"></p>
            <p class="valid-errors"
              v-if="validError.includeInvalidStrLoginId"
              @click="validError.includeInvalidStrLoginId=false"
              v-text="validError.message.includeInvalidStrLoginId">
            </p>
          </v-card-text>
          <v-card-text>
            <v-text-field data-parts-id="nonses-03-02"
              v-model="resetMailForm.gmail"
              label="Gmailアドレス（100字以内）"
              required
              :disabled="!inputable"
              maxlength="100"
              counter="100"
            ></v-text-field>
            <p class="valid-errors" v-if="validError.notGmail" @click="validError.notGmail=false" v-text="validError.message.notGmail"></p>
            <p class="valid-errors"
              v-if="validError.includeInvalidStrGmail"
              @click="validError.includeInvalidStrGmail=false"
              v-text="validError.message.includeInvalidStrGmail"
            ></p>
          </v-card-text>
          <v-card-text>
            <v-text-field data-parts-id="nonses-03-03"
              v-model="resetMailForm.password"
              label="アプリパスワード"
              type="password"
              required
              :disabled="!inputable"
            ></v-text-field>
            <small>アプリパスワードの設定方法については、 <a target="_blank" href="https://support.google.com/accounts/answer/185833?hl=ja">こちらのページ</a> で確認できます。</small>
            <p class="valid-errors"
              v-if="validError.includeInvalidStrPassword"
              @click="validError.includeInvalidStrPassword=false"
              v-text="validError.message.includeInvalidStrPassword"
            ></p>
          </v-card-text>
          <v-card-actions justify="center">
            <v-row justify="center" class="w-100 mt-4">
              <v-btn :disabled="!pushable" color="#8d0000" class="white--text mr-1" data-parts-id="nonses-03-04" @click="submit">送信</v-btn>
            </v-row>
          </v-card-actions>
          <div class="mt-3">
            <p class="error-message" style="cursor: pointer"
              v-if="resultMessage.isFailOpen"
              v-text="resultMessage.text"
              @click="resultMessage.isFailOpen=false"
            ></p>
            <p class="success-message" v-if="resultMessage.isSuccessOpen" v-text="resultMessage.text"></p>
          </div>
        </v-form>
      </v-card>
    </div>
    </v-app>
  `,
  props: {
    flag: Object,
    functions: Object,
    path: Object,
  },
  data() {
    return {
      inputable: true,
      pushable: false,
      validError: {
        notEmail: false,
        notGmail: false,
        includeInvalidStrLoginId: false,
        includeInvalidStrGmail: false,
        includeInvalidStrPassword: false,
        message: {
          notEmail: "ログインIDがメールアドレスの形式ではありません",
          notGmail: "送信先メールアドレスがGメールアドレスの形式ではありません",
          includeInvalidStrLoginId: "ログインIDに不適切な文字が含まれています",
          includeInvalidStrGmail: "Gmailアドレスに不適切な文字が含まれています",
          includeInvalidStrPassword: "アプリパスワードに全角文字は使用できません",
        }
      },
      resetMailForm: {},
      resultMessage: {
        isFailOpen: false,
        isSuccessOpen: false,
        text: "",
      },
    };
  },
  watch: {
    'resetMailForm.loginId': function () { this.checkpushable() },
    'resetMailForm.gmail': function () { this.checkpushable() },
    'resetMailForm.password': function () { this.checkpushable() },
  },
  methods: {
    doValidation() {
      // resetMailForm.loginIdがメールアドレスの形式になっていなければvalidError.notEmailをfalseにする
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      this.validError.notEmail = !emailRegex.test(this.resetMailForm.loginId);

      // resetMailForm.gmailがGメールアドレスの形式になっていなければvalidError.notGmailをfalseにする
      const gmailRegex = /^[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*@gmail\.com$/;
      this.validError.notGmail = !gmailRegex.test(this.resetMailForm.gmail);
      
      // resetMailForm.loginIdに全角文字や日本語、[&$%#`]などの不適切な文字が含まれていたらvalidError.includeInvalidStrLoginIdをtrueにする
      const invalidCharRegex = /[^\x20-\x7E]|[ぁ-んァ-ン一-龥]|[\&$%#`]/;
      this.validError.includeInvalidStrLoginId = invalidCharRegex.test(this.resetMailForm.loginId);

      // resetMailForm.Gmailに全角文字や日本語、[&$%#`]などの不適切な文字が含まれていたらvalidError.includeInvalidStrGmailをtrueにする
      this.validError.includeInvalidStrGmail = invalidCharRegex.test(this.resetMailForm.gmail);

      // resetMailForm.passwordに全角文字が含まれていたらvalidError.includeInvalidStrPasswordをtrueにする
      const zenkakuRegex = /[^\x00-\x7E]/; // ASCII文字以外（全角文字など）
      this.validError.includeInvalidStrPassword = zenkakuRegex.test(this.resetMailForm.password);

      let res = true;
      if (
        this.validError.notEmail ||
        this.validError.notGmail ||
        this.validError.includeInvalidStrLoginId ||
        this.validError.includeInvalidStrGmail ||
        this.validError.includeInvalidStrPassword
      ) res = false;
      return res;
    },
    submit() {
      if (!this.doValidation()) return;
      this.pushable = false;
      this.inputable = false;
      if (this.$refs.form.validate()) this.sendAddressAndGenerateMail();
    },
    async sendAddressAndGenerateMail() {
      try {
        const data = {
          type: "generateResetPassMail",
          loginId: this.resetMailForm.loginId,
          gmail: this.resetMailForm.gmail,
          password: this.resetMailForm.password,
          token: this.functions.generateRandomAlphanumericString(16),
        }
        
        Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);
        let param = this.functions.convertObjectToURLSearchParams(data);

        axios
          .post(this.path.generateMail, param)
          .then((response) => {
            if (response.data) {
              if (response.data.type === "success") {
                this.resultMessage.text = response.data.message;
                this.resultMessage.isFailOpen = false;
                this.resultMessage.isSuccessOpen = true;
                this.functions.reloadPageAfterDelay(3);
              } else {
                this.inputable = true;
                this.resultMessage.text = response.data.message.split(':')[0];
                this.resultMessage.isFailOpen = true;
              }
            }
          })
          .catch((error) => {
            this.inputable = true;
            this.resultMessage.text = "パスワード再設定メールを送信できませんでした。";
            this.resultMessage.isFailOpen = true;
          });
        } catch (error) {
          this.inputable = true;
          this.resultMessage.text = "サーバーとの通信に失敗しました。";
          this.resultMessage.isFailOpen = true;
        }
    },
    checkpushable() {
      this.pushable = !!(this.resetMailForm.loginId && this.resetMailForm.gmail && this.resetMailForm.password);
    },
  },
});

export default resetPassMailSendForm;