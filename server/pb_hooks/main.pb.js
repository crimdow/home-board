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
  const oldPlans = $app.findRecordsByFilter("plans", "date != '' && idea = false && date < {:d}", "", 1000, 0, { d: iso(weekAgo) });
  oldPlans.forEach((r) => $app.delete(r));
  const oldInvites = $app.findRecordsByFilter("invites", "expires_at < {:n}", "", 1000, 0, { n: new Date(Date.now() - 30 * 86400000).toISOString() });
  oldInvites.forEach((r) => $app.delete(r));
  console.log("home-board-tidy: removed " + oldDays.length + " old days, " + oldPlans.length + " old plans, " + oldInvites.length + " old invites");
});

// ---- Plans calendar feed: /cal/plans-<code>.ics ----
// Each phone subscribes to this link once in the Calendar app. It's built fresh from the Plans
// table on every request, so it's always current. The long code lives in app_settings.
routerAdd("GET", "/cal/{file}", (e) => {
  const file = e.request.pathValue("file") || "";
  const m = file.match(/^plans-([A-Za-z0-9]+)\.ics$/);
  let setting = null;
  if (m) { try { setting = $app.findFirstRecordByFilter("app_settings", "key = 'calendar_feed' && value = {:v}", { v: m[1] }); } catch (err) {} }
  if (!setting) return e.string(404, "Not found");
  const household = setting.getString("household");   // each family has its own link and only sees its own plans

  function pad(n) { return String(n).padStart(2, "0"); }
  function esc(v) { return String(v || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n"); }
  function fold(line) { const out = []; let s = line; while (s.length > 74) { out.push(s.slice(0, 74)); s = " " + s.slice(74); } out.push(s); return out.join("\r\n"); }
  function ymd(s) { return s.replace(/-/g, ""); }
  function nextDay(s) { const d = new Date(s + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + 1); return d.toISOString().slice(0, 10); }
  function stampOf(s) { const d = new Date(s || Date.now()); return isNaN(d) ? "20260101T000000Z" : d.toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z"); }

  const from = new Date(Date.now() - 60 * 86400000).toISOString().slice(0, 10);
  const plans = $app.findRecordsByFilter("plans", "household = {:h} && date != '' && idea = false && date >= {:f}", "date", 2000, 0, { h: household, f: from });
  const L = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Home Board//Plans//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
             "X-WR-CALNAME:Home Board Plans", "X-WR-TIMEZONE:America/New_York",
             "REFRESH-INTERVAL;VALUE=DURATION:PT1H", "X-PUBLISHED-TTL:PT1H"];
  plans.forEach((p) => {
    const name = p.getString("name"), note = p.getString("note"), date = p.getString("date");
    const start = p.getString("start_time"), end = p.getString("end_time"), loc = p.getString("location");
    L.push("BEGIN:VEVENT", "UID:" + p.id + "@home-board", "DTSTAMP:" + stampOf(p.getString("created_at")));
    if (/^\d\d:\d\d$/.test(start)) {
      // a timed plan; no end = 1 hour; an end earlier than the start runs past midnight
      let stop = /^\d\d:\d\d$/.test(end) ? end : pad(Math.min(23, Number(start.slice(0, 2)) + 1)) + start.slice(2);
      const endDate = stop <= start ? nextDay(date) : date;
      L.push("DTSTART:" + ymd(date) + "T" + start.replace(":", "") + "00", "DTEND:" + ymd(endDate) + "T" + stop.replace(":", "") + "00");
    } else {
      L.push("DTSTART;VALUE=DATE:" + ymd(date), "DTEND;VALUE=DATE:" + ymd(nextDay(date)));
    }
    L.push("SUMMARY:" + esc(name));
    if (loc) L.push("LOCATION:" + esc(loc));
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

// ================= households =================

// New rows always belong to the household of whoever adds them. The phone never gets to choose.
onRecordCreateRequest((e) => {
  if (!e.hasSuperuserAuth()) {
    e.record.set("household", e.auth ? e.auth.getString("household") : "");
  }
  return e.next();
}, "days", "grocery_stores", "grocery_items", "meals", "todos", "plans", "recipes", "house_items", "notes", "app_settings");

// ---- invites (household editors) ----
routerAdd("GET", "/api/hb/invites", (e) => {
  const lib = require(`${__hooks}/hb_lib.js`);
  const me = lib.editorOf(e);
  const list = $app.findRecordsByFilter("invites", "household = {:h} && used_at = '' && expires_at > {:n}", "-expires_at", 50, 0,
    { h: me.getString("household"), n: new Date().toISOString() });
  return e.json(200, list.map(lib.inviteJson));
}, $apis.requireAuth());

routerAdd("POST", "/api/hb/invites", (e) => {
  const lib = require(`${__hooks}/hb_lib.js`);
  const me = lib.editorOf(e);
  const body = e.requestInfo().body || {};
  const r = lib.createInvite($app, me.getString("household"), body.role, me.id);
  return e.json(200, lib.inviteJson(r));
}, $apis.requireAuth());

routerAdd("DELETE", "/api/hb/invites/{id}", (e) => {
  const lib = require(`${__hooks}/hb_lib.js`);
  const me = lib.editorOf(e);
  let r = null;
  try { r = $app.findRecordById("invites", e.request.pathValue("id")); } catch (err) {}
  if (!r || r.getString("household") !== me.getString("household")) throw new NotFoundError("That invite is gone.");
  $app.delete(r);
  return e.json(200, { ok: true });
}, $apis.requireAuth());

// ---- members (household editors) ----
routerAdd("GET", "/api/hb/members", (e) => {
  const lib = require(`${__hooks}/hb_lib.js`);
  const me = lib.editorOf(e);
  const list = $app.findRecordsByFilter("users", "household = {:h}", "email", 100, 0, { h: me.getString("household") });
  return e.json(200, list.map((u) => ({ id: u.id, email: u.email(), role: u.getString("role"), me: u.id === me.id })));
}, $apis.requireAuth());

routerAdd("POST", "/api/hb/members/{id}/remove", (e) => {
  const lib = require(`${__hooks}/hb_lib.js`);
  const me = lib.editorOf(e);
  let u = null;
  try { u = $app.findRecordById("users", e.request.pathValue("id")); } catch (err) {}
  if (!u || u.getString("household") !== me.getString("household")) throw new NotFoundError("Not in your household.");
  if (u.id === me.id) throw new BadRequestError("You can't remove yourself.");
  u.set("household", ""); u.set("role", "");
  $app.save(u);
  return e.json(200, { ok: true });
}, $apis.requireAuth());

// ---- joining with an invite (no sign-in needed) ----
routerAdd("GET", "/api/hb/join/{code}", (e) => {
  const lib = require(`${__hooks}/hb_lib.js`);
  const inv = lib.liveInvite($app, e.request.pathValue("code"));
  if (!inv) throw new NotFoundError("This invite link has expired or was already used.");
  const h = $app.findRecordById("households", inv.getString("household"));
  return e.json(200, { household: h.getString("name"), role: inv.getString("role"), loginField: lib.loginField($app) });
});

routerAdd("POST", "/api/hb/join", (e) => {
  const lib = require(`${__hooks}/hb_lib.js`);
  const body = e.requestInfo().body || {};
  const email = String(body.email || "").trim().toLowerCase(), password = String(body.password || "");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new BadRequestError("Please enter a valid email.");
  let out = null;
  $app.runInTransaction((tx) => {
    const inv = lib.liveInvite(tx, body.code);
    if (!inv) throw new BadRequestError("This invite link has expired or was already used.");
    let u = null;
    try { u = tx.findAuthRecordByEmail("users", email); } catch (err) {}
    if (u) {
      // an existing login (for example from another app on this server) joins with its own password
      if (!u.validatePassword(password)) throw new BadRequestError("That email already has a login. Use its password to join.");
      if (u.getString("household")) throw new BadRequestError("That login already belongs to a household.");
    } else {
      if (password.length < 6) throw new BadRequestError("Passwords need at least 6 characters.");
      u = new Record(tx.findCollectionByNameOrId("users"));
      u.setEmail(email);
      // optional username (or whatever the other sign-in field is called)
      const field = lib.loginField(tx), login = String(body.login || "").trim().toLowerCase();
      if (field && login) {
        if (!/^[a-z0-9._-]{3,30}$/.test(login)) throw new BadRequestError("Usernames are 3–30 letters, numbers, dots, dashes or underscores.");
        let taken = null;
        try { taken = tx.findFirstRecordByFilter("users", field + " = {:v}", { v: login }); } catch (err) {}
        if (taken) throw new BadRequestError("That username is taken. Try another.");
        u.set(field, login);
      }
      u.setPassword(password);
      u.setVerified(true);
    }
    u.set("household", inv.getString("household"));
    u.set("role", inv.getString("role"));
    tx.save(u);
    inv.set("used_by", u.id);
    inv.set("used_at", new Date().toISOString());
    tx.save(inv);
    out = { ok: true };
  });
  return e.json(200, out);
});

// ---- site admin: households ----
routerAdd("GET", "/api/hb/households", (e) => {
  const lib = require(`${__hooks}/hb_lib.js`);
  lib.siteAdmin(e);
  const list = $app.findRecordsByFilter("households", "id != ''", "name", 500, 0);
  return e.json(200, list.map((h) => ({
    id: h.id, name: h.getString("name"),
    members: $app.countRecords("users", $dbx.hashExp({ household: h.id })),
  })));
}, $apis.requireAuth());

routerAdd("POST", "/api/hb/households", (e) => {
  const lib = require(`${__hooks}/hb_lib.js`);
  const me = lib.siteAdmin(e);
  const name = String((e.requestInfo().body || {}).name || "").trim().slice(0, 60);
  if (!name) throw new BadRequestError("Give the household a name.");
  let out = null;
  $app.runInTransaction((tx) => {
    const made = lib.createHousehold(tx, name, me.id);
    out = { id: made.household.id, name: name, invite: lib.inviteJson(made.invite) };
  });
  return e.json(200, out);
}, $apis.requireAuth());

routerAdd("POST", "/api/hb/households/{id}/invite", (e) => {
  const lib = require(`${__hooks}/hb_lib.js`);
  const me = lib.siteAdmin(e);
  const h = $app.findRecordById("households", e.request.pathValue("id"));
  return e.json(200, lib.inviteJson(lib.createInvite($app, h.id, "editor", me.id)));
}, $apis.requireAuth());
