/* Home Board: At a Glance page (the week).
   Loaded by index.html, which provides HB.db (the database), HB.toast and the sign-in.
   Everything below only draws and saves the week. */
HB.register("week", {
  title: "At a Glance",

  css: `
#pg-week header { align-items: center; }
#pg-week .title h1 { white-space: nowrap; }
#pg-week .nav { align-items: center; }
#pg-week .wk-nav { display: inline-flex; align-items: center; height: 36px; border-radius: 18px; background: var(--chip); padding: 0 2px; white-space: nowrap; }
#pg-week .wk-nav button {
  appearance: none; border: 0; background: none; color: var(--muted); cursor: pointer;
  width: 30px; height: 32px; padding: 0; display: grid; place-items: center; border-radius: 16px;
}
#pg-week .wk-nav button svg { width: 15px; height: 15px; stroke: currentColor; fill: none; stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round; }
#pg-week .wk-nav button:active { background: var(--hair); }
#pg-week .wk-nav button:disabled { opacity: .25; cursor: default; background: none; pointer-events: none; }
#pg-week .range { color: var(--ink); font-size: 14px; font-weight: 700; letter-spacing: 0; position: relative; min-width: 84px; text-align: center; }
#pg-week .range.other { color: var(--ben); }
#pg-week .wk-nav.other { background: color-mix(in srgb, var(--ben) 16%, var(--chip)); }

#pg-week .cols {
  display: grid; grid-template-columns: 62px repeat(3, 1fr);
  padding: 8px 0 6px; border-bottom: 0.5px solid var(--hair);
  font-size: 13px; font-weight: 700; color: var(--muted); text-align: center;
}
#pg-week .days { display: flex; flex-direction: column; }
#pg-week .day {
  min-height: 56px; padding: 5px 0; border-bottom: 0.5px solid var(--hair);
  display: flex; flex-direction: column; justify-content: center;
  transition: background-color .35s ease;
}
#pg-week .row { display: grid; grid-template-columns: 62px repeat(3, 1fr); align-items: center; }
/* who's home: a little house beside the date (faint outline = nobody marked) */
#pg-week .dcell { position: relative; align-self: stretch; display: flex; align-items: center; }
#pg-week .home {
  position: absolute; right: 0; bottom: 3px; width: 30px; height: 30px; padding: 0;
  appearance: none; border: 0; background: none; cursor: pointer; display: grid; place-items: center;
  -webkit-tap-highlight-color: transparent; transition: transform .12s ease;
}
#pg-week .home:active { transform: scale(.88); }
#pg-week .home svg { width: 26px; height: 26px; overflow: visible; }
#pg-week .home svg .hs { fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
#pg-week .home svg .hf { fill: currentColor; }
#pg-week .home svg text { fill: currentColor; font: 800 10px/1 -apple-system, system-ui, sans-serif; text-anchor: middle; }
#pg-week .home.empty { color: var(--muted); opacity: .45; }
/* an unmarked house only shows while that day is open (tap the date) */
#pg-week .day:not(.open) .home.empty { display: none; }
#pg-week .home[hidden] { display: none; }
body.viewonly #pg-week .home.empty { display: none; }
body.viewonly #pg-week .vo { display: none; }   /* no room beside the week pill */
body.viewonly #pg-week .vo { display: none; }   /* no room beside the week pill */
#pg-week .dname {
  display: flex; flex-direction: column; align-items: flex-start;
  appearance: none; border: 0; background: none; color: inherit; font: inherit; cursor: pointer;
  padding: 4px 0; text-align: left;
}
#pg-week .dname .dow { font-size: 12px; font-weight: 700; color: var(--muted); }
#pg-week .dname:focus-visible { outline: 2px solid var(--ben); outline-offset: 2px; border-radius: 8px; }
#pg-week .dname .num {
  font-size: 18px; font-weight: 800; line-height: 1; margin-top: 2px;
  min-width: 28px; height: 28px; display: grid; place-items: center; border-radius: 14px; margin-left: -5px; padding: 0 4px;
  transition: background-color .35s ease, color .35s ease;
}
#pg-week .day.today .dname .dow { color: var(--ink); }
#pg-week .day.today .dname .num { background: var(--today); color: var(--bg); }

#pg-week .cell {
  justify-self: center; appearance: none; border: 0; cursor: pointer;
  width: 42px; height: 42px; border-radius: 21px;
  font-family: inherit; font-size: 18px; font-weight: 800; line-height: 1;
  color: var(--muted); background: var(--chip);
  transition: transform .12s ease, background-color .35s ease;
}
#pg-week .cell:active { transform: scale(.92); }
#pg-week .cell.filled { color: #fff; }
#pg-week .cell.long { font-size: 11px; letter-spacing: -0.2px; }
#pg-week .cols[hidden] { display: none; }
#pg-week .cell:focus-visible, #pg-week textarea:focus-visible { outline: 2px solid var(--ben); outline-offset: 2px; }
#pg-week .cell svg.both-ic { width: 26px; height: 26px; fill: currentColor; stroke: none; }
#pg-week .cell svg:not(.both-ic) { width: 20px; height: 20px; stroke: currentColor; fill: none; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; display: block; margin: auto; }

#pg-week .notes-panel { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .2s ease; }
#pg-week .notes-panel > div { overflow: hidden; }
#pg-week .day.open .notes-panel, #pg-week .day.has-note .notes-panel { grid-template-rows: 1fr; }
#pg-week textarea {
  display: block; width: 100%; margin: 4px 0 2px; resize: none; overflow: hidden;
  border: 0; border-radius: 10px; background: var(--field); color: var(--ink);
  font-size: 16px; line-height: 1.4; font-weight: 500; font-family: inherit; /* 16px stops iOS zoom on focus */
  padding: 7px 12px; min-height: 36px;
}
#pg-week textarea:focus { outline: none; }
#pg-week textarea::placeholder { color: var(--muted); opacity: .7; }

/* Sat & Sun: same rows as the weekdays, just a note instead of bubbles */
#pg-week .day.weekend .row { cursor: pointer; }
#pg-week .day.weekend .wk-hint { grid-column: 2 / -1; color: var(--muted); opacity: .55; font-size: 14px; font-weight: 600; padding-left: 6px; }
#pg-week .day.weekend.has-note .wk-hint, #pg-week .day.weekend.open .wk-hint { visibility: hidden; }

body.viewonly #pg-week .days { pointer-events: none; }
body.viewonly #pg-week .cell { cursor: default; }
body.viewonly #pg-week .day.weekend .wk-hint { display: none; }

@media (prefers-reduced-motion: reduce) {
  #pg-week .notes-panel, #pg-week .cell { transition: none; }
  #pg-week .cell:active { transform: none; }
}
`,

  mount: function (root) {
    var db = HB.db, toast = HB.toast;
    var PERSON_ICON = '<svg viewBox="0 0 24 24"><circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5"/></svg>';   // empty bubble: tap to assign
    var SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    // the columns and people come from Family settings (☰ → Family settings)
    var FIELDS = [];
    function readFields() { FIELDS = HB.family().columns.filter(function (c) { return c.on; }).map(function (c) { return [c.key, c.name]; }); }

    root.innerHTML =
      '<div class="top"><header>' +
        '<div class="title"><h1>At a Glance</h1></div>' +
        '<div class="nav"><span class="vo">View only</span>' +
          // last week / this week / next week only
          '<span class="wk-nav">' +
            '<button class="prev" aria-label="Last week"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>' +
            '<span class="range"></span>' +
            '<button class="next" aria-label="Next week"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button>' +
          '</span></div>' +
      '</header>' +
      '<div class="cols"></div></div>' +
      '<div class="days"></div>';
    var daysEl = root.querySelector(".days"), rangeEl = root.querySelector(".range");
    var prevBtn = root.querySelector(".prev"), nextBtn = root.querySelector(".next");

    var data = {};     // date -> row
    var refs = {};     // date -> { paint: {field: fn}, t: textarea, day: el }
    var today = new Date();

    function iso(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
    function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
    function mondayOf(d) { var x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); return addDays(x, -((x.getDay() + 6) % 7)); }
    function autosize(t) { t.style.height = "auto"; t.style.height = t.scrollHeight + "px"; }
    function blank() { return { drop_off: "", pick_up: "", dinner: "", home: "", notes: "" }; }
    // the house: outline + the person's initial, or two little people for "both"
    function houseSvg(who) {
      var inner = "";
      if (who && who.id === "Both") inner =
        '<g class="hf" transform="translate(6.2 9.4) scale(.48)"><circle cx="8.3" cy="8.6" r="2.9"/><circle cx="15.7" cy="8.6" r="2.9"/>' +
        '<path d="M2.8 19c.4-3.6 2.6-5.6 5.5-5.6s5.1 2 5.5 5.6zM10.7 19c.4-3.6 2.6-5.6 5-5.6 2.9 0 5.1 2 5.5 5.6z"/></g>';
      else if (who) inner = '<text x="12" y="' + (who.short.length > 1 ? "17.8" : "18.4") + '"' + (who.short.length > 1 ? ' style="font-size:7px"' : "") + '>' + HB.esc(who.short) + '</text>';
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="hs" d="M3 11.2 12 4l9 7.2"/><path class="hs" d="M5.2 9.6V20.2h13.6V9.6"/>' + inner + '</svg>';
    }
    function homeCycle() {
      var c = [""].concat(HB.family().people.map(function (p) { return p.id; }));
      c.push("Both");   // "both home" always makes sense, even with the Together option off
      return c;
    }
    function homeInfo(v) {
      if (v === "Both") { var t = HB.family().together; return { id: "Both", short: "", name: "everyone", color: t.color }; }
      return HB.whoInfo(v);
    }
    var thisWeek = mondayOf(today), weekStart = thisWeek;

    // ---- saving ----
    function saveField(key, field, value) {
      data[key] = data[key] || blank();
      data[key][field] = value;
      var row = { date: key, updated_at: new Date().toISOString() };
      row[field] = value;
      return db.from("days").upsert(row, { onConflict: "date" }).then(function (res) {
        if (res.error) toast("Couldn't save. Check your connection.");
      });
    }
    var noteTimers = {};
    function saveNoteSoon(key, value) {
      data[key] = data[key] || blank();
      data[key].notes = value;
      clearTimeout(noteTimers[key]);
      noteTimers[key] = setTimeout(function () { saveField(key, "notes", value); }, 600);
    }

    // ---- drawing ----
    function applyRow(key) {
      var r = refs[key]; if (!r) return;
      var row = data[key] || blank();
      FIELDS.forEach(function (f) { if (r.paint[f[0]]) r.paint[f[0]](row[f[0]] || ""); });
      if (r.paintHome) r.paintHome(row.home || "");
      if (document.activeElement !== r.t) { r.t.value = row.notes || ""; autosize(r.t); }
      r.day.classList.toggle("has-note", !!(row.notes || "").trim());
      if ((row.notes || "").trim()) autosize(r.t);
    }

    function render() {
      readFields();
      daysEl.innerHTML = ""; refs = {};
      var grid = "62px" + (FIELDS.length ? " repeat(" + FIELDS.length + ", 1fr)" : " 1fr");
      var colsEl = root.querySelector(".cols");
      colsEl.hidden = !FIELDS.length;
      colsEl.style.gridTemplateColumns = grid;
      colsEl.innerHTML = "<span></span>" + FIELDS.map(function (f) { return "<span>" + HB.esc(f[1]) + "</span>"; }).join("");
      var weekendCols = HB.family().weekendColumns;
      var sun = addDays(weekStart, 6);
      rangeEl.textContent = SHORT[weekStart.getMonth()] + " " + weekStart.getDate() + " – " +
        (sun.getMonth() !== weekStart.getMonth() ? SHORT[sun.getMonth()] + " " : "") + sun.getDate();

      ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].forEach(function (label, i) {
        // a note-only row: no columns switched on, or Sat & Sun when "show on weekends" is off
        var satSun = i >= 5 && !weekendCols;
        var weekend = !FIELDS.length || satSun;
        var date = addDays(weekStart, i);
        var key = iso(date);
        var day = document.createElement("section");
        day.className = "day" + (weekend ? " weekend" : "") + (key === iso(today) ? " today" : "");
        var r = document.createElement("div");
        r.className = "row";
        r.style.gridTemplateColumns = grid;

        var dn = document.createElement("button");
        dn.className = "dname";
        dn.setAttribute("aria-expanded", "false");
        dn.setAttribute("aria-label", label + " " + date.getDate() + ", show notes");
        dn.innerHTML = '<span class="dow">' + label + '</span><span class="num">' + date.getDate() + '</span>';
        var dc = document.createElement("div"); dc.className = "dcell";
        dc.appendChild(dn);
        var hb = document.createElement("button");
        hb.type = "button"; hb.className = "home";
        hb.hidden = !HB.family().homeTag || satSun;   // weekdays only (or every day when columns show on weekends)
        var paintHome = function (v) {
          var who = v ? homeInfo(v) : null;
          hb.dataset.v = v || "";
          hb.classList.toggle("empty", !who);
          hb.style.color = who ? HB.colorVar(who.color) : "";
          hb.innerHTML = houseSvg(who);
          hb.setAttribute("aria-label", label + ": " + (who ? who.name + " home" : "nobody marked home"));
        };
        hb.addEventListener("click", function (e) {
          e.stopPropagation();
          var c = homeCycle(), v = c[(Math.max(0, c.indexOf(hb.dataset.v)) + 1) % c.length];
          paintHome(v); saveField(key, "home", v);
        });
        dc.appendChild(hb);
        r.appendChild(dc);

        var paint = {};
        if (weekend) {
          var hint = document.createElement("span"); hint.className = "wk-hint"; hint.textContent = "Add a note";
          r.appendChild(hint);
        } else FIELDS.forEach(function (f) {
          var b = document.createElement("button");
          b.className = "cell";
          paint[f[0]] = function (v) {
            var who = HB.whoInfo(v);
            b.dataset.v = v || "";
            b.classList.toggle("filled", !!who);
            b.classList.toggle("long", !!who && who.id !== "Both" && who.short.length > 2);
            b.style.background = who ? HB.colorVar(who.color) : "";
            b.innerHTML = who ? HB.whoHtml(who) : PERSON_ICON;
            b.setAttribute("aria-label", label + " " + f[1] + ": " + (who ? who.name : "nobody yet"));
          };
          paint[f[0]]("");
          b.addEventListener("click", function () {
            var cycle = HB.whoCycle();
            var v = cycle[(Math.max(0, cycle.indexOf(b.dataset.v)) + 1) % cycle.length];
            paint[f[0]](v);
            saveField(key, f[0], v);
          });
          r.appendChild(b);
        });
        day.appendChild(r);

        var t = document.createElement("textarea");
        t.rows = 1; t.placeholder = "Notes";
        t.readOnly = HB.viewer;
        t.setAttribute("aria-label", label + " notes");
        t.addEventListener("input", function () {
          autosize(t);
          day.classList.toggle("has-note", !!t.value.trim());
          saveNoteSoon(key, t.value);
        });
        var panel = document.createElement("div"); panel.className = "notes-panel";
        var inner = document.createElement("div"); inner.appendChild(t); panel.appendChild(inner);
        day.appendChild(panel);
        function toggleNote() {
          var open = day.classList.toggle("open");
          dn.setAttribute("aria-expanded", String(open));
          if (open) { autosize(t); if (!t.value) t.focus({ preventScroll: true }); } else t.blur();
        }
        // weekdays: tap the day name; weekend: tap anywhere on the row
        if (weekend) r.addEventListener("click", toggleNote); else dn.addEventListener("click", toggleNote);

        daysEl.appendChild(day);
        refs[key] = { paint: paint, paintHome: satSun ? null : paintHome, t: t, day: day };
        applyRow(key);
      });
    }

    function loadWeek() {
      var from = iso(weekStart), to = iso(addDays(weekStart, 6));
      return db.from("days").select("*").gte("date", from).lte("date", to).then(function (res) {
        if (res.error) { toast("Couldn't load the week."); return; }
        res.data.forEach(function (row) { data[row.date] = row; applyRow(row.date); });
      });
    }

    db.channel("days-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "days" }, function (payload) {
        var row = payload.new;
        if (!row || !row.date) return;
        data[row.date] = row;
        applyRow(row.date);
      })
      .subscribe();

    // Arrows move one week back or forward from this week, and no further
    function weekOffset() { return Math.round((weekStart - thisWeek) / (7 * 86400000)); }
    function paintArrows() {
      var o = weekOffset();
      prevBtn.disabled = o <= -1;
      nextBtn.disabled = o >= 1;
      rangeEl.classList.toggle("other", o !== 0);
      rangeEl.parentNode.classList.toggle("other", o !== 0);
      rangeEl.parentNode.title = o === 0 ? "This week" : o < 0 ? "Last week" : "Next week";
      rangeEl.setAttribute("aria-label", o === 0 ? "This week" : o < 0 ? "Last week" : "Next week");
    }
    function go(n) {
      var o = Math.max(-1, Math.min(1, weekOffset() + n));
      weekStart = addDays(thisWeek, 7 * o); render(); loadWeek(); paintArrows();
    }
    prevBtn.addEventListener("click", function () { go(-1); });
    nextBtn.addEventListener("click", function () { go(1); });

    window.addEventListener("resize", function () { Object.keys(refs).forEach(function (k) { autosize(refs[k].t); }); });

    // called by the app when the phone wakes up or this tab is opened again
    this.refresh = function () {
      var now = new Date();
      if (iso(now) !== iso(today)) { today = now; thisWeek = weekStart = mondayOf(today); render(); paintArrows(); }
      loadWeek();
    };
    this.shown = function () { Object.keys(refs).forEach(function (k) { autosize(refs[k].t); }); };

    // Family settings changed (here or on another phone): redraw with the new people / columns
    HB.onFamily(function () { render(); });

    render(); paintArrows(); loadWeek();
  }
});
