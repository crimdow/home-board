/// <reference path="../pb_data/types.d.ts" />
// Usual grocery items (table grocery_usuals, helpers in usuals_lib.js).
//  - A new grocery item with no store gets the store it's usually bought at ("Red bag chicken" -> Aldi),
//    and the family's usual spelling.
//    Runs for every way an item is added: the + box, the assistant, Binder.
//  - Every item that goes on the list is remembered, with its store and how often.
//  - Changing an item's store (or name) on the list updates what's remembered.

onRecordCreate((e) => {
  const u = require(`${__hooks}/usuals_lib.js`);
  const r = e.record, household = r.getString("household");
  const usual = household ? u.find(e.app, household, r.getString("name")) : null;
  if (usual) {
    r.set("name", usual.getString("name"));         // "red bag chicken" -> "Red bag chicken", the way it's always written
    const store = r.getString("store_id") ? "" : u.liveStore(e.app, household, usual.getString("store_id"));
    if (store) r.set("store_id", store);
  }
  return e.next();
}, "grocery_items");

onRecordAfterCreateSuccess((e) => {
  const u = require(`${__hooks}/usuals_lib.js`);
  const r = e.record;
  u.learn(e.app, r.getString("household"), r.getString("name"), r.getString("store_id") || undefined, true);
  return e.next();
}, "grocery_items");

onRecordAfterUpdateSuccess((e) => {
  const u = require(`${__hooks}/usuals_lib.js`);
  const r = e.record, old = r.original();
  const nameChanged = u.keyOf(old.getString("name")) !== u.keyOf(r.getString("name"));
  const storeChanged = old.getString("store_id") !== r.getString("store_id");
  if (nameChanged || storeChanged) u.learn(e.app, r.getString("household"), r.getString("name"), r.getString("store_id"), false);
  return e.next();
}, "grocery_items");

// usual items typed in by hand: same lower-case key as the learned ones
onRecordCreateRequest((e) => {
  const u = require(`${__hooks}/usuals_lib.js`);
  e.record.set("name", String(e.record.getString("name")).replace(/\s+/g, " ").trim());
  e.record.set("key", u.keyOf(e.record.getString("name")));
  if (!e.record.getInt("count")) e.record.set("count", 1);
  return e.next();
}, "grocery_usuals");

onRecordUpdateRequest((e) => {
  const u = require(`${__hooks}/usuals_lib.js`);
  e.record.set("key", u.keyOf(e.record.getString("name")));
  return e.next();
}, "grocery_usuals");
