// archiveVideoUpdateForm.js

let archiveVideoUpdateForm = Vue.component("archive-video-update-form", {
  template: `
    <div v-if="isVisible">
      <v-card class="mt-4 pa-4 rounded-card fader" color="#efebde" outlined>
        <v-card-title class="headline">
          <span class="area-title">CSVビデオ情報更新フォーム</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field required
                  v-model="form.title"
                  label="タイトル"
                  maxlength="100"
                  counter="100"
                  data-parts-id="exises-07-01"
                  :data-contents-id="form.contentsId || ''"
                ></v-text-field>
                <p class="valid-errors" v-if="validError.requiredTitle" @click="validError.requiredTitle=false">{{ validError.message.required }}</p>
                <p class="valid-errors" v-if="validError.invalidTitleChars" @click="validError.invalidTitleChars=false">{{ validError.message.invalidTitleChars }}</p>
              </v-col>
              <v-col cols="12">
                <p class="valid-errors" v-if="validError.titleMissingRequiredChars" @click="validError.titleMissingRequiredChars=false">{{ validError.message.titleMissingRequiredChars }}</p>
                <v-text-field required
                  v-model="form.url"
                  label="URL"
                  data-parts-id="exises-07-02"
                ></v-text-field>
                <p class="valid-errors" v-if="validError.requiredUrl" @click="validError.requiredUrl=false">{{ validError.message.required }}</p>
                <p class="valid-errors" v-if="validError.invalidUrlFormat" @click="validError.invalidUrlFormat=false">{{ validError.message.invalidUrlFormat }}</p>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="form.tags"
                  label="タグワード (カンマ区切り)"
                  maxlength="100"
                  counter="100"
                  data-parts-id="exises-07-03"
                ></v-text-field>
                <p class="valid-errors" v-if="validError.invalidTagChars" @click="validError.invalidTagChars=false">{{ validError.message.invalidTagChars }}</p>
                <p class="valid-errors" v-if="validError.tagsMissingRequiredChars" @click="validError.tagsMissingRequiredChars=false">{{ validError.message.tagsMissingRequiredChars }}</p>
              </v-col>
              <v-col cols="12" sm="3">
                <v-select required
                  v-model="form.publicity"
                  :items="publicityItems"
                  item-text="text"
                  item-value="value"
                  label="公開設定"
                  data-parts-id="exises-07-04-01"
                ></v-select>
                <p class="valid-errors" v-if="validError.requiredPublicity" @click="validError.requiredPublicity=false">{{ validError.message.requiredSelect }}</p>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions class="d-flex flex-column flex-sm-row justify-sm-center align-center pa-2">
          <v-btn
            v-if="isDownloadButtonVisible"
            data-parts-id="exises-13-01"
            color="#8d0000" class="white--text my-1 mx-sm-2"
            :disabled="!isDownloadButtonActive"
            @click="downloadCsvRowData"
          >CSV行データをダウンロード</v-btn>
          <v-btn
            data-parts-id="exises-13-02"
            class="white-button my-1 mx-sm-2"
            @click="resetForm"
          >リセット</v-btn>
        </v-card-actions>
      </v-card>
    </div>
  `,
  props: {
    loginUser: Object,
    functions: Object,
    videoData: Object, // 編集対象のビデオデータ
    isVisible: Boolean, // フォームの表示状態
  },
  data() {
    return {
      form: {},
      initialFormState: {},
      isDownloadButtonVisible: false,
      publicityItems: [
        { text: "公開", value: 1 },
        { text: "講師にのみ公開", value: 2 },
        { text: "非公開", value: 0 },
      ],
      validError: {
        requiredTitle: false,
        requiredUrl: false,
        requiredPublicity: false,
        invalidTitleChars: false,
        invalidTagChars: false,
        invalidUrlFormat: false,
        titleMissingRequiredChars: false,
        tagsMissingRequiredChars: false,
        message: {
          required: '入力必須項目です。',
          requiredSelect: '選択必須項目です。',
          invalidTitleChars: "タイトルに使用できない文字が含まれています。",
          invalidTagChars: "タグに使用できない文字が含まれています。",
          invalidUrlFormat: "有効なYouTube動画のURL形式ではありません。",
          titleMissingRequiredChars: "タイトルには有効な文字（半角英数字、全角英数字、日本語文字のいずれか）を含めてください。",
          tagsMissingRequiredChars: "タグ（入力がある場合）には有効な文字（半角英数字、全角英数字、日本語文字のいずれか）を含めてください。",
        }
      },
      validationRules: {
        titleRegex: /(?=.*[a-zA-Z0-9ａ-ｚＡ-Ｚ０-９\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF々].*[a-zA-Z0-9ａ-ｚＡ-Ｚ０-９\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF々])/,
        tagRegex: /(?=.*[a-zA-Z0-9ａ-ｚＡ-Ｚ０-９\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF々].*[a-zA-Z0-9ａ-ｚＡ-Ｚ０-９\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF々])/,
        youtubeRegex: /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+(&.*)?$/,
      },
    };
  },
  computed: {
    isDownloadButtonActive() {
      return !!(this.form.title && this.form.url);
    }
  },
  watch: {
    videoData: {
      handler(newVal) {
        if (newVal) {
          this.form = JSON.parse(JSON.stringify(newVal));
          this.initialFormState = JSON.parse(JSON.stringify(newVal));
          this.resetValidationErrors();
        }
      },
      immediate: true,
      deep: true,
    },
    isVisible(newVal) {
      if (newVal) {
        this.isDownloadButtonVisible = true;
        if (this.videoData) { // isVisibleがtrueになった時にvideoDataが既に存在すればフォームを初期化
            this.form = JSON.parse(JSON.stringify(this.videoData));
            this.initialFormState = JSON.parse(JSON.stringify(this.videoData));
        }
        this.resetValidationErrors();
      }
    }
  },
  methods: {
    formatTimestampForFilename(date = new Date()) {
      const y = date.getFullYear();
      const m = ('0' + (date.getMonth() + 1)).slice(-2);
      const d = ('0' + date.getDate()).slice(-2);
      const h = ('0' + date.getHours()).slice(-2);
      const mi = ('0' + date.getMinutes()).slice(-2);
      const s = ('0' + date.getSeconds()).slice(-2);
      return `${y}${m}${d}_${h}${mi}${s}`;
    },
    _escapeForCsv(str) {
      if (str === null || str === undefined) return '';
      str = String(str);
      return str.replace(/"/g, '""');
    },
    downloadCsvRowData() {
      if (!this.doValidationForDownload()) return;

      const now = new Date();
      const timestamp = this.functions.formatDateTime(now);
      const timestampForFilename = this.formatTimestampForFilename(now);

      const titleForFile = this.form.title
        ? this.form.title.replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\uFF10-\uFF19\uFF21-\uFF3A\uFF41-\uFF5A-]+/g, '_')
        : 'untitled';
      const filename = `csv-row_${titleForFile}_${timestampForFilename}.txt`;
      const escapeCsv = this._escapeForCsv;

      const tagsCsvValue = (this.form.tags == null || this.form.tags == 'NULL' || this.form.tags == '')
        ? 'NULL'
        : `"${escapeCsv(this.functions.escapeText(this.form.tags || ''))}"`;

      const dataToJoin = [
        `"${escapeCsv(this.form.contentsId)}"`,
        `"${escapeCsv(this.functions.escapeText(this.form.title))}"`,
        `"${escapeCsv(this.form.url)}"`,
        tagsCsvValue,
        `"${escapeCsv(this.form.publicity)}"`,
        `"${escapeCsv(this.form.created + ' ' + this.form.createdTime)}"`,
        `"${escapeCsv(timestamp)}"`,
        `"${escapeCsv(this.loginUser.ownerId)}"`,
      ];
      const fileContent = dataToJoin.join(',');

      const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8;' });
      const link = document.createElement("a");
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        alert("お使いのブラウザでは直接ダウンロードがサポートされていません。");
      }
      this.isDownloadButtonVisible = false;
    },
    resetForm() {
      this.form = JSON.parse(JSON.stringify(this.initialFormState));
      this.resetValidationErrors();
      this.isDownloadButtonVisible = true;
    },
    resetValidationErrors() {
      this.validError.requiredTitle = false;
      this.validError.requiredUrl = false;
      this.validError.requiredPublicity = false;
      this.validError.invalidTitleChars = false;
      this.validError.invalidTagChars = false;
      this.validError.invalidUrlFormat = false;
      this.validError.titleMissingRequiredChars = false;
      this.validError.tagsMissingRequiredChars = false;
    },
    doValidationForDownload() {
      this.resetValidationErrors(); // バリデーション前にエラーをリセット
      let isValid = true;

      if (!this.form.title) {
        this.validError.requiredTitle = true;
        isValid = false;
      }
      if (!this.form.url) {
        this.validError.requiredUrl = true;
        isValid = false;
      }
      if (this.form.publicity === undefined || this.form.publicity === null) {
        this.validError.requiredPublicity = true;
        isValid = false;
      }

      // タイトルの文字種チェック
      if (this.form.title && !this.validationRules.titleRegex.test(this.form.title)) {
        this.validError.invalidTitleChars = true;
        isValid = false;
      }

      // タイトルの必須文字チェック
      const containsValidChars = (str) => {
        if (!str) return false; // 空文字列はNG
        return /[a-zA-Z0-9\uFF10-\uFF19\uFF21-\uFF3A\uFF41-\uFF5A\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(str);
      };
      if (this.form.title && !containsValidChars(this.form.title)) {
        this.validError.titleMissingRequiredChars = true;
        isValid = false;
      }

      // タグの文字種＆必須文字チェック (入力がある場合のみ)
      if (this.form.tags && !this.validationRules.tagRegex.test(this.form.tags)) {
        this.validError.invalidTagChars = true;
        isValid = false;
      }
      const tagsValue = this.form.tags ? this.form.tags.replace(/,/g, '') : '';
      if (tagsValue && !containsValidChars(tagsValue)) {
        this.validError.tagsMissingRequiredChars = true;
        isValid = false;
      }

      // URL形式チェック
      if (this.form.url && !this.validationRules.youtubeRegex.test(this.form.url)) {
        this.validError.invalidUrlFormat = true;
        isValid = false;
      }
      return isValid;
    }
  },
  mounted() {
    this.isDownloadButtonVisible = true;
  },
});

export default archiveVideoUpdateForm;
