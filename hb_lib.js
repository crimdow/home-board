// Home Board: shared helpers for the routes in main.pb.js (loaded with require; not a hook file itself).

const CODE_CHARS = "abcdefghjkmnpqrstuvwxyz23456789";   // no look-alikes (0/o, 1/l/i)
const INVITE_DAYS = 7;

module.exports = {
  INVITE_DAYS,

  code(n) { return $security.randomStringWithAlphabet(n || 10, CODE_CHARS); },

  defaultSettings() {
    return {
      people: [
        { id: "A", initial: "1", name: "Person 1", color: "ash" },
        { id: "B", initial: "2", name: "Person 2", color: "ben" },
      ],
      together: { on: true, label: "Both", color: "both" },
      columns: [
        { key: "drop_off", name: "Drop off", on: true },
        { key: "pick_up", name: "Pick up", on: true },
        { key: "dinner", name: "Dinner", on: true },
      ],
      weekendColumns: false,
    };
  },

  // the signed-in person, or an error the app can show
  editorOf(e) {
    const a = e.auth;
    if (!a || a.collection().name !== "users") throw new UnauthorizedError("Please sign in.");
    if (a.getString("role") !== "editor" || !a.getString("household")) throw new ForbiddenError("Only a household editor can do that.");
    return a;
  },
  siteAdmin(e) {
    const a = e.auth;
    if (!a || a.collection().name !== "users" || !a.getBool("site_admin")) throw new ForbiddenError("Site admin only.");
    return a;
  },

  // a new household with its settings, calendar link code and a first invite
  createHousehold(app, name, createdBy) {
    const lib = module.exports;
    const h = new Record(app.findCollectionByNameOrId("households"));
    h.set("name", name);
    h.set("settings", lib.defaultSettings());
    h.set("created_at", new Date().toISOString());
    app.save(h);
    const s = new Record(app.findCollectionByNameOrId("app_settings"));
    s.set("key", "calendar_feed"); s.set("value", $security.randomString(40)); s.set("household", h.id);
    s.set("created_at", new Date().toISOString());
    app.save(s);
    return { household: h, invite: lib.createInvite(app, h.id, "editor", createdBy) };
  },

  createInvite(app, householdId, role, createdBy) {
    const lib = module.exports;
    const r = new Record(app.findCollectionByNameOrId("invites"));
    r.set("code", lib.code(10));
    r.set("household", householdId);
    r.set("role", role === "viewer" ? "viewer" : "editor");
    r.set("created_by", createdBy || "");
    r.set("expires_at", new Date(Date.now() + INVITE_DAYS * 86400000).toISOString());
    app.save(r);
    return r;
  },

  // an unused, unexpired invite, or null
  liveInvite(app, code) {
    if (!/^[a-z0-9]{6,40}$/.test(code || "")) return null;
    let r = null;
    try { r = app.findFirstRecordByFilter("invites", "code = {:c}", { c: code }); } catch (err) { return null; }
    if (r.getString("used_at") || r.getString("expires_at") < new Date().toISOString()) return null;
    return r;
  },

  // the users table's other sign-in field besides email (e.g. "username", added for the hearts app), or ""
  loginField(app) {
    try {
      const ids = app.findCollectionByNameOrId("users").passwordAuth.identityFields || [];
      for (let i = 0; i < ids.length; i++) if (ids[i] !== "email") return ids[i];
    } catch (err) {}
    return "";
  },

  inviteJson(r) {
    return { id: r.id, code: r.getString("code"), role: r.getString("role"), expires_at: r.getString("expires_at") };
  },
};
