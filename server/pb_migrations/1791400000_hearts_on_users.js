/// <reference path="../pb_data/types.d.ts" />
// One login table for both apps: hearts.jermins.com now signs in against "users" (like Home Board).
//  - users.hearts_role: blank = no hearts access, "viewer" = can watch, "editor" = can keep score
//  - users.email becomes optional, so a hearts-only friend can have just a username
//  - hearts_people / hearts_games / hearts_live check users.hearts_role instead of the old hearts_users table
//  - the old hearts_users login table is removed (logins get re-made in users)
// Home Board is unaffected: its data still needs a household, which hearts-only logins don't have.
migrate((app) => {
  const users = app.findCollectionByNameOrId("users");
  if (!users.fields.getByName("hearts_role")) {
    users.fields.add(new SelectField({ name: "hearts_role", values: ["editor", "viewer"], maxSelect: 1 }));
  }
  const email = users.fields.getByName("email");
  if (email) email.required = false;
  users.updateRule = "id = @request.auth.id && @request.body.role:isset = false && @request.body.household:isset = false" +
    " && @request.body.site_admin:isset = false && @request.body.hearts_role:isset = false";
  app.save(users);

  const IN = "@request.auth.collectionName = 'users' && @request.auth.hearts_role != ''";
  const ED = "@request.auth.collectionName = 'users' && @request.auth.hearts_role = 'editor'";
  ["hearts_people", "hearts_games", "hearts_live"].forEach((n) => {
    let c = null;
    try { c = app.findCollectionByNameOrId(n); } catch (e) { return; }   // hearts not set up on this server
    c.listRule = IN; c.viewRule = IN; c.createRule = ED; c.updateRule = ED; c.deleteRule = ED;
    app.save(c);
  });
  try { app.delete(app.findCollectionByNameOrId("hearts_users")); } catch (e) {}
}, (app) => {
  const users = app.findCollectionByNameOrId("users");
  users.fields.removeByName("hearts_role");
  users.updateRule = "id = @request.auth.id && @request.body.role:isset = false && @request.body.household:isset = false && @request.body.site_admin:isset = false";
  app.save(users);
});
