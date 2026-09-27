/// <reference path="../pb_data/types.d.ts" />
// Home Board server jobs. PocketBase reloads this file by itself when it changes.
// (Each handler runs on its own, so helpers are defined inside the handler that uses them.)

// ---- nightly tidy-up (times are UTC; 06:30 UTC is 1:30–2:30 am in New York) ----
// Weekly Plan keeps last week, this week and next week: anything older goes.
// Plans that happened more than a week ago go too (they already disappear from the page).
cronAdd("home-board-tidy", "30 6 * * *", () => {
  function iso(d) { return d.toISOString().slice(0, 10); }
  const now = new Date(Date.now() - 5 * 3600000);          // close enough to New York time for whole days
  const monday = new Date(now); monday.setUTCDate(now.getUTCDate() - ((now.getUTCDay() + 6) % 7));
  const keepFrom = new Date(monday); keepFrom.setUTCDate(monday.getUTCDate() - 7);
  const weekAgo = new Date(now); weekAgo.setUTCDate(now.getUTCDate() - 7);

  const oldDays = $app.findRecordsByFilter("days", "date < {:d}", "", 1000, 0, { d: iso(keepFrom) });
  oldDays.forEach((r) => $app.delete(r));
  const oldPlans = $app.findRecordsByFilter("plans", "date != '' && date < {:d}", "", 1000, 0, { d: iso(weekAgo) });
  oldPlans.forEach((r) => $app.delete(r));
  console.log("home-board-tidy: removed " + oldDays.length + " old days, " + oldPlans.length + " old plans");
});

// ---- Plans calendar feed: /cal/plans-<code>.ics ----
// Each phone subscribes to this link once in the Calendar app. It's built fresh from the Plans
// table on every request, so it's always current. The long code lives in app_settings.
routerAdd("GET", "/cal/{file}", (e) => {
  const file = e.request.pathValue("file") || "";
  const m = file.match(/^plans-([A-Za-z0-9]+)\.ics$/);
  let setting = null;
  try { setting = $app.findFirstRecordByFilter("app_settings", "key = 'calendar_feed'"); } catch (err) {}
  if (!m || !setting || m[1] !== setting.getString("value")) return e.string(404, "Not found");

  function pad(n) { return String(n).padStart(2, "0"); }
  function esc(v) { return String(v || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n"); }
  function fold(line) { const out = []; let s = line; while (s.length > 74) { out.push(s.slice(0, 74)); s = " " + s.slice(74); } out.push(s); return out.join("\r\n"); }
  function ymd(s) { return s.replace(/-/g, ""); }
  function nextDay(s) { const d = new Date(s + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + 1); return d.toISOString().slice(0, 10); }
  function stampOf(s) { const d = new Date(s || Date.now()); return isNaN(d) ? "20260101T000000Z" : d.toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z"); }

  const from = new Date(Date.now() - 60 * 86400000).toISOString().slice(0, 10);
  const plans = $app.findRecordsByFilter("plans", "date != '' && date >= {:f}", "date", 2000, 0, { f: from });
  const L = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Home Board//Plans//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
             "X-WR-CALNAME:Home Board Plans", "X-WR-TIMEZONE:America/New_York",
             "REFRESH-INTERVAL;VALUE=DURATION:PT1H", "X-PUBLISHED-TTL:PT1H"];
  plans.forEach((p) => {
    const name = p.getString("name"), note = p.getString("note"), date = p.getString("date");
    // a time in the name or note ("2pm", "6:30 pm") makes it a 2-hour event; otherwise all-day
    const t = (name + " " + note).match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm|a|p)\b/i);
    L.push("BEGIN:VEVENT", "UID:" + p.id + "@home-board", "DTSTAMP:" + stampOf(p.getString("created_at")));
    if (t) {
      const h = (Number(t[1]) % 12) + (/p/i.test(t[3]) ? 12 : 0), mi = Number(t[2] || 0);
      const endH = h + 2;
      const endDate = endH >= 24 ? nextDay(date) : date;
      L.push("DTSTART:" + ymd(date) + "T" + pad(h) + pad(mi) + "00", "DTEND:" + ymd(endDate) + "T" + pad(endH % 24) + pad(mi) + "00");
    } else {
      L.push("DTSTART;VALUE=DATE:" + ymd(date), "DTEND;VALUE=DATE:" + ymd(nextDay(date)));
    }
    L.push("SUMMARY:" + esc(name));
    if (note) L.push("DESCRIPTION:" + esc(note));
    L.push("END:VEVENT");
  });
  L.push("END:VCALENDAR");

  e.response.header().set("Content-Type", "text/calendar; charset=utf-8");
  e.response.header().set("Cache-Control", "public, max-age=300");
  return e.string(200, L.map(fold).join("\r\n") + "\r\n");
});

// ---- the page files: always check for a newer copy, so phones don't keep an old version ----
routerUse((e) => {
  const p = e.request.url.path;
  if (p === "/" || /\.(html|js)$/.test(p)) e.response.header().set("Cache-Control", "no-cache");
  return e.next();
});
