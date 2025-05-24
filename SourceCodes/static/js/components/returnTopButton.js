// returnTopButton.js

let returnTopButton = Vue.component("return-top-button", {
  template: `<div :class="['return-top-button-container', { 'visible': isVisible }]">
      <button @click="scrollToTop" aria-label="トップへ戻る">
        <!-- 太い上矢印 (SVG) -->
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M12 4l-8 8h5v8h6v-8h5z"/>
        </svg>
      </button>
    </div>`,
  data() {
    return {
      isVisible: false,
      scrollThreshold: 500 // 500px以上スクロールで表示
    };
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll, { passive: true }); // スクロールイベントリスナーを追加
    this.handleScroll(); // 初期表示状態を設定
  },
  // コンポーネントが破棄される前に実行
  beforeDestroy() {
    window.removeEventListener('scroll', this.handleScroll); // スクロールイベントリスナーを削除
  },
  methods: {
    handleScroll() {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      this.isVisible = scrollY > this.scrollThreshold;
    },
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }
});

export default returnTopButton;