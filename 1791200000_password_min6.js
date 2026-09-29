/// <reference path="../pb_data/types.d.ts" />
// Passwords: at least 6 characters (was 8) for every login table on this server (Home Board, hearts).
// The PocketBase admin (superuser) accounts keep their stronger rule.
migrate((app) => {
  app.findAllCollections("auth").forEach((c) => {
    if (c.name === "_superusers") return;
    const f = c.fields.getByName("password");
    if (!f || f.min === 6) return;
    f.min = 6;
    app.save(c);
  });
}, (app) => {
  app.findAllCollections("auth").forEach((c) => {
    if (c.name === "_superusers") return;
    const f = c.fields.getByName("password");
    if (!f) return;
    f.min = 8;
    app.save(c);
  });
});
