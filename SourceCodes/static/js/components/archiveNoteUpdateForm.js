// archiveNoteUpdateForm.js
import BatchCharacterReplacer from './batchCharacterReplacer.js';
import TextFormatter from './textFormatter.js';

let archiveNoteUpdateForm = Vue.component("archive-note-update-form", {
  template: `
    <div v-if="isVisible" data-parts-id="exises-10">
      <v-card class="mt-4 pa-4 rounded-card fader" color="#efebde" outlined>
        <v-form ref="form" lazy-validation>
          <v-card-title class="headline">
            <span class="area-title">{{ formTitle }}</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="archiveNoteUpdateForm.title"
                    label="タイトル"
                    maxlength="100"
                    counter="100"
                    data-parts-id="exises-05-01"
                    :data-contents-id="archiveNoteUpdateForm.contentsId || ''"
                    required
                  ></v-text-field>
                  <p class="valid-errors" v-if="validError.requiredTitle" @click="validError.requiredTitle=false">{{ validError.message.required }}</p>
                  <p class="valid-errors" v-if="validError.invalidTitleChars" @click="validError.invalidTitleChars=false">{{ validError.message.invalidChars }}</p>
                  <p class="valid-errors" v-if="validError.titleMissingRequiredChars" @click="validError.titleMissingRequiredChars=false">{{ validError.message.titleMissingRequiredChars }}</p>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="archiveNoteUpdateForm.url"
                    label="URL"
                    data-parts-id="exises-05-02"
                  ></v-text-field>
                  <p class="valid-errors" v-if="validError.invalidUrl" @click="validError.invalidUrl=false">{{ validError.message.invalidUrlFormat }}</p>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="archiveNoteUpdateForm.urlSub"
                    label="サブリンクURL"
                    data-parts-id="exises-05-03"
                    :disabled="checkSubUrlDependency"
                  ></v-text-field>
                  <p class="valid-errors" v-if="validError.subUrlNeedsMainUrl" @click="validError.subUrlNeedsMainUrl=false">{{ validError.message.subUrlNeedsMainUrl }}</p>
                  <p class="valid-errors" v-if="validError.invalidSubUrl" @click="validError.invalidSubUrl=false">{{ validError.message.invalidUrlFormat }}</p>
                </v-col>
                <v-col cols="12" data-parts-id="exises-05-04">
                  <v-col cols="12">
                    <v-card-subtitle>関連ノート格納先指定テーブル</v-card-subtitle>
                    <v-data-table data-parts-id="exises-05-04-01"
                      :headers="dbTableHeaders"
                      :items="tableData"
                      item-key="filename"
                      class="elevation-1 dense-table"
                      dense
                      hide-default-footer
                      disable-pagination
                    >
                      <template v-slot:item.select="{ item }">
                        <v-checkbox
                          v-model="searchForm.selectedDB"
                          :value="item.filename"
                          data-parts-id="exises-05-04-01-01"
                          hide-details
                          class="ma-0 pa-0"
                          :disabled="isSearchedRelates"
                        ></v-checkbox>
                      </template>
                      <template v-slot:item.title="{ item }">
                        <span data-parts-id="exises-05-04-01-02">{{ item.filename }}</span>
                      </template>
                      <template v-slot:no-data>
                        <span>対象データがありません</span>
                      </template>
                    </v-data-table>
                  </v-col>
                  <v-spacer></v-spacer>
                  <v-col cols="12">
                    <v-row align="center">
                      <v-col cols="12" md="9">
                        <v-text-field data-parts-id="exises-05-04-02"
                          v-model="searchForm.relateNoteIncludeWord"
                          label="タイトル内に含まれるワード"
                          hide-details
                          dense
                          :disabled="isSearchedRelates"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" md="auto">
                        <v-btn
                          color="#8d0000"
                          data-parts-id="exises-05-04-03"
                          class="white--text"
                          :disabled="!isRelateSearchable"
                          @click="searchRelatedNotes"
                          v-if="!isSearchedRelates"
                        >関連ノート検索</v-btn>
                       <v-btn data-parts-id="exises-05-04-04"
                          class="white-button"
                          @click="researchOtherRelatedNotes"
                          v-if="isSearchedRelates"
                        >他の関連ノートを探す</v-btn>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-col>
                <v-col cols="12">
                  <div v-if="searchForm.relateNotesTableData.length > 0" data-parts-id="exises-05-05">
                    <v-card-subtitle>関連ノート・共通ワード設定テーブル</v-card-subtitle>
                    <v-data-table
                      :headers="relateNotesTableHeaders"
                      :items="searchForm.relateNotesTableData"
                      item-key="contentsId"
                      data-parts-id="exises-05-05-01"
                      class="elevation-1 dense-table" dense
                      :footer-props="{'items-per-page-options': [10, 20, 50, 100]}"
                      :items-per-page.sync="itemsPerPage"
                    >
                      <template v-slot:item.select="{ item }">
                        <v-checkbox
                          v-model="archiveNoteUpdateForm.relatesDataObject"
                          :value="item"
                          :disabled="item.common_word==''"
                          data-parts-id="exises-05-05-01-01"
                          hide-details
                          class="ma-0 pa-0 py-3"
                        ></v-checkbox>
                      </template>
                      <template v-slot:item.title="{ item }">
                        <span data-parts-id="exises-05-05-01-02"
                          :data-contents-id="item.contentsId"
                          class="py-3 d-block">{{ item.title }}</span>
                      </template>
                      <template v-slot:item.common_word="{ item }">
                        <v-text-field
                          v-model="item.common_word"
                          maxlength="50"
                          counter="50"
                          label="共通ワード"
                          data-parts-id="exises-05-05-01-03"
                          hide-details dense class="ma-0 pa-0 py-3"
                          :disabled="isCommonWordInputDisabled(item)"
                        ></v-text-field>
                      </template>
                      <template v-slot:no-data>
                        <span>対象データがありません</span>
                      </template>
                    </v-data-table>
                  </div>
                </v-col>
                <br />
                <v-col cols="12">
                  <div data-parts-id="exises-05-06">
                    <v-card-subtitle>関連ノート・共通ワードリスト</v-card-subtitle>
                    <v-list class="relate-words-list">
                      <template v-if="archiveNoteUpdateForm.relatesDataObject && archiveNoteUpdateForm.relatesDataObject.length > 0">
                        <v-list-item color="#efebde" v-for="selected_row in archiveNoteUpdateForm.relatesDataObject" :key="selected_row.contentsId">
                          <v-list-item-action>
                            <v-btn icon small
                              class="white-button"
                              @click="removeRelatedNote(selected_row)"
                              data-parts-id="exises-05-06-01-01"
                              :data-contents-id="selected_row.contentsId"
                            >
                              <v-icon>mdi-close</v-icon>
                            </v-btn>
                          </v-list-item-action>
                          <v-list-item-content data-parts-id="exises-05-06-01-02" :data-contents-id="selected_row.contentsId">
                            <span>{{ selected_row.title }}</span>
                            <span class="ml-2">(共通ワード: {{ selected_row.common_word }})</span>
                          </v-list-item-content>
                        </v-list-item>
                      </template>
                      <v-list-item v-else class="set-center">
                        <v-list-item-content>関連ノートは選択されていません。</v-list-item-content>
                      </v-list-item>
                      <div v-if="archiveNoteUpdateForm.relatesDataObject" align="center">
                        <span>※関連ノートは最大で99件まで登録できます。</span>
                      </div>
                    </v-list>
                  </div>
                </v-col>
                <v-col cols="12" sm="3" data-parts-id="exises-05-07">
                  <v-select
                    v-model="archiveNoteUpdateForm.publicity"
                    :items="publicityOptions"
                    item-text="text"
                    item-value="value"
                    label="公開設定"
                    data-parts-id="exises-05-07-01"
                    required
                  ></v-select>
                  <p class="valid-errors" v-if="validError.requiredPublicity" @click="validError.requiredPublicity=false">{{ validError.message.requiredSelect }}</p>
                </v-col>
                <v-col cols="12" data-parts-id="exises-05-08">
                  <v-row justify="center" align="center">
                    <v-col cols="12" sm="auto" class="pa-1 text-center">
                      <v-btn color="#8d0000" class="white--text" @click="transformToBlank" data-parts-id="exises-05-08-01">虫食い化する</v-btn>
                    </v-col>
                    <v-col cols="12" sm="auto" class="pa-1 text-center">
                      <v-btn color="#8d0000" class="white--text" @click="convertToHalfWidth" data-parts-id="exises-05-08-02">半角化する</v-btn>
                    </v-col>
                    <v-col cols="12" sm="auto" class="pa-1 text-center">
                      <v-btn color="#8d0000" class="white--text" @click="surroundWithBrackets" data-parts-id="exises-05-08-03">【】で囲む</v-btn>
                    </v-col>
                    <v-col cols="12" sm="auto" class="pa-1 text-center">
                      <v-btn color="#8d0000" class="white--text" @click="surroundWithStars" data-parts-id="exises-05-08-04">☆で囲む</v-btn>
                    </v-col>
                  </v-row>
                </v-col>
                <v-col cols="12">
                  <v-textarea data-parts-id="exises-05-09"
                    ref="noteTextarea"
                    v-model="archiveNoteUpdateForm.text"
                    label="ノート本文"
                    @input="updateByteCount"
                    outlined
                    required
                  ></v-textarea>
                  <p class="valid-errors" v-if="validError.requiredText" @click="validError.requiredText=false">{{ validError.message.required }}</p>
                  <p class="valid-errors" v-if="validError.invalidTextChars" @click="validError.invalidTextChars=false">{{ validError.message.invalidChars }}</p>
                  <p class="valid-errors" v-if="validError.textMissingRequiredChars" @click="validError.textMissingRequiredChars=false">{{ validError.message.textMissingRequiredChars }}</p>
                  <div data-parts-id="exises-05-10" align="center">
                    <span :style="{ color: validError.byteCountExceeded ? 'red' : 'inherit' }">現在のバイト数: {{ byteCount }} / 65000 bytes</span>
                    <div v-if="validError.byteCountExceeded" class="valid-errors" style="color: red;">{{ validError.message.byteCountExceeded }}</div>
                  </div>
                </v-col>
                <v-col cols="12" data-parts-id="exises-05-11">
                  <div v-if="!archiveNoteUpdateForm.isTextModifyMode" align="center">
                    <v-btn data-parts-id="exises-05-11-01"
                      color="#8d0000"
                      class="white--text"
                      @click="archiveNoteUpdateForm.isTextModifyMode = true"
                    >ノート本文を整形</v-btn>
                  </div>
                  <div v-else>
                    <text-formatter
                      :initial-text="archiveNoteUpdateForm.text"
                      :dialog="dialog"
                      @formatted="handleFormattedText"
                      @cancelled="handleFormattingCancelled"
                      @formatting-complete="handleFormattingComplete"
                      data-parts-id="exises-05-11-02"
                    ></text-formatter>
                  </div>
                </v-col>
                <v-col cols="12" align="center">
                  <v-btn color="#8d0000" class="white--text" @click="copyNoteText" data-parts-id="exises-05-12">ノート本文をコピー</v-btn>
                  <p class="copy-success" v-if="showCopySuccess" @click="showCopySuccess=false">ノート本文をコピーしました</p>
                </v-col>
                <v-col cols="12" data-parts-id="exises-05-13">
                  <batch-character-replacer
                    :dialog="dialog"
                    :initial-text="archiveNoteUpdateForm.text"
                    @replaced="handleBatchReplaced"
                  ></batch-character-replacer>
                </v-col>
                <v-col cols="12">
                  <v-textarea data-parts-id="exises-05-14"
                    v-model="archiveNoteUpdateForm.relateVideoUrlInput"
                    label="関連動画URL (1行に1つ、最大5件)"
                    @input="updateRelateVideoUrlList"
                    outlined rows="3"
                  ></v-textarea>
                  <p class="valid-errors" v-if="validError.invalidVideoUrlFormat" @click="validError.invalidVideoUrlFormat=false">{{ validError.message.invalidVideoUrlFormat }}</p>
                  <p class="valid-errors" v-if="validError.tooManyVideoUrls" @click="validError.tooManyVideoUrls=false">{{ validError.message.tooManyVideoUrls }}</p>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions class="d-flex flex-column flex-sm-row justify-sm-center align-center pa-2">
            <v-btn data-parts-id="exises-10-01"
              v-if="isDownloadButtonVisible"
              color="#8d0000" class="white--text my-1 mx-sm-2"
              :disabled="!isDownloadButtonActive"
              @click="downloadCsvRowData"
            >CSV行データをダウンロード</v-btn>
            <v-btn data-parts-id="exises-10-02"
              class="white-button my-1 mx-sm-2"
              @click="resetForm"
            >リセット</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </div>
  `,
  props: {
    dialog: Object,
    loginUser: Object,
    functions: Object,
    noteData: Object, // 編集対象のノートデータ
    isVisible: Boolean, // フォームの表示状態
    path: Object, // APIパス (noteRegistUpdateFormから移行)
  },
  components: {
    TextFormatter,
    BatchCharacterReplacer,
  },
  data() {
    return {
      archiveNoteUpdateForm: { // noteRegistUpdateForm から変更
        contentsId: null,
        title: '',
        url: '',
        urlSub: '',
        publicity: 0,
        text: '',
        relatesDataObject: [],
        relateVideoUrlInput: '',
        relateVideoUrlList: [],
        createdUserId: null,
        created: null, // 元データの作成日時を保持
        isTextModifyMode: false,
      },
      initialFormState: {},
      isDownloadButtonVisible: false,
      isSearchedRelates: false,
      publicityOptions: [
        { text: "非公開", value: 0 },
        { text: "公開", value: 1 },
        { text: "講師にのみ公開", value: 2 }
      ],
      byteCount: 0,
      dbTableHeaders: [
        { text: '選択', value: 'select', sortable: false, width: '50px', align: 'center' },
        { text: 'タイトル', value: 'title', sortable: false, align: 'start' },
      ],
      relateNotesTableHeaders: [
        { text: '選択', value: 'select', sortable: false, width: '50px', align: 'center' },
        { text: 'タイトル', value: 'title', sortable: false, align: 'start' },
        { text: '設定する共通ワード', value: 'common_word', sortable: false, align: 'start', width: '300px' },
      ],
      tableData: [], // CSVファイル名リスト
      searchForm: { // noteRegistUpdateForm から移行
        selectedDB: [],
        relateNoteIncludeWord: '',
        relateNotesTableData: [],
      },
      validError: {
        requiredTitle: false,
        invalidTitleChars: false,
        requiredText: false,
        invalidTextChars: false,
        invalidUrl: false,
        invalidSubUrl: false,
        subUrlNeedsMainUrl: false,
        invalidVideoUrlFormat: false,
        tooManyVideoUrls: false,
        byteCountExceeded: false,
        requiredPublicity: false,
        titleMissingRequiredChars: false, // CSVダウンロード用
        textMissingRequiredChars: false,  // CSVダウンロード用
        message: {
          required: '入力必須項目です。',
          requiredSelect: '選択必須項目です。',
          invalidChars: '有効な文字（英数字、日本語など）を入力してください。',
          invalidUrlFormat: '有効なURL形式ではありません。',
          subUrlNeedsMainUrl: 'メインURLを先に入力してください。',
          invalidVideoUrlFormat: 'YouTube動画URLの形式ではない行があります。',
          tooManyVideoUrls: '関連動画URLは5件までです。',
          byteCountExceeded: `ノート本文の総バイト数が65000を超えています。`,
          titleMissingRequiredChars: "タイトルには有効な文字（半角英数字、全角英数字、日本語文字のいずれか）を含めてください。",
          textMissingRequiredChars: "ノート本文には有効な文字（半角英数字、全角英数字、日本語文字のいずれか）を含めてください。",
        }
      },
      validationRules: {
        textContentRegex: /[a-zA-Z0-9ａ-ｚＡ-Ｚ０-９\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF々\s!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~、。〃々〆〇〈〉《》「」『』【】〒〓〔〕〖〗〘〙〚〛〜〝〞〟〠〡〢〣〤〥〦〧〨〩〪〭〮〯〫〬〰〱〲〳〴〵〶〷〸〹〺〻〼〽〾〿]+/,
        youtubeRegex: /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
        urlRegex: /^(https?:\/\/)?([a-zA-Z0-9\-\.]+)\.([a-zA-Z]{2,})(\/[^\s]*)?$/,
      },
      showCopySuccess: false,
      lastSelection: null, // テキストエリアの選択範囲記憶用
      itemsPerPage: 10,
    };
  },
  computed: {
    formTitle() {
      return "CSVノート情報更新フォーム";
    },
    isDownloadButtonActive() {
      return !!this.archiveNoteUpdateForm.title && !!this.archiveNoteUpdateForm.text && !this.validError.byteCountExceeded;
    },
    checkSubUrlDependency() {
      return !this.archiveNoteUpdateForm.url || !this.isValidUrlFormatInternal(this.archiveNoteUpdateForm.url);
    },
    isRelateSearchable() {
      return this.searchForm.relateNoteIncludeWord != '' && this.searchForm.selectedDB.length > 0
    },
    isCommonWordInputDisabled() {
      return (item) => {
        return (
          this.archiveNoteUpdateForm.relatesDataObject && 
          this.archiveNoteUpdateForm.relatesDataObject.some(selected => selected.contentsId === item.contentsId)
        );
      };
    }
  },
  watch: {
    noteData: {
      handler(newVal) {
        if (newVal) {
          this.archiveNoteUpdateForm.contentsId = newVal.contentsId || null;
          this.archiveNoteUpdateForm.title = newVal.title || "";
          this.archiveNoteUpdateForm.url = newVal.url || "";
          this.archiveNoteUpdateForm.urlSub = newVal.url_sub || ""; // APIのキーに合わせる
          this.archiveNoteUpdateForm.publicity = typeof newVal.publicity === 'number' ? newVal.publicity : 0;
          this.archiveNoteUpdateForm.text = newVal.note || ""; // APIのキーに合わせる
          this.archiveNoteUpdateForm.createdUserId = newVal.created_user_id || this.loginUser?.ownerId || null; // APIのキーに合わせる
          this.archiveNoteUpdateForm.created = newVal.created || null;
          this.archiveNoteUpdateForm.createdTime = newVal.createdTime || null;

          try {
            const relates = newVal.relate_notes;
            if (relates && typeof relates === 'string' && relates !== 'NULL') {
              this.archiveNoteUpdateForm.relatesDataObject = JSON.parse(this.functions.unescapeText(relates));
            } else if (Array.isArray(relates)) {
              this.archiveNoteUpdateForm.relatesDataObject = relates;
            } else {
              this.archiveNoteUpdateForm.relatesDataObject = [];
            }
          } catch (e) {
            console.error("関連ノートデータのパースエラー:", e);
            this.archiveNoteUpdateForm.relatesDataObject = [];
          }

          const videoUrlsString = newVal.relate_video_urls || '';
          this.archiveNoteUpdateForm.relateVideoUrlInput = (videoUrlsString === 'NULL' || videoUrlsString === null) ? '' : this.functions.unescapeText(videoUrlsString).replace(/\\n/g, '\n');
          this.updateRelateVideoUrlList();

          this.archiveNoteUpdateForm.isTextModifyMode = false;
          this.updateByteCount(this.archiveNoteUpdateForm.text);
          this.initialFormState = JSON.parse(JSON.stringify(this.archiveNoteUpdateForm));
          this.resetValidationErrors();
        }
      },
      immediate: true,
      deep: true,
    },
    isVisible(newVal) {
      if (newVal) {
        this.isDownloadButtonVisible = true;
        this.resetValidationErrors();
        this.fetchNoteCsvFilesForRelates(); // 表示時にCSVリストを取得
      }
    },
    'archiveNoteUpdateForm.relatesDataObject': {
      handler(newVal, oldVal) {
        if (newVal && newVal.length > 99) {
          this.$nextTick(() => {
            this.archiveNoteUpdateForm.relatesDataObject = oldVal || [];
            alert("関連ノートの最大登録件数は99件です。");
          });
        }
        this.$forceUpdate();
      },
      deep: true
    },
    'validError.byteCountExceeded': function() { this.$forceUpdate(); },
    'archiveNoteUpdateForm.title': function() { this.$forceUpdate(); },
    'archiveNoteUpdateForm.text': function() { this.$forceUpdate(); }
  },
  methods: {
    isValidTextContent(str) {
      if (!str) return false;
      return this.validationRules.textContentRegex.test(str);
    },
    isValidYouTubeUrl(url) {
      if (!url) return false;
      return this.validationRules.youtubeRegex.test(url);
    },
    isValidUrlFormatInternal(url) {
      if (!url) return true;
      return this.validationRules.urlRegex.test(url);
    },
    async fetchNoteCsvFilesForRelates() { // 関連ノート格納先テーブル用のCSVファイル名リストを取得
      try {
        const data = {
          type: "getCsvList",
          ownerId: this.loginUser.ownerId, // 必要に応じて
          token: this.functions.generateRandomAlphanumericString(16),
        };
        let param = this.functions.convertObjectToURLSearchParams(data);
        const response = await axios.post(this.path.getCsvList, param); // this.path.getCsvList を使用
        if (response.data && response.data.type === "success") {
          const noteCsvFiles = response.data.list.filter(csv => csv.includes('ulinker_notes'));
          this.tableData = noteCsvFiles.map(csv => ({ filename: csv }));
          this.tableData.push({ filename: 'ulinker_notes' }); // DBテーブルも選択肢に入れる
        } else {
          console.error("CSVリストの取得に失敗しました:", response.data?.message);
          this.tableData = [{ filename: 'ulinker_notes' }]; // デフォルト
        }
      } catch (error) {
        console.error("CSVリストの取得中にエラーが発生しました:", error);
        this.tableData = [{ filename: 'ulinker_notes' }]; // エラー時デフォルト
      }
    },
    async searchRelatedNotes() {
      if (!this.searchForm.relateNoteIncludeWord || this.searchForm.relateNoteIncludeWord.trim() === '') {
        this.searchForm.relateNotesTableData = [];
        return;
      }
      const keywordToSend = this.searchForm.relateNoteIncludeWord.split(' ')[0];
      const data = {
        type: 'getRelateNoteList',
        keyword: keywordToSend,
        list: JSON.stringify(this.searchForm.selectedDB),
        owner_id: this.loginUser.ownerId,
        token: this.functions.generateRandomAlphanumericString(16),
      };
      let param = this.functions.convertObjectToURLSearchParams(data);
      try {
        const response = await axios.post(this.path.getSearchedDataList, param); // this.path.getSearchedDataList を使用
        if (response.data && response.data.type === "success") {
          const apiResults = response.data.list || [];
          const existingSelection = this.archiveNoteUpdateForm.relatesDataObject || [];
          const map = new Map();
          existingSelection.forEach(note => map.set(note.contentsId, { ...note }));
          apiResults.forEach(note => {
            if (!map.has(note.contentsId)) {
              const unescapedTitle = this.functions.unescapeText(note.title);
              map.set(note.contentsId, { ...note, title: unescapedTitle, common_word: '' }); // common_word を初期化
            }
          });
          this.searchForm.relateNotesTableData = Array.from(map.values());
        } else {
          console.error("API Error:", response.data?.message, response.data);
        }
        this.isSearchedRelates = true;
      } catch (error) {
        console.error("Search Related Notes Error:", error);
      }
    },
    researchOtherRelatedNotes() { 
      this.isSearchedRelates = false; // 「関連ノート検索」ボタンを表示し、自身を非表示にする
      this.searchForm.relateNoteIncludeWord = ''; // 検索ワードをクリア
      this.searchForm.selectedDB = []; // 選択DBをクリア
      this.searchForm.relateNotesTableData = []; // 関連ノートテーブルのデータをクリア
    },
    removeRelatedNote(selected_row) {
      this.archiveNoteUpdateForm.relatesDataObject = this.archiveNoteUpdateForm.relatesDataObject.filter(
        item => item.contentsId !== selected_row.contentsId
      );
      this.$forceUpdate();
    },
    updateByteCount(text = this.archiveNoteUpdateForm.text) {
      const byteLength = new Blob([text || '']).size;
      this.byteCount = byteLength;
      this.validError.byteCountExceeded = byteLength > 65000;
    },
    getTextSelection() {
      const textarea = this.$refs.noteTextarea?.$refs?.input;
      if (!textarea) return { start: 0, end: (this.archiveNoteUpdateForm.text || '').length, text: this.archiveNoteUpdateForm.text || '' };
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = (this.archiveNoteUpdateForm.text || '').substring(start, end);
      this.lastSelection = { start, end };
      return { start, end, text: selectedText };
    },
    updateTextareaContent(newText, newStart, newEnd) {
      this.archiveNoteUpdateForm.text = newText;
      this.updateByteCount(newText);
      this.$nextTick(() => {
        const textarea = this.$refs.noteTextarea?.$refs?.input;
        if (textarea) {
          const finalStart = newStart !== undefined ? newStart : (this.lastSelection ? this.lastSelection.end : 0);
          const finalEnd = newEnd !== undefined ? newEnd : finalStart;
          textarea.focus();
          textarea.setSelectionRange(finalStart, finalEnd);
          this.lastSelection = { start: finalStart, end: finalEnd };
        }
      });
    },
    transformToBlank() {
      const selection = this.getTextSelection();
      if (!selection.text) return;
      const blankText = '【' + '＿'.repeat(selection.text.length) + '】';
      const newText = (this.archiveNoteUpdateForm.text || '').substring(0, selection.start) + blankText + (this.archiveNoteUpdateForm.text || '').substring(selection.end);
      this.updateTextareaContent(newText, selection.start, selection.start + blankText.length);
    },
    convertToHalfWidth() {
      const selection = this.getTextSelection();
      if (!selection.text) return;
      const halfWidthText = selection.text.replace(/[\uFF01-\uFF5E]/g, function(s) {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
      });
      const newText = (this.archiveNoteUpdateForm.text || '').substring(0, selection.start) + halfWidthText + (this.archiveNoteUpdateForm.text || '').substring(selection.end);
      this.updateTextareaContent(newText, selection.start, selection.start + halfWidthText.length);
    },
    surroundWithBrackets() {
      const selection = this.getTextSelection();
      if (!selection.text) return;
      const surroundedText = `【${selection.text}】`;
      const newText = (this.archiveNoteUpdateForm.text || '').substring(0, selection.start) + surroundedText + (this.archiveNoteUpdateForm.text || '').substring(selection.end);
      this.updateTextareaContent(newText, selection.start, selection.start + surroundedText.length);
    },
    surroundWithStars() {
      const selection = this.getTextSelection();
      if (!selection.text) return;
      const surroundedText = `☆${selection.text}☆`;
      const newText = (this.archiveNoteUpdateForm.text || '').substring(0, selection.start) + surroundedText + (this.archiveNoteUpdateForm.text || '').substring(selection.end);
      this.updateTextareaContent(newText, selection.start, selection.start + surroundedText.length);
    },
    handleFormattedText(formattedText) {
      this.archiveNoteUpdateForm.text = formattedText;
      this.updateByteCount(formattedText);
    },
    handleFormattingComplete() {
      this.archiveNoteUpdateForm.isTextModifyMode = false;
    },
    handleFormattingCancelled() {
      this.archiveNoteUpdateForm.isTextModifyMode = false;
    },
    async copyNoteText() {
      try {
        await navigator.clipboard.writeText(this.archiveNoteUpdateForm.text || '');
        this.showCopySuccess = true;
        setTimeout(() => this.showCopySuccess = false, 3000);
      } catch (err) {
        console.error('ノート本文のコピーに失敗しました:', err);
        alert('クリップボードへのコピーに失敗しました。');
      }
    },
    handleBatchReplaced(replacedText) {
      this.archiveNoteUpdateForm.text = replacedText;
      this.updateByteCount(replacedText);
    },
    updateRelateVideoUrlList(){
      this.archiveNoteUpdateForm.relateVideoUrlList = (this.archiveNoteUpdateForm.relateVideoUrlInput || '').split('\\n').map(url => url.trim()).filter(url => url !== '');
    },
    resetValidationErrors() {
      this.validError.requiredTitle = false;
      this.validError.invalidTitleChars = false;
      this.validError.requiredText = false;
      this.validError.invalidTextChars = false;
      this.validError.invalidUrl = false;
      this.validError.invalidSubUrl = false;
      this.validError.subUrlNeedsMainUrl = false;
      this.validError.invalidVideoUrlFormat = false;
      this.validError.tooManyVideoUrls = false;
      this.validError.requiredPublicity = false;
      this.validError.byteCountExceeded = false;
      this.validError.titleMissingRequiredChars = false;
      this.validError.textMissingRequiredChars = false;
    },

    formatTimestampForFilename(date = new Date()) {
      const y = date.getFullYear();
      const m = ('0' + (date.getMonth() + 1)).slice(-2);
      const d = ('0' + date.getDate()).slice(-2);
      const h = ('0' + date.getHours()).slice(-2);
      const mi = ('0' + date.getMinutes()).slice(-2);
      const s = ('0' + date.getSeconds()).slice(-2);
      return `${y}${m}${d}_${h}${mi}${s}`;
    },
    _escapeForCsv(str) {
      if (str === null || str === undefined) return '';
      str = String(str);
      return str.replace(/"/g, '""');
    },
    doValidationForDownload() {
      this.resetValidationErrors();
      let isValid = true;
      const containsValidChars = (str) => {
        if (!str) return false;
        return /[a-zA-Z0-9\uFF10-\uFF19\uFF21-\uFF3A\uFF41-\uFF5A\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(str);
      };

      if (!this.archiveNoteUpdateForm.title) {
        this.validError.requiredTitle = true; // 通常の必須チェックも行う
        isValid = false;
      } else if (!containsValidChars(this.archiveNoteUpdateForm.title)) {
        this.validError.titleMissingRequiredChars = true;
        isValid = false;
      }

      if (!this.archiveNoteUpdateForm.text) {
        this.validError.requiredText = true; // 通常の必須チェックも行う
        isValid = false;
      } else if (!containsValidChars(this.archiveNoteUpdateForm.text)) {
        this.validError.textMissingRequiredChars = true;
        isValid = false;
      }
      if (this.validError.byteCountExceeded) isValid = false; // バイト数超過もバリデーションエラー

      const videoUrls = (this.archiveNoteUpdateForm.relateVideoUrlInput || '').split('\\n').map(url => url.trim()).filter(url => url !== '');
      if (videoUrls.length > 5) {
        this.validError.tooManyVideoUrls = true;
        isValid = false;
      }
      let invalidUrlFound = false;
      this.archiveNoteUpdateForm.relateVideoUrlList = []; // バリデーション済みリストを初期化
      videoUrls.forEach(url => {
        if (!this.isValidYouTubeUrl(url)) {
          invalidUrlFound = true;
        } else {
          try {
            const parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
            let cleanedUrl = '';
            const videoId = parsedUrl.searchParams.get('v');
            if (parsedUrl.hostname.includes('youtube.com') && videoId) {
              cleanedUrl = `https://www.youtube.com/watch?v=${videoId}`;
            } else if (parsedUrl.hostname === 'youtu.be') {
              const pathVideoId = parsedUrl.pathname.substring(1);
              if (pathVideoId) cleanedUrl = `https://youtu.be/${pathVideoId}`;
            }
            if (cleanedUrl) this.archiveNoteUpdateForm.relateVideoUrlList.push(cleanedUrl);
            else invalidUrlFound = true;
          } catch (e) { invalidUrlFound = true; }
        }
      });
      if (invalidUrlFound) {
        this.validError.invalidVideoUrlFormat = true;
        isValid = false;
      }
      if (this.archiveNoteUpdateForm.relateVideoUrlList.length > 5) {
        this.validError.tooManyVideoUrls = true;
        isValid = false;
      }
      if (!this.doGeneralValidation()) isValid = false; // 通常のバリデーションも呼び出す

      return isValid;
    },
    doGeneralValidation() { // noteRegistUpdateFormから流用した汎用バリデーション
      let isValid = true;
      if (!this.archiveNoteUpdateForm.title) {
        this.validError.requiredTitle = true;
        isValid = false;
      } else if (!this.isValidTextContent(this.archiveNoteUpdateForm.title)) {
        this.validError.invalidTitleChars = true;
        isValid = false;
      }
      if (!this.archiveNoteUpdateForm.text) {
        this.validError.requiredText = true;
        isValid = false;
      } else if (!this.isValidTextContent(this.archiveNoteUpdateForm.text)) {
        this.validError.invalidTextChars = true;
        isValid = false;
      }
      if (this.archiveNoteUpdateForm.url && !this.isValidUrlFormatInternal(this.archiveNoteUpdateForm.url)) {
        this.validError.invalidUrl = true;
        isValid = false;
      }
      if (this.archiveNoteUpdateForm.urlSub) {
        if (!this.archiveNoteUpdateForm.url || !this.isValidUrlFormatInternal(this.archiveNoteUpdateForm.url)) {
          this.validError.subUrlNeedsMainUrl = true;
          isValid = false;
        }
        if (!this.isValidUrlFormatInternal(this.archiveNoteUpdateForm.urlSub)) {
          this.validError.invalidSubUrl = true;
          isValid = false;
        }
      }
      if (this.archiveNoteUpdateForm.publicity === null || this.archiveNoteUpdateForm.publicity === undefined) {
        this.validError.requiredPublicity = true;
        isValid = false;
      }
      if (this.validError.byteCountExceeded) isValid = false;

      return isValid;
    },
    downloadCsvRowData() {
      if (!this.doValidationForDownload()) return;

      const now = new Date();
      const timestamp = this.functions.formatDateTime(now);;
      const timestampForFile = this.formatTimestampForFilename(now);
      const titleForFile = (this.archiveNoteUpdateForm.title || 'untitled').replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\uFF10-\uFF19\uFF21-\uFF3A\uFF41-\uFF5A-]+/g, '_');
      const filename = `csv-row_${titleForFile}_${timestampForFile}.txt`;
      const esc = this.functions.escapeText; // HTMLエンティティ風エスケープ
      const csvEsc = this._escapeForCsv;    // CSV標準エスケープ (ダブルクォート)

      const urlCsvValue = (this.archiveNoteUpdateForm.url == null || this.archiveNoteUpdateForm.url == '')
        ? 'NULL'
        : `"${csvEsc(this.archiveNoteUpdateForm.url || '')}"`;
      const urlSubCsvValue = (this.archiveNoteUpdateForm.urlSub == null || this.archiveNoteUpdateForm.urlSub == '')
        ? 'NULL'
        : `"${csvEsc(this.archiveNoteUpdateForm.urlSub || '')}"`;
      const relatesDataCsvValue = (this.archiveNoteUpdateForm.relatesDataObject == null || this.archiveNoteUpdateForm.relatesDataObject == 'NULL' || this.archiveNoteUpdateForm.relatesDataObject == '')
        ? 'NULL'
        : `"${csvEsc(esc(JSON.stringify(this.archiveNoteUpdateForm.relatesDataObject || [])))}"`;

      const dataToJoin = [
        `"${csvEsc(this.archiveNoteUpdateForm.contentsId || '')}"`,
        `"${csvEsc(esc(this.archiveNoteUpdateForm.title || ''))}"`,
        urlCsvValue,
        urlSubCsvValue,
        `"${csvEsc(esc(this.archiveNoteUpdateForm.text.replaceAll('\n','\\n') || ''))}"`,
        `"${csvEsc(this.archiveNoteUpdateForm.publicity === null ? '' : this.archiveNoteUpdateForm.publicity)}"`,
        relatesDataCsvValue,
        `"${csvEsc(this.archiveNoteUpdateForm.relateVideoUrlInput.replaceAll('\n','\\n'))}"`,
        `"${csvEsc(this.archiveNoteUpdateForm.created + ' ' + this.archiveNoteUpdateForm.createdTime || '')}"`, // 元データの作成日時
        `"${csvEsc(timestamp)}"`, // ボタン押下時刻
        `"${csvEsc(this.loginUser.ownerId || '')}"`, // 更新者ID
      ];
      const fileContent = dataToJoin.join(',');

      const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8;' });
      const link = document.createElement("a");
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        alert("お使いのブラウザでは直接ダウンロードがサポートされていません。");
      }
      this.isDownloadButtonVisible = false;
    },
    resetForm() {
      this.archiveNoteUpdateForm = JSON.parse(JSON.stringify(this.initialFormState));
      this.searchForm.relateNoteIncludeWord = '';
      this.searchForm.relateNotesTableData = [];
      this.isSearchedRelates = false;
      this.searchForm.selectedDB = [];
      this.updateByteCount(this.archiveNoteUpdateForm.text); // バイト数再計算
      this.resetValidationErrors();
      this.isDownloadButtonVisible = true;
      this.showCopySuccess = false;
      this.archiveNoteUpdateForm.isTextModifyMode = false;

      if (this.$refs.form) this.$refs.form.resetValidation();
    }
  },
  mounted() {
    this.updateByteCount();
    this.fetchNoteCsvFilesForRelates();
    if (this.isVisible) { // 初期表示時にも isVisible の watch と同様の処理を行う
      this.isDownloadButtonVisible = true;
      this.resetValidationErrors();
    }
  }
});

export default archiveNoteUpdateForm;
