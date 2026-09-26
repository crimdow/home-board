/* Home Board: Groceries page. Loaded by index.html, which provides the sign-in, tab bar,
   theme, HB.db (Supabase), HB.toast and the shared swipe / undo helpers. */
HB.register("groceries", {
  title: "Groceries",

  css: "#pg-groceries header { display: flex; align-items: center; justify-content: space-between; padding: 4px 0 0; }\n#pg-groceries h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.4px; line-height: 1.1; }\n#pg-groceries .count { color: var(--muted); font-size: 14px; font-weight: 600; margin-left: 8px; }\n#pg-groceries .nav button {\n  width: 36px; height: 36px; border-radius: 50%; border: 0; background: var(--chip); color: var(--ink);\n  display: grid; place-items: center; cursor: pointer;\n}\n#pg-groceries .nav svg { width: 18px; height: 18px; }\n#pg-groceries .cols {\n  display: grid; grid-template-columns: 1fr 120px 46px;\n  padding: 8px 0 6px; border-bottom: 0.5px solid var(--hair);\n  font-size: 13px; font-weight: 700; color: var(--muted);\n}\n#pg-groceries .cols span:nth-child(2) { text-align: center; }\n#pg-groceries .cols span:nth-child(3) { text-align: center; }\n#pg-groceries .add { display: none; gap: 8px; padding: 10px 0; border-bottom: 0.5px solid var(--hair); }\nbody.editing #pg-groceries .add { display: flex; }\n#pg-groceries .add input {\n  flex: 1; border: 0; border-radius: 10px; background: var(--field); color: var(--ink);\n  font: inherit; font-size: 16px; padding: 9px 12px; min-width: 0;\n}\n#pg-groceries .add input:focus { outline: 2px solid var(--ben); }\n#pg-groceries .add button[type=\"submit\"] {\n  border: 0; border-radius: 10px; background: var(--ben); color: #fff;\n  font: inherit; font-weight: 700; font-size: 15px; padding: 0 16px; cursor: pointer;\n}\n#pg-groceries .item {\n  display: grid; grid-template-columns: 1fr 120px 46px; align-items: center;\n  min-height: 52px; padding: 6px 0; border-bottom: 0.5px solid var(--hair);\n}\n#pg-groceries .item .main { appearance: none; border: 0; background: none; color: inherit; font: inherit; text-align: left; padding: 4px 8px 4px 0; cursor: pointer; }\n#pg-groceries .item .name { font-size: 17px; font-weight: 650; line-height: 1.25; }\n#pg-groceries .item .note { font-size: 14px; color: var(--muted); line-height: 1.3; margin-top: 2px; white-space: pre-wrap; }\n#pg-groceries .check {\n  justify-self: center; width: 30px; height: 30px; border-radius: 15px; border: 2px solid var(--muted);\n  background: none; cursor: pointer; display: grid; place-items: center; padding: 0;\n  transition: background-color .15s, border-color .15s, transform .12s;\n}\n#pg-groceries .check:active { transform: scale(.9); }\n#pg-groceries .check svg { width: 16px; height: 16px; stroke: #fff; stroke-width: 3; fill: none; stroke-linecap: round; stroke-linejoin: round; opacity: 0; }\n#pg-groceries .item.done .check { background: var(--both); border-color: var(--both); }\n#pg-groceries .item.done .check svg { opacity: 1; }\n#pg-groceries .item.done .name { text-decoration: line-through; color: var(--muted); font-weight: 500; }\n#pg-groceries .item.done .store, #pg-groceries .item.done .note { opacity: .6; }\n#pg-groceries .got { display: flex; align-items: center; justify-content: space-between; margin-top: 22px; padding-bottom: 4px; border-bottom: 0.5px solid var(--hair); }\n#pg-groceries .got h2 { margin: 0; font-size: 13px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .4px; }\n#pg-groceries .got button { border: 0; background: none; color: var(--ash); font: inherit; font-size: 14px; font-weight: 700; cursor: pointer; padding: 6px 0; display: none; }\nbody.editing #pg-groceries .got button { display: block; }\n#pg-groceries .empty { color: var(--muted); text-align: center; padding: 28px 0; font-size: 15px; }\nbody.readonly #pg-groceries .main, body.readonly #pg-groceries .check { pointer-events: none; }\n#pg-groceries .item .store {\n  justify-self: center; appearance: none; border: 0; cursor: pointer; font-family: inherit;\n  font-size: 13px; font-weight: 700; color: var(--muted); background: var(--chip);\n  border-radius: 14px; padding: 6px 10px; max-width: 118px;\n  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;\n  transition: transform .12s, background-color .15s;\n}\n#pg-groceries .item .store:active { transform: scale(.94); }\n#pg-groceries .item .store.set { background: var(--ink); color: var(--bg); }\n#pg-groceries .item .store:not(.set) { width: 46px; height: 28px; padding: 0; }\nbody.readonly #pg-groceries .store { pointer-events: none; }\n#pg-groceries .shop { width: 17px; height: 17px; stroke: currentColor; fill: none; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; display: block; margin: 0 auto; }\n#pg-groceries .item .store:not(.set) { color: var(--muted); }\n#pg-groceries .filterbar { display: flex; padding: 8px 0 2px; }\n#pg-groceries .fpill {\n  appearance: none; border: 0; cursor: pointer; font-family: inherit;\n  font-size: 14px; font-weight: 700; padding: 6px 13px; border-radius: 15px;\n  background: var(--chip); color: var(--muted);\n  transition: background-color .15s, transform .12s;\n}\n#pg-groceries .fpill:active { transform: scale(.95); }\n#pg-groceries .fpill.on { background: var(--ink); color: var(--bg); }\n#pg-groceries .fnone { display: inline-flex; align-items: center; gap: 6px; }\n#pg-groceries .fnone .shop { margin: 0; width: 15px; height: 15px; }\n#pg-groceries #hideBtn.on { background: var(--ink); color: var(--bg); }\n#pg-groceries .nav { display: flex; gap: 8px; }\n#pg-groceries #gear { display: none; }\nbody.editing #pg-groceries #gear { display: grid; }\n#pg-groceries .slist { display: flex; flex-direction: column; gap: 8px; max-height: 45vh; overflow-y: auto; }\n#pg-groceries .srow { display: flex; gap: 8px; align-items: center; }\n#pg-groceries .srow input { flex: 1; }\n#pg-groceries .sdot { flex: 0 0 14px; height: 14px; border-radius: 7px; }\n#pg-groceries .srow .mv, #pg-groceries .srow .x {\n  flex: 0 0 38px; height: 38px; border: 0; border-radius: 10px; background: var(--chip);\n  color: var(--ink); font: inherit; font-size: 18px; font-weight: 700; cursor: pointer; display: grid; place-items: center;\n}\n#pg-groceries .srow .x { color: var(--ash); }\n#pg-groceries .srow .mv:disabled { opacity: .3; }\n#pg-groceries .sheet h3 { margin: 0 0 12px; font-size: 20px; font-weight: 700; }\n#pg-groceries .sheet .addstore { display: flex; gap: 8px; margin-top: 12px; }\n#pg-groceries .sheet .addstore input { flex: 1; }\n#pg-groceries .sheet .addstore button { border: 0; border-radius: 10px; background: var(--ink); color: var(--bg); font: inherit; font-weight: 700; padding: 0 16px; cursor: pointer; }\n#pg-groceries .sheet-bg { position: fixed; inset: 0; background: rgba(0,0,0,.35); opacity: 0; pointer-events: none; transition: opacity .2s; z-index: 9; }\n#pg-groceries .sheet-bg.show { opacity: 1; pointer-events: auto; }\n#pg-groceries .sheet {\n  position: fixed; left: 50%; bottom: 0; transform: translate(-50%, 120%); z-index: 10;\n  width: 100%; max-width: 500px; background: var(--sheet); border-radius: 20px 20px 0 0;\n  padding: 20px 18px calc(20px + env(safe-area-inset-bottom, 0px));\n  transition: transform .25s cubic-bezier(.32,.72,0,1); box-shadow: 0 -8px 40px rgba(0,0,0,.18);\n}\n#pg-groceries .sheet.show { transform: translate(-50%, 0); }\n#pg-groceries .sheet label { display: block; font-size: 13px; font-weight: 700; color: var(--muted); margin: 12px 0 6px; }\n#pg-groceries .sheet label:first-child { margin-top: 0; }\n#pg-groceries .sheet input, #pg-groceries .sheet textarea {\n  width: 100%; border: 0; border-radius: 10px; background: var(--field); color: var(--ink);\n  font: inherit; font-size: 16px; padding: 10px 12px; resize: none;\n}\n#pg-groceries .sheet input:focus, #pg-groceries .sheet textarea:focus { outline: 2px solid var(--ben); }\n#pg-groceries .sheet textarea { min-height: 76px; }\n#pg-groceries .spick {\n  appearance: none; border: 0; cursor: pointer; font-family: inherit;\n  font-size: 15px; font-weight: 700; border-radius: 16px; padding: 8px 16px;\n  min-width: 64px; min-height: 36px; background: var(--chip); color: var(--ink);\n  transition: transform .12s, background-color .15s;\n}\n#pg-groceries .spick:active { transform: scale(.95); }\n#pg-groceries .addpick { min-width: 54px; min-height: 0; font-size: 13px; padding: 0 12px; border-radius: 10px; max-width: 110px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n#pg-groceries .spick.set { background: var(--ink); color: var(--bg); }\n#pg-groceries .stores { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }\n#pg-groceries .stores button {\n  border: 0; border-radius: 14px; background: var(--chip); color: var(--ink);\n  font: inherit; font-size: 14px; font-weight: 600; padding: 5px 12px; cursor: pointer;\n}\n#pg-groceries .stores button.on { background: var(--ink); color: var(--bg); }\n#pg-groceries .sheet .row { display: flex; gap: 10px; margin-top: 18px; }\n#pg-groceries .sheet .row button { flex: 1; border: 0; border-radius: 12px; font: inherit; font-size: 16px; font-weight: 700; padding: 12px; cursor: pointer; }\n#pg-groceries .sheet .del { background: var(--chip); color: var(--ash); }\n#pg-groceries .sheet .done { background: var(--ink); color: var(--bg); }\n#pg-groceries .sheet h2 { margin: 0 0 4px; font-size: 22px; font-weight: 700; letter-spacing: -0.3px; }\n#pg-groceries .sheet .sub { margin: 0 0 16px; color: var(--muted); font-size: 15px; }\n#pg-groceries .sheet input {\n  width: 100%; border: 0; border-radius: 12px; background: var(--field); color: var(--ink);\n  font: inherit; font-size: 17px; padding: 14px; margin-bottom: 10px;\n}\n#pg-groceries .sheet input:focus { outline: 2px solid var(--ben); outline-offset: 0; }\n#pg-groceries .sheet .go {\n  width: 100%; border: 0; border-radius: 12px; background: var(--ink); color: var(--bg);\n  font: inherit; font-size: 17px; font-weight: 700; padding: 14px; cursor: pointer;\n}\n#pg-groceries .sheet .go:disabled { opacity: .5; }\n#pg-groceries .sheet .cancel { display: block; width: 100%; margin-top: 10px; background: none; border: 0; color: var(--muted); font: inherit; font-size: 15px; cursor: pointer; }\n#pg-groceries .sheet .err { color: var(--ash); font-size: 15px; min-height: 1.4em; margin: 0 0 6px; }\n#pg-groceries .sheet form, #pg-groceries form.sheet { margin: 0; }\n#pg-groceries .sheet input[type=email], #pg-groceries .sheet input[type=password] { margin-bottom: 10px; }\n#pg-groceries .item.flash { animation: rowflash 1.4s ease-out; }\n@keyframes rowflash { 0%, 30% { background: color-mix(in srgb, var(--ben) 16%, var(--bg)); } 100% { background: var(--bg); } }\n#pg-groceries #addBtn { background: var(--ben); color: #fff; }\n#pg-groceries #addBtn svg { width: 18px; height: 18px; }\n#pg-groceries .sheet.quick { display: flex; gap: 8px; padding-top: 10px; padding-bottom: 10px; border-radius: 16px 16px 0 0; }\n#pg-groceries .sheet.quick input { flex: 1; min-width: 0; }\n#pg-groceries .sheet.quick button { min-width: 72px; border: 0; border-radius: 10px; background: var(--ben); color: #fff; font: inherit; font-size: 16px; font-weight: 700; padding: 0 18px; cursor: pointer; }\n#pg-groceries .sheet.quick button.finish { background: var(--ink); color: var(--bg); }\nbody.viewonly #pg-groceries #addBtn, body.viewonly #pg-groceries #gear, body.viewonly #pg-groceries #clearBtn { display: none !important; }\nbody.viewonly #pg-groceries #list, body.viewonly #pg-groceries #gotList, body.viewonly #pg-groceries #days { pointer-events: none; }\nbody.viewonly #pg-groceries .who, body.viewonly #pg-groceries .kind, body.viewonly #pg-groceries .dpill, body.viewonly #pg-groceries .store, body.viewonly #pg-groceries .check, body.viewonly #pg-groceries .when, body.viewonly #pg-groceries .tile, body.viewonly #pg-groceries .cell { cursor: default; }\n#pg-groceries .item .check { justify-self: start; }\n#pg-groceries .item .main { padding-left: 2px; }\n#pg-groceries .del {\n  justify-self: center; appearance: none; border: 0; background: none; cursor: pointer; padding: 0;\n  width: 34px; height: 34px; border-radius: 17px; display: grid; place-items: center; color: var(--muted);\n}\n#pg-groceries .del svg { width: 19px; height: 19px; stroke: currentColor; fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }\n#pg-groceries .del:active { background: var(--chip); color: var(--ash); }\nbody.viewonly #pg-groceries .del { visibility: hidden; }\n#pg-groceries .undo {\n  position: fixed; left: 50%; bottom: calc(84px + env(safe-area-inset-bottom, 0px)); z-index: 30;\n  transform: translate(-50%, 16px); opacity: 0; pointer-events: none; transition: opacity .2s, transform .2s;\n  display: flex; align-items: center; gap: 14px; max-width: calc(100% - 32px);\n  background: var(--ink); color: var(--bg); border-radius: 22px; padding: 10px 10px 10px 16px;\n  font-size: 14px; font-weight: 600; box-shadow: 0 6px 24px rgba(0,0,0,.2);\n}\n#pg-groceries .undo.show { opacity: 1; transform: translate(-50%, 0); pointer-events: auto; }\n#pg-groceries .undo span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n#pg-groceries .undo button { border: 0; border-radius: 14px; background: var(--ben); color: #fff; font: inherit; font-size: 14px; font-weight: 800; padding: 6px 14px; cursor: pointer; flex: none; }\n#pg-groceries .cols, #pg-groceries .item { grid-template-columns: 40px 1fr 112px !important; column-gap: 4px; }\n#pg-groceries .cols span:first-child { text-align: left; }\n#pg-groceries .cols span:nth-child(2) { text-align: left !important; padding-left: 2px; }\n#pg-groceries .swipe { position: relative; overflow: hidden; }\n#pg-groceries .swipe .item { position: relative; background: var(--bg); transition: transform .2s ease; touch-action: pan-y; }\n#pg-groceries .swipe.dragging .item { transition: none; }\n#pg-groceries .swipe .delbg {\n  position: absolute; top: 0; right: 0; bottom: 0; width: 88px; border: 0; cursor: pointer;\n  background: var(--ash); color: #fff; font: inherit; font-size: 15px; font-weight: 700;\n}\nbody.viewonly #pg-groceries .swipe .delbg { display: none; }\n#pg-groceries .swipe .delbg { visibility: hidden; }\n#pg-groceries .swipe.dragging .delbg, #pg-groceries .swipe.open .delbg { visibility: visible; }\n",

  html: "  <div class=\"top\">\n  <header>\n    <div><h1>Groceries<span class=\"count\" id=\"count\"></span></h1></div>\n    <div class=\"nav\">\n      <button id=\"gear\" aria-label=\"Stores\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 7h10M18 7h2M4 17h4M12 17h8\"/><circle cx=\"16\" cy=\"7\" r=\"2\"/><circle cx=\"10\" cy=\"17\" r=\"2\"/></svg></button>\n      <button id=\"addBtn\" aria-label=\"Add an item\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.6\" stroke-linecap=\"round\"><path d=\"M12 5v14M5 12h14\"/></svg></button>\n      <button id=\"hideBtn\" aria-label=\"Hide items you've got\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/></svg></button>\n      <span class=\"vo\">View only</span>\n    </div>\n  </header>\n  <div class=\"filterbar\"><button class=\"fpill\" id=\"storeFilter\">All stores</button></div>\n  <div class=\"cols\"><span>Got</span><span>Item</span><span>Store</span></div>\n  </div>\n  <div id=\"list\"></div>\n  <div class=\"got\" id=\"gotHead\"><h2>Got it</h2><button id=\"clearBtn\">Clear</button></div>\n  <div id=\"gotList\"></div>\n<div class=\"sheet-bg\" id=\"sheetBg\"></div>\n<form class=\"sheet quick\" id=\"quickSheet\" autocomplete=\"off\">\n  <input id=\"quickName\" placeholder=\"Add an item\" enterkeyhint=\"enter\">\n  <button type=\"submit\" id=\"quickBtn\">Done</button>\n</form>\n<div class=\"sheet\" id=\"sheet\">\n  <label for=\"fName\">Item</label>\n  <input id=\"fName\" autocomplete=\"off\">\n  <label>Store</label>\n  <button type=\"button\" class=\"spick\" id=\"storePick\"></button>\n  <label for=\"fNote\">Note</label>\n  <textarea id=\"fNote\" placeholder=\"Brand, size, which kind\u2026\"></textarea>\n  <div class=\"row\"><button class=\"del\" id=\"delBtn\">Delete</button><button class=\"done\" id=\"doneBtn\">Done</button></div>\n</div>\n<div class=\"sheet\" id=\"storeSheet\">\n  <h3>Stores</h3>\n  <div class=\"slist\" id=\"slist\"></div>\n  <form class=\"addstore\" id=\"addStoreForm\"><input id=\"addStore\" placeholder=\"Add a store\" autocomplete=\"off\"><button type=\"submit\">Add</button></form>\n  <div class=\"row\"><button class=\"done\" id=\"storeDone\">Done</button></div>\n</div>\n",

  mount: function (root) {
    root.innerHTML = this.html;

    var db = HB.db;

    var $ = function (id) { return root.querySelector("#" + id); };

    // shared helpers from the app shell
    var swipeable = HB.swipeable, deleteWithUndo = HB.deleteWithUndo, notPending = HB.notPending, flushDelete = HB.flushDelete;
    function reveal(id) { HB.reveal(root, id); }
    var lastAdded = null;

    var stores = [];   // [{id, name, position}]
    var items = [];    // [{id, name, store_id, note, done, created_at}]
    var editing = true, openId = null;   // always editable once signed in
    var NONE = "__none";
    var filterStore = "", hideGot = false;
    try { hideGot = localStorage.getItem("g-hide") === "1"; filterStore = localStorage.getItem("g-store") || ""; } catch (e) {}
    function saveFilters() { try { localStorage.setItem("g-hide", hideGot ? "1" : "0"); localStorage.setItem("g-store", filterStore); } catch (e) {} }

    var SHOP = '<svg class="shop" viewBox="0 0 24 24"><path d="M4 9.5L5.5 4h13L20 9.5"/><path d="M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0"/><path d="M5.5 11.5V20h13v-8.5M10 20v-5h4v5"/></svg>';
    function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
    var toast = HB.toast;
    function oops(res) { if (res && res.error) { toast("Couldn't save. Check your connection."); loadAll(); return true; } return false; }

    function storeById(id) { for (var i = 0; i < stores.length; i++) if (stores[i].id === id) return stores[i]; return null; }
    function storeIndex(id) { for (var i = 0; i < stores.length; i++) if (stores[i].id === id) return i; return -1; }
    function tint(el, id) {
      var i = id ? storeIndex(id) : -1;
      el.style.background = i < 0 ? "" : "var(--s" + (i % 6) + ")";
      el.style.color = i < 0 ? "" : "#fff";
    }
    function paintPill(el, id) {
      var s = id ? storeById(id) : null;
      if (s) el.textContent = s.name; else el.innerHTML = SHOP;
      el.classList.toggle("set", !!s); tint(el, s ? id : "");
    }
    function nextStore(id) {
      var cycle = [""].concat(stores.map(function (s) { return s.id; }));
      return cycle[(cycle.indexOf(id || "") + 1) % cycle.length];
    }

    // ---- filters ----
    var EYE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
    var EYE_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.3 4.1M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7a9.8 9.8 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>';
    function renderFilters() {
      var p = $("storeFilter");
      if (filterStore === NONE) { p.innerHTML = '<span class="fnone">' + SHOP + 'No store</span>'; tint(p, ""); }
      else { var s = storeById(filterStore); p.textContent = s ? s.name : "All stores"; tint(p, s ? filterStore : ""); }
      p.classList.toggle("on", !!filterStore);
      $("hideBtn").innerHTML = hideGot ? EYE_OFF : EYE;
      $("hideBtn").classList.toggle("on", hideGot);
    }
    $("storeFilter").addEventListener("click", function () {
      var cycle = [""].concat(stores.map(function (s) { return s.id; }), [NONE]);
      filterStore = cycle[(cycle.indexOf(filterStore) + 1) % cycle.length];
      saveFilters(); render();
    });
    $("hideBtn").addEventListener("click", function () { hideGot = !hideGot; saveFilters(); render(); });

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
    function row(it) {
      var el = document.createElement("div");
      el.className = "item" + (it.done ? " done" : ""); el.dataset.id = it.id;
      el.innerHTML =
        '<button class="check" aria-label="Got it"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></button>' +
        '<button class="main"><div class="name">' + esc(it.name) + '</div>' +
        (it.note ? '<div class="note">' + esc(it.note) + '</div>' : '') + '</button>' +
        '<button class="store"></button>';
      var st = el.querySelector(".store");
      paintPill(st, it.store_id);
      el.querySelector(".main").addEventListener("click", function () { if (editing) openSheet(it.id); });
      st.addEventListener("click", function () {
        if (!editing) return;
        it.store_id = nextStore(it.store_id) || null; paintPill(st, it.store_id);
        settleLater(it.id, function () { db.from("grocery_items").update({ store_id: it.store_id }).eq("id", it.id).then(oops); });
      });
      el.querySelector(".check").addEventListener("click", function () {
        if (!editing) return;
        it.done = !it.done; render();
        db.from("grocery_items").update({ done: it.done }).eq("id", it.id).then(oops);
      });
      return swipeable(el, function () {
        if (String(it.id).indexOf("tmp") === 0) return;
        items = items.filter(function (x) { return x !== it; }); render();
        deleteWithUndo(it.id, it.name,
          function () { db.from("grocery_items").delete().eq("id", it.id).then(oops); },
          function () { items.push(it); render(); });
      });
    }

    function render() {
      if (filterStore && filterStore !== NONE && !storeById(filterStore)) filterStore = "";
      renderFilters();
      var list = $("list"), got = $("gotList");
      list.innerHTML = ""; got.innerHTML = "";
      var shown = items.filter(function (i) {
        if (!filterStore) return true;
        if (filterStore === NONE) return !i.store_id;
        return i.store_id === filterStore;
      });
      var newest = function (a, b) { return a.created_at < b.created_at ? 1 : -1; };
      var todo = shown.filter(function (i) { return !i.done; }).sort(newest);
      var done = shown.filter(function (i) { return i.done; }).sort(newest);
      todo.forEach(function (i) { list.appendChild(row(i)); });
      if (!todo.length) {
        var fs = storeById(filterStore);
        list.innerHTML = '<div class="empty">' + (filterStore === NONE ? "Nothing without a store" : fs ? "Nothing for " + esc(fs.name) : "Nothing on the list") + '</div>';
      }
      if (!hideGot) done.forEach(function (i) { got.appendChild(row(i)); });
      $("gotHead").style.display = (done.length && !hideGot) ? "" : "none";
      var left = items.filter(function (i) { return !i.done; }).length;
      $("count").textContent = left ? left + " to get" : "";
    }

    // ---- quick add: + opens the bar; Enter adds and stays open; empty box -> Done closes ----
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
    function openQuick() {
      var s = storeById(filterStore);
      $("quickName").value = ""; $("quickName").placeholder = s ? "Add an item for " + s.name : "Add an item"; paintQuick();
      $("quickSheet").classList.add("show"); $("sheetBg").classList.add("show"); $("quickName").focus(); hugKeyboard();
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
      // if a store filter is on, new items go into that store so they stay in view
      var store = storeById(filterStore) ? filterStore : null;
      var temp = { id: "tmp" + Date.now() + Math.random(), name: v, store_id: store, note: "", done: false, created_at: new Date().toISOString() };
      items.push(temp); render(); lastAdded = temp.id; reveal(temp.id);
      $("quickName").value = ""; paintQuick(); $("quickName").focus();
      db.from("grocery_items").insert({ name: v, store_id: store }).select().single().then(function (res) {
        if (oops(res)) return;
        if (lastAdded === temp.id) lastAdded = res.data.id;
        var i = items.indexOf(temp);
        if (items.some(function (x) { return x.id === res.data.id; })) { if (i >= 0) items.splice(i, 1); }
        else if (i >= 0) items[i] = res.data; else items.push(res.data);
        render(); if (lastAdded === res.data.id) reveal(res.data.id);
      });
    });
    $("clearBtn").addEventListener("click", function () {
      items = items.filter(function (i) { return !i.done; }); render();
      db.from("grocery_items").delete().eq("done", true).then(oops);
    });

    // ---- sheets ----
    function showSheet(id) { $(id).classList.add("show"); $("sheetBg").classList.add("show"); }
    function hideSheets() {
      ["sheet", "storeSheet"].forEach(function (id) { $(id).classList.remove("show"); });
      $("sheetBg").classList.remove("show");
      if (document.activeElement) document.activeElement.blur();
    }

    // item sheet
    var sheetStore = "";
    $("storePick").addEventListener("click", function () { sheetStore = nextStore(sheetStore); paintPill($("storePick"), sheetStore); });
    function openSheet(id) {
      var it = items.find(function (i) { return i.id === id; }); if (!it || String(it.id).indexOf("tmp") === 0) return;
      openId = id; sheetStore = it.store_id || "";
      $("fName").value = it.name; $("fNote").value = it.note || "";
      paintPill($("storePick"), sheetStore); showSheet("sheet");
    }
    function closeItem(save) {
      var it = items.find(function (i) { return i.id === openId; });
      if (it && save) {
        var ch = { name: $("fName").value.trim() || it.name, store_id: sheetStore || null, note: $("fNote").value.trim() };
        if (ch.name !== it.name || ch.store_id !== (it.store_id || null) || ch.note !== (it.note || "")) {
          Object.assign(it, ch);
          db.from("grocery_items").update(ch).eq("id", it.id).then(oops);
        }
      }
      openId = null; hideSheets(); render();
    }
    $("doneBtn").addEventListener("click", function () { closeItem(true); });
    $("delBtn").addEventListener("click", function () {
      var id = openId;
      items = items.filter(function (i) { return i.id !== id; }); closeItem(false);
      db.from("grocery_items").delete().eq("id", id).then(oops);
    });

    // store settings
    function renderStores() {
      var box = $("slist"); box.innerHTML = "";
      if (!stores.length) box.innerHTML = '<div class="empty" style="padding:12px 0">No stores yet</div>';
      stores.forEach(function (s, i) {
        var r = document.createElement("div"); r.className = "srow";
        r.innerHTML = '<span class="sdot" style="background:var(--s' + (i % 6) + ')"></span><input value="' + esc(s.name) + '" autocomplete="off">' +
          '<button class="mv" type="button" aria-label="Move up"' + (i === 0 ? " disabled" : "") + '>↑</button>' +
          '<button class="x" type="button" aria-label="Remove">×</button>';
        var inp = r.querySelector("input");
        inp.addEventListener("change", function () {
          var v = inp.value.trim();
          if (!v) { inp.value = s.name; return; }
          s.name = v; db.from("grocery_stores").update({ name: v }).eq("id", s.id).then(oops);
        });
        r.querySelector(".mv").addEventListener("click", function () {
          if (i === 0) return;
          var a = stores[i - 1], b = stores[i], pa = a.position, pb = b.position;
          if (pa === pb) pb = pa + 1;
          a.position = pb; b.position = pa;
          stores.sort(function (x, y) { return x.position - y.position; }); renderStores();
          db.from("grocery_stores").upsert([{ id: a.id, name: a.name, position: a.position }, { id: b.id, name: b.name, position: b.position }]).then(oops);
        });
        r.querySelector(".x").addEventListener("click", function () {
          stores.splice(i, 1);
          items.forEach(function (it) { if (it.store_id === s.id) it.store_id = null; });
          renderStores();
          db.from("grocery_stores").delete().eq("id", s.id).then(oops);
        });
        box.appendChild(r);
      });
    }
    $("gear").addEventListener("click", function () { renderStores(); showSheet("storeSheet"); });
    $("addStoreForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var v = $("addStore").value.trim(); if (!v) return;
      var pos = stores.length ? stores[stores.length - 1].position + 1 : 0;
      $("addStore").value = "";
      db.from("grocery_stores").insert({ name: v, position: pos }).select().single().then(function (res) {
        if (oops(res)) return;
        if (!storeById(res.data.id)) stores.push(res.data);
        renderStores();
      });
    });
    $("storeDone").addEventListener("click", function () { if (document.activeElement) document.activeElement.blur(); setTimeout(function () { hideSheets(); render(); }, 50); });
    $("sheetBg").addEventListener("click", function () {
      if ($("quickSheet").classList.contains("show")) { closeQuick(); return; }
      if ($("sheet").classList.contains("show")) closeItem(true); else { hideSheets(); render(); }
    });

    // ---- load + live sync ----
    function loadAll() {
      return Promise.all([
        db.from("grocery_stores").select("*").order("position"),
        db.from("grocery_items").select("*")
      ]).then(function (r) {
        if (r[0].error || r[1].error) { toast("Couldn't load the list."); return; }
        stores = r[0].data; items = r[1].data.filter(notPending);
        if (!openId && !settleT) render();
        if ($("storeSheet").classList.contains("show") && !$("storeSheet").contains(document.activeElement)) renderStores();
      });
    }
    var reloadT;
    function soon() { clearTimeout(reloadT); reloadT = setTimeout(loadAll, 250); }

    var started = false;
    function START() {
      if (started) { loadAll(); return; }
      started = true;
      db.channel("groceries-live")
        .on("postgres_changes", { event: "*", schema: "public", table: "grocery_items" }, soon)
        .on("postgres_changes", { event: "*", schema: "public", table: "grocery_stores" }, soon)
        .subscribe();
      render(); loadAll();
    }

    // hooks the app shell calls
    this.refresh = function () { if (started) loadAll(); };   // phone woke up, or this tab opened again
    START();
  }
});
