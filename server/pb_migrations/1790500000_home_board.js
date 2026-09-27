/// <reference path="../pb_data/types.d.ts" />
// Home Board: every table from Supabase, recreated as PocketBase collections.
// Runs by itself the first time PocketBase starts with this folder.
//
// Who can do what (same as the Supabase rules):
//   - every signed-in login can read the family boards and Recipes
//   - only logins with role = "editor" (Ash, Ben) can add, change or delete
//   - House, Notes and app settings: editors only, the friend login can't even read them
//
// Dates are kept as plain "YYYY-MM-DD" text and created_at / updated_at as ISO text, exactly
// like the old database, so the page code doesn't change and imported rows keep their times.

migrate((app) => {
  // ---- logins: add a role (editor = household, viewer = the friend login) ----
  const users = app.findCollectionByNameOrId("users");
  users.fields.add(new SelectField({ name: "role", values: ["editor", "viewer"], maxSelect: 1 }));
  users.createRule = null;                                              // no sign-ups: you add logins in the dashboard
  users.updateRule = "id = @request.auth.id && @request.body.role:isset = false";   // nobody can promote themselves
  app.save(users);

  const SIGNED_IN = "@request.auth.id != ''";
  const EDITOR = "@request.auth.role = 'editor'";
  const text = (name, extra) => Object.assign({ name: name, type: "text", max: 20000 }, extra || {});
  const stamps = [text("created_at"), text("updated_at")];

  function make(name, fields, opts) {
    opts = opts || {};
    const read = opts.editorsOnly ? EDITOR : SIGNED_IN;
    const c = new Collection({
      type: "base",
      name: name,
      listRule: read,
      viewRule: read,
      createRule: EDITOR,
      updateRule: EDITOR,
      deleteRule: EDITOR,
      fields: fields.concat(stamps),
      indexes: opts.indexes || [],
    });
    app.save(c);
  }

  make("days", [text("date", { required: true }), text("drop_off"), text("pick_up"), text("dinner"), text("notes")],
       { indexes: ["CREATE UNIQUE INDEX idx_days_date ON days (date)"] });
  make("grocery_stores", [text("name", { required: true }), { name: "position", type: "number" }]);
  make("grocery_items", [text("name", { required: true }), text("store_id"), text("note"), { name: "done", type: "bool" }]);
  make("meals", [text("name", { required: true }), text("note"), text("day"), { name: "done", type: "bool" }]);
  make("todos", [text("name", { required: true }), text("note"), text("kind"), text("who"), text("done_at")]);
  make("plans", [text("name", { required: true }), text("note"), text("date")]);
  make("recipes", [text("name", { required: true }), text("ingredients"), text("steps"), text("note"),
                   { name: "tags", type: "json" }, { name: "photos", type: "json" }, { name: "pinned", type: "bool" }]);
  make("house_items", [text("name", { required: true }), text("body"), text("area"), { name: "repeat_days", type: "number" },
                       text("last_done"), { name: "photos", type: "json" }, { name: "pinned", type: "bool" }], { editorsOnly: true });
  make("notes", [text("name", { required: true }), text("body"), { name: "tags", type: "json" }, { name: "photos", type: "json" },
                 { name: "pinned", type: "bool" }], { editorsOnly: true });
  make("app_settings", [text("key", { required: true }), text("value")],
       { editorsOnly: true, indexes: ["CREATE UNIQUE INDEX idx_settings_key ON app_settings (key)"] });

  // the secret part of the Plans calendar link
  const settings = app.findCollectionByNameOrId("app_settings");
  const r = new Record(settings);
  r.set("key", "calendar_feed");
  r.set("value", $security.randomString(40));
  app.save(r);
}, (app) => {
  ["app_settings", "notes", "house_items", "recipes", "plans", "todos", "meals", "grocery_items", "grocery_stores", "days"].forEach((n) => {
    try { app.delete(app.findCollectionByNameOrId(n)); } catch (e) {}
  });
  const users = app.findCollectionByNameOrId("users");
  users.fields.removeByName("role");
  app.save(users);
});
