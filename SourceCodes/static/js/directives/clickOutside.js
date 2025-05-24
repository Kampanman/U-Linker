/**
 * v-click-outside
 * 指定された要素の外側がクリックされたときにメソッドを実行するディレクティブ
 * 例: <div v-click-outside="closeDropdown">...</div>
 */
const clickOutside = {
  bind(el, binding, vnode) {
    // イベントハンドラを定義
    el.clickOutsideEvent = function (event) {
      // el（ディレクティブが適用された要素）とその子要素以外がクリックされた場合
      if (!(el === event.target || el.contains(event.target))) {
        // v-click-outsideに指定されたメソッドを実行
        // vnode.context はコンポーネントのインスタンスを指す
        // binding.expression は渡されたメソッド名（文字列）
        if (vnode.context[binding.expression]) {
          vnode.context[binding.expression](event);
        } else {
          console.error(`Method ${binding.expression} not found on component.`);
        }
      }
    };
    // イベントリスナーを document に追加 (バブリングフェーズで検知)
    // capture: true にするとキャプチャフェーズになる
    document.addEventListener('click', el.clickOutsideEvent);
  },
  unbind(el) {
    // 要素が破棄されるときにイベントリスナーを削除
    document.removeEventListener('click', el.clickOutsideEvent);
  },
};

export default clickOutside;
