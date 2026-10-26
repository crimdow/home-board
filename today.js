/* Home Board: Today, the wall panel's quick look at the day (panel only).
   Weather at a glance, who's on drop off / pick up / dinner, today's note, plans and dinner, and tomorrow.
   It fills the screen exactly with no scrolling. Room is kept to add cards later
   (Spotify's now playing, a Home Assistant device's status): each is one more .td-card in the column. */
HB.register("today", {
  title: "Today",

  css: `
#pg-today:not([hidden]) { height: calc(100dvh - var(--phead, 0px) - var(--pbar, 84px) - 24px); overflow: clip; }
#pg-today .td { flex: 1; min-height: 0; display: flex; flex-direction: column; gap: 16px; padding-top: 6px; }
#pg-today .td-card { background: var(--sheet); border-radius: 26px; padding: 20px 26px; transition: background-color .35s; }
#pg-today .td-card h2 { margin: 0 0 12px; font-size: 17px; font-weight: 800; text-transform: uppercase; letter-spacing: .5px; color: var(--muted); display: flex; justify-content: space-between; gap: 12px; }
#pg-today .td-card h2 span { text-transform: none; letter-spacing: 0; font-weight: 700; }

/* weather at a glance */
#pg-today .td-wx { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; column-gap: 24px; row-gap: 14px; }
#pg-today .td-wx > .wxi { width: 104px; height: 104px; }
#pg-today .td-wx .t { font-size: 84px; font-weight: 800; letter-spacing: -3px; line-height: 1; }
#pg-today .td-wx .c { font-size: 26px; font-weight: 800; margin-top: 4px; }
#pg-today .td-wx .f { font-size: 19px; font-weight: 700; color: var(--muted); margin-top: 2px; }
#pg-today .td-wx .sun { display: flex; flex-direction: column; gap: 10px; text-align: right; font-size: 19px; font-weight: 700; color: var(--muted); }
#pg-today .td-wx .sun b { display: block; color: var(--ink); font-size: 24px; font-weight: 800; }
#pg-today .td-hours { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 10px; }
#pg-today .td-hr { display: flex; align-items: center; justify-content: center; gap: 8px; background: var(--bg); border-radius: 16px; padding: 8px 0; font-size: 21px; font-weight: 800; transition: background-color .35s; }
#pg-today .td-hr small { font-size: 15px; color: var(--muted); }
#pg-today .td-hr .wxi { width: 30px; height: 30px; }

/* who's on today */
#pg-today .td-who { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(0, 1fr); gap: 12px; }
#pg-today .td-col { display: flex; flex-direction: column; align-items: center; gap: 10px; }
#pg-today .td-col > b { font-size: 20px; font-weight: 700; color: var(--muted); }
#pg-today .td-col i { font-style: normal; width: 112px; height: 112px; border-radius: 56px; display: grid; place-items: center; color: #fff; font-size: 48px; font-weight: 800; }
#pg-today .td-col i.off { background: transparent; box-shadow: inset 0 0 0 3px var(--chip); }
#pg-today .td-col i svg { width: 62px; height: 62px; fill: currentColor; stroke: none; }
#pg-today .td-col span { font-size: 22px; font-weight: 800; }
#pg-today .td-note { margin-top: 16px; background: var(--bg); border-radius: 16px; padding: 12px 20px; font-size: 23px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: background-color .35s; }
#pg-today .td-home { font-size: 19px; font-weight: 800; color: var(--muted); }
#pg-today .td-none { color: var(--muted); font-size: 21px; font-weight: 600; }

/* plans and dinner */
#pg-today .td-plans { flex: 1; min-height: 0; overflow: clip; }
#pg-today .td-plan { display: flex; align-items: center; gap: 16px; min-height: 56px; border-bottom: 0.5px solid var(--hair); }
#pg-today .td-plan:last-child { border-bottom: 0; }
#pg-today .td-plan::before { content: ""; flex: none; width: 12px; height: 34px; border-radius: 6px; background: var(--pc); }
#pg-today .td-plan .tm { flex: none; width: 112px; font-size: 21px; font-weight: 800; color: var(--muted); }
#pg-today .td-plan .nm { flex: 1; min-width: 0; font-size: 25px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
#pg-today .td-plan .at { flex: none; max-width: 34%; font-size: 18px; font-weight: 700; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* tomorrow */
#pg-today .td-tmw { display: flex; align-items: center; gap: 22px; }
#pg-today .td-tmw .mini { display: flex; gap: 14px; flex: none; }
#pg-today .td-tmw .mini span { display: inline-flex; align-items: center; gap: 8px; font-size: 18px; font-weight: 700; color: var(--muted); }
#pg-today .td-tmw .mini i { font-style: normal; width: 46px; height: 46px; border-radius: 23px; display: grid; place-items: center; color: #fff; font-size: 21px; font-weight: 800; }
#pg-today .td-tmw .mini i svg { width: 26px; height: 26px; fill: currentColor; stroke: none; }
#pg-today .td-tmw p { margin: 0; flex: 1; min-width: 0; font-size: 20px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
`,

  mount: function (root) {
    var db = HB.db;
    var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var days = {}, plans = [], meals = [];
    root.innerHTML = '<div class="td"></div>';
    var box = root.querySelector(".td");

    function iso(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
    function keys() { var t = new Date(), m = new Date(t); m.setDate(t.getDate() + 1); return { t: t, m: m, today: iso(t), tomorrow: iso(m) }; }
    function fmtTime(t) { var h = +t.slice(0, 2), m = t.slice(3, 5); return (h % 12 || 12) + (m !== "00" ? ":" + m : "") + (h < 12 ? " AM" : " PM"); }
    function deg(v) { return v == null ? "--" : Math.round(v); }
    function colsFor(d) {
      var fam = HB.family(), cols = fam.columns.filter(function (c) { return c.on; });
      var weekend = d.getDay() === 0 || d.getDay() === 6;
      return weekend && !fam.weekendColumns ? [] : cols;
    }
    function bubble(v) {
      var w = HB.whoInfo(v || "");
      return w ? '<i style="background:' + HB.colorVar(w.color) + '">' + HB.whoHtml(w) + '</i>' : '<i class="off"></i>';
    }

    // ---- loading (saved copy first, then the fresh one) ----
    function daysQuery() { var k = keys(); return db.from("days").select("*").gte("date", k.today).lte("date", k.tomorrow); }
    function plansQuery() { return db.from("plans").select("*").eq("date", keys().today); }
    function mealsQuery() { return db.from("meals").select("*").eq("date", keys().today); }
    function take(kind, rows) {
      if (kind === "days") { days = {}; (rows || []).forEach(function (r) { days[r.date] = r; }); }
      else if (kind === "plans") plans = (rows || []).filter(function (p) { return !p.idea; });
      else meals = (rows || []).filter(function (m) { return !m.done; });
    }
    function load() {
      [["days", daysQuery], ["plans", plansQuery], ["meals", mealsQuery]].forEach(function (q) {
        var seen = q[1]().cached(); if (seen) take(q[0], seen);
        q[1]().then(function (r) { if (!r.error) { take(q[0], r.data); render(); } });
      });
      render();
    }
    var liveT = null;
    function soon() { clearTimeout(liveT); liveT = setTimeout(load, 400); }
    ["days", "plans", "meals"].forEach(function (t) {
      db.channel("today-" + t).on("postgres_changes", { event: "*", schema: "public", table: t }, soon).subscribe();
    });

    // ---- drawing ----
    function weatherCard() {
      var w = HB.weather(), c = w && w.current;
      if (!c || !w.daily || !w.hourly) return '<section class="td-card"><div class="td-none">Weather is on its way…</div></section>';
      var d = w.daily, h = w.hourly, nowKey = (c.time || "").slice(0, 13), start = 0;
      for (var i = 0; i < h.time.length; i++) if (h.time[i].slice(0, 13) === nowKey) { start = i; break; }
      var hours = [];
      for (var j = start + 1; j < Math.min(h.time.length, start + 7); j++) {
        var hh = +h.time[j].slice(11, 13);
        hours.push('<div class="td-hr"><small>' + (hh % 12 || 12) + (hh < 12 ? "a" : "p") + '</small>' + HB.wxIcon(h.weather_code[j], h.is_day ? h.is_day[j] : 1) + deg(h.temperature_2m[j]) + '°</div>');
      }
      var rain = h.precipitation_probability ? h.precipitation_probability[start] : null;
      return '<section class="td-card td-wx">' + HB.wxIcon(c.weather_code, c.is_day) +
        '<div><div class="t">' + deg(c.temperature_2m) + '°</div><div class="c">' + HB.wxText(c.weather_code) + '</div>' +
          '<div class="f">H ' + deg(d.temperature_2m_max[0]) + '° · L ' + deg(d.temperature_2m_min[0]) + '°' + (rain != null ? ' · ' + rain + '% rain' : '') + '</div></div>' +
        '<div class="sun"><div>Sunrise<b>' + HB.wxClock(d.sunrise[0]) + '</b></div><div>Sunset<b>' + HB.wxClock(d.sunset[0]) + '</b></div></div>' +
        '<div class="td-hours">' + hours.join("") + '</div></section>';
    }
    function whoCard(k) {
      var row = days[k.today] || {}, cols = colsFor(k.t), fam = HB.family(), note = (row.notes || "").trim();
      var home = fam.homeTag && row.home ? (row.home === "Both" ? "Everyone’s home" : (HB.whoInfo(row.home) ? HB.whoInfo(row.home).name + "’s home" : "")) : "";
      var body = cols.length ? '<div class="td-who">' + cols.map(function (c) {
        var w = HB.whoInfo(row[c.key] || "");
        return '<div class="td-col"><b>' + HB.esc(c.name) + '</b>' + bubble(row[c.key]) + '<span>' + (w ? HB.esc(w.name) : "—") + '</span></div>';
      }).join("") + '</div>' : (note ? '' : '<div class="td-none">Nothing on the grid today.</div>');
      return '<section class="td-card"><h2>' + DAYS[k.t.getDay()] + (home ? '<span class="td-home">' + HB.esc(home) + '</span>' : '') + '</h2>' + body +
        (note ? '<div class="td-note">' + HB.esc(note) + '</div>' : '') + '</section>';
    }
    function plansCard() {
      var list = plans.slice().sort(function (a, b) { return (a.start_time || "") < (b.start_time || "") ? -1 : 1; });
      var rows = list.map(function (p) {
        var cal = HB.calOf(p.cal || "");
        return '<div class="td-plan" style="--pc:' + HB.colorVar(HB.calColor(cal)) + '"><span class="tm">' + (p.start_time ? fmtTime(p.start_time) : "All day") + '</span>' +
          '<span class="nm">' + HB.esc(p.name) + '</span>' + (p.location ? '<span class="at">' + HB.esc(p.location) + '</span>' : '') + '</div>';
      });
      meals.forEach(function (m) {
        rows.push('<div class="td-plan" style="--pc:var(--s3)"><span class="tm">Dinner</span><span class="nm">' + HB.esc(m.name) + '</span></div>');
      });
      return '<section class="td-card td-plans"><h2>Plans</h2>' + (rows.length ? rows.join("") : '<div class="td-none">Nothing planned today.</div>') + '</section>';
    }
    function tomorrowCard(k) {
      var row = days[k.tomorrow] || {}, cols = colsFor(k.m), note = (row.notes || "").trim();
      var who = cols.map(function (c) { return { c: c, w: HB.whoInfo(row[c.key] || "") }; }).filter(function (x) { return x.w; });
      if (!who.length && !note) return "";
      return '<section class="td-card"><h2>Tomorrow · ' + DAYS[k.m.getDay()] + '</h2><div class="td-tmw">' +
        (who.length ? '<div class="mini">' + who.map(function (x) { return '<span><i style="background:' + HB.colorVar(x.w.color) + '">' + HB.whoHtml(x.w) + '</i>' + HB.esc(x.c.name) + '</span>'; }).join("") + '</div>' : '') +
        (note ? '<p>' + HB.esc(note) + '</p>' : '') + '</div></section>';
    }
    function render() {
      var k = keys();
      box.innerHTML = weatherCard() + whoCard(k) + plansCard() + tomorrowCard(k);
    }

    HB.onWeather(render);
    HB.onFamily(render);
    this.refresh = function () { load(); HB.loadWeather().then(render); };   // the panel calls this at midnight and every 10 minutes
    this.shown = function () { render(); };
    load(); HB.loadWeather().then(render);
  }
});
