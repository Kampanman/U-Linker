// deleteStopAccountsAndDatas.js

let deleteStopAccountsAndDatas = Vue.component("delete-stop-accounts-and-datas", {
  template: `
    <div class="pa-4">
      <v-card>
        <v-card-title>
          停止アカウント・ユーザー登録データ削除
          <v-spacer></v-spacer>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-data-table data-parts-id="exises-15-01"
            :headers="headers"
            :items="stoppedAccountInfo"
            item-key="owner_id"
            show-select
            v-model="selectedAccounts"
            no-data-text="表示する停止中アカウントがありません。"
            class="elevation-1"
          >
            <template v-slot:header.data-table-select>
              <!-- ヘッダーのチェックボックスを非表示にするために空のテンプレートを挿入 -->
            </template>
            <template v-slot:item.data-table-select="{ item, isSelected, select }">
              <v-simple-checkbox data-parts-id="exises-15-01-01"
                :value="isSelected"
                @input="select($event)"
                :data-owner-id="item.owner_id"
              ></v-simple-checkbox>
            </template>
            <template v-slot:item.name="{ item }">
              <span data-parts-id="exises-15-01-02" v-text="item.name"></span>
            </template>
            <template v-slot:item.noteAmounts="{ item }">
              <span data-parts-id="exises-15-01-03" v-text="item.noteAmounts"></span>
            </template>
            <template v-slot:item.videoAmounts="{ item }">
              <span data-parts-id="exises-15-01-04" v-text="item.videoAmounts"></span>
            </template>
          </v-data-table>
          <v-row class="mt-4 mb-2" justify="center">
            <v-btn data-parts-id="exises-15-02"
              color="error" class="mr-2"
              :disabled="selectedAccounts.length === 0 || deleteSuccess === true"
              @click="openConfirmModal1"
              v-text="'アカウント・登録データを削除'"
            ></v-btn>
            <v-btn class="white-button"
              data-parts-id="exises-15-03"
              @click="resetSelections"
              :disabled="selectedAccounts.length === 0 || deleteSuccess === true"
              v-text="'リセット'"
            ></v-btn>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- 確認モーダル 1 -->
      <v-dialog v-model="dialogs.isConfirmModal1Open" persistent max-width="500">
        <v-card>
          <v-card-title class="headline">アカウント・データ削除確認</v-card-title>
          <v-card-text>
            あなたは本サービスのユーザー「{{ selectedAccountNamesForModal1 }}」のアカウントを削除しようとしています。
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green" text @click="proceedToModal2">確認</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- 確認モーダル 2 -->
      <v-dialog v-model="dialogs.isConfirmModal2Open" persistent max-width="500">
        <v-card>
          <v-card-title class="headline">アカウント・データ削除確認！</v-card-title>
          <v-card-text>
            安全のため、あなたのログイン ID を入力してください。
            <v-text-field class="mt-3"
              v-model="confirmModal2InputLoginId"
              placeholder="ログイン ID を入力"
              @input="confirmModal2ValidationError = false"
            ></v-text-field>
            <p class="valid-errors"
              v-if="confirmModal2ValidationError"
              @click="confirmModal2ValidationError = false"
            >あァ！？アんだってぇ！？</p>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green" text
              @click="validateAndProceedToModal3"
              :disabled="!confirmModal2InputLoginId"
            >入力したぞ</v-btn>
            <v-btn color="red" text @click="closeAllDialogs">やっぱやめとく</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- 確認モーダル 3 -->
      <v-dialog v-model="dialogs.isConfirmModal3Open" persistent max-width="500">
        <v-card>
          <v-card-title class="headline">アカウント・データ削除確認！！</v-card-title>
          <v-card-text>
            ついでにあなたが人間（ホモ・サピエンス）であると証明してください。<br>
            以下の文字を入力してください。<br>
            <strong
              class="my-2 d-block text-center"
              style="font-size: 1.2em; user-select: none;"
            >{{ confirmModal3RandomString }}</strong>
            <v-text-field class="mt-3"
              v-model="confirmModal3InputRandomString"
              placeholder="表示されている文字を入力"
              @input="confirmModal3ValidationError = false"
            ></v-text-field>
            <p class="valid-errors"
              v-if="confirmModal3ValidationError"
              @click="confirmModal3ValidationError = false"
            >あァ！？アんだってぇ！？</p>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green" text
              @click="validateAndProceedToModal4"
              :disabled="!confirmModal3InputRandomString"
            >入力したぞ（怒）</v-btn>
            <v-btn color="red" text @click="closeAllDialogs">やっぱやめとく</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- 確認モーダル 4 (最終) -->
      <v-dialog v-model="dialogs.isConfirmModal4Open" persistent max-width="500">
        <v-card>
          <v-card-title class="headline">アカウント・データ削除確認（最終）</v-card-title>
          <v-card-text>いいでしょう。削除を実行しますが、後悔しませんね！？</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green" text @click="executeDelete">いいからやれ（怒）</v-btn>
            <v-btn color="red" text @click="closeAllDialogs">やっぱやめとく</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- 完了モーダル -->
      <v-dialog v-model="dialogs.isDeleteCompleteModalOpen" persistent max-width="500">
        <v-card>
          <v-card-title class="headline">{{ deleteCompleteTitle }}</v-card-title>
          <v-card-text>{{ deleteCompleteMessage }}</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="closeCompleteModalAndReloadIfSuccess">閉じる</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

    </div>
  `,
  props: {
    path: Object,
    functions: Object,
    loginUser: Object,
  },
  data() {
    return {
      stoppedAccountInfo: [],
      selectedAccounts: [], // v-data-tableのv-modelと連動
      headers: [
        { text: 'ユーザー名', value: 'name', sortable: true },
        { text: 'ノート登録数', value: 'noteAmounts', sortable: true, align: 'end' },
        { text: 'ビデオ登録数', value: 'videoAmounts', sortable: true, align: 'end' },
      ],
      dialogs: {
        isConfirmModal1Open: false,
        isConfirmModal2Open: false,
        isConfirmModal3Open: false,
        isConfirmModal4Open: false,
        isDeleteCompleteModalOpen: false,
      },
      confirmModal2InputLoginId: '',
      confirmModal2ValidationError: false,
      confirmModal3RandomString: '',
      confirmModal3InputRandomString: '',
      confirmModal3ValidationError: false,
      deleteCompleteTitle: '',
      deleteCompleteMessage: '',
      deleteSuccess: false,
    };
  },
  computed: {
    deleteAccountIds() {
      return this.selectedAccounts.map(acc => acc.owner_id);
    },
    selectedAccountNamesForModal1() {
      if (this.selectedAccounts.length === 0) return '';
      return this.selectedAccounts.map(acc => acc.name).join('」、「');
    },
  },
  methods: {
    async fetchStoppedAccounts() {
      if (!this.loginUser || this.loginUser.isMaster !== 1) return;
      try {
        const data = {
          type: "getStoppedAccounts",
          is_master: this.loginUser.isMaster,
          master_id: this.loginUser.ownerId,
          token: this.functions.generateRandomAlphanumericString(16),
        };
        Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);
        const param = this.functions.convertObjectToURLSearchParams(data);
        const response = await axios.post(this.path.aboutStoppedAccounts, param);
        if (response.data && response.data.type === "success") {
          if (response.data.list != []) {
            this.stoppedAccountInfo = response.data.list.map(account => ({
              ...account,
              noteAmounts: account.notes_count + '件',
              videoAmounts: account.videos_count + '件',
            }));
          }
        } else {
          console.error("停止アカウント情報の取得に失敗しました:", response.data?.message);
          this.stoppedAccountInfo = [];
        }
      } catch (error) {
        console.error("停止アカウント情報の取得中にエラーが発生しました:", error);
        this.stoppedAccountInfo = [];
      }
    },
    resetSelections() {
      this.selectedAccounts = [];
    },
    openConfirmModal1() {
      if (this.selectedAccounts.length > 0) this.dialogs.isConfirmModal1Open = true;
    },
    proceedToModal2() {
      this.dialogs.isConfirmModal1Open = false;
      this.confirmModal2InputLoginId = '';
      this.confirmModal2ValidationError = false;
      this.dialogs.isConfirmModal2Open = true;
    },
    validateAndProceedToModal3() {
      if (this.confirmModal2InputLoginId === this.loginUser.email) {
        this.dialogs.isConfirmModal2Open = false;
        this.confirmModal3RandomString = this.functions.generateRandomAlphanumericString(16);
        this.confirmModal3InputRandomString = '';
        this.confirmModal3ValidationError = false;
        this.dialogs.isConfirmModal3Open = true;
      } else {
        this.confirmModal2ValidationError = true;
      }
    },
    validateAndProceedToModal4() {
      if (this.confirmModal3InputRandomString === this.confirmModal3RandomString) {
        this.dialogs.isConfirmModal3Open = false;
        this.dialogs.isConfirmModal4Open = true;
      } else {
        this.confirmModal3ValidationError = true;
      }
    },
    async executeDelete() {
      this.dialogs.isConfirmModal4Open = false;
      try {
        const data = {
          type: "deleteAccounts",
          is_master: this.loginUser.isMaster,
          master_id: this.loginUser.ownerId,
          delete_owner_ids: JSON.stringify(this.deleteAccountIds), // 配列をJSON文字列として送信
          token: this.functions.generateRandomAlphanumericString(16),
        };
        Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);
        const param = this.functions.convertObjectToURLSearchParams(data);
        const response = await axios.post(this.path.aboutStoppedAccounts, param);

        if (response.data) {
          if (response.data.type === "success") {
            this.deleteCompleteTitle = '削除完了';
            this.deleteSuccess = true;
          } else {
            this.deleteCompleteTitle = 'エラー';
            this.deleteSuccess = false;
          }
          this.deleteCompleteMessage = response.data.message;
        } else {
          this.deleteCompleteTitle = 'エラー';
          this.deleteCompleteMessage = 'サーバーからの応答が不正です。';
          this.deleteSuccess = false;
        }
      } catch (error) {
        console.error("アカウント削除処理中にエラーが発生しました:", error);
        this.deleteCompleteTitle = 'エラー';
        this.deleteCompleteMessage = 'アカウント削除処理中に通信エラーが発生しました。';
        this.deleteSuccess = false;
      }
      this.dialogs.isDeleteCompleteModalOpen = true;
    },
    closeAllDialogs() {
      this.dialogs.isConfirmModal1Open = false;
      this.dialogs.isConfirmModal2Open = false;
      this.dialogs.isConfirmModal3Open = false;
      this.dialogs.isConfirmModal4Open = false;
      this.confirmModal2ValidationError = false;
      this.confirmModal3ValidationError = false;
    },
    closeCompleteModalAndReloadIfSuccess() {
      this.dialogs.isDeleteCompleteModalOpen = false;
      if (this.deleteSuccess) {
        this.functions.reloadPageAfterDelay(3);
      } else {
        this.fetchStoppedAccounts(); // 失敗時は再度一覧を読み込むか、ユーザーに通知する
        this.resetSelections();
      }
    }
  },
  watch: {
    // loginUser.isMaster の変更を監視して、表示時にデータを取得する
    'loginUser.isMaster': {
      handler(newVal) {
        if (newVal === 1) {
          this.fetchStoppedAccounts();
        } else {
          this.stoppedAccountInfo = []; // マスターでない場合はリストをクリア
        }
      },
      immediate: true // コンポーネント作成時にも実行
    }
  },
});

export default deleteStopAccountsAndDatas;
