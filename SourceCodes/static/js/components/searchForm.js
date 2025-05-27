// searchForm.js
import promptSettings from './promptSettings.js';

let searchForm = Vue.component("search-form", {
  template: `
    <div class="search-form">
      <v-card class="pa-4 rounded-card" color="#efebde" width="93%" outlined>
        <v-card-title>
          <span class="area-title">検索フォーム</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field v-model="searchForm.keyword" label="検索ワード" maxlength="50" counter="50" data-parts-id="common-03-01"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="searchForm.excludeWord" label="除外ワード" maxlength="50" counter="50" data-parts-id="common-03-02" ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-row align="center" class="align-center">
                  <v-col cols="12" sm="5">
                    <label class="mr-2">キーワードを含む対象</label>
                    <v-btn v-if="searchForm.includeFor === 0" color="#8d0000" class="white--text" data-parts-id="common-03-03" @click="toggleIncludeFor">タイトル</v-btn>
                    <v-btn v-else class="white-button" data-parts-id="common-03-03" @click="toggleIncludeFor">本文・タグ</v-btn>
                  </v-col>
                  <v-col cols="12" sm="4">
                    <label class="mr-2">検索モード</label>
                    <v-btn v-if="searchForm.andOr === 0" color="#8d0000" class="white--text" data-parts-id="common-03-04" @click="toggleAndOr">AND</v-btn>
                    <v-btn v-else class="white-button" data-parts-id="common-03-04" @click="toggleAndOr">OR</v-btn>
                  </v-col>
                  <v-col cols="12" sm="3">
                    <v-row align="center" class="align-center">
                      <v-col cols="1">
                        <v-spacer></v-spacer>
                      </v-col>
                      <v-col cols="11">
                        <v-select
                          v-model="searchForm.limitNum"
                          :items="[10, 50, 100, 500]"
                          label="表示件数"
                          data-parts-id="common-03-07"
                          item-value="value"
                          item-text="text"
                        >
                        <template v-slot:item="{ item }">
                          <span data-parts-id="common-03-07-01">{{ item }}</span>
                        </template>
                        </v-select>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="searchForm.createdBy" label="登録ユーザー名" maxlength="30" counter="30" data-parts-id="common-03-05"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-row align="center" class="date-range-row">
                  <v-col cols="12" md="4" class="d-flex align-center">
                    <label class="mr-2">表示対象期間</label>
                  </v-col>
                  <v-col cols="12" md="4" class="d-flex align-center">
                    <v-menu
                      v-model="dateSelect.startDateMenu"
                      :close-on-content-click="false"
                      transition="scale-transition"
                      offset-y
                      max-width="290"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                          v-model="searchForm.startDate"
                          label="開始日 (yyyy/mm/dd)"
                          data-parts-id="common-03-06-01"
                          readonly
                          v-bind="attrs"
                          v-on="on"
                          class="calendar-input"
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        v-model="searchForm.startDate"
                        :max="dateSelect.endDateForStart"
                        @input="dateSelect.startDateMenu = false"
                        locale="ja-jp"
                      ></v-date-picker>
                      <v-card>
                        <v-card-actions>
                          <v-btn text @click="searchForm.startDate = null; dateSelect.startDateMenu = false">クリア</v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-menu>
                  </v-col>
                  <v-col cols="12" md="4" class="d-flex align-center">
                    <v-menu
                      v-model="dateSelect.endDateMenu"
                      :close-on-content-click="false"
                      transition="scale-transition"
                      offset-y
                      max-width="290"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                          v-model="searchForm.endDate"
                          label="終了日 (yyyy/mm/dd)"
                          data-parts-id="common-03-06-02"
                          readonly
                          v-bind="attrs"
                          v-on="on"
                          class="calendar-input"
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        v-model="searchForm.endDate"
                        :min="dateSelect.startDateForEnd"
                        @input="dateSelect.endDateMenu = false"
                        locale="ja-jp"
                      ></v-date-picker>
                      <v-card>
                        <v-card-actions>
                          <v-btn text @click="searchForm.endDate = null; dateSelect.endDateMenu = false">クリア</v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-menu>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="12" v-if="sessionString!=''">
                <v-card>
                  <v-card-title>
                    <v-col cols="12" md="6">
                      <span>検索対象DB・CSVファイル</span>
                    </v-col>
                    <v-col cols="12" md="6" style="text-align:right">
                      <v-text-field
                        v-model="tableFileName"
                        append-icon="mdi-magnify"
                        label="検索ワードを入力してください"
                        single-line
                        hide-details
                      ></v-text-field>
                    </v-col>
                  </v-card-title>
                  <v-data-table
                    :headers="dbTableRecords.headers"
                    :items="dbTableRecords.dbFiles"
                    item-key="file_name"
                    data-parts-id="common-03-exises-01"
                    :search="tableFileName"
                    :sort-by="['file_name']"
                    class="elevation-1 dense-table"
                    dense
                  >
                    <template v-slot:item.select="{ item }">
                      <v-checkbox
                        v-model="item.checked"
                        data-parts-id="common-03-exises-01-01"
                      ></v-checkbox>
                    </template>
                    <template v-slot:item.file_name="{ item }">
                      <span data-parts-id="common-03-exises-01-02">{{ item.file_name }}</span>
                    </template>
                  </v-data-table>
                </v-card>
              </v-col>
              <v-col cols="12">
                <v-card-title>
                  <span class="area-title">プロンプトカテゴリ選択</span>
                </v-card-title>
                <br />
                <div data-parts-id="common-03-08" class="form-parts">
                  <prompt-settings @get-phrases-array="handleGetPromptPrases"></prompt-settings>
                </div>
              </v-col>
              <v-col cols="12" class="fader" v-if="isDoneSearch">
                <v-col cols="12">
                  <v-textarea v-model="searchForm.aiPrompt" label="生成されたプロンプト" outlined data-parts-id="common-03-09"></v-textarea>
                </v-col>
                <v-col cols="12" class="d-flex justify-center">
                  <v-btn color="#8d0000" class="white--text" data-parts-id="common-03-10" @click="copyToClipboard">プロンプトをクリップボードにコピー</v-btn>
                </v-col>
                <v-col cols="12" class="d-flex justify-center">
                  <div v-if="copySuccess" class="success-message">クリップボードにコピーしました！</div>
                </v-col>
              </v-col>
              <v-col cols="12">
                <v-row justify="center" align="center">
                  <v-col cols="12" sm="auto" class="pa-1 text-center">
                    <v-btn color="#8d0000" class="white--text" data-parts-id="common-03-11" @click="searchAndCreatePrompt">検索＆プロンプト作成</v-btn>
                  </v-col>
                  <v-col cols="12" sm="auto" class="pa-1 text-center" v-if="showPerplexityButton">
                    <v-btn class="white-button" data-parts-id="common-03-12" @click="goToPerplexity">Perplexity-aiにアクセス</v-btn>
                  </v-col>
                  <v-col cols="12" sm="auto" class="pa-1 text-center">
                    <v-btn class="white-button" data-parts-id="common-03-13" @click="dialog.isReloadConfirmOpen=true">リロード</v-btn>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="12" class="justify-center">
                <div v-for="message in errorMessage" :key="message" class="error-message">{{ message }}</div>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
      <v-dialog v-model="dialog.isReloadConfirmOpen" persistent max-width="500">
        <v-card>
          <v-card-title class="headline">{{ thisDialog.confirm.title }}</v-card-title>
          <v-card-text>{{ thisDialog.confirm.message }}</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green darken-1" text @click="dialog.isReloadConfirmOpen=false;reloadPage()">はい</v-btn>
            <v-btn color="red darken-1" text @click="dialog.isReloadConfirmOpen=false">いいえ</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  `,
  props: {
    dialog: Object,
    flag: Object,
    functions: Object,
    loginUser: Object,
    path: Object,
    searchForm: Object,
    selectedRecord: Object,
    sessionString: String,
  },
  components: {
    promptSettings,
  },
  data() {
    return {
      copySuccess: false,
      dateSelect: {
        startDateMenu: false,
        endDateMenu: false,
        startDateForEnd: null,
        endDateForStart: null,
      },
      dbTableRecords: {
        headers: [
          { text: '選択', value: 'select', sortable: false, filterable: true, width: "5%" },
          { text: 'タイトル', value: 'file_name', filterable: false },
        ],
        dbFiles: [],
      },
      errorMessage: [],
      isDoneSearch: false,
      tableFileName: "",
      thisDialog: {
        confirm: {
          title: 'リロード確認',
          message: 'ページをリロードします。よろしいですか？',
        },
      },
      promptAreas: [],
      selectedDB: [],
      showPerplexityButton: false,
    };
  },
  created() {
    this.initializeDB();
    this.initializeSelectedDB();
  },
  methods: {
    handleGetPromptPrases(payload) {
      this.promptAreas = payload.data;
    },
    initializeDB() {
      this.dbTableRecords.dbFiles = this.searchForm.csvList.map(csv => {
        return { file_name: csv, checked: false, selected: false }
      });
      this.dbTableRecords.dbFiles.push({ file_name: 'ulinker_notes', checked: false, selected: false });
      this.dbTableRecords.dbFiles.push({ file_name: 'ulinker_videos', checked: false, selected: false });

      // file_name の昇順でソート
      this.dbTableRecords.dbFiles.sort((a, b) => {
        // file_name を文字列として比較
        if (a.file_name < b.file_name) return -1;
        if (a.file_name > b.file_name) return 1;
        return 0;
      });
    },
    initializeSelectedDB() {
      this.dbTableRecords.dbFiles.forEach(file => file.checked = !file.file_name.endsWith('.csv'));
      this.updateSelectedDB();
    },
    updateSelectedDB() {
      this.selectedDB = this.dbTableRecords.dbFiles.filter(file => file.checked).map(file => file.file_name);
    },
    toggleIncludeFor() {
      this.searchForm.includeFor = this.searchForm.includeFor === 0 ? 1 : 0;
    },
    toggleAndOr() {
      this.searchForm.andOr = this.searchForm.andOr === 0 ? 1 : 0;
    },
    getCheckedPrompts() {
      let result = '';
      const promptHeader = '次の質問にお答えください。\n';
      const promptBorder = '```\n';
      const promptFooter = '上記の内容でよろしくお願いします。';
      let prompt = '';
      const keyword = this.searchForm.keyword.split(' ')[0];
      this.promptAreas.forEach(area => {
        area.items.forEach(item => {
          if (item.selected) prompt += item.promptText.replace('{検索語}', keyword) + '\n';
        });
      });
      if (prompt != '') result = promptHeader + promptBorder + prompt + promptBorder + promptFooter;
      return result;
    },
    async copyToClipboard() {
      try {
        await navigator.clipboard.writeText(this.searchForm.aiPrompt);
        this.copySuccess = true;
        setTimeout(() => this.copySuccess = false, 3000);
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    },
    searchAndCreatePrompt() {
      this.errorMessage = [];
      this.showPerplexityButton = false;
      if (!this.searchForm.keyword) this.errorMessage.push('検索ワードが入力されていません');

      // 選択されたDB/CSVファイルのチェック
      const selectedFiles = this.dbTableRecords.dbFiles.filter(file => file.checked);
      const selectedNotesCount = selectedFiles.filter(file => file.file_name.includes('ulinker_notes')).length;
      const selectedVideosCount = selectedFiles.filter(file => file.file_name.includes('ulinker_videos')).length;

      if (selectedNotesCount === 0 || selectedVideosCount === 0) {
        this.errorMessage.push('検索対象のテーブルまたはCSVが十分に選択されていません');
      } else {
        if (selectedNotesCount > 4 || selectedVideosCount > 4) {
          this.errorMessage.push('ulinker_notesとulinker_videosはそれぞれ4つ以内の選択としてください');
        }
      }
      
      if (this.errorMessage.length > 0) {
        this.showErrorMessage();
        return;
      }

      this.searchForm.aiPrompt = this.getCheckedPrompts();
      this.showPerplexityButton = true;
      
      this.submitSearch();
      this.isDoneSearch = true;
    },
    async submitSearch() { // APIからデータを取得
      try {
        const data = {
          type: "search",
          keyword: this.searchForm.keyword,
          excludeWord: this.searchForm.excludeWord,
          includeFor: this.searchForm.includeFor,
          andOr: this.searchForm.andOr,
          createdBy: this.searchForm.createdBy,
          startDate: this.searchForm.startDate,
          endDate: this.searchForm.endDate,
          limitNum: this.searchForm.limitNum,
          selectedDB: JSON.stringify(this.selectedDB),
          owner_id: this.loginUser.ownerId,
          is_teacher: this.loginUser.isTeacher,
          token: this.functions.generateRandomAlphanumericString(16),
        }
        
        Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);
        let param = this.functions.convertObjectToURLSearchParams(data);

        const response = await axios.post(this.path.getSearchedDataList, param);
        if (response.data && response.data.type === "success") { // 呼び出し元に取得結果（ノート・ビデオのリスト）を返却する
          this.$emit('get-searched-hit-list', { 'searched': this.searchForm, 'list': response.data.list });
        } else {
          console.error("検索結果の取得に失敗しました:", response.data?.message); // エラーメッセージを修正
          this.$emit('fetch-error', response.data?.message || '検索結果の取得に失敗しました。'); // エラーメッセージを修正
        }
      } catch (error) {
        console.error("検索結果取得中にエラーが発生しました:", error); // エラーメッセージを修正
        this.$emit('fetch-error', '検索結果取得中にエラーが発生しました。'); // エラーメッセージを修正
      }
    },
    showErrorMessage() {
      setTimeout(() => this.errorMessage = [], 3000);
    },
    goToPerplexity() {
      window.open('https://www.perplexity.ai/', '_blank');
      this.showPerplexityButton = false;
    },
    reloadPage() {
      location.reload();
    },
  },
  watch: {
    'promptAreas': {
      handler(newVal) {
        newVal.forEach(area => {
          area.allChecked = (area.items.every(item => item.selected)) ? true : false;
        });
      },
      deep: true,
    },
    'searchForm.startDate': {
      handler(newVal) {
        if (newVal) {
          this.dateSelect.startDateForEnd = null;
          this.dateSelect.startDateForEnd = newVal;
        }
      },
    },
    'searchForm.endDate': {
      handler(newVal) {
        if (newVal) {
          this.dateSelect.endDateForStart = null;
          this.dateSelect.endDateForStart = newVal;
        }
      },
    },
    'dbTableRecords.dbFiles': {
      handler() {
        this.updateSelectedDB();
      },
      deep: true,
    },
  },
});

export default searchForm;