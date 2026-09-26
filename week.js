/* Home Board: Weekly Plan page.
   Loaded by index.html, which provides HB.db (Supabase), HB.toast and the sign-in.
   Everything below only draws and saves the week. */
HB.register("week", {
  title: "Weekly Plan",

  css: `
#pg-week .wk-nav { display: inline-flex; align-items: center; margin-left: 2px; vertical-align: middle; position: relative; top: -1px; white-space: nowrap; }
#pg-week .wk-nav button {
  appearance: none; border: 0; background: none; color: var(--muted); cursor: pointer;
  width: 22px; height: 30px; padding: 0; display: grid; place-items: center; border-radius: 8px;
}
#pg-week .wk-nav button svg { width: 15px; height: 15px; stroke: currentColor; fill: none; stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round; }
#pg-week .wk-nav button:active { background: var(--chip); }
#pg-week .wk-nav button:disabled { opacity: .25; cursor: default; background: none; pointer-events: none; }
#pg-week .range { color: var(--muted); font-size: 13px; font-weight: 600; letter-spacing: 0; position: relative; }
#pg-week .range.other { color: var(--ben); }
#pg-week .range.other::after {
  content: attr(aria-label); position: absolute; left: 0; right: 0; top: 100%; text-align: center;
  font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .4px; white-space: nowrap;
}

#pg-week .cols {
  display: grid; grid-template-columns: 56px repeat(3, 1fr);
  padding: 8px 0 6px; border-bottom: 0.5px solid var(--hair);
  font-size: 13px; font-weight: 700; color: var(--muted); text-align: center;
}
#pg-week .days { display: flex; flex-direction: column; }
#pg-week .day {
  min-height: 56px; padding: 5px 0; border-bottom: 0.5px solid var(--hair);
  display: flex; flex-direction: column; justify-content: center;
  transition: background-color .35s ease;
}
#pg-week .row { display: grid; grid-template-columns: 56px repeat(3, 1fr); align-items: center; }
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
#pg-week .cell[data-v="A"] { background: var(--ash); color: #fff; }
#pg-week .cell[data-v="B"] { background: var(--ben); color: #fff; }
#pg-week .cell[data-v="Both"] { background: var(--both); color: #fff; font-size: 11px; letter-spacing: -0.2px; }
#pg-week .cell:focus-visible, #pg-week textarea:focus-visible { outline: 2px solid var(--ben); outline-offset: 2px; }
#pg-week .cell svg { width: 20px; height: 20px; stroke: currentColor; fill: none; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; display: block; margin: auto; }

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
    var CYCLE = ["", "A", "B", "Both"];
    var NAMES = { "": "nobody yet", A: "Ash", B: "Ben", Both: "both of us" };
    var SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    var FIELDS = [["drop_off","Drop off"],["pick_up","Pick up"],["dinner","Dinner"]];

    root.innerHTML =
      '<div class="top"><header>' +
        '<div class="title"><h1>Weekly Plan<span class="wk-nav">' +
          '<button class="prev" aria-label="Last week"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>' +
          '<span class="range"></span>' +
          '<button class="next" aria-label="Next week"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button>' +
        '</span></h1></div>' +
        '<div class="nav"><span class="vo">View only</span></div>' +
      '</header>' +
      '<div class="cols"><span></span><span>Drop off</span><span>Pick up</span><span>Dinner</span></div></div>' +
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
    function blank() { return { drop_off: "", pick_up: "", dinner: "", notes: "" }; }
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
      FIELDS.forEach(function (f) { if (r.paint[f[0]]) r.paint[f[0]](CYCLE.indexOf(row[f[0]] || "") > 0 ? row[f[0]] : ""); });
      if (document.activeElement !== r.t) { r.t.value = row.notes || ""; autosize(r.t); }
      r.day.classList.toggle("has-note", !!(row.notes || "").trim());
      if ((row.notes || "").trim()) autosize(r.t);
    }

    function render() {
      daysEl.innerHTML = ""; refs = {};
      var sun = addDays(weekStart, 6);
      rangeEl.textContent = SHORT[weekStart.getMonth()] + " " + weekStart.getDate() + " – " +
        (sun.getMonth() !== weekStart.getMonth() ? SHORT[sun.getMonth()] + " " : "") + sun.getDate();

      ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].forEach(function (label, i) {
        var weekend = i >= 5;   // Sat & Sun: just a note, no drop off / pick up / dinner
        var date = addDays(weekStart, i);
        var key = iso(date);
        var day = document.createElement("section");
        day.className = "day" + (weekend ? " weekend" : "") + (key === iso(today) ? " today" : "");
        var r = document.createElement("div");
        r.className = "row";

        var dn = document.createElement("button");
        dn.className = "dname";
        dn.setAttribute("aria-expanded", "false");
        dn.setAttribute("aria-label", label + " " + date.getDate() + ", show notes");
        dn.innerHTML = '<span class="dow">' + label + '</span><span class="num">' + date.getDate() + '</span>';
        r.appendChild(dn);

        var paint = {};
        if (weekend) {
          var hint = document.createElement("span"); hint.className = "wk-hint"; hint.textContent = "Add a note";
          r.appendChild(hint);
        } else FIELDS.forEach(function (f) {
          var b = document.createElement("button");
          b.className = "cell";
          paint[f[0]] = function (v) {
            b.dataset.v = v; if (v) b.textContent = v; else b.innerHTML = PERSON_ICON;
            b.setAttribute("aria-label", label + " " + f[1] + ": " + NAMES[v]);
          };
          paint[f[0]]("");
          b.addEventListener("click", function () {
            var v = CYCLE[(CYCLE.indexOf(b.dataset.v) + 1) % CYCLE.length];
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
        refs[key] = { paint: paint, t: t, day: day };
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

    render(); paintArrows(); loadWeek();
  }
});
