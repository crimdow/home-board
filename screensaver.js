/* Home Board: Screensaver page (☰ → Screensaver).
   Picks the family photos the wall panel shows when nobody has touched it for a while, and how each one is framed:
   every photo opens in a frame the exact shape of the mounted Surface (portrait 2:3), where you drag it and pinch
   or slide to zoom. Photos are made smaller on the phone before upload (the panel never needs more).
   Also holds the panel's timing and its Home Assistant address (saved on the household, see HB.setPanel). */
HB.register("screensaver", {
  title: "Screensaver",

  css: `
#pg-screensaver .ss-body { display: flex; flex-direction: column; gap: 6px; padding: 8px 0 16px; }
#pg-screensaver h2 { margin: 16px 4px 6px; font-size: 12px; font-weight: 800; letter-spacing: .5px; text-transform: uppercase; color: var(--muted); display: flex; align-items: center; justify-content: space-between; gap: 8px; }
#pg-screensaver h2 small { text-transform: none; letter-spacing: 0; font-weight: 600; }
#pg-screensaver .grp { background: var(--sheet); border-radius: 14px; overflow: hidden; transition: background-color .35s; }
#pg-screensaver .rowx { display: flex; align-items: center; justify-content: space-between; gap: 10px; min-height: 52px; padding: 8px 12px; }
#pg-screensaver .rowx + .rowx { border-top: 0.5px solid var(--hair); }
#pg-screensaver .rowx > span { font-size: 16px; font-weight: 600; white-space: nowrap; }
#pg-screensaver .chips { display: flex; gap: 2px; background: var(--chip); border-radius: 11px; padding: 3px; flex: none; }
#pg-screensaver .chips button { border: 0; background: none; color: var(--muted); font: inherit; font-size: 13.5px; font-weight: 750; padding: 6px 8px; border-radius: 8px; cursor: pointer; white-space: nowrap; }
#pg-screensaver .chips button.on { background: var(--bg); color: var(--ink); box-shadow: 0 1px 3px rgba(0,0,0,.12); }
#pg-screensaver .sw { position: relative; width: 51px; height: 31px; flex: none; }
#pg-screensaver .sw input { position: absolute; inset: 0; opacity: 0; margin: 0; cursor: pointer; }
#pg-screensaver .sw i { position: absolute; inset: 0; border-radius: 16px; background: var(--chip); transition: background-color .2s; pointer-events: none; }
#pg-screensaver .sw i::after { content: ""; position: absolute; top: 2px; left: 2px; width: 27px; height: 27px; border-radius: 14px; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,.2); transition: transform .2s; }
#pg-screensaver .sw input:checked + i { background: var(--both); }
#pg-screensaver .sw input:checked + i::after { transform: translateX(20px); }
#pg-screensaver .hrs { display: flex; align-items: center; gap: 8px; }
#pg-screensaver .hrs em { font-style: normal; color: var(--muted); font-size: 15px; font-weight: 700; }
#pg-screensaver .hrs select { appearance: none; border: 0; border-radius: 10px; background: var(--chip); color: var(--ink); font: inherit; font-size: 15px; font-weight: 750; padding: 8px 12px; cursor: pointer; }
#pg-screensaver #ssHours.off { opacity: .4; pointer-events: none; }
body.viewonly #pg-screensaver .hrs select { pointer-events: none; opacity: .6; }
:root.panel #pg-screensaver .hrs select, :root.panel #pg-screensaver .hrs em { font-size: 20px; }
#pg-screensaver .pill { border: 0; border-radius: 999px; background: var(--accent); color: var(--on-accent); font: inherit; font-size: 14px; font-weight: 800; padding: 8px 14px; cursor: pointer; white-space: nowrap; }
#pg-screensaver .pill.ghost { background: var(--chip); color: var(--ink); }
#pg-screensaver .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
#pg-screensaver .ph { position: relative; aspect-ratio: 2 / 3; border-radius: 12px; overflow: hidden; background: var(--chip); border: 0; padding: 0; cursor: pointer; }
#pg-screensaver .ph img { position: absolute; }
#pg-screensaver .ph .x { position: absolute; top: 5px; right: 5px; width: 28px; height: 28px; border-radius: 14px; border: 0; background: rgba(20,20,24,.6); color: #fff; display: grid; place-items: center; cursor: pointer; padding: 0; }
#pg-screensaver .ph .x svg { width: 13px; height: 13px; stroke: currentColor; stroke-width: 3; stroke-linecap: round; fill: none; }
#pg-screensaver .ph.busy::after { content: "Adding…"; position: absolute; inset: 0; display: grid; place-items: center; background: color-mix(in srgb, var(--bg) 60%, transparent); color: var(--ink); font-size: 13px; font-weight: 800; }
#pg-screensaver .empty { padding: 26px 16px; text-align: center; color: var(--muted); font-size: 14.5px; font-weight: 600; background: var(--sheet); border-radius: 14px; }
#pg-screensaver .ha { display: flex; flex-direction: column; gap: 8px; padding: 12px; }
#pg-screensaver .ha input { width: 100%; border: 0; border-radius: 10px; background: var(--field); color: var(--ink); font: inherit; font-size: 16px; padding: 11px 12px; }
#pg-screensaver .ha input:focus { outline: 2px solid var(--ben); }
#pg-screensaver .ha p { margin: 0; color: var(--muted); font-size: 13px; font-weight: 600; line-height: 1.4; }
#pg-screensaver .ha p.warn { color: var(--ash); }
#pg-screensaver .ha .halbl { margin-top: 8px; font-size: 13px; font-weight: 800; color: var(--muted); text-transform: uppercase; letter-spacing: .4px; }
#pg-screensaver .quotes { padding: 12px; display: flex; flex-direction: column; gap: 10px; }
#pg-screensaver .qadd { display: flex; flex-direction: column; gap: 8px; }
#pg-screensaver .qadd textarea, #pg-screensaver .qadd input { width: 100%; border: 0; border-radius: 10px; background: var(--field); color: var(--ink); font: inherit; font-size: 16px; padding: 10px 12px; resize: none; }
#pg-screensaver .qadd textarea:focus, #pg-screensaver .qadd input:focus { outline: 2px solid var(--ben); }
#pg-screensaver .qrow { display: flex; gap: 8px; align-items: center; }
#pg-screensaver .qitem { display: flex; align-items: flex-start; gap: 10px; padding: 10px 2px; border-top: 0.5px solid var(--hair); }
#pg-screensaver .qitem > div { flex: 1; min-width: 0; }
#pg-screensaver .qt { font-size: 15.5px; font-weight: 700; line-height: 1.35; }
#pg-screensaver .qb { margin-top: 3px; font-size: 13.5px; font-weight: 700; color: var(--muted); }
#pg-screensaver .qitem .x { flex: none; width: 30px; height: 30px; border-radius: 15px; border: 0; background: var(--chip); color: var(--ash); display: grid; place-items: center; cursor: pointer; padding: 0; }
#pg-screensaver .qitem .x svg { width: 12px; height: 12px; stroke: currentColor; stroke-width: 3; stroke-linecap: round; fill: none; }
#pg-screensaver .qnone { color: var(--muted); font-size: 14px; font-weight: 600; padding: 4px 2px; }
body.viewonly #pg-screensaver .ed-only { display: none !important; }
body.viewonly #pg-screensaver .chips, body.viewonly #pg-screensaver .sw { pointer-events: none; opacity: .6; }

/* the framing editor: a full-screen sheet with a frame the shape of the mounted Surface */
.ssx { position: fixed; inset: 0; z-index: 70; background: rgba(0,0,0,.82); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px;
  padding: calc(14px + env(safe-area-inset-top, 0px)) 16px calc(16px + env(safe-area-inset-bottom, 0px)); color: #fff; touch-action: none; }
.ssx .hint { font-size: 14px; font-weight: 700; opacity: .8; text-align: center; }
.ssx .frame { position: relative; overflow: hidden; border-radius: 18px; background: #222; box-shadow: 0 0 0 2px rgba(255,255,255,.5), 0 20px 60px rgba(0,0,0,.5); cursor: grab; touch-action: none; }
.ssx .frame img { position: absolute; user-select: none; -webkit-user-drag: none; pointer-events: none; }
.ssx .frame .guide { position: absolute; inset: 0; pointer-events: none; background:
  linear-gradient(rgba(255,255,255,.18), rgba(255,255,255,.18)) 33.33% 0 / 1px 100% no-repeat,
  linear-gradient(rgba(255,255,255,.18), rgba(255,255,255,.18)) 66.66% 0 / 1px 100% no-repeat,
  linear-gradient(rgba(255,255,255,.18), rgba(255,255,255,.18)) 0 33.33% / 100% 1px no-repeat,
  linear-gradient(rgba(255,255,255,.18), rgba(255,255,255,.18)) 0 66.66% / 100% 1px no-repeat; }
/* where the screensaver's clock and cards will sit over the photo (same places as on the panel) */
.ssx .lay { position: absolute; inset: 0; pointer-events: none; container-type: size; transition: opacity .2s; }
.ssx .lay.off { opacity: 0; }
.ssx .lay > div { box-sizing: border-box; position: absolute; border-radius: 5cqw; background: rgba(20, 20, 24, .42); border: 1px solid rgba(255, 255, 255, .3);
  -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); color: #fff; display: flex; flex-direction: column; justify-content: center; padding: 0 4cqw; }
.ssx .lay .clock { left: 5%; right: 5%; top: 6%; height: 27%; align-items: center; text-align: center; }
.ssx .lay .clock b { font-size: 27cqw; font-weight: 800; line-height: 1; letter-spacing: -.04em; }
.ssx .lay .clock i { font-style: normal; font-size: 11cqw; font-weight: 800; color: #ffa94d; }
.ssx .lay .np { display: none; left: 42%; top: 6%; width: 53%; height: 16%; background: transparent; border: 1.5px dashed rgba(255, 255, 255, .7); -webkit-backdrop-filter: none; backdrop-filter: none; align-items: center; text-align: center; font-size: 3cqw; font-weight: 800; }
.ssx .lay .wx { right: 5%; top: 71%; width: 15%; height: 6.5%; border-radius: 99px; align-items: center; font-size: 4.4cqw; font-weight: 800; padding: 0; }
.ssx .lay .day { left: 5%; right: 5%; top: 79.5%; height: 14.5%; font-size: 2.6cqw; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; justify-content: flex-start; padding-top: 3cqw; }
.ssx .laybtn { border: 0; background: rgba(255,255,255,.16); color: #fff; font: inherit; font-size: 13px; font-weight: 800; border-radius: 999px; padding: 6px 12px; margin-left: 8px; cursor: pointer; }
.ssx .zoom { display: flex; align-items: center; gap: 12px; width: min(100%, 420px); font-size: 13px; font-weight: 800; }
.ssx .zoom input { flex: 1; accent-color: #fff; }
.ssx .acts { display: flex; gap: 10px; width: min(100%, 420px); }
.ssx .acts button { flex: 1; border: 0; border-radius: 14px; font: inherit; font-size: 16px; font-weight: 800; padding: 13px 0; cursor: pointer; background: rgba(255,255,255,.14); color: #fff; }
.ssx .acts .save { background: #fff; color: #111; }
.ssx .acts .rm { flex: 0 0 auto; padding: 13px 16px; color: #ff8a8a; }

/* on the wall panel the same page is just bigger */
:root.panel #pg-screensaver .rowx > span { font-size: 22px; }
:root.panel #pg-screensaver .rowx { min-height: 76px; padding: 10px 20px; }
:root.panel #pg-screensaver .chips button { font-size: 19px; padding: 10px 14px; }
:root.panel #pg-screensaver h2 { font-size: 17px; margin-top: 24px; }
:root.panel #pg-screensaver .pill { font-size: 20px; padding: 14px 24px; }
:root.panel #pg-screensaver .grid { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
`,

  mount: function (root) {
    var db = HB.db, pb = db.pb, toast = HB.toast;
    var X = '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>';
    var photos = [], busy = 0;
    var AFTER = [2, 5, 10, 30], EVERY = [15, 30, 60, 300];
    function hourOpts() { var o = ""; for (var h = 0; h < 24; h++) o += '<option value="' + h + '">' + (h % 12 || 12) + (h < 12 ? " AM" : " PM") + '</option>'; return o; }

    root.innerHTML =
      '<div class="top"><header><div class="title"><h1>Screensaver</h1></div>' +
        '<div><button type="button" class="pill ghost" id="ssNow">' + (HB.panel ? "Start now" : "Preview") + '</button></div></header></div>' +
      '<div class="ss-body">' +
        '<h2>On the wall panel</h2>' +
        '<div class="grp">' +
          '<div class="rowx"><span>Start after</span><div class="chips" data-k="after">' + AFTER.map(function (m) { return '<button type="button" data-v="' + m + '">' + m + ' min</button>'; }).join("") + '</div></div>' +
          '<div class="rowx"><span>Next photo every</span><div class="chips" data-k="every">' + EVERY.map(function (s) { return '<button type="button" data-v="' + s + '">' + (s < 60 ? s + " s" : s / 60 + " min") + '</button>'; }).join("") + '</div></div>' +
          '<div class="rowx"><span>Show the time, weather and day</span><label class="sw"><input type="checkbox" id="ssInfo"><i></i></label></div>' +
          '<div class="rowx"><span>Dark at night</span><label class="sw"><input type="checkbox" id="ssNight"><i></i></label></div>' +
          '<div class="rowx" id="ssHours"><span>From</span><span class="hrs"><select id="ssFrom" aria-label="Dark from">' + hourOpts() + '</select>' +
            '<em>to</em><select id="ssTo" aria-label="Dark until">' + hourOpts() + '</select></span></div>' +
        '</div>' +
        '<h2><span>Photos <small id="ssCount"></small></span><button type="button" class="pill ed-only" id="ssAdd">+ Add photos</button></h2>' +
        '<input type="file" id="ssFile" accept="image/*" multiple hidden>' +
        '<div id="ssGrid"></div>' +
        '<h2><span>Quotes on the panel <small id="ssQCount"></small></span></h2>' +
        '<div class="grp quotes"><div class="qadd ed-only"><textarea id="ssQText" rows="2" maxlength="240" placeholder="Add a quote or a message for the family"></textarea>' +
          '<div class="qrow"><input id="ssQBy" maxlength="60" placeholder="Who said it (optional)"><button type="button" class="pill" id="ssQAdd">Add</button></div></div>' +
          '<div id="ssQList"></div></div>' +
        '<h2>Home Assistant on the panel</h2>' +
        '<div class="grp ha"><input type="url" id="ssHa" inputmode="url" autocapitalize="none" autocorrect="off" spellcheck="false" placeholder="http://192.168.1.50:8123">' +
          '<p id="ssHaNote">Its address, starting with https://. The panel then gets a Home Assistant button.</p>' +
          '<label class="halbl" for="ssHaPanel">Wall panel only (optional)</label>' +
          '<input type="url" id="ssHaPanel" inputmode="url" autocapitalize="none" autocorrect="off" spellcheck="false" placeholder="http://192.168.1.50">' +
          '<p>Home Assistant’s address on your home network, used only by the wall panel. With the Surface in Home Assistant’s trusted networks, it opens with no login. Phones keep using the address above.</p></div>' +
      '</div>';
    var grid = root.querySelector("#ssGrid"), fileIn = root.querySelector("#ssFile"), haIn = root.querySelector("#ssHa");

    // ---- settings (saved on the household, so the panel picks them up) ----
    function paintSettings() {
      var p = HB.family().panel;
      root.querySelectorAll(".chips").forEach(function (c) {
        var v = p[c.dataset.k];
        c.querySelectorAll("button").forEach(function (b) { b.classList.toggle("on", +b.dataset.v === v); });
      });
      root.querySelector("#ssInfo").checked = p.info !== false;
      root.querySelector("#ssNight").checked = !!p.night.on;
      root.querySelector("#ssFrom").value = String(p.night.from);
      root.querySelector("#ssTo").value = String(p.night.to);
      root.querySelector("#ssHours").classList.toggle("off", !p.night.on);
      if (document.activeElement !== haIn) haIn.value = p.ha || "";
      var hp = root.querySelector("#ssHaPanel"); if (document.activeElement !== hp) hp.value = p.haPanel || "";
      paintQuotes();
      paintHaNote();
    }
    root.querySelectorAll(".chips").forEach(function (c) {
      c.addEventListener("click", function (e) {
        var b = e.target.closest("button"); if (!b || HB.viewer) return;
        var o = {}; o[c.dataset.k] = +b.dataset.v; HB.setPanel(o); paintSettings();
      });
    });
    root.querySelector("#ssInfo").addEventListener("change", function (e) { HB.setPanel({ info: e.target.checked }); });
    function setNight(o) { HB.setPanel({ night: Object.assign({}, HB.family().panel.night, o) }); paintSettings(); }
    root.querySelector("#ssNight").addEventListener("change", function (e) { setNight({ on: e.target.checked }); });
    root.querySelector("#ssFrom").addEventListener("change", function (e) { setNight({ from: +e.target.value }); });
    root.querySelector("#ssTo").addEventListener("change", function (e) { setNight({ to: +e.target.value }); });
    root.querySelector("#ssNow").addEventListener("click", function () { HB.screensaver.start(); });

    function paintHaNote() {
      var v = haIn.value.trim(), note = root.querySelector("#ssHaNote");
      var bad = v && !/^https?:\/\/[^\s/]+/i.test(v);
      note.classList.toggle("warn", !!bad);
      note.textContent = bad ? "That doesn't look like an address. It should look like http://192.168.1.50:8123."
        : /^http:/i.test(v) ? "Saved. Because it's http://, only the wall panel can show it inside Home Board; phones get an Open button."
        : v ? "Shows inside Home Board. In Home Assistant, Send X-Frame-Options must be off (Settings → System → Network)."
        : "Its address, like http://192.168.1.50:8123. The panel then gets a Home Assistant button.";
    }
    haIn.readOnly = HB.viewer;
    haIn.addEventListener("input", paintHaNote);
    haIn.addEventListener("change", function () {
      var v = haIn.value.trim().replace(/\/+$/, "");
      if (v && !/^[a-z]+:\/\//i.test(v)) v = "http://" + v;   // Home Assistant on the home network is usually plain http
      haIn.value = v; HB.setPanel({ ha: v }); paintHaNote(); toast(v ? "Saved the Home Assistant address." : "Removed Home Assistant from the panel.");
    });

    var haPanelIn = root.querySelector("#ssHaPanel");
    haPanelIn.readOnly = HB.viewer;
    haPanelIn.addEventListener("change", function () {
      var v = haPanelIn.value.trim().replace(/\/+$/, "");
      if (v && !/^[a-z]+:\/\//i.test(v)) v = "http://" + v;   // the home-network address is plain http
      haPanelIn.value = v; HB.setPanel({ haPanel: v });
      toast(v ? "Saved the panel’s Home Assistant address." : "The panel uses the main address again.");
    });

    // ---- quotes (one a day on the panel's Today view) ----
    function paintQuotes() {
      var list = HB.family().panel.quotes || [], box = root.querySelector("#ssQList");
      root.querySelector("#ssQCount").textContent = list.length ? "· " + list.length : "";
      box.innerHTML = list.length ? list.map(function (q, i) {
        return '<div class="qitem"><div><div class="qt">“' + HB.esc(q.text) + '”</div>' + (q.by ? '<div class="qb">— ' + HB.esc(q.by) + '</div>' : '') + '</div>' +
          '<button type="button" class="x ed-only" data-i="' + i + '" aria-label="Remove quote">' + X + '</button></div>';
      }).join("") : '<div class="qnone">No quotes yet. The panel shows one each day, taking turns.</div>';
    }
    root.querySelector("#ssQAdd").addEventListener("click", function () {
      var t = root.querySelector("#ssQText"), by = root.querySelector("#ssQBy"), text = t.value.trim().replace(/^["“]|["”]$/g, "");
      if (!text) { t.focus(); return; }
      HB.setPanel({ quotes: (HB.family().panel.quotes || []).concat([{ text: text, by: by.value.trim() }]) });
      t.value = ""; by.value = ""; paintQuotes(); toast("Quote added.");
    });
    root.querySelector("#ssQList").addEventListener("click", function (e) {
      var b = e.target.closest(".x"); if (!b || HB.viewer) return;
      if (!confirm("Remove this quote?")) return;
      var list = (HB.family().panel.quotes || []).slice(); list.splice(+b.dataset.i, 1);
      HB.setPanel({ quotes: list }); paintQuotes();
    });

    // ---- photos ----
    function query() { return pb.collection("panel_photos").getFullList({ sort: "-added" }); }
    function load() {
      return query().then(function (list) { photos = list; renderGrid(); }, function () { if (!photos.length) grid.innerHTML = '<div class="empty">Couldn’t load the photos.</div>'; });
    }
    function thumbUrl(rec) { return pb.files.getURL(rec, rec.image, { thumb: "0x720" }); }
    function renderGrid() {
      root.querySelector("#ssCount").textContent = photos.length ? "· " + photos.length : "";
      if (!photos.length && !busy) {
        grid.innerHTML = '<div class="empty">No photos yet.' + (HB.viewer ? "" : "<br>Tap + Add photos to pick some from this phone.") + '</div>';
        return;
      }
      grid.innerHTML = '<div class="grid">' +
        Array(busy + 1).join('<div class="ph busy"></div>') +
        photos.map(function (r, i) {
          return '<div class="ph" role="button" tabindex="0" data-i="' + i + '" aria-label="Photo ' + (i + 1) + ', tap to frame"><img alt="">' +
            '<button type="button" class="x ed-only" aria-label="Remove photo">' + X + '</button></div>';
        }).join("") + '</div>';
      grid.querySelectorAll(".ph[data-i]").forEach(function (el) {
        var rec = photos[+el.dataset.i], img = el.querySelector("img");
        HB.placePhoto(img, rec, 2, 3);
        img.src = thumbUrl(rec);
      });
    }
    grid.addEventListener("click", function (e) {
      var el = e.target.closest(".ph[data-i]"); if (!el) return;
      var rec = photos[+el.dataset.i];
      if (e.target.closest(".x")) { remove(rec); return; }
      if (!HB.viewer) openEditor(rec);
    });
    function remove(rec) {
      if (!confirm("Take this photo off the screensaver?")) return;
      photos = photos.filter(function (r) { return r.id !== rec.id; }); renderGrid();
      pb.collection("panel_photos").delete(rec.id).then(function () { toast("Photo removed."); }, function () { toast("Couldn't remove it. Check your connection."); load(); });
    }

    // ---- adding: make each photo smaller on the phone, then upload ----
    root.querySelector("#ssAdd").addEventListener("click", function () { fileIn.click(); });
    fileIn.addEventListener("change", function () {
      var files = Array.prototype.slice.call(fileIn.files || []); fileIn.value = "";
      if (!files.length) return;
      busy += files.length; renderGrid();
      var chain = Promise.resolve(), added = 0;
      files.forEach(function (f, n) {
        chain = chain.then(function () {
          return shrink(f).then(function (out) {
            var fd = new FormData();
            fd.append("image", out.blob, "photo.jpg");
            fd.append("w", out.w); fd.append("h", out.h);
            fd.append("focus_x", 0.5); fd.append("focus_y", 0.5); fd.append("zoom", 1);
            fd.append("added", Date.now() + n);
            return pb.collection("panel_photos").create(fd);
          }).then(function (rec) { added++; photos.unshift(rec); }, function () { toast("Couldn't add one of the photos."); })
            .then(function () { busy--; renderGrid(); });
        });
      });
      chain.then(function () { if (added) toast(added === 1 ? "Photo added. Tap it to frame it." : added + " photos added. Tap one to frame it."); });
    });
    // big enough to fill the panel even when zoomed in a little: the short side at most 2048 px, the long side 4096
    function shrink(file) {
      return new Promise(function (resolve, reject) {
        var url = URL.createObjectURL(file), img = new Image();
        img.onload = function () {
          var w = img.naturalWidth, h = img.naturalHeight, k = Math.min(1, 2048 / Math.min(w, h), 4096 / Math.max(w, h));
          var cw = Math.round(w * k), ch = Math.round(h * k), cv = document.createElement("canvas");
          cv.width = cw; cv.height = ch;
          cv.getContext("2d").drawImage(img, 0, 0, cw, ch);
          URL.revokeObjectURL(url);
          cv.toBlob(function (b) { if (b) resolve({ blob: b, w: cw, h: ch }); else reject(); }, "image/jpeg", 0.86);
        };
        img.onerror = function () { URL.revokeObjectURL(url); reject(); };
        img.src = url;
      });
    }

    // ---- framing editor ----
    function openEditor(rec) {
      var st = { focus_x: rec.focus_x, focus_y: rec.focus_y, zoom: rec.zoom || 1, w: rec.w, h: rec.h };
      var box = document.createElement("div");
      box.className = "ssx"; box.setAttribute("role", "dialog"); box.setAttribute("aria-label", "Frame this photo");
      box.innerHTML = '<div class="hint">Drag to move · pinch or slide to zoom<button type="button" class="laybtn">Hide clock</button></div>' +
        '<div class="frame"><img alt=""><div class="guide"></div>' +
        '<div class="lay" aria-hidden="true"><div class="clock"><b>8:58</b><i>Tuesday</i></div><div class="wx">52°</div><div class="day">Today</div></div></div>' +
        '<label class="zoom">Zoom <input type="range" min="1" max="4" step="0.01" aria-label="Zoom"></label>' +
        '<div class="acts"><button type="button" class="rm">Remove</button><button type="button" class="reset">Center</button>' +
        '<button type="button" class="cancel">Cancel</button><button type="button" class="save">Save</button></div>';
      document.body.appendChild(box);
      var frame = box.querySelector(".frame"), img = frame.querySelector("img"), slider = box.querySelector("input");
      // the screensaver's clock and cards over the photo, so you can keep faces clear of them
      box.querySelector(".laybtn").onclick = function () {
        var lay = frame.querySelector(".lay"), off = lay.classList.toggle("off");
        this.textContent = off ? "Show clock" : "Hide clock";
      };
      function size() {
        var maxW = Math.min(window.innerWidth - 32, 520), maxH = window.innerHeight - 250;
        var fw = Math.max(160, Math.min(maxW, maxH * HB.panelAspect));
        frame.style.width = fw + "px"; frame.style.height = fw / HB.panelAspect + "px";
      }
      function paint() {
        // keep the focus where the picture can actually reach (no gaps at the edges)
        var f = HB.frameOf(st, 2, 3), left = f.left / 100 * 2, top = f.top / 100 * 3;
        st.focus_x = (1 - left) / f.dw; st.focus_y = (1.5 - top) / f.dh;
        HB.placePhoto(img, st, 2, 3);
        slider.value = st.zoom;
      }
      size(); paint();
      img.src = HB.photoUrl(rec);
      window.addEventListener("resize", size);

      // drag with one finger, pinch with two (pointer events: works with a mouse too)
      var pts = {}, last = null, pinch = null;
      function ids() { return Object.keys(pts); }
      frame.addEventListener("pointerdown", function (e) {
        frame.setPointerCapture(e.pointerId);
        pts[e.pointerId] = { x: e.clientX, y: e.clientY };
        if (ids().length === 2) {
          var a = pts[ids()[0]], b = pts[ids()[1]];
          pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, z: st.zoom };
        }
        last = { x: e.clientX, y: e.clientY };
      });
      frame.addEventListener("pointermove", function (e) {
        if (!pts[e.pointerId]) return;
        pts[e.pointerId] = { x: e.clientX, y: e.clientY };
        if (ids().length >= 2 && pinch) {
          var a = pts[ids()[0]], b = pts[ids()[1]];
          st.zoom = Math.max(1, Math.min(4, pinch.z * Math.hypot(a.x - b.x, a.y - b.y) / pinch.d));
          paint(); return;
        }
        var px = frame.clientWidth / 2;   // screen pixels per frame unit
        var f = HB.frameOf(st, 2, 3);
        st.focus_x -= (e.clientX - last.x) / px / f.dw;
        st.focus_y -= (e.clientY - last.y) / px / f.dh;
        last = { x: e.clientX, y: e.clientY };
        paint();
      });
      function up(e) {
        delete pts[e.pointerId]; pinch = null;
        var left = ids()[0]; if (left) last = { x: pts[left].x, y: pts[left].y };
      }
      frame.addEventListener("pointerup", up); frame.addEventListener("pointercancel", up);
      frame.addEventListener("wheel", function (e) { e.preventDefault(); st.zoom = Math.max(1, Math.min(4, st.zoom * (e.deltaY < 0 ? 1.06 : 1 / 1.06))); paint(); }, { passive: false });
      slider.addEventListener("input", function () { st.zoom = +slider.value; paint(); });

      function close() { window.removeEventListener("resize", size); box.remove(); }
      box.querySelector(".cancel").addEventListener("click", close);
      box.querySelector(".reset").addEventListener("click", function () { st.focus_x = 0.5; st.focus_y = 0.5; st.zoom = 1; paint(); });
      box.querySelector(".rm").addEventListener("click", function () { close(); remove(rec); });
      box.querySelector(".save").addEventListener("click", function () {
        var upd = { focus_x: +st.focus_x.toFixed(4), focus_y: +st.focus_y.toFixed(4), zoom: +st.zoom.toFixed(3) };
        Object.assign(rec, upd); renderGrid(); close();
        pb.collection("panel_photos").update(rec.id, upd).then(function () { toast("Framing saved."); }, function () { toast("Couldn't save the framing."); load(); });
      });
    }

    // another phone adds, frames or removes photos: catch up
    var liveT = null;
    db.channel("panel-photos").on("postgres_changes", { event: "*", schema: "public", table: "panel_photos" }, function () {
      clearTimeout(liveT); liveT = setTimeout(load, 400);
    }).subscribe();
    HB.onFamily(paintSettings);

    this.refresh = function () { load(); paintSettings(); };
    paintSettings(); renderGrid(); load();
  }
});
