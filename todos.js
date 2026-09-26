/* Home Board: TODOS page. Loaded by index.html, which provides the sign-in, tab bar,
   theme, HB.db (Supabase), HB.toast and the shared swipe / undo helpers. */
HB.register("todos", {
  title: "TODOS",

  css: "#pg-todos header { display: flex; align-items: center; justify-content: space-between; padding: 4px 0 0; }\n#pg-todos h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.4px; line-height: 1.1; }\n#pg-todos .count { color: var(--muted); font-size: 14px; font-weight: 600; margin-left: 8px; }\n#pg-todos .nav button {\n  width: 36px; height: 36px; border-radius: 50%; border: 0; background: var(--chip); color: var(--ink);\n  display: grid; place-items: center; cursor: pointer;\n}\n#pg-todos .nav svg { width: 18px; height: 18px; }\n#pg-todos .cols {\n  display: grid; grid-template-columns: 1fr 120px 46px;\n  padding: 8px 0 6px; border-bottom: 0.5px solid var(--hair);\n  font-size: 13px; font-weight: 700; color: var(--muted);\n}\n#pg-todos .cols span:nth-child(2) { text-align: center; }\n#pg-todos .cols span:nth-child(3) { text-align: center; }\n#pg-todos .add { display: none; gap: 8px; padding: 10px 0; border-bottom: 0.5px solid var(--hair); }\nbody.editing #pg-todos .add { display: flex; }\n#pg-todos .add input {\n  flex: 1; border: 0; border-radius: 10px; background: var(--field); color: var(--ink);\n  font: inherit; font-size: 16px; padding: 9px 12px; min-width: 0;\n}\n#pg-todos .add input:focus { outline: 2px solid var(--ben); }\n#pg-todos .add button[type=\"submit\"] {\n  border: 0; border-radius: 10px; background: var(--ben); color: #fff;\n  font: inherit; font-weight: 700; font-size: 15px; padding: 0 16px; cursor: pointer;\n}\n#pg-todos .item {\n  display: grid; grid-template-columns: 1fr 120px 46px; align-items: center;\n  min-height: 52px; padding: 6px 0; border-bottom: 0.5px solid var(--hair);\n}\n#pg-todos .item .main { appearance: none; border: 0; background: none; color: inherit; font: inherit; text-align: left; padding: 4px 8px 4px 0; cursor: pointer; }\n#pg-todos .item .name { font-size: 17px; font-weight: 650; line-height: 1.25; }\n#pg-todos .item .note { font-size: 14px; color: var(--muted); line-height: 1.3; margin-top: 2px; white-space: pre-wrap; }\n#pg-todos .check {\n  justify-self: center; width: 30px; height: 30px; border-radius: 15px; border: 2px solid var(--muted);\n  background: none; cursor: pointer; display: grid; place-items: center; padding: 0;\n  transition: background-color .15s, border-color .15s, transform .12s;\n}\n#pg-todos .check:active { transform: scale(.9); }\n#pg-todos .check svg { width: 16px; height: 16px; stroke: #fff; stroke-width: 3; fill: none; stroke-linecap: round; stroke-linejoin: round; opacity: 0; }\n#pg-todos .item.done .check { background: var(--both); border-color: var(--both); }\n#pg-todos .item.done .check svg { opacity: 1; }\n#pg-todos .item.done .name { text-decoration: line-through; color: var(--muted); font-weight: 500; }\n#pg-todos .item.done .store, #pg-todos .item.done .note { opacity: .6; }\n#pg-todos .got { display: flex; align-items: center; justify-content: space-between; margin-top: 22px; padding-bottom: 4px; border-bottom: 0.5px solid var(--hair); }\n#pg-todos .got h2 { margin: 0; font-size: 13px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .4px; }\n#pg-todos .got button { border: 0; background: none; color: var(--ash); font: inherit; font-size: 14px; font-weight: 700; cursor: pointer; padding: 6px 0; display: none; }\nbody.editing #pg-todos .got button { display: block; }\n#pg-todos .empty { color: var(--muted); text-align: center; padding: 28px 0; font-size: 15px; }\nbody.readonly #pg-todos .main, body.readonly #pg-todos .check { pointer-events: none; }\n#pg-todos .item .store {\n  justify-self: center; appearance: none; border: 0; cursor: pointer; font-family: inherit;\n  font-size: 13px; font-weight: 700; color: var(--muted); background: var(--chip);\n  border-radius: 14px; padding: 6px 10px; max-width: 118px;\n  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;\n  transition: transform .12s, background-color .15s;\n}\n#pg-todos .item .store:active { transform: scale(.94); }\n#pg-todos .item .store.set { background: var(--ink); color: var(--bg); }\n#pg-todos .item .store:not(.set) { width: 46px; height: 28px; padding: 0; }\nbody.readonly #pg-todos .store { pointer-events: none; }\n#pg-todos .shop { width: 17px; height: 17px; stroke: currentColor; fill: none; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; display: block; margin: 0 auto; }\n#pg-todos .item .store:not(.set) { color: var(--muted); }\n#pg-todos .filterbar { display: flex; padding: 8px 0 2px; }\n#pg-todos .fpill {\n  appearance: none; border: 0; cursor: pointer; font-family: inherit;\n  font-size: 14px; font-weight: 700; padding: 6px 13px; border-radius: 15px;\n  background: var(--chip); color: var(--muted);\n  transition: background-color .15s, transform .12s;\n}\n#pg-todos .fpill:active { transform: scale(.95); }\n#pg-todos .fpill.on { background: var(--ink); color: var(--bg); }\n#pg-todos .fnone { display: inline-flex; align-items: center; gap: 6px; }\n#pg-todos .fnone .shop { margin: 0; width: 15px; height: 15px; }\n#pg-todos #hideBtn.on { background: var(--ink); color: var(--bg); }\n#pg-todos .nav { display: flex; gap: 8px; }\n#pg-todos #gear { display: none; }\nbody.editing #pg-todos #gear { display: grid; }\n#pg-todos .slist { display: flex; flex-direction: column; gap: 8px; max-height: 45vh; overflow-y: auto; }\n#pg-todos .srow { display: flex; gap: 8px; align-items: center; }\n#pg-todos .srow input { flex: 1; }\n#pg-todos .sdot { flex: 0 0 14px; height: 14px; border-radius: 7px; }\n#pg-todos .srow .mv, #pg-todos .srow .x {\n  flex: 0 0 38px; height: 38px; border: 0; border-radius: 10px; background: var(--chip);\n  color: var(--ink); font: inherit; font-size: 18px; font-weight: 700; cursor: pointer; display: grid; place-items: center;\n}\n#pg-todos .srow .x { color: var(--ash); }\n#pg-todos .srow .mv:disabled { opacity: .3; }\n#pg-todos .sheet h3 { margin: 0 0 12px; font-size: 20px; font-weight: 700; }\n#pg-todos .sheet .addstore { display: flex; gap: 8px; margin-top: 12px; }\n#pg-todos .sheet .addstore input { flex: 1; }\n#pg-todos .sheet .addstore button { border: 0; border-radius: 10px; background: var(--ink); color: var(--bg); font: inherit; font-weight: 700; padding: 0 16px; cursor: pointer; }\n#pg-todos .sheet-bg { position: fixed; inset: 0; background: rgba(0,0,0,.35); opacity: 0; pointer-events: none; transition: opacity .2s; z-index: 9; }\n#pg-todos .sheet-bg.show { opacity: 1; pointer-events: auto; }\n#pg-todos .sheet {\n  position: fixed; left: 50%; bottom: 0; transform: translate(-50%, 120%); z-index: 10;\n  width: 100%; max-width: 500px; background: var(--sheet); border-radius: 20px 20px 0 0;\n  padding: 20px 18px calc(20px + env(safe-area-inset-bottom, 0px));\n  transition: transform .25s cubic-bezier(.32,.72,0,1); box-shadow: 0 -8px 40px rgba(0,0,0,.18);\n}\n#pg-todos .sheet.show { transform: translate(-50%, 0); }\n#pg-todos .sheet label { display: block; font-size: 13px; font-weight: 700; color: var(--muted); margin: 12px 0 6px; }\n#pg-todos .sheet label:first-child { margin-top: 0; }\n#pg-todos .sheet input, #pg-todos .sheet textarea {\n  width: 100%; border: 0; border-radius: 10px; background: var(--field); color: var(--ink);\n  font: inherit; font-size: 16px; padding: 10px 12px; resize: none;\n}\n#pg-todos .sheet input:focus, #pg-todos .sheet textarea:focus { outline: 2px solid var(--ben); }\n#pg-todos .sheet textarea { min-height: 76px; }\n#pg-todos .spick {\n  appearance: none; border: 0; cursor: pointer; font-family: inherit;\n  font-size: 15px; font-weight: 700; border-radius: 16px; padding: 8px 16px;\n  min-width: 64px; min-height: 36px; background: var(--chip); color: var(--ink);\n  transition: transform .12s, background-color .15s;\n}\n#pg-todos .spick:active { transform: scale(.95); }\n#pg-todos .addpick { min-width: 54px; min-height: 0; font-size: 13px; padding: 0 12px; border-radius: 10px; max-width: 110px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n#pg-todos .spick.set { background: var(--ink); color: var(--bg); }\n#pg-todos .stores { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }\n#pg-todos .stores button {\n  border: 0; border-radius: 14px; background: var(--chip); color: var(--ink);\n  font: inherit; font-size: 14px; font-weight: 600; padding: 5px 12px; cursor: pointer;\n}\n#pg-todos .stores button.on { background: var(--ink); color: var(--bg); }\n#pg-todos .sheet .row { display: flex; gap: 10px; margin-top: 18px; }\n#pg-todos .sheet .row button { flex: 1; border: 0; border-radius: 12px; font: inherit; font-size: 16px; font-weight: 700; padding: 12px; cursor: pointer; }\n#pg-todos .sheet .del { background: var(--chip); color: var(--ash); }\n#pg-todos .sheet .done { background: var(--ink); color: var(--bg); }\n#pg-todos .sheet h2 { margin: 0 0 4px; font-size: 22px; font-weight: 700; letter-spacing: -0.3px; }\n#pg-todos .sheet .sub { margin: 0 0 16px; color: var(--muted); font-size: 15px; }\n#pg-todos .sheet input {\n  width: 100%; border: 0; border-radius: 12px; background: var(--field); color: var(--ink);\n  font: inherit; font-size: 17px; padding: 14px; margin-bottom: 10px;\n}\n#pg-todos .sheet input:focus { outline: 2px solid var(--ben); outline-offset: 0; }\n#pg-todos .sheet .go {\n  width: 100%; border: 0; border-radius: 12px; background: var(--ink); color: var(--bg);\n  font: inherit; font-size: 17px; font-weight: 700; padding: 14px; cursor: pointer;\n}\n#pg-todos .sheet .go:disabled { opacity: .5; }\n#pg-todos .sheet .cancel { display: block; width: 100%; margin-top: 10px; background: none; border: 0; color: var(--muted); font: inherit; font-size: 15px; cursor: pointer; }\n#pg-todos .sheet .err { color: var(--ash); font-size: 15px; min-height: 1.4em; margin: 0 0 6px; }\n#pg-todos .sheet form, #pg-todos form.sheet { margin: 0; }\n#pg-todos .sheet input[type=email], #pg-todos .sheet input[type=password] { margin-bottom: 10px; }\n#pg-todos .cols, #pg-todos .item { grid-template-columns: 1fr 86px 38px 40px !important; column-gap: 8px; }\n#pg-todos .cols span:nth-child(n+2) { text-align: center; }\n#pg-todos .item { min-height: 56px; }\n#pg-todos #addBtn { background: var(--ben); color: #fff; }\n#pg-todos #addBtn svg { width: 18px; height: 18px; }\n#pg-todos .who {\n  justify-self: center; appearance: none; border: 0; cursor: pointer; font-family: inherit;\n  width: 36px; height: 36px; border-radius: 18px; background: var(--chip); color: var(--muted);\n  font-size: 15px; font-weight: 800; display: grid; place-items: center; transition: transform .12s, background-color .15s;\n}\n#pg-todos .who:active { transform: scale(.92); }\n#pg-todos .who[data-v=\"A\"] { background: var(--ash); color: #fff; }\n#pg-todos .who[data-v=\"B\"] { background: var(--ben); color: #fff; }\n#pg-todos .who[data-v=\"Both\"] { background: var(--both); color: #fff; font-size: 10px; }\n#pg-todos .who svg { width: 17px; height: 17px; stroke: currentColor; fill: none; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; }\n#pg-todos .item.done .who { opacity: .6; }\n#pg-todos .sec { display: flex; align-items: center; gap: 8px; margin-top: 18px; padding-bottom: 4px; border-bottom: 0.5px solid var(--hair); }\n#pg-todos .sec:first-child { margin-top: 10px; }\n#pg-todos .sec h2 { margin: 0; font-size: 13px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .4px; }\n#pg-todos .sec .dot { width: 9px; height: 9px; border-radius: 5px; }\n#pg-todos .kind {\n  appearance: none; border: 0; cursor: pointer; font-family: inherit; white-space: nowrap;\n  font-size: 12.5px; font-weight: 650; border-radius: 15px; height: 30px; padding: 0 9px 0 8px; min-width: 72px;\n  background: var(--chip); color: var(--ink); justify-self: center;\n  display: inline-flex; align-items: center; justify-content: center; gap: 6px; transition: transform .12s;\n}\n#pg-todos .kind:active { transform: scale(.94); }\n#pg-todos .kind::before { content: \"\"; width: 8px; height: 8px; border-radius: 4px; flex: none; }\n#pg-todos .kind[data-k=\"daily\"]::before { background: var(--s3); }\n#pg-todos .kind[data-k=\"weekly\"]::before { background: var(--s5); }\n#pg-todos .kind[data-k=\"project\"]::before { background: var(--s4); }\n#pg-todos .kind[data-k=\"someday\"]::before { background: var(--s6); }\n#pg-todos .item.done .kind { opacity: .6; }\n#pg-todos .item .back { font-size: 13px; color: var(--muted); margin-top: 2px; }\n#pg-todos .sheet .kind { height: 36px; border-radius: 18px; padding: 0 16px; }\n#pg-todos .sheet.quick .kind { height: auto; border-radius: 10px; min-width: 78px; }\n#pg-todos .sheet.quick { display: flex; gap: 8px; padding-top: 10px; padding-bottom: 10px; border-radius: 16px 16px 0 0; }\n#pg-todos .sheet.quick input { flex: 1; min-width: 0; }\n#pg-todos .sheet.quick button[type=submit] { min-width: 72px; border: 0; border-radius: 10px; background: var(--ben); color: #fff; font: inherit; font-size: 16px; font-weight: 700; padding: 0 18px; cursor: pointer; }\n#pg-todos .sheet.quick button.finish { background: var(--ink); color: var(--bg); }\n#pg-todos .item.flash { animation: rowflash 1.4s ease-out; }\n@keyframes rowflash { 0%, 30% { background: color-mix(in srgb, var(--ben) 16%, var(--bg)); } 100% { background: var(--bg); } }\nbody.viewonly #pg-todos #addBtn, body.viewonly #pg-todos #gear, body.viewonly #pg-todos #clearBtn { display: none !important; }\nbody.viewonly #pg-todos #list, body.viewonly #pg-todos #gotList, body.viewonly #pg-todos #days { pointer-events: none; }\nbody.viewonly #pg-todos .who, body.viewonly #pg-todos .kind, body.viewonly #pg-todos .dpill, body.viewonly #pg-todos .store, body.viewonly #pg-todos .check, body.viewonly #pg-todos .when, body.viewonly #pg-todos .tile, body.viewonly #pg-todos .cell { cursor: default; }\n#pg-todos .item .check { justify-self: start; }\n#pg-todos .item .main { padding-left: 2px; }\n#pg-todos .del {\n  justify-self: center; appearance: none; border: 0; background: none; cursor: pointer; padding: 0;\n  width: 34px; height: 34px; border-radius: 17px; display: grid; place-items: center; color: var(--muted);\n}\n#pg-todos .del svg { width: 19px; height: 19px; stroke: currentColor; fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }\n#pg-todos .del:active { background: var(--chip); color: var(--ash); }\nbody.viewonly #pg-todos .del { visibility: hidden; }\n#pg-todos .undo {\n  position: fixed; left: 50%; bottom: calc(84px + env(safe-area-inset-bottom, 0px)); z-index: 30;\n  transform: translate(-50%, 16px); opacity: 0; pointer-events: none; transition: opacity .2s, transform .2s;\n  display: flex; align-items: center; gap: 14px; max-width: calc(100% - 32px);\n  background: var(--ink); color: var(--bg); border-radius: 22px; padding: 10px 10px 10px 16px;\n  font-size: 14px; font-weight: 600; box-shadow: 0 6px 24px rgba(0,0,0,.2);\n}\n#pg-todos .undo.show { opacity: 1; transform: translate(-50%, 0); pointer-events: auto; }\n#pg-todos .undo span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n#pg-todos .undo button { border: 0; border-radius: 14px; background: var(--ben); color: #fff; font: inherit; font-size: 14px; font-weight: 800; padding: 6px 14px; cursor: pointer; flex: none; }\n#pg-todos .cols, #pg-todos .item { grid-template-columns: 44px 1fr 86px 40px !important; column-gap: 6px; }\n#pg-todos .cols span:first-child { text-align: left; }\n#pg-todos .cols span:nth-child(2) { text-align: left !important; }\n#pg-todos .swipe { position: relative; overflow: hidden; }\n#pg-todos .swipe .item { position: relative; background: var(--bg); transition: transform .2s ease; touch-action: pan-y; }\n#pg-todos .swipe.dragging .item { transition: none; }\n#pg-todos .swipe .delbg {\n  position: absolute; top: 0; right: 0; bottom: 0; width: 88px; border: 0; cursor: pointer;\n  background: var(--ash); color: #fff; font: inherit; font-size: 15px; font-weight: 700;\n}\nbody.viewonly #pg-todos .swipe .delbg { display: none; }\n#pg-todos .swipe .delbg { visibility: hidden; }\n#pg-todos .swipe.dragging .delbg, #pg-todos .swipe.open .delbg { visibility: visible; }\n",

  html: "  <div class=\"top\">\n  <header>\n    <div><h1>TODOS<span class=\"count\" id=\"count\"></span></h1></div>\n    <div class=\"nav\">\n      <button id=\"addBtn\" aria-label=\"Add a TODO\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.6\" stroke-linecap=\"round\"><path d=\"M12 5v14M5 12h14\"/></svg></button>\n      <button id=\"hideBtn\" aria-label=\"Hide what's done\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/></svg></button>\n      <span class=\"vo\">View only</span>\n    </div>\n  </header>\n  <div class=\"cols\"><span>Done</span><span>TODO</span><span>Type</span><span>Who</span></div>\n  </div>\n  <div id=\"list\"></div>\n  <div class=\"got\" id=\"gotHead\"><h2>Done</h2><button id=\"clearBtn\">Clear</button></div>\n  <div id=\"gotList\"></div>\n<div class=\"sheet-bg\" id=\"sheetBg\"></div>\n<form class=\"sheet quick\" id=\"quickSheet\" autocomplete=\"off\">\n  <button type=\"button\" class=\"kind\" id=\"quickKind\"></button>\n  <input id=\"quickName\" placeholder=\"Add a TODO\" enterkeyhint=\"enter\">\n  <button type=\"submit\" id=\"quickBtn\">Done</button>\n</form>\n<div class=\"sheet\" id=\"sheet\">\n  <label for=\"fName\">TODO</label>\n  <input id=\"fName\" autocomplete=\"off\">\n  <label>Type</label>\n  <button type=\"button\" class=\"kind\" id=\"sheetKind\"></button>\n  <label for=\"fNote\">Note</label>\n  <textarea id=\"fNote\" placeholder=\"Details, what we need\u2026\"></textarea>\n  <div class=\"row\"><button class=\"del\" id=\"delBtn\">Delete</button><button class=\"done\" id=\"doneBtn\">Done</button></div>\n</div>\n",

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

    // ---- TODOS ----
    var todos = [];   // [{id, name, note, kind, who, done_at, created_at}]
    var TYPES = ["daily", "weekly", "project", "someday"];
    var LABEL = { daily: "Daily", weekly: "Weekly", project: "Project", someday: "Someday" };
    var WHO = ["", "A", "B", "Both"];
    var PERSON = '<svg viewBox="0 0 24 24"><circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5"/></svg>';
    var EYE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
    var EYE_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.3 4.1M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7a9.8 9.8 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>';
    var hideDone = false;
    try { hideDone = localStorage.getItem("t-hide") === "1"; } catch (e) {}
    function byId(id) { for (var i = 0; i < todos.length; i++) if (todos[i].id === id) return todos[i]; return null; }
    function save(t, fields) { db.from("todos").update(fields).eq("id", t.id).then(oops); }

    // Daily to-dos come back the next day, Weekly ones the next week (Monday);
    // Project and Someday stay done until Clear.
    function mondayOf(d) { var x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; }
    function isDone(t) {
      if (!t.done_at) return false;
      var d = new Date(t.done_at), now = new Date();
      if (t.kind === "daily") return d.toDateString() === now.toDateString();
      if (t.kind === "weekly") return mondayOf(d).getTime() === mondayOf(now).getTime();
      return true;
    }
    function oneOff(t) { return t.kind === "project" || t.kind === "someday"; }
    function backLabel(t) { return t.kind === "daily" ? "Back tomorrow" : t.kind === "weekly" ? "Back Monday" : ""; }
    function paintWho(el, v) { el.dataset.v = v || ""; if (v) el.textContent = v; else el.innerHTML = PERSON; }
    function paintKind(el, k) { el.dataset.k = k; el.textContent = LABEL[k] || "Weekly"; }
    function nextKind(k) { return TYPES[(TYPES.indexOf(k) + 1) % TYPES.length]; }

    function row(t) {
      var el = document.createElement("div");
      var done = isDone(t);
      el.className = "item" + (done ? " done" : ""); el.dataset.id = t.id;
      el.innerHTML = '<button class="check" aria-label="Done"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></button>' +
        '<button class="main"><div class="name">' + esc(t.name) + '</div>' +
        (t.note ? '<div class="note">' + esc(t.note) + '</div>' : '') +
        (done && backLabel(t) ? '<div class="back">' + backLabel(t) + '</div>' : '') + '</button>' +
        '<button class="kind" aria-label="Type"></button>' +
        '<button class="who" aria-label="Who"></button>';
      var kp = el.querySelector(".kind"); paintKind(kp, t.kind);
      kp.addEventListener("click", function () { t.kind = nextKind(t.kind); paintKind(kp, t.kind); settleLater(t.id, function () { save(t, { kind: t.kind }); }); });
      var w = el.querySelector(".who"); paintWho(w, t.who);
      w.addEventListener("click", function () { t.who = WHO[(WHO.indexOf(t.who || "") + 1) % WHO.length]; paintWho(w, t.who); save(t, { who: t.who }); });
      el.querySelector(".main").addEventListener("click", function () { openSheet(t.id); });
      el.querySelector(".check").addEventListener("click", function () {
        t.done_at = done ? null : new Date().toISOString(); render(); save(t, { done_at: t.done_at });
      });
      return swipeable(el, function () {
        if (String(t.id).indexOf("tmp") === 0) return;
        todos = todos.filter(function (x) { return x !== t; }); render();
        deleteWithUndo(t.id, t.name,
          function () { db.from("todos").delete().eq("id", t.id).then(oops); },
          function () { todos.push(t); render(); });
      });
    }
    function render() {
      $("list").innerHTML = ""; $("gotList").innerHTML = "";
      var order = function (a, b) {
        var ka = TYPES.indexOf(a.kind), kb = TYPES.indexOf(b.kind);
        return ka !== kb ? ka - kb : (a.created_at < b.created_at ? 1 : -1);
      };
      var open = todos.filter(function (t) { return !isDone(t); }).sort(order);
      open.forEach(function (t) { $("list").appendChild(row(t)); });
      if (!open.length) $("list").innerHTML = '<div class="empty">' + (todos.length ? "All done. Nice." : "Nothing yet. Tap + to add some.") + '</div>';
      var done = todos.filter(isDone).sort(order);
      if (!hideDone) done.forEach(function (t) { $("gotList").appendChild(row(t)); });
      $("gotHead").style.display = (done.length && !hideDone) ? "" : "none";
      // Clear only removes finished one-offs; Daily/Weekly stay and come back on their own
      $("clearBtn").style.visibility = done.some(oneOff) ? "" : "hidden";
      $("hideBtn").innerHTML = hideDone ? EYE_OFF : EYE; $("hideBtn").classList.toggle("on", hideDone);
      $("count").textContent = open.length ? open.length + " to do" : "";
    }
    $("hideBtn").addEventListener("click", function () {
      hideDone = !hideDone; try { localStorage.setItem("t-hide", hideDone ? "1" : "0"); } catch (e) {} render();
    });
    $("clearBtn").addEventListener("click", function () {
      var gone = todos.filter(function (t) { return isDone(t) && oneOff(t); });
      todos = todos.filter(function (t) { return gone.indexOf(t) < 0; }); render();
      gone.forEach(function (t) { db.from("todos").delete().eq("id", t.id).then(oops); });
    });

    // ---- quick add: pick the type once, then Enter, Enter, Enter ----
    var quickKind = "weekly";
    try { quickKind = localStorage.getItem("t-quick") || "weekly"; } catch (e) {}
    $("quickKind").addEventListener("click", function () {
      quickKind = nextKind(quickKind); paintKind($("quickKind"), quickKind); $("quickName").focus();
      try { localStorage.setItem("t-quick", quickKind); } catch (e) {}
    });
    $("addBtn").addEventListener("click", function () { paintKind($("quickKind"), quickKind); showQuick(); });
    $("quickSheet").addEventListener("submit", function (e) {
      e.preventDefault();
      var v = $("quickName").value.trim();
      if (!v) { closeQuick(); if (lastAdded) setTimeout(function () { reveal(lastAdded); }, 350); return; }
      var temp = { id: "tmp" + Date.now() + Math.random(), name: v, note: "", kind: quickKind, who: "", done_at: null, created_at: new Date().toISOString() };
      todos.push(temp); render(); lastAdded = temp.id; reveal(temp.id);
      $("quickName").value = ""; paintQuick(); $("quickName").focus();
      db.from("todos").insert({ name: v, kind: quickKind }).select().single().then(function (res) {
        if (oops(res)) return;
        if (lastAdded === temp.id) lastAdded = res.data.id;
        var i = todos.indexOf(temp);
        if (byId(res.data.id)) { if (i >= 0) todos.splice(i, 1); } else if (i >= 0) todos[i] = res.data; else todos.push(res.data);
        render(); if (lastAdded === res.data.id) reveal(res.data.id);
      });
    });

    // ---- edit sheet ----
    var sheetKind = "weekly";
    $("sheetKind").addEventListener("click", function () { sheetKind = nextKind(sheetKind); paintKind($("sheetKind"), sheetKind); });
    function openSheet(id) {
      var t = byId(id); if (!t || String(t.id).indexOf("tmp") === 0) return;
      openId = id; $("fName").value = t.name; $("fNote").value = t.note || ""; sheetKind = t.kind; paintKind($("sheetKind"), sheetKind);
      showSheet();
    }
    function closeSheet(keep) {
      var t = byId(openId);
      if (t && keep) {
        var ch = { name: $("fName").value.trim() || t.name, note: $("fNote").value.trim(), kind: sheetKind };
        if (ch.name !== t.name || ch.note !== (t.note || "") || ch.kind !== t.kind) { Object.assign(t, ch); save(t, ch); }
      }
      openId = null; hideSheet(); render();
    }
    $("doneBtn").addEventListener("click", function () { closeSheet(true); });
    $("delBtn").addEventListener("click", function () {
      var id = openId; todos = todos.filter(function (x) { return x.id !== id; }); closeSheet(false);
      db.from("todos").delete().eq("id", id).then(oops);
    });
    $("sheetBg").addEventListener("click", function () { if ($("quickSheet").classList.contains("show")) closeQuick(); else closeSheet(true); });

    function loadAll() {
      return db.from("todos").select("*").then(function (r) {
        if (r.error) { toast("Couldn't load TODOS."); return; }
        todos = (r.data || []).filter(notPending);
        if (!openId && !settleT) render();
      });
    }
    // Daily/Weekly items come back at midnight / Monday even if the app stays open
    setInterval(function () { if (started && !openId && !settleT) render(); }, 60000);

    // ---- load + live sync ----
    var reloadT;
    function soon() { clearTimeout(reloadT); reloadT = setTimeout(loadAll, 250); }
    var started = false;
    function START() {
      if (started) { loadAll(); return; }
      started = true;
      db.channel("todos" + "-live").on("postgres_changes", { event: "*", schema: "public", table: "todos" }, soon).subscribe();
      render(); loadAll();
    }

    // hooks the app shell calls
    this.refresh = function () { if (started) loadAll(); };   // phone woke up, or this tab opened again
    START();
  }
});
