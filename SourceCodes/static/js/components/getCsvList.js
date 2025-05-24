// getCsvList.js

let getCsvList = Vue.component("get-csv-list", {
  template: `
    <div>
      <v-app></v-app>
    </div>
  `,
  props: {
    path: Object,
    functions: Object,
  },
  data() {
    return {
      // 
    };
  },
  methods: {
    async fetchCsvList() { // APIからデータを取得
      try {

        const data = {
          type: "getCsvList",
          token: this.functions.generateRandomAlphanumericString(16),
        };
        let param = this.functions.convertObjectToURLSearchParams(data);
        const response = await axios.post(this.path.getCsvList, param);
        if (response.data && response.data.type === "success") {
          this.$emit('fetch-csv-list', { csvData: response.data.list });
        } else {
          console.error("CSVリストの取得に失敗しました:", response.data?.message);
        }

      } catch (error) {
        console.error("CSVリストの取得中にエラーが発生しました:", error);
      }
    },
  },
  mounted() {
    this.fetchCsvList(); // コンポーネントがマウントされたらCSVリストを取得
  }
});

export default getCsvList;
