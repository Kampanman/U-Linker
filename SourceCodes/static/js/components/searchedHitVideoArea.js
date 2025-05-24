// searchedHitVideoArea.js
import videoIframe from './videoIframe.js';

let searchedHitVideoArea = Vue.component("searched-hit-video-area", {
  template: `
    <div class="searched-hit-video-area my-5" data-parts-id="common-05-01">
      <v-card class="pa-4 rounded-card" color="#efebde" width="93%" outlined>
        <v-card class="pa-4 rounded-card" color="#F8BBD0" outlined>
          <v-card-title>
            <span class="area-title">該当ビデオ一覧</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-data-table dense
                    :headers="headers"
                    :items="videoList"
                    item-key="contents_id"
                    class="elevation-1 dense-table"
                  >
                    <template v-slot:item.publicity="{ item }">
                      <v-chip dark small
                        :color="getPublicityColor(item.publicity)"
                        data-parts-id="common-05-01-01"
                        v-text="getPublicityLabel(item.publicity)"
                      ></v-chip>
                    </template>
                    <template v-slot:item.title="{ item }">
                      <div :data-parts-id="'common-05-01-02'" :data-contents-id="item.contents_id">
                        <span v-text="item.title"></span>
                        <span v-if="item.from.endsWith('.csv')" class="ml-2">({{ item.from }})</span>
                      </div>
                    </template>
                    <template v-slot:item.created="{ item }">
                      <span data-parts-id="common-05-01-03" v-text="functions.formatDateTime(item.created)"></span>
                    </template>
                    <template v-slot:item.actions="{ item }">
                      <v-btn small
                        color="#8d0000"
                        class="white--text my-1"
                        data-parts-id="common-05-01-04"
                        @click="showVideoContent(item)"
                      >表示</v-btn>
                    </template>
                  </v-data-table>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
        </v-card>
        <div v-if="openIframe" class="video-container-wrapper mt-4">
          <v-card-title>
            <span class="area-title">選択中のビデオ</span>
          </v-card-title>
          <video-iframe class="fader" :selected-video="selectedVideo" :open-iframe="openIframe" :is-search-mode="true"></video-iframe>
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
    selectedVideo: Object,
  },
  components: {
    videoIframe,
  },
  data() {
    return {
      headers: [
        { text: "公開範囲", align: "start", sortable: false, value: "publicity" },
        { text: "ビデオタイトル", value: "title", sortable: true },
        { text: "登録日時", value: "created", sortable: true }, // value を created に変更
        { text: "操作", value: "actions", sortable: false },
      ],
      videoList: [], // noteList から videoList に変更
      openIframe: false,
    };
  },
  watch: {
    // searchResult プロパティの変更を監視
    searchResult: {
      handler(newVal) {
        this.updateVideoList(newVal); // メソッド名を updateVideoList に変更
      },
      deep: true,
      immediate: true
    },
    // selectedVideo プロパティの変更を監視
    selectedVideo: {
      handler(newVal) {
        if (!newVal) this.openIframe = false;
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    // videoList を更新するメソッド
    updateVideoList(result) { // メソッド名を updateVideoList に変更
      this.videoList = result.map((row) => { // videoList に代入
        return {
          ...row,
          title: this.functions.unescapeText(row.title),
          created: row.created_at, // created_at を created にマッピング
        }
      });
      this.openIframe = false; // 選択中のビデオの表示は一旦falseにする
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
    showVideoContent(item) {
      this.getRecord(item);
      this.openIframe = true;
    },
    async getRecord(item) {
      try {
        const data = {
          type: "getVideoRecord",
          from: item.from,
          contents_id: item.contents_id,
          owner_id: this.loginUser.ownerId,
          token: this.functions.generateRandomAlphanumericString(16),
        }

        Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);
        let param = this.functions.convertObjectToURLSearchParams(data);

        const response = await axios.post(this.path.getSelectedData, param);
        if (response.data && response.data.type === "success") {
          const payload = response.data.video; // レスポンスのキーを video に変更
          let resVideo = {
            contentsId: payload.contents_id,
            title: this.functions.unescapeText(payload.title),
            url: payload.url,
            csvFileName: (item.from.includes('.csv')) ? item.from : null,
            tags: this.functions.unescapeText(payload.tags || ''), // tags を追加 (unescape)
            createdUserId: payload.created_user_id,
            createdUserName: payload.created_by,
            created: payload.created_at,
            lastUpdated: payload.updated_at,
          }
          this.$emit('get-selected-video', resVideo); // 呼び出し元に取得結果を返却する
        } else {
          console.error("ビデオレコードの取得に失敗しました:", response.data?.message);
          this.$emit('fetch-error', response.data?.message || 'ビデオレコードの取得に失敗しました。');
        }
      } catch (error) {
        console.error("ビデオレコード取得中にエラーが発生しました:", error);
        this.$emit('fetch-error', 'ビデオレコード取得中にエラーが発生しました。');
      }
    }
  },
});

export default searchedHitVideoArea;