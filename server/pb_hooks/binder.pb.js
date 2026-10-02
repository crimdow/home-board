/// <reference path="../pb_data/types.d.ts" />
// Pocket Binder: every night, clear Share-Sheet clippings nobody opened within 2 days.
cronAdd("binder_inbox_cleanup", "17 4 * * *", () => {
  const cutoff = new Date(Date.now() - 2 * 86400000).toISOString().replace("T", " ");
  const old = $app.findRecordsByFilter("clip_inbox", "created < {:c}", "", 1000, 0, { c: cutoff });
  old.forEach((r) => $app.delete(r));
});

// Pocket Binder laptop bookmark: the page you're on posts its clipping here as a plain form into a new tab.
// Same household key check as the iPhone shortcut; then the tab lands on the binder with the clipping open.
routerAdd("POST", "/api/binder/clip-form", (e) => {
  const b = e.requestInfo().body || {};
  const val = (k, max) => String(b[k] == null ? "" : b[k]).slice(0, max);
  const key = val("key", 64), t = val("t", 300), u = val("u", 2000);
  const back = "/#add&t=" + encodeURIComponent(t.slice(0, 200)) + "&u=" + encodeURIComponent(u) + "&nx=1";
  if (!/^[A-Za-z0-9]{24,64}$/.test(key)) return e.redirect(303, back);
  try { $app.findFirstRecordByData("clip_keys", "key", key); } catch (err) { return e.redirect(303, back); }
  const rec = new Record($app.findCollectionByNameOrId("clip_inbox"));
  rec.set("key", key);
  rec.set("k", val("k", 20));
  rec.set("t", t);
  rec.set("u", u);
  rec.set("x", val("x", 150000));
  try { $app.save(rec); } catch (err) { return e.redirect(303, back); }
  return e.redirect(303, "/#add&clip=" + rec.id);
});

// Pocket Binder: save a recipe's photo from the recipe site onto this server, so it keeps working
// even if the site moves it. Signed-in people only; public https photo links only.
routerAdd("POST", "/api/binder/photo", (e) => {
  const me = e.auth;
  const url = String((e.requestInfo().body || {}).url || "");
  const m = url.match(/^https:\/\/([^\/?#]+)/i);
  if (!m) throw new BadRequestError("The photo link has to start with https://.");
  const host = m[1].toLowerCase().replace(/:\d+$/, "");
  if (host === "localhost" || host.indexOf("[") === 0 || /^\d+(\.\d+){3}$/.test(host) || /\.(local|lan|internal|home|localhost)$/.test(host) || host.indexOf(".") < 0) {
    throw new BadRequestError("That photo link isn't allowed.");
  }
  let file;
  try { file = $filesystem.fileFromURL(url, 20); } catch (err) { throw new BadRequestError("Couldn't download that photo."); }
  const col = $app.findCollectionByNameOrId("binder_files");
  const rec = new Record(col);
  rec.set("owner", me.id);
  rec.set("household", me.getString("household"));
  rec.set("file", file);
  try { $app.save(rec); } catch (err) { throw new BadRequestError("That link isn't a photo the binder can keep (JPG, PNG, GIF or WebP up to 20 MB)."); }
  const name = rec.getString("file");
  const ext = (name.split(".").pop() || "").toLowerCase();
  const type = ext === "png" ? "image/png" : ext === "gif" ? "image/gif" : ext === "webp" ? "image/webp" : "image/jpeg";
  return e.json(200, { id: rec.id, path: "/api/files/" + col.id + "/" + rec.id + "/" + encodeURIComponent(name), name: name, size: file.size || 0, type: type });
}, $apis.requireAuth());
