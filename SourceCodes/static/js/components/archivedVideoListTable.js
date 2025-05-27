// archivedVideoListTable.js

let archivedVideoListTable = Vue.component("archived-video-list-table", {
  template: `
    <div v-if="isVisible" class="fader mt-4">
      <v-card data-parts-id="exises-12-01">
        <v-card-title>
          アーカイブビデオタイトル一覧 ({{ csvFileName }})
          <v-spacer></v-spacer>
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="タイトル検索"
            single-line hide-details dense class="search-field"
          ></v-text-field>
        </v-card-title>
        <v-divider></v-divider>
        <v-data-table dense
          :headers="headers"
          :items="items"
          :search="search"
          item-key="contentsId"
          :footer-props="{'items-per-page-options': [10, 20, 50, 100]}"
          :items-per-page.sync="itemsPerPage"
          class="elevation-1 dense-table"
          no-data-text="ログインユーザーが登録したビデオデータが存在しません。"
        >
          <template v-slot:item.title="{ item }">
            <span :data-parts-id="'exises-12-01-01'"
              :data-contents-id="item.contentsId"
              v-text="item.title"></span>
          </template>
          <template v-slot:item.created="{ item }">
            <span :data-parts-id="'exises-12-01-02'" v-text="item.created"></span>
          </template>
          <template v-slot:item.updated="{ item }">
            <span :data-parts-id="'exises-12-01-03'" v-text="item.updated"></span>
          </template>
          <template v-slot:item.publicity="{ item }">
            <v-chip dark small
              :color="getPublicityColor(item.publicity)"
              :data-parts-id="'exises-12-01-04'"
            >{{ getPublicityLabel(item.publicity) }}</v-chip>
          </template>
          <template v-slot:item.actions="{ item }">
            <v-btn small
              color="#8d0000" class="white--text my-2"
              :data-parts-id="'exises-12-01-05'"
              :data-contents-id="item.contentsId"
              @click="onEditItem(item)"
            >編集</v-btn>
          </template>
        </v-data-table>
      </v-card>
    </div>
  `,
  props: {
    isVisible: Boolean,
    csvFileName: String,
    items: Array,
    functions: Object,
  },
  data() {
    return {
      headers: [
        { text: 'タイトル', value: 'title', sortable: true },
        { text: '登録日', value: 'created', sortable: true, width: '120px' },
        { text: '更新日', value: 'updated', sortable: true, width: '120px' },
        { text: '公開範囲', value: 'publicity', sortable: true, width: '150px' },
        { text: '編集', value: 'actions', sortable: false, align: 'center', width: '100px' },
      ],
      search: "",
      itemsPerPage: 10,
    };
  },
  methods: {
    getPublicityLabel(publicity) {
      switch (publicity) {
        case 0: return "非公開";
        case 1: return "公開";
        case 2: return "講師にのみ公開";
        default: return "不明";
      }
    },
    getPublicityColor(publicityValue) {
      switch (publicityValue) {
        case 0: return 'grey darken-1';
        case 1: return 'green';
        case 2: return 'blue';
        default: return 'grey';
      }
    },
    onEditItem(item) {
      this.$emit('edit-item', item);
    }
  }
});

export default archivedVideoListTable;
