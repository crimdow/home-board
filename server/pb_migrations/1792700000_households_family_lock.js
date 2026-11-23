/// <reference path="../pb_data/types.d.ts" />
// Only the site owner (PocketBase dashboard / site admin) decides which households are family:
// a household's own editors can still change its settings, but not its "family" switch.
migrate((app) => {
  const h = app.findCollectionByNameOrId("households");
  h.updateRule = "id = @request.auth.household && @request.auth.role = 'editor' && @request.body.family:isset = false";
  app.save(h);
}, (app) => {
  const h = app.findCollectionByNameOrId("households");
  h.updateRule = "id = @request.auth.household && @request.auth.role = 'editor'";
  app.save(h);
});
