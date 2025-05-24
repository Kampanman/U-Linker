// loginForm.js

let loginForm = Vue.component("login-form", {
  template: `
    <v-app>
    <div class="login-form-container">
      <v-card class="pa-4 rounded-card" color="#efebde" width="93%" outlined>
        <v-form ref="form" class="form-contents">
          <v-card-title class="headline">
            <span class="area-title">ログインフォーム</span>
          </v-card-title>
          <v-card-text>
            <v-row justify="center" class="mb-4">
              <v-btn icon @click="openAccountRegistForm" class="white-button" data-parts-id="nonses-01-01">
                <i title="ユーザー新規登録フォームにアクセスします" class="material-icons">add</i>
              </v-btn>
            </v-row>
            <v-text-field data-parts-id="nonses-01-02"
              v-model="loginUser.loginId"
              label="ログインID（emailアドレス）"
              type="email"
              required
              :disabled="locked"
            ></v-text-field>
            <p class="valid-errors" v-if="validError.notEmail" @click="validError.notEmail=false" v-text="validError.message.notEmail"></p>
            <p class="valid-errors" v-if="validError.includeInvalidStr" @click="validError.includeInvalidStr=false" v-text="validError.message.includeInvalidStr"></p>
            <br />
            <v-text-field data-parts-id="nonses-01-03"
              v-model="loginUser.password"
              label="パスワード（半角英数字8文字以上16文字以内）"
              type="password"
              required
              :disabled="locked"
            ></v-text-field>
            <p class="valid-errors" v-if="validError.invalidPassRange" @click="validError.invalidPassRange=false" v-text="validError.message.invalidPassRange"></p>
          </v-card-text>
          <v-card-actions justify="center">
            <v-row justify="center" class="w-100 mt-4">
              <v-btn class="mr-1 white--text" color="#8d0000" :disabled="!abled" @click="login" data-parts-id="nonses-01-04">ログイン</v-btn>
              <v-btn class="white-button" @click="resetForm" data-parts-id="nonses-01-05">リセット</v-btn>
            </v-row>
          </v-card-actions>
          <br v-if="loginRes.showMessage" />
          <v-card-actions class="justify-center login-res-message" v-if="loginRes.showMessage">
            <div :class="loginRes.classType" @click="closeLoginErrorMessage()">{{ loginRes.message }}</div>
          </v-card-actions>
          <v-card-actions>
            <v-row justify="center" class="w-100 mt-4">
              <a href="#" @click="openPasswordResetMailForm" data-parts-id="nonses-01-06">パスワードを忘れた方</a>
            </v-row>
          </v-card-actions>
        </v-form>
      </v-card>
    </div>
    </v-app>
  `,
  props: {
    path: Object,
    flag: Object,
    functions: Object,
    loginUser: Object,
  },
  data: () => ({
    abled: false,
    locked: false,
    validError: {
      notEmail: false,
      includeInvalidStr: false,
      invalidPassRange: false,
      message: {
        notEmail: 'ログインIDがメールアドレスの形式ではありません',
        includeInvalidStr: 'ログインIDに不適切な文字が含まれています',
        invalidPassRange: 'パスワードが半角英数字8文字以上16文字以内の形式（半角数字を1文字以上含む）ではありません',
      }
    },
    loginRes: {
      showMessage: false,
      classType: '',
      message: '',
    },
  }),
  watch: {
    'loginUser.loginId': function () { this.checkAbled(); },
    'loginUser.password': function () { this.checkAbled(); },
  },
  methods: {
    openAccountRegistForm() {
      this.$emit('open-account-regist-form');
    },
    openPasswordResetMailForm() {
      this.$emit('open-password-reset-mail-form');
    },
    resetForm() {
      this.$refs.form.reset();
      this.validError.notEmail = false;
      this.validError.includeInvalidStr = false;
      this.validError.invalidPassRange = false;
    },
    doValidation() {
      // loginUser.loginIdがメールアドレスの形式になっていなければvalidError.notEmailをfalseにする
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      this.validError.notEmail = !emailRegex.test(this.loginUser.loginId);
      
      // loginUser.loginIdに全角文字や日本語、[&$%#`]などの不適切な文字が含まれていたらvalidError.includeInvalidStrをtrueにする
      const invalidCharRegex = /[^\x20-\x7E]|[ぁ-んァ-ン一-龥]|[$%#`]/;
      this.validError.includeInvalidStr = invalidCharRegex.test(this.loginUser.loginId);
      
      // loginUser.passwordが半角英数字8文字以上16文字以内で、かつ半角数字を1文字以上含む形式になっていなければvalidError.invalidPassRangeをtrueにする
      const passwordRegex = /^(?=.*[0-9])[a-zA-Z0-9]{8,16}$/;
      this.validError.invalidPassRange = !passwordRegex.test(this.loginUser.password);
      
      let res = true;
      if (this.validError.notEmail || this.validError.includeInvalidStr || this.validError.invalidPassRange) res = false;
      return res;
    },
    login() {
      if(!this.doValidation()) return;
      if (this.$refs.form.validate()) {
        const data = {
          email: this.loginUser.loginId,
          password: this.loginUser.password,
          token: this.functions.generateRandomAlphanumericString(16),
        };

        let param = this.functions.convertObjectToURLSearchParams(data);
        axios
          .post(this.path.loginJudge, param)
          .then((response) => {
            if (response.data) {
              this.loginRes.classType = response.data.class;
              this.loginRes.message = response.data.message;
              this.loginRes.showMessage = true;
              if (response.data.type == 'success') { 
                this.locked = true;
                this.functions.reloadPageAfterDelay(3);
              }
            }
          })
          .catch((error) => {
            if (error.response) {
              console.log("error.response", error.response);
            } else if (error.request) {
              console.log("error.request", error.request);
            } else {
              console.log("error", error);
            }
          });
      }
    },
    closeLoginErrorMessage() {
      if (this.loginRes.classType == 'error-message') this.loginRes.showMessage = false;
    },
    checkAbled() {
      this.abled = !!(this.loginUser.loginId && this.loginUser.password);
    },
  },
});

export default loginForm;
