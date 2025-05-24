// accountTableArea.js
let accountTableArea = Vue.component("account-table-area", {
  template: `
    <div class="search-form">
      <v-card class="pa-4 rounded-card" color="#efebde" width="93%" outlined>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-card>
                  <v-card-title>
                    <v-col cols="12" md="6">
                      <span>ユーザー一覧</span>
                    </v-col>
                    <v-col cols="12" md="6" style="text-align:right">
                      <v-btn class="white--text" color="#8d0000" data-parts-id="exises-02-01" @click="openNewUserForm">新規登録</v-btn>
                    </v-col>
                  </v-card-title>
                  <v-card-title>
                    <v-col cols="12" md="6">
                      <v-btn
                        v-if="showEditOwnAccountButton && !isEditingOwnAccount"
                        class="white--text sm-font"
                        color="#8d0000"
                        data-parts-id="exises-02-02"
                        @click="editOwnAccount"
                      >自分のアカウントを編集</v-btn>
                    </v-col>
                    <v-col cols="12" md="6" style="text-align:right">
                      <v-text-field
                        v-model="accountName"
                        append-icon="mdi-magnify"
                        label="ユーザー名で検索"
                        single-line
                        hide-details
                      ></v-text-field>
                    </v-col>
                  </v-card-title>
                  <v-data-table
                    :headers="headers"
                    :items="processedAccountsInfoList"
                    item-key="ownerId"
                    data-parts-id="exises-02-03"
                    :search="accountName"
                    :custom-filter="filterByUserName"
                    :sort-by="['ownerId']"
                    class="elevation-1 dense-table"
                    dense
                  >
                    <template v-slot:item.userName="{ item }">
                      <span :data-parts-id="'exises-02-03-01'" :data-owner-id="item.ownerId">{{ item.userName }}</span>
                    </template>
                    <template v-slot:item.authName="{ item }">
                      <v-chip :color="getAuthColor(item.authName)" dark small :data-parts-id="'exises-02-03-02'">{{ item.authName }}</v-chip>
                    </template>
                    <template v-slot:item.created="{ item }">
                      <span :data-parts-id="'exises-02-03-03'">{{ functions.formatDateTime(item.created) }}</span>
                    </template>
                    <template v-slot:item.actions="{ item }">
                      <v-btn small class="mr-1 mt-1 mb-1 white-button" :data-parts-id="'exises-02-03-04'" @click="editUser(item)">編集</v-btn>
                      <v-btn v-if="loginUser.isMaster && item.isStopped==0" class="mt-1 mb-1" small color="warning" :data-parts-id="'exises-02-03-04-01'" @click="stopUser(item)">停止</v-btn>
                      <v-btn v-if="loginUser.isMaster && item.isStopped==1" class="mt-1 mb-1" small color="info" :data-parts-id="'exises-02-03-04-02'" @click="restartUser(item)">再開</v-btn>
                    </template>
                    <template v-slot:no-data>
                      <v-alert class="empty-message" :value="true" icon="mdi-alert">表示できるユーザーがいません</v-alert>
                    </template>
                  </v-data-table>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
    </div>
  `,
  props: {
    path: Object,
    flag: Object,
    dialog: Object,
    functions: Object,
    loginUser: Object,
    isEditingOwnAccount: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      accountsInfoList: [],
      accountName: "",
      showEditOwnAccountButton: false,
      headers: [
        { text: 'ユーザー名', value: 'userName', align: 'start', sortable: true, filterable: true },
        { text: '権限', value: 'authName', sortable: true, filterable: false, width: '60px' },
        { text: '登録日時', value: 'created', sortable: true, filterable: false, width: '180px' },
        { text: '編集', value: 'actions', sortable: false, filterable: false, align: 'center', width: '150px' },
      ],
    };
  },
  computed: {
    processedAccountsInfoList() {
      return this.accountsInfoList.map(account => ({
        ...account,
        authName: account.isTeacher === 1 ? '講師' : '一般'
      }));
    }
  },
  methods: {
    filterByUserName(value, search, item) {
      if (search == null || search.trim() === '') return true;
      if (item == null || typeof item.userName !== 'string') return false;
      return item.userName.toLowerCase().includes(search.toLowerCase());
    },
    getAuthColor(authValue) {
      switch (authValue) {
        case '一般': return 'grey darken-1';
        case '講師': return 'blue';
        default: return 'grey'; // 不明
      }
    },
    openNewUserForm() {
      this.showEditOwnAccountButton = true;
      this.$emit('open-regist-form');
    },
    editOwnAccount() {
      this.$emit('open-update-form', this.loginUser);
    },
    editUser(user) {
      this.showEditOwnAccountButton = true;
      this.$emit('open-update-form', user);
    },
    stopUser(user) {
      this.$emit('request-stop-user', user);
    },
    restartUser(user) {
      this.$emit('request-restart-user', user);
    },
    async fetchAccountsInfo() {
      try {

      const data = {
        type: "getAccountsList",
        ownerId: this.loginUser.ownerId,
        token: this.functions.generateRandomAlphanumericString(16),
      };

      // 不要なプロパティ (undefined) を削除
      Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

      let param = this.functions.convertObjectToURLSearchParams(data);
      axios
        .post(this.path.getAccountsList, param)
        .then((response) => {
          if (response.data) {
            if (response.data.type === "success") {
              this.accountsInfoList = response.data.list;
            }
          }
        })
        .catch((error) => {
          if (error.response) {
            console.error("Error Response:", error.response);
          } else if (error.request) {
            console.error("Error Request:", error.request);
          } else {
            console.error("Error:", error.message);
          }
        });
      } catch (error) {
        console.error("アカウント情報の取得に失敗しました:", error);
      }
    },
  },
  mounted() {
    this.fetchAccountsInfo();
  },
});

export default accountTableArea;
