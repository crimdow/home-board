/* Home Board: talks to PocketBase, but looks like the Supabase client the pages were written for.
   index.html and every page file call db.from("table").select()/insert()/update()/delete()/upsert(),
   db.channel(...).on("postgres_changes", ...), db.auth.* and db.rpc("is_editor") exactly as before;
   this file turns those into PocketBase calls. Needs pocketbase.umd.js loaded first. */
(function () {
  "use strict";

  // In PocketBase an empty text field is "" and an empty number is 0; the pages expect null for these.
  var NULL_IF_EMPTY = { store_id: 1, done_at: 1, date: 1, last_done: 1, repeat_days: 1 };
  var LISTS = { tags: 1, photos: 1 };
  var HIDDEN = { collectionId: 1, collectionName: 1, expand: 1 };

  function fromPB(r) {
    var o = {};
    Object.keys(r || {}).forEach(function (k) {
      if (HIDDEN[k]) return;
      var v = r[k];
      if (NULL_IF_EMPTY[k] && (v === "" || v === 0)) v = null;
      if (LISTS[k] && !Array.isArray(v)) v = [];
      o[k] = v;
    });
    return o;
  }
  function toPB(o, keepId) {
    var r = {};
    Object.keys(o || {}).forEach(function (k) {
      if (k === "id" && !keepId) return;
      var v = o[k];
      if (v === null || v === undefined) v = k === "repeat_days" ? 0 : LISTS[k] ? [] : "";
      r[k] = v;
    });
    return r;
  }
  function now() { return new Date().toISOString(); }
  function errOf(e) {
    var msg = (e && e.response && e.response.message) || (e && e.message) || "Request failed";
    return { message: msg, status: e && e.status };
  }

  function createClient(url) {
    var base = (window.HB_SERVER || url && !/supabase\.co/.test(url) && url || location.origin).replace(/\/$/, "");
    var pb = new PocketBase(base);
    pb.autoCancellation(false);

    // ---------- tables ----------
    function Query(table) {
      this.t = table; this.op = "select"; this.filters = []; this.params = {}; this.sort = "";
      this.one = false; this.rows = null; this.conflict = "id"; this.n = 0;
    }
    Query.prototype._f = function (field, op, value) {
      var key = "p" + (this.n++);
      this.filters.push(field + " " + op + " {:" + key + "}"); this.params[key] = value; return this;
    };
    Query.prototype.select = function () { return this; };
    Query.prototype.eq = function (k, v) { return this._f(k, "=", v === null ? "" : v); };
    Query.prototype.gte = function (k, v) { return this._f(k, ">=", v); };
    Query.prototype.lte = function (k, v) { return this._f(k, "<=", v); };
    Query.prototype.order = function (col, o) { this.sort = (o && o.ascending === false ? "-" : "") + col; return this; };
    Query.prototype.single = function () { this.one = true; return this; };
    Query.prototype.insert = function (d) { this.op = "insert"; this.rows = d; return this; };
    Query.prototype.update = function (d) { this.op = "update"; this.rows = d; return this; };
    Query.prototype.delete = function () { this.op = "delete"; return this; };
    Query.prototype.upsert = function (d, o) { this.op = "upsert"; this.rows = d; this.conflict = (o && o.onConflict) || "id"; return this; };
    Query.prototype.filterText = function () { return this.filters.length ? pb.filter(this.filters.join(" && "), this.params) : ""; };
    Query.prototype.idOnly = function () {
      return this.filters.length === 1 && /^id = /.test(this.filters[0]) ? this.params.p0 : null;
    };
    Query.prototype.then = function (ok, bad) { return this.run().then(ok, bad); };
    Query.prototype.run = function () {
      var q = this, col = pb.collection(q.t);
      var list = function () {
        var o = {}; var f = q.filterText(); if (f) o.filter = f; if (q.sort) o.sort = q.sort;
        return col.getFullList(o);
      };
      var p;
      if (q.op === "select") {
        p = list().then(function (rs) { var d = rs.map(fromPB); return q.one ? (d[0] || null) : d; });
      } else if (q.op === "insert") {
        var many = Array.isArray(q.rows), rows = many ? q.rows : [q.rows];
        p = Promise.all(rows.map(function (r) {
          var body = toPB(r); if (!body.created_at) body.created_at = now(); body.updated_at = body.updated_at || now();
          return col.create(body);
        })).then(function (rs) { var d = rs.map(fromPB); return q.one || !many ? d[0] : d; });
      } else if (q.op === "update") {
        var body = toPB(q.rows); body.updated_at = body.updated_at || now();
        var id = q.idOnly();
        if (id !== null) p = String(id).indexOf("tmp") === 0 ? Promise.resolve(null) : col.update(id, body).then(function () { return null; });
        else p = list().then(function (rs) { return Promise.all(rs.map(function (r) { return col.update(r.id, body); })); }).then(function () { return null; });
      } else if (q.op === "delete") {
        var did = q.idOnly();
        var gone = function (e) { if (e && e.status === 404) return null; throw e; };   // already deleted is fine
        if (did !== null) p = String(did).indexOf("tmp") === 0 ? Promise.resolve(null) : col.delete(did).then(function () { return null; }, gone);
        else p = list().then(function (rs) { return Promise.all(rs.map(function (r) { return col.delete(r.id).catch(gone); })); }).then(function () { return null; });
      } else if (q.op === "upsert") {
        var ups = Array.isArray(q.rows) ? q.rows : [q.rows];
        p = Promise.all(ups.map(function (r) {
          var body = toPB(r); body.updated_at = body.updated_at || now();
          var find = q.conflict === "id"
            ? col.getOne(r.id).catch(function (e) { if (e.status === 404) return null; throw e; })
            : col.getFirstListItem(pb.filter(q.conflict + " = {:v}", { v: r[q.conflict] })).catch(function (e) { if (e.status === 404) return null; throw e; });
          return find.then(function (hit) {
            if (hit) return col.update(hit.id, body);
            if (!body.created_at) body.created_at = now();
            return col.create(body);
          });
        })).then(function () { return null; });
      }
      return p.then(function (data) { return { data: data, error: null }; }, function (e) {
        if (window.console) console.warn("Home Board:", q.op, q.t, e);
        return { data: null, error: errOf(e) };
      });
    };

    // ---------- live updates ----------
    function Channel() { this.subs = []; }
    Channel.prototype.on = function (kind, opts, cb) { this.subs.push({ table: opts && opts.table, cb: cb }); return this; };
    Channel.prototype.subscribe = function () {
      this.subs.forEach(function (s) {
        pb.collection(s.table).subscribe("*", function (e) {
          var rec = fromPB(e.record);
          s.cb({ eventType: e.action.toUpperCase(), table: s.table,
                 new: e.action === "delete" ? {} : rec, old: e.action === "delete" ? rec : {} });
        }).catch(function (e) { if (window.console) console.warn("Home Board: live updates for " + s.table + " failed", e); });
      });
      return this;
    };

    // ---------- sign-in ----------
    function session() {
      var rec = pb.authStore.record;
      return pb.authStore.isValid && rec ? { user: { id: rec.id, email: rec.email, role: rec.role, household: rec.household || "", site_admin: !!rec.site_admin } } : null;
    }
    var listeners = [];
    pb.authStore.onChange(function (token) {
      if (!token) listeners.forEach(function (cb) { cb("SIGNED_OUT", null); });
    });

    return {
      pb: pb,
      from: function (t) { return new Query(t); },
      channel: function () { return new Channel(); },
      removeChannel: function () {},
      rpc: function (name) {
        if (name !== "is_editor") return Promise.resolve({ data: null, error: { message: "unknown function " + name } });
        var rec = pb.authStore.record;
        return Promise.resolve({ data: !!(rec && rec.role === "editor"), error: null });
      },
      auth: {
        getSession: function () {
          if (!pb.authStore.isValid) return Promise.resolve({ data: { session: null } });
          // refresh the login (and pick up a changed role); keep the saved one if the network is down
          return pb.collection("users").authRefresh().then(function () {
            return { data: { session: session() } };
          }, function (e) {
            if (e && (e.status === 401 || e.status === 403 || e.status === 404)) pb.authStore.clear();
            return { data: { session: session() } };
          });
        },
        signInWithPassword: function (c) {
          return pb.collection("users").authWithPassword(c.email, c.password).then(function () {
            return { data: { session: session() }, error: null };
          }, function (e) { return { data: null, error: errOf(e) }; });
        },
        signOut: function () { pb.authStore.clear(); return Promise.resolve({ error: null }); },
        onAuthStateChange: function (cb) { listeners.push(cb); return { data: { subscription: { unsubscribe: function () {} } } }; }
      },
      // The Plans calendar used to be a file in Supabase Storage. On PocketBase the server builds it
      // on request at /cal/<name>, so "uploading" is nothing to do and the link points at the server.
      storage: {
        from: function () {
          return {
            upload: function (path) { return Promise.resolve({ data: { path: path }, error: null }); },
            getPublicUrl: function (path) { return { data: { publicUrl: base + "/cal/" + path } }; }
          };
        }
      }
    };
  }

  window.supabase = { createClient: createClient };
})();
