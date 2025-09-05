// selectedNoteText.js

let selectedNoteText = Vue.component("selected-note-text", {
  template: `
    <div>
      <!-- 全文表示モード -->
      <div v-if="selectedNote && selectedNote.textViewMode === 0" class="mb-3" data-parts-id="common-04-02-05-01">
        <v-row justify="center">
          <v-col cols="auto">
            <v-btn data-parts-id="common-04-02-05-01-01"
              class="white-button"
              v-if="isDoneViewNewTab"
              @click="viewNoteByNewTab()"
            >別タブで表示</v-btn>
          </v-col>
        </v-row>
        <v-row justify="center" class="mb-3">
          <v-col cols="auto">
            <v-btn
              v-if="!isDownloaded"
              @click="downloadNote(0)"
              data-parts-id="common-04-02-05-01-02"
              color="#8d0000" class="white--text"
            >ノートをダウンロード</v-btn>
          </v-col>
        </v-row>
        <div data-parts-id="common-04-02-05-01-03" class="note-body-area">
          <hr class="my-5" />
          <p v-for="line in processedTextList" :key="line.index" :id="'row_' + line.index" :class="line.class">{{ line.text }}</p>
          <hr class="my-5" />
        </div>
      </div>

      <!-- ブラインドスタートモード -->
      <div v-if="selectedNote && selectedNote.textViewMode === 1" class="mb-3" data-parts-id="common-04-02-05-02">
        <v-row justify="center" class="mb-3">
          <v-col cols="auto">
            <v-btn
              v-if="!isDownloaded"
              @click="downloadNote(1)"
              data-parts-id="common-04-02-05-02-01"
              color="#8d0000" class="white--text"
            >ノートをダウンロード</v-btn>
          </v-col>
        </v-row>
        <div data-parts-id="common-04-02-05-02-02" class="note-body-area">
          <hr class="my-5" />
          <div v-for="(line, index) in selectedNote.textList" :key="index" class="blind-line">
            <template v-if="/^[●■◆◇☆]/.test(line.text)">
              <p :id="'row_' + line.index" class="bold" data-parts-id="common-04-02-05-02-02-01" v-html="line.text || '&nbsp;'"></p>
            </template>
            <template v-else>
              <v-btn
                v-if="!blindState[index] && line.text && line.text.trim() !== ''"
                @click="revealBlindLine(index)"
                data-parts-id="common-04-02-05-02-02-02"
                color="#8d0000" small class="white--text mb-3 ml-3"
              >表示する</v-btn>
              <p v-if="line.text!=''" :id="'row_' + line.index" :class="blindState[index] ? 'fader' : 'blind'" data-parts-id="common-04-02-05-02-02-01">{{ line.text }}</p>
              <p v-else :id="'row_' + line.index" data-parts-id="common-04-02-05-02-02-01" v-html="'&nbsp;'"></p>
            </template>
          </div>
          <hr class="my-5" />
        </div>
      </div>

      <!-- 行読み上げモード -->
      <div v-if="selectedNote && selectedNote.textViewMode === 2" class="mb-3" data-parts-id="common-04-02-05-03">
        <v-row justify="center" class="mb-3">
          <v-col cols="auto">
            <v-btn data-parts-id="common-04-02-05-03-01"
              v-if="!isDownloaded"
              @click="downloadNote(2)"
              color="#8d0000" class="white--text"
            >ノートをダウンロード</v-btn>
          </v-col>
        </v-row>
        <div data-parts-id="common-04-02-05-03-02" class="note-body-area">
          <hr class="my-5" />
          <div v-for="(line, index) in selectedNote.textList" :key="index" class="speech-line d-flex align-start">
            <v-btn data-parts-id="common-04-02-05-03-02-01"
              v-if="line.text && line.text.trim() !== ''"
              icon small @click="speakText(line.text, index)"
              class="mr-2" :disabled="isSpeaking"
            ><v-icon>mdi-volume-high</v-icon></v-btn>
            <p data-parts-id="common-04-02-05-03-02-02"
              :id="'row_' + line.index"
              :class="isSpeaking && currentlySpeakingIndex === index ? 'mb-0 redtext' : 'mb-0'"
            >{{ line.text }}</p>
          </div>
          <hr class="my-5" />
        </div>
      </div>

      <!-- 範囲選択・加工モード -->
      <div v-if="selectedNote && selectedNote.textViewMode === 3" class="mb-3" data-parts-id="common-04-02-05-04">
        <v-row justify="center" class="mb-3">
          <v-col cols="auto">
            <v-btn
              v-if="!isRebuilding && selectedLines.length > 0"
              @click="createRebuildText"
              data-parts-id="common-04-02-05-04-01"
              color="#8d0000" class="white--text"
            >選択範囲で加工ノートを作成</v-btn>
          </v-col>
        </v-row>

        <div v-if="!isRebuilding" data-parts-id="common-04-02-05-04-02" class="note-body-area">
          <hr class="my-5" />
          <div v-for="(line, index) in selectedNote.textList" :key="index" class="select-line d-flex align-center my-1">
            <v-btn
              v-if="line.text"
              :data-parts-id="getSelectButtonPartsId(index)"
              :disabled="getSelectButtonDisabled(index)"
              @click="handleSelectButtonClick(index)"
              small outlined class="mr-2 mb-2 select-button"
              :color="getSelectButtonColor(index)"
            >{{ getSelectButtonText(index) }}</v-btn>
            <p :id="'row_' + line.index" data-parts-id="common-04-02-05-04-02-02" class="mb-0">{{ line.text }}</p>
          </div>
          <hr class="my-5" />
        </div>

        <div v-if="isRebuilding" data-parts-id="common-04-02-05-04-03" class="rebuild-area">
          <v-textarea
            ref="rebuildTextarea"
            v-model="rebuildText"
            label="加工ノート本文"
            data-parts-id="common-04-02-05-04-03-01"
            outlined auto-grow class="mb-3"
          ></v-textarea>
          <v-row justify="center" class="mb-3">
            <v-btn color="#8d0000"
              class="white--text mx-1"
              data-parts-id="common-04-02-05-04-03-02"
              @click="transformRebuildText('blank')"
            >虫食い化</v-btn>
            <v-btn color="#8d0000"
              class="white--text mx-1"
              data-parts-id="common-04-02-05-04-03-03"
              @click="transformRebuildText('brackets')"
            >【】で囲む</v-btn>
            <v-btn color="#8d0000"
              class="white--text mx-1"
              data-parts-id="common-04-02-05-04-03-04"
              @click="transformRebuildText('stars')"
            >☆で囲む</v-btn>
          </v-row>
          <v-row justify="center" class="mb-3">
            <v-col cols="auto">
              <v-btn
                v-if="!isDownloaded"
                @click="downloadNote(3)"
                data-parts-id="common-04-02-05-04-03-05"
                color="#8d0000" class="white--text"
              >加工ノートをダウンロード</v-btn>
            </v-col>
          </v-row>
        </div>
      </div>
    </div>
  `,
  props: {
    selectedNote: {
      type: Object,
      required: true,
    },
    isCurrentUserNoteOwner: {
      type: Boolean,
      required: true,
    },
    searchKeyword: String,
    searchAndOr: Number, // 0: AND, 1: OR
    functions: {
      type: Object,
      required: true,
    },
    path: {
      type: Object,
      required: true,
    },
    loginUser: {
      type: Object,
      required: true,
    },
  },
  data: function () {
    return {
      isDownloaded: false, // ダウンロードボタン表示制御フラグ
      isDoneViewNewTab: false, // 別タブで表示するボタン表示制御フラグ
      blindState: {}, // ブラインドスタートモードの表示状態 { index: boolean }
      selectingMode: 'start', // 'start', 'range', 'done'
      startLineIndex: -1,
      selectedLines: [], // 選択された行のインデックスを保持する配列
      isRebuilding: false, // 加工ノート作成中フラグ
      rebuildText: '', // 加工後ノート本文
      isSpeaking: false, // 音声再生中フラグ
      currentlySpeakingIndex: -1, // 現在読み上げ中の行インデックス
      containWordRows: 0, // 'bluetext' の行数を格納する
    };
  },
  computed: {
    // 全文表示モード用の加工済みテキストリスト
    processedTextList() {
      if (!this.selectedNote || !this.selectedNote.textList) return [];
      return this.selectedNote.textList.map(line => {
        const lineClass = this.getLineClass(line.text); // クラス取得を先に行う
        const processedLine = {
          ...line,
          class: lineClass // 取得したクラスを設定
        };
        return processedLine; // map関数内で処理した結果のオブジェクトを返す
      });
    },
  },
  methods: {
    getLineClass(lineText) {
      let returnClass = '';

      // 括弧の不一致チェック (最優先)
      const brackets = [['「', '」'], ['『', '』'], ['（', '）'], ['(', ')']]; // 括弧チェック (最優先)
      let unbalanced = false;
      for (const [open, close] of brackets) {
        // 正規表現で括弧をカウントする際はエスケープが必要
        const openCount = (lineText.match(new RegExp(this.escapeRegex(open), 'g')) || []).length;
        const closeCount = (lineText.match(new RegExp(this.escapeRegex(close), 'g')) || []).length;
        if (openCount !== closeCount) {
          unbalanced = true;
          break;
        }
      }
      if (unbalanced) return 'redtext'; // 赤色太字

      // 行頭記号チェック (上記に該当しない場合)
      if (/^[●■◆◇☆]/.test(lineText)) returnClass = 'bold'; // 太字

      // 検索ワードのハイライト (括弧が一致している場合)
      if (this.searchKeyword && this.searchKeyword.trim() !== '') {
        const keywords = this.searchKeyword.split(' ').filter(kw => kw.trim() !== ''); // 空のキーワードを除外
        if (keywords.length > 0) {
          const isAnd = this.searchAndOr === 0;
          let match = false;
          if (isAnd) {
            match = keywords.every(kw => lineText.includes(kw));
          } else { // OR検索
            match = keywords.some(kw => lineText.includes(kw));
          }
          if (match) returnClass = 'bluetext'; // 水色太字
        }
      }
      return returnClass;
    },
    escapeRegex(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& はマッチした部分文字列全体を意味します
    },
    revealBlindLine(index) {
      this.$set(this.blindState, index, true); // Vue.set を使ってリアクティブに変更を通知
    },
    speakText(text, index) { // index を引数に追加
      if ('speechSynthesis' in window) { // Web Speech API を使う
        if (this.isSpeaking) { // 既に再生中の場合はキャンセルする
          window.speechSynthesis.cancel();
          this.isSpeaking = false; // キャンセルした場合も状態をリセット
          this.currentlySpeakingIndex = -1;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ja-JP'; // 言語を日本語に設定
        utterance.rate = window.innerWidth < 500 ? 1.2 : 1.75; // 再生速度の設定。1.0倍が標準。画面サイズに応じて速度を変える
        this.currentlySpeakingIndex = index; // 再生中の行インデックスを設定
        this.isSpeaking = true; // 再生開始前にフラグを立てる
        
        // 再生終了時/エラー時に状態をリセット
        utterance.onend = () => { this.isSpeaking = false; this.currentlySpeakingIndex = -1; };
        utterance.onerror = () => { this.isSpeaking = false; this.currentlySpeakingIndex = -1; console.error("Speech synthesis error"); };
        window.speechSynthesis.speak(utterance);
      } else {
        alert('お使いのブラウザは音声読み上げに対応していません。');
      }
    },
    handleSelectButtonClick(index) {
      if (this.selectingMode === 'start') {
        this.startLineIndex = index;
        this.selectingMode = 'range';
      } else if (this.selectingMode === 'range') {
        if (index === this.startLineIndex) { // 単体選択
          this.selectedLines.push(index);
          this.startLineIndex = -1;
          this.selectingMode = 'start';
        } else { // 範囲終了
          const endLineIndex = index;
          const start = Math.min(this.startLineIndex, endLineIndex);
          const end = Math.max(this.startLineIndex, endLineIndex);
          for (let i = start; i <= end; i++) {
            if (!this.selectedLines.includes(i)) this.selectedLines.push(i);
          }
          this.startLineIndex = -1;
          this.selectingMode = 'start';
        }
        this.selectedLines.sort((a, b) => a - b); // 選択行をソート
      }
    },
    getSelectButtonText(index) {
      if (this.selectedLines.includes(index)) return '選択済み';
      if (this.selectingMode === 'start') return '指定開始';
      if (this.selectingMode === 'range') {
        if (index === this.startLineIndex) return '単体選択';
        if (index < this.startLineIndex) return '選択不可';
        return '範囲終了';
      }
      return '指定開始'; // デフォルト
    },
    getSelectButtonPartsId(index) {
      const base = "common-04-02-05-04-02-01";
      if (this.selectedLines.includes(index)) return `${base}-04`; // 選択済み
      if (this.selectingMode === 'start') return `${base}-01`; // 指定開始
      if (this.selectingMode === 'range') {
        if (index === this.startLineIndex) return `${base}-03`; // 単体選択
        if (index < this.startLineIndex) return `${base}-05`; // 選択不可
        return `${base}-02`; // 範囲終了
      }
      return `${base}-01`; // デフォルト
    },
    getSelectButtonDisabled(index) {
      if (this.selectedLines.includes(index)) return true; // 選択済みは無効
      if (this.selectingMode === 'range' && index < this.startLineIndex) return true; // 範囲選択中に開始より上は無効
      return false;
    },
    getSelectButtonColor(index) {
      if (this.selectedLines.includes(index)) return 'grey'; // 選択済み
      if (this.selectingMode === 'range' && index === this.startLineIndex) return 'warning'; // 単体選択
      if (this.selectingMode === 'range' && index > this.startLineIndex) return 'info'; // 範囲終了
      return 'primary'; // 指定開始 or デフォルト
    },
    createRebuildText() {
      this.rebuildText = this.selectedLines
        .map(index => this.selectedNote.textList[index]?.text || '')
        .join('\n');
      this.isRebuilding = true;
    },
    transformRebuildText(type) {
      const textarea = this.$refs.rebuildTextarea?.$refs?.input;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = this.rebuildText.substring(start, end);
      if (!selectedText) return;

      let transformedText = '';
      switch (type) {
        case 'blank':
          transformedText = '【' + '＿'.repeat(selectedText.length) + '】';
          break;
        case 'brackets':
          transformedText = `【${selectedText}】`;
          break;
        case 'stars':
          transformedText = `☆${selectedText}☆`;
          break;
        default:
          return;
      }

      // 選択範囲のみを置換
      this.rebuildText = this.rebuildText.substring(0, start) + transformedText + this.rebuildText.substring(end);

      // 選択範囲を更新後のテキストに合わせる
      this.$nextTick(() => {
        textarea.focus();
        textarea.setSelectionRange(start, start + transformedText.length);
      });
    },
    async viewNoteByNewTab() {
      try {
        const data = {
          type: "setPageToken",
          contents_id: this.selectedNote.contentsId,
          title: this.selectedNote.title,
          text: this.selectedNote.text,
          relate_notes: this.selectedNote.relateNotesAndWords,
          owner_id: this.loginUser.ownerId,
          token: this.functions.generateRandomAlphanumericString(16),
        }
        
        Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);
        let param = this.functions.convertObjectToURLSearchParams(data);

        const response = await axios.post(this.path.getSearchedDataList, param);
        if (response.data && response.data.type === "success") {
          window.open(response.data.view_url, '_blank', 'noopener,noreferrer');
          this.isDoneViewNewTab = false;
        } else {
          console.error("別タブ表示用ページトークンの設定に失敗しました:", response.data?.message); // エラーメッセージを修正
        }
      } catch (error) {
        console.error("別タブ表示用ページトークンの設定中にエラーが発生しました:", error); // エラーメッセージを修正
      }
    },
    formatDateToYmd(dateString) {
      if (!dateString) return '';
      try {
        const date = new Date(dateString);
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      } catch (e) {
        console.error("Date formatting error:", e);
        return dateString; // フォーマット失敗時は元の文字列を返す
      }
    },
    getTimestamp() {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      const h = String(now.getHours()).padStart(2, '0');
      const min = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      return `${y}${m}${d}_${h}${min}${s}`;
    },
    downloadNote(mode) {
      if (!this.selectedNote) return;

      const timestamp = this.getTimestamp();
      const title = this.selectedNote.title || 'note';
      const safeTitle = title.replace(/[/\\?%*:|"<>]/g, '-'); // ファイル名に使えない文字を置換
      let fileName = `${safeTitle}_${timestamp}.txt`;
      let content = '';

      const header = `タイトル： ${title}${mode === 3 ? '（範囲選択・加工モード利用）' : ''}\n\n` +
                    `作成者： ${this.selectedNote.createdUserName || '不明'}\n` +
                    `登録日： ${this.formatDateToYmd(this.selectedNote.created)}\n` +
                    `最終更新日： ${this.formatDateToYmd(this.selectedNote.lastUpdated)}\n\n`;
      const body = (mode === 3) ? this.rebuildText : (this.selectedNote.textList?.map(l => l.text).join('\n') || '');
      const footer = `\n\n取得元サイト： ${this.selectedNote.url || '設定なし'}\n` +
                    `${(this.isCurrentUserNoteOwner && this.selectedNote.urlSub) ? `サブリンク： ${this.selectedNote.urlSub}` : ''}`;
      content = header + body + footer;

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      if (mode === 3) fileName = `${safeTitle}_範囲選択分_${timestamp}.txt`;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(link.href);

      this.isDownloaded = true; // ダウンロードボタンを非表示にする
    },
    resetComponentState() {
      this.blindState = {};
      this.selectingMode = 'start';
      this.startLineIndex = -1;
      this.selectedLines = [];
      this.isRebuilding = false;
      this.rebuildText = '';
      this.isDownloaded = false; // ダウンロード状態もリセット
      this.isSpeaking = false; // 音声再生状態もリセット
      this.currentlySpeakingIndex = -1; // 読み上げ行インデックスもリセット
    }
  },
  watch: {
    selectedNote: {
      handler(newVal, oldVal) {
        // isDoneViewNewTab の設定
        if (newVal && newVal.contentsId) {
          // 初回表示時、またはノートIDが変更された場合
          if (!oldVal || newVal.contentsId !== oldVal.contentsId) this.isDoneViewNewTab = true;
          // textViewMode の変更では isDoneViewNewTab は変更しない
        } else { // ノートが選択解除された場合
          this.isDoneViewNewTab = false;
        }
        // ノートのIDが変わったか、表示モードが変わった場合にリセット
        if (newVal?.contentsId !== oldVal?.contentsId || newVal?.textViewMode !== oldVal?.textViewMode) {
          this.resetComponentState();
        }
        // processedTextList が再計算されるたびに containWordRows を更新し、イベントを発行
        if (newVal && newVal.textList) {
          let blueTextCount = 0;
          this.processedTextList.forEach(line => {
            if (line.class === 'bluetext') blueTextCount++;
          });
          this.containWordRows = blueTextCount;
        }
      },
      deep: true,
      immediate: true
    },
    containWordRows(newVal) {
      this.$emit('update-contain-word-rows', newVal);
    },
  },
});
Vue.nextTick(() => { // DOM更新後に実行されるようにする
  if (this && this.watch && this.selectedNote) { // thisとwatchとselectedNoteが存在するか確認
    this.watch.selectedNote.handler(this.selectedNote, null); // 初期ロード時にも containWordRows を計算・emit するため
  }
});

export default selectedNoteText;