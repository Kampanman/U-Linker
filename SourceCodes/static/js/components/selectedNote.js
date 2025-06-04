// selectedNote.js
import selectedNoteText from './selectedNoteText.js';

let selectedNote = Vue.component("selected-note", {
  template: `
    <div v-if="openNoteArea && selectedNote" data-parts-id="common-04-02" class="mt-4 selected-note-area">

      <div class="mb-3" data-parts-id="common-04-02-01" :contents-id="selectedNote.contentsId">
        <v-icon color="green" class="me-2">mdi-book-open</v-icon>
        <span class="mr-2">タイトル: </span>
        <template v-if="selectedNote.url">
          <a :href="selectedNote.url" target="_blank" rel="noopener noreferrer">{{ selectedNote.title }}</a>
        </template>
        <template v-else>{{ selectedNote.title }}</template>
        <span v-if="selectedNote.csvFileName" class="csv-source"> （取得元アーカイブ: {{ selectedNote.csvFileName }}）</span>
      </div>

      <div v-if="selectedNote.createdUserName" class="mb-3" data-parts-id="common-04-02-02">
        <v-icon color="blue" class="me-2">mdi-account</v-icon>
        <span class="mr-2">登録者: </span>{{ selectedNote.createdUserName }}
      </div>

      <div class="mb-3" v-if="isCurrentUserNoteOwner && selectedNote.urlSub" data-parts-id="common-04-02-exises-01">
        <v-icon color="blue" class="me-2">mdi-link-variant</v-icon>
        <span class="mr-2">サブリンク: </span>
        <a :href="selectedNote.urlSub" target="_blank" rel="noopener noreferrer">アクセスする</a>
      </div>

      <div class="mb-3" v-if="isCurrentUserNoteOwner" data-parts-id="common-04-02-exises-02">
        <div v-if="parsedrelateNotesAndWords.length > 0">
          <p class="mb-3">
            <v-icon color="purple" class="me-2 mr-2">mdi-format-list-bulleted</v-icon>
            <span class="mr-2">関連ノート・共通ワード</span>
          </p>
          <ul class="ml-4">
            <li v-for="(item, index) in parsedrelateNotesAndWords" :key="index">
              <span class="bold" v-text="item.title"></span> （共通ワード: {{ item.common_word }}）
            </li>
          </ul>
        </div>
        <div class="ml-4 mb-3" v-else align="center">
          <span>関連ノートは設定されていません</span>
        </div>
      </div>

      <div v-if="selectedNote.lastUpdated && selectedNote.created" class="mb-3" data-parts-id="common-04-02-03">
        <v-icon class="me-2">mdi-clock-time-nine-outline</v-icon>
        <span class="mr-2">最終更新日: </span>
        {{ selectedNote.lastUpdated.split(' ')[0] }}（ 登録日: {{ selectedNote.created.split(' ')[0] }} ）
      </div>

      <div class="mt-5 mb-5" data-parts-id="common-04-02-07" align="center" v-if="containWordRows>0">
        <span class="mr-2">キーワード含有行数: </span>
        <span class="bluetext bold">{{ containWordRows }}</span>
      </div>

      <v-col cols="12" sm="4" class="ml-4 mb-3" data-parts-id="common-04-02-04">
        <v-select
          v-model="selectedNote.textViewMode"
          :items="textViewModes"
          item-text="text"
          item-value="value"
          label="表示モード"
          data-parts-id="common-04-02-04-01"
          dense hide-details class="mode-select"
        ></v-select>
      </v-col>

      <selected-note-text
        :selected-note="selectedNote"
        :is-current-user-note-owner="isCurrentUserNoteOwner"
        :search-keyword="searchKeyword"
        :search-and-or="searchAndOr"
        :functions="functions"
        :path="path"
        :login-user="loginUser"
        @update-contain-word-rows="handleContainWordRows"
      ></selected-note-text>

      <div data-parts-id="common-04-02-06" v-if="isCurrentUserNoteOwner">
        <div class="mb-3">
          <v-icon color="red" class="me-2 mr-2">mdi-video</v-icon>関連動画
        </div>
        <div v-if="relateVideos.length > 0">
          <div v-for="(videoUrl, index) in relateVideos" :key="index" class="related-video-item">
            <v-btn
              v-show="currentlyDisplayedVideoIndex !== index"
              @click="showVideo(index)"
              data-parts-id="common-04-02-06-01"
              color="#8d0000" class="white--text mb-3 ml-3"
            >{{ index + 1 }} つめの動画を表示</v-btn>
            <v-card
              data-parts-id="common-04-02-06-02"
              class="pl-3 pt-3 mb-3"
              v-if="currentlyDisplayedVideoIndex === index"
            >
              <p class="mb-3"><b>{{ index + 1 }} つめの動画を表示中</b></p>
              <div class="video-responsive-wrapper" align="center">
                <iframe
                  data-parts-id="common-04-02-06-02"
                  :src="videoUrl"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                  class="video-iframe related-video-iframe"
                ></iframe>
              </div>
              <div align="center">
                <v-btn data-parts-id="common-04-02-06-03" class="white-button my-3 ml-3" @click="showVideo(-1)">閉じる</v-btn>
              </div>
            </v-card>
          </div>
        </div>
        <div v-else align="center">設定なし</div>
      </div>

    </div>
  `,
  props: {
    flag: Object,
    functions: Object,
    loginUser: Object,
    path: Object,
    searchResult: Array,
    selectedNote: Object,
    openNoteArea: {
      type: Boolean,
      required: true,
      default: false
    },
    searchKeyword: String,
    searchAndOr: Number, // 0: AND, 1: OR
  },
  components: {
    selectedNoteText,
  },
  data: function () {
    return {
      // モードプルダウンの選択肢
      textViewModes: [
        { value: 0, text: "全文表示モード" },
        { value: 1, text: "ブラインドスタートモード" },
        { value: 2, text: "行読み上げモード" },
        { value: 3, text: "範囲選択・加工モード" }
      ],
      currentlyDisplayedVideoIndex: -1, // 現在表示中の関連動画のインデックス (-1 は何も表示していない状態)
      containWordRows: 0,
    };
  },
  computed: {
    // ログインユーザーが作成したノートかどうか
    isCurrentUserNoteOwner() {
      // selectedNote と loginUser が存在し、それぞれのIDが一致するか確認
      return this.selectedNote && this.loginUser && this.selectedNote.createdUserId === this.loginUser.ownerId;
    },
    // 関連ノート・共通ワード集 (JSONパース対応)
    parsedrelateNotesAndWords() {
      if (!this.selectedNote || !this.selectedNote.relateNotesAndWords) return [];
      if (typeof this.selectedNote.relateNotesAndWords === 'string') {
        try {
          const unescapedRelator = this.functions.unescapeText(this.selectedNote.relateNotesAndWords);
          const parsed = JSON.parse(unescapedRelator);
          // JSON.parseの結果が配列であり、各要素が必要なプロパティを持つか確認
          if (Array.isArray(parsed)) return parsed.filter(item => item && item.title && item.common_word);
          return [];
        } catch (e) {
          console.error("関連ノート・共通ワードのJSONパースに失敗しました:", e);
          return []; // パースエラー時は空配列
        }
      } else if (Array.isArray(this.selectedNote.relateNotesAndWords)) { // 配列の場合も各要素が必要なプロパティを持つか確認
        return this.selectedNote.relateNotesAndWords.filter(item => item && item.title && item.common_word);
      }
      return []; // 文字列でも配列でもない場合は空配列
    },
    // 関連動画配列 (最大5件)
    relateVideos() {
      // relateVideosArray が存在し、配列であることを確認
      if (this.selectedNote && this.selectedNote.relateVideosArray && Array.isArray(this.selectedNote.relateVideosArray)) {
        let mapVideos = this.selectedNote.relateVideosArray;
        if (this.selectedNote.relateVideosArray[0].includes('\\n')) mapVideos = this.selectedNote.relateVideosArray[0].split('\\n');
        
        // 各URLを埋め込み用URLに変換
        return mapVideos.map(url => this.generateEmbedUrl(url))
          .filter(url => url !== null) // 無効なURLを除外
          .slice(0, 5); // 最大5件に制限
      }
      return []; // それ以外の場合は空配列
    }
  },
  methods: {
    handleContainWordRows(payload) {
      this.containWordRows = payload;
    },
    // YouTube URLを埋め込みURLに変換
    generateEmbedUrl(url) {
      if (!url) return null;
      try {
        const urlObj = new URL(url);
        let videoId = null;
        if (urlObj.hostname.includes('youtube.com') && urlObj.searchParams.has('v')) {
          videoId = urlObj.searchParams.get('v');
        } else if (urlObj.hostname === 'youtu.be') {
          videoId = urlObj.pathname.substring(1);
        }
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
      } catch (e) {
        console.error("Invalid URL for embedding:", url, e);
        return null;
      }
    },
    showVideo(index) {
      if (this.currentlyDisplayedVideoIndex === index) { // 同じボタンを再度クリックしたら非表示にする
        this.currentlyDisplayedVideoIndex = -1;
      } else {
        this.currentlyDisplayedVideoIndex = index;
      }
    },
    resetComponentState() {
      this.currentlyDisplayedVideoIndex = -1;
    }
  },
  watch: {
    // selectedNote が変更されたら、関連動画の表示をリセット
    selectedNote: {
      handler(newVal, oldVal) {
        if (newVal?.contentsId !== oldVal?.contentsId) this.resetComponentState();
      },
      deep: true, // ネストされたプロパティの変更も監視
      immediate: true // 初期読み込み時にも実行
    }
  },
});

export default selectedNote;
