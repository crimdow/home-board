/* Home Board wall card for Home Assistant (custom:homeboard-wall).
   One card draws the whole wall: Home, Lights, each room, Thermostat, Garage and White noise,
   in the Home Board look (big round icons, heavy type, solid pills, sheets from the bottom).
   Colours: Home Board sends its own (skin, light or dark) to this page when it shows Home Assistant
   inside the wall panel; on its own it uses the Classic Home Board colours.
   Lives at /config/www/homeboard-wall.js and is loaded as the dashboard resource /local/homeboard-wall.js?v=N. */
(function () {
  "use strict";
  var VERSION = "1.15.0";
  var CLASSIC = {
    light: { bg: "#e4e5e8", ink: "#2b2e33", muted: "#7a7f88", chip: "#d5d7db", sheet: "#eeeff1", field: "#d9dbdf", hair: "#d0d2d6", accent: "#4f7bd4", onAccent: "#ffffff" },
    dark: { bg: "#1d1e22", ink: "#e4e4e2", muted: "#8b9098", chip: "#2a2b30", sheet: "#25262b", field: "#26272c", hair: "#2c2d32", accent: "#5f86d6", onAccent: "#ffffff" }
  };
  var C = { amber: "#c98a3e", red: "#d45b6c", blue: "#4f7bd4", green: "#3f9a66", violet: "#8a6bb8", teal: "#36ad9c" };
  // the same colours as the Outside tiles, as round buttons
  var SWATCHES = [
    { name: "Warm white", c: ["#ffe2b0", "#ffb35c"], kelvin: 2700 },
    { name: "Orange", c: ["#ff8c1a", "#ff3d00"], rgb: [255, 100, 0] },
    { name: "Red", c: ["#ff3b4f", "#c4001d"], rgb: [255, 0, 0] },
    { name: "Pink", c: ["#ff5cbf", "#ff0080"], rgb: [255, 60, 150] },
    { name: "Purple", c: ["#b05cff", "#6a00f4"], rgb: [140, 0, 255] },
    { name: "Blue", c: ["#36a3ff", "#0047ff"], rgb: [0, 80, 255] },
    { name: "Green", c: ["#3cf07a", "#00a83e"], rgb: [0, 255, 0] }
  ];
  var HATCH_COLORS = [   // bright, saturated presets for the Hatch light
    { name: "Red", c: ["#ff3b4f", "#c4001d"], rgb: [255, 0, 0] },
    { name: "Orange", c: ["#ff8c1a", "#ff3d00"], rgb: [255, 90, 0] },
    { name: "Amber", c: ["#ffc53d", "#ff9500"], rgb: [255, 160, 0] },
    { name: "Yellow", c: ["#fff05a", "#ffd000"], rgb: [255, 230, 0] },
    { name: "Green", c: ["#3cf07a", "#00a83e"], rgb: [0, 255, 60] },
    { name: "Teal", c: ["#3ff5e0", "#00b3a4"], rgb: [0, 255, 200] },
    { name: "Blue", c: ["#36a3ff", "#0047ff"], rgb: [0, 70, 255] },
    { name: "Purple", c: ["#b05cff", "#6a00f4"], rgb: [130, 0, 255] },
    { name: "Pink", c: ["#ff5cbf", "#ff0080"], rgb: [255, 0, 140] },
    { name: "White", c: ["#ffffff", "#e6ecf5"], rgb: [255, 255, 255] }
  ];
  var CT_SWATCHES = [   // lights that only do whites
    { name: "Warm white", c: ["#ffe2b0", "#ffb35c"], kelvin: 2700 },
    { name: "Daylight", c: ["#ffffff", "#dfe9ff"], kelvin: 5000 }
  ];
  var COLOR_MODES = ["hs", "xy", "rgb", "rgbw", "rgbww"];

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function icon(name, size) { return '<ha-icon icon="' + esc(name) + '" style="--mdc-icon-size:' + (size || 40) + 'px"></ha-icon>'; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function mix(hex, other, t) {   // blend two #rrggbb colours
    function p(h) { h = h.replace("#", ""); if (h.length === 3) h = h.replace(/./g, "$&$&"); return [0, 2, 4].map(function (i) { return parseInt(h.substr(i, 2), 16); }); }
    var a = p(hex), b = p(other);
    return "#" + a.map(function (x, i) { return ("0" + Math.round(x + (b[i] - x) * t).toString(16)).slice(-2); }).join("");
  }
  function rgbHex(rgb) { return "#" + rgb.map(function (x) { return ("0" + Math.round(x).toString(16)).slice(-2); }).join(""); }

  class HomeBoardWall extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this._route = ["home"];
      this._drag = null;
      this._hold = 0;           // don't redraw until this time (a slider was just moved)
      this._pending = {};       // thermostat set points being nudged
      this._sig = "";
      this._look = null;
      try { this._look = JSON.parse(localStorage.getItem("hb-wall-look") || "null"); } catch (e) {}
      this._onMsg = this._onMsg.bind(this);
    }

    setConfig(config) {
      this._config = config || {};
      this._sig = "";
      if (this._hass) this._render();
    }
    getCardSize() { return 12; }
    getGridOptions() { return { columns: "full", rows: "auto" }; }

    connectedCallback() {
      window.addEventListener("message", this._onMsg);
      this._full = window.top !== window || /[?&](kiosk|wall)\b/.test(location.search);
      this.toggleAttribute("full", this._full);
      if (!this._wired) this._wire();
      if (!this._ro && window.ResizeObserver) {
        this._ro = new ResizeObserver(() => { var n = this.clientWidth < 620; if (n !== this.hasAttribute("narrow")) this.toggleAttribute("narrow", n); });
        this._ro.observe(this);
      }
      requestAnimationFrame(() => this._paintLook());   // the theme's colours are only readable once on the page
      // a wall panel left on a sub-page drifts home after a few minutes
      this._idle = setInterval(() => {
        if (this._route[0] !== "home" && Date.now() - (this._touched || 0) > 3 * 60000) { this._route = ["home"]; this._sig = ""; this._render(); }
      }, 30000);
    }
    disconnectedCallback() { window.removeEventListener("message", this._onMsg); clearInterval(this._idle); }

    _onMsg(e) {
      var ok = (this._config && this._config.homeboard_origin) || "https://home.jermins.com";
      if (e.origin !== ok || !e.data || e.data.hb !== "look") return;
      var look = e.data.look;
      if (JSON.stringify(look) === JSON.stringify(this._look)) return;
      this._look = look;
      try { localStorage.setItem("hb-wall-look", JSON.stringify(look)); } catch (x) {}
      this._paintLook();
    }

    // Tell Home Board what the speakers are playing, so its screensaver can show it (title, artist, cover).
    _tellNowPlaying() {
      if (window.parent === window) return;
      var sp = this._speakers().map((x) => this._s(x.entity)).filter((x) => x && (x.state === "playing" || x.state === "paused"));
      var p = sp.find((x) => x.state === "playing") || null;
      var a = p ? p.attributes : {};
      var np = p ? { playing: true, title: a.media_title || "", artist: a.media_artist || "", album: a.media_album_name || "", speaker: a.friendly_name || "", pic: a.entity_picture || "" } : { playing: false };
      var key = JSON.stringify(np);
      if (key === this._npKey && Date.now() - (this._npAt || 0) < 30000) return;
      this._npKey = key; this._npAt = Date.now();
      var send = (art) => { try { window.parent.postMessage({ hb: "nowplaying", np: Object.assign({}, np, { art: art || "" }) }, "*"); } catch (e) {} };
      if (!np.pic) return send("");
      if (this._artFor === np.pic) return send(this._art);
      // the cover is on this Home Assistant: hand it over as a picture Home Board can show
      fetch(np.pic).then((r) => r.ok ? r.blob() : null).then((b) => {
        if (!b) return send("");
        var fr = new FileReader(); fr.onload = () => { this._artFor = np.pic; this._art = fr.result; send(fr.result); }; fr.readAsDataURL(b);
      }).catch(() => send(""));
    }

    set hass(hass) {
      var themeChanged = this._hass && hass.themes !== this._hass.themes;
      this._hass = hass;
      if (this._config && this._config.music) this._tellNowPlaying();
      if (themeChanged) requestAnimationFrame(() => this._paintLook());
      if (!this.shadowRoot.firstChild) this._render();
      else this._maybeRender();
    }

    /* ---------- helpers on states ---------- */
    _s(id) { return this._hass && this._hass.states[id]; }
    _on(id) { var s = this._s(id); return !!s && s.state === "on"; }
    _rooms() { return this._config.rooms || []; }
    _roomLights(r) { return (r.lights || []).map(function (l) { return typeof l === "string" ? { entity: l } : l; }); }
    _roomMain(r) {   // what the room's own slider moves
      if (r.group) return [r.group];
      if (r.main) return r.main;
      return this._roomLights(r).map(function (l) { return l.entity; });
    }
    _roomIds(r) {   // every light in a room: its main lights plus the listed ones
      var out = (r.main || []).slice();
      this._roomLights(r).forEach(function (l) { if (out.indexOf(l.entity) < 0) out.push(l.entity); });
      return out;
    }
    _allLights() {
      var out = [];
      this._rooms().forEach((r) => this._roomIds(r).forEach(function (id) { if (out.indexOf(id) < 0) out.push(id); }));
      return out;
    }
    _has(controls, k) { return !controls || controls.indexOf(k) >= 0; }
    _supportsCt(ids) { return ids.some((id) => { var s = this._s(id); return s && (s.attributes.supported_color_modes || []).indexOf("color_temp") >= 0; }); }
    _supportsColor(ids) { return ids.some((id) => { var s = this._s(id); return s && (s.attributes.supported_color_modes || []).some(function (m) { return COLOR_MODES.indexOf(m) >= 0; }); }); }
    _dimmable(ids) { return ids.some((id) => { var s = this._s(id); return s && (s.attributes.supported_color_modes || []).some(function (m) { return m !== "onoff"; }); }); }
    _bri(ids) {   // average brightness (0-100) of the lights that are on
      var v = [];
      ids.forEach((id) => { var s = this._s(id); if (s && s.state === "on") v.push(s.attributes.brightness != null ? s.attributes.brightness / 2.55 : 100); });
      return v.length ? Math.round(v.reduce(function (a, b) { return a + b; }, 0) / v.length) : 0;
    }
    _temp(ids) {   // 0 = warmest, 100 = coolest
      for (var i = 0; i < ids.length; i++) {
        var s = this._s(ids[i]); if (!s || s.state !== "on") continue;
        var a = s.attributes, k = a.color_temp_kelvin, lo = a.min_color_temp_kelvin || 2000, hi = a.max_color_temp_kelvin || 6500;
        if (k) return Math.round((k - lo) / (hi - lo) * 100);
      }
      return 35;
    }
    _hue(ids) {   // 0-100 along the rainbow
      for (var i = 0; i < ids.length; i++) { var s = this._s(ids[i]); if (s && s.state === "on" && s.attributes.hs_color && s.attributes.color_mode !== "color_temp") return Math.round(s.attributes.hs_color[0] / 3.6); }
      return 0;
    }
    _ctRange(ids) {
      var lo = 2000, hi = 6500, found = false;
      ids.forEach((id) => { var a = (this._s(id) || {}).attributes; if (a && a.min_color_temp_kelvin) { if (!found) { lo = a.min_color_temp_kelvin; hi = a.max_color_temp_kelvin; found = true; } else { lo = Math.max(lo, a.min_color_temp_kelvin); hi = Math.min(hi, a.max_color_temp_kelvin); } } });
      return [lo, hi];
    }
    _glow(ids) {   // the colour a room is lit in (for its icon)
      for (var i = 0; i < ids.length; i++) {
        var s = this._s(ids[i]); if (!s || s.state !== "on") continue;
        if (s.attributes.rgb_color && s.attributes.color_mode !== "color_temp") return rgbHex(s.attributes.rgb_color);
        return "#f2b25c";
      }
      return null;
    }
    _onCount(ids) { return ids.filter((id) => this._on(id)).length; }
    _call(domain, service, data) { this._hass.callService(domain, service, data); }

    /* ---------- redraw only when something we show changed ---------- */
    _watched() {
      var c = this._config, ids = this._allLights().slice();
      this._rooms().forEach(function (r) { if (r.group) ids.push(r.group); });
      if (c.thermostat) ids.push(c.thermostat);
      ((c.garage || {}).doors || []).forEach(function (d) { ids.push(d.entity); });
      if ((c.garage || {}).light) ids.push(c.garage.light);
      (c.noise || []).forEach(function (n) { ["player", "volume", "light"].forEach(function (k) { if (n[k]) ids.push(n[k]); }); });
      this._speakers().forEach(function (sp) { ids.push(sp.entity); });
      var sp = this._spotify(); if (sp) ids.push(sp);
      return ids;
    }
    /* ---------- music ---------- */
    _speakers() { return ((this._config.music || {}).speakers || []).map(function (x) { return typeof x === "string" ? { entity: x } : x; }); }
    _spotify() {   // the Spotify account, once it's connected in Home Assistant (found by itself)
      var m = this._config.music || {};
      if (m.spotify) return m.spotify;
      return this._hass ? Object.keys(this._hass.states).find(function (e) { return e.indexOf("media_player.spotify") === 0; }) : null;
    }
    _nowLine(s) {
      var a = s.attributes;
      if (s.state === "playing" || s.state === "paused") {
        var t = [a.media_title, a.media_artist].filter(Boolean).join(" · ");
        return (s.state === "paused" ? "Paused" : "Playing") + (t ? " · " + t : "");
      }
      return s.state === "unavailable" ? "Not reachable" : "Off";
    }
    _musicPage() {   // Music Assistant: what's playing on the chosen speaker, and your Spotify playlists to start
      var m = this._config.music || {}, spk = this._speakers();
      if (!spk.length) return '<div class="page">' + this._head("Music", "home") + '<div class="card">No speakers set up.</div></div>';
      if (!this._mp || !spk.some((x) => x.entity === this._mp)) {
        var playingNow = spk.find((x) => { var st = this._s(x.entity); return st && st.state === "playing"; });
        this._mp = (playingNow || spk[0]).entity;
      }
      var id = this._mp, s = this._s(id), a = s ? s.attributes : {}, playing = s && s.state === "playing", out = [];
      var name = (spk.find((x) => x.entity === id) || {}).name || a.friendly_name || id;
      var h = '<div class="card music' + (playing ? " playing" : "") + '"><div class="row">' +
        (a.entity_picture && (playing || s.state === "paused") ? '<img class="art" src="' + esc(a.entity_picture) + '" alt="">' : '<span class="ic" style="background:' + (playing ? C.teal : "var(--chip)") + ";color:" + (playing ? "#fff" : C.teal) + '">' + icon("mdi:speaker", 40) + "</span>") +
        '<span class="words"><b>' + esc(playing || (s && s.state === "paused") ? (a.media_title || name) : name) + "</b><i>" + esc(playing || (s && s.state === "paused") ? [a.media_artist, s.state === "paused" ? "Paused" : ""].filter(Boolean).join(" · ") : s ? this._nowLine(s) : "Not found") + "</i></span></div>" +
        (s && (playing || s.state === "paused") ? this._transport(id, playing) : "") +
        (s && s.state !== "unavailable" ? this._slider("mvol", [id], Math.round((a.volume_level || 0) * 100), "Volume") : "");
      if (spk.length > 1) h += '<div class="label">Play on</div><div class="chips">' + spk.map((x) => '<button class="chip' + (x.entity === id ? " on" : "") + '" data-pick="' + esc(x.entity) + '">' + esc(x.name || x.entity) + "</button>").join("") + "</div>";
      out.push(h + "</div>");
      out.push('<div class="card"><div class="label">Playlists</div><div class="plist">' + this._plistHtml() + "</div></div>");
      if (!this._plists || Date.now() - this._plistsAt > 10 * 60e3) this._loadPlaylists();
      return '<div class="page">' + this._head("Music", "home") + '<div class="scroll"><div class="stack">' + out.join("") + "</div></div></div>";
    }
    _plistHtml() {
      var p = this._plists;
      if (!p) return '<span class="sub">Loading…</span>';
      if (p.error) return '<span class="sub">' + esc(p.error) + "</span>";
      if (!p.length) return '<span class="sub">No playlists yet. Sign in to Spotify in Music Assistant (Settings → Providers).</span>';
      return '<div class="pgrid">' + p.map(function (x, k) {
        return '<button class="pl" data-plist="' + k + '">' + (x.image ? '<img src="' + esc(x.image) + '" alt="" loading="lazy">' : '<span class="noart">' + icon("mdi:playlist-music", 40) + "</span>") + "<b>" + esc(x.name) + "</b></button>";
      }).join("") + "</div>";
    }
    async _loadPlaylists() {
      if (this._plLoading) return; this._plLoading = true;
      var m = this._config.music || {};
      try {
        var entry = m.config_entry_id;
        if (!entry) { var es = await this._hass.callWS({ type: "config_entries/get", domain: "music_assistant" }); entry = es[0] && es[0].entry_id; }
        if (!entry) throw new Error("Music Assistant isn't set up.");
        var res = await this._hass.callWS({ type: "call_service", domain: "music_assistant", service: "get_library", service_data: { config_entry_id: entry, media_type: "playlist", limit: m.limit || 24, order_by: "last_played" }, return_response: true });
        var items = ((res.response || res).items || []);
        this._plists = items.map(function (x) {
          var img = x.image && (typeof x.image === "string" ? x.image : x.image.path || x.image.url);
          // a home-network (http) picture only shows when the page itself is on the home network
          var ok = img && (/^https:/.test(img) || (/^http:/.test(img) && location.protocol === "http:"));
          return { name: x.name, uri: x.uri, image: ok ? img : null };
        });
      } catch (e) { this._plists = { error: "Couldn't load playlists: " + (e.message || e.code || e) }; }
      this._plistsAt = Date.now(); this._plLoading = false;
      var box = this.shadowRoot.querySelector(".plist"); if (box) box.innerHTML = this._plistHtml();
    }
    _hatchShown(id) {   // what to show for a Hatch light: a colour just picked wins until the Hatch catches up
      var s = this._s(id), on = !!s && s.state === "on", rgb = s && s.attributes.rgb_color, o = this._hatchOpt && this._hatchOpt[id];
      if (o && Date.now() < o.until) return { on: true, rgb: o.rgb };
      return { on: on, rgb: on && rgb ? rgb.slice(0, 3) : null };
    }
    _hatchLightPage(i) {
      var n = (this._config.noise || [])[i]; if (!n || !n.light) { this._route = ["noise"]; return this._noisePage(); }
      var id = n.light, s = this._s(id), hs = this._hatchShown(id), on = hs.on, c = hs.rgb;
      var bri = s && s.state === "on" && s.attributes.brightness ? Math.round(s.attributes.brightness / 2.55) : on ? 60 : 0;
      var ob = this._hatchBri && this._hatchBri[id]; if (ob && Date.now() < ob.until) bri = ob.v;
      var lc = c ? "rgb(" + c.join(",") + ")" : null;
      var h = '<div class="card light hatchcard' + (on ? " lit" : "") + '"' + (lc ? ' style="--glow:' + lc + '"' : "") + '><div class="row">' +
        '<button class="ic" data-toggle="' + esc(id) + '" aria-label="Turn the light on or off">' + icon("mdi:lightbulb-night", 40) + "</button>" +
        '<button class="words" data-toggle="' + esc(id) + '"><b>' + esc(n.name) + "’s Hatch light</b><i>" + (on ? "On" : "Off") + "</i></button></div>" +
        '<div class="label">Brightness</div>' + this._slider("hbri", [id], bri) +
        '<div class="label">Color</div><div class="wheelwrap"><div class="wheel" data-wheel="' + esc(id) + '">' + (lc ? '<span class="wmark" style="' + this._wheelPos(c) + "background:" + lc + '"></span>' : "") + "</div></div>" +
        '<div class="swatches hatch">' + HATCH_COLORS.map(function (x, k) {
          return '<button class="sw" data-hcolor="' + k + '" data-ids="' + esc(id) + '" aria-label="' + x.name + '" style="--c1:' + x.c[0] + ";--c2:" + x.c[1] + '"></button>';
        }).join("") + "</div></div>";
      var back = this._from && this._from[0] === "room" ? this._from.join("/") : "noise";
      return '<div class="page">' + this._head("Hatch light", back) + '<div class="scroll"><div class="stack">' + h + "</div></div></div>";
    }
    _wheelPos(rgb) {   // where a colour sits on the wheel (hue round the edge, paler towards the middle)
      var r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, hh = 0;
      if (d) hh = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
      var hue = (hh * 60 + 360) % 360, sat = mx ? d / mx : 0, ang = hue * Math.PI / 180, rad = 46 * sat;
      return "left:" + (50 + Math.sin(ang) * rad).toFixed(1) + "%;top:" + (50 - Math.cos(ang) * rad).toFixed(1) + "%;";
    }
    _wheelAt(el, x, y) {   // the colour under a finger on the wheel
      var r = el.getBoundingClientRect(), dx = x - (r.left + r.width / 2), dy = y - (r.top + r.height / 2);
      var sat = clamp(Math.sqrt(dx * dx + dy * dy) / (r.width / 2), 0, 1), hue = (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360;
      var f = function (k) { var kk = (k + hue / 60) % 6; return 1 - sat * Math.max(0, Math.min(kk, 4 - kk, 1)); };
      return [Math.round(f(5) * 255), Math.round(f(3) * 255), Math.round(f(1) * 255)];
    }
    _hueOf(rgb) {   // 0-100 along the colour slider
      var r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, hh = 0;
      if (d) hh = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
      return Math.round(((hh * 60 + 360) % 360) / 3.6);
    }
    _hueRgb(v) {   // full, bright colour at 0-100 along the slider
      var hue = v * 3.6 % 360, f = function (k) { var kk = (k + hue / 60) % 6; return 1 - Math.max(0, Math.min(kk, 4 - kk, 1)); };
      return [Math.round(f(5) * 255), Math.round(f(3) * 255), Math.round(f(1) * 255)];
    }
    _paintHatch(id, rgb) {   // show a picked colour right away, before the Hatch answers
      this._hatchOpt = this._hatchOpt || {}; this._hatchOpt[id] = { rgb: rgb, until: Date.now() + 9000 };
      var card = this.shadowRoot.querySelector(".hatchcard"); if (!card) return;
      card.style.setProperty("--glow", "rgb(" + rgb.join(",") + ")"); card.classList.add("lit");
      var mk = card.querySelector(".wmark"); if (mk) mk.setAttribute("style", this._wheelPos(rgb) + "background:rgb(" + rgb.join(",") + ")");
    }
    _setHatch(id, rgb) {
      this._hatchLast = this._hatchLast || {}; this._hatchLast[id] = rgb;
      this._paintHatch(id, rgb);
      var s = this._s(id), bri = s && s.state === "on" && s.attributes.brightness ? Math.round(s.attributes.brightness / 2.55) : 60;
      this._call("light", "turn_on", { entity_id: id, rgb_color: rgb, brightness_pct: Math.max(5, bri) });
    }

    _transport(id, playing) {
      var e = esc(id);
      return '<div class="transport"><button class="round" data-mpact="media_previous_track" data-mp="' + e + '" aria-label="Back">' + icon("mdi:skip-previous", 40) + "</button>" +
        '<button class="round play" data-mpact="media_play_pause" data-mp="' + e + '" aria-label="' + (playing ? "Pause" : "Play") + '">' + icon(playing ? "mdi:pause" : "mdi:play", 48) + "</button>" +
        '<button class="round" data-mpact="media_next_track" data-mp="' + e + '" aria-label="Next">' + icon("mdi:skip-next", 40) + "</button></div>";
    }

    _maybeRender() {
      var sig = this._watched().map((id) => { var s = this._s(id); return s ? id + s.last_updated : id; }).join("|");
      if (sig === this._sig) return;
      if (this._drag || Date.now() < this._hold) { clearTimeout(this._later); this._later = setTimeout(() => this._maybeRender(), 600); return; }
      this._render();
    }

    _paintLook() {
      var dark = this._hass && this._hass.themes ? !!this._hass.themes.darkMode : matchMedia("(prefers-color-scheme: dark)").matches;
      var L = this._look || this._haLook() || CLASSIC[dark ? "dark" : "light"];
      var st = this.style;
      st.setProperty("--bg", L.bg); st.setProperty("--ink", L.ink); st.setProperty("--muted", L.muted);
      st.setProperty("--chip", L.chip); st.setProperty("--card", L.sheet); st.setProperty("--field", L.field || L.chip);
      st.setProperty("--accent", L.accent); st.setProperty("--on-accent", L.onAccent || "#fff");
      st.setProperty("--dim", mix(L.chip, L.ink, 0.12));
      this._dark = parseInt(L.bg.replace("#", "").substr(0, 2), 16) < 0x80;
    }

    // Colours from the Home Assistant theme (the Home Board themes in ha/homeboard-theme.yaml), used when
    // Home Board itself isn't showing this page.
    _haLook() {
      var cs = getComputedStyle(this), v = function (k) { return cs.getPropertyValue(k).trim(); };
      var bg = v("--primary-background-color"); if (!/^#[0-9a-f]{6}$/i.test(bg)) return null;
      var hex = function (x, d) { return /^#[0-9a-f]{6}$/i.test(x) ? x : d; };
      return { bg: bg, ink: hex(v("--primary-text-color"), "#2b2e33"), muted: hex(v("--secondary-text-color"), "#7a7f88"),
        chip: hex(v("--secondary-background-color"), "#d5d7db"), sheet: hex(v("--card-background-color"), "#eeeff1"),
        field: hex(v("--input-fill-color"), "#d9dbdf"), accent: hex(v("--primary-color"), "#4f7bd4"), onAccent: hex(v("--text-primary-color"), "#ffffff") };
    }

    /* ---------- drawing ---------- */
    _render() {
      if (!this._hass || !this._config) return;
      this._sig = this._watched().map((id) => { var s = this._s(id); return s ? id + s.last_updated : id; }).join("|");
      this._paintLook();
      var r = this._route, body;
      if (r[0] === "lights") body = this._lightsPage();
      else if (r[0] === "room") body = this._roomPage(this._rooms()[r[1]]);
      else if (r[0] === "thermostat") body = this._thermoPage();
      else if (r[0] === "garage") body = this._garagePage();
      else if (r[0] === "noise") body = this._noisePage();
      else if (r[0] === "music") body = this._musicPage();
      else if (r[0] === "hatchlight") body = this._hatchLightPage(+r[1]);
      else body = this._homePage();
      var scroller = this.shadowRoot.querySelector(".scroll"), top = scroller && this._lastRoute === r.join("/") ? scroller.scrollTop : 0;
      this.shadowRoot.innerHTML = "<style>" + CSS + "</style>" + body + (this._sheet ? this._sheetHtml() : "") +
        '<div class="turn">' + icon("mdi:phone-rotate-portrait", 64) + "<span>Turn your phone upright</span></div>";
      this._lastRoute = r.join("/");
      var sc = this.shadowRoot.querySelector(".scroll"); if (sc) sc.scrollTop = top;
    }

    _head(title, back, right) {
      return '<div class="head">' +
        (back ? '<button class="back" data-go="' + back + '" aria-label="Back">' + icon("mdi:chevron-left", 44) + "</button>" : "") +
        '<h1>' + esc(title) + "</h1>" + (right || "") +
        (back ? '<button class="back homebtn" data-go="home" aria-label="Wall home">' + icon("mdi:home-assistant", 40) + "</button>" : "") + "</div>";
    }

    _homePage() {
      var c = this._config, tiles = [];
      // Lights
      var all = this._allLights(), n = this._onCount(all), rooms = this._rooms().filter((r) => this._onCount(this._roomIds(r)) > 0).length;
      tiles.push(this._bigTile("lights", "Lights", n ? n + " on in " + rooms + (rooms === 1 ? " room" : " rooms") : "All off", "mdi:lightbulb-group", C.amber, n > 0));
      // Thermostat
      if (c.thermostat) { var t = this._thermoWords(); tiles.push(this._bigTile("thermostat", "Thermostat", t.line, "mdi:thermostat", t.color, t.active, t.big)); }
      // Garage
      if (c.garage) {
        var doors = (c.garage.doors || []).map((d) => this._s(d.entity)).filter(Boolean);
        var open = doors.filter(function (s) { return s.state !== "closed"; });
        var line = !doors.length ? "" : !open.length ? (doors.length > 1 ? (doors.length === 2 ? "Both closed" : "All closed") : "Closed")
          : doors.length === 1 ? this._doorWord(open[0].state) : open.length + " open";
        tiles.push(this._bigTile("garage", "Garage", line, open.length ? "mdi:garage-open-variant" : "mdi:garage-variant", open.length ? C.amber : C.green, open.length > 0, null, open.length > 0));
      }
      // White noise
      if (c.noise) {
        var playing = c.noise.filter((x) => { var s = this._s(x.player); return s && s.state === "playing"; }).map(function (x) { return x.name; });
        tiles.push(this._bigTile("noise", "White noise", playing.length ? playing.join(" & ") + " on" : "All off", "mdi:waveform", C.violet, playing.length > 0));
      }
      // Music
      if (c.music && c.music.tile !== false) {
        var sid = this._spotify(), sp = sid && this._s(sid), on = this._speakers().map((x) => this._s(x.entity)).filter((x) => x && x.state === "playing");
        var line = sp && sp.state === "playing" ? (sp.attributes.media_title || "Spotify playing") : on.length ? (on[0].attributes.media_title || on[0].attributes.friendly_name + " playing") : "Off";
        tiles.push(this._bigTile("music", "Music", line, "mdi:music", C.teal, (sp && sp.state === "playing") || on.length > 0));
      }
      return '<div class="page home">' + this._head(c.title || "Home") + '<div class="grid2 fill' + (tiles.length % 2 ? " odd" : "") + '">' + tiles.join("") + "</div></div>";
    }
    _bigTile(go, name, line, ic, color, active, big, warn) {
      return '<div role="button" tabindex="0" class="big' + (warn ? " warn" : "") + '" data-go="' + go + '">' +
        '<span class="ic" style="background:' + (active ? color : "var(--chip)") + ";color:" + (active ? "#fff" : color) + '">' + icon(ic, 54) + "</span>" +
        (big ? '<span class="bignum">' + esc(big) + "</span>" : "") +
        '<span class="words"><b>' + esc(name) + "</b><i>" + esc(line) + "</i></span></div>";
    }
    _doorWord(s) { return { open: "Open", closed: "Closed", opening: "Opening…", closing: "Closing…" }[s] || s; }

    _thermoWords() {
      var s = this._s(this._config.thermostat); if (!s) return { line: "Not found", color: C.blue };
      var a = s.attributes, act = a.hvac_action, inside = a.current_temperature != null ? Math.round(a.current_temperature) + "°" : "";
      var lo = a.target_temp_low, hi = a.target_temp_high, t = a.temperature;
      var set = s.state === "heat_cool" && lo != null ? Math.round(lo) + "–" + Math.round(hi) + "°" : t != null ? Math.round(t) + "°" : "";
      if (act === "heating") return { line: "Heating to " + Math.round(s.state === "heat_cool" ? lo : t) + "°", color: C.red, active: true, big: inside };
      if (act === "cooling") return { line: "Cooling to " + Math.round(s.state === "heat_cool" ? hi : t) + "°", color: C.blue, active: true, big: inside };
      if (s.state === "off") return { line: "Off", color: C.blue, active: false, big: inside };
      return { line: "Holding " + set, color: s.state === "heat" ? C.red : s.state === "cool" ? C.blue : C.teal, active: false, big: inside };
    }

    /* Lights: every room with its own slider */
    _lightsPage() {
      var cards = this._rooms().map((r, i) => {
        var ids = this._roomIds(r), main = this._roomMain(r);
        var on = this._onCount(ids), bri = this._bri(main), glow = this._glow(main.concat(ids));
        var state = on ? "On" : "Off";   // the level shows on the 25% / 100% buttons
        var nav = r.inline ? "" : ' data-go="room/' + i + '"';
        if (r.guard) {   // kids' rooms: no switches here, so nobody turns them on by accident at night
          return '<button class="room guard' + (on ? " lit" : "") + '"' + nav + (glow ? ' style="--glow:' + glow + '"' : "") + ">" +
            '<span class="ic sm">' + icon(r.icon || "mdi:lightbulb", 30) + "</span>" +
            '<span class="words"><b>' + esc(r.name) + "</b><i>" + esc(state) + "</i></span>" +
            '<span class="more">' + icon("mdi:chevron-right", 30) + "</span></button>";
        }
        var h = '<div class="room' + (on ? " lit" : "") + (r.inline ? " inline" : "") + (r.quick ? " quick" : "") + '"' + (glow ? ' style="--glow:' + glow + '"' : "") + ">" +
          '<div class="row"><button class="ic sm" data-toggle="' + esc(main.join(",")) + '"' + (r.quick ? ' data-full="1"' : "") + ' aria-label="Turn ' + esc(r.name) + ' on or off">' + icon(r.icon || "mdi:lightbulb", 34) + "</button>" +
          '<button class="words"' + (r.inline ? ' data-toggle="' + esc(main.join(",")) + '"' : nav) + "><b>" + esc(r.inline && r.whole_name ? r.whole_name : r.name) + "</b><i>" + esc(state) + "</i></button>" +
          (r.inline ? this._roomLights(r).map((l) => {   // extra lights (Flood lights) as on/off pills
            var lon = this._on(l.entity);
            return '<button class="pill lpill' + (lon ? " on" : "") + '" data-toggle="' + esc(l.entity) + '">' + (l.icon ? icon(l.icon, 26) : "") + "<span>" + esc(l.name) + "</span></button>";
          }).join("") : '<button class="more"' + nav + ' aria-label="Open ' + esc(r.name) + '">' + icon("mdi:chevron-right", 34) + "</button>") + "</div>";
        if (r.quick) {   // on/off buttons (Outside: all the outdoor lights at warm 100%, and the floods)
          h += '<div class="levels">' + r.quick.map((q) => {
            var qon = this._onCount(q.ids) > 0;
            return '<button class="lvl' + (qon ? " on" : "") + '" data-toggle="' + esc(q.ids.join(",")) + '" data-full="1">' + esc(q.name) + "</button>";
          }).join("") + "</div>";
        } else if (r.inline && (r.buttons || []).length) {   // colour buttons right on the Lights page
          h += '<div class="dots">' + r.buttons.map(function (b, k) {
            var c = b.colors || [b.color || "#8a6bb8", b.color || "#5b3f99"];
            return '<button class="dot" data-rbtn="' + k + '" data-room="' + i + '" aria-label="' + esc(b.name) + '"><span class="sw" style="--c1:' + c[0] + ";--c2:" + c[1] + '"></span></button>';
          }).join("") + "</div>";
        } else if (this._dimmable(main) && this._has(r.controls, "bri") && !r.quick) {   // quick levels, always in warm white
          var key = esc(main.join(","));
          h += '<div class="levels">' + [25, 100].map(function (lv) {
            var cur = on && (lv === 25 ? bri < 63 : bri >= 63);
            return '<button class="lvl' + (cur ? " on" : "") + '" data-level="' + lv + '" data-ids="' + key + '">' + lv + "%</button>";
          }).join("") + "</div>";
        }
        return h + "</div>";
      });
      var anyOn = this._onCount(this._allLights()) > 0;
      return '<div class="page lights">' + this._head("Lights", "home", anyOn ? '<button class="pill" data-alloff="1">All off</button>' : "") +
        '<div class="scroll"><div class="lgrid">' + cards.join("") + "</div></div></div>";
    }
    _levels(ids, on, bri, list) {   // 25% / 100% buttons (or the room's own), always in warm white
      var key = esc(ids.join(",")), lv0 = (list || [25, 100])[0], mid = (lv0 + 100) / 2;
      return '<div class="levels">' + (list || [25, 100]).map(function (lv) {
        var cur = on && (lv === lv0 ? bri < mid : bri >= mid);
        return '<button class="lvl' + (cur ? " on" : "") + '" data-level="' + lv + '" data-ids="' + key + '">' + lv + "%</button>";
      }).join("") + "</div>";
    }
    _members(ids) {   // light groups opened up into their bulbs
      var out = [];
      var add = (id, depth) => {
        var s = this._s(id), m = s && s.attributes.entity_id;
        if (m && m.length && depth < 3) m.forEach(function (x) { add(x, depth + 1); });
        else if (out.indexOf(id) < 0) out.push(id);
      };
      ids.forEach(function (id) { add(id, 0); });
      return out;
    }
    _warm(ids, extra) {   // on at each bulb's own warmest white (2000 K on the Govee bulbs); lights without whites just get the brightness
      var byK = {}, rest = [];
      this._members(ids).forEach((id) => {
        var s = this._s(id), a = s ? s.attributes : {};
        if ((a.supported_color_modes || []).indexOf("color_temp") >= 0) { var k = a.min_color_temp_kelvin || 2000; (byK[k] = byK[k] || []).push(id); }
        else rest.push(id);
      });
      Object.keys(byK).forEach((k) => this._call("light", "turn_on", Object.assign({ entity_id: byK[k], color_temp_kelvin: +k }, extra || {})));
      if (rest.length) this._lightOn(rest, extra);
    }

    /* A room: the whole room on top, then each light */
    _roomPage(r) {
      if (!r) { this._route = ["lights"]; return this._lightsPage(); }
      var lights = this._roomLights(r), main = this._roomMain(r), out = [];
      var whole = r.group ? [r.group] : r.main ? r.main : lights.map(function (l) { return l.entity; });
      if (r.toggles) {   // Outside: one lamp-style card for all the outdoor lights, then simple on/off cards
        var on = this._onCount(this._members(main).concat(main)) > 0, bri = this._bri(this._members(main)), key = esc(main.join(","));
        var h = '<div class="card light' + (on ? " lit" : "") + '"><div class="row">' +
          '<button class="ic" data-toggle="' + key + '" data-full="1" aria-label="Turn ' + esc(r.whole_name || r.name) + ' on or off">' + icon(r.icon || "mdi:lightbulb", 40) + "</button>" +
          '<button class="words" data-toggle="' + key + '" data-full="1"><b>' + esc(r.whole_name || r.name) + "</b><i>" + (on ? "On" : "Off") + "</i></button></div>" +
          '<div class="label">Brightness</div>' + this._levels(main, on, bri, r.levels);
        if ((r.buttons || []).length) h += '<div class="label">Color</div><div class="swatches">' + r.buttons.map(function (b, k) {
          var c = b.colors || [b.color || "#8a6bb8", b.color || "#5b3f99"];
          return '<button class="sw" data-rbtn="' + k + '" aria-label="' + esc(b.name) + '" style="--c1:' + c[0] + ";--c2:" + c[1] + '"></button>';
        }).join("") + "</div>";
        out.push(h + "</div>");
        r.toggles.forEach((t) => {
          var ton = this._onCount(this._members(t.ids).concat(t.ids)) > 0, tk = esc(t.ids.join(","));
          out.push('<div class="card light' + (ton ? " lit" : "") + '"><div class="row">' +
            '<button class="ic" data-toggle="' + tk + '" data-full="1" aria-label="Turn ' + esc(t.name) + ' on or off">' + icon(t.icon || "mdi:lightbulb", 40) + "</button>" +
            '<button class="words" data-toggle="' + tk + '" data-full="1"><b>' + esc(t.name) + "</b><i>" + (ton ? "On" : "Off") + "</i></button></div></div>");
        });
        return '<div class="page">' + this._head(r.name, "lights") + '<div class="scroll"><div class="stack">' + out.join("") + "</div></div></div>";
      }
      if (lights.length > 1 || r.group || r.main) out.push(this._lightCard(r.whole_name || "Whole room", r.icon || "mdi:lightbulb-group", whole, true, r.controls, !!r.quick));
      // scenes: bright colour tiles (each button can carry its own colours)
      var scenesHtml = (r.buttons || []).length ? ('<div class="card"><div class="label">' + esc(r.buttons_label || "Scenes") + '</div><div class="scenes">' + r.buttons.map(function (b, i) {
        var c = b.colors || [b.color || "#8a6bb8", b.color || "#5b3f99"];
        return '<button class="scene' + (b.dark_text ? " darktext" : "") + '" data-rbtn="' + i + '" style="--c1:' + c[0] + ";--c2:" + c[1] + '">' + (b.icon ? icon(b.icon, 34) : "") + "<span>" + esc(b.name) + "</span></button>";
      }).join("") + "</div></div>") : "";
      if (scenesHtml && r.quick) out.push(scenesHtml);   // Outside: colours right under the on/off
      if (r.quick) {   // Outside: each light as an on/off button
        out.push('<div class="card"><div class="label">Each light</div><div class="eachgrid">' + lights.map((l) => {
          var lon = this._on(l.entity);
          return '<button class="each' + (lon ? " on" : "") + '" data-toggle="' + esc(l.entity) + '" data-full="1">' + (l.icon ? icon(l.icon, 30) : "") + "<span><b>" + esc(l.name) + "</b><i>" + (lon ? "On" : "Off") + "</i></span></button>";
        }).join("") + "</div></div>");
      } else
      lights.forEach((l) => { var s = this._s(l.entity); out.push(this._lightCard(l.name || (s ? s.attributes.friendly_name : l.entity), l.icon || (s && s.attributes.icon) || "mdi:lightbulb", [l.entity], false, l.controls)); });

      if (scenesHtml && !r.quick) out.push(scenesHtml);
      var ni = (this._config.noise || []).findIndex(function (n) { return n.name === r.noise; });
      if (ni >= 0) out.push(this._noiseCard(this._config.noise[ni], ni, "Hatch").replace('class="card noise', 'class="card noise inroom'));
      return '<div class="page">' + this._head(r.name, "lights") + '<div class="scroll"><div class="stack">' + out.join("") + "</div></div></div>";
    }
    _lightCard(name, ic, ids, whole, controls, full) {   // controls: which of "bri", "ct", "color" to show (all by default)
      var on = this._onCount(ids), bri = this._bri(ids), glow = this._glow(ids), key = esc(ids.join(","));
      var state = on ? "On" : "Off";
      var h = '<div class="card light' + (whole ? " whole" : "") + (on ? " lit" : "") + '"' + (glow ? ' style="--glow:' + glow + '"' : "") + ">" +
        '<div class="row"><button class="ic" data-toggle="' + key + '"' + (full ? ' data-full="1"' : "") + ' aria-label="Turn ' + esc(name) + ' on or off">' + icon(ic, 40) + "</button>" +
        '<button class="words" data-toggle="' + key + '"' + (full ? ' data-full="1"' : "") + "><b>" + esc(name) + "</b><i>" + esc(state) + "</i></button>" +
        (controls && !controls.length && !whole ? '<button class="pill lpill' + (on ? " on" : "") + '" data-toggle="' + key + '"' + (full ? ' data-full="1"' : "") + ">" + (on ? "On" : "Off") + "</button>" : "") + "</div>";
      // the family keeps bulbs at their warmest: no warm-to-cool unless a light asks for "ct"
      var ct = this._supportsCt(ids) && !!controls && controls.indexOf("ct") >= 0, col = this._supportsColor(ids) && this._has(controls, "color");
      if (this._dimmable(ids) && controls && controls.indexOf("levels") >= 0) h += '<div class="label">Brightness</div>' + this._levels(ids, on, bri);
      else if (this._dimmable(ids) && this._has(controls, "bri")) h += '<div class="label">Brightness</div>' + this._slider("bri", ids, bri);
      if (ct) h += '<div class="label">Warm to cool</div>' + this._slider("ct", ids, on ? this._temp(ids) : 35);
      if (col) h += '<div class="label">Color</div><div class="swatches">' + SWATCHES.map(function (c, i) {
        return '<button class="sw" data-swatch="' + i + '" data-ids="' + key + '" aria-label="' + c.name + '" style="--c1:' + c.c[0] + ";--c2:" + c.c[1] + '"></button>';
      }).join("") + "</div>";
      else if (ct) h += '<div class="swatches">' + CT_SWATCHES.map(function (c, i) {
        return '<button class="sw wide" data-ctswatch="' + i + '" data-ids="' + key + '" style="--c1:' + c.c[0] + ";--c2:" + c.c[1] + '"><span>' + c.name + "</span></button>";
      }).join("") + "</div>";
      return h + "</div>";
    }
    _slider(kind, ids, val, label, ic, style) {   // ic: an icon in the bar instead of words (no numbers on the bar)
      var showVal = !ic && label;
      return '<div class="sl ' + kind + (ic ? " withic" : "") + '" data-sl="' + kind + '" data-ids="' + esc(ids.join(",")) + '" data-v="' + val + '"' + (label ? ' data-label="' + esc(label) + '"' : "") + (style ? ' style="' + style + '"' : "") + ">" +
        '<div class="fill" style="width:' + (kind === "ct" ? 100 : val) + '%"></div><div class="knob" style="left:' + val + '%"></div>' +
        (ic ? '<span class="sic">' + icon(ic, 28) + "</span>" : "") +
        (showVal ? '<span class="val">' + this._valText(kind, val, label) + "</span>" : "") + "</div>";
    }
    _valText(kind, v, label) {
      var t = kind === "bri" || kind === "hbri" ? (v ? v + "%" : "Off") : v + "%";
      return label ? label + " · " + t : t;
    }

    /* Thermostat */
    _thermoPage() {
      var s = this._s(this._config.thermostat);
      if (!s) return '<div class="page">' + this._head("Thermostat", "home") + '<div class="card">Thermostat not found.</div></div>';
      var a = s.attributes, w = this._thermoWords(), mode = s.state, p = this._pending;
      var inside = a.current_temperature != null ? Math.round(a.current_temperature) : "–";
      var setters = "";
      function setter(label, key, v, color) {
        return '<div class="setter"><button class="round" data-temp="' + key + '" data-d="-1" aria-label="Cooler">−</button>' +
          '<span class="setv"><i>' + label + '</i><b style="color:' + color + '">' + (v != null ? Math.round(v) + "°" : "–") + '</b></span>' +
          '<button class="round" data-temp="' + key + '" data-d="1" aria-label="Warmer">+</button></div>';
      }
      if (mode === "heat_cool") setters = setter("Heat to", "target_temp_low", p.target_temp_low != null ? p.target_temp_low : a.target_temp_low, C.red) + setter("Cool to", "target_temp_high", p.target_temp_high != null ? p.target_temp_high : a.target_temp_high, C.blue);
      else if (mode === "heat" || mode === "cool") setters = setter("Set to", "temperature", p.temperature != null ? p.temperature : a.temperature, mode === "heat" ? C.red : C.blue);
      var modes = [["off", "Off"], ["heat", "Heat"], ["cool", "Cool"], ["heat_cool", "Auto"]].filter(function (m) { return (a.hvac_modes || []).indexOf(m[0]) >= 0; });
      var modeColor = { heat: C.red, cool: C.blue, heat_cool: C.teal, off: "var(--ink)" };
      return '<div class="page">' + this._head("Thermostat", "home") + '<div class="scroll"><div class="stack">' +
        '<div class="card thermo"><div class="now"><span class="label">Inside now</span><span class="huge">' + inside + '°</span><span class="status" style="color:' + w.color + '">' + esc(w.line) + "</span>" +
        (a.current_humidity != null ? '<span class="sub">' + Math.round(a.current_humidity) + "% humidity</span>" : "") + "</div>" +
        '<div class="setters">' + (setters || '<span class="sub">Pick a mode to set a temperature</span>') + "</div></div>" +
        '<div class="card"><div class="label">Mode</div><div class="modes">' + modes.map(function (m) {
          var on = m[0] === mode;
          return '<button class="mode' + (on ? " on" : "") + '" data-mode="' + m[0] + '"' + (on ? ' style="background:' + modeColor[m[0]] + ";color:" + (m[0] === "off" ? "var(--bg)" : "#fff") + '"' : "") + ">" + m[1] + "</button>";
        }).join("") + "</div>" +
        ((a.fan_modes || []).length ? '<div class="label">Fan</div><div class="modes">' + a.fan_modes.slice(0, 4).map(function (f) {
          var on = f === a.fan_mode; return '<button class="mode' + (on ? " on" : "") + '" data-fan="' + esc(f) + '">' + esc(f.charAt(0).toUpperCase() + f.slice(1)) + "</button>";
        }).join("") + "</div>" : "") + "</div>" +
        "</div></div></div>";
    }
    async _drawHistory() {
      var box = this.shadowRoot.querySelector(".hist"); if (!box) return;
      var id = this._config.thermostat, now = new Date(), from = new Date(now - 24 * 3600e3);
      if (!this._histAt || now - this._histAt > 10 * 60e3) {
        try {
          var res = await this._hass.callWS({ type: "history/history_during_period", start_time: from.toISOString(), end_time: now.toISOString(), entity_ids: [id], minimal_response: false, no_attributes: false, significant_changes_only: false });
          var pts = [], last = null;
          (res[id] || []).forEach(function (h) {
            var a = h.a || last; if (h.a) last = h.a;
            var t = (h.lu || h.lc) * 1000; if (a && a.current_temperature != null) pts.push([t, a.current_temperature, h.a ? h.a.hvac_action : null]);
          });
          this._hist = pts; this._histAt = now;
        } catch (e) { this._hist = []; }
      }
      box = this.shadowRoot.querySelector(".hist"); if (!box) return;
      var pts = this._hist || [];
      if (pts.length < 2) { box.innerHTML = '<span class="sub">No history yet</span>'; return; }
      var W = 700, H = 160, t0 = +from, t1 = +now;
      var vals = pts.map(function (p) { return p[1]; }), lo = Math.floor(Math.min.apply(null, vals) - 1), hi = Math.ceil(Math.max.apply(null, vals) + 1);
      function x(t) { return clamp((t - t0) / (t1 - t0), 0, 1) * W; }
      function y(v) { return H - (v - lo) / (hi - lo) * H; }
      var d = pts.map(function (p, i) { return (i ? "L" : "M") + x(p[0]).toFixed(1) + " " + y(p[1]).toFixed(1); }).join(" ") + " L" + W + " " + y(pts[pts.length - 1][1]).toFixed(1);
      var labels = [0, 6, 12, 18].map(function (hBack) {
        var t = new Date(t1 - (24 - hBack) * 3600e3); var h = t.getHours(); return '<span style="left:' + (x(+t) / W * 100) + '%">' + ((h % 12) || 12) + (h < 12 ? "a" : "p") + "</span>";
      }).join("");
      box.innerHTML = '<div class="range"><b>' + hi + '°</b><b>' + lo + "°</b></div>" +
        '<svg viewBox="0 0 ' + W + " " + H + '" preserveAspectRatio="none"><path d="' + d + '" fill="none" stroke="' + C.red + '" stroke-width="4" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>' +
        '<div class="hours">' + labels + "</div>";
    }

    /* Garage */
    _garagePage() {
      var g = this._config.garage || {}, out = [];
      (g.doors || []).forEach((d, i) => {
        var s = this._s(d.entity), st = s ? s.state : "unavailable", open = st !== "closed";
        var action = st === "closed" ? "Open" : st === "opening" || st === "closing" ? "Stop" : "Close";
        out.push('<div class="card door' + (open ? " open" : "") + '"><span class="ic xl" style="background:' + (open ? C.amber : "var(--chip)") + ";color:" + (open ? "#fff" : C.green) + '">' + icon(open ? "mdi:garage-open-variant" : "mdi:garage-variant", 64) + "</span>" +
          '<span class="words"><b>' + esc(d.name || "Garage door") + "</b><i class=\"doorstate\">" + esc(this._doorWord(st)) + "</i></span>" +
          '<button class="pill accent" data-door="' + i + '" data-doorgo="' + action + '">' + action + "</button></div>");
      });
      if (g.light) out.push(this._lightCard("Garage light", "mdi:lightbulb", [g.light], false));
      return '<div class="page">' + this._head("Garage", "home") + '<div class="scroll"><div class="stack">' + out.join("") + "</div></div></div>";
    }

    /* White noise */
    _noisePage() {   // one screen: each bedroom's Hatch side by side (stacked on a phone)
      var out = (this._config.noise || []).map((n, i) => this._noiseCard(n, i));
      return '<div class="page noise">' + this._head("White noise", "home") + '<div class="scroll"><div class="ngrid">' + out.join("") + "</div></div></div>";
    }
    _noiseCard(n, i, title) {
        var p = this._s(n.player), playing = p && p.state === "playing";
        var h = '<div class="card noise' + (playing ? " playing" : "") + '"><div class="row"><span class="ic" style="background:' + (playing ? C.violet : "var(--chip)") + ";color:" + (playing ? "#fff" : C.violet) + '">' + icon(title ? "mdi:waveform" : n.icon || "mdi:bed", 36) + "</span>" +
          '<span class="words"><b>' + esc(title || n.name) + "</b><i>" + (playing ? "Playing" : "Off") + "</i></span></div>" +
          '<div class="nbtns">' + (n.buttons || []).map(function (b, j) {
            return '<button class="chipbtn' + (b.off ? " off" : "") + '" data-noise="' + i + "/" + j + '">' + (b.icon ? icon(b.icon, 28) : "") + "<span>" + esc(b.name) + "</span></button>";
          }).join("") + "</div><div class=\"nsl\">";
        if (n.volume) { var v = this._s(n.volume); if (v) { var mn = +v.attributes.min || 0, mx = +v.attributes.max || 100; h += this._slider("num", [n.volume], Math.round((+v.state - mn) / (mx - mn) * 100), "", "mdi:volume-high"); } }
        else if (p && p.attributes.volume_level != null) h += this._slider("mvol", [n.player], Math.round(p.attributes.volume_level * 100), "", "mdi:volume-high");
        if (n.light && this._s(n.light)) {   // the Hatch light has its own page (colour wheel and colours)
          var hl = this._hatchShown(n.light), lc = hl.rgb;
          var ls = this._s(n.light), lb = hl.on && ls.attributes.brightness ? Math.round(ls.attributes.brightness / 2.55) : hl.on ? 60 : 0;
          var ob = this._hatchBri && this._hatchBri[n.light]; if (ob && Date.now() < ob.until) lb = ob.v;
          h += '<div class="lightrow">' + this._slider("hbri", [n.light], lb, "", "", "--glow:" + (lc ? "rgb(" + lc.join(",") + ")" : "#ffb35c")) +
            '<button class="lightbtn' + (hl.on ? " on" : "") + (hl.on && lc && lc[0] * .3 + lc[1] * .59 + lc[2] * .11 > 170 ? " darkink" : "") + '" data-go="hatchlight/' + i + '"' + (hl.on && lc ? ' style="--lc:rgb(' + lc.join(",") + ')"' : "") + ' aria-label="Hatch light colours">' + icon(hl.on ? "mdi:lightbulb-on" : "mdi:lightbulb-outline", 30) + "</button></div>";
        }
        return h + "</div></div>";
    }

    /* bottom sheet (garage confirm) */
    _sheetHtml() {
      var s = this._sheet;
      return '<div class="shade" data-cancel="1"><div class="sheet"><b>' + esc(s.q) + "</b><i>" + esc(s.note || "") + '</i><div class="two"><button class="pill big2" data-cancel="1">Cancel</button><button class="pill big2 accent" data-sheetgo="1">' + esc(s.go) + "</button></div></div></div>";
    }

    /* ---------- touch ---------- */
    _wire() {
      this._wired = true;
      var root = this.shadowRoot;
      root.addEventListener("click", (e) => this._click(e));
      root.addEventListener("pointerdown", (e) => {
        this._touched = Date.now();
        var wh = e.target.closest && e.target.closest(".wheel");
        if (wh) {
          e.preventDefault(); wh.setPointerCapture(e.pointerId); this._sw = null;
          this._wdrag = { el: wh, id: wh.dataset.wheel, sent: 0 };
          this._wheelMove(e, false); return;
        }
        this._sw = e.target.closest && e.target.closest(".sl") ? null : { x: e.clientX, y: e.clientY, t: Date.now() };
        var sl = e.target.closest && e.target.closest(".sl"); if (!sl) return;
        e.preventDefault();
        sl.setPointerCapture(e.pointerId);
        this._drag = { el: sl, kind: sl.dataset.sl, ids: sl.dataset.ids.split(","), sent: 0, x0: e.clientX, moved: false };
        this._dragTo(e.clientX, false);
      });
      root.addEventListener("pointermove", (e) => { if (this._wdrag) { this._wheelMove(e, false); return; } if (this._drag) { if (Math.abs(e.clientX - this._drag.x0) > 4) this._drag.moved = true; this._dragTo(e.clientX, false); } });
      var end = (e) => { if (!this._drag) return; this._dragTo(e.clientX, true); this._drag = null; this._hold = Date.now() + 2500; };
      root.addEventListener("pointerup", (e) => {
        if (this._wdrag) { this._wheelMove(e, true); this._wdrag = null; this._hold = Date.now() + 3000; return; }
        var w = this._sw; this._sw = null;
        if (w && !this._drag) {
          var dx = e.clientX - w.x, dy = e.clientY - w.y;
          if (Math.abs(dx) > 110 && Math.abs(dx) > Math.abs(dy) * 2 && Date.now() - w.t < 900) {
            this._swiped = Date.now();
            if (this._route[0] !== "home") { this._route = ["home"]; this._sheet = null; this._sig = ""; this._render(); }
            else if (window.parent !== window) { try { window.parent.postMessage({ hb: "swipe", dir: dx < 0 ? 1 : -1 }, "*"); } catch (x) {} }
            return;
          }
        }
        end(e);
      });
      root.addEventListener("pointercancel", () => { this._drag = null; this._hold = Date.now() + 1500; });
    }
    _wheelMove(e, final) {   // show the colour under the finger; send it now and then (Hatch's cloud is slow), and on lift
      var d = this._wdrag, rgb = this._wheelAt(d.el, e.clientX, e.clientY), mk = d.el.querySelector(".wmark");
      if (!mk) { mk = document.createElement("span"); mk.className = "wmark"; d.el.appendChild(mk); }
      mk.setAttribute("style", this._wheelPos(rgb) + "background:rgb(" + rgb.join(",") + ")");
      d.rgb = rgb;
      if (final || Date.now() - d.sent > 900) { d.sent = Date.now(); this._setHatch(d.id, rgb); }
    }
    _dragTo(clientX, final) {
      if (this._drag && this._drag.kind === "hhue") {   // colour slider: the card takes the colour as the finger moves
        var rr = this._drag.el.getBoundingClientRect(), vv = Math.round(clamp((clientX - rr.left) / rr.width * 100, 0, 100));
        this._paintHatch(this._drag.ids[0], this._hueRgb(vv));
      }
      var d = this._drag, r = d.el.getBoundingClientRect();
      var v = Math.round(clamp((clientX - r.left) / r.width * 100, 0, 100));
      d.v = v;
      if (d.kind !== "ct") d.el.querySelector(".fill").style.width = v + "%";
      var t = d.el.querySelector(".val"); if (t) t.textContent = this._valText(d.kind, v, d.el.dataset.label);
      d.el.querySelector(".knob").style.left = v + "%";
      var now = Date.now();
      if (d.kind === "hbri") { if (final) this._send(d.kind, d.ids, v); return; }   // the Hatch is slow: one change, on lift
      if (final || now - d.sent > 450) { d.sent = now; this._send(d.kind, d.ids, v); }
    }
    _rgbOnly(id) { var s = this._s(id), m = s ? s.attributes.supported_color_modes || [] : []; return m.length && m.every(function (x) { return x === "rgb" || x === "rgbw" || x === "hs" || x === "xy"; }); }
    _keepColor(id) {   // a colour-only light (the Hatch) needs a colour with every change, or it goes dark
      var s = this._s(id), c = s && s.attributes.rgb_color;
      if (c && s.state === "on" && (c[0] + c[1] + c[2]) > 30) return c.slice(0, 3);
      return [255, 147, 41];   // off: start at the warmest white the Hatch can make
    }
    _lightOn(ids, extra) {   // turn_on, adding a colour for the lights that need one
      var plain = [], self = this;
      ids.forEach(function (id) {
        if (self._rgbOnly(id)) self._call("light", "turn_on", Object.assign({ entity_id: id, rgb_color: self._keepColor(id) }, extra || {}));
        else plain.push(id);
      });
      if (plain.length) this._call("light", "turn_on", Object.assign({ entity_id: plain }, extra || {}));
    }
    _send(kind, ids, v) {
      if (kind === "bri") {
        if (v <= 0) this._call("light", "turn_off", { entity_id: ids });
        else this._lightOn(ids, { brightness_pct: Math.max(1, v) });
      } else if (kind === "ct") {
        var rg = this._ctRange(ids), k = Math.round(rg[0] + (rg[1] - rg[0]) * v / 100);
        var ct = ids.filter((id) => { var s = this._s(id); return s && (s.attributes.supported_color_modes || []).indexOf("color_temp") >= 0; });
        this._call("light", "turn_on", { entity_id: ct.length ? ct : ids, color_temp_kelvin: k });
      } else if (kind === "hbri") {
        this._hatchBri = this._hatchBri || {}; this._hatchBri[ids[0]] = { v: v, until: Date.now() + 10000 };
        if (v <= 0) this._call("light", "turn_off", { entity_id: ids[0] });
        else { var hs = this._hatchShown(ids[0]); this._call("light", "turn_on", { entity_id: ids[0], rgb_color: hs.rgb || this._keepColor(ids[0]), brightness_pct: Math.max(1, v) }); }
      } else if (kind === "hhue") {
        this._setHatch(ids[0], this._hueRgb(v));
      } else if (kind === "hue") {
        var col = ids.filter((id) => { var s = this._s(id); return s && (s.attributes.supported_color_modes || []).some(function (m) { return COLOR_MODES.indexOf(m) >= 0; }); });
        this._call("light", "turn_on", { entity_id: col.length ? col : ids, hs_color: [Math.round(v * 3.6) % 360, 100] });
      } else if (kind === "mvol") {
        this._call("media_player", "volume_set", { entity_id: ids[0], volume_level: Math.round(v) / 100 });
      } else if (kind === "num") {
        var s = this._s(ids[0]), mn = +s.attributes.min || 0, mx = +s.attributes.max || 100, step = +s.attributes.step || 1;
        this._call("input_number", "set_value", { entity_id: ids[0], value: Math.round((mn + (mx - mn) * v / 100) / step) * step });
      }
    }
    _click(e) {
      if (this._swiped && Date.now() - this._swiped < 400) return;   // the end of a swipe is not a tap
      var b = e.target.closest && e.target.closest('button, [role="button"], .shade'); if (!b) return;
      this._touched = Date.now();
      var ds = b.dataset, c = this._config;
      if (ds.go) { var p = ds.go.split("/"); this._from = this._route.slice(); this._route = p.length > 1 ? [p[0], +p[1]] : [p[0]]; this._sig = ""; this._render(); return; }
      if (ds.hcolor) { this._setHatch(ds.ids, HATCH_COLORS[+ds.hcolor].rgb); return; }
      if (ds.toggle) {
        var ids = ds.toggle.split(","), anyOn = this._onCount(this._members(ids).concat(ids)) > 0;
        if (anyOn) this._call("light", "turn_off", { entity_id: ids });
        else if (ids.some((id) => { var s = this._s(id); return s && ((s.attributes.supported_color_modes || []).join() !== "onoff" || s.attributes.entity_id); })) this._warm(ids, ds.full ? { brightness_pct: 100 } : null);
        else this._call("light", "turn_on", { entity_id: ids });
        return;
      }
      if (ds.pick) { this._mp = ds.pick; this._sig = ""; this._render(); return; }
      if (ds.plist) {
        var pl = this._plists && this._plists[+ds.plist]; if (!pl || !this._mp) return;
        this._call("music_assistant", "play_media", { entity_id: this._mp, media_id: pl.uri, media_type: "playlist", enqueue: "replace" });
        return;
      }
      if (ds.mpact) { this._call("media_player", ds.mpact, { entity_id: ds.mp }); return; }
      if (ds.source) { this._call("media_player", "select_source", { entity_id: ds.mp, source: ds.source }); return; }
      if (ds.level) { this._warm(ds.ids.split(","), { brightness_pct: +ds.level }); return; }
      if (ds.alloff) { this._call("light", "turn_off", { entity_id: this._allLights() }); return; }
      if (ds.swatch || ds.ctswatch) {
        var sw = ds.ctswatch ? CT_SWATCHES[+ds.ctswatch] : SWATCHES[+ds.swatch], ids2 = ds.ids.split(",");
        if (sw.kelvin && sw.name === "Warm white") this._warm(ids2);
        else if (sw.kelvin) this._call("light", "turn_on", { entity_id: ids2, color_temp_kelvin: sw.kelvin });
        else this._call("light", "turn_on", { entity_id: ids2, rgb_color: sw.rgb });
        return;
      }
      if (ds.rbtn) { var rb = this._rooms()[ds.room != null ? +ds.room : this._route[1]].buttons[+ds.rbtn]; this._doAction(rb); return; }
      if (ds.noise) { var q = ds.noise.split("/"), nb = c.noise[+q[0]].buttons[+q[1]]; this._doAction(nb); return; }
      if (ds.mode) { this._call("climate", "set_hvac_mode", { entity_id: c.thermostat, hvac_mode: ds.mode }); return; }
      if (ds.fan) { this._call("climate", "set_fan_mode", { entity_id: c.thermostat, fan_mode: ds.fan }); return; }
      if (ds.temp) {
        var s = this._s(c.thermostat), a = s.attributes, key = ds.temp, step = a.target_temp_step || 1;
        var cur = this._pending[key] != null ? this._pending[key] : a[key];
        this._pending[key] = Math.round((cur + step * +ds.d) * 10) / 10;
        if (key === "target_temp_low" || key === "target_temp_high") {   // keep the two apart
          var low = this._pending.target_temp_low != null ? this._pending.target_temp_low : a.target_temp_low;
          var high = this._pending.target_temp_high != null ? this._pending.target_temp_high : a.target_temp_high;
          if (high - low < 3) { if (key === "target_temp_low") this._pending.target_temp_high = low + 3; else this._pending.target_temp_low = high - 3; }
        }
        this._sig = ""; this._render();
        clearTimeout(this._tempT);
        this._tempT = setTimeout(() => {
          var data = { entity_id: c.thermostat }, P = this._pending, A = this._s(c.thermostat).attributes;
          if (P.temperature != null) data.temperature = P.temperature;
          if (P.target_temp_low != null || P.target_temp_high != null) { data.target_temp_low = P.target_temp_low != null ? P.target_temp_low : A.target_temp_low; data.target_temp_high = P.target_temp_high != null ? P.target_temp_high : A.target_temp_high; }
          this._call("climate", "set_temperature", data);
          setTimeout(() => { this._pending = {}; this._sig = ""; this._maybeRender(); }, 4000);
        }, 1200);
        return;
      }
      if (ds.door) {
        var door = c.garage.doors[+ds.door], go = ds.doorgo;
        if (go === "Stop") { this._call("cover", "stop_cover", { entity_id: door.entity }); return; }
        this._sheet = { q: go + " the " + (door.name || "garage door").toLowerCase() + "?", note: "Make sure nothing is in the way.", go: go, run: () => this._call("cover", go === "Open" ? "open_cover" : "close_cover", { entity_id: door.entity }) };
        this._render(); return;
      }
      if (ds.sheetgo) { var run = this._sheet && this._sheet.run; this._sheet = null; this._render(); if (run) run(); return; }
      if (ds.cancel && (b.tagName === "BUTTON" || e.target === b)) { this._sheet = null; this._render(); return; }
    }
    _doAction(b) {
      if (!b) return;
      if (b.warm) { this._warm(b.warm, { brightness_pct: 100 }); return; }
      if (b.hatch) {   // start a Hatch sound straight from here: pick the sound, then play
        this._call("media_player", "select_sound_mode", { entity_id: b.hatch, sound_mode: b.sound || "BrownNoise" });
        setTimeout(() => this._call("media_player", "media_play", { entity_id: b.hatch }), 2000);
        return;
      }
      var sv = (b.action || b.service || "").split(".");
      var data = Object.assign({}, b.data || {});
      if (b.target) Object.assign(data, b.target);
      this._call(sv[0], sv[1], data);
    }
  }

  var CSS = `
:host { display: block; touch-action: pan-y; -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; color: var(--ink); font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", system-ui, sans-serif; -webkit-tap-highlight-color: transparent; user-select: none; }
:host([full]) { position: fixed; inset: 0; z-index: 10; background: var(--bg); }
:host(:not([full])) { position: relative; background: var(--bg); min-height: calc(100dvh - var(--header-height, 56px)); }
:host(:not([full])) .shade { position: fixed; }
* { box-sizing: border-box; }
button { font: inherit; color: inherit; border: 0; background: none; padding: 0; cursor: pointer; text-align: left; touch-action: manipulation; }
ha-icon { display: flex; }
.page { height: 100%; display: flex; flex-direction: column; padding: 20px 22px 22px; gap: 16px; }
:host(:not([full])) .page { min-height: calc(100dvh - var(--header-height, 56px)); }
.head { display: flex; align-items: center; gap: 16px; min-height: 72px; flex: none; }
.head h1 { margin: 0; flex: 1; font-size: 42px; font-weight: 800; letter-spacing: -1px; line-height: 1.1; }
.homebtn { margin-left: auto; color: var(--accent); }
.head h1 + .homebtn { margin-left: auto; }
.back { width: 72px; height: 72px; border-radius: 36px; background: var(--card); display: flex; align-items: center; justify-content: center; flex: none; }
.back:active, .big:active, .room:active, .chipbtn:active, .pill:active, .round:active, .mode:active, .sw:active { transform: scale(.97); }
.pill { border-radius: 999px; background: var(--card); font-size: 24px; font-weight: 800; padding: 20px 30px; flex: none; text-align: center; }
.pill.accent { background: var(--accent); color: var(--on-accent); }
.scroll { flex: 1; min-height: 0; overflow-y: auto; margin: 0 -22px; padding: 0 22px 24px; overscroll-behavior: contain; scrollbar-width: none; }
.scroll::-webkit-scrollbar { display: none; }
.grid2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
.grid2.fill { flex: 1; min-height: 0; grid-auto-rows: 1fr; }
.grid2.fill.odd > :last-child { grid-column: 1 / -1; }

/* Music */
.art { width: 76px; height: 76px; border-radius: 18px; object-fit: cover; flex: none; }
.transport { display: flex; justify-content: center; align-items: center; gap: 22px; }
.transport .round { display: flex; align-items: center; justify-content: center; }
.transport .round.play { width: 112px; height: 112px; border-radius: 56px; background: ${C.teal}; color: #fff; }
.card.spotify .transport .round.play { background: #1db954; }
.chips { display: flex; flex-wrap: wrap; gap: 10px; }
.chip { border-radius: 999px; background: var(--chip); padding: 16px 22px; font-size: 19px; font-weight: 800; }
.chip.on { background: ${C.teal}; color: #fff; }
.pgrid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
.pl { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.pl img, .pl .noart { width: 100%; aspect-ratio: 1; border-radius: 18px; object-fit: cover; background: var(--chip); display: flex; align-items: center; justify-content: center; color: var(--muted); }
.pl b { font-size: 17px; font-weight: 800; line-height: 1.2; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.pl:active { transform: scale(.96); }
.stack { display: flex; flex-direction: column; gap: 18px; }

/* Home */
.big { cursor: pointer; background: var(--card); border-radius: 32px; padding: 32px; display: flex; flex-direction: column; justify-content: space-between; align-items: flex-start; position: relative; min-height: 260px; transition: transform .12s; }
.big .ic { width: 112px; height: 112px; border-radius: 56px; display: flex; align-items: center; justify-content: center; }
.big .words { flex: none; display: flex; flex-direction: column; gap: 6px; }
.big b { font-size: 40px; font-weight: 800; letter-spacing: -.5px; line-height: 1.1; }
.big i { font-style: normal; font-size: 25px; font-weight: 700; color: var(--muted); }
.big.warn i { color: ${C.amber}; }
.bignum { position: absolute; top: 34px; right: 32px; font-size: 64px; font-weight: 800; letter-spacing: -2px; line-height: 1; }

/* rows of icon + words */
.row { display: flex; align-items: center; gap: 16px; }
.ic { width: 76px; height: 76px; border-radius: 38px; display: flex; align-items: center; justify-content: center; flex: none; background: var(--chip); color: var(--muted); transition: background .2s, color .2s; }
.ic.sm { width: 68px; height: 68px; }
.ic.xl { width: 128px; height: 128px; border-radius: 64px; }
.lit .ic { background: var(--glow, #f2b25c); color: #fff; }
.words { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.words b { font-size: 28px; font-weight: 800; line-height: 1.15; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.words i { font-style: normal; font-size: 21px; font-weight: 700; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.more { width: 56px; height: 68px; display: flex; align-items: center; justify-content: flex-end; color: var(--muted); flex: none; }

/* Lights */
.room { background: var(--card); border-radius: 28px; padding: 20px; display: flex; flex-direction: column; gap: 16px; }

/* Lights page: three rooms a row, the kids' rooms two a row, Outside across */
.lgrid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 14px; }
.lgrid .room { grid-column: span 2; padding: 20px; gap: 18px; border-radius: 26px; }
.lgrid .room.guard { grid-column: span 3; flex-direction: row; align-items: center; gap: 14px; text-align: left; }
.lgrid .room.inline { grid-column: 1 / -1; }
.lgrid .room.quick { grid-column: 1 / -1; flex-direction: row; align-items: center; gap: 18px; }
.lgrid .room.quick .row { flex: 1; min-width: 0; flex-direction: row !important; align-items: center !important; gap: 16px !important; }
.lgrid .room.quick .levels { flex: none; display: flex; width: auto; }
.lgrid .room.quick .levels { width: calc((100% + 12px) / 3 - 40px); }
.lgrid .room.quick .lvl { width: 100%; }
/* stretch to fill the screen: rows share the spare height, cards centre their contents */
.page.lights .scroll { display: flex; flex-direction: column; }
.page.lights .lgrid { flex: 1; align-content: stretch; }
.lgrid .room { justify-content: center; }
.lgrid .room.inline { justify-content: space-evenly; }
.lgrid .ic.sm { width: 68px; height: 68px; }
.lgrid .words b { font-size: 26px; white-space: normal; }
.lgrid .words i { font-size: 18px; white-space: normal; }
.lgrid .room:not(.guard):not(.inline) .row { flex-direction: column; align-items: flex-start; gap: 10px; }
.lgrid .room:not(.guard):not(.inline) .words { width: 100%; }
.lgrid .more { width: 30px; height: 56px; }
.lpill { display: flex; align-items: center; gap: 8px; padding: 18px 26px; font-size: 21px; background: var(--chip); }
.lpill.on { background: #f2b25c; color: #3a2410; }
.levels { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.lvl { height: 76px; border-radius: 20px; background: var(--chip); font-size: 24px; font-weight: 800; text-align: center; }
.lvl.on { background: var(--glow, #f2b25c); color: #3a2410; }
.lvl:active, .dot:active, .lpill:active { transform: scale(.95); }
.dots { display: flex; gap: 10px; flex-wrap: wrap; justify-content: space-between; }
.dot { display: flex; flex-direction: column; align-items: center; gap: 6px; width: 84px; }
.dot .sw { width: 80px; height: 80px; border-radius: 40px; }
.dot i { font-style: normal; font-size: 15px; font-weight: 800; color: var(--muted); white-space: nowrap; }

/* cards */
.card { background: var(--card); border-radius: 30px; padding: 24px; display: flex; flex-direction: column; gap: 14px; }
.card.whole { border: 3px solid color-mix(in srgb, var(--ink) 10%, transparent); }
.label { font-size: 17px; font-weight: 800; color: var(--muted); text-transform: uppercase; letter-spacing: .6px; margin-top: 4px; }
.sub { font-size: 20px; font-weight: 700; color: var(--muted); }

/* sliders: 72px tall, drag anywhere */
.sl { position: relative; height: 72px; border-radius: 22px; background: var(--chip); overflow: hidden; touch-action: none; cursor: pointer; }
.sl .fill { position: absolute; inset: 0 auto 0 0; background: var(--glow, #f2b25c); border-radius: 22px 0 0 22px; }
.sl.bri .fill { background: linear-gradient(90deg, color-mix(in srgb, var(--glow, #f2b25c) 70%, var(--chip)), var(--glow, #f2b25c)); }
.sl.num .fill, .sl.mvol .fill { background: ${C.violet}; }
.sl.mvol .knob { margin-left: -18px; }
.sl[data-label] .val { left: auto; right: 18px; }
.sl.ct { background: linear-gradient(90deg, #ff9d3d, #ffe6c2 45%, #f4f7ff 70%, #bcd6ff); }
.sl.ct .fill, .sl.hue .fill { display: none; }
.sl.hhue .fill { display: none; }
.sl.hbri { height: 84px; border-radius: 26px; }
.sl.hbri .fill { background: var(--glow, #f2b25c); border-radius: 26px 0 0 26px; transition: background .2s; }
.sl.hbri .knob { margin-left: -18px; }
.sl.hhue { background: linear-gradient(90deg, #f00, #ff8000, #ff0, #0f0, #0ff, #00f, #8000ff, #f0f, #f00); }
.sl.hue { background: linear-gradient(90deg, #ff3b30, #ff9500, #ffd60a, #34c759, #00c7be, #0a84ff, #5e5ce6, #bf5af2, #ff2d55, #ff3b30); }
.sl .knob { position: absolute; top: 12px; bottom: 12px; width: 10px; margin-left: -5px; border-radius: 5px; background: #fff; box-shadow: 0 1px 6px rgba(0,0,0,.35); }
.sl.bri .knob, .sl.num .knob { margin-left: -18px; }
.sl .val { position: absolute; left: 20px; top: 0; bottom: 0; display: flex; align-items: center; font-size: 22px; font-weight: 800; color: var(--ink); mix-blend-mode: normal; pointer-events: none; }
.swatches { display: flex; gap: 12px; flex-wrap: wrap; }
.sw { width: 64px; height: 64px; border-radius: 32px; flex: none; border: 0;
  background: radial-gradient(120% 120% at 25% 15%, color-mix(in srgb, var(--c1) 70%, #fff) 0%, var(--c1) 40%, var(--c2) 100%);
  box-shadow: 0 6px 16px -6px color-mix(in srgb, var(--c1) 80%, transparent), inset 0 1px 0 rgba(255,255,255,.4); }
.sw.wide { width: auto; flex: 1; border-radius: 22px; height: 64px; display: flex; align-items: center; justify-content: center; font-size: 21px; font-weight: 800; color: #2b2e33; }

/* buttons in a row */
.btns { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 12px; }
.chipbtn { min-height: 80px; border-radius: 24px; background: var(--chip); display: flex; align-items: center; gap: 10px; padding: 12px 18px; font-size: 22px; font-weight: 800; }
.chipbtn ha-icon { color: ${C.violet}; }
.chipbtn.off ha-icon { color: var(--muted); }

/* White noise: three Hatches side by side, filling the screen */
.page.noise .scroll { display: flex; flex-direction: column; }
.ngrid { flex: 1; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.card.noise { justify-content: space-evenly; gap: 16px; }
.card.noise .words b { white-space: normal; }
.nbtns { display: grid; grid-template-columns: 1fr; gap: 10px; }
.nbtns .chipbtn { min-height: 72px; }
.nsl { display: flex; flex-direction: column; gap: 12px; }
.card.noise.inroom .nbtns { grid-template-columns: 1fr 1fr; }
.card.noise.inroom .nsl { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.eachgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
.each { display: flex; align-items: center; gap: 12px; min-height: 76px; padding: 12px 16px; border-radius: 20px; background: var(--chip); }
.each span { display: flex; flex-direction: column; min-width: 0; }
.each b { font-size: 20px; font-weight: 800; }
.each i { font-style: normal; font-size: 16px; font-weight: 700; color: var(--muted); }
.each ha-icon { color: var(--muted); }
.each.on { background: #f2b25c; color: #3a2410; }
.each.on i, .each.on ha-icon { color: #3a2410; }
.each:active { transform: scale(.96); }
/* on/off switch */
.switch { width: 96px; height: 56px; border-radius: 28px; background: var(--chip); position: relative; flex: none; transition: background .2s; }
.switch span { position: absolute; top: 6px; left: 6px; width: 44px; height: 44px; border-radius: 22px; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,.25); transition: left .2s; }
.switch.on { background: #f2b25c; }
.switch.on span { left: 46px; }
/* simple page (Outside) */
.card.simple { gap: 28px; padding: 28px; }
.levels.t3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.lvl.tog { height: auto; min-height: 112px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; }
.lvl.tog i { font-style: normal; font-size: 16px; font-weight: 700; opacity: .7; }
.dots.big { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 26px 12px; justify-items: center; }
.dots.big .dot { width: auto; }
.dots.big .sw { width: 104px; height: 104px; border-radius: 52px; }

/* Hatch light: button on the noise cards, and its page */
.lightbtn { display: flex; align-items: center; gap: 12px; min-height: 64px; padding: 0 18px; border-radius: 20px; background: var(--chip); font-size: 20px; font-weight: 800; }
.lightbtn { justify-content: center; }
.lightrow { display: flex; gap: 10px; align-items: stretch; }
.lightrow .sl { flex: 1; min-width: 0; height: auto; min-height: 64px; border-radius: 20px; }
.lightrow .lightbtn { width: 64px; padding: 0; flex: none; }
.sl .sic { position: absolute; left: 16px; top: 0; bottom: 0; display: flex; align-items: center; color: var(--ink); pointer-events: none; }
.sl.withic.num .sic, .sl.withic.mvol .sic { color: #fff; }
.lightbtn.on { background: var(--lc, #f2b25c); color: #fff; box-shadow: 0 6px 18px -6px var(--lc, transparent); }
.lightbtn.on ha-icon { color: #fff; }
.lightbtn.on.darkink { color: #2b2230; }
.lightbtn.on.darkink ha-icon { color: rgba(0,0,0,.5); }
.lightbtn .dotc { width: 26px; height: 26px; border-radius: 13px; background: var(--lc, color-mix(in srgb, var(--ink) 18%, transparent)); box-shadow: 0 0 12px var(--lc, transparent); flex: none; }
.lightbtn ha-icon { color: var(--ink); }
.wheelwrap { display: flex; justify-content: center; padding: 6px 0 4px; }
.wheel { position: relative; width: min(100%, 440px); aspect-ratio: 1; border-radius: 50%; touch-action: none; cursor: crosshair;
  background: radial-gradient(circle closest-side, #fff 0%, rgba(255,255,255,0) 100%), conic-gradient(from 0deg, #f00, #ff0 60deg, #0f0 120deg, #0ff 180deg, #00f 240deg, #f0f 300deg, #f00);
  box-shadow: 0 10px 30px -12px rgba(0,0,0,.35); }
.wmark { position: absolute; width: 44px; height: 44px; margin: -22px 0 0 -22px; border-radius: 50%; border: 4px solid #fff; box-shadow: 0 2px 10px rgba(0,0,0,.4); pointer-events: none; }
.swatches.hatch { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 16px 10px; justify-items: center; }
.swatches.hatch .sw { width: 76px; height: 76px; border-radius: 38px; }

/* scene tiles */
.scenes { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
.scene { min-height: 120px; border-radius: 24px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between; align-items: flex-start;
  background: radial-gradient(120% 120% at 20% 10%, color-mix(in srgb, var(--c1) 70%, #fff) 0%, var(--c1) 40%, var(--c2) 100%);
  color: #fff; font-size: 21px; font-weight: 800; text-shadow: 0 1px 6px rgba(0,0,0,.25);
  box-shadow: 0 8px 22px -6px color-mix(in srgb, var(--c1) 70%, transparent), inset 0 1px 0 rgba(255,255,255,.35); transition: transform .12s; }
.scene.darktext { color: #3a2410; text-shadow: none; }
.scene:active { transform: scale(.95); }

/* Thermostat */
.thermo { flex-direction: row; align-items: center; gap: 20px; flex-wrap: wrap; }
.now { flex: 1; min-width: 220px; display: flex; flex-direction: column; gap: 4px; }
.huge { font-size: 96px; font-weight: 800; letter-spacing: -4px; line-height: 1; }
.status { font-size: 25px; font-weight: 800; }
.setters { display: flex; flex-direction: column; gap: 14px; }
.setter { display: flex; align-items: center; gap: 12px; }
.round { width: 92px; height: 92px; border-radius: 46px; background: var(--chip); font-size: 50px; font-weight: 800; line-height: 1; text-align: center; }
.setv { width: 130px; display: flex; flex-direction: column; align-items: center; }
.setv i { font-style: normal; font-size: 17px; font-weight: 800; color: var(--muted); text-transform: uppercase; letter-spacing: .5px; }
.setv b { font-size: 60px; font-weight: 800; letter-spacing: -2px; line-height: 1; }
.modes { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.mode { border-radius: 999px; background: var(--chip); font-size: 24px; font-weight: 800; padding: 22px 0; text-align: center; }
.mode.on { background: var(--ink); color: var(--bg); }
.hist { position: relative; height: 210px; padding-left: 56px; }
.hist svg { width: 100%; height: 160px; display: block; }
.hist .range { position: absolute; left: 0; top: 0; height: 160px; display: flex; flex-direction: column; justify-content: space-between; font-size: 18px; color: var(--muted); }
.hours { position: relative; height: 40px; }
.hours span { position: absolute; top: 12px; transform: translateX(-50%); font-size: 17px; font-weight: 700; color: var(--muted); }

/* Garage */
.door { flex-direction: row; align-items: center; gap: 24px; padding: 30px; }
.door .doorstate { font-size: 40px; color: ${C.green}; }
.door.open .doorstate { color: ${C.amber}; }

/* sheet */
.shade { position: absolute; inset: 0; background: rgba(0,0,0,.5); display: flex; align-items: flex-end; z-index: 5; animation: fade .15s; }
.sheet { width: 100%; background: var(--card); border-radius: 34px 34px 0 0; padding: 38px 32px 44px; display: flex; flex-direction: column; gap: 14px; animation: up .2s ease-out; }
.sheet b { font-size: 36px; font-weight: 800; }
.sheet i { font-style: normal; font-size: 22px; font-weight: 600; color: var(--muted); }
.two { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 10px; }
.big2 { padding: 28px 0; border-radius: 24px; background: var(--chip); }
@keyframes up { from { transform: translateY(100%); } }

/* a phone held sideways: Home Board is upright only */
.turn { display: none; }
@media (orientation: landscape) and (max-height: 500px) and (pointer: coarse) {
  .turn { display: flex; position: fixed; inset: 0; z-index: 50; background: var(--bg); color: var(--ink); flex-direction: column; align-items: center; justify-content: center; gap: 14px; font-size: 20px; font-weight: 800; }
  .turn ha-icon { --mdc-icon-size: 64px; color: var(--accent); }
}

/* phones: the same look at normal phone sizes */
:host([narrow]) .page { padding: 10px 12px 16px; gap: 10px; }
:host([narrow]) .scroll { margin: 0 -12px; padding: 0 12px 16px; }
:host(:not([full])[narrow]) .page { min-height: 0; }
:host(:not([full])[narrow]) { min-height: 0; }
:host([narrow]) .head { min-height: 44px; gap: 10px; }
:host([narrow]) .head h1 { font-size: 24px; letter-spacing: -.4px; }
:host([narrow]) .back { width: 40px; height: 40px; }
:host([narrow]) .back ha-icon { --mdc-icon-size: 28px !important; }
:host([narrow]) .pill { font-size: 15px; padding: 10px 16px; }
:host([narrow]) .grid2 { gap: 10px; }
:host([narrow]) .grid2.fill { flex: none; grid-auto-rows: 132px; }
:host([narrow]) .grid2:not(.fill) { grid-template-columns: 1fr; }
:host([narrow]) .big { padding: 14px; border-radius: 20px; min-height: 0; }
:host([narrow]) .big .ic { width: 46px; height: 46px; }
:host([narrow]) .big .ic ha-icon { --mdc-icon-size: 26px !important; }
:host([narrow]) .big b { font-size: 18px; }
:host([narrow]) .big i { font-size: 13px; }
:host([narrow]) .bignum { top: 14px; right: 14px; font-size: 28px; letter-spacing: -1px; }
:host([narrow]) .room { padding: 12px; gap: 10px; border-radius: 20px; }
:host([narrow]) .card { padding: 14px; gap: 8px; border-radius: 20px; }
:host([narrow]) .stack { gap: 10px; }
:host([narrow]) .row { gap: 10px; }
:host([narrow]) .ic, :host([narrow]) .ic.sm { width: 40px; height: 40px; }
:host([narrow]) .ic ha-icon { --mdc-icon-size: 22px !important; }
:host([narrow]) .ic.xl { width: 60px; height: 60px; }
:host([narrow]) .ic.xl ha-icon { --mdc-icon-size: 32px !important; }
:host([narrow]) .words b { font-size: 16px; }
:host([narrow]) .words i { font-size: 13px; }
:host([narrow]) .more { width: 24px; height: 40px; }
:host([narrow]) .more ha-icon { --mdc-icon-size: 24px !important; }
:host([narrow]) .ngrid { grid-template-columns: 1fr; gap: 10px; }
:host([narrow]) .card.noise { gap: 8px; padding: 12px; }
:host([narrow]) .card.noise .row { gap: 10px; }
:host([narrow]) .nbtns { grid-template-columns: 1fr 1fr; gap: 8px; }
:host([narrow]) .nbtns .chipbtn { min-height: 42px; }
:host([narrow]) .nsl { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
:host([narrow]) .sl.mvol .knob { margin-left: -12px; }
:host([narrow]) .sl[data-label] .val { left: auto; right: 12px; }
:host(:not([full])[narrow]) .page.noise { min-height: calc(100dvh - var(--header-height, 56px)); }
:host([narrow]) .eachgrid { grid-template-columns: 1fr 1fr; gap: 8px; }
:host([narrow]) .each { min-height: 52px; padding: 8px 10px; gap: 8px; border-radius: 14px; }
:host([narrow]) .each b { font-size: 14px; }
:host([narrow]) .each i { font-size: 12px; }
:host([narrow]) .each ha-icon { --mdc-icon-size: 22px !important; }
:host([narrow]) .homebtn ha-icon { --mdc-icon-size: 26px !important; }
:host([narrow]) .card.simple { gap: 18px; padding: 16px; }
:host([narrow]) .lvl.tog { min-height: 72px; font-size: 15px; }
:host([narrow]) .lvl.tog ha-icon { --mdc-icon-size: 22px !important; }
:host([narrow]) .lvl.tog i { font-size: 12px; }
:host([narrow]) .dots.big { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px 8px; }
:host([narrow]) .dots.big .sw { width: 60px; height: 60px; }
:host([narrow]) .switch { width: 60px; height: 36px; border-radius: 18px; }
:host([narrow]) .switch span { top: 4px; left: 4px; width: 28px; height: 28px; border-radius: 14px; }
:host([narrow]) .switch.on span { left: 28px; }
:host([narrow]) .art { width: 52px; height: 52px; border-radius: 12px; }
:host([narrow]) .transport { gap: 14px; }
:host([narrow]) .transport .round.play { width: 68px; height: 68px; }
:host([narrow]) .transport ha-icon { --mdc-icon-size: 28px !important; }
:host([narrow]) .pgrid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
:host([narrow]) .pl b { font-size: 13px; }
:host([narrow]) .pl img, :host([narrow]) .pl .noart { border-radius: 12px; }
:host([narrow]) .chip { padding: 10px 14px; font-size: 14px; }
:host([narrow]) .lightbtn { min-height: 44px; font-size: 15px; padding: 0 12px; border-radius: 14px; gap: 8px; }
:host([narrow]) .lightrow .sl { min-height: 44px; border-radius: 14px; }
:host([narrow]) .lightrow .lightbtn { width: 44px; }
:host([narrow]) .sl .sic { left: 10px; }
:host([narrow]) .sl .sic ha-icon { --mdc-icon-size: 22px !important; }
:host([narrow]) .lightbtn .dotc { width: 18px; height: 18px; }
:host([narrow]) .wheel { width: min(100%, 270px); }
:host([narrow]) .wmark { width: 32px; height: 32px; margin: -16px 0 0 -16px; border-width: 3px; }
:host([narrow]) .swatches.hatch .sw { width: 48px; height: 48px; }
:host([narrow]) .lpill { padding: 10px 14px; font-size: 14px; gap: 6px; }
:host([narrow]) .lpill ha-icon { --mdc-icon-size: 20px !important; }
:host([narrow]) .levels { gap: 6px; }
:host([narrow]) .lgrid { gap: 8px; }
:host([narrow]) .lgrid .room { grid-column: 1 / -1; padding: 10px 12px; gap: 10px; border-radius: 18px; }
:host([narrow]) .lgrid .room:not(.guard):not(.inline) { flex-direction: row; align-items: center; }
:host([narrow]) .lgrid .room:not(.guard):not(.inline) .row { flex: 1; min-width: 0; flex-direction: row; align-items: center; gap: 10px; }
:host([narrow]) .lgrid .room:not(.guard):not(.inline) .levels { flex: none; width: 132px; }
:host([narrow]) .lgrid .room.quick .levels { width: 132px; }
:host([narrow]) .lgrid .room.quick .lvl { width: 100%; font-size: 15px; }
:host([narrow]) .lgrid .room.quick .lvl { font-size: 13px; }
:host(:not([full])[narrow]) .page.lights { min-height: calc(100dvh - var(--header-height, 56px)); }
:host([narrow]) .lgrid .room.guard { grid-column: span 3; padding: 10px; gap: 8px; }
:host([narrow]) .lgrid .ic.sm { width: 40px; height: 40px; }
:host([narrow]) .lgrid .words b { font-size: 16px; }
:host([narrow]) .lgrid .words i { font-size: 13px; }
:host([narrow]) .lgrid .more { width: 18px; height: 40px; }
:host([narrow]) .lvl { height: 40px; border-radius: 12px; font-size: 15px; }
:host([narrow]) .dots { display: flex; flex-wrap: nowrap; justify-content: space-between; gap: 4px; }
:host([narrow]) .dot { width: auto; gap: 4px; }
:host([narrow]) .dot .sw { width: 36px; height: 36px; }
:host([narrow]) .dot i { font-size: 11px; }
:host([narrow]) .label { font-size: 11px; margin-top: 2px; }
:host([narrow]) .sub { font-size: 14px; }
:host([narrow]) .sl { height: 44px; border-radius: 14px; }
:host([narrow]) .sl .fill { border-radius: 14px 0 0 14px; }
:host([narrow]) .sl .knob { top: 8px; bottom: 8px; width: 6px; margin-left: -3px; }
:host([narrow]) .sl.bri .knob, :host([narrow]) .sl.num .knob { margin-left: -12px; }
:host([narrow]) .sl .val { font-size: 14px; left: 12px; }
:host([narrow]) .sw { width: 34px; height: 34px; border-width: 2px; }
:host([narrow]) .sw.wide { height: 40px; font-size: 14px; border-radius: 14px; }
:host([narrow]) .swatches { gap: 8px; }
:host([narrow]) .btns { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
:host([narrow]) .chipbtn { min-height: 46px; font-size: 14px; border-radius: 14px; padding: 8px 12px; gap: 8px; }
:host([narrow]) .chipbtn ha-icon { --mdc-icon-size: 20px !important; }
:host([narrow]) .scenes { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
:host([narrow]) .scene { min-height: 64px; border-radius: 16px; padding: 10px 12px; font-size: 15px; gap: 8px; }
:host([narrow]) .scene ha-icon { --mdc-icon-size: 24px !important; }
:host([narrow]) .thermo { flex-direction: column; align-items: stretch; gap: 12px; }
:host([narrow]) .now { min-width: 0; }
:host([narrow]) .huge { font-size: 52px; letter-spacing: -2px; }
:host([narrow]) .status { font-size: 15px; }
:host([narrow]) .setters { gap: 8px; }
:host([narrow]) .setter { justify-content: space-between; }
:host([narrow]) .round { width: 52px; height: 52px; font-size: 30px; }
:host([narrow]) .setv { width: 100px; }
:host([narrow]) .setv i { font-size: 11px; }
:host([narrow]) .setv b { font-size: 34px; }
:host([narrow]) .mode { font-size: 14px; padding: 12px 0; }
:host([narrow]) .modes { gap: 6px; }
:host([narrow]) .hist { padding-left: 34px; height: 140px; }
:host([narrow]) .hist svg, :host([narrow]) .hist .range { height: 100px; }
:host([narrow]) .hist .range { font-size: 13px; }
:host([narrow]) .hours span { font-size: 12px; top: 8px; }
:host([narrow]) .door { padding: 14px; gap: 12px; flex-wrap: wrap; }
:host([narrow]) .door .doorstate { font-size: 22px; }
:host([narrow]) .door .pill { flex-basis: 100%; padding: 14px 0; }
:host([narrow]) .sheet { padding: 22px 18px 28px; gap: 10px; }
:host([narrow]) .sheet b { font-size: 21px; }
:host([narrow]) .sheet i { font-size: 15px; }
:host([narrow]) .big2 { padding: 16px 0; font-size: 17px; border-radius: 16px; }
@keyframes fade { from { opacity: 0; } }
`;

  if (!customElements.get("homeboard-wall")) customElements.define("homeboard-wall", HomeBoardWall);
  window.customCards = window.customCards || [];
  if (!window.customCards.some(function (c) { return c.type === "homeboard-wall"; }))
    window.customCards.push({ type: "homeboard-wall", name: "Home Board wall", description: "The Kildow wall panel in the Home Board look (v" + VERSION + ")" });
})();
