/**
 * 共通関数をまとめたオブジェクト
 */
const commonFunctions = {
  /**
   * 日時フォーマット関数 (YYYY-MM-DD HH:MM:SS)
   * @param {string | Date} dateTimeString - フォーマットする日時文字列またはDateオブジェクト
   * @returns {string} フォーマットされた日時文字列、またはエラー時は空文字
   */
  formatDateTime: (dateTimeString) => {
    // 入力がnullまたはundefinedの場合は空文字を返す
    if (dateTimeString == null) return '';

    try {
      // Dateオブジェクトを生成
      const date = new Date(dateTimeString);

      // Dateオブジェクトが有効かチェック
      if (isNaN(date.getTime())) {
        console.warn("Invalid date string or object:", dateTimeString);
        return ''; // 無効な場合は空文字を返す
      }

      // 各要素を取得し、padStartでゼロ埋め
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const HH = String(date.getHours()).padStart(2, '0');
      const MM = String(date.getMinutes()).padStart(2, '0');
      const SS = String(date.getSeconds()).padStart(2, '0');

      // 指定されたフォーマットで文字列を組み立てて返す
      return `${yyyy}-${mm}-${dd} ${HH}:${MM}:${SS}`;
    } catch (e) {
      // その他の予期せぬエラーが発生した場合
      console.error("Error formatting date:", e);
      return ''; // エラー時も空文字を返す
    }
  },

  /**
   * 指定された桁数のランダムな半角英数字文字列を生成する関数
   *
   * @param {number} length 生成する文字列の桁数
   * @returns {string} 生成されたランダムな半角英数字文字列
   * @throws {Error} lengthが数値でない場合、または0以下の場合にエラーをスロー
   */
  generateRandomAlphanumericString: (length) => {
    if (typeof length !== 'number' || length <= 0) {
      throw new Error('lengthは正の数値である必要があります。');
    }
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  },
  /**
   * 指定された秒数後に画面をリロードする関数
   *
   * @param {number} seconds リロードまでの秒数
   * @throws {Error} secondsが数値でない場合、または0以下の場合にエラーをスロー
   */
  reloadPageAfterDelay: (seconds) => {
    if (typeof seconds !== 'number' || seconds <= 0) {
      throw new Error('secondsは正の数値である必要があります。');
    }
    setTimeout(() => location.reload(), seconds * 1000); // 秒をミリ秒に変換
  },
  /**
   * テキスト中のエスケープ文字列を変換する関数
   *
   * @param {string} text エスケープ文字を変換する対象テキスト
   * @returns {string} エスケープ処理されたテキスト
   * @throws {Error} textが文字列でない場合にエラーをスロー
   *  */
  escapeText: (text) => {
    if (typeof text !== 'string') {
      throw new TypeError('textは文字列型である必要があります。');
    }
    const escapeMap = {
      "'": "&#39;",
      '"': "&quot;",
      ",": "&com;",
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      " ": "&nbsp;",
      "¥": "&yen;",
      "©": "&copy;",
    };
    return text.replace(/['",&<> ¥©]/g, (match) => escapeMap[match]);
  },
  /**
   * テキスト中のHTMLエスケープされた文字列を元の文字に変換する関数
   *
   * @param {string} text HTMLエスケープされた文字列を含むテキスト
   * @returns {string} エスケープが解除されたテキスト
   * @throws {TypeError} textが文字列型でない場合にTypeErrorをスロー
   */
  unescapeText: (text) => {
    if (typeof text !== 'string') {
      throw new TypeError('textは文字列型である必要があります。');
    }
    const unescapeMap = {
      "&#39;": "'",
      "&quot;": '"',
      "&com;": ",",
      "&amp;": "&",
      "&lt;": "<",
      "&gt;": ">",
      "&nbsp;": " ",
      "&yen;": "¥",
      "&copy;": "©",
    };
    // 正規表現を動的に生成
    const regex = new RegExp(Object.keys(unescapeMap).join('|'), 'g');
    return text.replace(regex, (match) => unescapeMap[match]);
  },
  /**
   * オブジェクトをURLSearchParamsに変換する関数
   *
   * @param {object} data 変換するオブジェクト
   * @returns {URLSearchParams} 変換されたURLSearchParamsオブジェクト
   * @throws {TypeError} dataがオブジェクトでない場合にTypeErrorをスロー
   */
  convertObjectToURLSearchParams: (data) => {
    if (typeof data !== 'object' || data === null) {
      throw new TypeError('dataはオブジェクトである必要があります。');
    }
    let param = new URLSearchParams();
    Object.keys(data).forEach(function(key) {
      param.append(key, this[key]);
    }, data);
    return param;
  },
};

export default commonFunctions;