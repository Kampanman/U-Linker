// textFormatter.js

let TextFormatter = Vue.component("text-formatter", {
  template: `
    <div class="text-formatter">
      <v-card-text data-parts-id="exises-05-11-01" class="adjust-note-area fader">
        <p>（１）まずは次の一次処理が実行されます。</p>
        <ul>
          <li>本文内の半角スペースは、すべて除去されます。</li>
          <li>３つ以上続く「・」または「.」は、「・」３つに統一されます。</li>
          <li>次の条件のいずれにも該当しない行は、行末の改行コードを除去して次の行と連結させます。</li>
            <ul>
              <li>①行頭が●, ■, ◆, ・のいずれかである</li>
              <li>②行末が。, 」, ), ）, ?, ？のいずれかである</li>
            </ul>
        </ul><br />
        <p>（２）その上で次の二次処理が実行されます。</p>
        <ul>
          <li>次の条件のいずれにも該当しない行は、行頭に全角スペースを挿入します。</li>
            <ul>
              <li>①先頭に●, ■, ◆, ・, 全角スペースのいずれかの文字が記述されている</li>
              <li>②その行には何も記述されていない</li>
            </ul>
          <li>次の条件に該当しない行で、文字数が200文字を超えている行は、200文字に至る直前の「。」で改行します。</li>
            <ul>
              <li>①行頭が鍵括弧または丸括弧で始まり、行末が鍵括弧または丸括弧で終わっている</li>
            </ul>
        </ul>
      </v-card-text>
      <div align="center">
        <v-btn class="white-button" @click="openConfirmDialog" data-parts-id="exises-05-11-02">整形内容確認済み</v-btn>
      </div>

      <!-- 確認ダイアログ -->
      <v-dialog v-model="dialog.isModifyTextConfirmOpen" persistent max-width="500">
        <v-card>
          <v-card-title class="headline">{{ confirmDialog.title }}</v-card-title>
          <v-card-text>{{ confirmDialog.message }}</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green darken-1" text @click="submitConfirmed">はい</v-btn>
            <v-btn color="red darken-1" text @click="cancelFormatting">いいえ</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- 完了ダイアログ -->
      <v-dialog v-model="dialog.isModifyTextCompleteOpen" persistent max-width="500">
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
    initialText: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      confirmDialog: {
        title: "本文整形確認",
        message: "本文を整形してもよろしいですか？",
      },
      completeDialog: {
        title: "本文整形完了",
        message: "本文の整形が完了しました。",
      },
    }
  },
  methods: {
    openConfirmDialog() {
      // 親から渡された dialog オブジェクトのプロパティを変更して確認ダイアログを開く
      this.dialog.isModifyTextConfirmOpen = true;
    },
    submitConfirmed() {
      this.dialog.isModifyTextConfirmOpen = false; // 確認ダイアログを閉じる

      let processedText = this.initialText.replace(/ /g, ''); // 半角スペース除去
      processedText = processedText.replace(/([・.]){3,}/g, '・・・'); // 3つ以上続く「・」または「.」を「・・・」に統一

      // 行連結処理
      const lines = processedText.split('\n');
      let tempLines = [];
      let currentLine = '';
      lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        if (trimmedLine === '' && currentLine === '') {
          tempLines.push('');
          return;
        }
        currentLine += line;
        const isLastLine = index === lines.length - 1;
        const startsWithSymbol = /^[●■◆・]/.test(trimmedLine);
        const endsWithPunctuation = /[。」)）?？]$/.test(trimmedLine);
        const nextLineExists = index + 1 < lines.length;
        const nextLineStartsWithSymbol = nextLineExists && /^[●■◆・]/.test(lines[index + 1].trim());
        const nextLineIsEmpty = nextLineExists && lines[index + 1].trim() === '';
        if (startsWithSymbol || endsWithPunctuation || isLastLine || nextLineStartsWithSymbol || nextLineIsEmpty) {
          tempLines.push(currentLine);
          currentLine = '';
        }
      });
      if (currentLine) tempLines.push(currentLine);
      processedText = tempLines.join('\n');

      // 行頭スペース挿入処理
      const finalLines = processedText.split('\n').map(line => {
        if (line.trim() !== '' && !/^[●■◆・\s]/.test(line)) return '　' + line;
        return line;
      });

      // 200文字超え改行処理
      let resultLines = [];
      finalLines.forEach(line => {
        if (line.length > 200 && !(/^[「(（].*[」)）]$/.test(line))) {
          let remainingLine = line;
          while (remainingLine.length > 200) {
            let breakPoint = -1;
            const lastMaruIndex = remainingLine.lastIndexOf('。', 200);
            if (lastMaruIndex !== -1) {
              breakPoint = lastMaruIndex + 1;
            } else {
              const punctuationRegex = /[、」）)]/g;
              let lastPunctuationIndex = -1;
              let match;
              const searchRange = remainingLine.substring(0, 200);
              while ((match = punctuationRegex.exec(searchRange)) !== null) {
                lastPunctuationIndex = match.index;
              }
              breakPoint = (lastPunctuationIndex !== -1) ? lastPunctuationIndex + 1 : 200;
            }
            resultLines.push(remainingLine.substring(0, breakPoint));
            remainingLine = remainingLine.substring(breakPoint);
            if (remainingLine.length > 0 && !/^[●■◆・\s「(（]/.test(remainingLine)) remainingLine = '　' + remainingLine;
          }
          if (remainingLine.length > 0) resultLines.push(remainingLine);
        } else {
          resultLines.push(line);
        }
      });
      const formattedText = resultLines.join('\n');

      // 'formatted' イベントを発行し、整形後のテキストを親コンポーネントに渡す
      this.$emit('formatted', formattedText);

      // 完了ダイアログを表示
      this.dialog.isModifyTextCompleteOpen = true;
    },
    cancelFormatting() {
      this.dialog.isModifyTextConfirmOpen = false; // 確認ダイアログを閉じる
      this.$emit('cancelled'); // 親コンポーネントに 'cancelled' イベントを発行して整形モードを終了させる
    },
    handleCompleteDialogClose() {
      this.dialog.isModifyTextCompleteOpen = false;
      this.$emit('formatting-complete'); // 整形完了を示す 'formatting-complete' イベントを親コンポーネントに発行
    }
  },
});

export default TextFormatter;
