// usersVideoArea.js
import videoIframe from './videoIframe.js';

let usersVideoArea = Vue.component("users-video-area", {
  template: `
    <div class="users-video-area container mt-4">
      <div class="mb-3 text-end">
        <v-btn
          data-parts-id="exises-06-01"
          @click="onClickNew"
          color="#8d0000"
          class="white--text"
        >
          <v-icon left>mdi-plus</v-icon> 新規作成
        </v-btn>
      </div>
      <v-card outlined>
        <v-card-title>
          登録ビデオ一覧
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
          :items="usersVideosList"
          item-key="contents_id"
          data-parts-id="exises-06-02"
          class="elevation-1 dense-table"
          dense
          :items-per-page="10"
          :footer-props="{ 'items-per-page-options': [10, 20, 50, 100] }"
          :search="search"
　        :loading="isLoading"
          loading-text="データをロードしています..."
          no-data-text="登録されているビデオはありません。"
        >
          <template v-slot:item.play="{ item }">
            <div data-parts-id="exises-06-02-01" class="text-center">
              <v-btn
                icon small color="red"
                @click="onClickPlay(item)"
                title="再生"
              >
                <v-icon>mdi-play-circle</v-icon>
              </v-btn>
            </div>
          </template>
          <template v-slot:item.title="{ item }">
            <span :data-parts-id="'exises-06-02-02'">{{ item.title }}</span>
          </template>
          <template v-slot:item.created_at="{ item }">
            <span :data-parts-id="'exises-06-02-03'">{{ item.created_at }}</span>
          </template>
          <template v-slot:item.updated_at="{ item }">
            <span :data-parts-id="'exises-06-02-04'">{{ item.updated_at }}</span>
          </template>
          <template v-slot:item.publicityText="{ item }">
            <v-chip dark small
              :color="getPublicityColor(item.publicity)"
              :data-parts-id="'exises-06-02-05'"
            >{{ item.publicityText }}</v-chip>
          </template>
          <template v-slot:item.actions="{ item }">
            <div data-parts-id="exises-06-02-06" class="text-center">
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
      <video-iframe :selected-video="selectedVideo" :open-iframe="openIframe" :is-search-mode="false"></video-iframe>
    </div>
  `,
  props: {
    path: Object,
    flag: Object,
    dialog: Object,
    functions: Object,
    loginUser: Object,
  },
  components: {
    videoIframe,
  },
  data() {
    return {
      usersVideosList: [],
      isLoading: false,
      selectedVideo: null,
      search: '',
      headers: [
        { text: '再生', value: 'play', filterable: false, sortable: false, width: '60px', align: 'center' },
        { text: 'タイトル', value: 'title', align: 'start', filterable: true, sortable: true },
        { text: '登録日', value: 'created_at', filterable: false, sortable: true, width: '120px' },
        { text: '更新日', value: 'updated_at', filterable: false, sortable: true, width: '120px' },
        { text: '公開範囲', value: 'publicityText', filterable: false, sortable: true, width: '120px', align: 'center' },
        { text: '編集／削除', value: 'actions', filterable: false, sortable: false, width: '100px', align: 'center' },
      ],
      openIframe: false,
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
      this.selectedVideo = null;
      this.$emit('request-show-form', { mode: 'regist', videoData: null });
    },
    /**
     * 再生ボタンクリック時の処理
     * @param {object} video - クリックされた行のビデオオブジェクト (item)
     */
    onClickPlay(video) {
      this.openIframe = true;
      this.selectedVideo = video;
      this.$emit('request-close-form');
    },
    /**
     * 編集ボタンクリック時の処理
     * @param {string} videoId - 編集対象のビデオID (contents_id)
     */
    onClickEdit(videoId) {
      this.openIframe = false;
      this.selectedVideo = null;
      const videoToEdit = this.usersVideosList.find(v => v.contents_id === videoId);
      this.$emit('request-show-form', { mode: 'update', videoData: videoToEdit });
    },
    /**
     * 削除ボタンクリック時の処理
     * @param {string} videoId - 削除対象のビデオID (contents_id)
     */
    onClickDelete(videoId) {
      this.openIframe = false;
      this.selectedVideo = null;
      const videoToDelete = this.usersVideosList.find(v => v.contents_id === videoId);
      this.$emit('request-delete-confirmation', { videoData: videoToDelete });
    },
    async fetchUserVideos() { // APIからデータを取得
      this.isLoading = true;
      try {
        const data = {
          type: "getVideosList", // APIに合わせたタイプを指定
          ownerId: this.loginUser.ownerId,
          token: this.functions.generateRandomAlphanumericString(16),
        };
        let param = this.functions.convertObjectToURLSearchParams(data);
        const response = await axios.post(this.path.getVideosList, param);
        if (response.data && response.data.type === "success") {
          this.usersVideosList = response.data.list.map(video => {
            return { // 各 video オブジェクトのコピーを作成し、publicityプロパティを上書きする
              ...video, // 元の video オブジェクトのプロパティを展開
              title: this.functions.unescapeText(video.title),
              tags: (video.tags == null || video.tags === '') ? '' : this.functions.unescapeText(video.tags),
              publicityText: this.getPublicityText(video.publicity),
              created_at: video.created_at.split(' ')[0],
              updated_at: video.updated_at.split(' ')[0],
            };
          });
        } else {
          console.error("ビデオリストの取得に失敗しました:", response.data?.message);
          this.$emit('fetch-error', response.data?.message || 'ビデオリストの取得に失敗しました。');
        }
      } catch (error) {
        console.error("ビデオリストの取得中にエラーが発生しました:", error);
        this.$emit('fetch-error', 'ビデオリストの取得中にエラーが発生しました。');
      } finally {
        this.isLoading = false;
      }
    },
  },
  mounted() {
    this.fetchUserVideos(); // コンポーネントがマウントされたらビデオリストを取得
  }
});

export default usersVideoArea;
