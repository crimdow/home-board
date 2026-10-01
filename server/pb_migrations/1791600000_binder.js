/// <reference path="../pb_data/types.d.ts" />
// Pocket Binder (binder.jermins.com): one shared binder per Home Board household.
//  - clips: one row per clipping (lyrics, story or chord chart)
//  - binder_files: the PDFs and photos attached to clippings (up to 20 MB each)
// Everyone in a household sees and edits the same binder. A login with no household
// (a Hearts-only account) gets a private binder of its own.

migrate((app) => {
  const users = app.findCollectionByNameOrId("users");
  const households = app.findCollectionByNameOrId("households");
  // ours = my household's rows, or my own rows when I'm not in a household
  const mine = "@request.auth.id != '' && ((@request.auth.household != '' && household = @request.auth.household) || (@request.auth.household = '' && owner = @request.auth.id))";
  const makeMine = "@request.auth.id != '' && @request.body.owner = @request.auth.id && @request.body.household = @request.auth.household";
  // nobody moves a clipping to another household or re-assigns who added it
  const keep = " && @request.body.owner:isset = false && @request.body.household:isset = false";

  const clips = new Collection({
    type: "base",
    name: "clips",
    listRule: mine,
    viewRule: mine,
    createRule: makeMine,
    updateRule: mine + keep,
    deleteRule: mine,
    fields: [
      { name: "owner", type: "relation", collectionId: users.id, maxSelect: 1, cascadeDelete: false },
      { name: "household", type: "relation", collectionId: households.id, maxSelect: 1, cascadeDelete: true },
      { name: "type", type: "select", values: ["lyrics", "stories", "chords"], maxSelect: 1, required: true },
      { name: "title", type: "text", max: 500 },
      { name: "by", type: "text", max: 500 },
      { name: "genre", type: "text", max: 100 },
      { name: "src", type: "text", max: 2000 },
      { name: "body", type: "text", max: 500000 },
      { name: "files", type: "json", maxSize: 200000 },
      { name: "added", type: "number" },
      { name: "updated", type: "number" },
    ],
    indexes: ["CREATE INDEX idx_clips_household ON clips (household)", "CREATE INDEX idx_clips_owner ON clips (owner)"],
  });
  app.save(clips);

  const files = new Collection({
    type: "base",
    name: "binder_files",
    listRule: mine,
    viewRule: mine,
    createRule: makeMine,
    updateRule: null,
    deleteRule: mine,
    fields: [
      { name: "owner", type: "relation", collectionId: users.id, maxSelect: 1, cascadeDelete: false },
      { name: "household", type: "relation", collectionId: households.id, maxSelect: 1, cascadeDelete: true },
      { name: "file", type: "file", maxSelect: 1, required: true, maxSize: 20 * 1048576,
        mimeTypes: ["application/pdf", "image/jpeg", "image/png", "image/gif", "image/webp"] },
    ],
  });
  app.save(files);
}, (app) => {
  app.delete(app.findCollectionByNameOrId("binder_files"));
  app.delete(app.findCollectionByNameOrId("clips"));
});
