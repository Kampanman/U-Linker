// promptSettings.js

let promptSettings = Vue.component("prompt-settings", {
  template: `
    <v-app>
      <div v-for="(area, index) in prompts" :key="index" class="prompt-area">
        <div class="prompt-area-header" :class="{ 'all-checked': area.allChecked }">
          <label class="prompts-area-title mr-2">{{ area.title }}</label>
          <v-checkbox v-model="area.allChecked" @change="toggleAllItems(area)" class="all-check-box" label=""></v-checkbox>
          <v-btn fab small :color="area.expanded ? '' : '#8d0000'" :class="area.expanded ? 'white-button' : 'white--text'" @click="toggleExpansion(area)">
            <v-icon>{{ area.expanded ? 'mdi-minus' : 'mdi-plus' }}</v-icon>
          </v-btn>
        </div>
        <v-list v-if="area.expanded" class="prompt-area-list">
          <v-list-item v-for="(item, itemIndex) in area.items" :key="itemIndex">
            <v-list-item-action>
              <v-checkbox v-model="item.selected" :data-prompt-text="item.promptText" :data-parts-id="item.partsId" label=""></v-checkbox>
            </v-list-item-action>
            <v-list-item-content>{{ item.label }}</v-list-item-content>
          </v-list-item>
        </v-list>
      </div>
    </v-app>
  `,
  data() {
    return {
      prompts: [
        {
          title: '基本形',
          expanded: false,
          allChecked: false,
          partsId: 'common-03-08-01',
          items: [
            { label: '定義について教えてもらう', checked: false, selected: false, promptText: '- {検索語}とはどのようなものですか？', partsId: 'common-03-08-01-01' },
            { label: '例文を作ってもらう', checked: false, selected: false, promptText: '- {検索語}というワードを使って簡単な例文を作ってみてください。', partsId: 'common-03-08-01-02' },
            { label: '印象的なエピソードを教えてもらう', checked: false, selected: false, promptText: '- {検索語}にまつわる印象的なエピソードがありましたら教えてください。', partsId: 'common-03-08-01-03' },
            { label: '連想される単語をいくつか教えてもらう', checked: false, selected: false, promptText: '- {検索語}から連想される単語を３～５個挙げてください。', partsId: 'common-03-08-01-04' },
            { label: '記憶しやすいストーリー文を作ってもらう', checked: false, selected: false, promptText: '- 語呂合わせなども活用して、{検索語}を記憶しやすいストーリー文を作ってみてください。', partsId: 'common-03-08-01-05' },
          ],
        },
        {
          title: '問題・事件などネガティブなこと',
          expanded: false,
          allChecked: false,
          partsId: 'common-03-08-02',
          items: [
            { label: '発生してしまった原因を教えてもらう', checked: false, selected: false, promptText: '- {検索語}が発生してしまった原因には、どういった事が考えられますか？', partsId: 'common-03-08-02-01' },
            { label: '不利益を被った人や対象を教えてもらう', checked: false, selected: false, promptText: '- {検索語}では、どういった人や対象が何かしらの不利益を被っているといえそうですか？', partsId: 'common-03-08-02-02' },
            { label: 'なかなか解決・改善しない原因を教えてもらう', checked: false, selected: false, promptText: '- {検索語}がなかなか解決または改善しない原因には、どういった事が考えられますか？', partsId: 'common-03-08-02-03' },
            { label: '再発防止のための有効な手立てをおしえてもらう', checked: false, selected: false, promptText: '- {検索語}のようなことをまた起こさないためには、どういった事ができそうですか？', partsId: 'common-03-08-02-04' },
          ],
        },
        {
          title: '人為的にできたもの',
          expanded: false,
          allChecked: false,
          partsId: 'common-03-08-03',
          items: [
            { label: 'できた背景について教えてもらう', checked: false, selected: false, promptText: '- {検索語}ができた背景について教えてください。', partsId: 'common-03-08-03-01' },
            { label: '起きた変化や良い効果について教えてもらう', checked: false, selected: false, promptText: '- {検索語}ができたことで、どのような良い効果や反響がありましたか？', partsId: 'common-03-08-03-02' },
            { label: 'メリット／デメリットについて教えてもらう', checked: false, selected: false, promptText: '- {検索語}にはどういうメリット／デメリットがあると考えられますか？', partsId: 'common-03-08-03-03' },
            { label: '推進した代表的な人物を教えてもらう', checked: false, selected: false, promptText: '- {検索語}を推進した代表的な人物が分かる場合は教えてください。', partsId: 'common-03-08-03-04' },
          ],
        },
        {
          title: '人物',
          expanded: false,
          allChecked: false,
          partsId: 'common-03-08-04',
          items: [
            { label: 'その人の特徴を教えてもらう', checked: false, selected: false, promptText: '- {検索語}はどういう特徴のある人物といえそうですか？', partsId: 'common-03-08-04-01' },
            { label: '特徴的な実績を教えてもらう', checked: false, selected: false, promptText: '- {検索語}の打ち立てた特徴的な実績があれば教えてください。', partsId: 'common-03-08-04-02' },
            { label: '深い関係のある人物を教えてもらう', checked: false, selected: false, promptText: '- {検索語}と深い関係のある人物がいれば教えてください。', partsId: 'common-03-08-04-03' },
            { label: '利害関係のある人物や団体・組織を教えてもらう', checked: false, selected: false, promptText: '- {検索語}と利害関係のある人物や団体・組織があれば教えてください。', partsId: 'common-03-08-04-04' },
          ],
        },
        {
          title: '地域',
          expanded: false,
          allChecked: false,
          partsId: 'common-03-08-05',
          items: [
            { label: '名物や有名な特産品を教えてもらう', checked: false, selected: false, promptText: '- {検索語}はどんな名物や特産品で有名ですか？', partsId: 'common-03-08-05-01' },
            { label: '特有の文化や特徴的な古くからの風習を教えてもらう', checked: false, selected: false, promptText: '- {検索語}に特有の文化や古くからの風習、お祭りなどがあれば教えてください。', partsId: 'common-03-08-05-02' },
            { label: '歴史上特に有名な出来事を教えてもらう', checked: false, selected: false, promptText: '- {検索語}の歴史で特に有名な出来事を教えてください。', partsId: 'common-03-08-05-03' },
          ],
        },
      ],
    };
  },
  methods: {
    toggleAllItems(area) {
      area.items.forEach(item => {
        item.checked = area.allChecked;
        item.selected = area.allChecked;
      });
    },
    toggleExpansion(area) {
      area.expanded = !area.expanded;
    },
    sendPrompt() {
      this.$emit('get-phrases-array', { data: this.prompts });
    },
  },
  mounted() {
    this.sendPrompt(); // コンポーネントがマウントされたらプロンプトリストを送信
  }
});

export default promptSettings;