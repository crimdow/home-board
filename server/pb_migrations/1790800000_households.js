/// <reference path="../pb_data/types.d.ts" />
// Households, step 1: a "households" table holding each family's settings (people, colours,
// At a Glance columns), and a household on every Home Board login.
// Your family becomes the first household and every current Home Board login joins it.
// (Step 2, walling each family's boards off from the others, comes in a later update.)

migrate((app) => {
  const households = new Collection({
    type: "base",
    name: "households",
    // members read their own household; its editors change the settings; only the site owner creates or deletes
    listRule: "id = @request.auth.household",
    viewRule: "id = @request.auth.household",
    createRule: null,
    updateRule: "id = @request.auth.household && @request.auth.role = 'editor'",
    deleteRule: null,
    fields: [
      { name: "name", type: "text", required: true, max: 200 },
      { name: "settings", type: "json" },
      { name: "created_at", type: "text" },
      { name: "updated_at", type: "text" },
    ],
  });
  app.save(households);

  const users = app.findCollectionByNameOrId("users");
  users.fields.add(new RelationField({ name: "household", collectionId: households.id, maxSelect: 1, cascadeDelete: false }));
  // nobody can move themselves to another household or change their own role
  users.updateRule = "id = @request.auth.id && @request.body.role:isset = false && @request.body.household:isset = false";
  app.save(users);

  const home = new Record(households);
  home.set("name", "Home");
  home.set("settings", {
    people: [
      { id: "A", initial: "A", name: "Ash", color: "ash" },
      { id: "B", initial: "B", name: "Ben", color: "ben" },
    ],
    together: { on: true, label: "Both", color: "both" },
    columns: [
      { key: "drop_off", name: "Drop off", on: true },
      { key: "pick_up", name: "Pick up", on: true },
      { key: "dinner", name: "Dinner", on: true },
    ],
    weekendColumns: false,
  });
  home.set("created_at", new Date().toISOString());
  app.save(home);

  app.findRecordsByFilter("users", "role = 'editor' || role = 'viewer'", "", 5000, 0).forEach((u) => {
    u.set("household", home.id);
    app.save(u);
  });
}, (app) => {
  const users = app.findCollectionByNameOrId("users");
  users.fields.removeByName("household");
  users.updateRule = "id = @request.auth.id && @request.body.role:isset = false";
  app.save(users);
  app.delete(app.findCollectionByNameOrId("households"));
});
