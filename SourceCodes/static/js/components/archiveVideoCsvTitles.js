// archiveVideoCsvTitles.js

let archiveVideoCsvTitles = Vue.component("archive-video-csv-titles", {
  template: `
    <div data-parts-id="exises-11" class="pa-4">
      <v-card>
        <v-card-title>
          <v-col cols="12" md="6">
            <span>ユーザー一覧</span>
          </v-col>
          <v-spacer></v-spacer>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon @click="fetchArchivedVideoCsvTitles" v-bind="attrs" v-on="on">
                <v-icon>mdi-refresh</v-icon>
              </v-btn>
            </template>
            <span>リストを再読み込み</span>
          </v-tooltip>
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
              color="primary"
              @click="selectCsvFile(item)"
              data-parts-id="exises-11-02"
              :data-filename="item.name"
            >選択</v-btn>
          </template>
        </v-data-table>
      </v-card>
    </div>
  `,
  props: {
    loginUser: Object,
    path: Object,
    functions: Object,
  },
  data() {
    return {
      videoCsv: {
        getFiles: [],
      },
      headers: [
        { text: 'CSV タイトル', value: 'name', sortable: true, class: 'text-left', cellClass: 'text-left' },
        { text: '選択', value: 'actions', sortable: false, width: '120px', align: 'center' },
      ],
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
              console.log(response.data.list);
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
        this.$emit('csv-file-selected', fileRow.name);
      }
    }
  },
  mounted() {
    this.fetchArchivedVideoCsvTitles();
  }
});

export default archiveVideoCsvTitles;
