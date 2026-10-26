/* Home Board: Home Assistant, on the wall panel only.
   Shows the family's own Home Assistant (address set in ☰ → Screensaver) filling the screen under the clock bar.
   The page stays loaded while you switch to the Grid and back, so Home Assistant keeps its place. */
HB.register("ha", {
  title: "Home Assistant",

  css: `
#pg-ha:not([hidden]) { height: calc(100dvh - var(--phead, 0px) - var(--pbar, 84px) - 24px); }
#pg-ha .ha-frame { flex: 1; min-height: 0; border: 0; width: 100%; border-radius: 22px; background: var(--sheet); }
#pg-ha .ha-msg { margin: auto; max-width: 560px; text-align: center; color: var(--muted); font-size: 20px; font-weight: 600; line-height: 1.5; padding: 40px 20px; }
#pg-ha .ha-msg b { display: block; color: var(--ink); font-size: 30px; font-weight: 800; margin-bottom: 8px; }
#pg-ha .ha-msg button { margin-top: 18px; border: 0; border-radius: 999px; background: var(--chip); color: var(--ink); font: inherit; font-size: 18px; font-weight: 800; padding: 12px 22px; cursor: pointer; }
`,

  mount: function (root) {
    var shown = "";
    function render() {
      var url = (HB.family().panel || {}).ha || "";
      if (url === shown && root.firstChild) return;   // same address: leave Home Assistant where it is
      shown = url;
      if (!url) {
        root.innerHTML = '<div class="ha-msg"><b>Home Assistant</b>Add its address on a phone: ☰ → Screensaver → Home Assistant on the panel.</div>';
        return;
      }
      if (!/^https:\/\//i.test(url) && location.protocol === "https:") {
        root.innerHTML = '<div class="ha-msg"><b>Needs an https:// address</b>' + HB.esc(url) + ' starts with http://, which the browser won’t show inside Home Board. Use Home Assistant’s https:// address instead.</div>';
        return;
      }
      root.innerHTML = '<iframe class="ha-frame" title="Home Assistant" allow="fullscreen; autoplay; microphone; camera" referrerpolicy="no-referrer"></iframe>';
      root.querySelector("iframe").src = url;
    }
    HB.onFamily(render);
    render();
  }
});
