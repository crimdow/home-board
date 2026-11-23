/// <reference path="../pb_data/types.d.ts" />
// Family recipes, note photos and comments (Recipe book).
//  - households.family: households that belong to the wider family (Ben's, his sisters'...).
//    Every household that exists today counts as family; new ones made in site admin do too.
//  - recipes.family: a recipe every family household can see, comment on and edit.
//    Only its own household can delete it or turn the switch off.
//  - recipes.added_by: the name of whoever added it (set by the server).
//  - recipes.note_photos: photos kept with the notes (e.g. the original handwritten card).
//  - recipe_comments: comments on a recipe, seen by whoever can see the recipe.
migrate((app) => {
  const households = app.findCollectionByNameOrId("households");
  households.fields.add(new BoolField({ name: "family" }));
  app.save(households);
  app.findRecordsByFilter("households", "id != ''", "", 10000, 0).forEach((h) => { h.set("family", true); app.save(h); });

  const MEMBER = "(@request.auth.role = 'editor' || @request.auth.role = 'viewer')";
  const EDITOR = "@request.auth.role = 'editor'";
  const HAS = "@request.auth.household != ''";
  const MINE = "household = @request.auth.household";
  const FAM = "(family = true && @request.auth.household.family = true)";
  const FAM_OK = "(@request.body.family:isset = false || @request.body.family = false || @request.auth.household.family = true)";

  const recipes = app.findCollectionByNameOrId("recipes");
  recipes.fields.add(new BoolField({ name: "family" }));
  recipes.fields.add(new TextField({ name: "added_by", max: 200 }));
  recipes.fields.add(new JSONField({ name: "note_photos", maxSize: 200000 }));
  recipes.listRule = MEMBER + " && " + HAS + " && (" + MINE + " || " + FAM + ")";
  recipes.viewRule = recipes.listRule;
  recipes.createRule = EDITOR + " && " + HAS + " && " + FAM_OK;
  recipes.updateRule = EDITOR + " && " + HAS + " && @request.body.household:isset = false && @request.body.added_by:isset = false && (" +
    MINE + " || (" + FAM + " && @request.body.family:isset = false)) && " + FAM_OK;
  recipes.deleteRule = MINE + " && " + EDITOR + " && " + HAS;
  app.save(recipes);

  const users = app.findCollectionByNameOrId("users");
  const SEE = MEMBER + " && " + HAS + " && (recipe.household = @request.auth.household || (recipe.family = true && @request.auth.household.family = true))";
  const comments = new Collection({
    type: "base",
    name: "recipe_comments",
    listRule: SEE,
    viewRule: SEE,
    createRule: SEE,
    updateRule: "author = @request.auth.id && @request.body.recipe:isset = false && @request.body.author:isset = false && @request.body.household:isset = false",
    deleteRule: "author = @request.auth.id || (recipe.household = @request.auth.household && " + EDITOR + ")",
    fields: [
      { name: "recipe", type: "relation", collectionId: recipes.id, maxSelect: 1, cascadeDelete: true, required: true },
      { name: "household", type: "text", max: 30 },
      { name: "author", type: "relation", collectionId: users.id, maxSelect: 1, cascadeDelete: false },
      { name: "author_name", type: "text", max: 200 },
      { name: "text", type: "text", max: 4000 },
      { name: "photos", type: "json", maxSize: 100000 },
      { name: "created_at", type: "text" },
    ],
    indexes: ["CREATE INDEX idx_recipe_comments_recipe ON recipe_comments (recipe)"],
  });
  app.save(comments);
}, (app) => {
  app.delete(app.findCollectionByNameOrId("recipe_comments"));
  const recipes = app.findCollectionByNameOrId("recipes");
  ["family", "added_by", "note_photos"].forEach((n) => recipes.fields.removeByName(n));
  const read = "household = @request.auth.household && @request.auth.household != '' && (@request.auth.role = 'editor' || @request.auth.role = 'viewer')";
  recipes.listRule = read; recipes.viewRule = read;
  recipes.createRule = "@request.auth.role = 'editor' && @request.auth.household != ''";
  recipes.updateRule = "household = @request.auth.household && @request.auth.household != '' && @request.auth.role = 'editor' && @request.body.household:isset = false";
  recipes.deleteRule = "household = @request.auth.household && @request.auth.household != '' && @request.auth.role = 'editor'";
  app.save(recipes);
  const households = app.findCollectionByNameOrId("households");
  households.fields.removeByName("family");
  app.save(households);
});
