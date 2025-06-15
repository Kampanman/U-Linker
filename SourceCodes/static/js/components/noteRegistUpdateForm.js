// noteRegistUpdateForm.js
import BatchCharacterReplacer from './batchCharacterReplacer.js';
import TextFormatter from './textFormatter.js';
import usersNoteArea from './usersNoteArea.js';

let noteRegistUpdateForm = Vue.component("note-regist-update-form", {
  template: `
    <div class="note-regist-update-form-group">
      <div class="user-note-area">
        <users-note-area
          ref="usersNoteArea"
          :path="path"
          :flag="flag"
          :functions="functions"
          :dialog="dialog"
          :login-user="loginUser"
          @request-show-form="handleShowForm"
          @request-delete-confirmation="handleDeleteConfirmation"
        ></users-note-area>
      </div>
      <v-card class="pa-4 rounded-card fader" color="#efebde" outlined v-if="isFormVisible">
        <v-form ref="form" lazy-validation>
          <v-card-title class="headline">
            <span class="area-title">{{ formTitle }}</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field data-parts-id="exises-05-01"
                    v-model="noteRegistUpdateForm.title"
                    maxlength="100"
                    counter="100"
                    label="タイトル" required
                  ></v-text-field>
                  <p class="valid-errors" v-if="validError.requiredTitle" @click="validError.requiredTitle=false">{{ validError.message.required }}</p>
                  <p class="valid-errors" v-if="validError.invalidTitleChars" @click="validError.invalidTitleChars=false">{{ validError.message.invalidChars }}</p>
                </v-col>
                <v-col cols="12">
                  <v-text-field data-parts-id="exises-05-02"
                    v-model="noteRegistUpdateForm.url"
                    label="URL"
                  ></v-text-field>
                  <p class="valid-errors" v-if="validError.invalidUrl" @click="validError.invalidUrl=false">{{ validError.message.invalidUrlFormat }}</p>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="noteRegistUpdateForm.urlSub"
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
                      hide-default-footer
                      disable-pagination dense
                    >
                      <template v-slot:item.select="{ item }">
                        <v-checkbox data-parts-id="exises-05-04-01-01"
                          v-model="searchForm.selectedDB"
                          :value="item.filename"
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
                          hide-details dense
                          :disabled="isSearchedRelates"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" md="auto">
                        <v-btn data-parts-id="exises-05-04-03"
                          color="#8d0000"
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
                    <v-data-table data-parts-id="exises-05-05-01"
                      :headers="relateNotesTableHeaders"
                      :items="searchForm.relateNotesTableData"
                      item-key="contentsId" dense
                      class="elevation-1 dense-table"
                      :footer-props="{'items-per-page-options': [10, 20, 50, 100]}"
                      :items-per-page.sync="itemsPerPage"
                    >
                      <template v-slot:item.select="{ item }">
                        <v-checkbox data-parts-id="exises-05-05-01-01"
                          v-model="noteRegistUpdateForm.relatesDataObject"
                          :value="item"
                          :disabled="item.common_word==''"
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
                        <v-text-field data-parts-id="exises-05-05-01-03"
                          v-model="item.common_word"
                          maxlength="50"
                          counter="50"
                          label="共通ワード"
                          hide-details class="ma-0 pa-0 py-3"
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
                      <template v-if="noteRegistUpdateForm.relatesDataObject && noteRegistUpdateForm.relatesDataObject.length > 0">
                        <v-list-item color="#efebde" v-for="selected_row in noteRegistUpdateForm.relatesDataObject" :key="selected_row.contentsId">
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
                      <div v-if="noteRegistUpdateForm.relatesDataObject" align="center">
                        <span>※関連ノートは最大で99件まで登録できます。</span>
                      </div>
                    </v-list>
                  </div>
                </v-col>
                <v-col cols="12" sm="3">
                  <v-select
                    v-model="noteRegistUpdateForm.publicity"
                    :items="publicityOptions"
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
                  <v-textarea
                    ref="noteTextarea"
                    v-model="noteRegistUpdateForm.text"
                    label="ノート本文"
                    data-parts-id="exises-05-09"
                    @input="updateByteCount"
                    outlined required
                  ></v-textarea>
                  <p class="valid-errors" v-if="validError.requiredText" @click="validError.requiredText=false">{{ validError.message.required }}</p>
                  <p class="valid-errors" v-if="validError.invalidTextChars" @click="validError.invalidTextChars=false">{{ validError.message.invalidChars }}</p>
                  <div data-parts-id="exises-05-10" align="center">
                    <span :style="{ color: validError.byteCountExceeded ? 'red' : 'inherit' }">現在のバイト数: {{ byteCount }} / 65000 bytes</span>
                    <div v-if="validError.byteCountExceeded" class="valid-errors" style="color: red;">{{ validError.message.byteCountExceeded }}</div>
                  </div>
                </v-col>
                <v-col cols="12">
                  <div v-if="!noteRegistUpdateForm.isTextModifyMode" align="center">
                    <v-btn color="#8d0000" class="white--text" @click="noteRegistUpdateForm.isTextModifyMode = true" data-parts-id="exises-05-11-01">ノート本文を整形</v-btn>
                  </div>
                  <div v-else>
                    <text-formatter
                      :initial-text="noteRegistUpdateForm.text"
                      :dialog="dialog"
                      @formatted="handleFormattedText"
                      @cancelled="handleFormattingCancelled"
                      @formatting-complete="handleFormattingComplete"
                    ></text-formatter>
                  </div>
                </v-col>
                <v-col cols="12" align="center">
                  <v-btn color="#8d0000" class="white--text" @click="copyNoteText" data-parts-id="exises-05-12">ノート本文をコピー</v-btn>
                  <p class="copy-success" v-if="showCopySuccess" @click="showCopySuccess=false">ノート本文をコピーしました</p>
                </v-col>
                <v-col cols="12">
                  <batch-character-replacer
                    :dialog="dialog"
                    :initial-text="noteRegistUpdateForm.text"
                    @replaced="handleBatchReplaced"
                  ></batch-character-replacer>
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="noteRegistUpdateForm.relateVideoUrlInput"
                    label="関連動画URL (1行に1つ、最大5件)"
                    data-parts-id="exises-05-14"
                    @input="updateRelateVideoUrlList"
                    outlined
                    rows="3"
                  ></v-textarea>
                  <p class="valid-errors" v-if="validError.invalidVideoUrlFormat" @click="validError.invalidVideoUrlFormat=false">{{ validError.message.invalidVideoUrlFormat }}</p>
                  <p class="valid-errors" v-if="validError.tooManyVideoUrls" @click="validError.tooManyVideoUrls=false">{{ validError.message.tooManyVideoUrls }}</p>
                </v-col>
                <v-col cols="12" align="center">
                  <v-row justify="center" align="center">
                    <v-col cols="12" sm="auto" class="pa-1 text-center">
                      <v-btn v-if="noteRegistUpdateForm.isUpdateMode == 0"
                        @click="submitForm"
                        color="#8d0000" class="white--text"
                        :disabled="!isSubmitEnabled"
                        data-parts-id="exises-05-15-01"
                      >これで登録する</v-btn>
                      <v-btn v-else
                        @click="submitForm"
                        color="#8d0000" class="white--text"
                        :disabled="!isSubmitEnabled"
                        data-parts-id="exises-05-15-02"
                      >これで更新する</v-btn>
                    </v-col>
                    <v-col cols="12" sm="auto" class="pa-1 text-center">
                      <v-btn class="white-button ml-1" @click="resetForm" data-parts-id="exises-05-16">リセット</v-btn>
                    </v-col>
                    <v-col cols="12" sm="auto" class="pa-1 text-center">
                      <v-btn color="#8d0000" class="white--text ml-1" @click="downloadNote" data-parts-id="exises-05-17">ノートをダウンロード</v-btn>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
        </v-form>

        <!-- 登録・更新確認ダイアログ -->
        <v-dialog v-model="dialog.isNoteRegistUpdateConfirmOpen" persistent max-width="500">
          <v-card>
            <v-card-title class="headline">{{ registUpdateConfirmDialog.title }}</v-card-title>
            <v-card-text>{{ registUpdateConfirmDialog.message }}</v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="green darken-1" text @click="dialog.isNoteRegistUpdateConfirmOpen=false; submitConfirmed()">はい</v-btn>
              <v-btn color="red darken-1" text @click="dialog.isNoteRegistUpdateConfirmOpen=false">いいえ</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- 登録・更新完了ダイアログ -->
        <v-dialog v-model="dialog.isNoteRegistUpdateCompleteOpen" persistent max-width="500">
          <v-card>
            <v-card-title class="headline">{{ registUpdateCompleteDialog.title }}</v-card-title>
            <v-card-text>{{ registUpdateCompleteDialog.message }}</v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="red darken-1" text @click="dialog.isNoteRegistUpdateCompleteOpen=false">閉じる</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-card>

      <!-- 削除確認ダイアログ -->
      <v-dialog v-model="dialog.isNoteDeleteConfirmOpen" persistent max-width="500">
        <v-card>
          <v-card-title class="headline">削除確認</v-card-title>
          <v-card-text>ホントに消しますよ？後悔しませんね！？</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green darken-1" text @click="dialog.isNoteDeleteConfirmOpen=false;submitDelete()">いいから消せ</v-btn>
            <v-btn color="red darken-1" text @click="cancelDeleteConfirmation()">やっぱやめとく</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- 削除完了ダイアログ -->
      <v-dialog v-model="dialog.isNoteDeleteCompleteOpen" persistent max-width="500">
        <v-card>
          <v-card-title class="headline">{{ deleteCompleteDialog.title }}</v-card-title>
          <v-card-text>{{ deleteCompleteDialog.message }}</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red darken-1" text @click="dialog.isNoteDeleteCompleteOpen=false">閉じる</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  `,
  props: {
    dialog: Object,
    flag: Object,
    searchForm: Object,
    loginUser: Object,
    functions: Object,
    path: Object,
  },
  components: {
    usersNoteArea,
    TextFormatter,
    BatchCharacterReplacer,
  },
  created() {
    this.searchForm.relateNotesTableData = [];
    this.noteRegistUpdateForm.createdUserId = this.loginUser?.ownerId || null; // createdUserId を初期化
  },
  data() {
    return {
      isFormVisible: false,
      isSearchedRelates: false,
      noteRegistUpdateForm: {
        contentsId: null,
        isUpdateMode: 0,
        title: '',
        url: '',
        urlSub: '',
        publicity: 0,
        text: '',
        relatesDataObject: [],
        relateVideoUrlInput: '',
        relateVideoUrlList: [],
        createdUserId: null,
        isTextModifyMode: false
      },
      selectedDeleteContentsId: null,
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
      tableData: [],
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
        message: {
          required: '入力必須項目です。',
          requiredSelect: '選択必須項目です。',
          invalidChars: '有効な文字（英数字、日本語など）を入力してください。',
          invalidUrlFormat: '有効なURL形式ではありません。',
          subUrlNeedsMainUrl: 'メインURLを先に入力してください。',
          invalidVideoUrlFormat: 'YouTube動画URLの形式ではない行があります。',
          tooManyVideoUrls: '関連動画URLは5件までです。',
          byteCountExceeded: `ノート本文の総バイト数が65000を超えています。`,
        }
      },
      validationRules: {
        // 半角英数字、全角英数字、日本語（ひらがな、カタカナ、漢字）、一部記号を許可
        textContentRegex: /[a-zA-Z0-9ａ-ｚＡ-Ｚ０-９\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF々\s!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~、。〃々〆〇〈〉《》「」『』【】〒〓〔〕〖〗〘〙〚〛〜〝〞〟〠〡〢〣〤〥〦〧〨〩〪〭〮〯〫〬〰〱〲〳〴〵〶〷〸〹〺〻〼〽〾〿]+/,
        // YouTube URL の簡易チェック (watch または short URL)
        youtubeRegex: /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
        // 一般的なURL形式チェック (より厳密なものが必要な場合は調整)
        urlRegex: /^(https?:\/\/)?([a-zA-Z0-9\-\.]+)\.([a-zA-Z]{2,})(\/[^\s]*)?$/,
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
      showCopySuccess: false,
      defaultUpdateForm: null, // 更新モード時の初期データ保持用
      itemsPerPage: 10,
    };
  },
  computed: {
    checkSubUrlDependency() {
      return !this.noteRegistUpdateForm.url || !this.isValidUrlFormatInternal(this.noteRegistUpdateForm.url);
    },
    formTitle() {
      return this.noteRegistUpdateForm.isUpdateMode === 1 ? "ノート情報更新" : "ノート新規登録";
    },
    isRelateSearchable() {
      return this.searchForm.relateNoteIncludeWord != '' && this.searchForm.selectedDB.length > 0
    },
    isSubmitEnabled() { // 登録/更新ボタンの活性状態を決定する
      if (this.validError.byteCountExceeded) return false; // バイト数超過の場合は常に非活性
      return !!this.noteRegistUpdateForm.title && !!this.noteRegistUpdateForm.text;
    },
    isCommonWordInputDisabled() {
      return (item) => {
        return (
          this.noteRegistUpdateForm.relatesDataObject && 
          this.noteRegistUpdateForm.relatesDataObject.some(selected => selected.contentsId === item.contentsId)
        );
      };
    }
  },
  watch: {
    'noteRegistUpdateForm.relatesDataObject': {
      handler(newVal, oldVal) {
        if (newVal.length > 99) { // 99件を超えたら古い値に戻し、アラートを表示
          this.$nextTick(() => { // DOM更新後に実行
            this.noteRegistUpdateForm.relatesDataObject = oldVal;
            alert("関連ノートは最大登録件数は99件です。");
          });
        }
        this.$forceUpdate(); // 選択状態が変わったら、テーブル側の共通ワード入力欄のdisabled状態を更新するために再描画を強制
      },
      deep: true
    },
    // バイト数超過時にボタンの状態を更新するための監視
    'validError.byteCountExceeded': function(newVal) {
      this.$forceUpdate();
    },
    // 必須項目が変わったときにボタンの状態を更新するための監視
    'noteRegistUpdateForm.title': function() {
      this.$forceUpdate();
    },
    'noteRegistUpdateForm.text': function() {
      this.$forceUpdate();
    }
  },
  methods: {
    /**
     * 文字列が必要な文字（半角英数字、全角英数字、日本語など）を含むか判定
     * @param {string} str - 対象文字列
     * @returns {boolean} 有効な場合は true
     */
    isValidTextContent(str) {
      if (!str) return false; // 空文字列は無効
      return this.validationRules.textContentRegex.test(str);
    },
    /**
     * YouTube動画URLの形式か判定する（簡易版）
     * @param {string} url - 対象URL文字列
     * @returns {boolean} YouTube URL形式の場合は true
     */
    isValidYouTubeUrl(url) {
      if (!url) return false; // 空文字列は無効
      return this.validationRules.youtubeRegex.test(url);
    },
    /**
     * 一般的なURL形式か判定する
     * @param {string} url - 対象URL文字列
     * @returns {boolean} URL形式の場合は true
     */
    isValidUrlFormatInternal(url) {
      if (!url) return true; // 空は許可 (バリデーションはdoValidationで行う)
      return this.validationRules.urlRegex.test(url);
    },
    createTableData() {
      const noteCsvFiles = this.searchForm.csvList.filter(csv => csv.includes('ulinker_notes'));
      this.tableData = noteCsvFiles.map(csv => {
        return { filename: csv }
      })
      this.tableData.push({ filename: 'ulinker_notes' });
    },
    async searchRelatedNotes() { // 関連ノートを検索してテーブルに表示する
      if (!this.searchForm.relateNoteIncludeWord || this.searchForm.relateNoteIncludeWord.trim() === '') {
        this.searchForm.relateNotesTableData = []; // 検索ワードが空の場合はテーブルをクリアする（既存の選択は維持）
        return;
      }

      const keywordToSend = this.searchForm.relateNoteIncludeWord.split(' ')[0]; // 半角スペースで区切り、最初の単語を取得
      const data = {
        type: 'getRelateNoteList',
        keyword: keywordToSend,
        list: JSON.stringify(this.searchForm.selectedDB),
        owner_id: this.loginUser.ownerId,
        token: this.functions.generateRandomAlphanumericString(16),
      };

      // 不要なプロパティ (undefined) を削除
      Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);
      let param = this.functions.convertObjectToURLSearchParams(data);

      try {
        const response = await axios.post(this.path.getSearchedDataList, param);
        if (response.data && response.data.type === "success") { // 検索結果テーブル用のデータを作成
          const apiResults = response.data.list || []; // APIからの結果リスト
          const existingSelection = this.noteRegistUpdateForm.relatesDataObject || []; // 現在選択されているノート

          const map = new Map();// Mapを使って重複を除去しつつ、既存の選択状態を維持する

          // 現在選択されているノートをMapに追加 (common_word を維持するため)
          existingSelection.forEach(note => {
            map.set(note.contentsId, { ...note }); // スプレッド構文でコピー
          });

          // APIからの結果を追加。ただし、既にMapに存在するものは上書きしない
          apiResults.forEach(note => {
            if (!map.has(note.contentsId)) {
              const unescapedTitle = this.functions.unescapeText(note.title); // title を unescape してから Map に追加
              map.set(note.contentsId, { ...note, title: unescapedTitle });
            }
          });

          this.searchForm.relateNotesTableData = Array.from(map.values()); // Map の値から配列を生成し、relateNotesTableData に設定
        } else { // APIからエラーが返却された場合
          const errorMessage = response.data?.message || '関連ノートの検索に失敗しました。';
          console.error("API Error:", errorMessage, response.data);
        }
        this.isSearchedRelates = true;
      } catch (error) { // 通信エラーなどの場合
        let errorMessage = "関連ノート検索中にエラーが発生しました。";
        if (error.response) {
          console.error("Error Response:", error.response);
          errorMessage = error.response.data?.message || `通信エラーが発生しました。(Status: ${error.response.status})`;
        } else if (error.request) {
          console.error("Error Request:", error.request);
          errorMessage = "サーバーに接続できませんでした。";
        } else {
          console.error("Error:", error.message);
          errorMessage = "リクエストの設定中にエラーが発生しました。";
        }
        console.error("Search Related Notes Error:", errorMessage);
      }
    },
    researchOtherRelatedNotes() { 
      this.isSearchedRelates = false; // 「関連ノート検索」ボタンを表示し、自身を非表示にする
      this.searchForm.relateNoteIncludeWord = ''; // 検索ワードをクリア
      this.searchForm.selectedDB = []; // 選択DBをクリア
      this.searchForm.relateNotesTableData = []; // 関連ノートテーブルのデータをクリア
    },
    removeRelatedNote(selected_row) {
      this.noteRegistUpdateForm.relatesDataObject = this.noteRegistUpdateForm.relatesDataObject.filter(
        item => item.contentsId !== selected_row.contentsId
      );
      this.$forceUpdate(); // 削除後、テーブル側の共通ワード入力欄を活性化させるために再描画を強制
    },
    updateByteCount(text = this.noteRegistUpdateForm.text) {
      const byteLength = new Blob([text]).size;
      this.byteCount = byteLength;
      this.validError.byteCountExceeded = byteLength > 65000;
    },
    /**
     * テキストエリアの選択範囲を取得またはテキスト全体を取得
     * @returns {{start: number, end: number, text: string}} 選択範囲の情報
     */
    getTextSelection() {
      const textarea = this.$refs.noteTextarea?.$refs?.input; // Vuetifyのv-textarea内部のinput要素
      if (!textarea) return { start: 0, end: this.noteRegistUpdateForm.text.length, text: this.noteRegistUpdateForm.text };
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = this.noteRegistUpdateForm.text.substring(start, end);
      this.lastSelection = { start, end }; // 選択範囲を記憶しておく (updateTextareaContentで使う)
      return { start, end, text: selectedText };
    },
    /**
     * テキストエリアの内容を更新し、選択範囲を復元（または指定）する
     * @param {string} newText - 更新後のテキスト全体
     * @param {number} [newStart] - 更新後の選択開始位置 (省略時は元の終了位置)
     * @param {number} [newEnd] - 更新後の選択終了位置 (省略時は newStart と同じ)
     */
    updateTextareaContent(newText, newStart, newEnd) {
      this.noteRegistUpdateForm.text = newText;
      this.updateByteCount(newText); // バイト数を更新

      this.$nextTick(() => { // DOMの更新を待ってから選択範囲を設定
        const textarea = this.$refs.noteTextarea?.$refs?.input;
        if (textarea) {
          const finalStart = newStart !== undefined ? newStart : (this.lastSelection ? this.lastSelection.end : 0);
          const finalEnd = newEnd !== undefined ? newEnd : finalStart;
          textarea.focus(); // フォーカスを当てないと選択範囲が設定されない場合がある
          textarea.setSelectionRange(finalStart, finalEnd);
          this.lastSelection = { start: finalStart, end: finalEnd }; // 選択範囲を記憶
        }
      });
    },
    transformToBlank() { // 選択範囲のテキストを「＿」（全角アンダースコア）に置換する（虫食い化）
      const selection = this.getTextSelection();
      if (!selection.text) return; // 選択範囲がなければ何もしない

      const blankText = '＿'.repeat(selection.text.length);
      const newText = this.noteRegistUpdateForm.text.substring(0, selection.start) + blankText + this.noteRegistUpdateForm.text.substring(selection.end);
      this.updateTextareaContent(newText, selection.start, selection.start + blankText.length);
    },
    convertToHalfWidth() { // 選択範囲の全角英数字記号を半角に変換する
      const selection = this.getTextSelection();
      if (!selection.text) return;

      // 全角英数字・記号（Unicode FF01-FF5Eの範囲）を半角に変換（全角スペースは変換対象外とする）
      const halfWidthText = selection.text.replace(/[\uFF01-\uFF5E]/g, function(s) {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0); // 文字コードを0xFEE0（= 65248）引くことで対応する半角文字に変換
      });

      const newText = this.noteRegistUpdateForm.text.substring(0, selection.start) + halfWidthText + this.noteRegistUpdateForm.text.substring(selection.end);
      this.updateTextareaContent(newText, selection.start, selection.start + halfWidthText.length);
    },
    surroundWithBrackets() { // 選択範囲のテキストを「【】」で囲む
      const selection = this.getTextSelection();
      if (!selection.text) return;

      const surroundedText = `【${selection.text}】`;
      const newText = this.noteRegistUpdateForm.text.substring(0, selection.start) + surroundedText + this.noteRegistUpdateForm.text.substring(selection.end);
      this.updateTextareaContent(newText, selection.start, selection.start + surroundedText.length); // 囲んだ後のテキストを選択状態にする
    },
    surroundWithStars() { // 選択範囲のテキストを「☆」で囲む
      const selection = this.getTextSelection();
      if (!selection.text) return;

      const surroundedText = `☆${selection.text}☆`;
      const newText = this.noteRegistUpdateForm.text.substring(0, selection.start) + surroundedText + this.noteRegistUpdateForm.text.substring(selection.end);
      this.updateTextareaContent(newText, selection.start, selection.start + surroundedText.length); // 囲んだ後のテキストを選択状態にする
    },
    /**
     * TextFormatter コンポーネントから整形済みテキストを受け取る
     * @param {string} formattedText - 整形後のテキスト
     */
    handleFormattedText(formattedText) {
      this.noteRegistUpdateForm.text = formattedText;
      this.updateByteCount(formattedText);
    },
    handleFormattingComplete() { // TextFormatter コンポーネントの整形処理完了イベントハンドラ
      this.noteRegistUpdateForm.isTextModifyMode = false;
    },
    handleFormattingCancelled() { // TextFormatter コンポーネントのキャンセルイベントハンドラ
      this.noteRegistUpdateForm.isTextModifyMode = false;
    },
    async copyNoteText() { // ノート本文をクリップボードにコピーする
      try {
        await navigator.clipboard.writeText(this.noteRegistUpdateForm.text);
        this.showCopySuccess = true;
        setTimeout(e => this.showCopySuccess = false, 3000); // 3秒後にメッセージを消す
      } catch (err) {
        console.error('ノート本文のコピーに失敗しました:', err);
        alert('クリップボードへのコピーに失敗しました。');
      }
    },
    /**
     * BatchCharacterReplacer コンポーネントから一括置換後のテキストを受け取る
     * @param {string} replacedText - 置換後のテキスト
     */
    handleBatchReplaced(replacedText) {
      this.noteRegistUpdateForm.text = replacedText;
      this.updateByteCount(replacedText);
    },
    updateRelateVideoUrlList(){ // 入力があるたびにバリデーション済みリストを更新
      this.noteRegistUpdateForm.relateVideoUrlList = this.noteRegistUpdateForm.relateVideoUrlInput.split('\n').map(url => url.trim()).filter(url => url !== ''); // 空行を除去
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
    },
    /**
     * フォーム全体のバリデーションを実行する
     * @returns {boolean} バリデーションが通れば true
     */
    doValidation() {
      this.resetValidationErrors();
      let isValid = true;

      // 1. ノートタイトル
      if (!this.noteRegistUpdateForm.title) {
        this.validError.requiredTitle = true;
        isValid = false;
      } else if (!this.isValidTextContent(this.noteRegistUpdateForm.title)) { // タイトルが空でなく、かつ有効な文字を含まない場合
        this.validError.invalidTitleChars = true;
        isValid = false;
      }

      // 2. ノート本文
      if (!this.noteRegistUpdateForm.text) {
        this.validError.requiredText = true;
        isValid = false;
      } else if (!this.isValidTextContent(this.noteRegistUpdateForm.text)) { // 本文が空でなく、かつ有効な文字を含まない場合
        this.validError.invalidTextChars = true;
        isValid = false;
      }

      // 3. URL
      if (this.noteRegistUpdateForm.url && !this.isValidUrlFormatInternal(this.noteRegistUpdateForm.url)) {
        this.validError.invalidUrl = true;
        isValid = false;
      }

      // 4. サブURL
      if (this.noteRegistUpdateForm.urlSub) {
        if (!this.noteRegistUpdateForm.url || !this.isValidUrlFormatInternal(this.noteRegistUpdateForm.url)) { // メインURLが空 or 不正な場合もエラー
          this.validError.subUrlNeedsMainUrl = true;
          isValid = false;
        }
        if (!this.isValidUrlFormatInternal(this.noteRegistUpdateForm.urlSub)) {
          this.validError.invalidSubUrl = true;
          isValid = false;
        }
      }

      // 5. 関連動画URL
      const videoUrls = this.noteRegistUpdateForm.relateVideoUrlInput.split('\n').map(url => url.trim()).filter(url => url !== '');
      if (videoUrls.length > 5) {
        this.validError.tooManyVideoUrls = true;
        isValid = false;
      }
      let invalidUrlFound = false;
      this.noteRegistUpdateForm.relateVideoUrlList = []; // バリデーション済みリストを初期化
      videoUrls.forEach(url => {
        if (!this.isValidYouTubeUrl(url)) {
          invalidUrlFound = true;
        } else {
          try {
            const parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`); // URLオブジェクトを作成 (httpがない場合補完)
            let cleanedUrl = '';
            const videoId = parsedUrl.searchParams.get('v'); // URLのクエリ文字列の中から'v'という名前のクエリパラメータを探し、その対応する値を返

            if (parsedUrl.hostname.includes('youtube.com') && videoId) { // youtube.com/watch?v=VIDEO_ID 形式の場合
              cleanedUrl = `https://www.youtube.com/watch?v=${videoId}`;
            } else if (parsedUrl.hostname === 'youtu.be') { // youtu.be/VIDEO_ID 形式の場合
              const pathVideoId = parsedUrl.pathname.substring(1); // 先頭の/を除去
              if (pathVideoId) cleanedUrl = `https://youtu.be/${pathVideoId}`;
            }

            if (cleanedUrl) {
              this.noteRegistUpdateForm.relateVideoUrlList.push(cleanedUrl); // 整形後のURLを追加
            } else {
              invalidUrlFound = true; // 不正な形式として扱う場合
            }
          } catch (e) {
            console.error("Error parsing or cleaning URL:", url, e);
            invalidUrlFound = true; // URL解析エラーも不正な形式として扱う
          }
        }
      });
      if (invalidUrlFound) {
        this.validError.invalidVideoUrlFormat = true;
        isValid = false;
      }
      if (this.noteRegistUpdateForm.relateVideoUrlList.length > 5) { // relateVideoUrlList の件数で再チェック (不正URL除去後の件数)
        this.validError.tooManyVideoUrls = true;
        isValid = false;
      }

      // 6. 公開設定
      if (this.noteRegistUpdateForm.publicity === null || this.noteRegistUpdateForm.publicity === undefined) {
        this.validError.requiredPublicity = true;
        isValid = false;
      }

      // 7. バイト数 (updateByteCount でチェック済み)
      if (this.validError.byteCountExceeded) isValid = false;

      return isValid;
    },
    submitForm() { // 登録/更新ボタンクリック時の処理
      if (this.$refs.form.validate() && this.doValidation()) {
        this.registUpdateConfirmDialog.title = this.noteRegistUpdateForm.isUpdateMode === 1 ? "ノート更新確認" : "ノート登録確認";
        this.registUpdateConfirmDialog.message = this.noteRegistUpdateForm.isUpdateMode === 1 ? "この内容でノートを更新します。よろしいですか？" : "この内容でノートを登録します。よろしいですか？";
        this.dialog.isNoteRegistUpdateConfirmOpen = true;
      }
    },
    async submitConfirmed() { // 確認ダイアログ「はい」クリック時の処理 (API呼び出し)
      const relatesDataString = JSON.stringify(this.noteRegistUpdateForm.relatesDataObject);
      const escapedRelatesData = this.functions.escapeText(relatesDataString);
      const escapedText = this.functions.escapeText(this.noteRegistUpdateForm.text);

      const data = {
        type: this.noteRegistUpdateForm.isUpdateMode === 1 ? "update" : "regist",
        contents_id: this.noteRegistUpdateForm.isUpdateMode === 1 ? this.noteRegistUpdateForm.contentsId : undefined, // 更新時のみ
        title: this.functions.escapeText(this.noteRegistUpdateForm.title),
        url: this.noteRegistUpdateForm.url,
        urlSub: this.noteRegistUpdateForm.urlSub,
        relatesData: escapedRelatesData,
        publicity: this.noteRegistUpdateForm.publicity,
        text: escapedText,
        relateVideoUrlList: this.noteRegistUpdateForm.relateVideoUrlList.join('\n'),
        createdUserId: this.loginUser.ownerId, // ログインユーザーIDを使用
        token: this.functions.generateRandomAlphanumericString(16),
      };

      Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);
      let param = this.functions.convertObjectToURLSearchParams(data);

      axios
        .post(this.path.noteRegistUpdate, param)
        .then((response) => {
          if (response.data && response.data.type === "success") { // axiosの実行で「response.data.type = 'success'」を受け取った場合
            this.registUpdateCompleteDialog.title = this.noteRegistUpdateForm.isUpdateMode === 1 ? "更新完了" : "登録完了";
            // 完了ダイアログには、3秒後にリロードするメッセージを表示する
            this.registUpdateCompleteDialog.message = `${this.noteRegistUpdateForm.isUpdateMode === 1 ? 'ノート情報を更新' : 'ノートを登録'}しました。3秒後にリロードします。`;
            this.dialog.isNoteRegistUpdateCompleteOpen = true;
            this.functions.reloadPageAfterDelay(3); // 3秒後にリロードする
          } else { // axiosの実行で「response.data.type = 'success'」を受け取れなかった場合
            this.registUpdateCompleteDialog.title = "エラー"; // APIからエラーが返却された場合の記述は、変数を現在dataに設定されている該当のダイアログのものに書き換える
            this.registUpdateCompleteDialog.message = response.data?.message || (this.noteRegistUpdateForm.isUpdateMode === 1 ? "申し訳ありません。ノート更新できませんでした。" : "申し訳ありません。ノート登録できませんでした。");
            this.dialog.isNoteRegistUpdateCompleteOpen = true;
          }
        })
        .catch((error) => {
          this.registUpdateCompleteDialog.title = "エラー"; // .catch部のエラーに該当する場合の記述も、変数を現在dataに設定されている該当のダイアログのものに書き換える
          let errorMessage = this.noteRegistUpdateForm.isUpdateMode === 1 ? "ノート更新中にエラーが発生しました。" : "ノート登録中にエラーが発生しました。";
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
          this.registUpdateCompleteDialog.message = errorMessage;
          this.dialog.isNoteRegistUpdateCompleteOpen = true;
        });
    },
    resetForm(){
      this.resetValidationErrors();
      this.byteCount = 0;
      this.validError.byteCountExceeded = false;
      this.searchForm.relateNoteIncludeWord = '';
      this.searchForm.relateNotesTableData = [];
      this.noteRegistUpdateForm.isTextModifyMode = false;
      this.showCopySuccess = false;

      if (this.noteRegistUpdateForm.isUpdateMode === 1 && this.defaultUpdateForm) { // 更新モードの場合
        const originalContentsId = this.noteRegistUpdateForm.contentsId;
        this.noteRegistUpdateForm = JSON.parse(JSON.stringify(this.defaultUpdateForm));
        this.noteRegistUpdateForm.isUpdateMode = 1; // isUpdateModeを確実に1(更新モード)に設定し直す
        this.noteRegistUpdateForm.contentsId = originalContentsId;
        this.noteRegistUpdateForm.text = this.defaultUpdateForm.note || ''; // defaultUpdateForm には 'note' として本文が入っているため、'text' に代入

        const videoUrlsString = this.defaultUpdateForm.relate_video_urls || '';
        this.noteRegistUpdateForm.relateVideoUrlInput = videoUrlsString; // 関連動画URLの復元
        this.updateRelateVideoUrlList();

        // 関連ノートデータの復元
        try { // defaultUpdateForm.relate_notes が文字列化されたJSONか、既に配列かを判定
          const judgeBooleans = (this.defaultUpdateForm.relate_notes && typeof this.defaultUpdateForm.relate_notes === 'string' && this.defaultUpdateForm.relate_notes !== '');
          this.noteRegistUpdateForm.relatesDataObject = judgeBooleans ? JSON.parse(this.defaultUpdateForm.relate_notes) : (Array.isArray(this.defaultUpdateForm.relate_notes) ? this.defaultUpdateForm.relate_notes : []);
        } catch (e) {
          console.error("リセット時の関連ノートデータ処理エラー:", e);
          this.noteRegistUpdateForm.relatesDataObject = []; // エラー時は空にする
        }

        // その他の状態リセット
        this.noteRegistUpdateForm.isTextModifyMode = false;
        this.updateByteCount(this.noteRegistUpdateForm.text); // バイト数を再計算
        if (this.$refs.form) this.$refs.form.resetValidation(); // Vuetifyフォームのバリデーション状態もリセット
      } else { // 新規登録モード、または更新モードで元のデータがない場合は、フォームを完全に初期状態（空）にする
        const initialFormData = {
          contentsId: null,
          isUpdateMode: 0, // モードも新規登録に戻す
          title: '',
          url: '',
          urlSub: '',
          publicity: 0,
          text: '',
          relatesDataObject: [],
          relateVideoUrlInput: '',
          relateVideoUrlList: [],
          createdUserId: this.loginUser?.ownerId || null,
          isTextModifyMode: false
        };
        this.noteRegistUpdateForm = { ...initialFormData };
        this.defaultUpdateForm = null; // defaultUpdateForm もクリア
        this.updateByteCount(''); // バイト数を0にする
        if (this.$refs.form) this.$refs.form.resetValidation();
      }
    },
    formatDateToYmd(dateString) {
      if (!dateString) return '';
      try {
        const date = new Date(dateString);
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      } catch (e) {
        console.error("Date formatting error:", e);
        return dateString; // フォーマット失敗時は元の文字列を返す
      }
    },
    getTimestampForFilename() {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      const h = String(now.getHours()).padStart(2, '0');
      const min = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      return `${y}${m}${d}_${h}${min}${s}`;
    },
    getPublicityLabelForDownload(publicityValue) {
      const option = this.publicityOptions.find(opt => opt.value === publicityValue);
      return option ? option.text : '不明';
    },
    downloadNote(){
      const timestamp = new Date();
      const formattedTimestamp = this.functions.formatDateTime(timestamp);
      const title = this.noteRegistUpdateForm.title || 'note';
      const safeTitle = title.replace(/[/\\?%*:|"<>]/g, '-');
      const fileName = `${safeTitle}_${this.getTimestampForFilename()}.txt`;

      let content = `タイトル： ${title}\n\n`;
      content += `作成者： ${this.loginUser.userName || '不明'}\n`;
      const createdDate = this.noteRegistUpdateForm.created ? this.formatDateToYmd(this.noteRegistUpdateForm.created) : this.formatDateToYmd(formattedTimestamp);
      const lastUpdatedDate = this.noteRegistUpdateForm.lastUpdated ? this.formatDateToYmd(this.noteRegistUpdateForm.lastUpdated) : this.formatDateToYmd(formattedTimestamp);
      content += `登録日： ${createdDate}\n`;
      content += `最終更新日： ${lastUpdatedDate}\n\n`;
      content += `--- ノート本文 ---\n\n${this.noteRegistUpdateForm.text}\n\n`;
      content += `取得元サイト： ${this.noteRegistUpdateForm.url || '設定なし'}\n`;
      if (this.noteRegistUpdateForm.urlSub) content += `サブリンクURL： ${this.noteRegistUpdateForm.urlSub}\n`;

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(link.href);
    },
    handleShowForm(payload) {
      this.isFormVisible = false; // フォームを一旦非表示にする

      // DOMの更新を待ってから再表示と初期化を行う
      this.$nextTick(() => {
        this.searchForm.selectedDB = []; // 関連ノート格納先テーブルの選択状態を初期化
        this.isSearchedRelates = false; // 関連ノート検索状態フラグをリセット

        this.noteRegistUpdateForm.isUpdateMode = payload.mode === 'update' ? 1 : 0;
        this.resetValidationErrors();
        this.isFormVisible = true; // フォームを再表示

        // モードに応じてフォームデータを設定
        if (payload.mode === 'update' && payload.noteData) {
          // 更新モードの処理
          this.defaultUpdateForm = JSON.parse(JSON.stringify(payload.noteData)); // 更新前のデータをディープコピーして保持 (リセット用)

          // payload.noteData の値を noteRegistUpdateForm に反映
          this.noteRegistUpdateForm.contentsId = payload.noteData.contents_id || null;
          this.noteRegistUpdateForm.title = payload.noteData.title || "";
          this.noteRegistUpdateForm.url = payload.noteData.url || "";
          this.noteRegistUpdateForm.urlSub = payload.noteData.url_sub || "";
          this.noteRegistUpdateForm.publicity = typeof payload.noteData.publicity === 'number' ? payload.noteData.publicity : 0;
          this.noteRegistUpdateForm.text = payload.noteData.note || "";
          this.noteRegistUpdateForm.created = payload.noteData.created_at || null;
          this.noteRegistUpdateForm.lastUpdated = payload.noteData.updated_at || null;

          // 関連ノートデータ (relatesDataObject) の処理
          try { // APIからのデータが文字列化されたJSONか、既に配列かを判定して処理
            const judgeBooleans = (payload.noteData.relate_notes && typeof payload.noteData.relate_notes === 'string' && payload.noteData.relate_notes !== '');
            this.noteRegistUpdateForm.relatesDataObject = judgeBooleans ? JSON.parse(payload.noteData.relate_notes) : (Array.isArray(payload.noteData.relate_notes) ? payload.noteData.relate_notes : []);
          } catch (e) {
            console.error("関連ノートデータの処理中にエラーが発生しました:", e);
            this.noteRegistUpdateForm.relatesDataObject = []; // エラー時は空にする
          }

          const videoUrlsString = payload.noteData.relate_video_urls || '';
          this.noteRegistUpdateForm.relateVideoUrlInput = videoUrlsString; // 関連動画URL (relateVideoUrlInput, relateVideoUrlList) の処理
          this.updateRelateVideoUrlList(); // 入力値からリストを更新するメソッドを呼び出す
          this.noteRegistUpdateForm.isTextModifyMode = false; // テキスト整形モードは解除
          this.updateByteCount(this.noteRegistUpdateForm.text); // バイト数を更新
          this.searchForm.relateNoteIncludeWord = ''; // 関連ノート検索関連をリセット
          this.searchForm.relateNotesTableData = [];
          this.showCopySuccess = false; // コピー成功メッセージを非表示にする

        } else { // 新規登録モードの場合
          this.defaultUpdateForm = null; // 新規モードではリセット用データは不要
          this.noteRegistUpdateForm.contentsId = null;
          this.noteRegistUpdateForm.title = '';
          this.noteRegistUpdateForm.url = '';
          this.noteRegistUpdateForm.urlSub = '';
          this.noteRegistUpdateForm.publicity = 0;
          this.noteRegistUpdateForm.text = '';
          this.noteRegistUpdateForm.relatesDataObject = [];
          this.noteRegistUpdateForm.relateVideoUrlInput = '';
          this.noteRegistUpdateForm.relateVideoUrlList = [];
          this.noteRegistUpdateForm.createdUserId = this.loginUser?.ownerId || null;
          this.noteRegistUpdateForm.created = null;
          this.noteRegistUpdateForm.lastUpdated = null;
          this.noteRegistUpdateForm.isTextModifyMode = false;
          this.byteCount = 0;
          this.validError.byteCountExceeded = false;
          this.searchForm.relateNoteIncludeWord = '';
          this.searchForm.relateNotesTableData = [];
          this.showCopySuccess = false;
        }
      });
    },
    handleDeleteConfirmation(payload) {
      this.selectedDeleteContentsId = payload.noteData.contents_id;
      this.dialog.isNoteDeleteConfirmOpen = true;
    },
    cancelDeleteConfirmation() {
      this.selectedDeleteContentsId = null;
      this.dialog.isNoteDeleteConfirmOpen = false;
    },
    async submitDelete() { // 確認ダイアログ「いいから消せ」クリック時の処理 (API呼び出し)
      const data = {
        type: "delete",
        contents_id: this.selectedDeleteContentsId,
        createdUserId: this.loginUser.ownerId, // ログインユーザーIDを使用
        token: this.functions.generateRandomAlphanumericString(16),
      };

      Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);
      let param = this.functions.convertObjectToURLSearchParams(data);

      axios
        .post(this.path.noteRegistUpdate, param)
        .then((response) => {
          if (response.data && response.data.type === "success") { // axiosの実行で「response.data.type = 'success'」を受け取った場合
            this.deleteCompleteDialog.title = "削除完了";
            this.deleteCompleteDialog.message = '削除しました。3秒後にリロードします。';
            this.dialog.isNoteDeleteCompleteOpen = true;
            this.functions.reloadPageAfterDelay(3); // 3秒後にリロードする
          } else { // axiosの実行で「response.data.type = 'success'」を受け取れなかった場合
            this.deleteCompleteDialog.title = "エラー";
            this.deleteCompleteDialog.message = response.data?.message || "申し訳ありません。ノート削除できませんでした。";
            this.dialog.isNoteDeleteCompleteOpen = true;
          }
        })
        .catch((error) => {
          this.deleteCompleteDialog.title = "エラー";
          let errorMessage = "ノート削除中にエラーが発生しました。";
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
          this.dialog.isNoteDeleteCompleteOpen = true;
        });
    },
  },
  mounted() {
    this.updateByteCount();
    this.noteRegistUpdateForm.createdUserId = this.loginUser?.ownerId || null;
    this.createTableData();
  }
});

export default noteRegistUpdateForm;
