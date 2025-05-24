// usersBookmarkArea.js

let usersBookmarkArea = Vue.component("users-bookmark-area", {
  template: `
    <div class="users-bookmark-area container mt-4">
      <div class="mb-3 text-end">
        <v-btn
          data-parts-id="exises-14-01"
          @click="onClickNew"
          color="#8d0000"
          class="white--text"
        >
          <v-icon left>mdi-plus</v-icon> 新規登録
        </v-btn>
      </div>
      <v-card outlined>
        <v-card-title>
          登録サイト一覧
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
          :items="usersBookmarksList"
          item-key="contents_id"
          data-parts-id="exises-14-02"
          class="elevation-1 dense-table"
          dense
          :items-per-page="10"
          :footer-props="{ 'items-per-page-options': [10, 20, 50, -1] }"
          :search="search"
        >
          <template v-slot:item.title="{ item }">
            <span :data-parts-id="'exises-14-02-01'">
              <a target="_blank" :href="item.url" :data-contents-id="item.contents_id">{{ item.title }}</a>
            </span>
          </template>
          <template v-slot:item.actions="{ item }">
            <div data-parts-id="exises-14-02-02" class="text-center">
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
          <template v-slot:no-data>
            <v-alert :value="true" icon="mdi-alert" id="empty-alert" class="ma-3 empty-message">
              登録されているサイトはありません。
            </v-alert>
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
      usersBookmarksList: [],
      selectedBookmark: null,
      search: '',
      // v-data-table用のヘッダー定義
      headers: [
        { text: 'タイトル', value: 'title', align: 'start', filterable: true, sortable: true },
        { text: '編集／削除', value: 'actions', filterable: false, sortable: false, width: '100px', align: 'center' },
      ],
      openIframe: false,
    };
  },
  computed: {
    // 
  },
  methods: {
    /**
     * 新規作成ボタンクリック時の処理
     */
    onClickNew() {
      this.selectedBookmark = null;
      this.$emit('request-show-form', { mode: 'regist', bookmarkData: null });
    },
    /**
     * 編集ボタンクリック時の処理
     * @param {string} bookmarkId - 編集対象のお気に入りサイトID (contents_id)
     */
    onClickEdit(bookmarkId) {
      this.openIframe = false;
      this.selectedBookmark = null;
      const bookmarkToEdit = this.usersBookmarksList.find(v => v.contents_id === bookmarkId);
      this.$emit('request-show-form', { mode: 'update', bookmarkData: bookmarkToEdit });
    },
    /**
     * 削除ボタンクリック時の処理
     * @param {string} bookmarkId - 削除対象のお気に入りサイトID (contents_id)
     */
    onClickDelete(bookmarkId) {
      this.openIframe = false;
      this.selectedBookmark = null;
      const bookmarkToDelete = this.usersBookmarksList.find(v => v.contents_id === bookmarkId);
      this.$emit('request-delete-confirmation', { bookmarkData: bookmarkToDelete });
    },
    async fetchUserBookmarks() { // APIからデータを取得
      try {
        const data = {
          type: "getBookmarksList", // APIに合わせたタイプを指定
          ownerId: this.loginUser.ownerId,
          token: this.functions.generateRandomAlphanumericString(16),
        };
        let param = this.functions.convertObjectToURLSearchParams(data);
        const response = await axios.post(this.path.getBookmarksList, param);
        if (response.data && response.data.type === "success") {
          this.usersBookmarksList = response.data.list.map((site) => {
            return { // 各siteオブジェクトのコピーを作成し、titleプロパティを上書きする
              ...site, // 元のsiteオブジェクトのプロパティを展開
              title: this.functions.unescapeText(site.title),
            };
          });
        } else {
          console.error("お気に入りサイトリストの取得に失敗しました:", response.data?.message);
          this.$emit('fetch-error', response.data?.message || 'お気に入りサイトリストの取得に失敗しました。');
        }
      } catch (error) {
        console.error("お気に入りサイトリストの取得中にエラーが発生しました:", error);
        this.$emit('fetch-error', 'お気に入りサイトリストの取得中にエラーが発生しました。');
      }
    },
  },
  mounted() {
    this.fetchUserBookmarks(); // コンポーネントがマウントされたらお気に入りサイトリストを取得
  }
});

export default usersBookmarkArea;
