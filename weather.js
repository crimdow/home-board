/* Home Board: Weather page.
   The forecast comes from Open-Meteo (free, no account or key) through HB.loadWeather in index.html,
   which the wall panel's clock bar uses too. Location: HB.weatherAt (44130). °F and mph. */
HB.register("weather", {
  title: "Weather",

  css: `
#pg-weather .wx-place { color: var(--muted); font-size: 13px; font-weight: 700; text-align: right; line-height: 1.3; padding-top: 6px; }
#pg-weather .wx-body { display: flex; flex-direction: column; gap: 12px; padding: 12px 0 8px; }
#pg-weather .wx-card { background: var(--sheet); border-radius: 18px; padding: 14px 16px; transition: background-color .35s; }
#pg-weather .wx-now { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 12px; }
#pg-weather .wx-now > .wxi { width: 62px; height: 62px; }
#pg-weather .wx-now .sun { display: flex; flex-direction: column; gap: 8px; text-align: right; font-size: 12px; font-weight: 700; color: var(--muted); }
#pg-weather .wx-now .sun b { display: block; color: var(--ink); font-size: 16px; font-weight: 800; white-space: nowrap; }
#pg-weather .wx-now .t { font-size: 56px; font-weight: 800; letter-spacing: -2px; line-height: 1; }
#pg-weather .wx-now .c { font-size: 20px; font-weight: 800; margin-top: 4px; }
#pg-weather .wx-now .f { font-size: 14px; font-weight: 700; color: var(--muted); margin-top: 2px; }
#pg-weather .wx-stats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
#pg-weather .wx-stat { background: var(--sheet); border-radius: 14px; padding: 10px 12px; display: flex; flex-direction: column; gap: 2px; transition: background-color .35s; }
#pg-weather .wx-stat b { white-space: nowrap; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .5px; color: var(--muted); }
#pg-weather .wx-stat span { font-size: 18px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
#pg-weather .wx-stat span small { font-size: .6em; font-weight: 800; color: var(--muted); margin-left: 2px; }   /* "Moderate" stays small so it never gets cut off */
#pg-weather h2 { margin: 0 0 10px; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: .5px; color: var(--muted); }
#pg-weather .wx-hours { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; margin: 0 -4px; padding: 0 4px; }
#pg-weather .wx-hours::-webkit-scrollbar { display: none; }
#pg-weather .wx-hr { flex: 0 0 54px; display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 0; border-radius: 14px; }
#pg-weather .wx-hr.now { background: var(--accent); color: var(--on-accent); }
#pg-weather .wx-hr .h { font-size: 12px; font-weight: 800; }
#pg-weather .wx-hr .wxi { width: 28px; height: 28px; }
#pg-weather .wx-hr.now .wxi * { stroke: currentColor; }
#pg-weather .wx-hr.now .wxi .cloud { fill: none; }
#pg-weather .wx-hr .v { font-size: 17px; font-weight: 800; }
#pg-weather .wx-hr .p { font-size: 11px; font-weight: 800; color: var(--s1); min-height: 1.3em; }
#pg-weather .wx-hr.now .p { color: inherit; opacity: .85; }
#pg-weather .wx-day { display: grid; grid-template-columns: 52px 32px minmax(0, 1fr) 44px 40px; align-items: center; gap: 8px; min-height: 48px; border-bottom: 0.5px solid var(--hair); }
#pg-weather .wx-day:last-child { border-bottom: 0; }
#pg-weather .wx-day .d { font-size: 16px; font-weight: 800; }
#pg-weather .wx-day .wxi { width: 28px; height: 28px; }
#pg-weather .wx-day .c { font-size: 13.5px; font-weight: 700; color: var(--muted); min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#pg-weather .wx-day .c i { font-style: normal; color: var(--s1); }
#pg-weather .wx-day .hi { font-size: 17px; font-weight: 800; text-align: right; }
#pg-weather .wx-day .lo { font-size: 17px; font-weight: 700; color: var(--muted); text-align: right; }
#pg-weather .wx-msg { padding: 50px 0; text-align: center; color: var(--muted); font-weight: 600; }
#pg-weather .wx-msg button { margin-top: 10px; border: 0; border-radius: 10px; background: var(--chip); color: var(--ink); font: inherit; font-weight: 700; padding: 10px 16px; cursor: pointer; }

/* wall panel: the same page, sized to fit the portrait Surface without scrolling */
:root.panel #pg-weather:not([hidden]) { height: calc(100dvh - var(--phead) - var(--pbar) - 24px); overflow: clip; }   /* clip, not hidden: hidden would trap the sticky title */
:root.panel #pg-weather .wx-body { flex: 1; min-height: 0; }
:root.panel #pg-weather .wx-body > section:last-child { flex: 1; min-height: 0; display: flex; flex-direction: column; overflow: clip; }
:root.panel #pg-weather .wx-body > section:last-child .wx-day { flex: 1 1 0; min-height: 44px; }
:root.panel #pg-weather .title { display: none; }   /* the clock bar already says where you are */
:root.panel #pg-weather header { justify-content: flex-end; }
:root.panel #pg-weather .wx-place { font-size: 17px; padding-top: 6px; }
:root.panel #pg-weather .wx-body { gap: 14px; padding-top: 10px; }
:root.panel #pg-weather .wx-card { border-radius: 26px; padding: 18px 28px; }
:root.panel #pg-weather .wx-now { gap: 28px; }
:root.panel #pg-weather .wx-now > .wxi { width: 120px; height: 120px; }
:root.panel #pg-weather .wx-now .sun { font-size: 18px; gap: 14px; }
:root.panel #pg-weather .wx-now .sun b { font-size: 27px; }
:root.panel #pg-weather .wx-now .t { font-size: 92px; letter-spacing: -3px; }
:root.panel #pg-weather .wx-now .c { font-size: 32px; }
:root.panel #pg-weather .wx-now .f { font-size: 22px; margin-top: 4px; }
:root.panel #pg-weather .wx-stats { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
:root.panel #pg-weather .wx-stat { border-radius: 22px; padding: 16px 22px; gap: 4px; }
:root.panel #pg-weather .wx-stat b { font-size: 15px; }
:root.panel #pg-weather .wx-stat span { font-size: 28px; }
:root.panel #pg-weather h2 { font-size: 18px; margin-bottom: 12px; }
:root.panel #pg-weather .wx-hours { display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); gap: 10px; overflow: visible; }
:root.panel #pg-weather .wx-hr { gap: 4px; padding: 10px 0; border-radius: 18px; }   /* only "Now" gets a tile: calmer */
:root.panel #pg-weather .wx-hr.now { background: var(--accent); }
:root.panel #pg-weather .wx-hr .h { font-size: 19px; }
:root.panel #pg-weather .wx-hr .wxi { width: 40px; height: 40px; }
:root.panel #pg-weather .wx-hr .v { font-size: 27px; }
:root.panel #pg-weather .wx-hr .p { font-size: 16px; }
:root.panel #pg-weather .wx-day { grid-template-columns: 110px 52px minmax(0, 1fr) 86px 76px; gap: 16px; }
:root.panel #pg-weather .wx-day .d { font-size: 27px; }
:root.panel #pg-weather .wx-day .wxi { width: 42px; height: 42px; }
:root.panel #pg-weather .wx-day .c { font-size: 21px; }
:root.panel #pg-weather .wx-day .hi, :root.panel #pg-weather .wx-day .lo { font-size: 28px; }
`,

  mount: function (root) {
    var DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    root.innerHTML =
      '<div class="top"><header><div class="title"><h1>Weather</h1></div>' +
        '<div class="wx-place"></div></header></div>' +
      '<div class="wx-body"></div>';
    var body = root.querySelector(".wx-body"), placeEl = root.querySelector(".wx-place");

    function deg(v) { return v == null ? "--" : Math.round(v); }
    function hourLabel(s) { var h = +s.slice(11, 13); return (h % 12 || 12) + (h < 12 ? "a" : "p"); }
    function uvWord(u) { return u < 3 ? "Low" : u < 6 ? "Moderate" : u < 8 ? "High" : u < 11 ? "Very high" : "Extreme"; }
    function updated() {
      var age = HB.weatherAge();
      if (!isFinite(age)) return "";
      var mins = Math.round(age / 60000);
      return mins < 2 ? "Just updated" : mins < 60 ? "Updated " + mins + " min ago" : "Updated " + Math.round(mins / 60) + " hr ago";
    }

    function render() {
      var w = HB.weather();
      placeEl.innerHTML = HB.esc(HB.weatherAt.name) + "<br>" + updated();
      if (!w || !w.current || !w.daily || !w.hourly) {
        body.innerHTML = '<div class="wx-msg">Couldn’t load the weather.<br><button type="button">Try again</button></div>';
        body.querySelector("button").onclick = function () { body.innerHTML = '<div class="wx-msg">Loading…</div>'; HB.loadWeather(true).then(render); };
        return;
      }
      var c = w.current, d = w.daily, h = w.hourly;
      // the hour we're in, then the next ones
      var nowKey = (c.time || "").slice(0, 13), start = 0;
      for (var i = 0; i < h.time.length; i++) if (h.time[i].slice(0, 13) === nowKey) { start = i; break; }
      var count = HB.panel ? 8 : 12, hours = [];
      for (var j = start; j < Math.min(h.time.length, start + count); j++) hours.push(j);
      var rainNow = h.precipitation_probability ? h.precipitation_probability[start] : null;

      body.innerHTML =
        '<section class="wx-card wx-now">' + HB.wxIcon(c.weather_code, c.is_day) +
          '<div><div class="t">' + deg(c.temperature_2m) + '°</div>' +
          '<div class="c">' + HB.wxText(c.weather_code) + '</div>' +
          '<div class="f">Feels like ' + deg(c.apparent_temperature) + '° · H ' + deg(d.temperature_2m_max[0]) + '° L ' + deg(d.temperature_2m_min[0]) + '°</div></div>' +
          '<div class="sun"><div>Sunrise<b>' + HB.wxClock(d.sunrise[0]) + '</b></div><div>Sunset<b>' + HB.wxClock(d.sunset[0]) + '</b></div></div>' +
        '</section>' +
        '<section class="wx-stats">' +
          stat("Rain", (rainNow == null ? "--" : rainNow) + "%") + stat("Wind", deg(c.wind_speed_10m) + " mph") +
          stat("Humidity", deg(c.relative_humidity_2m) + "%") +
          stat("UV index", d.uv_index_max && d.uv_index_max[0] != null ? Math.round(d.uv_index_max[0]) + ' <small>' + uvWord(d.uv_index_max[0]) + '</small>' : "--") +
        '</section>' +
        '<section class="wx-card"><h2>Hour by hour</h2><div class="wx-hours">' +
          hours.map(function (k, n) {
            var p = h.precipitation_probability ? h.precipitation_probability[k] : null;
            return '<div class="wx-hr' + (n === 0 ? ' now' : '') + '"><span class="h">' + (n === 0 ? "Now" : hourLabel(h.time[k])) + '</span>' +
              HB.wxIcon(h.weather_code[k], h.is_day ? h.is_day[k] : 1) +
              '<span class="v">' + deg(h.temperature_2m[k]) + '°</span><span class="p">' + (p >= 20 ? p + "%" : "") + '</span></div>';
          }).join("") +
        '</div></section>' +
        '<section class="wx-card"><h2>Next 7 days</h2>' +
          d.time.map(function (t, k) {
            var day = new Date(+t.slice(0, 4), +t.slice(5, 7) - 1, +t.slice(8, 10));
            var p = d.precipitation_probability_max ? d.precipitation_probability_max[k] : null;
            return '<div class="wx-day"><span class="d">' + (k === 0 ? "Today" : DOW[day.getDay()]) + '</span>' + HB.wxIcon(d.weather_code[k], 1) +
              '<span class="c">' + HB.wxText(d.weather_code[k]) + (p >= 20 ? ' · <i>' + p + '%</i>' : '') + '</span>' +
              '<span class="hi">' + deg(d.temperature_2m_max[k]) + '°</span><span class="lo">' + deg(d.temperature_2m_min[k]) + '°</span></div>';
          }).join("") +
        '</section>';
    }
    function stat(k, v) { return '<div class="wx-stat"><b>' + k + '</b><span>' + v + '</span></div>'; }

    HB.onWeather(render);
    this.refresh = function () { HB.loadWeather().then(render); };
    this.shown = function () { HB.loadWeather().then(render); render(); };
    render();
    HB.loadWeather().then(render);
  }
});
