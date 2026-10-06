// archiveNoteCsvs.js
import archivedNoteListTable from './archivedNoteListTable.js';
import archiveNoteUpdateForm from './archiveNoteUpdateForm.js';

let archiveNoteCsvs = Vue.component("archive-note-csvs", {
  template: `
    <div data-parts-id="exises-08" class="pa-4">

      <v-card>
        <v-card-title>
          アーカイブノートCSVファイル一覧
          <v-spacer></v-spacer>
        </v-card-title>
        <v-divider></v-divider>
        <v-data-table dense
          :headers="headers"
          :items="noteCsv.getFiles"
          no-data-text="表示するデータがありません。"
          class="elevation-1"
        >
          <template v-slot:item.name="{ item }">
            <span data-parts-id="exises-08-01">{{ item.name }}</span>
          </template>
          <template v-slot:item.actions="{ item }">
            <v-btn small
              color="#8d0000" class="white--text my-2"
              @click="selectCsvFile(item)"
              data-parts-id="exises-08-02"
              :data-filename="item.name"
            >選択</v-btn>
          </template>
        </v-data-table>
      </v-card>

      <archived-note-list-table
        data-parts-id="exises-09"
        :is-visible="flag.isSelectedarchiveNotesTableView && !!selectedCsvFileName"
        :csv-file-name="selectedCsvFileName"
        :items="noteArchiveItems"
        :is-loading="isLoading"
        :functions="functions"
        @edit-item="editArchivedNote"
      ></archived-note-list-table>

      <archive-note-update-form
        data-parts-id="exises-10"
        v-if="flag.isArchiveNoteUpdateFormOpen"
        :dialog="dialog"
        :login-user="loginUser"
        :functions="functions"
        :note-data="selectedNoteForEdit"
        :is-visible="flag.isArchiveNoteUpdateFormOpen"
        :path="path"
      ></archive-note-update-form>

    </div>
  `,
  props: {
    loginUser: Object,
    path: Object,
    functions: Object,
    flag: Object,
    dialog: Object,
  },
  components: {
    archivedNoteListTable,
    archiveNoteUpdateForm,
  },
  data() {
    return {
      headers: [
        { text: 'CSV タイトル', value: 'name', sortable: true, class: 'text-left', cellClass: 'text-left' },
        { text: '選択', value: 'actions', sortable: false, width: '120px', align: 'center' },
      ],
      selectedCsvFileName: null,
      selectedNoteForEdit: null,
      noteCsv: {
        getFiles: [],
      },
      noteArchiveItems: [],
      isLoading: false,
    };
  },
  methods: {
    async fetchArchivednoteCsvTitles() {
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
                const noteCsvs = response.data.list
                                  .filter(row => row.includes('ulinker_notes')) // 条件に合うものだけをフィルタリング
                                  .map(row => ({ 'name': row })); // フィルタリングされたものだけをmapで変換
                this.noteCsv.getFiles = noteCsvs;
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
    async fetchArchivednoteCsvRows(fileName) {
      this.isLoading = true;
      this.noteArchiveItems = [];
      try {
        const data = {
          type: "note",
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
                const notesList = response.data.list.map(row => {
                  return {
                    contentsId: row.contents_id,
                    title: this.functions.unescapeText(row.title),
                    publicity: Number(row.publicity),
                    created: row.created_at.split(' ')[0],
                    updated: row.updated_at.split(' ')[0],
                    createdTime: row.created_at.split(' ')[1],
                  }
                });
                this.noteArchiveItems = notesList;
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
          })
          .finally(() => {
            this.isLoading = false;
          });
      } catch (error) {
        console.error("アーカイブノートの取得に失敗しました:", error);
        this.isLoading = false;
      }
    },
    selectCsvFile(fileRow) {
      if (fileRow && fileRow.name) {
        this.selectedCsvFileName = fileRow.name;
        this.fetchArchivednoteCsvRows(fileRow.name);
        this.flag.isSelectedarchiveNotesTableView = true;
      }
    },
    async editArchivedNote(item) {

      const data = {
        type: "getNoteDetail",
        name: this.selectedCsvFileName,
        contentsId: item.contentsId,
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
              const addInfo = response.data.add_info;
              item = {
                ...item,
                url: (addInfo.url=='NULL') ? null : addInfo.url,
                url_sub: (addInfo.url_sub=='NULL') ? null : addInfo.url_sub,
                note: this.functions.unescapeText(addInfo.note).replaceAll('\\n','\n'),
                relate_notes: (addInfo.relate_notes=='NULL') ? null : addInfo.relate_notes,
                relate_video_urls: (addInfo.relate_video_urls=='NULL') ? null : addInfo.relate_video_urls,
              }
              this.selectedNoteForEdit = JSON.parse(JSON.stringify(item));
              this.flag.isArchiveNoteUpdateFormOpen = true;
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
    },
  },
  mounted() {
    this.fetchArchivednoteCsvTitles();
  }
});

export default archiveNoteCsvs;