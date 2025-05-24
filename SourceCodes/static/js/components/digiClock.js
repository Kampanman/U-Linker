// digiClock.js
let digiClock = Vue.component("digi-clock", {
  template: `<div class="container clockArea" data-parts-id="common-02-01">
    <div class="clock">
      <p class="clock-date" style="font-size: 20px;" v-text="clockDate"></p>
      <p class="clock-time" style="font-size: 50px;" v-text="clockTime"></p>
    </div>
  </div>`,
  mounted: function () {
    this.clockMover();
  },
  data: function () {
    return {
      clockDate: "",
      clockTime: "",
    };
  },
  methods: {
    clockMover() {
      const clock = () => {
        const d = new Date(); // 現在の日時・時刻の情報を取得
      
        let year = d.getFullYear(); // 年を取得
        let month = d.getMonth() + 1; // 月を取得
        let date = d.getDate(); // 日を取得
        let dayNum = d.getDay(); // 曜日を取得
        const weekday = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
        let day = weekday[dayNum];
        let hour = d.getHours(); // 時を取得
        let min = d.getMinutes(); // 分を取得
        let sec = d.getSeconds(); // 秒を取得
      
        // 1桁の場合は0を足して2桁にする
        month = month < 10 ? "0" + month : month;
        date = date < 10 ? "0" + date : date;
        hour = hour < 10 ? "0" + hour : hour;
        min = min < 10 ? "0" + min : min;
        sec = sec < 10 ? "0" + sec : sec;
      
        // 日付・時刻の文字列を作成して出力
        this.clockDate = `${year}.${month}.${date} ${day}`;
        this.clockTime = `${hour}:${min}:${sec}`;
      };
      setInterval(clock, 1000); // 1秒ごとにclock関数を呼び出す
    },
  },
});

export default digiClock;
