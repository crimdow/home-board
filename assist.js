/* Home Board assistant: the violet sparkle button in the same spot on every page (the blue + sits above it), and its sheet.
   One tap and it's listening: say "going to Costco, need eggs, milk and strawberries" and stop
   talking. It sends by itself after a short pause (or tap to send now). "Type instead" switches to
   a text box for pasting. The server (server/pb_hooks/assist.pb.js) asks the model on bkllm and saves
   what it found; this shows what was done, with Undo. Editors only; not on the wall panel (yet).
   Later the chat page uses the same server engine, so nothing here is grocery-specific except the hint. */
(function () {
  if (window.HB && HB.assist) return;
  var db = HB.db;
  var VIOLET = "#8a6bb8";

  var css = [
    "#asstBtn {",
    "  position: fixed; z-index: 6; bottom: calc(80px + env(safe-area-inset-bottom, 0px)); left: calc(100% - 72px);",
    "  width: 56px; height: 56px; border-radius: 28px; border: 0; padding: 0; cursor: pointer;",
    "  background: " + VIOLET + "; color: #fff; display: none; place-items: center;",
    "  box-shadow: 0 6px 18px color-mix(in srgb, " + VIOLET + " 38%, transparent), 0 2px 6px rgba(0,0,0,.12);",
    "  translate: 0 var(--pin, 0px); transition: transform .15s;",
    "}",
    "body.asst-on #asstBtn { display: grid; }",
    "/* (the + moving up above the sparkle is in index.html, so it's in place before this file loads) */",
    "#asstBtn:active { transform: scale(.92); }",
    "#asstBtn svg { width: 26px; height: 26px; stroke: currentColor; fill: none; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }",
    "body.locked #asstBtn, body.checking #asstBtn, body.homeless #asstBtn, body.viewonly #asstBtn, :root.panel #asstBtn { display: none !important; }",
    "/* room at the end of the list so the last row scrolls clear of the button(s) */",
    "body.asst-on .wrap { padding-bottom: calc(156px + env(safe-area-inset-bottom, 0px)); }",
    "body.asst-on.has-fab .wrap { padding-bottom: calc(224px + env(safe-area-inset-bottom, 0px)); }",

    "#asstBg { position: fixed; inset: 0; z-index: 32; background: rgba(0,0,0,.35); opacity: 0; pointer-events: none; transition: opacity .22s; }",
    "#asstBg.show { opacity: 1; pointer-events: auto; }",
    "#asst {",
    "  position: fixed; left: 50%; bottom: 0; z-index: 33; width: 100%; max-width: 500px;",
    "  max-height: calc(100% - 40px - env(safe-area-inset-top, 0px)); overflow-y: auto; overscroll-behavior: contain;",
    "  transform: translate(-50%, 105%); visibility: hidden; box-sizing: border-box;",
    "  background: var(--sheet); color: var(--ink); border-radius: 22px 22px 0 0; box-shadow: 0 -10px 40px rgba(0,0,0,.18);",
    "  padding: 8px 16px calc(20px + env(safe-area-inset-bottom, 0px));",
    "  transition: transform .3s cubic-bezier(.32,.72,0,1), visibility 0s linear .3s, background-color .35s;",
    "}",
    "#asst.show { transform: translate(-50%, 0); visibility: visible; transition: transform .3s cubic-bezier(.32,.72,0,1), visibility 0s, background-color .35s; }",
    "#asst .grab { width: 38px; height: 5px; border-radius: 3px; background: var(--hair); margin: 0 auto 10px; }",
    "#asst .sh-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }",
    "#asst .sh-head h2 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.3px; }",
    "#asst .x { width: 36px; height: 36px; border-radius: 18px; border: 0; background: var(--chip); color: var(--ink); display: grid; place-items: center; cursor: pointer; padding: 0; }",
    "#asst .sh-head .btns { display: flex; gap: 8px; }",
    "#asst .spk { width: 36px; height: 36px; border-radius: 18px; border: 0; background: var(--chip); color: var(--ink); display: grid; place-items: center; cursor: pointer; padding: 0; }",
    "#asst .spk svg { width: 18px; height: 18px; stroke: currentColor; fill: none; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }",
    "#asst .spk.off { color: var(--muted); }",
    "#asst .x svg { width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 2.4; stroke-linecap: round; }",

    /* voice: one big mic in the middle */
    "#asst .voice { display: flex; flex-direction: column; align-items: center; padding: 14px 0 6px; }",
    "#asst .bigmic {",
    "  position: relative; width: 88px; height: 88px; border-radius: 44px; border: 0; padding: 0; cursor: pointer;",
    "  background: " + VIOLET + "; color: #fff; display: grid; place-items: center;",
    "}",
    "#asst .bigmic::before { content: ''; position: absolute; inset: 0; border-radius: 50%; background: " + VIOLET + "; opacity: .22;",
    "  transform: scale(calc(1 + var(--lvl, 0) * .55)); transition: transform .08s linear; z-index: -1; }",
    "#asst .bigmic svg { width: 36px; height: 36px; stroke: currentColor; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }",
    "#asst .bigmic.idle { background: var(--chip); color: var(--ink); }",
    "#asst .bigmic.idle::before { display: none; }",
    "#asst .vsay { margin-top: 16px; font-size: 17px; font-weight: 750; text-align: center; }",
    "#asst .vsub { margin-top: 4px; color: var(--muted); font-size: 14px; font-weight: 600; text-align: center; }",
    "#asst .swap { margin-top: 14px; border: 0; background: none; color: var(--ben); font: inherit; font-size: 15px; font-weight: 700; padding: 8px; cursor: pointer; }",

    /* typing */
    "#asst .typing textarea {",
    "  display: block; width: 100%; box-sizing: border-box; min-height: 92px; resize: none; border: 0; border-radius: 14px; margin-top: 6px;",
    "  background: var(--field); color: var(--ink); font: inherit; font-size: 17px; line-height: 1.4; padding: 12px 14px;",
    "}",
    "#asst .typing textarea:focus { outline: 2px solid var(--ben); }",
    "#asst .row { display: flex; align-items: center; gap: 10px; margin-top: 12px; }",
    "#asst .row .swap { margin: 0; flex: 1; text-align: left; padding: 8px 4px; }",
    "#asst .go { flex: none; border: 0; border-radius: 999px; background: var(--accent); color: var(--on-accent); font: inherit; font-size: 16px; font-weight: 800; padding: 13px 22px; cursor: pointer; }",
    "#asst .go:disabled { opacity: .45; cursor: default; }",
    "#asst[data-mode=voice] .typing, #asst[data-mode=type] .voice { display: none; }",
    "#asst.results[data-mode=voice] .voice { display: none; }   /* after a voice add: just the results and Add more */",

    /* results */
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
    "#asst .acts .again { margin-left: auto; background: " + VIOLET + "; color: #fff; display: inline-flex; align-items: center; gap: 6px; }",
    "#asst .acts .again svg { width: 17px; height: 17px; stroke: currentColor; fill: none; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }",
    "#asstUndo {",
    "  position: fixed; left: max(16px, calc(50% - 234px)); bottom: calc(84px + env(safe-area-inset-bottom, 0px)); z-index: 34;",
    "  transform: translate(0, 16px); opacity: 0; pointer-events: none; transition: opacity .2s, transform .2s; translate: 0 var(--pin, 0px);",
    "  display: flex; align-items: center; gap: 14px; max-width: calc(100% - 112px);",
    "  background: var(--ink); color: var(--bg); border-radius: 22px; padding: 10px 10px 10px 16px;",
    "  font-size: 14px; font-weight: 600; box-shadow: 0 6px 24px rgba(0,0,0,.2);",
    "}",
    "#asstUndo.show { opacity: 1; transform: translate(0, 0); pointer-events: auto; }",
    "#asstUndo span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }",
    "#asstUndo button { border: 0; border-radius: 14px; background: var(--ben); color: #fff; font: inherit; font-size: 14px; font-weight: 800; padding: 6px 14px; cursor: pointer; flex: none; }",
    "#asst .err { color: var(--ash); font-size: 15px; font-weight: 700; margin: 0 4px; }",
    "#asst .busy { display: flex; align-items: center; justify-content: center; gap: 10px; color: var(--muted); font-size: 15px; font-weight: 700; margin: 0 4px; }",
    "#asst .busy i { width: 16px; height: 16px; border-radius: 50%; border: 2.5px solid var(--hair); border-top-color: var(--ink); animation: asstSpin .8s linear infinite; }",
    "@keyframes asstSpin { to { transform: rotate(360deg); } }"
  ].join("\n");
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  var SPARK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9L12 17.5l-1.9-5.1L5 10.5l5.1-1.9z"/><path d="M18.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/></svg>';
  var MIC = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3.5" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3"/></svg>';
  var STOP = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 12.5l4 4 9-9.5"/></svg>';
  var CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 12.5l4 4 9-9.5"/></svg>';
  var SPK_ON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/></svg>';
  var SPK_OFF = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/></svg>';
  var DASH = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 12h10"/></svg>';

  var btn = document.createElement("button");
  btn.id = "asstBtn"; btn.type = "button"; btn.setAttribute("aria-label", "Say it to add"); btn.title = "Say it to add";
  btn.innerHTML = SPARK;
  document.body.appendChild(btn);

  var bg = document.createElement("div"); bg.id = "asstBg";
  var sh = document.createElement("div"); sh.id = "asst"; sh.setAttribute("role", "dialog"); sh.setAttribute("aria-label", "Assistant");
  sh.innerHTML =
    '<div class="grab"></div>' +
    '<div class="sh-head"><h2>Add by voice</h2><div class="btns"><button type="button" class="spk"></button><button type="button" class="x" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div></div>' +
    '<div class="voice">' +
      '<button type="button" class="bigmic idle" aria-label="Start or send">' + MIC + '</button>' +
      '<div class="vsay">Tap to talk</div>' +
      '<div class="vsub">Groceries for now. Take your time; it sends after a long pause.</div>' +
      '<button type="button" class="swap to-type">Type instead</button>' +
    '</div>' +
    '<div class="typing">' +
      '<textarea rows="3" placeholder="Out of milk, need eggs and stuff for tacos" enterkeyhint="send"></textarea>' +
      '<div class="row"><button type="button" class="swap to-voice">Use the mic</button><button type="button" class="go" disabled>Add</button></div>' +
    '</div>' +
    '<div class="out" aria-live="polite"></div>';
  document.body.appendChild(bg); document.body.appendChild(sh);
  var ubar = document.createElement("div"); ubar.id = "asstUndo"; ubar.setAttribute("role", "status");
  ubar.innerHTML = '<span></span><button type="button">Undo</button>';
  document.body.appendChild(ubar);

  var ta = sh.querySelector("textarea"), go = sh.querySelector(".go"), big = sh.querySelector(".bigmic");
  var say = sh.querySelector(".vsay"), sub = sh.querySelector(".vsub"), out = sh.querySelector(".out"), head = sh.querySelector("h2");
  var SUB = sub.textContent, busy = false, status = null;

  // ---- Spoken answer after a voice add ("Added milk and eggs."), in the phone's own voice.
  // On by default; the speaker button in the sheet's header turns it off (remembered on this device).
  var spk = sh.querySelector(".spk"), canSpeak = !!(window.speechSynthesis && window.SpeechSynthesisUtterance);
  function speakOn() { try { return localStorage.getItem("hb-assist-speak") !== "off"; } catch (e) { return true; } }
  function drawSpk() {
    var on = speakOn();
    spk.innerHTML = on ? SPK_ON : SPK_OFF; spk.classList.toggle("off", !on);
    spk.setAttribute("aria-label", on ? "Spoken answers on" : "Spoken answers off"); spk.title = spk.getAttribute("aria-label");
  }
  if (canSpeak) {
    drawSpk();
    spk.addEventListener("click", function () {
      var on = !speakOn();
      try { localStorage.setItem("hb-assist-speak", on ? "on" : "off"); } catch (e) {}
      drawSpk(); if (!on) speechSynthesis.cancel(); else unlockSpeech();
      HB.toast(on ? "Spoken answers on" : "Spoken answers off");
    });
  } else spk.style.display = "none";
  // iPhone only lets a page speak after it has spoken inside a tap, so a silent word is said at the tap that
  // starts listening. (It ignores a blank one, and speak() straight after cancel() can be dropped, so neither.)
  var unlocked = false;
  function unlockSpeech() {
    if (!canSpeak || !speakOn() || unlocked) return;
    try { var u = new SpeechSynthesisUtterance("ok"); u.volume = 0; u.rate = 2; speechSynthesis.speak(u); unlocked = true; } catch (e) {}
  }
  function listWords(a) { return a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1]; }
  function speakResult(res, added, skipped) {
    if (!canSpeak || !speakOn()) return;
    var line;
    if (!added.length && !skipped.length) line = res.reply || "Nothing to add from that.";
    else {
      var bits = [];
      if (added.length) bits.push(added.length > 5 ? "Added " + added.length + " items." : "Added " + listWords(added.map(function (d) { return d.name; })) + ".");
      if (skipped.length) bits.push(skipped.length > 3 ? skipped.length + " were already on the list." : listWords(skipped.map(function (d) { return d.name; })) + (skipped.length === 1 ? " was" : " were") + " already on the list.");
      line = bits.join(" ");
    }
    try {
      if (speechSynthesis.speaking || speechSynthesis.pending) speechSynthesis.cancel();
      speechSynthesis.resume();
      var u = new SpeechSynthesisUtterance(line), lang = document.documentElement.lang || navigator.language || "en-US";
      u.lang = /^en/i.test(lang) ? lang : "en-US"; u.rate = 1;
      speechSynthesis.speak(u);
    } catch (e) {}
  }

  function esc(s) { return HB.esc ? HB.esc(s) : String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function page() { return (HB.page && HB.page()) || ""; }
  function canVoice() { return !!(navigator.mediaDevices && window.MediaRecorder) && !(status && !status.voice); }

  function loadStatus() {
    return db.pb.send("/api/hb/assist", { method: "GET" }).then(function (s) { status = s; return s; }, function () { return null; });
  }

  // ---- placement: the +'s usual spot on every page (the + itself moves up above it, see the CSS) ----
  // Reads the +'s own left/bottom (not its on-screen box), so both share the same --pin nudge.
  function place() {
    var fab = document.getElementById("fab"); if (!fab) return;
    var cs = getComputedStyle(fab);
    btn.style.left = cs.left;
    btn.style.bottom = cs.bottom;
  }
  window.addEventListener("resize", place);

  function setMode(m) {
    sh.dataset.mode = m; sh.classList.remove("results");
    head.textContent = m === "voice" ? "Add by voice" : "Add with a sentence";
    if (m === "type") setTimeout(function () { ta.focus(); }, 60);
  }

  // The button: open the sheet and start listening straight away (the tap counts as permission to use the mic).
  function open(mode) {
    out.innerHTML = "";
    sh.classList.add("show"); bg.classList.add("show");
    if (status && !status.ready) { setMode("type"); out.innerHTML = '<p class="err">The assistant isn’t set up on the server yet.</p>'; return; }
    if (mode !== "type" && canVoice()) { setMode("voice"); listen(); }
    else setMode("type");
  }
  function close() {
    stopAuto();
    stopListening(true);
    sh.classList.remove("show"); bg.classList.remove("show"); ta.blur();
  }
  btn.addEventListener("click", function () { open(); });
  bg.addEventListener("click", close);
  sh.querySelector(".x").addEventListener("click", close);
  sh.querySelector(".to-type").addEventListener("click", function () { stopListening(true); setMode("type"); });
  sh.querySelector(".to-voice").addEventListener("click", function () { out.innerHTML = ""; setMode("voice"); listen(); });
  big.addEventListener("click", function () { if (rec) stopListening(false); else { out.innerHTML = ""; listen(); } });
  ta.addEventListener("input", function () { go.disabled = busy || !ta.value.trim(); });
  ta.addEventListener("keydown", function (e) { if (e.key === "Enter" && !e.shiftKey && !go.disabled) { e.preventDefault(); send({ text: ta.value }); } });
  go.addEventListener("click", function () { send({ text: ta.value }); });

  // ---- listening: records until you stop talking (or tap), then sends ----
  var rec = null, chunks = [], stream = null, actx = null, raf = 0, cancel = false;
  function idleLook(word, note) {
    big.classList.add("idle"); big.innerHTML = MIC; big.style.removeProperty("--lvl");
    say.textContent = word || "Tap to talk"; sub.textContent = note || SUB;
  }
  function listen() {
    if (busy || rec) return;
    cancel = false; sh.classList.remove("results");
    unlockSpeech();
    try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { actx = null; }   // made inside the tap, so iPhone allows it
    big.classList.remove("idle"); big.innerHTML = STOP;
    say.textContent = "Listening…"; sub.textContent = LISTEN_SUB;
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (s) {
      if (cancel) { s.getTracks().forEach(function (t) { t.stop(); }); return; }
      stream = s; chunks = [];
      var type = ["audio/mp4", "audio/webm;codecs=opus", "audio/webm", "audio/ogg"].filter(function (t) { return MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t); })[0];
      rec = type ? new MediaRecorder(s, { mimeType: type }) : new MediaRecorder(s);
      rec.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
      rec.onstop = finished;
      rec.start(250);
      watch(s);
    }, function () {
      idleLook("Mic not allowed", "Allow the microphone for Home Board, or type instead.");
      if (actx) { try { actx.close(); } catch (e) {} actx = null; }
    });
  }
  // Watch the loudness. Pauses are fine (looking in the fridge): it only sends after 6 s of quiet.
  // Tap to send sooner. Nothing heard in 15 s gives up; 2 minutes at most.
  var QUIET_MS = 6000, NOTHING_MS = 15000, MAX_MS = 120000;
  var LISTEN_SUB = "Pauses are fine. Tap when you\u2019re done, or go quiet for a few seconds.";
  function watch(s) {
    var started = Date.now(), heard = false, lastLoud = 0, an = null, buf = null;
    if (actx) {
      try {
        if (actx.state === "suspended") actx.resume();
        var src = actx.createMediaStreamSource(s); an = actx.createAnalyser(); an.fftSize = 1024;
        src.connect(an); buf = new Uint8Array(an.fftSize);
      } catch (e) { an = null; }
    }
    function tick() {
      if (!rec) return;
      var now = Date.now();
      if (an) {
        an.getByteTimeDomainData(buf);
        var sum = 0; for (var i = 0; i < buf.length; i++) { var v = (buf[i] - 128) / 128; sum += v * v; }
        var rms = Math.sqrt(sum / buf.length);
        big.style.setProperty("--lvl", Math.min(1, rms * 8).toFixed(2));
        if (rms > 0.035) { heard = true; lastLoud = now; }
        var quiet = heard ? now - lastLoud : 0;
        if (heard && quiet > QUIET_MS) { stopListening(false); return; }
        if (!heard && now - started > NOTHING_MS) { cancel = true; stopListening(true); idleLook("Didn’t hear anything", "Tap to try again, or type instead."); return; }
      }
      if (now - started > MAX_MS) { stopListening(false); return; }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
  }
  function stopListening(discard) {
    if (discard) cancel = true;
    cancelAnimationFrame(raf);
    if (rec && rec.state !== "inactive") rec.stop();
    else if (discard) { release(); idleLook(); }
  }
  function release() {
    if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
    if (actx) { try { actx.close(); } catch (e) {} actx = null; }
  }
  function finished() {
    var r = rec; rec = null; release();
    if (cancel) { if (say.textContent === "Listening…") idleLook(); return; }
    var blob = new Blob(chunks, { type: (r && r.mimeType) || "audio/webm" });
    if (blob.size < 2000) { idleLook("Didn’t catch that", "Tap to try again."); return; }
    idleLook("Got it", "Working on it…");
    send({ audio: blob });
  }

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
    out.innerHTML = '<div class="busy"><i></i>Working on it…</div>';
    db.pb.send("/api/hb/assist", { method: "POST", body: body }).then(function (res) {
      busy = false; ta.value = ""; go.disabled = true;
      if (what.audio) idleLook("Tap to add more");
      show(res, !!what.audio);
      if (HB.refreshPage) HB.refreshPage(page());
    }, function (err) {
      busy = false; go.disabled = !ta.value.trim();
      if (what.audio) idleLook("Tap to try again");
      var msg = (err && err.response && err.response.message) || "Couldn't reach Home Board. Try again.";
      out.innerHTML = '<p class="err">' + esc(msg) + "</p>";
    });
  }

  // After a voice add the sheet closes by itself; an Undo bar stays for a few seconds. Touching the sheet keeps it open.
  var autoT = null, ubarT = null, lastAdded = [];
  function stopAuto() { clearTimeout(autoT); autoT = null; }
  sh.addEventListener("pointerdown", stopAuto);
  function undoAdded(list) {
    return Promise.all(list.map(function (d) { return db.from(d.table).delete().eq("id", d.id); })).then(function () {
      if (HB.refreshPage) HB.refreshPage(page());
    });
  }
  function showUndoBar(list) {
    lastAdded = list;
    ubar.querySelector("span").textContent = "Added " + (list.length === 1 ? "\u201c" + list[0].name + "\u201d" : list.length + " items");
    ubar.classList.add("show");
    clearTimeout(ubarT); ubarT = setTimeout(function () { ubar.classList.remove("show"); }, 6000);
  }
  ubar.querySelector("button").addEventListener("click", function () {
    clearTimeout(ubarT); ubar.classList.remove("show");
    undoAdded(lastAdded).then(function () { HB.toast("Undone"); }, function () { HB.toast("Couldn't undo. Try again."); });
  });

  function show(res, spoken) {
    var done = res.done || [], added = done.filter(function (d) { return !d.skipped && d.id; });
    var h = "";
    if (spoken && res.heard) h += '<p class="heard">Heard: “' + esc(res.heard) + "”</p>";
    if (!done.length) h += '<p class="said">' + esc(res.reply || "Nothing to add from that.") + "</p>";
    else h += '<div class="done">' + done.map(function (d) {
      return '<div class="' + (d.skipped ? "skip" : "") + '">' + (d.skipped ? DASH : CHECK) + "<span>" + esc(d.label || d.name) + "</span></div>";
    }).join("") + "</div>";
    h += '<div class="acts">' + (added.length ? '<button type="button" class="undo-all">Undo</button>' : "") +
      '<button type="button" class="ok">Done</button>' +
      (canVoice() ? '<button type="button" class="again">' + MIC + "Add more</button>" : "") + "</div>";
    out.innerHTML = h; sh.classList.add("results");
    if (spoken) speakResult(res, added, done.filter(function (d) { return d.skipped; }));
    var u = out.querySelector(".undo-all"), ok = out.querySelector(".ok"), again = out.querySelector(".again");
    ok.onclick = close;
    if (again) again.onclick = function () { out.innerHTML = ""; setMode("voice"); listen(); };
    if (u) u.onclick = function () {
      u.disabled = true;
      Promise.all(added.map(function (d) { return db.from(d.table).delete().eq("id", d.id); })).then(function () {
        out.innerHTML = '<p class="said">Undone. Nothing was added.</p>'; sh.classList.remove("results");
        if (HB.refreshPage) HB.refreshPage(page());
      }, function () { u.disabled = false; HB.toast("Couldn't undo. Try again."); });
    };
    stopAuto();
    if (spoken && added.length) autoT = setTimeout(function () { autoT = null; close(); showUndoBar(added); }, 4000);
  }

  HB.assist = {
    open: open, close: close, place: place,
    on: function (on) { document.body.classList.toggle("asst-on", !!on); place(); if (on && !status) loadStatus(); }
  };
})();
