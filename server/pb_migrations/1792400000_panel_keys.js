/// <reference path="../pb_data/types.d.ts" />
// Wall panel keys: lets the panel sign itself back in without anyone typing a password at the wall.
//  - While the panel is signed in it asks for a key once (/api/hb/panel-key) and keeps it in its browser.
//  - If it ever finds itself signed out (the login ran out, the server refused it), it trades the key
//    for a fresh login (/api/hb/panel-login). Signing out on purpose throws the key away.
//  - Only a hash of each key is stored. Nobody can read or change this table from the app (no rules):
//    delete a row in the PocketBase dashboard to stop that panel signing itself in.

migrate((app) => {
  app.save(new Collection({
    type: "base",
    name: "panel_keys",
    listRule: null, viewRule: null, createRule: null, updateRule: null, deleteRule: null,
    fields: [
      { name: "user", type: "relation", collectionId: app.findCollectionByNameOrId("users").id, maxSelect: 1, required: true, cascadeDelete: true },
      { name: "key_hash", type: "text", max: 100, required: true },
      { name: "last_used", type: "text", max: 40 },
      { name: "created", type: "autodate", onCreate: true },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_panel_keys_hash ON panel_keys (key_hash)"],
  }));
}, (app) => {
  app.delete(app.findCollectionByNameOrId("panel_keys"));
});
