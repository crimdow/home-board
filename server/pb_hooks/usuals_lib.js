// Usual grocery items: shared helpers for usuals.pb.js and the assistant (loaded with require; not a hook file).

function keyOf(s) { return String(s || "").toLowerCase().replace(/\s+/g, " ").trim(); }
function nowIso() { return new Date().toISOString(); }

// the household's usual item with this name, or null
function find(app, household, name) {
  const key = keyOf(name);
  if (!household || !key) return null;
  try { return app.findFirstRecordByFilter("grocery_usuals", "household = {:h} && key = {:k}", { h: household, k: key }); }
  catch (err) { return null; }
}

// a store id that still exists in this household, or ""
function liveStore(app, household, id) {
  if (!id) return "";
  try { const s = app.findRecordById("grocery_stores", id); return s.getString("household") === household ? id : ""; }
  catch (err) { return ""; }
}

// Remember a name (and its store) after it went on the list. bump = count it as bought once more.
function learn(app, household, name, storeId, bump) {
  const clean = String(name || "").replace(/\s+/g, " ").trim();
  const key = keyOf(clean);
  if (!household || !key || key.length > 120) return;
  let r = find(app, household, clean);
  if (!r) {
    r = new Record(app.findCollectionByNameOrId("grocery_usuals"));
    r.set("household", household); r.set("key", key); r.set("count", 0); r.set("created_at", nowIso());
    r.set("name", clean);                           // a known item keeps the family's spelling
  }
  if (storeId !== undefined && storeId !== null) r.set("store_id", storeId);
  if (bump) { r.set("count", (r.getInt("count") || 0) + 1); r.set("last_used", nowIso()); }
  r.set("updated_at", nowIso());
  try { app.save(r); } catch (err) { app.logger().warn("usuals: couldn't save", "name", clean, "error", String(err)); }
}

// the most-bought items first: [{name, store}] with the store's name
function top(app, household, limit) {
  if (!household) return [];
  const stores = {};
  app.findRecordsByFilter("grocery_stores", "household = {:h}", "", 200, 0, { h: household }).forEach((s) => { stores[s.id] = s.getString("name"); });
  return app.findRecordsByFilter("grocery_usuals", "household = {:h}", "-count,-last_used", limit || 150, 0, { h: household })
    .map((u) => ({ name: u.getString("name"), store: stores[u.getString("store_id")] || "", storeId: stores[u.getString("store_id")] ? u.getString("store_id") : "" }));
}

module.exports = { keyOf, find, liveStore, learn, top };
