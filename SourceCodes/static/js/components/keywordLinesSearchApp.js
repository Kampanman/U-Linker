/**
 * Vue Component: keywordLinesSearchApp.js
 * ノート・アーカイブCSV横断 キーワード該当行抽出機能 メインコンポーネント
 */

const KeywordLinesSearchApp = {
  name: 'KeywordLinesSearchApp',
  props: {
    ownerId: {
      type: Number,
      required: true,
    },
    isTeacher: {
      type: Number,
      required: true,
    },
    apiToken: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      // Step 1
      inputKeyword: '',
      confirmedKeyword: '',
      availableSources: [],
      selectedSources: [],
      limitCount: 10,
      limitOptions: [10, 50, 100, 500],
      isSearching: false,
      isLoadingSources: false,
      errorMessage: '',

      // Step 2
      hasSearched: false,
      hitRecords: [],
      checkedRecordKeys: [], // 初期値・検索直後・確定後は常に空配列
      confirmedRecords: [],

      // Step 3 & 並び替え
      showStep3: false,
      sortOrder: 'created_asc', // 'created_asc' | 'created_desc' | 'title_asc'
      copyFeedbackMessage: '',
    };
  },
  computed: {
    /**
     * 並び替えプルダウンの選択状態に連動してソートされた確定レコード配列
     */
    sortedConfirmedRecords() {
      const records = [...this.confirmedRecords];
      if (this.sortOrder === 'created_asc') {
        records.sort((a, b) => a.contentsId - b.contentsId);
      } else if (this.sortOrder === 'created_desc') {
        records.sort((a, b) => b.contentsId - a.contentsId);
      } else if (this.sortOrder === 'title_asc') {
        records.sort((a, b) => (a.title || '').localeCompare(b.title || '', 'ja'));
      }
      return records;
    },

    /**
     * 案Bフォーマットのプレーンテキスト（コピー・ダウンロード共通）
     */
    plainOutputText() {
      if (this.sortedConfirmedRecords.length === 0) {
        return '';
      }
      const lines = [`検索キーワード: ${this.confirmedKeyword}`, ''];
      this.sortedConfirmedRecords.forEach((rec, idx) => {
        lines.push(`■ ${rec.title}（出典: ${rec.sourceName}）`);
        rec.matchedLines.forEach((line) => {
          lines.push(`・${line}`);
        });
        if (idx < this.sortedConfirmedRecords.length - 1) {
          lines.push('');
        }
      });
      return lines.join('\n');
    },
  },
  methods: {
    /**
     * 複数ワード入力時、先頭1語のみを抽出
     */
    extractFirstKeyword(rawText) {
      const trimmed = (rawText || '').trim();
      if (!trimmed) return '';
      return trimmed.split(/[\s\u3000]+/)[0];
    },

    /**
     * CSVファイル一覧を既存API getCsvList.php から取得し、ulinker_notes*.csv のみを抽出
     */
    async loadAvailableSources() {
      this.isLoadingSources = true;
      try {
        const params = new URLSearchParams();
        params.append('type', 'getCsvList');
        params.append('token', this.apiToken);

        const response = await axios.post('../../server/api/getCsvList.php', params);
        const list = (response.data && response.data.list) || [];

        const filteredCsvs = list.filter(
          (name) => typeof name === 'string' && name.startsWith('ulinker_notes')
        );

        this.availableSources = [
          { value: 'ulinker_notes', label: 'DB（ulinker_notes）', type: 'DB' },
          ...filteredCsvs.map((name) => ({
            value: name,
            label: name,
            type: 'CSV',
          })),
        ];
      } catch (err) {
        console.error('Failed to load CSV sources:', err);
        // CSV取得失敗時でもDB単体は利用可能とする
        this.availableSources = [
          { value: 'ulinker_notes', label: 'DB（ulinker_notes）', type: 'DB' },
        ];
      } finally {
        this.isLoadingSources = false;
      }
    },

    /**
     * Step 1: 検索実行
     */
    async executeSearch() {
      this.errorMessage = '';
      const kw = this.extractFirstKeyword(this.inputKeyword);

      if (!kw) {
        this.errorMessage = '検索キーワードを入力してください。';
        return;
      }

      if (this.selectedSources.length < 1 || this.selectedSources.length > 4) {
        this.errorMessage = '検索対象ソースは1件以上4件以内で選択してください。';
        return;
      }

      this.isSearching = true;

      try {
        const response = await axios.post('../../server/api/getKeywordLinesList.php', {
          token: this.apiToken,
          keyword: kw,
          sources: this.selectedSources,
          limit: this.limitCount,
        });

        if (response.data && response.data.status === 'success') {
          this.confirmedKeyword = response.data.keyword;
          this.hitRecords = response.data.records || [];
          this.checkedRecordKeys = []; // 検索完了直後は必ずすべて未チェック
          this.hasSearched = true;
          this.showStep3 = false; // 再検索時は Step 3 と並び替えバーを一旦閉じる
          this.confirmedRecords = [];
        } else {
          this.errorMessage = (response.data && response.data.message) || '検索に失敗しました。';
        }
      } catch (err) {
        console.error('Search request error:', err);
        if (err.response && err.response.data && err.response.data.message) {
          this.errorMessage = err.response.data.message;
        } else {
          this.errorMessage = '通信エラーが発生しました。時間をおいて再度お試しください。';
        }
      } finally {
        this.isSearching = false;
      }
    },

    /**
     * Step 1: リセットボタン押下
     */
    resetAll() {
      this.inputKeyword = '';
      this.confirmedKeyword = '';
      this.selectedSources = [];
      this.limitCount = 10;
      this.errorMessage = '';
      this.hasSearched = false;
      this.hitRecords = [];
      this.checkedRecordKeys = [];
      this.confirmedRecords = [];
      this.showStep3 = false;
      this.sortOrder = 'created_asc';
      this.copyFeedbackMessage = '';
    },

    /**
     * Step 2: すべて選択
     */
    selectAllRecords() {
      this.checkedRecordKeys = this.hitRecords.map((r) => r.recordKey);
    },

    /**
     * Step 2: すべて解除
     */
    deselectAllRecords() {
      this.checkedRecordKeys = [];
    },

    /**
     * Step 2: 「キーワードを含む行の一覧を表示」ボタン押下
     */
    showMatchedLines() {
      if (this.checkedRecordKeys.length === 0) {
        return;
      }

      const checkedSet = new Set(this.checkedRecordKeys);
      // hitRecords の並び（contentsId 昇順）を維持して抽出
      this.confirmedRecords = this.hitRecords.filter((r) => checkedSet.has(r.recordKey));

      this.showStep3 = true;

      // 最重要仕様：確定と同時に Step 2 のチェックボックスをすべて未チェック状態へリセット
      this.checkedRecordKeys = [];

      // Step 3 表示位置へスムーズスクロール
      this.$nextTick(() => {
        const step3Elem = document.getElementById('kls-step3-section');
        if (step3Elem) {
          step3Elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    },

    /**
     * HTMLエスケープ処理（画面描画用）
     */
    escapeHtml(str) {
      if (typeof str !== 'string') return '';
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    },

    /**
     * 正規表現特殊文字のエスケープ
     */
    escapeRegex(str) {
      return (str || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    /**
     * 該当行のキーワード部分をハイライト装飾（安全なHTMLエスケープ済み）
     * ※PHP側で既にアンエスケープ済みのため、フロントでの再アンエスケープは絶対に行わない
     */
    highlightLineHtml(lineText) {
      const escapedLine = this.escapeHtml(lineText);
      const escapedKw = this.escapeHtml(this.confirmedKeyword);
      if (!escapedKw) return escapedLine;

      const regex = new RegExp('(' + this.escapeRegex(escapedKw) + ')', 'gi');
      return escapedLine.replace(regex, '<mark class="hl-keyword">$1</mark>');
    },

    /**
     * Step 3: 「表示テキストをコピー」ボタン押下
     */
    async copyResultText() {
      if (!this.plainOutputText) return;

      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(this.plainOutputText);
        } else {
          // フォールバック（古いブラウザ対応）
          const textarea = document.createElement('textarea');
          textarea.value = this.plainOutputText;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
        }

        this.copyFeedbackMessage = 'クリップボードにコピーしました！';
        setTimeout(() => {
          this.copyFeedbackMessage = '';
        }, 3000);
      } catch (err) {
        console.error('Failed to copy text:', err);
        alert('クリップボードへのコピーに失敗しました。');
      }
    },

    /**
     * Step 3: 「表示テキストをダウンロード」ボタン押下
     * ファイル名: keyword_searched_{yyyyMMdd_HHmmss}.txt
     */
    downloadResultTxt() {
      if (!this.plainOutputText) return;

      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const yyyy = now.getFullYear();
      const MM = pad(now.getMonth() + 1);
      const dd = pad(now.getDate());
      const HH = pad(now.getHours());
      const mm = pad(now.getMinutes());
      const ss = pad(now.getSeconds());
      const timestamp = `${yyyy}${MM}${dd}_${HH}${mm}${ss}`;
      const fileName = `keyword_searched_${timestamp}.txt`;

      const blob = new Blob([this.plainOutputText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
  },
  mounted() {
    this.loadAvailableSources();
  },
  template: `
    <div class="kls-container">
      <!-- エラーメッセージ通知 -->
      <div v-if="errorMessage" class="v-alert v-alert--dense elevation-1 mb-4" style="background-color: #FFEBEE; border: 1px solid #EF9A9A; padding: 12px 16px; border-radius: 6px; color: #C62828; display: flex; align-items: center; gap: 8px;">
        <span class="mdi mdi-alert-circle" style="font-size: 1.2rem;"></span>
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Step 1：キーワード検索エリア（初期表示） -->
      <section class="kls-card">
        <h2 class="kls-section-title">
          <span>1. キーワード検索</span>
        </h2>

        <!-- 検索キーワード入力欄 -->
        <div class="kls-form-group">
          <label class="kls-label" for="kls-keyword-input">
            検索キーワード <small style="color: #616161; font-weight: normal;">（スペース区切りで複数入力された場合は先頭1語のみ有効）</small>
          </label>
          <input
            id="kls-keyword-input"
            type="text"
            v-model="inputKeyword"
            class="kls-input-text"
            placeholder="検索したいキーワードを1つ入力（例: PHP, 関数, Vue）"
            @keydown.enter.prevent="executeSearch"
          />
        </div>

        <!-- 検索対象ソース選択テーブル（DB + ulinker_notes*.csv、1〜4件選択） -->
        <div class="kls-form-group">
          <label class="kls-label">
            検索対象ソース選択 <small style="color: #616161; font-weight: normal;">（1件以上〜4件以内で選択）</small>
          </label>
          <div class="kls-source-table-wrapper">
            <table class="kls-source-table">
              <thead>
                <tr>
                  <th style="width: 50px; text-align: center;">選択</th>
                  <th style="width: 80px;">種別</th>
                  <th>ソース名</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="isLoadingSources">
                  <td colspan="3" style="text-align: center; color: #757575; padding: 16px;">
                    ソース一覧を読み込み中...
                  </td>
                </tr>
                <tr v-for="source in availableSources" :key="source.value">
                  <td style="text-align: center;">
                    <input
                      type="checkbox"
                      :id="'source-' + source.value"
                      :value="source.value"
                      v-model="selectedSources"
                      :disabled="selectedSources.length >= 4 && !selectedSources.includes(source.value)"
                    />
                  </td>
                  <td>
                    <span :class="['kls-badge', source.type === 'DB' ? 'kls-badge-db' : 'kls-badge-csv']">
                      {{ source.type }}
                    </span>
                  </td>
                  <td>
                    <label :for="'source-' + source.value">
                      {{ source.label }}
                    </label>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <small style="color: #616161;">現在選択中: {{ selectedSources.length }} 件</small>
        </div>

        <!-- 最大取得件数プルダウン -->
        <div class="kls-form-group">
          <label class="kls-label" for="kls-limit-select">最大取得ノート件数</label>
          <select id="kls-limit-select" v-model.number="limitCount" class="kls-sort-select" style="min-width: 120px;">
            <option v-for="opt in limitOptions" :key="opt" :value="opt">
              {{ opt }} 件
            </option>
          </select>
        </div>

        <!-- アクションボタン（中央寄り配置） -->
        <div class="kls-btn-group kls-btn-group-center">
          <button
            type="button"
            class="kls-btn kls-btn-primary"
            :disabled="isSearching"
            @click="executeSearch"
          >
            <span v-if="isSearching" class="mdi mdi-loading mdi-spin"></span>
            <span v-else class="mdi mdi-magnify"></span>
            <span>検索</span>
          </button>
          <button
            type="button"
            class="kls-btn kls-btn-outline"
            :disabled="isSearching"
            @click="resetAll"
          >
            <span class="mdi mdi-refresh"></span>
            <span>リセット</span>
          </button>
        </div>
      </section>

      <!-- Step 2：ヒットレコード選択コーナー（検索実行後に表示） -->
      <section v-if="hasSearched" class="kls-card">
        <h2 class="kls-section-title">
          <span>2. ヒットレコード選択（{{ hitRecords.length }}件ヒット）</span>
          <span v-if="hitRecords.length > 0" style="font-size: 0.85rem; font-weight: normal; color: #424242;">
            選択中: {{ checkedRecordKeys.length }} 件
          </span>
        </h2>

        <div v-if="hitRecords.length === 0" style="padding: 20px; text-align: center; color: #757575;">
          <span class="mdi mdi-information-outline" style="font-size: 1.5rem; vertical-align: middle;"></span>
          該当するレコードが見つかりませんでした。別のキーワードでお試しください。
        </div>

        <div v-else>
          <!-- 補助操作ボタン -->
          <div class="kls-btn-group" style="margin-bottom: 12px;">
            <button type="button" class="kls-btn kls-btn-outline kls-btn-sm" @click="selectAllRecords">
              すべて選択
            </button>
            <button type="button" class="kls-btn kls-btn-outline kls-btn-sm" @click="deselectAllRecords">
              すべて解除
            </button>
          </div>

          <!-- チェックボックス付きヒットレコード一覧 -->
          <div class="kls-hit-list">
            <div
              v-for="rec in hitRecords"
              :key="rec.recordKey"
              class="kls-hit-item"
            >
              <label>
                <input
                  type="checkbox"
                  :value="rec.recordKey"
                  v-model="checkedRecordKeys"
                />
                <span :class="['kls-badge', rec.sourceType === 'DB' ? 'kls-badge-db' : 'kls-badge-csv']">
                  {{ rec.sourceName }}
                </span>
                <span style="font-weight: 600; color: #212121;">{{ rec.title }}</span>
                <small style="color: #757575; margin-left: auto;">（該当行: {{ rec.matchedLines.length }}行）</small>
              </label>
            </div>
          </div>

          <!-- 確定ボタン（最下部・中央寄り配置） -->
          <div class="kls-btn-center" style="margin-top: 16px;">
            <button
              type="button"
              class="kls-btn kls-btn-primary"
              :disabled="checkedRecordKeys.length === 0"
              @click="showMatchedLines"
            >
              <span class="mdi mdi-format-list-bulleted"></span>
              <span>キーワードを含む行の一覧を表示（{{ checkedRecordKeys.length }}件選択中）</span>
            </button>
          </div>
        </div>
      </section>

      <!-- 【中間配置】並び替えプルダウンエリア（Step 2 と Step 3 の間） -->
      <div v-if="showStep3" class="kls-sort-bar">
        <label for="kls-sort-select" class="kls-sort-label">
          <span class="mdi mdi-sort"></span> 表示並び順：
        </label>
        <select id="kls-sort-select" v-model="sortOrder" class="kls-sort-select">
          <option value="created_asc">作成-昇順</option>
          <option value="created_desc">作成-降順</option>
          <option value="title_asc">タイトル順</option>
        </select>
      </div>

      <!-- Step 3：キーワードを含む対象行・出典コーナー -->
      <section v-if="showStep3" id="kls-step3-section" class="kls-card">
        <h2 class="kls-section-title">
          <span>3. キーワードを含む対象行・出典一覧</span>
          <span style="font-size: 0.85rem; font-weight: normal; color: #424242;">
            対象ノート: {{ sortedConfirmedRecords.length }}件
          </span>
        </h2>

        <!-- 上部アクションボタンバー -->
        <div class="kls-result-actions">
          <button
            type="button"
            class="kls-btn kls-btn-sub"
            @click="copyResultText"
            title="抽出結果テキストをクリップボードにコピーします"
          >
            <span class="mdi mdi-content-copy"></span>
            <span>表示テキストをコピー</span>
          </button>
          <button
            type="button"
            class="kls-btn kls-btn-primary"
            @click="downloadResultTxt"
            title="抽出結果テキストをTXTファイルとしてダウンロードします"
          >
            <span class="mdi mdi-download"></span>
            <span>表示テキストをダウンロード</span>
          </button>
        </div>

        <!-- 抽出結果表示エリア（案Bフォーマット + キーワードハイライト） -->
        <div class="kls-result-box">
          <div style="margin-bottom: 16px; font-weight: bold; color: #0D47A1;">検索キーワード: {{ confirmedKeyword }}</div>
          <div
            v-for="(rec, rIdx) in sortedConfirmedRecords"
            :key="rec.recordKey"
            :style="{ marginBottom: rIdx < sortedConfirmedRecords.length - 1 ? '16px' : '0' }"
          >
            <div style="font-weight: 700; color: #1565C0; margin-bottom: 4px;">■ {{ rec.title }}（出典: {{ rec.sourceName }}）</div>
            <div
              v-for="(line, lIdx) in rec.matchedLines"
              :key="lIdx"
              style="padding-left: 4px;"
            >・<span v-html="highlightLineHtml(line)"></span></div>
          </div>
        </div>
      </section>

      <!-- コピー完了トースト通知 -->
      <div v-if="copyFeedbackMessage" class="kls-toast">
        <span class="mdi mdi-check-circle" style="font-size: 1.2rem;"></span>
        <span>{{ copyFeedbackMessage }}</span>
      </div>
    </div>
  `,
};

export default KeywordLinesSearchApp;
