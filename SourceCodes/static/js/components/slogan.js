// slogan.js
let slogan = Vue.component("slogan", {
  template: `<div class="slogan" align="center" data-parts-id="common-02-exises-01">
              <h3 class="sloganForUser" v-if="loginUser.userName!=''">
                <span v-text="'グランドマスター・' + loginUser.userName + ' よ'" v-if="loginUser.isMaster==1"></span>
                <span v-text="loginUser.userName + ' よ'" v-else></span>
              </h3>
              <h3 class="sloganSub">
                <span>ナニゴトも　それ単体で　記憶すな</span><br />
                <span>他事詰め込みゃ　ヌケるが　オチだ</span>
              </h3>
              <h2 class="sloganMain">
                <span v-if="loginUser.isTeacher==1">記憶とともに在らん事を</span>
                <span v-else>丈夫な根を張る 記憶を つくろう</span>
              </h2>
            </div>`,
  props: {
    loginUser: {
      type: Object,
      required: true,
    },
  },
  data: function () {
    return {
      //
    };
  },
  created: function () {
    this.init();
  },
  methods: {
    // 画面初期表示処理
    async init() {
      //
    },
  },
});

export default slogan;
