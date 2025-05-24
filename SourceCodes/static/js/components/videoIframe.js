// videoIframe.js

let videoIframe = Vue.component("video-iframe", {
  template: `
    <div v-if="openIframe && selectedVideo" class="mt-4 p-3 border rounded shadow-sm bg-light video-player-container">
      <div class="video-details-wrapper">
        <h4 class="mb-2"
          :data-parts-id="isSearchMode ? 'common-05-02-01' : ''"
          :data-contents-id="isSearchMode ? viewFrame.contents_id : ''"
        >
          <v-icon color="red" class="me-2">mdi-video</v-icon>
          <span class="mr-2">{{ isSearchMode ? 'ビデオタイトル' : 'タイトル' }}: </span>
          {{ viewFrame.title }}
          <span v-if="viewFrame.csvFileName" class="csv-source"> （取得元アーカイブ: {{ viewFrame.csvFileName }}）</span>
        </h4>
        <p v-if="viewFrame.tags" class="mb-3 text-muted" :data-parts-id="isSearchMode ? 'common-05-02-02' : ''">
          <v-icon class="me-2">mdi-tag-multiple</v-icon>
          <span class="mr-2">登録タグ: </span>
          {{ viewFrame.tags }}
        </p>
        <p v-if="isSearchMode && viewFrame.created_user_name" class="mb-3 text-muted" :data-parts-id="isSearchMode ? 'common-05-02-03' : ''">
          <v-icon color="blue" class="me-2">mdi-account</v-icon>
          <span class="mr-2">登録者名: </span>
          {{ viewFrame.created_user_name }}
        </p>
        <p v-if="isSearchMode && viewFrame.updated_at" class="mb-3 text-muted" :data-parts-id="isSearchMode ? 'common-05-02-04' : ''">
          <v-icon class="me-2">mdi-clock-time-nine-outline</v-icon>
          <span class="mr-2">最終更新日: </span>
          {{ viewFrame.updated_at.split(' ')[0] }}（ 登録日: {{ viewFrame.created_at.split(' ')[0] }} ）
        </p>
      </div>
      <div v-if="youtubeEmbedUrl" class="video-responsive-container" :data-parts-id="isSearchMode ? 'common-05-02-05' : ''">
        <div class="video-responsive-wrapper">
          <iframe
            class="video-iframe"
            :src="youtubeEmbedUrl"
            :title="'YouTube video player: ' + viewFrame.title"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          ></iframe>
        </div>
      </div>
      <v-alert v-else type="warning" dense outlined class="mt-3">
        <v-icon left>mdi-alert-triangle</v-icon>有効なYouTube URLではないため、ビデオを再生できません。 (URL: {{ viewFrame.url }})
      </v-alert>
    </div>
  `,
  props: {
    selectedVideo: {
      type: Object,
      default: null,
    },
    openIframe: {
      type: Boolean,
      default: false,
    },
    isSearchMode: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      viewFrame: {},
    }
  },
  watch: {
    selectedVideo: function(){ this.refreshViewFrame() },
  },
  computed: {
    /**
     * YouTubeの通常URLから埋め込み用URLを生成する
     * @returns {string|null} 埋め込み用URL、または無効な場合はnull
     */
    youtubeEmbedUrl() {
      if (this.selectedVideo && this.selectedVideo.url) {
        try {
          const url = new URL(this.selectedVideo.url);
          // youtube.com/watch?v=VIDEO_ID の形式を想定
          if (url.hostname.includes('youtube.com') && url.searchParams.has('v')) {
            const videoId = url.searchParams.get('v');
            return `https://www.youtube.com/embed/${videoId}`;
          }
          if (url.hostname === 'youtu.be') { // youtu.be/VIDEO_ID の形式も考慮
            const videoId = url.pathname.substring(1); // 先頭の / を除去
            if(videoId) return `https://www.youtube.com/embed/${videoId}`;
          }
        } catch (e) {
          console.error("Invalid URL format for embedding:", this.selectedVideo.url, e);
        }
      }

      return null; // 有効なYouTube URLでない場合は null を返す
    }
  },
  methods: {
    refreshViewFrame() {
      if (!this.selectedVideo.hasOwnProperty('contentsId')) { // selectedVideo に contentsId が存在するかで設定を分ける
        this.viewFrame = this.selectedVideo;
      } else {
        this.viewFrame = {
          ...this.selectedVideo,
          contents_id: this.selectedVideo.contentsId,
          created_user_name: this.selectedVideo.createdUserName,
          created_at: this.selectedVideo.created,
          updated_at: this.selectedVideo.lastUpdated,
        };
      }

      // viewFrame から undefined のプロパティを除去
      Object.keys(this.viewFrame).forEach(key => {
        if (this.viewFrame[key] === undefined) delete this.viewFrame[key];
      });
    },
  },
});

export default videoIframe;
