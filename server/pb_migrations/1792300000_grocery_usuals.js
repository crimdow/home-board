/// <reference path="../pb_data/types.d.ts" />
// Usual grocery items: everything the family has put on the grocery list, with where they usually
// buy it and how often. Filled in by itself (server/pb_hooks/usuals.pb.js); editable in
// Groceries -> settings -> Usual items. Used to fill in the store when an item is added without one,
// and by the assistant to know the family's own names for things ("Red bag chicken" at Aldi).
//  - key: the name in lower case with single spaces, one row per household per key
//  - count: how many times it has gone on the list; last_used: when (ISO)
// Same walls as the other Home Board tables: your household only; editors change it.
// Starts with what is on the grocery list today.

migrate((app) => {
  const MINE = "household = @request.auth.household && @request.auth.household != ''";
  const MEMBER = "(@request.auth.role = 'editor' || @request.auth.role = 'viewer')";
  const EDITOR = "@request.auth.role = 'editor'";
  const NO_MOVE = "@request.body.household:isset = false";
  const text = (name, extra) => Object.assign({ name: name, type: "text", max: 200 }, extra || {});

  const col = new Collection({
    type: "base",
    name: "grocery_usuals",
    listRule: MINE + " && " + MEMBER,
    viewRule: MINE + " && " + MEMBER,
    createRule: EDITOR + " && @request.auth.household != ''",
    updateRule: MINE + " && " + EDITOR + " && " + NO_MOVE,
    deleteRule: MINE + " && " + EDITOR,
    fields: [
      text("household", { max: 30 }),
      text("name", { required: true, max: 120 }),
      text("key", { max: 120 }),
      text("store_id", { max: 30 }),
      { name: "count", type: "number" },
      text("last_used", { max: 40 }),
      text("created_at", { max: 40 }),
      text("updated_at", { max: 40 }),
    ],
    indexes: ["CREATE UNIQUE INDEX idx_grocery_usuals_key ON grocery_usuals (household, key)"],
  });
  app.save(col);

  // start with what's on the list today
  const keyOf = (s) => String(s || "").toLowerCase().replace(/\s+/g, " ").trim();
  const seen = {};
  app.findRecordsByFilter("grocery_items", "household != ''", "created_at", 5000, 0).forEach((it) => {
    const key = keyOf(it.getString("name"));
    if (!key || key.length > 120) return;
    const id = it.getString("household") + "|" + key;
    const s = seen[id] || (seen[id] = { household: it.getString("household"), key: key, name: "", store: "", count: 0, last: "" });
    s.name = it.getString("name").replace(/\s+/g, " ").trim();
    if (it.getString("store_id")) s.store = it.getString("store_id");
    s.count += 1;
    s.last = it.getString("created_at") || s.last;
  });
  const now = new Date().toISOString();
  Object.keys(seen).forEach((id) => {
    const s = seen[id], r = new Record(col);
    r.set("household", s.household); r.set("name", s.name); r.set("key", s.key);
    r.set("store_id", s.store); r.set("count", s.count); r.set("last_used", s.last || now);
    r.set("created_at", now); r.set("updated_at", now);
    app.save(r);
  });
}, (app) => {
  app.delete(app.findCollectionByNameOrId("grocery_usuals"));
});
