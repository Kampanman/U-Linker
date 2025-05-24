// searchedHitNoteArea.js
import selectedNote from './selectedNote.js';

let searchedHitNoteArea = Vue.component("searched-hit-note-area", {
  template: `
    <div class="searched-hit-note-area my-5" data-parts-id="common-04-01">
      <v-card class="pa-4 rounded-card" color="#efebde" width="93%" outlined>
        <v-card class="pa-4 rounded-card" color="#B3E5FC" outlined>
          <v-card-title>
            <span class="area-title">該当ノート一覧</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-data-table
                    :headers="headers"
                    :items="noteList"
                    item-key="contents_id"
                    class="elevation-1 dense-table"
                    dense
                  >
                    <template v-slot:item.publicity="{ item }">
                      <v-chip dark small
                        :color="getPublicityColor(item.publicity)"
                        data-parts-id="common-04-01-01"
                        v-text="getPublicityLabel(item.publicity)"
                      ></v-chip>
                    </template>
                    <template v-slot:item.title="{ item }">
                      <div data-parts-id="common-04-01-02">
                        <a v-if="item.url"
                          :href="item.url"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="blue--text"
                          v-text="item.title"
                        ></a>
                        <span v-else v-text="item.title"></span>
                        <span v-if="item.from.endsWith('.csv')" class="ml-2">({{ item.from }})</span>
                      </div>
                    </template>
                    <template v-slot:item.url_sub="{ item }">
                      <span data-parts-id="common-04-01-exises-01" v-text="getUrlSubLabel(item)"></span>
                    </template>
                    <template v-slot:item.created="{ item }">
                      <span data-parts-id="common-04-01-03" v-text="functions.formatDateTime(item.created)"></span>
                    </template>
                    <template v-slot:item.actions="{ item }">
                      <v-btn small
                        color="#8d0000"
                        class="white--text my-1"
                        data-parts-id="common-04-01-04"
                        @click="showNoteContent(item)"
                      >表示</v-btn>
                    </template>
                  </v-data-table>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
        </v-card>
        <div v-if="openNoteArea" class="mt-4">
          <v-card-title>
            <span class="area-title">選択中のノート</span>
          </v-card-title>
          <selected-note class="fader"
            :flag="flag"
            :functions="functions"
            :login-user="loginUser"
            :path="path"
            :search-result="searchResult"
            :selected-note="selectedNote"
            :openNoteArea="openNoteArea"
            :search-keyword="searchForm.keyword"
            :search-and-or="searchForm.andOr"
          ></selected-note>
        </div>
      </v-card>
    </div>
  `,
  props: {
    flag: Object,
    functions: Object,
    loginUser: Object,
    path: Object,
    searchResult: Array,
    selectedNote: Object,
    searchForm: Object,
  },
  components: {
    selectedNote,
  },
  data() {
    return {
      headers: [
        {
          text: "公開範囲", // ヘッダーのテキスト
          align: "start", // テキストの配置
          sortable: false, // ソート不可
          value: "publicity", // 対応するデータのプロパティ名
        },
        { text: "ノートタイトル", value: "title", sortable: true },
        { text: "サブリンク", value: "url_sub", sortable: false },
        { text: "登録日時", value: "created_at", sortable: false },
        { text: "操作", value: "actions", sortable: false },
      ],
      noteList: [],
      openNoteArea: false,
    };
  },
  watch: {
    // searchResult プロパティの変更を監視
    searchResult: {
      handler(newVal) {
        this.updateNoteList(newVal); // searchResult が変更されたら noteList を更新する
      },
      deep: true, // 配列内のオブジェクトの変更も検知する
      immediate: true // コンポーネント初期化時にも handler を実行する
    },
    // selectedNote プロパティの変更を監視
    selectedNote: {
      handler(newVal) {
        this.updateFormView(newVal); // selectedNote が変更されたら、フォームの表示を更新する
      },
      deep: true, // 配列内のオブジェクトの変更も検知する
      immediate: true // コンポーネント初期化時にも handler を実行する
    },
  },
  methods: {
    // noteList を更新するメソッド
    updateNoteList(result) {
      this.noteList = result.map((row) => {
        return {
          ...row,
          title: this.functions.unescapeText(row.title),
          created: row.created_at, // created_at を created にマッピング
        }
      });
      this.openNoteArea = false; // 選択中のノートの表示は一旦falseにする
    },
    // フォームの表示を更新するメソッド
    updateFormView(result) {
      // 
    },
    // 公開範囲のラベルを取得するメソッド
    getPublicityLabel(publicity) {
      switch (publicity) {
        case 0:
          return "非公開";
        case 1:
          return "公開";
        case 2:
          return "講師にのみ公開";
        default:
          return "不明";
      }
    },
    // 公開範囲に応じたVuetifyチップの色を返す
    getPublicityColor(publicityValue) {
      switch (publicityValue) {
        case 0: return 'grey darken-1'; // 非公開
        case 1: return 'green';       // 公開
        case 2: return 'blue';        // 講師にのみ公開
        default: return 'grey';       // 不明
      }
    },
    // サブリンクのラベルを取得するメソッド
    getUrlSubLabel(item) {
      if (this.loginUser.ownerId !== item.created_user_id) { // ログインユーザーの登録ノートであるかどうかで表示を変更する
        return "-"; // ログインユーザーの登録ノートではない場合は "-" を返す
      } else {
        return item.url_sub ? "あり" : "なし"; // ログインユーザーの登録ノートである場合は url_sub の有無で "あり" または "なし" を返す
      }
    },
    // 「表示」ボタンがクリックされたときの処理を行うメソッド
    showNoteContent(item) {
      this.getRecord(item);
      this.openNoteArea = true;
    },
    async getRecord(item) {
      try {
        const data = {
          type: "getNoteRecord",
          from: item.from,
          contents_id: item.contents_id,
          owner_id: this.loginUser.ownerId,
          token: this.functions.generateRandomAlphanumericString(16),
        }
        
        Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);
        let param = this.functions.convertObjectToURLSearchParams(data);

        const response = await axios.post(this.path.getSelectedData, param);
        if (response.data && response.data.type === "success") {
          const payload = response.data.note;
          const unescapedNote = this.functions.unescapeText(payload.note);
          const noteArray = (item.from.includes('.csv')) ? unescapedNote.split('\\n') : unescapedNote.split('\n');
          const textParamList = noteArray.map((row, i) => {
            return { index: i, class: "", text: row }
          });

          let resNote = {
            contentsId: payload.contents_id,
            title: this.functions.unescapeText(payload.title),
            url: payload.url,
            csvFileName: (item.from.includes('.csv')) ? item.from : null,
            urlSub: payload.url_sub,
            createdUserId: payload.created_user_id,
            createdUserName: payload.created_by,
            created: payload.created_at,
            lastUpdated: payload.updated_at,
            textViewMode: 0,
            text: unescapedNote,
            textList: textParamList,
            relateNotesAndWords: payload.relate_notes,
            rebuildText: "",
            selectedTextRows: "",
            relateVideosArray: (payload.relate_video_urls!=null) ? payload.relate_video_urls.split('\n') : null,
          }
          this.$emit('get-selected-note', resNote); // 呼び出し元に取得結果を返却する
        } else {
          console.error("検索結果の取得に失敗しました:", response.data?.message); // エラーメッセージを修正
          this.$emit('fetch-error', response.data?.message || '検索結果の取得に失敗しました。'); // エラーメッセージを修正
        }
      } catch (error) {
        console.error("検索結果取得中にエラーが発生しました:", error); // エラーメッセージを修正
        this.$emit('fetch-error', '検索結果取得中にエラーが発生しました。'); // エラーメッセージを修正
      }
    }
  },
});

export default searchedHitNoteArea;
