/* Home Board assistant: the round sparkle button stacked above the blue +, and its sheet.
   Type or paste ("milk, eggs and stuff for tacos"), or hold the mic and say it. The server
   (server/pb_hooks/assist.pb.js) asks the model on bkllm and saves what it found; this shows
   what was done, with Undo. Editors only; not on the wall panel (yet).
   Later the chat page uses the same server engine, so nothing here is grocery-specific except the hint. */
(function () {
  if (window.HB && HB.assist) return;
  var db = HB.db;

  var css = [
    "#asstBtn {",
    "  position: fixed; z-index: 6; bottom: calc(80px + env(safe-area-inset-bottom, 0px)); left: calc(100% - 72px);",
    "  width: 56px; height: 56px; border-radius: 28px; border: 0; padding: 0; cursor: pointer;",
    "  background: var(--chip); color: var(--ink); display: none; place-items: center;",
    "  box-shadow: 0 4px 14px rgba(0,0,0,.14); translate: 0 var(--pin, 0px);",
    "  transition: transform .15s, background-color .35s;",
    "}",
    "body.asst-on #asstBtn { display: grid; }",
    "#asstBtn:active { transform: scale(.92); }",
    "#asstBtn svg { width: 26px; height: 26px; stroke: currentColor; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }",
    "body.locked #asstBtn, body.checking #asstBtn, body.homeless #asstBtn, body.viewonly #asstBtn, :root.panel #asstBtn { display: none !important; }",
    "/* room at the end of the list so the last row scrolls clear of the button(s) */",
    "body.asst-on .wrap { padding-bottom: calc(156px + env(safe-area-inset-bottom, 0px)); }",
    "body.asst-on.has-fab .wrap { padding-bottom: calc(224px + env(safe-area-inset-bottom, 0px)); }",

    "#asstBg { position: fixed; inset: 0; z-index: 32; background: rgba(0,0,0,.35); opacity: 0; pointer-events: none; transition: opacity .22s; }",
    "#asstBg.show { opacity: 1; pointer-events: auto; }",
    "#asst {",
    "  position: fixed; left: 50%; bottom: 0; z-index: 33; width: 100%; max-width: 500px;",
    "  max-height: calc(100% - 40px - env(safe-area-inset-top, 0px)); overflow-y: auto; overscroll-behavior: contain;",
    "  transform: translate(-50%, 105%); visibility: hidden;",
    "  background: var(--sheet); color: var(--ink); border-radius: 22px 22px 0 0; box-shadow: 0 -10px 40px rgba(0,0,0,.18);",
    "  padding: 8px 16px calc(20px + env(safe-area-inset-bottom, 0px));",
    "  transition: transform .3s cubic-bezier(.32,.72,0,1), visibility 0s linear .3s, background-color .35s;",
    "}",
    "#asst.show { transform: translate(-50%, 0); visibility: visible; transition: transform .3s cubic-bezier(.32,.72,0,1), visibility 0s, background-color .35s; }",
    "#asst .grab { width: 38px; height: 5px; border-radius: 3px; background: var(--hair); margin: 0 auto 10px; }",
    "#asst .sh-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }",
    "#asst .sh-head h2 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.3px; }",
    "#asst .x { width: 36px; height: 36px; border-radius: 18px; border: 0; background: var(--chip); color: var(--ink); display: grid; place-items: center; cursor: pointer; padding: 0; }",
    "#asst .x svg { width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 2.4; stroke-linecap: round; }",
    "#asst textarea {",
    "  display: block; width: 100%; box-sizing: border-box; min-height: 92px; resize: none; border: 0; border-radius: 14px;",
    "  background: var(--field); color: var(--ink); font: inherit; font-size: 17px; line-height: 1.4; padding: 12px 14px;",
    "}",
    "#asst textarea:focus { outline: 2px solid var(--ben); }",
    "#asst .row { display: flex; align-items: center; gap: 10px; margin-top: 12px; }",
    "#asst .mic {",
    "  flex: none; width: 52px; height: 52px; border-radius: 26px; border: 0; padding: 0; cursor: pointer;",
    "  background: var(--chip); color: var(--ink); display: grid; place-items: center; touch-action: none;",
    "  -webkit-user-select: none; user-select: none; -webkit-touch-callout: none;",
    "}",
    "#asst .mic svg { width: 24px; height: 24px; stroke: currentColor; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; pointer-events: none; }",
    "#asst .mic.rec { background: var(--ash); color: #fff; animation: asstPulse 1.1s ease-in-out infinite; }",
    "@keyframes asstPulse { 50% { box-shadow: 0 0 0 9px color-mix(in srgb, var(--ash) 25%, transparent); } }",
    "#asst .hint { flex: 1; min-width: 0; color: var(--muted); font-size: 14px; font-weight: 600; line-height: 1.3; }",
    "#asst .go { flex: none; border: 0; border-radius: 999px; background: var(--accent); color: var(--on-accent); font: inherit; font-size: 16px; font-weight: 800; padding: 13px 22px; cursor: pointer; }",
    "#asst .go:disabled { opacity: .45; cursor: default; }",
    "#asst .out { margin-top: 14px; }",
    "#asst .out:empty { display: none; }",
    "#asst .heard { color: var(--muted); font-size: 14px; font-weight: 600; margin: 0 4px 8px; }",
    "#asst .said { font-size: 16px; font-weight: 650; margin: 0 4px 10px; }",
    "#asst .done { background: var(--bg); border-radius: 14px; overflow: hidden; transition: background-color .35s; }",
    "#asst .done div { display: flex; align-items: center; gap: 10px; min-height: 46px; padding: 6px 12px; font-size: 16px; font-weight: 650; }",
    "#asst .done div + div { border-top: 0.5px solid var(--hair); }",
    "#asst .done svg { flex: none; width: 20px; height: 20px; stroke: var(--both); fill: none; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round; }",
    "#asst .done .skip { color: var(--muted); }",
    "#asst .done .skip svg { stroke: var(--muted); }",
    "#asst .acts { display: flex; gap: 8px; margin-top: 10px; }",
    "#asst .acts button { border: 0; border-radius: 12px; background: var(--chip); color: var(--ink); font: inherit; font-size: 15px; font-weight: 700; padding: 10px 14px; cursor: pointer; }",
    "#asst .acts .undo-all { color: var(--ash); }",
    "#asst .err { color: var(--ash); font-size: 15px; font-weight: 700; margin: 0 4px; }",
    "#asst .busy { display: flex; align-items: center; gap: 10px; color: var(--muted); font-size: 15px; font-weight: 700; margin: 0 4px; }",
    "#asst .busy i { width: 16px; height: 16px; border-radius: 50%; border: 2.5px solid var(--hair); border-top-color: var(--ink); animation: asstSpin .8s linear infinite; }",
    "@keyframes asstSpin { to { transform: rotate(360deg); } }"
  ].join("\n");
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  var SPARK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9L12 17.5l-1.9-5.1L5 10.5l5.1-1.9z"/><path d="M18.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/></svg>';
  var MIC = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3.5" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3"/></svg>';
  var CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 12.5l4 4 9-9.5"/></svg>';
  var DASH = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 12h10"/></svg>';

  var btn = document.createElement("button");
  btn.id = "asstBtn"; btn.type = "button"; btn.setAttribute("aria-label", "Assistant"); btn.title = "Assistant";
  btn.innerHTML = SPARK;
  document.body.appendChild(btn);

  var bg = document.createElement("div"); bg.id = "asstBg";
  var sh = document.createElement("div"); sh.id = "asst"; sh.setAttribute("role", "dialog"); sh.setAttribute("aria-label", "Assistant");
  sh.innerHTML =
    '<div class="grab"></div>' +
    '<div class="sh-head"><h2>Add with a sentence</h2><button type="button" class="x" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' +
    '<textarea rows="3" placeholder="Out of milk, need eggs and stuff for tacos" enterkeyhint="send"></textarea>' +
    '<div class="row"><button type="button" class="mic" aria-label="Hold to talk">' + MIC + '</button>' +
    '<span class="hint">Groceries for now. Hold the mic to say it.</span>' +
    '<button type="button" class="go" disabled>Add</button></div>' +
    '<div class="out" aria-live="polite"></div>';
  document.body.appendChild(bg); document.body.appendChild(sh);

  var ta = sh.querySelector("textarea"), go = sh.querySelector(".go"), mic = sh.querySelector(".mic");
  var hint = sh.querySelector(".hint"), out = sh.querySelector(".out");
  var HINT = hint.textContent, busy = false, status = null;

  function esc(s) { return HB.esc ? HB.esc(s) : String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function page() { return (HB.page && HB.page()) || ""; }

  // ---- placement: stacked right above the blue +, or in its spot on pages without one ----
  // Reads the +'s own left/bottom (not its on-screen box), so both share the same --pin nudge.
  function place() {
    var fab = document.getElementById("fab"); if (!fab) return;
    var cs = getComputedStyle(fab), above = fab.classList.contains("show");
    btn.style.left = cs.left;
    btn.style.bottom = above ? "calc(" + cs.bottom + " + 68px)" : cs.bottom;
  }
  window.addEventListener("resize", place);

  function open() {
    sh.classList.add("show"); bg.classList.add("show");
    if (!status) db.pb.send("/api/hb/assist", { method: "GET" }).then(function (s) {
      status = s;
      if (!s.ready) { hint.textContent = "The assistant isn't set up on the server yet."; go.disabled = true; }
      if (!s.voice) mic.style.display = "none";
    }, function () {});
    setTimeout(function () { ta.focus(); }, 320);
  }
  function close() {
    stopRec(true);
    sh.classList.remove("show"); bg.classList.remove("show"); ta.blur();
  }
  btn.addEventListener("click", open);
  bg.addEventListener("click", close);
  sh.querySelector(".x").addEventListener("click", close);
  ta.addEventListener("input", function () { go.disabled = busy || !ta.value.trim() || (status && !status.ready); });
  ta.addEventListener("keydown", function (e) { if (e.key === "Enter" && !e.shiftKey && !go.disabled) { e.preventDefault(); send({ text: ta.value }); } });
  go.addEventListener("click", function () { send({ text: ta.value }); });

  // ---- talking to the server ----
  function send(what) {
    if (busy) return;
    var body;
    if (what.audio) {
      body = new FormData();
      body.append("audio", what.audio, "speech." + (/mp4|aac|m4a/.test(what.audio.type) ? "m4a" : /ogg/.test(what.audio.type) ? "ogg" : "webm"));
      body.append("page", page());
    } else {
      var t = String(what.text || "").trim(); if (!t) return;
      body = { text: t, page: page() };
    }
    busy = true; go.disabled = true;
    out.innerHTML = '<div class="busy"><i></i>' + (what.audio ? "Listening back…" : "Working on it…") + "</div>";
    db.pb.send("/api/hb/assist", { method: "POST", body: body }).then(function (res) {
      busy = false; ta.value = ""; go.disabled = true;
      show(res, !!what.audio);
      var m = page(); if (HB.refreshPage) HB.refreshPage(m);
    }, function (err) {
      busy = false; go.disabled = !ta.value.trim();
      var msg = (err && err.response && err.response.message) || "Couldn't reach Home Board. Try again.";
      out.innerHTML = '<p class="err">' + esc(msg) + "</p>";
    });
  }

  function show(res, spoken) {
    var done = res.done || [], added = done.filter(function (d) { return !d.skipped && d.id; });
    var h = "";
    if (spoken && res.heard) h += '<p class="heard">Heard: “' + esc(res.heard) + "”</p>";
    if (!done.length) h += '<p class="said">' + esc(res.reply || "Nothing to add from that.") + "</p>";
    else h += '<div class="done">' + done.map(function (d) {
      return '<div class="' + (d.skipped ? "skip" : "") + '">' + (d.skipped ? DASH : CHECK) + "<span>" + esc(d.label || d.name) + "</span></div>";
    }).join("") + "</div>";
    if (added.length) h += '<div class="acts"><button type="button" class="undo-all">Undo</button><button type="button" class="ok">Done</button></div>';
    out.innerHTML = h;
    var u = out.querySelector(".undo-all"), ok = out.querySelector(".ok");
    if (ok) ok.onclick = close;
    if (u) u.onclick = function () {
      u.disabled = true;
      Promise.all(added.map(function (d) { return db.from(d.table).delete().eq("id", d.id); })).then(function () {
        out.innerHTML = '<p class="said">Undone. Nothing was added.</p>';
        if (HB.refreshPage) HB.refreshPage(page());
      }, function () { u.disabled = false; HB.toast("Couldn't undo. Try again."); });
    };
  }

  // ---- hold to talk ----
  var rec = null, chunks = [], recStream = null, recTimer = null, cancelRec = false;
  function startRec() {
    if (busy || rec) return;
    if (!navigator.mediaDevices || !window.MediaRecorder) { HB.toast("Voice needs a newer browser. Use the keyboard mic instead."); return; }
    cancelRec = false;
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
      if (cancelRec) { stream.getTracks().forEach(function (t) { t.stop(); }); return; }
      recStream = stream; chunks = [];
      var type = ["audio/mp4", "audio/webm;codecs=opus", "audio/webm", "audio/ogg"].filter(function (t) { return MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t); })[0];
      rec = type ? new MediaRecorder(stream, { mimeType: type }) : new MediaRecorder(stream);
      rec.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
      rec.onstop = function () {
        var r = rec; rec = null; clearTimeout(recTimer);
        if (recStream) { recStream.getTracks().forEach(function (t) { t.stop(); }); recStream = null; }
        mic.classList.remove("rec"); hint.textContent = HINT;
        if (cancelRec || !chunks.length) return;
        var blob = new Blob(chunks, { type: r.mimeType || "audio/webm" });
        if (blob.size < 2000) { hint.textContent = "Hold the mic while you talk."; return; }
        send({ audio: blob });
      };
      rec.start();
      mic.classList.add("rec"); hint.textContent = "Listening… let go to send";
      recTimer = setTimeout(function () { stopRec(false); }, 45000);   // a minute is plenty for a list
    }, function () { HB.toast("Allow the microphone for Home Board, or use the keyboard mic."); });
  }
  function stopRec(cancel) {
    if (cancel) cancelRec = true;
    if (rec && rec.state !== "inactive") rec.stop(); else if (cancel) { mic.classList.remove("rec"); hint.textContent = HINT; }
  }
  mic.addEventListener("pointerdown", function (e) { e.preventDefault(); try { mic.setPointerCapture(e.pointerId); } catch (x) {} startRec(); });
  mic.addEventListener("pointerup", function () { stopRec(false); });
  mic.addEventListener("pointercancel", function () { stopRec(true); });
  mic.addEventListener("contextmenu", function (e) { e.preventDefault(); });

  HB.assist = { open: open, close: close, place: place, on: function (on) { document.body.classList.toggle("asst-on", !!on); place(); } };
})();
