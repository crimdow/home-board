/// <reference path="../pb_data/types.d.ts" />
// Pocket Binder Share-Sheet clipper.
//  - clip_keys: one secret key per household (or per login with no household). The binder makes it
//    the first time someone signs in and copies it into the iPhone shortcut; it is never in the
//    public site files.
//  - clip_inbox: the shortcut drops a page's title, link and text here (no login on the phone's
//    Safari page), then opens the binder, which reads the clipping by its id and deletes it.
//    Only requests carrying a real key can add to it. Unopened clippings are cleared after 2 days
//    (see pb_hooks/binder.pb.js).

migrate((app) => {
  const users = app.findCollectionByNameOrId("users");
  const households = app.findCollectionByNameOrId("households");
  const ours = "@request.auth.id != '' && ((@request.auth.household != '' && household = @request.auth.household) || (@request.auth.household = '' && owner = @request.auth.id))";

  const keys = new Collection({
    type: "base",
    name: "clip_keys",
    listRule: ours,
    viewRule: ours,
    createRule: "@request.auth.id != '' && @request.body.owner = @request.auth.id && @request.body.household = @request.auth.household",
    updateRule: null,
    deleteRule: ours,
    fields: [
      { name: "owner", type: "relation", collectionId: users.id, maxSelect: 1, cascadeDelete: false },
      { name: "household", type: "relation", collectionId: households.id, maxSelect: 1, cascadeDelete: true },
      { name: "key", type: "text", required: true, min: 24, max: 64, pattern: "^[A-Za-z0-9]+$" },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_clip_keys_key ON clip_keys (key)"],
  });
  app.save(keys);

  const inbox = new Collection({
    type: "base",
    name: "clip_inbox",
    listRule: null,                                   // nobody can browse it
    viewRule: "@request.auth.id != ''",               // the binder opens one clipping by its id
    createRule: "@request.body.key != '' && @collection.clip_keys.key ?= @request.body.key",
    updateRule: null,
    deleteRule: "@request.auth.id != ''",
    fields: [
      { name: "key", type: "text", max: 64 },
      { name: "t", type: "text", max: 300 },
      { name: "u", type: "text", max: 2000 },
      { name: "x", type: "text", max: 200000 },
      { name: "created", type: "autodate", onCreate: true, onUpdate: false },
    ],
  });
  app.save(inbox);
}, (app) => {
  app.delete(app.findCollectionByNameOrId("clip_inbox"));
  app.delete(app.findCollectionByNameOrId("clip_keys"));
});
