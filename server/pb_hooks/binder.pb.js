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
  rec.set("d", val("d", 1000));
  rec.set("img", val("img", 2000));
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

// Pocket Binder Places: turn a Google Maps share link into a name, address and map spot.
// Only Google links are fetched (maps.app.goo.gl, goo.gl/maps, google.com/maps, Google search listings); signed-in people only.
routerAdd("POST", "/api/binder/place-link", (e) => {
  const url = String((e.requestInfo().body || {}).url || "").trim().slice(0, 2000);
  const m = url.match(/^https:\/\/([^\/?#:]+)(\/[^?#]*)?/i);
  const host = m ? m[1].toLowerCase() : "", path = m && m[2] ? m[2] : "/";
  const ok = host === "maps.app.goo.gl" || (host === "goo.gl" && path.indexOf("/maps") === 0) ||
    host === "share.google" || (host === "g.co" && path.indexOf("/kgs") === 0) ||                       // Google search listings
    (/^(www\.)?google\.(com|ca|co\.uk|com\.au|[a-z]{2})$/.test(host) && path.indexOf("/search") === 0) ||
    (/^(www\.|maps\.)?google\.(com|ca|co\.uk|com\.au|[a-z]{2})$/.test(host) && (host.indexOf("maps.") === 0 || path.indexOf("/maps") === 0));
  if (!ok) throw new BadRequestError("Paste a Google Maps link (from Share → Copy link in Google Maps).");

  // Ask as a desktop browser: Google sends it straight to the place. (An iPhone gets a "Continue to the app"
  // page instead, with no name or address on it.)
  const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36";
  const get = (u) => {
    const res = $http.send({ url: u, method: "GET", timeout: 15, headers: { "User-Agent": UA, "Accept": "text/html,application/xhtml+xml", "Accept-Language": "en-US,en;q=0.9" } });
    if (res.statusCode >= 400) throw new Error("status " + res.statusCode);
    return toString(res.body, 3 * 1048576);
  };
  const unent = (s) => String(s || "").replace(/&amp;/g, "&").replace(/&#39;|&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\\u0026/g, "&").trim();
  const titleOf = (h) => unent((String(h).match(/<title>([^<]*)<\/title>/i) || [])[1] || "");
  const hasOg = (h) => { const t = (String(h).match(/<meta[^>]+property="og:title"[^>]*>/i) || [""])[0]; return !!t && !/content="Google Maps"/i.test(t); };
  // a long Maps place link anywhere in a page (plain, HTML-escaped or JavaScript-escaped)
  const placeLinkIn = (h) => {
    const x = String(h).replace(/\\\//g, "/").replace(/\\u0026/gi, "&").replace(/\\u003d/gi, "=").replace(/&amp;/g, "&");
    const f = x.match(/https:\/\/(?:www\.|maps\.)?google\.[a-z.]+\/maps\/place\/[^"'\s<>\\]+/i);
    return f ? f[0] : "";
  };
  // the long link itself says a lot: /maps/place/Lakeview+Park/@41.47,-82.19,17z/…!3d41.47!4d-82.19
  const fromLink = (u) => {
    const r = { name: "", lat: "", lng: "" }, s = String(u || "");
    const n = s.match(/\/maps\/place\/([^\/?#@]+)/) || s.match(/[?&](?:q|query)=([^&#]+)/);
    if (n) { try { r.name = decodeURIComponent(n[1].replace(/\+/g, " ")).trim(); } catch (err) { r.name = n[1].replace(/\+/g, " ").trim(); } }
    if (/^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/.test(r.name)) r.name = "";      // a bare map spot isn't a name
    const ll = s.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/) || s.match(/@(-?\d{1,2}\.\d{3,}),(-?\d{1,3}\.\d{3,})/);
    if (ll) { r.lat = ll[1]; r.lng = ll[2]; }
    return r;
  };

  let html = "";
  try { html = get(url); } catch (err) {
    $app.logger().warn("binder place-link: couldn't fetch", "url", url, "error", String(err));
    throw new BadRequestError("Couldn't reach Google. Try again, or fill it in by hand.");
  }
  let long = /\/maps\/place\//.test(url) ? url : "";
  if (!hasOg(html)) {                                   // e.g. a "continue" page: follow the place link on it
    const found = placeLinkIn(html);
    if (found) { long = found; try { const h2 = get(found); if (hasOg(h2)) html = h2; } catch (err) {} }
  }
  // a Google search listing (share.google, g.co/kgs): take the place's name from the page title, then ask Maps for the rest
  const st = titleOf(html);
  if (!hasOg(html) && !long && / - Google Search\s*$/i.test(st)) {
    const q = st.replace(/ - Google Search\s*$/i, "").trim();
    if (!q) throw new BadRequestError("Google didn't say which place that is. Fill it in by hand.");
    let h3 = "";
    try { h3 = get("https://www.google.com/maps?hl=en&q=" + encodeURIComponent(q)); } catch (err) {}
    if (!hasOg(h3)) { const f = placeLinkIn(h3); if (f) { long = f; try { const h4 = get(f); if (hasOg(h4)) h3 = h4; } catch (err) {} } }
    if (!hasOg(h3)) { const f = fromLink(long); return e.json(200, { name: q, address: "", category: "", rating: "", lat: f.lat, lng: f.lng, maps: long || "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q) }); }
    html = h3;
  }

  const meta = (p) => {
    const a = html.match(new RegExp('<meta[^>]+(?:property|itemprop|name)="' + p + '"[^>]*>', "i"));
    if (!a) return "";
    const c = a[0].match(/content="([^"]*)"/i);
    return c ? unent(c[1]) : "";
  };
  const out = { name: "", address: "", category: "", rating: "", lat: "", lng: "", maps: url };
  if (hasOg(html)) {
    const parts = meta("og:title").split(" · ");
    out.name = parts[0] || "";
    out.address = parts.slice(1).join(", ");
    const desc = meta("og:description");                          // e.g. "★★★★☆ · Pizza restaurant · 7 Carmine St"
    if (desc) {
      const d = desc.split(" · ").map((x) => x.trim()).filter(Boolean);
      if (d[0] && /^[★☆]+$/.test(d[0])) { out.rating = String((d[0].match(/★/g) || []).length); d.shift(); }
      if (d[0] && !/\d/.test(d[0])) out.category = d.shift();
      if (!out.address && d.length) out.address = d.join(", ");
    }
    const ll = meta("og:image").match(/center=(-?\d+\.\d+)(?:%2C|,)(-?\d+\.\d+)/i);
    if (ll) { out.lat = ll[1]; out.lng = ll[2]; }
  }
  const f = fromLink(long || placeLinkIn(html));
  if (!out.name) out.name = f.name;
  if (!out.lat && f.lat) { out.lat = f.lat; out.lng = f.lng; }
  if (!out.name) {
    $app.logger().warn("binder place-link: no place name", "url", url, "length", html.length, "title", titleOf(html).slice(0, 120));
    throw new BadRequestError("Google didn't say which place that is. Fill it in by hand.");
  }
  return e.json(200, out);
}, $apis.requireAuth());
