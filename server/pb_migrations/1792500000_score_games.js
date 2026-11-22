/// <reference path="../pb_data/types.d.ts" />
// Finished games from Scores (scores.jermins.com), shared with the household.
//  - name: the game's name ("Rummy"); players / rounds: JSON arrays as the sheet had them
//  - totals: JSON array, same order as players; winners: JSON array of names
//  - low: true when the lowest total wins; target: the "game ends at" score (0 = none)
//  - finished_at: when it ended (ISO)
// Same walls as the other Home Board tables: your household only. Anyone in the household can
// save a game (viewers keep score too); editors can delete one.

migrate((app) => {
  const MINE = "household = @request.auth.household && @request.auth.household != ''";
  const MEMBER = "(@request.auth.role = 'editor' || @request.auth.role = 'viewer')";
  const EDITOR = "@request.auth.role = 'editor'";
  const NO_MOVE = "@request.body.household:isset = false";
  const text = (name, extra) => Object.assign({ name: name, type: "text", max: 200 }, extra || {});

  app.save(new Collection({
    type: "base",
    name: "score_games",
    listRule: MINE + " && " + MEMBER,
    viewRule: MINE + " && " + MEMBER,
    createRule: MEMBER + " && @request.auth.household != ''",
    updateRule: MINE + " && " + MEMBER + " && " + NO_MOVE,
    deleteRule: MINE + " && " + EDITOR,
    fields: [
      text("household", { max: 30 }),
      text("name", { max: 60 }),
      { name: "players", type: "json", maxSize: 20000 },
      { name: "rounds", type: "json", maxSize: 200000 },
      { name: "totals", type: "json", maxSize: 20000 },
      { name: "winners", type: "json", maxSize: 20000 },
      { name: "low", type: "bool" },
      { name: "target", type: "number" },
      text("finished_at", { max: 40 }),
      text("created_at", { max: 40 }),
    ],
    indexes: ["CREATE INDEX idx_score_games_when ON score_games (household, finished_at)"],
  }));
}, (app) => {
  app.delete(app.findCollectionByNameOrId("score_games"));
});
