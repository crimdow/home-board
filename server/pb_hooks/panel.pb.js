/// <reference path="../pb_data/types.d.ts" />
// Wall panel: signs itself back in with a key it got while it was signed in (see migration panel_keys).

// The panel asks for a key while it's signed in. Each login keeps at most 3 keys (newest win).
routerAdd("POST", "/api/hb/panel-key", (e) => {
  const me = e.auth;
  if (!me || me.collection().name !== "users") throw new UnauthorizedError("Sign in first.");
  const key = $security.randomString(48);
  const rec = new Record($app.findCollectionByNameOrId("panel_keys"));
  rec.set("user", me.id);
  rec.set("key_hash", $security.sha256(key));
  $app.save(rec);
  const mine = $app.findRecordsByFilter("panel_keys", "user = {:u}", "-created", 100, 0, { u: me.id });
  mine.slice(3).forEach((r) => $app.delete(r));
  return e.json(200, { key: key });
}, $apis.requireAuth("users"));

// A signed-out panel trades its key for a fresh login.
routerAdd("POST", "/api/hb/panel-login", (e) => {
  const body = e.requestInfo().body || {};
  const key = String(body.key || "");
  if (key.length < 40) throw new BadRequestError("No key.");
  let rec = null;
  try { rec = $app.findFirstRecordByFilter("panel_keys", "key_hash = {:h}", { h: $security.sha256(key) }); } catch (err) {}
  if (!rec) throw new UnauthorizedError("That key doesn't work any more.");
  let user = null;
  try { user = $app.findRecordById("users", rec.getString("user")); } catch (err) {}
  if (!user) { $app.delete(rec); throw new UnauthorizedError("That login is gone."); }
  rec.set("last_used", new Date().toISOString());
  $app.save(rec);
  return $apis.recordAuthResponse(e, user, "panel_key");
});
