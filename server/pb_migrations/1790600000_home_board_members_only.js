/// <reference path="../pb_data/types.d.ts" />
// Home Board: only Home Board members can read the family boards.
// This server also runs other apps (hearts) whose logins live in the same "users" list.
// Before: any signed-in account could read the boards and Recipes.
// Now: only accounts with a Home Board role (editor or viewer) can. House, Notes and
// settings were already editors-only and stay that way.

migrate((app) => {
  const BOARDS = ["days", "grocery_stores", "grocery_items", "meals", "todos", "plans", "recipes"];
  const MEMBER = "@request.auth.role = 'editor' || @request.auth.role = 'viewer'";
  BOARDS.forEach((name) => {
    const c = app.findCollectionByNameOrId(name);
    c.listRule = MEMBER;
    c.viewRule = MEMBER;
    app.save(c);
  });
}, (app) => {
  const BOARDS = ["days", "grocery_stores", "grocery_items", "meals", "todos", "plans", "recipes"];
  BOARDS.forEach((name) => {
    const c = app.findCollectionByNameOrId(name);
    c.listRule = "@request.auth.id != ''";
    c.viewRule = "@request.auth.id != ''";
    app.save(c);
  });
});
