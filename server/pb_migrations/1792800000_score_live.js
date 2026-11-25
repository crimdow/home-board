/// <reference path="../pb_data/types.d.ts" />
// Scores: a live copy of the game being kept, so anyone who opens scores.jermins.com can watch.
// One row per scorekeeping phone (signed in). Anyone can read; only the scorekeeper changes it.
// Rows not touched for 12 hours are cleaned up by a cron in main.pb.js.
migrate((app) => {
  const users = app.findCollectionByNameOrId("users");
  const live = new Collection({
    type: "base",
    name: "score_live",
    listRule: "",
    viewRule: "",
    createRule: "@request.auth.id != '' && @request.auth.household != ''",
    updateRule: "keeper = @request.auth.id && @request.body.keeper:isset = false && @request.body.household:isset = false && @request.body.keeper_name:isset = false",
    deleteRule: "keeper = @request.auth.id",
    fields: [
      { name: "household", type: "text", max: 30 },
      { name: "keeper", type: "relation", collectionId: users.id, maxSelect: 1, cascadeDelete: true },
      { name: "keeper_name", type: "text", max: 200 },
      { name: "name", type: "text", max: 60 },
      { name: "players", type: "json", maxSize: 5000 },
      { name: "rounds", type: "json", maxSize: 200000 },
      { name: "pending", type: "json", maxSize: 5000 },
      { name: "low", type: "bool" },
      { name: "target", type: "number" },
      { name: "over", type: "bool" },
      { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
    ],
  });
  app.save(live);
}, (app) => {
  app.delete(app.findCollectionByNameOrId("score_live"));
});
