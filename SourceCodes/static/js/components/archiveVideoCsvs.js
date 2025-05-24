// archiveVideoCsvs.js
import archivedVideoListTable from './archivedVideoListTable.js';
import archiveVideoUpdateForm from './archiveVideoUpdateForm.js';

let archiveVideoCsvs = Vue.component("archive-video-csvs", {
  template: `
    <div data-parts-id="exises-11" class="pa-4">
      <v-card>
        <v-card-title>
          アーカイブビデオCSVファイル一覧
          <v-spacer></v-spacer>
        </v-card-title>
        <v-divider></v-divider>
        <v-data-table dense
          :headers="headers"
          :items="videoCsv.getFiles"
          no-data-text="表示するデータがありません。"
          class="elevation-1"
        >
          <template v-slot:item.name="{ item }">
            <span data-parts-id="exises-11-01">{{ item.name }}</span>
          </template>
          <template v-slot:item.actions="{ item }">
            <v-btn small
              color="#8d0000" class="white--text my-2"
              @click="selectCsvFile(item)"
              data-parts-id="exises-11-02"
              :data-filename="item.name"
            >選択</v-btn>
          </template>
        </v-data-table>
      </v-card>

      <archived-video-list-table
        data-parts-id="exises-12"
        :is-visible="flag.isSelectedArchiveVideosTableView && !!selectedCsvFileName"
        :csv-file-name="selectedCsvFileName"
        :items="videoArchiveItems"
        :functions="functions"
        @edit-item="editArchivedVideo"
      ></archived-video-list-table>

      <archive-video-update-form
        data-parts-id="exises-13"
        v-if="flag.isArchiveVideoUpdateFormOpen"
        :login-user="loginUser"
        :functions="functions"
        :video-data="selectedVideoForEdit"
        :is-visible="flag.isArchiveVideoUpdateFormOpen"
      ></archive-video-update-form>
    </div>
  `,
  props: {
    loginUser: Object,
    path: Object,
    functions: Object,
    flag: Object,
  },
  components: {
    archivedVideoListTable,
    archiveVideoUpdateForm,
  },
  data() {
    return {
      headers: [
        { text: 'CSV タイトル', value: 'name', sortable: true, class: 'text-left', cellClass: 'text-left' },
        { text: '選択', value: 'actions', sortable: false, width: '120px', align: 'center' },
      ],
      selectedCsvFileName: null,
      selectedVideoForEdit: null,
      videoCsv: {
        getFiles: [],
      },
      videoArchiveItems: [],
    };
  },
  methods: {
    async fetchArchivedVideoCsvTitles() {
      try {

        const data = {
          type: "getCsvList",
          ownerId: this.loginUser.ownerId,
          token: this.functions.generateRandomAlphanumericString(16),
        };

        // 不要なプロパティ (undefined) を削除
        Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

        let param = this.functions.convertObjectToURLSearchParams(data);
        axios
          .post(this.path.getCsvList, param)
          .then((response) => {
            if (response.data) {
              if (response.data.type === "success") {
                const videoCsvs = response.data.list
                                  .filter(row => row.includes('ulinker_videos')) // 条件に合うものだけをフィルタリング
                                  .map(row => ({ 'name': row })); // フィルタリングされたものだけをmapで変換
                this.videoCsv.getFiles = videoCsvs;
              }
            }
          })
          .catch((error) => {
            if (error.response) {
              console.error("Error Response:", error.response);
            } else if (error.request) {
              console.error("Error Request:", error.request);
            } else {
              console.error("Error:", error.message);
            }
          });
      } catch (error) {
        console.error("アカウント情報の取得に失敗しました:", error);
      }
    },
    async fetchArchivedVideoCsvRows(fileName) {
      try {
        const data = {
          type: "video",
          name: fileName,
          ownerId: this.loginUser.ownerId,
          token: this.functions.generateRandomAlphanumericString(16),
        };

        // 不要なプロパティ (undefined) を削除
        Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

        let param = this.functions.convertObjectToURLSearchParams(data);
        axios
          .post(this.path.getCsvRowList, param)
          .then((response) => {
            if (response.data) {
              if (response.data.type === "success") {
                const videosList = response.data.list.map(row => {
                  return {
                    ...row,
                    contentsId: row.contents_id,
                    created: row.created_at.split(' ')[0],
                    updated: row.created_at.split(' ')[0],
                    createdTime: row.created_at.split(' ')[1],
                    publicity: Number(row.publicity),
                    tags: this.functions.unescapeText(row.tags),
                    title: this.functions.unescapeText(row.title),
                  }
                });
                this.videoArchiveItems = videosList;
              }
            }
          })
          .catch((error) => {
            if (error.response) {
              console.error("Error Response:", error.response);
            } else if (error.request) {
              console.error("Error Request:", error.request);
            } else {
              console.error("Error:", error.message);
            }
          });
      } catch (error) {
        console.error("アカウント情報の取得に失敗しました:", error);
      }
    },
    selectCsvFile(fileRow) {
      if (fileRow && fileRow.name) {
        this.selectedCsvFileName = fileRow.name;
        this.fetchArchivedVideoCsvRows(fileRow.name);
        this.flag.isSelectedArchiveVideosTableView = true;
      }
    },
    editArchivedVideo(item) {
      this.selectedVideoForEdit = JSON.parse(JSON.stringify(item));
      this.flag.isArchiveVideoUpdateFormOpen = true;
    },
  },
  mounted() {
    this.fetchArchivedVideoCsvTitles();
  }
});

export default archiveVideoCsvs;