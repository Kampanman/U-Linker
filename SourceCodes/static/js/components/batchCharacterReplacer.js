// batchCharacterReplacer.js

let BatchCharacterReplacer = Vue.component("batch-character-replacer", {
  template: `
    <div class="batch-character-replacer">
      <v-row align="center" data-parts-id="exises-05-13">
        <v-col cols="12" sm="auto" class="pa-1 text-center">
          <v-card-subtitle>特定文字一括置換設定</v-card-subtitle>
        </v-col>
        <v-col cols="12" sm="auto" class="pa-1 text-center">
          <v-text-field v-model="replaceFrom" label="一括置換対象文字" data-parts-id="exises-05-13-01" hide-details dense></v-text-field>
        </v-col>
        <v-col cols="12" sm="auto" class="pa-1 text-center">
          <v-text-field v-model="replaceTo" label="一括置換後文字" data-parts-id="exises-05-13-02" hide-details dense></v-text-field>
        </v-col>
        <v-col cols="12" sm="auto" class="pa-1 text-center">
          <v-btn
            color="#8d0000"
            class="white--text"
            @click="openIsConvertStringConfirm"
            data-parts-id="exises-05-13-03"
            :disabled="replaceFrom == ''"
          >対象文字を一括置換する</v-btn>
        </v-col>
      </v-row>

      <!-- 確認ダイアログ -->
      <v-dialog v-model="dialog.isConvertStringConfirmOpen" persistent max-width="500">
        <v-card>
          <v-card-title class="headline">{{ confirmDialog.title }}</v-card-title>
          <v-card-text>{{ confirmDialog.message }}</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green darken-1" text @click="submitConfirmed">はい</v-btn>
            <v-btn color="red darken-1" text @click="dialog.isConvertStringConfirmOpen=false">いいえ</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- 完了ダイアログ -->
      <v-dialog v-model="dialog.isConvertStringCompleteOpen" persistent max-width="500">
        <v-card>
          <v-card-title class="headline">{{ completeDialog.title }}</v-card-title>
          <v-card-text>{{ completeDialog.message }}</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red darken-1" text @click="handleCompleteDialogClose">閉じる</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  `,
  props: {
    dialog: Object,
    initialText: { // 親コンポーネントから受け取る現在のテキスト
      type: String,
      required: true,
    },
  },
  data() {
    return {
      replaceFrom: '', // 置換対象文字
      replaceTo: '',   // 置換後文字
      confirmDialog: {
        title: "一括置換確認",
        message: "",
      },
      completeDialog: {
        title: "一括置換完了",
        message: "指定の文字への一括置換を完了しました。",
      },
    }
  },
  methods: {
    openIsConvertStringConfirm() {
      if (this.replaceFrom == '') return;
      const textReplaceFor = `「${this.replaceFrom}」を「${this.replaceTo}」に一括置換してもよろしいですか？`;
      const textRemove = `「${this.replaceFrom}」を一括除去してもよろしいですか？`;
      this.confirmDialog.message = (this.replaceTo == '') ? textRemove : textReplaceFor;
      this.dialog.isConvertStringConfirmOpen = true;
    },
    submitConfirmed() {
      this.dialog.isConvertStringConfirmOpen = false;
      this.batchReplace();
    },
    // 一括置換を実行し、結果を親コンポーネントに通知する
    batchReplace() {
      // 置換対象文字が入力されている場合のみ実行
      if (this.replaceFrom) {
        // String.prototype.replaceAll を使用して一括置換
        const replacedText = this.initialText.replaceAll(this.replaceFrom, this.replaceTo);
        // 'replaced' イベントを発行し、置換後のテキストを親に渡す
        this.$emit('replaced', replacedText);
        this.dialog.isConvertStringCompleteOpen = true;
      }
    },
    handleCompleteDialogClose() {
      this.dialog.isConvertStringCompleteOpen = false;
      this.$emit('formatting-complete'); // 整形完了を示す 'formatting-complete' イベントを親コンポーネントに発行
    }
  },
});

export default BatchCharacterReplacer;
