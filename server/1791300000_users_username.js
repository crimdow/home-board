/// <reference path="../pb_data/types.d.ts" />
// Home Board logins: a username you can sign in with instead of your email.
// Optional, unique, lowercase letters / numbers / . _ -
migrate((app) => {
  const users = app.findCollectionByNameOrId("users");
  if (!users.fields.getByName("username")) {
    users.fields.add(new TextField({ name: "username", max: 30, pattern: "^[a-z0-9._-]*$" }));
  }
  if (!users.indexes.some((i) => i.indexOf("idx_users_username") >= 0)) users.addIndex("idx_users_username", true, "username", "username != ''");
  const ids = users.passwordAuth.identityFields || [];
  if (ids.indexOf("username") < 0) users.passwordAuth.identityFields = ids.concat(["username"]);
  app.save(users);
}, (app) => {
  const users = app.findCollectionByNameOrId("users");
  users.passwordAuth.identityFields = (users.passwordAuth.identityFields || []).filter((f) => f !== "username");
  users.removeIndex("idx_users_username");
  users.fields.removeByName("username");
  app.save(users);
});
