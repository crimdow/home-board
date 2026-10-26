/* Home Board: Home Assistant (☰ → Home Assistant, and a button on the wall panel).
   Shows the family's own Home Assistant (address set in ☰ → Screensaver) inside Home Board.
   The panel can have its own address (haPanel, e.g. http://192.168.x.x): HA's trusted networks then
   let the Surface straight in, with no keyboard needed. Everyone else uses the main address.
   and stays loaded while you switch pages, so Home Assistant keeps its place.
   An http:// address (Home Assistant on the home network) only shows inside Home Board on the panel, whose
   Chromium allows it for home.jermins.com (policy InsecureContentAllowedForUrls). Phones and laptops can't show
   an http:// page inside an https:// one, so there it's an "Open Home Assistant" button instead. */
HB.register("ha", {
  title: "Home Assistant",

  css: `
#pg-ha:not([hidden]) { height: calc(100dvh - var(--phead, 0px) - var(--pbar, 84px) - 24px); }
#pg-ha .ha-frame { flex: 1; min-height: 0; border: 0; width: 100%; border-radius: 22px; background: var(--sheet); }
#pg-ha .ha-msg { margin: auto; max-width: 560px; text-align: center; color: var(--muted); font-size: 16px; font-weight: 600; line-height: 1.5; padding: 40px 16px; }
#pg-ha .ha-msg b { display: block; color: var(--ink); font-size: 24px; font-weight: 800; margin-bottom: 8px; }
:root.panel #pg-ha .ha-msg { font-size: 20px; }
:root.panel #pg-ha .ha-msg b { font-size: 30px; }
#pg-ha .ha-msg button { margin-top: 18px; border: 0; border-radius: 999px; background: var(--chip); color: var(--ink); font: inherit; font-size: 18px; font-weight: 800; padding: 12px 22px; cursor: pointer; }
`,

  // When you come back to this page after half an hour, Home Assistant loads afresh, so changes made in
  // Home Assistant (a new dashboard add-on, say) reach the wall panel without anyone reloading it.
  shown: function () {
    var f = document.querySelector("#pg-ha .ha-frame");
    if (f && Date.now() - (f._loaded || 0) > 30 * 60000) { f._loaded = Date.now(); f.src = f.src; }
  },

  mount: function (root) {
    var shown = "";
    function render() {
      // the wall panel uses its own home-network address when one is set (so HA's trusted networks let it in without a login)
      var p = HB.family().panel || {}, url = (HB.panel && p.haPanel) || p.ha || "";
      if (url === shown && root.firstChild) return;   // same address: leave Home Assistant where it is
      shown = url;
      if (!url) {
        root.innerHTML = '<div class="ha-msg"><b>Home Assistant</b>Add its address in ☰ → Screensaver → Home Assistant on the panel.</div>';
        return;
      }
      if (!HB.panel && location.protocol === "https:" && /^http:/i.test(url)) {
        root.innerHTML = '<div class="ha-msg"><b>Home Assistant</b>Its address is on the home network (' + HB.esc(url) + '), which a phone can’t show inside Home Board. ' +
          'It opens on its own instead, while you’re home.<br><button type="button">Open Home Assistant</button></div>';
        root.querySelector("button").onclick = function () { window.open(url, "_blank", "noopener"); };
        return;
      }
      root.innerHTML = '<iframe class="ha-frame" title="Home Assistant" allow="fullscreen; autoplay; microphone; camera" referrerpolicy="no-referrer"></iframe>';
      var f = root.querySelector("iframe"); f._loaded = Date.now(); f.src = url;
    }
    HB.onFamily(render);
    render();
  }
});
