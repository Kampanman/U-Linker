// usersNoteArea.js

let usersNoteArea = Vue.component("users-note-area", {
  template: `
    <div class="users-video-area container mt-4">
      <div class="mb-3 text-end">
        <v-btn
          data-parts-id="exises-04-01"
          @click="onClickNew"
          color="#8d0000"
          class="white--text"
        >
          <v-icon left>mdi-plus</v-icon> 新規作成
        </v-btn>
      </div>
      <v-card outlined>
        <v-card-title>
          ノート一覧
          <v-spacer></v-spacer>
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="タイトル検索"
            single-line hide-details dense class="search-field"
          ></v-text-field>
        </v-card-title>
        <v-data-table
          :headers="headers"
          :items="usersNotesList"
          item-key="contents_id"
          data-parts-id="exises-04-02"
          class="elevation-1 dense-table"
          dense
          :items-per-page="10"
          :footer-props="{ 'items-per-page-options': [10, 20, 50, 100] }"
          :search="search"
          :loading="isLoading"
          loading-text="データをロードしています..."
          no-data-text="登録されているノートはありません。"
        >
          <template v-slot:item.title="{ item }">
            <span :data-parts-id="'exises-04-02-01'" v-if="item.url==''">{{ item.title }}</span>
            <span :data-parts-id="'exises-04-02-01'" v-else>
              <a target="_blank" :href="item.url" :data-contents-id="item.contents_id">{{ item.title }}</a>
            </span>
          </template>
          <template v-slot:item.created_at="{ item }">
            <span :data-parts-id="'exises-04-02-02'">{{ item.created_at }}</span>
          </template>
          <template v-slot:item.updated_at="{ item }">
            <span :data-parts-id="'exises-04-02-03'">{{ item.updated_at }}</span>
          </template>
          <template v-slot:item.publicityText="{ item }">
            <v-chip dark small
              :color="getPublicityColor(item.publicity)"
              :data-parts-id="'exises-04-02-04'"
              v-text="item.publicityText"
            ></v-chip>
          </template>
          <template v-slot:item.actions="{ item }">
            <div data-parts-id="exises-04-02-05" class="text-center">
              <v-btn
                icon small color="primary" class="mr-1"
                @click="onClickEdit(item.contents_id)"
                :data-contents-id="item.contents_id"
                title="編集"
              >
                <v-icon small>mdi-pencil</v-icon>
              </v-btn>
              <v-btn
                icon small color="error"
                @click="onClickDelete(item.contents_id)"
                :data-contents-id="item.contents_id"
                title="削除"
              >
                <v-icon small>mdi-delete</v-icon>
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </v-card>
    </div>
  `,
  props: {
    path: Object,
    flag: Object,
    dialog: Object,
    functions: Object,
    loginUser: Object,
  },
  data() {
    return {
      usersNotesList: [],
      isLoading: false,
      search: '',
      headers: [
        { text: 'タイトル', value: 'title', align: 'start', filterable: true, sortable: true },
        { text: '登録日', value: 'created_at', filterable: false, sortable: true, width: '120px' },
        { text: '更新日', value: 'updated_at', filterable: false, sortable: true, width: '120px' },
        { text: '公開範囲', value: 'publicityText', filterable: false, sortable: true, width: '120px', align: 'center' },
        { text: '編集／削除', value: 'actions', filterable: false, sortable: false, width: '100px', align: 'center' },
      ],
    };
  },
  methods: {
    /**
     * 公開範囲の数値に対応する表示文字列を返す
     * @param {number} publicityValue - 公開範囲の数値 (0, 1, 2)
     * @returns {string} 表示文字列
     */
    getPublicityText(publicityValue) {
      switch (publicityValue) {
        case 0: return '非公開';
        case 1: return '公開';
        case 2: return '講師にのみ公開';
        default: return '不明';
      }
    },
    /**
     * 公開範囲に応じたVuetifyチップの色を返す
     * @param {number} publicityValue - 公開範囲の数値
     * @returns {string} Vuetifyの色名
     */
    getPublicityColor(publicityValue) {
      switch (publicityValue) {
        case 0: return 'grey darken-1'; // 非公開
        case 1: return 'green';       // 公開
        case 2: return 'blue';        // 講師にのみ公開
        default: return 'grey';       // 不明
      }
    },
    /**
     * 新規作成ボタンクリック時の処理
     */
    onClickNew() {
      this.$emit('request-show-form', { mode: 'regist', noteData: null });
    },
    /**
     * 編集ボタンクリック時の処理
     * @param {string} noteId - 編集対象のノートID (contents_id)
     */
    async onClickEdit(noteId) {
      const noteToEdit = await this.fetchUserNote(noteId);
      this.$emit('request-show-form', { mode: 'update', noteData: noteToEdit });
    },
    /**
     * 削除ボタンクリック時の処理
     * @param {string} noteId - 削除対象のノートID (contents_id)
     */
    onClickDelete(noteId) {
      const noteToDelete = this.usersNotesList.find(v => v.contents_id === noteId);
      this.$emit('request-delete-confirmation', { noteData: noteToDelete });
    },
    async fetchUserNotesList() { // APIからデータを取得
      this.isLoading = true;
      try {
        const data = {
          type: "getNotesList",
          ownerId: this.loginUser.ownerId,
          token: this.functions.generateRandomAlphanumericString(16),
        };
        let param = this.functions.convertObjectToURLSearchParams(data);
        const response = await axios.post(this.path.getNotesList, param);
        if (response.data && response.data.type === "success") {
          this.usersNotesList = response.data.list.map(note => {
            return { // 各 note オブジェクトのコピーを作成し、publicityプロパティを上書きする
              ...note, // 元の note オブジェクトのプロパティを展開
              title: this.functions.unescapeText(note.title),
              url: (note.url==null) ? '' : note.url,
              publicityText: this.getPublicityText(note.publicity),
              created_at: note.created_at.split(' ')[0],
              updated_at: note.updated_at.split(' ')[0],
            };
          });
        } else {
          console.error("ノートリストの取得に失敗しました:", response.data?.message);
          this.$emit('fetch-error', response.data?.message || 'ノートリストの取得に失敗しました。');
        }
      } catch (error) {
        console.error("ノートリストの取得中にエラーが発生しました:", error);
        this.$emit('fetch-error', 'ノートリストの取得中にエラーが発生しました。');
      } finally {
        this.isLoading = false;
      }
    },
    async fetchUserNote(contentsId) { // APIからデータを取得
      try {
        const data = {
          type: "getNote",
          contentsId: contentsId,
          token: this.functions.generateRandomAlphanumericString(16),
        };
        let param = this.functions.convertObjectToURLSearchParams(data);
        const response = await axios.post(this.path.getNotesList, param);
        if (response.data && response.data.type === "success") {
          const fetchedNote = response.data.note;
          const relate_notes = fetchedNote.relate_notes;
          return {
            ...fetchedNote, // スプレッド構文で元のデータを展開
            title: this.functions.unescapeText(fetchedNote.title),
            url: (fetchedNote.url == null) ? '' : fetchedNote.url,
            url_sub: (fetchedNote.url_sub == null) ? '' : fetchedNote.url_sub,
            note: this.functions.unescapeText(fetchedNote.note),
            relate_notes: (relate_notes == '' || relate_notes == null) ? '' : JSON.parse(this.functions.unescapeText(relate_notes)),
            publicityText: this.getPublicityText(fetchedNote.publicity)
          }
        } else {
          console.error("ノートの取得に失敗しました:", response.data?.message); // エラーメッセージを修正
          this.$emit('fetch-error', response.data?.message || 'ノートの取得に失敗しました。'); // エラーメッセージを修正
        }
      } catch (error) {
        console.error("ノート取得中にエラーが発生しました:", error); // エラーメッセージを修正
        this.$emit('fetch-error', 'ノート取得中にエラーが発生しました。'); // エラーメッセージを修正
      }
    },
  },
  mounted() {
    this.fetchUserNotesList(); // コンポーネントがマウントされたらノートリストを取得
  }
});

export default usersNoteArea;