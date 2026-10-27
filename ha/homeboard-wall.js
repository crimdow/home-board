/* Home Board wall card for Home Assistant (custom:homeboard-wall).
   One card draws the whole wall: Home, Lights, each room, Thermostat, Garage and White noise,
   in the Home Board look (big round icons, heavy type, solid pills, sheets from the bottom).
   Colours: Home Board sends its own (skin, light or dark) to this page when it shows Home Assistant
   inside the wall panel; on its own it uses the Classic Home Board colours.
   Lives at /config/www/homeboard-wall.js and is loaded as the dashboard resource /local/homeboard-wall.js?v=N. */
(function () {
  "use strict";
  var VERSION = "1.6.3";
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

    set hass(hass) {
      var themeChanged = this._hass && hass.themes !== this._hass.themes;
      this._hass = hass;
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
      return ids;
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
      else body = this._homePage();
      var scroller = this.shadowRoot.querySelector(".scroll"), top = scroller && this._lastRoute === r.join("/") ? scroller.scrollTop : 0;
      this.shadowRoot.innerHTML = "<style>" + CSS + "</style>" + body + (this._sheet ? this._sheetHtml() : "");
      this._lastRoute = r.join("/");
      var sc = this.shadowRoot.querySelector(".scroll"); if (sc) sc.scrollTop = top;
      if (r[0] === "thermostat") this._drawHistory();
    }

    _head(title, back, right) {
      return '<div class="head">' +
        (back ? '<button class="back" data-go="' + back + '" aria-label="Back">' + icon("mdi:chevron-left", 44) + "</button>" : "") +
        '<h1>' + esc(title) + "</h1>" + (right || "") + "</div>";
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
      return '<div class="page home">' + this._head(c.title || "Home") + '<div class="grid2 fill">' + tiles.join("") + "</div></div>";
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
        var state = on ? (this._dimmable(main) && this._bri(main) ? bri + "%" : "On") + (ids.length > 1 && on < ids.length ? " · " + on + " of " + ids.length + " on" : "") : "Off";
        var nav = r.inline ? "" : ' data-go="room/' + i + '"';
        if (r.guard) {   // kids' rooms: no switches here, so nobody turns them on by accident at night
          return '<button class="room guard' + (on ? " lit" : "") + '"' + nav + (glow ? ' style="--glow:' + glow + '"' : "") + ">" +
            '<span class="ic sm">' + icon(r.icon || "mdi:lightbulb", 30) + "</span>" +
            '<span class="words"><b>' + esc(r.name) + "</b><i>" + esc(state) + "</i></span>" +
            '<span class="more">' + icon("mdi:chevron-right", 30) + "</span></button>";
        }
        var h = '<div class="room' + (on ? " lit" : "") + (r.inline ? " inline" : "") + '"' + (glow ? ' style="--glow:' + glow + '"' : "") + ">" +
          '<div class="row"><button class="ic sm" data-toggle="' + esc(main.join(",")) + '" aria-label="Turn ' + esc(r.name) + ' on or off">' + icon(r.icon || "mdi:lightbulb", 34) + "</button>" +
          '<button class="words"' + (r.inline ? ' data-toggle="' + esc(main.join(",")) + '"' : nav) + "><b>" + esc(r.inline && r.whole_name ? r.whole_name : r.name) + "</b><i>" + esc(state) + "</i></button>" +
          (r.inline ? this._roomLights(r).map((l) => {   // extra lights (Flood lights) as on/off pills
            var lon = this._on(l.entity);
            return '<button class="pill lpill' + (lon ? " on" : "") + '" data-toggle="' + esc(l.entity) + '">' + (l.icon ? icon(l.icon, 26) : "") + "<span>" + esc(l.name) + "</span></button>";
          }).join("") : '<button class="more"' + nav + ' aria-label="Open ' + esc(r.name) + '">' + icon("mdi:chevron-right", 34) + "</button>") + "</div>";
        if (r.inline && (r.buttons || []).length) {   // colour buttons right on the Lights page
          h += '<div class="dots">' + r.buttons.map(function (b, k) {
            var c = b.colors || [b.color || "#8a6bb8", b.color || "#5b3f99"];
            return '<button class="dot" data-rbtn="' + k + '" data-room="' + i + '" aria-label="' + esc(b.name) + '"><span class="sw" style="--c1:' + c[0] + ";--c2:" + c[1] + '"></span></button>';
          }).join("") + "</div>";
        } else if (this._dimmable(main) && this._has(r.controls, "bri")) {   // quick levels, always in warm white
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
    _warm(ids, extra) {   // turn lights on at their warmest white (lights without whites just get the brightness)
      var ct = [], rest = [];
      ids.forEach((id) => { var s = this._s(id); ((s && (s.attributes.supported_color_modes || []).indexOf("color_temp") >= 0) ? ct : rest).push(id); });
      if (ct.length) this._call("light", "turn_on", Object.assign({ entity_id: ct, color_temp_kelvin: this._ctRange(ct)[0] }, extra || {}));
      if (rest.length) this._call("light", "turn_on", Object.assign({ entity_id: rest }, extra || {}));
    }

    /* A room: the whole room on top, then each light */
    _roomPage(r) {
      if (!r) { this._route = ["lights"]; return this._lightsPage(); }
      var lights = this._roomLights(r), main = this._roomMain(r), out = [];
      var whole = r.group ? [r.group] : r.main ? r.main : lights.map(function (l) { return l.entity; });
      if (lights.length > 1 || r.group || r.main) out.push(this._lightCard(r.whole_name || "Whole room", r.icon || "mdi:lightbulb-group", whole, true, r.controls));
      lights.forEach((l) => { var s = this._s(l.entity); out.push(this._lightCard(l.name || (s ? s.attributes.friendly_name : l.entity), l.icon || (s && s.attributes.icon) || "mdi:lightbulb", [l.entity], false, l.controls)); });
      // scenes: bright colour tiles (each button can carry its own colours)
      (r.buttons || []).length && out.push('<div class="card"><div class="label">' + esc(r.buttons_label || "Scenes") + '</div><div class="scenes">' + r.buttons.map(function (b, i) {
        var c = b.colors || [b.color || "#8a6bb8", b.color || "#5b3f99"];
        return '<button class="scene' + (b.dark_text ? " darktext" : "") + '" data-rbtn="' + i + '" style="--c1:' + c[0] + ";--c2:" + c[1] + '">' + (b.icon ? icon(b.icon, 34) : "") + "<span>" + esc(b.name) + "</span></button>";
      }).join("") + "</div></div>");
      return '<div class="page">' + this._head(r.name, "lights") + '<div class="scroll"><div class="stack">' + out.join("") + "</div></div></div>";
    }
    _lightCard(name, ic, ids, whole, controls) {   // controls: which of "bri", "ct", "color" to show (all by default)
      var on = this._onCount(ids), bri = this._bri(ids), glow = this._glow(ids), key = esc(ids.join(","));
      var state = on ? (this._dimmable(ids) ? bri + "%" : "On") : "Off";
      var h = '<div class="card light' + (whole ? " whole" : "") + (on ? " lit" : "") + '"' + (glow ? ' style="--glow:' + glow + '"' : "") + ">" +
        '<div class="row"><button class="ic" data-toggle="' + key + '" aria-label="Turn ' + esc(name) + ' on or off">' + icon(ic, 40) + "</button>" +
        '<button class="words" data-toggle="' + key + '"><b>' + esc(name) + "</b><i>" + esc(state) + "</i></button></div>";
      // the family keeps bulbs at their warmest: no warm-to-cool unless a light asks for "ct"
      var ct = this._supportsCt(ids) && !!controls && controls.indexOf("ct") >= 0, col = this._supportsColor(ids) && this._has(controls, "color");
      if (this._dimmable(ids) && this._has(controls, "bri")) h += '<div class="label">Brightness</div>' + this._slider("bri", ids, bri);
      if (ct) h += '<div class="label">Warm to cool</div>' + this._slider("ct", ids, on ? this._temp(ids) : 35);
      if (col) h += '<div class="label">Color</div><div class="swatches">' + SWATCHES.map(function (c, i) {
        return '<button class="sw" data-swatch="' + i + '" data-ids="' + key + '" aria-label="' + c.name + '" style="--c1:' + c.c[0] + ";--c2:" + c.c[1] + '"></button>';
      }).join("") + "</div>";
      else if (ct) h += '<div class="swatches">' + CT_SWATCHES.map(function (c, i) {
        return '<button class="sw wide" data-ctswatch="' + i + '" data-ids="' + key + '" style="--c1:' + c.c[0] + ";--c2:" + c.c[1] + '"><span>' + c.name + "</span></button>";
      }).join("") + "</div>";
      return h + "</div>";
    }
    _slider(kind, ids, val) {
      return '<div class="sl ' + kind + '" data-sl="' + kind + '" data-ids="' + esc(ids.join(",")) + '" data-v="' + val + '">' +
        '<div class="fill" style="width:' + (kind === "ct" ? 100 : val) + '%"></div><div class="knob" style="left:' + val + '%"></div>' +
        (kind === "bri" ? '<span class="val">' + (val ? val + "%" : "Off") + "</span>" : "") + "</div>";
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
        '<div class="card"><div class="label">Last 24 hours</div><div class="hist"><span class="sub">Loading…</span></div></div>' +
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
    _noisePage() {
      var out = (this._config.noise || []).map((n, i) => {
        var p = this._s(n.player), playing = p && p.state === "playing";
        var h = '<div class="card noise' + (playing ? " playing" : "") + '"><div class="row"><span class="ic" style="background:' + (playing ? C.violet : "var(--chip)") + ";color:" + (playing ? "#fff" : C.violet) + '">' + icon(n.icon || "mdi:bed", 40) + "</span>" +
          '<span class="words"><b>' + esc(n.name) + "</b><i>" + (playing ? "Playing" + (p.attributes.media_title ? " · " + esc(p.attributes.media_title) : "") : "Off") + "</i></span></div>" +
          '<div class="btns">' + (n.buttons || []).map(function (b, j) {
            return '<button class="chipbtn' + (b.off ? " off" : "") + '" data-noise="' + i + "/" + j + '">' + (b.icon ? icon(b.icon, 30) : "") + "<span>" + esc(b.name) + "</span></button>";
          }).join("") + "</div>";
        if (n.volume) { var v = this._s(n.volume); if (v) { var mn = +v.attributes.min || 0, mx = +v.attributes.max || 100; h += '<div class="label">Volume</div>' + this._slider("num", [n.volume], Math.round((+v.state - mn) / (mx - mn) * 100)); } }
        if (n.light && this._s(n.light)) h += '<div class="label">Light</div>' + this._slider("bri", [n.light], this._bri([n.light]));
        return h + "</div>";
      });
      return '<div class="page">' + this._head("White noise", "home") + '<div class="scroll"><div class="stack">' + out.join("") + "</div></div></div>";
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
        var sl = e.target.closest && e.target.closest(".sl"); if (!sl) return;
        e.preventDefault();
        sl.setPointerCapture(e.pointerId);
        this._drag = { el: sl, kind: sl.dataset.sl, ids: sl.dataset.ids.split(","), sent: 0, x0: e.clientX, moved: false };
        this._dragTo(e.clientX, false);
      });
      root.addEventListener("pointermove", (e) => { if (this._drag) { if (Math.abs(e.clientX - this._drag.x0) > 4) this._drag.moved = true; this._dragTo(e.clientX, false); } });
      var end = (e) => { if (!this._drag) return; this._dragTo(e.clientX, true); this._drag = null; this._hold = Date.now() + 2500; };
      root.addEventListener("pointerup", end);
      root.addEventListener("pointercancel", () => { this._drag = null; this._hold = Date.now() + 1500; });
    }
    _dragTo(clientX, final) {
      var d = this._drag, r = d.el.getBoundingClientRect();
      var v = Math.round(clamp((clientX - r.left) / r.width * 100, 0, 100));
      d.v = v;
      if (d.kind !== "ct") d.el.querySelector(".fill").style.width = v + "%";
      if (d.kind === "bri") { var t = d.el.querySelector(".val"); if (t) t.textContent = v ? v + "%" : "Off"; }
      d.el.querySelector(".knob").style.left = v + "%";
      var now = Date.now();
      if (final || now - d.sent > 450) { d.sent = now; this._send(d.kind, d.ids, v); }
    }
    _send(kind, ids, v) {
      if (kind === "bri") {
        if (v <= 0) this._call("light", "turn_off", { entity_id: ids });
        else this._call("light", "turn_on", { entity_id: ids, brightness_pct: Math.max(1, v) });
      } else if (kind === "ct") {
        var rg = this._ctRange(ids), k = Math.round(rg[0] + (rg[1] - rg[0]) * v / 100);
        var ct = ids.filter((id) => { var s = this._s(id); return s && (s.attributes.supported_color_modes || []).indexOf("color_temp") >= 0; });
        this._call("light", "turn_on", { entity_id: ct.length ? ct : ids, color_temp_kelvin: k });
      } else if (kind === "hue") {
        var col = ids.filter((id) => { var s = this._s(id); return s && (s.attributes.supported_color_modes || []).some(function (m) { return COLOR_MODES.indexOf(m) >= 0; }); });
        this._call("light", "turn_on", { entity_id: col.length ? col : ids, hs_color: [Math.round(v * 3.6) % 360, 100] });
      } else if (kind === "num") {
        var s = this._s(ids[0]), mn = +s.attributes.min || 0, mx = +s.attributes.max || 100, step = +s.attributes.step || 1;
        this._call("input_number", "set_value", { entity_id: ids[0], value: Math.round((mn + (mx - mn) * v / 100) / step) * step });
      }
    }
    _click(e) {
      var b = e.target.closest && e.target.closest('button, [role="button"], .shade'); if (!b) return;
      this._touched = Date.now();
      var ds = b.dataset, c = this._config;
      if (ds.go) { var p = ds.go.split("/"); this._route = p[0] === "room" ? ["room", +p[1]] : [p[0]]; this._sig = ""; this._render(); return; }
      if (ds.toggle) {
        var ids = ds.toggle.split(","), anyOn = this._onCount(ids) > 0;
        this._call("light", anyOn ? "turn_off" : "turn_on", { entity_id: ids }); return;
      }
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
      var sv = (b.action || b.service || "").split(".");
      var data = Object.assign({}, b.data || {});
      if (b.target) Object.assign(data, b.target);
      this._call(sv[0], sv[1], data);
    }
  }

  var CSS = `
:host { display: block; color: var(--ink); font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", system-ui, sans-serif; -webkit-tap-highlight-color: transparent; user-select: none; }
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
.back { width: 72px; height: 72px; border-radius: 36px; background: var(--card); display: flex; align-items: center; justify-content: center; flex: none; }
.back:active, .big:active, .room:active, .chipbtn:active, .pill:active, .round:active, .mode:active, .sw:active { transform: scale(.97); }
.pill { border-radius: 999px; background: var(--card); font-size: 24px; font-weight: 800; padding: 20px 30px; flex: none; text-align: center; }
.pill.accent { background: var(--accent); color: var(--on-accent); }
.scroll { flex: 1; min-height: 0; overflow-y: auto; margin: 0 -22px; padding: 0 22px 24px; overscroll-behavior: contain; scrollbar-width: none; }
.scroll::-webkit-scrollbar { display: none; }
.grid2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
.grid2.fill { flex: 1; min-height: 0; grid-auto-rows: 1fr; }
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
.room.lit { background: color-mix(in srgb, var(--glow, #f2b25c) 14%, var(--card)); }

/* Lights page: three rooms a row, the kids' rooms two a row, Outside across */
.lgrid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 14px; }
.lgrid .room { grid-column: span 2; padding: 20px; gap: 18px; border-radius: 26px; }
.lgrid .room.guard { grid-column: span 3; flex-direction: row; align-items: center; gap: 14px; text-align: left; }
.lgrid .room.inline { grid-column: 1 / -1; }
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
.card.light.lit { background: color-mix(in srgb, var(--glow, #f2b25c) 12%, var(--card)); }
.card.whole { border: 3px solid color-mix(in srgb, var(--ink) 10%, transparent); }
.label { font-size: 17px; font-weight: 800; color: var(--muted); text-transform: uppercase; letter-spacing: .6px; margin-top: 4px; }
.sub { font-size: 20px; font-weight: 700; color: var(--muted); }

/* sliders: 72px tall, drag anywhere */
.sl { position: relative; height: 72px; border-radius: 22px; background: var(--chip); overflow: hidden; touch-action: none; cursor: pointer; }
.sl .fill { position: absolute; inset: 0 auto 0 0; background: var(--glow, #f2b25c); border-radius: 22px 0 0 22px; }
.sl.bri .fill { background: linear-gradient(90deg, color-mix(in srgb, var(--glow, #f2b25c) 70%, var(--chip)), var(--glow, #f2b25c)); }
.sl.num .fill { background: ${C.violet}; }
.sl.ct { background: linear-gradient(90deg, #ff9d3d, #ffe6c2 45%, #f4f7ff 70%, #bcd6ff); }
.sl.ct .fill, .sl.hue .fill { display: none; }
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
:host([narrow]) .lpill { padding: 10px 14px; font-size: 14px; gap: 6px; }
:host([narrow]) .lpill ha-icon { --mdc-icon-size: 20px !important; }
:host([narrow]) .levels { gap: 6px; }
:host([narrow]) .lgrid { gap: 8px; }
:host([narrow]) .lgrid .room { grid-column: 1 / -1; padding: 10px 12px; gap: 10px; border-radius: 18px; }
:host([narrow]) .lgrid .room:not(.guard):not(.inline) { flex-direction: row; align-items: center; }
:host([narrow]) .lgrid .room:not(.guard):not(.inline) .row { flex: 1; min-width: 0; flex-direction: row; align-items: center; gap: 10px; }
:host([narrow]) .lgrid .room:not(.guard):not(.inline) .levels { flex: none; width: 132px; }
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
