/* Home Board: Plans page. Loaded by index.html, which provides the sign-in, tab bar,
   theme, HB.db (Supabase), HB.toast and the shared swipe / undo helpers. */
HB.register("plans", {
  title: "Plans",

  css: "#pg-plans header { display: flex; align-items: center; justify-content: space-between; padding: 4px 0 0; }\n#pg-plans h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.4px; line-height: 1.1; }\n#pg-plans .count { color: var(--muted); font-size: 14px; font-weight: 600; margin-left: 8px; }\n#pg-plans .nav button {\n  width: 36px; height: 36px; border-radius: 50%; border: 0; background: var(--chip); color: var(--ink);\n  display: grid; place-items: center; cursor: pointer;\n}\n#pg-plans .nav svg { width: 18px; height: 18px; }\n#pg-plans .cols {\n  display: grid; grid-template-columns: 1fr 120px 46px;\n  padding: 8px 0 6px; border-bottom: 0.5px solid var(--hair);\n  font-size: 13px; font-weight: 700; color: var(--muted);\n}\n#pg-plans .cols span:nth-child(2) { text-align: center; }\n#pg-plans .cols span:nth-child(3) { text-align: center; }\n#pg-plans .add { display: none; gap: 8px; padding: 10px 0; border-bottom: 0.5px solid var(--hair); }\nbody.editing #pg-plans .add { display: flex; }\n#pg-plans .add input {\n  flex: 1; border: 0; border-radius: 10px; background: var(--field); color: var(--ink);\n  font: inherit; font-size: 16px; padding: 9px 12px; min-width: 0;\n}\n#pg-plans .add input:focus { outline: 2px solid var(--ben); }\n#pg-plans .add button[type=\"submit\"] {\n  border: 0; border-radius: 10px; background: var(--ben); color: #fff;\n  font: inherit; font-weight: 700; font-size: 15px; padding: 0 16px; cursor: pointer;\n}\n#pg-plans .item {\n  display: grid; grid-template-columns: 1fr 120px 46px; align-items: center;\n  min-height: 52px; padding: 6px 0; border-bottom: 0.5px solid var(--hair);\n}\n#pg-plans .item .main { appearance: none; border: 0; background: none; color: inherit; font: inherit; text-align: left; padding: 4px 8px 4px 0; cursor: pointer; }\n#pg-plans .item .name { font-size: 17px; font-weight: 650; line-height: 1.25; }\n#pg-plans .item .note { font-size: 14px; color: var(--muted); line-height: 1.3; margin-top: 2px; white-space: pre-wrap; }\n#pg-plans .check {\n  justify-self: center; width: 30px; height: 30px; border-radius: 15px; border: 2px solid var(--muted);\n  background: none; cursor: pointer; display: grid; place-items: center; padding: 0;\n  transition: background-color .15s, border-color .15s, transform .12s;\n}\n#pg-plans .check:active { transform: scale(.9); }\n#pg-plans .check svg { width: 16px; height: 16px; stroke: #fff; stroke-width: 3; fill: none; stroke-linecap: round; stroke-linejoin: round; opacity: 0; }\n#pg-plans .item.done .check { background: var(--both); border-color: var(--both); }\n#pg-plans .item.done .check svg { opacity: 1; }\n#pg-plans .item.done .name { text-decoration: line-through; color: var(--muted); font-weight: 500; }\n#pg-plans .item.done .store, #pg-plans .item.done .note { opacity: .6; }\n#pg-plans .got { display: flex; align-items: center; justify-content: space-between; margin-top: 22px; padding-bottom: 4px; border-bottom: 0.5px solid var(--hair); }\n#pg-plans .got h2 { margin: 0; font-size: 13px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .4px; }\n#pg-plans .got button { border: 0; background: none; color: var(--ash); font: inherit; font-size: 14px; font-weight: 700; cursor: pointer; padding: 6px 0; display: none; }\nbody.editing #pg-plans .got button { display: block; }\n#pg-plans .empty { color: var(--muted); text-align: center; padding: 28px 0; font-size: 15px; }\nbody.readonly #pg-plans .main, body.readonly #pg-plans .check { pointer-events: none; }\n#pg-plans .item .store {\n  justify-self: center; appearance: none; border: 0; cursor: pointer; font-family: inherit;\n  font-size: 13px; font-weight: 700; color: var(--muted); background: var(--chip);\n  border-radius: 14px; padding: 6px 10px; max-width: 118px;\n  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;\n  transition: transform .12s, background-color .15s;\n}\n#pg-plans .item .store:active { transform: scale(.94); }\n#pg-plans .item .store.set { background: var(--ink); color: var(--bg); }\n#pg-plans .item .store:not(.set) { width: 46px; height: 28px; padding: 0; }\nbody.readonly #pg-plans .store { pointer-events: none; }\n#pg-plans .shop { width: 17px; height: 17px; stroke: currentColor; fill: none; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; display: block; margin: 0 auto; }\n#pg-plans .item .store:not(.set) { color: var(--muted); }\n#pg-plans .filterbar { display: flex; padding: 8px 0 2px; }\n#pg-plans .fpill {\n  appearance: none; border: 0; cursor: pointer; font-family: inherit;\n  font-size: 14px; font-weight: 700; padding: 6px 13px; border-radius: 15px;\n  background: var(--chip); color: var(--muted);\n  transition: background-color .15s, transform .12s;\n}\n#pg-plans .fpill:active { transform: scale(.95); }\n#pg-plans .fpill.on { background: var(--ink); color: var(--bg); }\n#pg-plans .fnone { display: inline-flex; align-items: center; gap: 6px; }\n#pg-plans .fnone .shop { margin: 0; width: 15px; height: 15px; }\n#pg-plans #hideBtn.on { background: var(--ink); color: var(--bg); }\n#pg-plans .nav { display: flex; gap: 8px; }\n#pg-plans #gear { display: none; }\nbody.editing #pg-plans #gear { display: grid; }\n#pg-plans .slist { display: flex; flex-direction: column; gap: 8px; max-height: 45vh; overflow-y: auto; }\n#pg-plans .srow { display: flex; gap: 8px; align-items: center; }\n#pg-plans .srow input { flex: 1; }\n#pg-plans .sdot { flex: 0 0 14px; height: 14px; border-radius: 7px; }\n#pg-plans .srow .mv, #pg-plans .srow .x {\n  flex: 0 0 38px; height: 38px; border: 0; border-radius: 10px; background: var(--chip);\n  color: var(--ink); font: inherit; font-size: 18px; font-weight: 700; cursor: pointer; display: grid; place-items: center;\n}\n#pg-plans .srow .x { color: var(--ash); }\n#pg-plans .srow .mv:disabled { opacity: .3; }\n#pg-plans .sheet h3 { margin: 0 0 12px; font-size: 20px; font-weight: 700; }\n#pg-plans .sheet .addstore { display: flex; gap: 8px; margin-top: 12px; }\n#pg-plans .sheet .addstore input { flex: 1; }\n#pg-plans .sheet .addstore button { border: 0; border-radius: 10px; background: var(--ink); color: var(--bg); font: inherit; font-weight: 700; padding: 0 16px; cursor: pointer; }\n#pg-plans .sheet-bg { position: fixed; inset: 0; background: rgba(0,0,0,.35); opacity: 0; pointer-events: none; transition: opacity .2s; z-index: 9; }\n#pg-plans .sheet-bg.show { opacity: 1; pointer-events: auto; }\n#pg-plans .sheet {\n  position: fixed; left: 50%; bottom: 0; transform: translate(-50%, 120%); z-index: 10;\n  width: 100%; max-width: 500px; background: var(--sheet); border-radius: 20px 20px 0 0;\n  padding: 20px 18px calc(20px + env(safe-area-inset-bottom, 0px));\n  transition: transform .25s cubic-bezier(.32,.72,0,1); box-shadow: 0 -8px 40px rgba(0,0,0,.18);\n}\n#pg-plans .sheet.show { transform: translate(-50%, 0); }\n#pg-plans .sheet label { display: block; font-size: 13px; font-weight: 700; color: var(--muted); margin: 12px 0 6px; }\n#pg-plans .sheet label:first-child { margin-top: 0; }\n#pg-plans .sheet input, #pg-plans .sheet textarea {\n  width: 100%; border: 0; border-radius: 10px; background: var(--field); color: var(--ink);\n  font: inherit; font-size: 16px; padding: 10px 12px; resize: none;\n}\n#pg-plans .sheet input:focus, #pg-plans .sheet textarea:focus { outline: 2px solid var(--ben); }\n#pg-plans .sheet textarea { min-height: 76px; }\n#pg-plans .spick {\n  appearance: none; border: 0; cursor: pointer; font-family: inherit;\n  font-size: 15px; font-weight: 700; border-radius: 16px; padding: 8px 16px;\n  min-width: 64px; min-height: 36px; background: var(--chip); color: var(--ink);\n  transition: transform .12s, background-color .15s;\n}\n#pg-plans .spick:active { transform: scale(.95); }\n#pg-plans .addpick { min-width: 54px; min-height: 0; font-size: 13px; padding: 0 12px; border-radius: 10px; max-width: 110px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n#pg-plans .spick.set { background: var(--ink); color: var(--bg); }\n#pg-plans .stores { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }\n#pg-plans .stores button {\n  border: 0; border-radius: 14px; background: var(--chip); color: var(--ink);\n  font: inherit; font-size: 14px; font-weight: 600; padding: 5px 12px; cursor: pointer;\n}\n#pg-plans .stores button.on { background: var(--ink); color: var(--bg); }\n#pg-plans .sheet .row { display: flex; gap: 10px; margin-top: 18px; }\n#pg-plans .sheet .row button { flex: 1; border: 0; border-radius: 12px; font: inherit; font-size: 16px; font-weight: 700; padding: 12px; cursor: pointer; }\n#pg-plans .sheet .del { background: var(--chip); color: var(--ash); }\n#pg-plans .sheet .done { background: var(--ink); color: var(--bg); }\n#pg-plans .sheet h2 { margin: 0 0 4px; font-size: 22px; font-weight: 700; letter-spacing: -0.3px; }\n#pg-plans .sheet .sub { margin: 0 0 16px; color: var(--muted); font-size: 15px; }\n#pg-plans .sheet input {\n  width: 100%; border: 0; border-radius: 12px; background: var(--field); color: var(--ink);\n  font: inherit; font-size: 17px; padding: 14px; margin-bottom: 10px;\n}\n#pg-plans .sheet input:focus { outline: 2px solid var(--ben); outline-offset: 0; }\n#pg-plans .sheet .go {\n  width: 100%; border: 0; border-radius: 12px; background: var(--ink); color: var(--bg);\n  font: inherit; font-size: 17px; font-weight: 700; padding: 14px; cursor: pointer;\n}\n#pg-plans .sheet .go:disabled { opacity: .5; }\n#pg-plans .sheet .cancel { display: block; width: 100%; margin-top: 10px; background: none; border: 0; color: var(--muted); font: inherit; font-size: 15px; cursor: pointer; }\n#pg-plans .sheet .err { color: var(--ash); font-size: 15px; min-height: 1.4em; margin: 0 0 6px; }\n#pg-plans .sheet form, #pg-plans form.sheet { margin: 0; }\n#pg-plans .sheet input[type=email], #pg-plans .sheet input[type=password] { margin-bottom: 10px; }\n#pg-plans .cols, #pg-plans .item { grid-template-columns: 1fr 84px !important; column-gap: 8px; }\n#pg-plans .cols span:nth-child(2) { text-align: center; }\n#pg-plans .item { min-height: 54px; }\n#pg-plans #addBtn { background: var(--ben); color: #fff; }\n#pg-plans #addBtn svg { width: 18px; height: 18px; }\n#pg-plans .wk { margin-top: 18px; padding-bottom: 5px; border-bottom: 0.5px solid var(--hair); }\n#pg-plans .wk .tag { display: block; font-size: 11px; font-weight: 800; color: var(--ben); text-transform: uppercase; letter-spacing: .5px; margin-bottom: 1px; }\n#pg-plans .wk:first-child { margin-top: 10px; }\n#pg-plans .wk h2 { margin: 0; font-size: 13px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .4px; }\n#pg-plans .wk h2 b { color: var(--ink); }\n#pg-plans .wk span { font-size: 13px; font-weight: 600; color: var(--muted); }\n#pg-plans .wk.free { display: flex; align-items: baseline; justify-content: space-between; margin-top: 14px; }\n#pg-plans .wk.free h2 { opacity: .75; }\n#pg-plans .wk.free .free-note { font-size: 13px; font-weight: 600; color: var(--muted); opacity: .75; }\n#pg-plans .when {\n  appearance: none; border: 0; cursor: pointer; font-family: inherit; white-space: nowrap;\n  font-size: 13px; font-weight: 650; height: 30px; padding: 0 10px; border-radius: 15px; min-width: 70px;\n  background: var(--chip); color: var(--ink); justify-self: center; transition: transform .12s;\n}\n#pg-plans .when:active { transform: scale(.94); }\n#pg-plans .when.idea { color: var(--muted); min-width: 52px; }\n#pg-plans .when svg { vertical-align: middle; }\n#pg-plans .when svg { width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; vertical-align: -3px; }\n#pg-plans .seg { display: flex; background: var(--chip); border-radius: 12px; padding: 3px; margin: 10px 0 4px; }\n#pg-plans .seg button {\n  flex: 1; appearance: none; border: 0; background: none; cursor: pointer; font-family: inherit;\n  font-size: 14px; font-weight: 700; color: var(--muted); padding: 7px 0; border-radius: 9px;\n}\n#pg-plans .seg button.on { background: var(--bg); color: var(--ink); box-shadow: 0 1px 3px rgba(0,0,0,.12); }\n#pg-plans .seg .n { font-weight: 600; opacity: .7; margin-left: 4px; }\n#pg-plans .sheet input[type=date] { -webkit-appearance: none; appearance: none; min-height: 44px; }\n#pg-plans .sheet .clear-date { background: none; border: 0; color: var(--muted); font: inherit; font-size: 14px; font-weight: 600; padding: 8px 0 0; cursor: pointer; }\n#pg-plans .sheet.quick { display: flex; gap: 8px; padding-top: 10px; padding-bottom: 10px; border-radius: 16px 16px 0 0; }\n#pg-plans .sheet.quick input { flex: 1; min-width: 0; }\n#pg-plans .sheet.quick .when { height: auto; border-radius: 10px; }\n#pg-plans .sheet.quick button[type=submit] { min-width: 72px; border: 0; border-radius: 10px; background: var(--ben); color: #fff; font: inherit; font-size: 16px; font-weight: 700; padding: 0 18px; cursor: pointer; }\n#pg-plans .sheet.quick button.finish { background: var(--ink); color: var(--bg); }\n#pg-plans .month { font-size: 13px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .4px; padding: 16px 0 5px; border-bottom: 0.5px solid var(--hair); }\n#pg-plans .item.up { grid-template-columns: 52px 1fr !important; column-gap: 14px; }\n#pg-plans .tile {\n  appearance: none; border: 0; cursor: pointer; font-family: inherit; color: #fff;\n  width: 52px; height: 52px; border-radius: 14px; display: flex; flex-direction: column;\n  align-items: center; justify-content: center; line-height: 1; padding: 0;\n}\n#pg-plans .tile .d { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .4px; opacity: .92; }\n#pg-plans .tile .n { font-size: 21px; font-weight: 800; margin-top: 3px; }\n#pg-plans .item.up .soon { font-size: 13px; color: var(--muted); font-weight: 600; margin-top: 2px; }\n#pg-plans .cols.up { grid-template-columns: 52px 1fr !important; column-gap: 14px; }\n#pg-plans .cols.up span:nth-child(2) { text-align: left; }\n#pg-plans .item.flash { animation: rowflash 1.4s ease-out; }\n@keyframes rowflash { 0%, 30% { background: color-mix(in srgb, var(--ben) 16%, var(--bg)); } 100% { background: var(--bg); } }\n#pg-plans .sheet .cal-btn {\n  display: inline-flex; align-items: center; gap: 7px; margin-top: 10px;\n  border: 0; border-radius: 16px; background: var(--chip); color: var(--ink);\n  font: inherit; font-size: 14px; font-weight: 700; padding: 8px 14px; cursor: pointer;\n}\n#pg-plans .sheet .cal-btn svg { width: 17px; height: 17px; stroke: currentColor; fill: none; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; }\n#pg-plans .sheet .cal-btn[hidden] { display: none; }\n#pg-plans .when { -webkit-touch-callout: none; -webkit-user-select: none; user-select: none; }\n#pg-plans .datebtns { display: flex; gap: 8px; flex-wrap: wrap; }\n#pg-plans .dbtn {\n  position: relative; display: inline-flex; align-items: center; gap: 7px; overflow: hidden;\n  border: 0; border-radius: 16px; background: var(--chip); color: var(--ink);\n  font: inherit; font-size: 14px; font-weight: 700; padding: 8px 14px; cursor: pointer;\n}\n#pg-plans .dbtn svg { width: 17px; height: 17px; stroke: currentColor; fill: none; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; }\n#pg-plans .dbtn:disabled { opacity: .4; cursor: default; }\n#pg-plans .sheet .datepick input[type=date] {\n  position: absolute; inset: 0; width: 100%; height: 100%; min-height: 0; padding: 0; margin: 0;\n  opacity: 0; border: 0; background: none; cursor: pointer; font-size: 16px;\n}\n#pg-plans #laterBtn.on { background: var(--ink); color: var(--bg); }\n#pg-plans #laterBtn[hidden] { display: none; }\n#pg-plans .more-later { display: block; width: 100%; appearance: none; border: 0; background: none; cursor: pointer; font-family: inherit;\n  color: var(--muted); font-size: 14px; font-weight: 600; padding: 14px 0; text-align: center; }\nbody.viewonly #pg-plans #addBtn, body.viewonly #pg-plans #gear, body.viewonly #pg-plans #clearBtn { display: none !important; }\nbody.viewonly #pg-plans #list, body.viewonly #pg-plans #gotList, body.viewonly #pg-plans #days { pointer-events: none; }\nbody.viewonly #pg-plans .who, body.viewonly #pg-plans .kind, body.viewonly #pg-plans .dpill, body.viewonly #pg-plans .store, body.viewonly #pg-plans .check, body.viewonly #pg-plans .when, body.viewonly #pg-plans .tile, body.viewonly #pg-plans .cell { cursor: default; }\n#pg-plans .undo {\n  position: fixed; left: 50%; bottom: calc(84px + env(safe-area-inset-bottom, 0px)); z-index: 30;\n  transform: translate(-50%, 16px); opacity: 0; pointer-events: none; transition: opacity .2s, transform .2s;\n  display: flex; align-items: center; gap: 14px; max-width: calc(100% - 32px);\n  background: var(--ink); color: var(--bg); border-radius: 22px; padding: 10px 10px 10px 16px;\n  font-size: 14px; font-weight: 600; box-shadow: 0 6px 24px rgba(0,0,0,.2);\n}\n#pg-plans .undo.show { opacity: 1; transform: translate(-50%, 0); pointer-events: auto; }\n#pg-plans .undo span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n#pg-plans .undo button { border: 0; border-radius: 14px; background: var(--ben); color: #fff; font: inherit; font-size: 14px; font-weight: 800; padding: 6px 14px; cursor: pointer; flex: none; }\n#pg-plans .swipe { position: relative; overflow: hidden; }\n#pg-plans .swipe .item { position: relative; background: var(--bg); transition: transform .2s ease; touch-action: pan-y; }\n#pg-plans .swipe.dragging .item { transition: none; }\n#pg-plans .swipe .delbg {\n  position: absolute; top: 0; right: 0; bottom: 0; width: 88px; border: 0; cursor: pointer;\n  background: var(--ash); color: #fff; font: inherit; font-size: 15px; font-weight: 700;\n}\nbody.viewonly #pg-plans .swipe .delbg { display: none; }\n#pg-plans .swipe .delbg { visibility: hidden; }\n#pg-plans .swipe.dragging .delbg, #pg-plans .swipe.open .delbg { visibility: visible; }\n",

  html: "  <div class=\"top\">\n  <header>\n    <div><h1>Plans<span class=\"count\" id=\"count\"></span></h1></div>\n    <div class=\"nav\">\n      <button id=\"addBtn\" aria-label=\"Add a plan\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.6\" stroke-linecap=\"round\"><path d=\"M12 5v14M5 12h14\"/></svg></button>\n      <button id=\"laterBtn\" aria-label=\"Show plans further out\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/></svg></button>\n      <span class=\"vo\">View only</span>\n    </div>\n  </header>\n  <div class=\"seg\" id=\"seg\"><button type=\"button\" data-v=\"up\" class=\"on\">Coming up<span class=\"n\" id=\"nUp\"></span></button><button type=\"button\" data-v=\"ideas\">Ideas<span class=\"n\" id=\"nIdeas\"></span></button></div>\n  <div class=\"cols\" id=\"cols\"><span id=\"colName\">Plan</span><span id=\"colWhen\">When</span></div>\n  </div>\n  <div id=\"list\"></div>\n<div class=\"sheet-bg\" id=\"sheetBg\"></div>\n<form class=\"sheet quick\" id=\"quickSheet\" autocomplete=\"off\">\n  <input id=\"quickName\" placeholder=\"Add a plan\" enterkeyhint=\"enter\">\n  <button type=\"button\" class=\"when\" id=\"quickWhen\"></button>\n  <button type=\"submit\" id=\"quickBtn\">Done</button>\n</form>\n<div class=\"sheet\" id=\"sheet\">\n  <label for=\"fName\">Plan</label>\n  <input id=\"fName\" autocomplete=\"off\">\n  <label>Date</label>\n  <div class=\"datebtns\">\n    <!-- the real date input sits invisibly over the button, so a tap opens the iPhone date picker -->\n    <span class=\"dbtn datepick\"><svg viewBox=\"0 0 24 24\"><rect x=\"4\" y=\"5.5\" width=\"16\" height=\"14\" rx=\"2.5\"/><path d=\"M4 10h16M8.5 3.5v4M15.5 3.5v4\"/></svg><span id=\"dateLabel\">Set date</span><input id=\"fDate\" type=\"date\" aria-label=\"Date\"></span>\n    <button type=\"button\" class=\"dbtn\" id=\"clearDate\">Remove date</button>\n  </div>\n  <button type=\"button\" class=\"cal-btn\" id=\"calBtn\"><svg viewBox=\"0 0 24 24\"><rect x=\"4\" y=\"5.5\" width=\"16\" height=\"14\" rx=\"2.5\"/><path d=\"M4 10h16M8.5 3.5v4M15.5 3.5v4M12 13v4M10 15h4\"/></svg>Add to calendar</button>\n  <label for=\"fNote\">Note</label>\n  <textarea id=\"fNote\" placeholder=\"Time, where, who's coming, tickets\u2026\"></textarea>\n  <div class=\"row\"><button class=\"del\" id=\"delBtn\">Delete</button><button class=\"done\" id=\"doneBtn\">Done</button></div>\n</div>\n",

  mount: function (root) {
    root.innerHTML = this.html;

    var db = HB.db;

    var $ = function (id) { return root.querySelector("#" + id); };

    // shared helpers from the app shell
    var swipeable = HB.swipeable, deleteWithUndo = HB.deleteWithUndo, notPending = HB.notPending, flushDelete = HB.flushDelete;
    function reveal(id) { HB.reveal(root, id); }
    var lastAdded = null;
    function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
    var toast = HB.toast;
    function oops(res) { if (res && res.error) { toast("Couldn't save. Check your connection."); loadAll(); return true; } return false; }
    var openId = null;

    // Tap-through pills: repaint the pill now, but hold the list still (and the save) until
    // the taps stop, so you can cycle past options without the row jumping away.
    var SETTLE_MS = 1500, settleT = null, pendingSaves = {}, afterSettle = null;
    function settleLater(key, saveFn, then) {
      pendingSaves[key] = saveFn; if (then) afterSettle = then;
      clearTimeout(settleT);
      settleT = setTimeout(function () {
        settleT = null;
        var fns = pendingSaves; pendingSaves = {};
        Object.keys(fns).forEach(function (k) { fns[k](); });
        var f = afterSettle; afterSettle = null;
        render(); if (f) f();
      }, SETTLE_MS);
    }

    // quick-add bar sits right on top of the iPhone keyboard
    function hugKeyboard() {
      var vv = window.visualViewport, q = $("quickSheet");
      if (!vv || !q.classList.contains("show")) { q.style.bottom = ""; return; }
      q.style.bottom = Math.max(0, window.innerHeight - vv.height - vv.offsetTop) + "px";
    }
    if (window.visualViewport) { visualViewport.addEventListener("resize", hugKeyboard); visualViewport.addEventListener("scroll", hugKeyboard); }
    function paintQuick() {
      var has = !!$("quickName").value.trim();
      $("quickBtn").textContent = has ? "Add" : "Done"; $("quickBtn").classList.toggle("finish", !has);
    }
    function showQuick() {
      $("quickName").value = ""; paintQuick();
      $("quickSheet").classList.add("show"); $("sheetBg").classList.add("show"); $("quickName").focus(); hugKeyboard();
    }
    function closeQuick() {
      $("quickSheet").style.bottom = ""; $("quickSheet").classList.remove("show"); $("sheetBg").classList.remove("show");
      if (document.activeElement) document.activeElement.blur();
    }
    $("quickName").addEventListener("input", paintQuick);
    function showSheet() { $("sheet").classList.add("show"); $("sheetBg").classList.add("show"); }
    function hideSheet() { if (document.activeElement) document.activeElement.blur(); $("sheet").classList.remove("show"); $("sheetBg").classList.remove("show"); }

    // ---- Plans ----
    var plans = [];   // [{id, name, note, date ('YYYY-MM-DD' or null), created_at}]
    var MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    var FULLMON = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    var DOW = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    var WEEKENDS = 4;   // how many weekends the tap-through steps across
    var CAL = '<svg viewBox="0 0 24 24"><rect x="4" y="5.5" width="16" height="14" rx="2.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/></svg>';
    function iso(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
    function parse(s) { var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
    function add(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
    var today, monday0, STOPS;
    function computeDates() {
      today = new Date(); today.setHours(0, 0, 0, 0);
      monday0 = add(today, -((today.getDay() + 6) % 7));
      STOPS = [];
      for (var i = 0; i < WEEKENDS; i++) {
        var s = add(monday0, 7 * i + 5), su = add(s, 1);
        if (s >= today) STOPS.push(iso(s)); if (su >= today) STOPS.push(iso(su));
      }
      STOPS.push("");
    }
    computeDates();
    function nextStop(v) { return STOPS[(STOPS.indexOf(v || "") + 1) % STOPS.length]; }
    function byId(id) { for (var i = 0; i < plans.length; i++) if (plans[i].id === id) return plans[i]; return null; }
    function save(p, fields) { db.from("plans").update(fields).eq("id", p.id).then(oops); }

    // heat: 0 days away = red, cooling through orange to yellow by ~4 weeks out
    function daysAway(v) { return Math.round((parse(v) - today) / 86400000); }
    function heat(v) {
      var t = Math.max(0, Math.min(1, daysAway(v) / 28));
      var h = 355 + t * 50, l = 56 - t * 8;
      return "hsl(" + (h % 360).toFixed(0) + ", 60%, " + l.toFixed(0) + "%)";
    }
    function soonLabel(v) { var n = daysAway(v); return n === 0 ? "Today" : n === 1 ? "Tomorrow" : n < 7 ? "In " + n + " days" : ""; }
    function paintWhen(el, v) {
      el.classList.remove("idea");
      if (!v) { el.innerHTML = CAL; el.classList.add("idea"); el.setAttribute("aria-label", "Pick a weekend"); return; }
      var d = parse(v); el.textContent = DOW[d.getDay()] + " " + d.getDate();
    }

    var EYE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
    var EYE_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.3 4.1M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7a9.8 9.8 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>';
    var view = "up";          // always opens on Coming up
    var showLater = false;    // eye: show plans beyond the next two months
    $("laterBtn").addEventListener("click", function () { showLater = !showLater; render(); });
    root.querySelectorAll("#seg button").forEach(function (b) {
      b.addEventListener("click", function () { view = b.dataset.v; render(); window.scrollTo(0, 0); });
    });

    function tileRow(p) {
      var el = document.createElement("div"); el.className = "item up"; el.dataset.id = p.id;
      var d = parse(p.date), sl = soonLabel(p.date);
      el.innerHTML = '<button class="tile" aria-label="Change date" style="background:' + heat(p.date) + '">' +
        '<span class="d">' + DOW[d.getDay()] + '</span><span class="n">' + d.getDate() + '</span></button>' +
        '<button class="main"><div class="name">' + esc(p.name) + '</div>' +
        (p.note ? '<div class="note">' + esc(p.note) + '</div>' : '') +
        (sl ? '<div class="soon">' + sl + '</div>' : '') + '</button>';
      el.querySelector(".tile").addEventListener("click", function () { openSheet(p.id, true); });
      el.querySelector(".main").addEventListener("click", function () { openSheet(p.id); });
      return swipeable(el, function () {
        if (String(p.id).indexOf("tmp") === 0) return;
        plans = plans.filter(function (x) { return x !== p; }); render();
        deleteWithUndo(p.id, p.name,
          function () { db.from("plans").delete().eq("id", p.id).then(oops); },
          function () { plans.push(p); render(); });
      });
    }
    function ideaRow(p) {
      var el = document.createElement("div"); el.className = "item"; el.dataset.id = p.id;
      el.innerHTML = '<button class="main"><div class="name">' + esc(p.name) + '</div>' +
        (p.note ? '<div class="note">' + esc(p.note) + '</div>' : '') + '</button><button class="when" aria-label="When"></button>';
      var w = el.querySelector(".when"); paintWhen(w, p.date);
      // tap = step through weekend days; press and hold = pick any date
      var holdT = null, held = false;
      w.addEventListener("touchstart", function () { held = false; holdT = setTimeout(function () { held = true; openSheet(p.id, true); }, 500); }, { passive: true });
      ["touchmove", "touchcancel"].forEach(function (ev) { w.addEventListener(ev, function () { clearTimeout(holdT); }, { passive: true }); });
      // after a long press, swallow the finger-lift so it doesn't "tap" the backdrop and close the sheet
      w.addEventListener("touchend", function (e) { clearTimeout(holdT); if (held) e.preventDefault(); }, { passive: false });
      w.addEventListener("contextmenu", function (e) { e.preventDefault(); });
      w.addEventListener("click", function () {
        if (held) { held = false; return; }
        p.date = nextStop(p.date) || null; paintWhen(w, p.date);
        settleLater(p.id, function () { save(p, { date: p.date }); }, function () { if (p.date) toast(p.name + " → " + w.textContent); });
      });
      el.querySelector(".main").addEventListener("click", function () { openSheet(p.id); });
      return swipeable(el, function () {
        if (String(p.id).indexOf("tmp") === 0) return;
        plans = plans.filter(function (x) { return x !== p; }); render();
        deleteWithUndo(p.id, p.name,
          function () { db.from("plans").delete().eq("id", p.id).then(oops); },
          function () { plans.push(p); render(); });
      });
    }
    function render() {
      computeDates();
      $("list").innerHTML = "";
      var upcoming = plans.filter(function (p) { return p.date && parse(p.date) >= today; }).sort(function (a, b) { return a.date < b.date ? -1 : 1; });
      var ideas = plans.filter(function (p) { return !p.date; }).sort(function (a, b) { return a.created_at < b.created_at ? 1 : -1; });
      $("nUp").textContent = upcoming.length || ""; $("nIdeas").textContent = ideas.length || "";
      root.querySelectorAll("#seg button").forEach(function (b) { b.classList.toggle("on", b.dataset.v === view); });
      // Ideas: idea | when chip.  Coming up: date tile | plan
      $("colName").textContent = view === "ideas" ? "Idea" : "When";
      $("colWhen").textContent = view === "ideas" ? "When" : "Plan";
      $("cols").classList.toggle("up", view !== "ideas");
      $("count").textContent = "";
      $("laterBtn").hidden = view === "ideas";
      $("laterBtn").classList.toggle("on", showLater);
      $("laterBtn").innerHTML = showLater ? EYE_OFF : EYE;
      if (view === "ideas") {
        ideas.forEach(function (p) { $("list").appendChild(ideaRow(p)); });
        if (!ideas.length) $("list").innerHTML = '<div class="empty">No ideas yet. Tap + to add some.</div>';
        return;
      }
      var horizon = add(today, 7 * 8);   // about two months ahead, unless the eye is on
      var soon = showLater ? upcoming : upcoming.filter(function (p) { return parse(p.date) <= horizon; });
      var hiddenLater = upcoming.length - soon.length;
      var lastMonth = -1;   // always label the first month too
      soon.forEach(function (p) {
        var m = parse(p.date).getMonth();
        if (m !== lastMonth) { var h = document.createElement("div"); h.className = "month"; h.textContent = FULLMON[m]; $("list").appendChild(h); lastMonth = m; }
        $("list").appendChild(tileRow(p));
      });
      if (!soon.length && !hiddenLater) $("list").innerHTML = '<div class="empty">Nothing planned yet. Check Ideas.</div>';
      if (hiddenLater) {
        var more = document.createElement("button"); more.type = "button"; more.className = "more-later";
        more.textContent = hiddenLater + " more after " + MON[horizon.getMonth()] + " " + horizon.getDate() + " · Show";
        more.addEventListener("click", function () { showLater = true; render(); });
        $("list").appendChild(more);
      }
    }

    // ---- quick add: name, optional weekend, Enter for the next one ----
    var quickWhen = "";
    $("quickWhen").addEventListener("click", function () { quickWhen = nextStop(quickWhen); paintWhen($("quickWhen"), quickWhen); $("quickName").focus(); });
    $("addBtn").addEventListener("click", function () {
      quickWhen = ""; paintWhen($("quickWhen"), "");
      $("quickName").placeholder = view === "ideas" ? "Add an idea" : "Add a plan";
      showQuick();
    });
    $("quickSheet").addEventListener("submit", function (e) {
      e.preventDefault();
      var v = $("quickName").value.trim();
      if (!v) { closeQuick(); if (lastAdded) setTimeout(function () { reveal(lastAdded); }, 350); return; }
      var date = quickWhen || null;
      var temp = { id: "tmp" + Date.now() + Math.random(), name: v, note: "", date: date, created_at: new Date().toISOString() };
      plans.push(temp); render(); lastAdded = temp.id; reveal(temp.id);
      $("quickName").value = ""; paintQuick(); $("quickName").focus();
      db.from("plans").insert({ name: v, date: date }).select().single().then(function (res) {
        if (oops(res)) return;
        if (lastAdded === temp.id) lastAdded = res.data.id;
        var i = plans.indexOf(temp);
        if (byId(res.data.id)) { if (i >= 0) plans.splice(i, 1); } else if (i >= 0) plans[i] = res.data; else plans.push(res.data);
        render(); if (lastAdded === res.data.id) reveal(res.data.id);
      });
    });

    // ---- edit sheet: exact date (any day) via the phone's date picker ----
    function openSheet(id, toDate) {
      var p = byId(id); if (!p || String(p.id).indexOf("tmp") === 0) return;
      openId = id; $("fName").value = p.name; $("fNote").value = p.note || ""; $("fDate").value = p.date || "";
      showSheet();
      paintCal();
      if (toDate) { $("fDate").focus(); try { $("fDate").showPicker(); } catch (e) {} }
    }
    $("clearDate").addEventListener("click", function () { $("fDate").value = ""; paintCal(); });
    // "Set date" shows the chosen date once picked; "Remove date" is greyed out until there is one
    function paintCal() {
      var v = $("fDate").value;
      if (v) { var d = parse(v); $("dateLabel").textContent = DOW[d.getDay()] + ", " + MON[d.getMonth()] + " " + d.getDate(); }
      else $("dateLabel").textContent = "Set date";
      $("clearDate").disabled = !v;
      $("calBtn").hidden = !v;
    }
    $("fDate").addEventListener("input", paintCal); $("fDate").addEventListener("change", paintCal);

    // ---- add to calendar: build a standard .ics event from the plan ----
    // A time in the name or note ("2pm", "6:30 pm") makes it a 2-hour event; otherwise all-day.
    function icsText(v) { return String(v || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n"); }
    function stamp(d) { return d.getFullYear() + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0") + "T" + String(d.getHours()).padStart(2, "0") + String(d.getMinutes()).padStart(2, "0") + "00"; }
    function buildIcs(name, note, date, uid) {
      var d = parse(date), ymd = date.replace(/-/g, "");
      var t = (name + " " + note).match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm|a|p)\b/i);
      var now = new Date(), utc = now.toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
      var L = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Home Board//Plans//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
               "BEGIN:VEVENT", "UID:" + uid + "@home-board", "DTSTAMP:" + utc];
      if (t) {
        var h = (+t[1] % 12) + (/p/i.test(t[3]) ? 12 : 0), start = new Date(d); start.setHours(h, +(t[2] || 0), 0, 0);
        var end = new Date(start.getTime() + 2 * 3600000);
        L.push("DTSTART:" + stamp(start), "DTEND:" + stamp(end));
      } else {
        L.push("DTSTART;VALUE=DATE:" + ymd, "DTEND;VALUE=DATE:" + iso(add(d, 1)).replace(/-/g, ""));
      }
      L.push("SUMMARY:" + icsText(name));
      if (note) L.push("DESCRIPTION:" + icsText(note));
      L.push("END:VEVENT", "END:VCALENDAR");
      return L.join("\r\n");
    }
    $("calBtn").addEventListener("click", function () {
      var p = byId(openId); if (!p || !$("fDate").value) return;
      var name = $("fName").value.trim() || p.name, note = $("fNote").value.trim();
      var ics = buildIcs(name, note, $("fDate").value, p.id);
      // Save the event as a small .ics file in Supabase Storage and open its web link:
      // an https link to a calendar file is what the iPhone reliably turns into "Add to Calendar".
      var btn = $("calBtn"), label = btn.lastChild;
      btn.disabled = true; label.textContent = "Opening…";
      var path = p.id + ".ics";
      var file = new Blob([ics], { type: "text/calendar" });
      db.storage.from("calendar").upload(path, file, { upsert: true, contentType: "text/calendar", cacheControl: "0" }).then(function (res) {
        btn.disabled = false; label.textContent = "Add to calendar";
        if (res.error) { toast("Calendar isn't set up yet (run calendar-setup.sql)"); return; }
        var url = db.storage.from("calendar").getPublicUrl(path).data.publicUrl + "?v=" + Date.now();
        location.href = url;
      }, function () { btn.disabled = false; label.textContent = "Add to calendar"; toast("Couldn't reach the calendar. Check your connection."); });
    });
    function closeSheet(keep) {
      var p = byId(openId);
      if (p && keep) {
        var ch = { name: $("fName").value.trim() || p.name, note: $("fNote").value.trim(), date: $("fDate").value || null };
        if (ch.name !== p.name || ch.note !== (p.note || "") || ch.date !== (p.date || null)) { Object.assign(p, ch); save(p, ch); }
      }
      openId = null; hideSheet(); render();
    }
    $("doneBtn").addEventListener("click", function () { closeSheet(true); });
    $("delBtn").addEventListener("click", function () {
      var id = openId; plans = plans.filter(function (x) { return x.id !== id; }); closeSheet(false);
      db.from("plans").delete().eq("id", id).then(oops);
    });
    $("sheetBg").addEventListener("click", function () { if ($("quickSheet").classList.contains("show")) closeQuick(); else closeSheet(true); });

    function loadAll() {
      return db.from("plans").select("*").then(function (r) {
        if (r.error) { toast("Couldn't load plans."); return; }
        plans = (r.data || []).filter(notPending);
        if (!openId && !settleT) render();
      });
    }
    // keep "Tomorrow"/heat colours fresh past midnight while the app stays open
    setInterval(function () { if (started && !openId && !settleT) render(); }, 60000);

    // ---- load + live sync ----
    var reloadT;
    function soon() { clearTimeout(reloadT); reloadT = setTimeout(loadAll, 250); }
    var started = false;
    function START() {
      if (started) { loadAll(); return; }
      started = true;
      db.channel("plans" + "-live").on("postgres_changes", { event: "*", schema: "public", table: "plans" }, soon).subscribe();
      render(); loadAll();
    }

    // hooks the app shell calls
    this.refresh = function () { if (started) loadAll(); };   // phone woke up, or this tab opened again
    this.shown = function () { if (view !== "up") { view = "up"; render(); } };   // always opens on Coming up
    START();
  }
});
