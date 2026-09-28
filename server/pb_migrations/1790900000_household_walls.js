/// <reference path="../pb_data/types.d.ts" />
// Households, step 2: every row belongs to a household, and people only ever see their own.
//  - each table gets a "household" field; all existing rows go to the first household ("Home")
//  - the rules check it on every read and write, so one family can never read or change another's
//  - new rows get the signer-in's household from the server (see pb_hooks), never from the phone
//  - invites and site-admin flag for adding families (the work is done by routes in pb_hooks)

migrate((app) => {
  const home = app.findFirstRecordByFilter("households", "name != ''", {});   // the first household
  const MINE = "household = @request.auth.household && @request.auth.household != ''";
  const MEMBER = "(@request.auth.role = 'editor' || @request.auth.role = 'viewer')";
  const EDITOR = "@request.auth.role = 'editor'";
  const NO_MOVE = "@request.body.household:isset = false";

  const tables = [
    { name: "days", editorsOnly: false },
    { name: "grocery_stores", editorsOnly: false },
    { name: "grocery_items", editorsOnly: false },
    { name: "meals", editorsOnly: false },
    { name: "todos", editorsOnly: false },
    { name: "plans", editorsOnly: false },
    { name: "recipes", editorsOnly: false },
    { name: "house_items", editorsOnly: true },
    { name: "notes", editorsOnly: true },
    { name: "app_settings", editorsOnly: true },
  ];
  tables.forEach((t) => {
    const c = app.findCollectionByNameOrId(t.name);
    c.fields.add(new TextField({ name: "household", max: 30 }));
    const read = MINE + " && " + (t.editorsOnly ? EDITOR : MEMBER);
    c.listRule = read;
    c.viewRule = read;
    c.createRule = EDITOR + " && @request.auth.household != ''";
    c.updateRule = MINE + " && " + EDITOR + " && " + NO_MOVE;
    c.deleteRule = MINE + " && " + EDITOR;
    // one row per date / setting name, per household (was: one per whole site)
    if (t.name === "days") c.indexes = ["CREATE UNIQUE INDEX idx_days_date ON days (household, date)"];
    if (t.name === "app_settings") c.indexes = ["CREATE UNIQUE INDEX idx_settings_key ON app_settings (household, key)"];
    app.save(c);
    // everything that exists today is your family's
    app.findRecordsByFilter(t.name, "household = ''", "", 100000, 0).forEach((r) => {
      r.set("household", home.id);
      app.save(r);
    });
  });

  // invite links: only the server reads and writes these (through the routes in pb_hooks)
  app.save(new Collection({
    type: "base",
    name: "invites",
    listRule: null, viewRule: null, createRule: null, updateRule: null, deleteRule: null,
    fields: [
      { name: "code", type: "text", required: true, max: 40 },
      { name: "household", type: "text", required: true, max: 30 },
      { name: "role", type: "text", required: true, max: 10 },
      { name: "created_by", type: "text", max: 30 },
      { name: "expires_at", type: "text", max: 40 },
      { name: "used_by", type: "text", max: 30 },
      { name: "used_at", type: "text", max: 40 },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_invites_code ON invites (code)"],
  }));

  // site admin: can create new households. Tick it for yourself in the dashboard (users -> your login).
  const users = app.findCollectionByNameOrId("users");
  users.fields.add(new BoolField({ name: "site_admin" }));
  users.updateRule = "id = @request.auth.id && @request.body.role:isset = false && @request.body.household:isset = false && @request.body.site_admin:isset = false";
  app.save(users);
}, (app) => {
  ["days", "grocery_stores", "grocery_items", "meals", "todos", "plans", "recipes", "house_items", "notes", "app_settings"].forEach((n) => {
    const c = app.findCollectionByNameOrId(n);
    c.fields.removeByName("household");
    app.save(c);
  });
  try { app.delete(app.findCollectionByNameOrId("invites")); } catch (e) {}
  const users = app.findCollectionByNameOrId("users");
  users.fields.removeByName("site_admin");
  app.save(users);
});
