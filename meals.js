/* Home Board: Meals page. Loaded by index.html, which provides the sign-in, tab bar,
   theme, HB.db (Supabase), HB.toast and the shared swipe / undo helpers. */
HB.register("meals", {
  title: "Meals",

  css: "#pg-meals header { display: flex; align-items: center; justify-content: space-between; padding: 4px 0 0; }\n#pg-meals h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.4px; line-height: 1.1; }\n#pg-meals .count { color: var(--muted); font-size: 14px; font-weight: 600; margin-left: 8px; }\n#pg-meals .nav button {\n  width: 36px; height: 36px; border-radius: 50%; border: 0; background: var(--chip); color: var(--ink);\n  display: grid; place-items: center; cursor: pointer;\n}\n#pg-meals .nav svg { width: 18px; height: 18px; }\n#pg-meals .cols {\n  display: grid; grid-template-columns: 1fr 120px 46px;\n  padding: 8px 0 6px; border-bottom: 0.5px solid var(--hair);\n  font-size: 13px; font-weight: 700; color: var(--muted);\n}\n#pg-meals .cols span:nth-child(2) { text-align: center; }\n#pg-meals .cols span:nth-child(3) { text-align: center; }\n#pg-meals .add { display: none; gap: 8px; padding: 10px 0; border-bottom: 0.5px solid var(--hair); }\nbody.editing #pg-meals .add { display: flex; }\n#pg-meals .add input {\n  flex: 1; border: 0; border-radius: 10px; background: var(--field); color: var(--ink);\n  font: inherit; font-size: 16px; padding: 9px 12px; min-width: 0;\n}\n#pg-meals .add input:focus { outline: 2px solid var(--ben); }\n#pg-meals .add button[type=\"submit\"] {\n  border: 0; border-radius: 10px; background: var(--ben); color: #fff;\n  font: inherit; font-weight: 700; font-size: 15px; padding: 0 16px; cursor: pointer;\n}\n#pg-meals .item {\n  display: grid; grid-template-columns: 1fr 120px 46px; align-items: center;\n  min-height: 52px; padding: 6px 0; border-bottom: 0.5px solid var(--hair);\n}\n#pg-meals .item .main { appearance: none; border: 0; background: none; color: inherit; font: inherit; text-align: left; padding: 4px 8px 4px 0; cursor: pointer; }\n#pg-meals .item .name { font-size: 17px; font-weight: 650; line-height: 1.25; }\n#pg-meals .item .note { font-size: 14px; color: var(--muted); line-height: 1.3; margin-top: 2px; white-space: pre-wrap; }\n#pg-meals .check {\n  justify-self: center; width: 30px; height: 30px; border-radius: 15px; border: 2px solid var(--muted);\n  background: none; cursor: pointer; display: grid; place-items: center; padding: 0;\n  transition: background-color .15s, border-color .15s, transform .12s;\n}\n#pg-meals .check:active { transform: scale(.9); }\n#pg-meals .check svg { width: 16px; height: 16px; stroke: #fff; stroke-width: 3; fill: none; stroke-linecap: round; stroke-linejoin: round; opacity: 0; }\n#pg-meals .item.done .check { background: var(--both); border-color: var(--both); }\n#pg-meals .item.done .check svg { opacity: 1; }\n#pg-meals .item.done .name { text-decoration: line-through; color: var(--muted); font-weight: 500; }\n#pg-meals .item.done .store, #pg-meals .item.done .note { opacity: .6; }\n#pg-meals .got { display: flex; align-items: center; justify-content: space-between; margin-top: 22px; padding-bottom: 4px; border-bottom: 0.5px solid var(--hair); }\n#pg-meals .got h2 { margin: 0; font-size: 13px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .4px; }\n#pg-meals .got button { border: 0; background: none; color: var(--ash); font: inherit; font-size: 14px; font-weight: 700; cursor: pointer; padding: 6px 0; display: none; }\nbody.editing #pg-meals .got button { display: block; }\n#pg-meals .empty { color: var(--muted); text-align: center; padding: 28px 0; font-size: 15px; }\nbody.readonly #pg-meals .main, body.readonly #pg-meals .check { pointer-events: none; }\n#pg-meals .item .store {\n  justify-self: center; appearance: none; border: 0; cursor: pointer; font-family: inherit;\n  font-size: 13px; font-weight: 700; color: var(--muted); background: var(--chip);\n  border-radius: 14px; padding: 6px 10px; max-width: 118px;\n  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;\n  transition: transform .12s, background-color .15s;\n}\n#pg-meals .item .store:active { transform: scale(.94); }\n#pg-meals .item .store.set { background: var(--ink); color: var(--bg); }\n#pg-meals .item .store:not(.set) { width: 46px; height: 28px; padding: 0; }\nbody.readonly #pg-meals .store { pointer-events: none; }\n#pg-meals .shop { width: 17px; height: 17px; stroke: currentColor; fill: none; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; display: block; margin: 0 auto; }\n#pg-meals .item .store:not(.set) { color: var(--muted); }\n#pg-meals .filterbar { display: flex; padding: 8px 0 2px; }\n#pg-meals .fpill {\n  appearance: none; border: 0; cursor: pointer; font-family: inherit;\n  font-size: 14px; font-weight: 700; padding: 6px 13px; border-radius: 15px;\n  background: var(--chip); color: var(--muted);\n  transition: background-color .15s, transform .12s;\n}\n#pg-meals .fpill:active { transform: scale(.95); }\n#pg-meals .fpill.on { background: var(--ink); color: var(--bg); }\n#pg-meals .fnone { display: inline-flex; align-items: center; gap: 6px; }\n#pg-meals .fnone .shop { margin: 0; width: 15px; height: 15px; }\n#pg-meals #hideBtn.on { background: var(--ink); color: var(--bg); }\n#pg-meals .nav { display: flex; gap: 8px; }\n#pg-meals #gear { display: none; }\nbody.editing #pg-meals #gear { display: grid; }\n#pg-meals .slist { display: flex; flex-direction: column; gap: 8px; max-height: 45vh; overflow-y: auto; }\n#pg-meals .srow { display: flex; gap: 8px; align-items: center; }\n#pg-meals .srow input { flex: 1; }\n#pg-meals .sdot { flex: 0 0 14px; height: 14px; border-radius: 7px; }\n#pg-meals .srow .mv, #pg-meals .srow .x {\n  flex: 0 0 38px; height: 38px; border: 0; border-radius: 10px; background: var(--chip);\n  color: var(--ink); font: inherit; font-size: 18px; font-weight: 700; cursor: pointer; display: grid; place-items: center;\n}\n#pg-meals .srow .x { color: var(--ash); }\n#pg-meals .srow .mv:disabled { opacity: .3; }\n#pg-meals .sheet h3 { margin: 0 0 12px; font-size: 20px; font-weight: 700; }\n#pg-meals .sheet .addstore { display: flex; gap: 8px; margin-top: 12px; }\n#pg-meals .sheet .addstore input { flex: 1; }\n#pg-meals .sheet .addstore button { border: 0; border-radius: 10px; background: var(--ink); color: var(--bg); font: inherit; font-weight: 700; padding: 0 16px; cursor: pointer; }\n#pg-meals .sheet-bg { position: fixed; inset: 0; background: rgba(0,0,0,.35); opacity: 0; pointer-events: none; transition: opacity .2s; z-index: 9; }\n#pg-meals .sheet-bg.show { opacity: 1; pointer-events: auto; }\n#pg-meals .sheet {\n  position: fixed; left: 50%; bottom: 0; transform: translate(-50%, 120%); z-index: 10;\n  width: 100%; max-width: 500px; background: var(--sheet); border-radius: 20px 20px 0 0;\n  padding: 20px 18px calc(20px + env(safe-area-inset-bottom, 0px));\n  transition: transform .25s cubic-bezier(.32,.72,0,1); box-shadow: 0 -8px 40px rgba(0,0,0,.18);\n}\n#pg-meals .sheet.show { transform: translate(-50%, 0); }\n#pg-meals .sheet label { display: block; font-size: 13px; font-weight: 700; color: var(--muted); margin: 12px 0 6px; }\n#pg-meals .sheet label:first-child { margin-top: 0; }\n#pg-meals .sheet input, #pg-meals .sheet textarea {\n  width: 100%; border: 0; border-radius: 10px; background: var(--field); color: var(--ink);\n  font: inherit; font-size: 16px; padding: 10px 12px; resize: none;\n}\n#pg-meals .sheet input:focus, #pg-meals .sheet textarea:focus { outline: 2px solid var(--ben); }\n#pg-meals .sheet textarea { min-height: 76px; }\n#pg-meals .spick {\n  appearance: none; border: 0; cursor: pointer; font-family: inherit;\n  font-size: 15px; font-weight: 700; border-radius: 16px; padding: 8px 16px;\n  min-width: 64px; min-height: 36px; background: var(--chip); color: var(--ink);\n  transition: transform .12s, background-color .15s;\n}\n#pg-meals .spick:active { transform: scale(.95); }\n#pg-meals .addpick { min-width: 54px; min-height: 0; font-size: 13px; padding: 0 12px; border-radius: 10px; max-width: 110px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n#pg-meals .spick.set { background: var(--ink); color: var(--bg); }\n#pg-meals .stores { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }\n#pg-meals .stores button {\n  border: 0; border-radius: 14px; background: var(--chip); color: var(--ink);\n  font: inherit; font-size: 14px; font-weight: 600; padding: 5px 12px; cursor: pointer;\n}\n#pg-meals .stores button.on { background: var(--ink); color: var(--bg); }\n#pg-meals .sheet .row { display: flex; gap: 10px; margin-top: 18px; }\n#pg-meals .sheet .row button { flex: 1; border: 0; border-radius: 12px; font: inherit; font-size: 16px; font-weight: 700; padding: 12px; cursor: pointer; }\n#pg-meals .sheet .del { background: var(--chip); color: var(--ash); }\n#pg-meals .sheet .done { background: var(--ink); color: var(--bg); }\n#pg-meals .sheet h2 { margin: 0 0 4px; font-size: 22px; font-weight: 700; letter-spacing: -0.3px; }\n#pg-meals .sheet .sub { margin: 0 0 16px; color: var(--muted); font-size: 15px; }\n#pg-meals .sheet input {\n  width: 100%; border: 0; border-radius: 12px; background: var(--field); color: var(--ink);\n  font: inherit; font-size: 17px; padding: 14px; margin-bottom: 10px;\n}\n#pg-meals .sheet input:focus { outline: 2px solid var(--ben); outline-offset: 0; }\n#pg-meals .sheet .go {\n  width: 100%; border: 0; border-radius: 12px; background: var(--ink); color: var(--bg);\n  font: inherit; font-size: 17px; font-weight: 700; padding: 14px; cursor: pointer;\n}\n#pg-meals .sheet .go:disabled { opacity: .5; }\n#pg-meals .sheet .cancel { display: block; width: 100%; margin-top: 10px; background: none; border: 0; color: var(--muted); font: inherit; font-size: 15px; cursor: pointer; }\n#pg-meals .sheet .err { color: var(--ash); font-size: 15px; min-height: 1.4em; margin: 0 0 6px; }\n#pg-meals .sheet form, #pg-meals form.sheet { margin: 0; }\n#pg-meals .sheet input[type=email], #pg-meals .sheet input[type=password] { margin-bottom: 10px; }\n#pg-meals .cols, #pg-meals .item { grid-template-columns: 1fr 64px 46px !important; }\n#pg-meals .cols span:nth-child(2), #pg-meals .cols span:nth-child(3) { text-align: center; }\n#pg-meals .dpill {\n  justify-self: center; appearance: none; border: 0; cursor: pointer; font-family: inherit;\n  min-width: 50px; height: 30px; padding: 0 10px; border-radius: 15px;\n  font-size: 14px; font-weight: 700; background: var(--chip); color: var(--muted);\n  display: grid; place-items: center; transition: transform .12s, background-color .15s;\n}\n#pg-meals .dpill:active { transform: scale(.94); }\n#pg-meals .dpill.set { color: #fff; }\n#pg-meals .dpill .shop { width: 17px; height: 17px; stroke: currentColor; fill: none; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; }\n#pg-meals .item.done .dpill { opacity: .6; }\n#pg-meals .add .dpill { height: auto; border-radius: 10px; min-width: 54px; }\n#pg-meals .sheet .dpill { justify-self: start; height: 36px; border-radius: 18px; min-width: 64px; }\n#pg-meals .item { min-height: 56px; }\n#pg-meals #addBtn { background: var(--ben); color: #fff; }\n#pg-meals #addBtn svg { width: 18px; height: 18px; }\n#pg-meals .sheet.quick { display: flex; gap: 8px; padding-top: 10px; padding-bottom: 10px; border-radius: 16px 16px 0 0; }\n#pg-meals .sheet.quick input { flex: 1; min-width: 0; }\n#pg-meals .sheet.quick button { min-width: 72px; border: 0; border-radius: 10px; background: var(--ben); color: #fff; font: inherit; font-size: 16px; font-weight: 700; padding: 0 18px; cursor: pointer; }\n#pg-meals .sheet.quick button.finish { background: var(--ink); color: var(--bg); }\n#pg-meals .item.flash { animation: rowflash 1.4s ease-out; }\n@keyframes rowflash { 0%, 30% { background: color-mix(in srgb, var(--ben) 16%, var(--bg)); } 100% { background: var(--bg); } }\nbody.viewonly #pg-meals #addBtn, body.viewonly #pg-meals #gear, body.viewonly #pg-meals #clearBtn { display: none !important; }\nbody.viewonly #pg-meals #list, body.viewonly #pg-meals #gotList, body.viewonly #pg-meals #days { pointer-events: none; }\nbody.viewonly #pg-meals .who, body.viewonly #pg-meals .kind, body.viewonly #pg-meals .dpill, body.viewonly #pg-meals .store, body.viewonly #pg-meals .check, body.viewonly #pg-meals .when, body.viewonly #pg-meals .tile, body.viewonly #pg-meals .cell { cursor: default; }\n#pg-meals .item .check { justify-self: start; }\n#pg-meals .item .main { padding-left: 2px; }\n#pg-meals .del {\n  justify-self: center; appearance: none; border: 0; background: none; cursor: pointer; padding: 0;\n  width: 34px; height: 34px; border-radius: 17px; display: grid; place-items: center; color: var(--muted);\n}\n#pg-meals .del svg { width: 19px; height: 19px; stroke: currentColor; fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }\n#pg-meals .del:active { background: var(--chip); color: var(--ash); }\nbody.viewonly #pg-meals .del { visibility: hidden; }\n#pg-meals .undo {\n  position: fixed; left: 50%; bottom: calc(84px + env(safe-area-inset-bottom, 0px)); z-index: 30;\n  transform: translate(-50%, 16px); opacity: 0; pointer-events: none; transition: opacity .2s, transform .2s;\n  display: flex; align-items: center; gap: 14px; max-width: calc(100% - 32px);\n  background: var(--ink); color: var(--bg); border-radius: 22px; padding: 10px 10px 10px 16px;\n  font-size: 14px; font-weight: 600; box-shadow: 0 6px 24px rgba(0,0,0,.2);\n}\n#pg-meals .undo.show { opacity: 1; transform: translate(-50%, 0); pointer-events: auto; }\n#pg-meals .undo span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n#pg-meals .undo button { border: 0; border-radius: 14px; background: var(--ben); color: #fff; font: inherit; font-size: 14px; font-weight: 800; padding: 6px 14px; cursor: pointer; flex: none; }\n#pg-meals .cols, #pg-meals .item { grid-template-columns: 44px 1fr 64px !important; column-gap: 6px; }\n#pg-meals .cols span:first-child { text-align: left; }\n#pg-meals .cols span:nth-child(2) { text-align: left !important; padding-left: 2px; }\n#pg-meals .swipe { position: relative; overflow: hidden; }\n#pg-meals .swipe .item { position: relative; background: var(--bg); transition: transform .2s ease; touch-action: pan-y; }\n#pg-meals .swipe.dragging .item { transition: none; }\n#pg-meals .swipe .delbg {\n  position: absolute; top: 0; right: 0; bottom: 0; width: 88px; border: 0; cursor: pointer;\n  background: var(--ash); color: #fff; font: inherit; font-size: 15px; font-weight: 700;\n}\nbody.viewonly #pg-meals .swipe .delbg { display: none; }\n#pg-meals .swipe .delbg { visibility: hidden; }\n#pg-meals .swipe.dragging .delbg, #pg-meals .swipe.open .delbg { visibility: visible; }\n",

  html: "  <div class=\"top\">\n  <header>\n    <div><h1>Meals<span class=\"count\" id=\"count\"></span></h1></div>\n    <div class=\"nav\">\n      <button id=\"addBtn\" aria-label=\"Add an idea\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.6\" stroke-linecap=\"round\"><path d=\"M12 5v14M5 12h14\"/></svg></button>\n      <button id=\"hideBtn\" aria-label=\"Hide meals you've made\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/></svg></button>\n      <span class=\"vo\">View only</span>\n    </div>\n  </header>\n  <div class=\"cols\"><span>Made</span><span>Idea</span><span>Day</span></div>\n  </div>\n  <div id=\"list\"></div>\n  <div class=\"got\" id=\"gotHead\"><h2>Made this week</h2><button id=\"clearBtn\">Clear</button></div>\n  <div id=\"gotList\"></div>\n<div class=\"sheet-bg\" id=\"sheetBg\"></div>\n<form class=\"sheet quick\" id=\"quickSheet\" autocomplete=\"off\">\n  <input id=\"quickName\" placeholder=\"Add an idea\" enterkeyhint=\"enter\">\n  <button type=\"submit\" id=\"quickBtn\">Done</button>\n</form>\n<div class=\"sheet\" id=\"sheet\">\n  <label for=\"fName\">Idea</label>\n  <input id=\"fName\" autocomplete=\"off\" >\n  <label>Day</label>\n  <button type=\"button\" class=\"dpill\" id=\"sheetDay\"></button>\n  <label for=\"fNote\">Note</label>\n  <textarea id=\"fNote\" placeholder=\"What we need, recipe link, who likes it\u2026\"></textarea>\n  <div class=\"row\"><button class=\"del\" id=\"delBtn\">Delete</button><button class=\"done\" id=\"doneBtn\">Done</button></div>\n</div>\n",

  mount: function (root) {
    root.innerHTML = this.html;

    var db = HB.db;

    var $ = function (id) { return root.querySelector("#" + id); };

    // shared helpers from the app shell
    var swipeable = HB.swipeable, deleteWithUndo = HB.deleteWithUndo, notPending = HB.notPending, flushDelete = HB.flushDelete;
    function reveal(id) { HB.reveal(root, id); }
    var lastAdded = null;

    var meals = [];   // [{id, name, note, day, done, created_at}]
    var openId = null;
    var DAYS = ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    var CAL = '<svg class="shop" viewBox="0 0 24 24"><rect x="4" y="5.5" width="16" height="14" rx="2.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/></svg>';
    var EYE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
    var EYE_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.3 4.1M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7a9.8 9.8 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>';
    var hideMade = false;
    try { hideMade = localStorage.getItem("m-hide") === "1"; } catch (e) {}

    function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
    var toast = HB.toast;
    function oops(res) { if (res && res.error) { toast("Couldn't save. Check your connection."); loadAll(); return true; } return false; }
    function byId(id) { for (var i = 0; i < meals.length; i++) if (meals[i].id === id) return meals[i]; return null; }
    function save(m, fields) { db.from("meals").update(fields).eq("id", m.id).then(oops); }

    // each weekday gets its own colour from the app palette
    function nextDay(d) { return DAYS[(DAYS.indexOf(d || "") + 1) % DAYS.length]; }
    function paintDay(el, d) {
      if (d) el.textContent = d; else el.innerHTML = CAL;
      el.classList.toggle("set", !!d);
      el.style.background = d ? "var(--s" + (DAYS.indexOf(d) - 1) + ")" : "";
    }

    // Tap-through pills: repaint the pill now, but hold the list still (and the save) until
    // the taps stop, so you can cycle past options without the row jumping away.
    var SETTLE_MS = 1500, settleT = null, pendingSaves = {};
    function settleLater(key, saveFn) {
      pendingSaves[key] = saveFn;
      clearTimeout(settleT);
      settleT = setTimeout(function () {
        settleT = null;
        var fns = pendingSaves; pendingSaves = {};
        Object.keys(fns).forEach(function (k) { fns[k](); });
        render();
      }, SETTLE_MS);
    }
    // ---- list ----
    function row(m) {
      var el = document.createElement("div");
      el.className = "item" + (m.done ? " done" : ""); el.dataset.id = m.id;
      el.innerHTML = '<button class="check" aria-label="Made it"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></button>' +
        '<button class="main"><div class="name">' + esc(m.name) + '</div>' +
        (m.note ? '<div class="note">' + esc(m.note) + '</div>' : '') + '</button>' +
        '<button class="dpill" aria-label="Day"></button>';
      var dp = el.querySelector(".dpill"); paintDay(dp, m.day);
      dp.addEventListener("click", function () { m.day = nextDay(m.day); paintDay(dp, m.day); settleLater(m.id, function () { save(m, { day: m.day }); }); });
      el.querySelector(".main").addEventListener("click", function () { openSheet(m.id); });
      el.querySelector(".check").addEventListener("click", function () { m.done = !m.done; render(); save(m, { done: m.done }); });
      return swipeable(el, function () {
        if (String(m.id).indexOf("tmp") === 0) return;
        meals = meals.filter(function (x) { return x !== m; }); render();
        deleteWithUndo(m.id, m.name,
          function () { db.from("meals").delete().eq("id", m.id).then(oops); },
          function () { meals.push(m); render(); });
      });
    }
    function render() {
      var list = $("list"), got = $("gotList"); list.innerHTML = ""; got.innerHTML = "";
      var newest = function (a, b) { return a.created_at < b.created_at ? 1 : -1; };
      // planned meals first, in weekday order; then unplanned ideas, newest first
      var todo = meals.filter(function (m) { return !m.done; }).sort(function (a, b) {
        var da = a.day ? DAYS.indexOf(a.day) : 99, db2 = b.day ? DAYS.indexOf(b.day) : 99;
        return da !== db2 ? da - db2 : newest(a, b);
      });
      var done = meals.filter(function (m) { return m.done; }).sort(newest);
      todo.forEach(function (m) { list.appendChild(row(m)); });
      if (!todo.length) list.innerHTML = '<div class="empty">No ideas yet. Tap + to add some.</div>';
      if (!hideMade) done.forEach(function (m) { got.appendChild(row(m)); });
      $("gotHead").style.display = (done.length && !hideMade) ? "" : "none";
      $("hideBtn").innerHTML = hideMade ? EYE_OFF : EYE;
      $("hideBtn").classList.toggle("on", hideMade);
      $("count").textContent = todo.length ? todo.length + (todo.length === 1 ? " idea" : " ideas") : "";
    }
    $("hideBtn").addEventListener("click", function () {
      hideMade = !hideMade; try { localStorage.setItem("m-hide", hideMade ? "1" : "0"); } catch (e) {} render();
    });
    $("clearBtn").addEventListener("click", function () {
      meals = meals.filter(function (m) { return !m.done; }); render();
      db.from("meals").delete().eq("done", true).then(oops);
    });

    // ---- quick add: Enter adds and stays open; empty box -> Done closes ----
    function hugKeyboard() {
      var vv = window.visualViewport, q = $("quickSheet");
      if (!vv || !q.classList.contains("show")) { q.style.bottom = ""; return; }
      q.style.bottom = Math.max(0, window.innerHeight - vv.height - vv.offsetTop) + "px";
    }
    if (window.visualViewport) { visualViewport.addEventListener("resize", hugKeyboard); visualViewport.addEventListener("scroll", hugKeyboard); }
    function paintQuick() {
      var has = !!$("quickName").value.trim();
      $("quickBtn").textContent = has ? "Add" : "Done";
      $("quickBtn").classList.toggle("finish", !has);
    }
    function openQuick() {
      $("quickName").value = ""; paintQuick();
      $("quickSheet").classList.add("show"); $("sheetBg").classList.add("show");
      $("quickName").focus(); hugKeyboard();
    }
    function closeQuick() {
      $("quickSheet").style.bottom = ""; $("quickSheet").classList.remove("show"); $("sheetBg").classList.remove("show");
      if (document.activeElement) document.activeElement.blur();
    }
    $("addBtn").addEventListener("click", openQuick);
    $("quickName").addEventListener("input", paintQuick);
    $("quickSheet").addEventListener("submit", function (e) {
      e.preventDefault();
      var v = $("quickName").value.trim();
      if (!v) { closeQuick(); if (lastAdded) setTimeout(function () { reveal(lastAdded); }, 350); return; }
      var temp = { id: "tmp" + Date.now() + Math.random(), name: v, note: "", day: "", done: false, created_at: new Date().toISOString() };
      meals.push(temp); render(); lastAdded = temp.id; reveal(temp.id);
      $("quickName").value = ""; paintQuick(); $("quickName").focus();
      db.from("meals").insert({ name: v }).select().single().then(function (res) {
        if (oops(res)) return;
        if (lastAdded === temp.id) lastAdded = res.data.id;
        var i = meals.indexOf(temp);
        if (byId(res.data.id)) { if (i >= 0) meals.splice(i, 1); }
        else if (i >= 0) meals[i] = res.data; else meals.push(res.data);
        render(); if (lastAdded === res.data.id) reveal(res.data.id);
      });
    });

    // ---- edit sheet ----
    var sheetDay = "";
    $("sheetDay").addEventListener("click", function () { sheetDay = nextDay(sheetDay); paintDay($("sheetDay"), sheetDay); });
    function openSheet(id) {
      var m = byId(id); if (!m || String(m.id).indexOf("tmp") === 0) return;
      openId = id; $("fName").value = m.name; $("fNote").value = m.note || "";
      sheetDay = m.day || ""; paintDay($("sheetDay"), sheetDay);
      $("sheet").classList.add("show"); $("sheetBg").classList.add("show");
    }
    function closeSheet(keep) {
      var m = byId(openId);
      if (m && keep) {
        var ch = { name: $("fName").value.trim() || m.name, note: $("fNote").value.trim(), day: sheetDay };
        if (ch.name !== m.name || ch.note !== (m.note || "") || ch.day !== (m.day || "")) { Object.assign(m, ch); save(m, ch); }
      }
      openId = null; if (document.activeElement) document.activeElement.blur();
      $("sheet").classList.remove("show"); $("sheetBg").classList.remove("show"); render();
    }
    $("doneBtn").addEventListener("click", function () { closeSheet(true); });
    $("delBtn").addEventListener("click", function () {
      var id = openId; meals = meals.filter(function (x) { return x.id !== id; }); closeSheet(false);
      db.from("meals").delete().eq("id", id).then(oops);
    });
    $("sheetBg").addEventListener("click", function () {
      if ($("quickSheet").classList.contains("show")) closeQuick(); else closeSheet(true);
    });

    // ---- load + live sync ----
    function loadAll() {
      return db.from("meals").select("*").then(function (r) {
        if (r.error) { toast("Couldn't load meals."); return; }
        meals = (r.data || []).filter(notPending);
        if (!openId && !settleT) render();
      });
    }
    var reloadT;
    function soon() { clearTimeout(reloadT); reloadT = setTimeout(loadAll, 250); }
    var started = false;
    function START() {
      if (started) { loadAll(); return; }
      started = true;
      db.channel("meals-live").on("postgres_changes", { event: "*", schema: "public", table: "meals" }, soon).subscribe();
      render(); loadAll();
    }

    // hooks the app shell calls
    this.refresh = function () { if (started) loadAll(); };   // phone woke up, or this tab opened again
    START();
  }
});
