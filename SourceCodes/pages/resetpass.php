<?php
  include('../server/db.php');
  include('../server/functions.php');
  include('../server/properties.php');
  define('API_PATH', DOMAIN.'/'.CONTENTS_NAME.'/server/api/');
  $onetimeTokenFromUrl = isset($_GET['onetime_token']) ? $_GET['onetime_token'] : null;
  $phpErrorMessage = null;
  $accountOwnerId = null; // API送信時に使用する可能性を考慮（今回は直接使わない）

  if (empty($onetimeTokenFromUrl) || !isAlphanumeric16($onetimeTokenFromUrl)) {
    $phpErrorMessage = '無効なURLです。';
  } else {
    try {
      $sql = "SELECT `owner_id`, `token_limit` FROM " . ACCOUNT_TABLE . " WHERE `token` = :token";
      $stmt = $connection->prepare($sql);
      $stmt->bindValue(':token', $onetimeTokenFromUrl, PDO::PARAM_STR);
      $stmt->execute();
      $account = $stmt->fetch(PDO::FETCH_ASSOC);

      if (!$account) {
        $phpErrorMessage = 'パスワード再設定可能なアカウントではないようです。';
      } else {
        $tokenLimitTime = strtotime($account['token_limit']);
        $currentTime = time();
        if ($tokenLimitTime < $currentTime) {
          $phpErrorMessage = '受信されているメールの URL からのパスワード再設定が可能な時刻を超過しているようです。';
        } else {
          $accountOwnerId = $account['owner_id']; // 有効なトークン
        }
      }
    } catch (PDOException $e) {
      error_log("Database error on resetpass.php: " . $e->getMessage());
      $phpErrorMessage = 'データベース処理中にエラーが発生しました。しばらくしてから再度お試しください。';
    }
  }
?>
<!DOCTYPE html>
<html lang="ja">
<head>
  <?php echo HEAD_LINKS; ?>
</head>
<body style="background-color: #B2DFDB;">
  <div id="app">
    <header data-parts-id="resetpass-01">
      <div class="header-center" align="center">
        <div class="d-block">
          <a href="#" data-parts-id="resetpass-01" class="title-logo"><?php echo BUNNER; ?></a>
        </div>
        <div class="d-block">
          <small class="white--text">Supported(Created) by "Gemini Code-Assist".</small>
        </div>
      </div>
    </header>
    <br />
    <main>
    <v-app>
        <v-container>
          <v-row justify="center">
            <v-col cols="12" md="8" lg="6">
              <v-card data-parts-id="resetpass-02" class="pa-5">
                <v-card-title class="justify-center">
                  <h2 class="text-h5">パスワード再設定</h2>
                </v-card-title>
                <v-card-text>
                <v-alert v-if="phpErrorMessage" type="error" dense text class="mb-4">
                  <div class="text-center" v-text="phpErrorMessage"></div>
                </v-alert>

                  <v-form v-if="!phpErrorMessage"
                    ref="resetPassForm"
                    v-model="formValid"
                    lazy-validation
                    @submit.prevent="validateAndOpenConfirm"
                  >
                    <v-text-field data-parts-id="resetpass-02-01"
                      v-model="resetPassInfo.password"
                      label="新しいパスワード（半角英数字 8文字以上16文字以内）"
                      type="password"
                      :rules="[rules.passwordLength, rules.passwordFormat]"
                      required outlined dense class="mb-3"
                    ></v-text-field>

                    <v-text-field data-parts-id="resetpass-02-02"
                      v-model="resetPassInfo.passwordConfirm"
                      label="新しいパスワード（確認）"
                      type="password"
                      :rules="[rules.passwordMatch]"
                      required outlined dense class="mb-3"
                    ></v-text-field>

                    <v-btn data-parts-id="resetpass-02-03"
                      type="submit" color="#8d0000" class="white--text" block
                      :disabled="isSubmitButtonDisabled"
                      :loading="loading" v-text="'パスワードを再設定する'"
                    ></v-btn>
                  </v-form>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- 確認モーダル -->
          <v-dialog v-model="dialogs.confirm.isOpen" persistent max-width="400">
            <v-card>
              <v-card-title class="text-h6" v-text="'確認'"></v-card-title>
              <v-card-text v-text="'パスワードを再設定します。よろしいですか？'"></v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="green darken-1" text @click="proceedResetPassword" v-text="'はい'"></v-btn>
                <v-btn color="red darken-1" text @click="dialogs.confirm.isOpen = false" v-text="'いいえ'"></v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <!-- 完了モーダル -->
          <v-dialog v-model="dialogs.complete.isOpen" persistent max-width="400">
            <v-card>
              <v-card-title class="text-h6">{{ dialogs.complete.title }}</v-card-title>
              <v-card-text>{{ dialogs.complete.message }}</v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" text @click="closeCompleteDialog">閉じる</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

        </v-container>
      </v-app>
    </main>
  </div>
  <?php echo SCRIPT_LINKS; ?>
  <script type="module">
    import commonFunctions from '../static/js/variables/commonFunctions.js';

    new Vue({
      el: '#app',
      vuetify: new Vuetify(),
      data: {
        functions: commonFunctions,
        axiosPath: {
          accountRegistUpdate: <?php echo '"'.API_PATH.'accountRegistUpdate.php'.'"'; ?>,
        },
        phpErrorMessage: <?php echo json_encode($phpErrorMessage); ?>,
        onetimeToken: <?php echo json_encode($onetimeTokenFromUrl); ?>,
        resetPassInfo: {
          password: '',
          passwordConfirm: '',
        },
        formValid: false, // lazy-validation と併用する場合、validate() の結果で更新される
        loading: false,
        dialogs: {
          confirm: { isOpen: false },
          complete: { isOpen: false, title: '', message: '', success: false },
        },
        validationRulesActive: false, // バリデーションルールを適用するかどうかのフラグ
      },
      computed: {
        isSubmitButtonDisabled() {
          return !!this.phpErrorMessage || this.loading ||
                !this.resetPassInfo.password || // passwordが空かチェック
                !this.resetPassInfo.passwordConfirm; // passwordConfirmが空かチェック
        },
        rules() {
          return {
            // validationRulesActive が true の場合のみ実際のルールを適用する
            passwordLength: value => !this.validationRulesActive || (value && value.length >= 8 && value.length <= 16) || 'パスワードは8文字以上16文字以内で入力してください。',
            passwordFormat: value => !this.validationRulesActive || /^[a-zA-Z0-9]+$/.test(value) || 'パスワードは半角英数字で入力してください。',
            passwordMatch: value => !this.validationRulesActive || (value === this.resetPassInfo.password) || 'パスワードが一致しません。',
          };
        },
      },
      mounted() {
        if(this.phpErrorMessage!=null) {
          setTimeout(() => { window.location.href = 'index.php' }, 5000); // 5秒後にログインページへリダイレクト
        }
      },
      methods: {
        validateAndOpenConfirm() {
          this.validationRulesActive = true; // バリデーションルールを有効化
          // $nextTick を使用して、DOMの更新とルールの適用が完了した後にバリデーションを実行
          this.$nextTick(() => {
            if (this.$refs.resetPassForm.validate()) { // バリデーション成功時のみ確認ダイアログを開く
              this.dialogs.confirm.isOpen = true;
            }
          });
        },
        async proceedResetPassword() {
          this.dialogs.confirm.isOpen = false;
          this.loading = true;

          const params = new URLSearchParams();
          params.append('type', 'resetPass');
          params.append('password', this.resetPassInfo.password);
          params.append('accountToken', this.onetimeToken); // PHPから受け取ったワンタイムトークン
          params.append('token', this.functions.generateRandomAlphanumericString(16)); // CSRF対策等のクライアント側トークン

          try {
            const response = await axios.post(this.axiosPath.accountRegistUpdate, params);
            this.dialogs.complete.title = '処理結果';
            if (response.data && response.data.type === 'success') {
              this.dialogs.complete.message = response.data.message || 'パスワードの再設定が完了しました。3秒後にログインページへ移動します。';
              this.dialogs.complete.success = true;
              setTimeout(() => { window.location.href = 'index.php' }, 3000); // 3秒後にログインページへリダイレクト
            } else {
              this.dialogs.complete.message = (response.data && response.data.message) || 'パスワードの再設定に失敗しました。';
              this.dialogs.complete.success = false;
            }
          } catch (error) {
            console.error("Password reset error:", error);
            this.dialogs.complete.title = 'エラー';
            this.dialogs.complete.message = 'パスワードの再設定中にエラーが発生しました。';
            if (error.response && error.response.data && error.response.data.message) this.dialogs.complete.message = error.response.data.message;
            this.dialogs.complete.success = false;
          } finally {
            this.loading = false;
            this.dialogs.complete.isOpen = true;
          }
        },
        closeCompleteDialog() {
          this.dialogs.complete.isOpen = false;
          if (this.dialogs.complete.success) {
             // 成功時はリダイレクトするので、ここでは何もしないか、リダイレクトを再度トリガーしてもよい
          }
        }
      }
    });
  </script>
</body>
</html>
