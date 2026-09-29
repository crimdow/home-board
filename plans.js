/* Home Board: Plans page. Loaded by index.html, which provides the sign-in, tab bar,
   theme, HB.db (the database), HB.toast and the shared swipe / undo helpers. */
HB.register("plans", {
  title: "Plans",

  css: "#pg-plans header { display: flex; align-items: center; justify-content: space-between; padding: 4px 0 0; }\n#pg-plans h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.4px; line-height: 1.1; }\n#pg-plans .count { color: var(--muted); font-size: 14px; font-weight: 600; margin-left: 8px; }\n#pg-plans .nav button {\n  width: 36px; height: 36px; border-radius: 50%; border: 0; background: var(--chip); color: var(--ink);\n  display: grid; place-items: center; cursor: pointer;\n}\n#pg-plans .nav svg { width: 18px; height: 18px; }\n#pg-plans .cols {\n  display: grid; grid-template-columns: 1fr 120px 46px;\n  padding: 8px 0 6px; border-bottom: 0.5px solid var(--hair);\n  font-size: 13px; font-weight: 700; color: var(--muted);\n}\n#pg-plans .cols span:nth-child(2) { text-align: center; }\n#pg-plans .cols span:nth-child(3) { text-align: center; }\n#pg-plans .add { display: none; gap: 8px; padding: 10px 0; border-bottom: 0.5px solid var(--hair); }\nbody.editing #pg-plans .add { display: flex; }\n#pg-plans .add input {\n  flex: 1; border: 0; border-radius: 10px; background: var(--field); color: var(--ink);\n  font: inherit; font-size: 16px; padding: 9px 12px; min-width: 0;\n}\n#pg-plans .add input:focus { outline: 2px solid var(--ben); }\n#pg-plans .add button[type=\"submit\"] {\n  border: 0; border-radius: 10px; background: var(--ben); color: #fff;\n  font: inherit; font-weight: 700; font-size: 15px; padding: 0 16px; cursor: pointer;\n}\n#pg-plans .item {\n  display: grid; grid-template-columns: 1fr 120px 46px; align-items: center;\n  min-height: 52px; padding: 6px 0; border-bottom: 0.5px solid var(--hair);\n}\n#pg-plans .item .main { appearance: none; border: 0; background: none; color: inherit; font: inherit; text-align: left; padding: 4px 8px 4px 0; cursor: pointer; }\n#pg-plans .item .name { font-size: 17px; font-weight: 650; line-height: 1.25; }\n#pg-plans .item .note { font-size: 14px; color: var(--muted); line-height: 1.3; margin-top: 2px; white-space: pre-wrap; }\n#pg-plans .check {\n  justify-self: center; width: 30px; height: 30px; border-radius: 15px; border: 2px solid var(--muted);\n  background: none; cursor: pointer; display: grid; place-items: center; padding: 0;\n  transition: background-color .15s, border-color .15s, transform .12s;\n}\n#pg-plans .check:active { transform: scale(.9); }\n#pg-plans .check svg { width: 16px; height: 16px; stroke: #fff; stroke-width: 3; fill: none; stroke-linecap: round; stroke-linejoin: round; opacity: 0; }\n#pg-plans .item.done .check { background: var(--both); border-color: var(--both); }\n#pg-plans .item.done .check svg { opacity: 1; }\n#pg-plans .item.done .name { text-decoration: line-through; color: var(--muted); font-weight: 500; }\n#pg-plans .item.done .store, #pg-plans .item.done .note { opacity: .6; }\n#pg-plans .got { display: flex; align-items: center; justify-content: space-between; margin-top: 22px; padding-bottom: 4px; border-bottom: 0.5px solid var(--hair); }\n#pg-plans .got h2 { margin: 0; font-size: 13px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .4px; }\n#pg-plans .got button { border: 0; background: none; color: var(--ash); font: inherit; font-size: 14px; font-weight: 700; cursor: pointer; padding: 6px 0; display: none; }\nbody.editing #pg-plans .got button { display: block; }\n#pg-plans .empty { color: var(--muted); text-align: center; padding: 28px 0; font-size: 15px; }\nbody.readonly #pg-plans .main, body.readonly #pg-plans .check { pointer-events: none; }\n#pg-plans .item .store {\n  justify-self: center; appearance: none; border: 0; cursor: pointer; font-family: inherit;\n  font-size: 13px; font-weight: 700; color: var(--muted); background: var(--chip);\n  border-radius: 14px; padding: 6px 10px; max-width: 118px;\n  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;\n  transition: transform .12s, background-color .15s;\n}\n#pg-plans .item .store:active { transform: scale(.94); }\n#pg-plans .item .store.set { background: var(--ink); color: var(--bg); }\n#pg-plans .item .store:not(.set) { width: 46px; height: 28px; padding: 0; }\nbody.readonly #pg-plans .store { pointer-events: none; }\n#pg-plans .shop { width: 17px; height: 17px; stroke: currentColor; fill: none; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; display: block; margin: 0 auto; }\n#pg-plans .item .store:not(.set) { color: var(--muted); }\n#pg-plans .filterbar { display: flex; padding: 8px 0 2px; }\n#pg-plans .fpill {\n  appearance: none; border: 0; cursor: pointer; font-family: inherit;\n  font-size: 14px; font-weight: 700; padding: 6px 13px; border-radius: 15px;\n  background: var(--chip); color: var(--muted);\n  transition: background-color .15s, transform .12s;\n}\n#pg-plans .fpill:active { transform: scale(.95); }\n#pg-plans .fpill.on { background: var(--ink); color: var(--bg); }\n#pg-plans .fnone { display: inline-flex; align-items: center; gap: 6px; }\n#pg-plans .fnone .shop { margin: 0; width: 15px; height: 15px; }\n#pg-plans #hideBtn.on { background: var(--ink); color: var(--bg); }\n#pg-plans .nav { display: flex; gap: 8px; }\n#pg-plans #gear { display: none; }\nbody.editing #pg-plans #gear { display: grid; }\n#pg-plans .slist { display: flex; flex-direction: column; gap: 8px; max-height: 45vh; overflow-y: auto; }\n#pg-plans .srow { display: flex; gap: 8px; align-items: center; }\n#pg-plans .srow input { flex: 1; }\n#pg-plans .sdot { flex: 0 0 14px; height: 14px; border-radius: 7px; }\n#pg-plans .srow .mv, #pg-plans .srow .x {\n  flex: 0 0 38px; height: 38px; border: 0; border-radius: 10px; background: var(--chip);\n  color: var(--ink); font: inherit; font-size: 18px; font-weight: 700; cursor: pointer; display: grid; place-items: center;\n}\n#pg-plans .srow .x { color: var(--ash); }\n#pg-plans .srow .mv:disabled { opacity: .3; }\n#pg-plans .sheet h3 { margin: 0 0 12px; font-size: 20px; font-weight: 700; }\n#pg-plans .sheet .addstore { display: flex; gap: 8px; margin-top: 12px; }\n#pg-plans .sheet .addstore input { flex: 1; }\n#pg-plans .sheet .addstore button { border: 0; border-radius: 10px; background: var(--ink); color: var(--bg); font: inherit; font-weight: 700; padding: 0 16px; cursor: pointer; }\n#pg-plans .sheet-bg { position: fixed; inset: 0; background: rgba(0,0,0,.35); opacity: 0; pointer-events: none; transition: opacity .2s; z-index: 9; }\n#pg-plans .sheet-bg.show { opacity: 1; pointer-events: auto; }\n#pg-plans .sheet {\n  position: fixed; left: 50%; bottom: 0; transform: translate(-50%, 120%); z-index: 10;\n  width: 100%; max-width: 500px; background: var(--sheet); border-radius: 20px 20px 0 0;\n  padding: 20px 18px calc(20px + env(safe-area-inset-bottom, 0px));\n  transition: transform .25s cubic-bezier(.32,.72,0,1); box-shadow: 0 -8px 40px rgba(0,0,0,.18);\n}\n#pg-plans .sheet.show { transform: translate(-50%, 0); }\n#pg-plans .sheet label { display: block; font-size: 13px; font-weight: 700; color: var(--muted); margin: 12px 0 6px; }\n#pg-plans .sheet label:first-child { margin-top: 0; }\n#pg-plans .sheet input, #pg-plans .sheet textarea {\n  width: 100%; border: 0; border-radius: 10px; background: var(--field); color: var(--ink);\n  font: inherit; font-size: 16px; padding: 10px 12px; resize: none;\n}\n#pg-plans .sheet input:focus, #pg-plans .sheet textarea:focus { outline: 2px solid var(--ben); }\n#pg-plans .sheet textarea { min-height: 76px; }\n#pg-plans .spick {\n  appearance: none; border: 0; cursor: pointer; font-family: inherit;\n  font-size: 15px; font-weight: 700; border-radius: 16px; padding: 8px 16px;\n  min-width: 64px; min-height: 36px; background: var(--chip); color: var(--ink);\n  transition: transform .12s, background-color .15s;\n}\n#pg-plans .spick:active { transform: scale(.95); }\n#pg-plans .addpick { min-width: 54px; min-height: 0; font-size: 13px; padding: 0 12px; border-radius: 10px; max-width: 110px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n#pg-plans .spick.set { background: var(--ink); color: var(--bg); }\n#pg-plans .stores { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }\n#pg-plans .stores button {\n  border: 0; border-radius: 14px; background: var(--chip); color: var(--ink);\n  font: inherit; font-size: 14px; font-weight: 600; padding: 5px 12px; cursor: pointer;\n}\n#pg-plans .stores button.on { background: var(--ink); color: var(--bg); }\n#pg-plans .sheet .row { display: flex; gap: 10px; margin-top: 18px; }\n#pg-plans .sheet .row button { flex: 1; border: 0; border-radius: 12px; font: inherit; font-size: 16px; font-weight: 700; padding: 12px; cursor: pointer; }\n#pg-plans .sheet .del { background: var(--chip); color: var(--ash); }\n#pg-plans .sheet .done { background: var(--ink); color: var(--bg); }\n#pg-plans .sheet h2 { margin: 0 0 4px; font-size: 22px; font-weight: 700; letter-spacing: -0.3px; }\n#pg-plans .sheet .sub { margin: 0 0 16px; color: var(--muted); font-size: 15px; }\n#pg-plans .sheet input {\n  width: 100%; border: 0; border-radius: 12px; background: var(--field); color: var(--ink);\n  font: inherit; font-size: 17px; padding: 14px; margin-bottom: 10px;\n}\n#pg-plans .sheet input:focus { outline: 2px solid var(--ben); outline-offset: 0; }\n#pg-plans .sheet .go {\n  width: 100%; border: 0; border-radius: 12px; background: var(--ink); color: var(--bg);\n  font: inherit; font-size: 17px; font-weight: 700; padding: 14px; cursor: pointer;\n}\n#pg-plans .sheet .go:disabled { opacity: .5; }\n#pg-plans .sheet .cancel { display: block; width: 100%; margin-top: 10px; background: none; border: 0; color: var(--muted); font: inherit; font-size: 15px; cursor: pointer; }\n#pg-plans .sheet .err { color: var(--ash); font-size: 15px; min-height: 1.4em; margin: 0 0 6px; }\n#pg-plans .sheet form, #pg-plans form.sheet { margin: 0; }\n#pg-plans .sheet input[type=email], #pg-plans .sheet input[type=password] { margin-bottom: 10px; }\n#pg-plans .cols, #pg-plans .item { grid-template-columns: 1fr 84px !important; column-gap: 8px; }\n#pg-plans .cols span:nth-child(2) { text-align: center; }\n#pg-plans .item { min-height: 54px; }\n#pg-plans #addBtn { background: var(--ben); color: #fff; }\n#pg-plans #addBtn svg { width: 18px; height: 18px; }\n#pg-plans .wk { margin-top: 18px; padding-bottom: 5px; border-bottom: 0.5px solid var(--hair); }\n#pg-plans .wk .tag { display: block; font-size: 11px; font-weight: 800; color: var(--ben); text-transform: uppercase; letter-spacing: .5px; margin-bottom: 1px; }\n#pg-plans .wk:first-child { margin-top: 10px; }\n#pg-plans .wk h2 { margin: 0; font-size: 13px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .4px; }\n#pg-plans .wk h2 b { color: var(--ink); }\n#pg-plans .wk span { font-size: 13px; font-weight: 600; color: var(--muted); }\n#pg-plans .wk.free { display: flex; align-items: baseline; justify-content: space-between; margin-top: 14px; }\n#pg-plans .wk.free h2 { opacity: .75; }\n#pg-plans .wk.free .free-note { font-size: 13px; font-weight: 600; color: var(--muted); opacity: .75; }\n#pg-plans .when {\n  appearance: none; border: 0; cursor: pointer; font-family: inherit; white-space: nowrap;\n  font-size: 13px; font-weight: 650; height: 30px; padding: 0 10px; border-radius: 15px; min-width: 70px;\n  background: var(--chip); color: var(--ink); justify-self: center; transition: transform .12s;\n}\n#pg-plans .when:active { transform: scale(.94); }\n#pg-plans .when.idea { color: var(--muted); min-width: 52px; }\n#pg-plans .when svg { vertical-align: middle; }\n#pg-plans .when svg { width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; vertical-align: -3px; }\n#pg-plans .seg { display: flex; background: var(--chip); border-radius: 12px; padding: 3px; margin: 10px 0 4px; }\n#pg-plans .seg button {\n  flex: 1; appearance: none; border: 0; background: none; cursor: pointer; font-family: inherit;\n  font-size: 14px; font-weight: 700; color: var(--muted); padding: 7px 0; border-radius: 9px;\n}\n#pg-plans .seg button.on { background: var(--bg); color: var(--ink); box-shadow: 0 1px 3px rgba(0,0,0,.12); }\n#pg-plans .seg .n { font-weight: 600; opacity: .7; margin-left: 4px; }\n#pg-plans .sheet input[type=date] { -webkit-appearance: none; appearance: none; min-height: 44px; }\n#pg-plans .sheet .clear-date { background: none; border: 0; color: var(--muted); font: inherit; font-size: 14px; font-weight: 600; padding: 8px 0 0; cursor: pointer; }\n#pg-plans .sheet.quick { display: flex; gap: 8px; padding-top: 10px; padding-bottom: 10px; border-radius: 16px 16px 0 0; }\n#pg-plans .sheet.quick input { flex: 1; min-width: 0; }\n#pg-plans .sheet.quick .when { height: auto; border-radius: 10px; }\n#pg-plans .sheet.quick button[type=submit] { min-width: 72px; border: 0; border-radius: 10px; background: var(--ben); color: #fff; font: inherit; font-size: 16px; font-weight: 700; padding: 0 18px; cursor: pointer; }\n#pg-plans .sheet.quick button.finish { background: var(--ink); color: var(--bg); }\n#pg-plans .month { font-size: 13px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .4px; padding: 16px 0 5px; border-bottom: 0.5px solid var(--hair); }\n#pg-plans .item.up { grid-template-columns: 52px 1fr !important; column-gap: 14px; }\n#pg-plans .tile {\n  appearance: none; border: 0; cursor: pointer; font-family: inherit; color: #fff;\n  width: 52px; height: 52px; border-radius: 14px; display: flex; flex-direction: column;\n  align-items: center; justify-content: center; line-height: 1; padding: 0;\n}\n#pg-plans .tile .d { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .4px; opacity: .92; }\n#pg-plans .tile .n { font-size: 21px; font-weight: 800; margin-top: 3px; }\n#pg-plans .item.up .soon { font-size: 13px; color: var(--muted); font-weight: 600; margin-top: 2px; }\n#pg-plans .cols.up { grid-template-columns: 52px 1fr !important; column-gap: 14px; }\n#pg-plans .cols.up span:nth-child(2) { text-align: left; }\n#pg-plans .item.flash { animation: rowflash 1.4s ease-out; }\n@keyframes rowflash { 0%, 30% { background: color-mix(in srgb, var(--ben) 16%, var(--bg)); } 100% { background: var(--bg); } }\n#pg-plans .sheet .cal-btn {\n  display: inline-flex; align-items: center; gap: 7px; margin-top: 10px;\n  border: 0; border-radius: 16px; background: var(--chip); color: var(--ink);\n  font: inherit; font-size: 14px; font-weight: 700; padding: 8px 14px; cursor: pointer;\n}\n#pg-plans .sheet .cal-btn svg { width: 17px; height: 17px; stroke: currentColor; fill: none; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; }\n#pg-plans .sheet .cal-btn[hidden] { display: none; }\n#pg-plans .when { position: relative; display: inline-flex; align-items: center; justify-content: center; }\n#pg-plans .when b { font-weight: inherit; pointer-events: none; }\n/* an invisible date input covers the pill, so a tap opens the phone's calendar */\n#pg-plans .when input.wpick { position: absolute; inset: 0; width: 100%; height: 100%; min-width: 0; flex: none; opacity: 0; margin: 0; padding: 0; border: 0; font-size: 16px; cursor: pointer; -webkit-appearance: none; appearance: none; }\nbody.viewonly #pg-plans .when input.wpick { display: none; }\n#pg-plans .when { -webkit-touch-callout: none; -webkit-user-select: none; user-select: none; }\n#pg-plans .datebtns { display: flex; gap: 8px; flex-wrap: wrap; }\n#pg-plans .dbtn {\n  position: relative; display: inline-flex; align-items: center; gap: 7px; overflow: hidden;\n  border: 0; border-radius: 16px; background: var(--chip); color: var(--ink);\n  font: inherit; font-size: 14px; font-weight: 700; padding: 8px 14px; cursor: pointer;\n}\n#pg-plans .dbtn svg { width: 17px; height: 17px; stroke: currentColor; fill: none; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; }\n#pg-plans .dbtn:disabled { opacity: .4; cursor: default; }\n#pg-plans .sheet .datepick input[type=date] {\n  position: absolute; inset: 0; width: 100%; height: 100%; min-height: 0; padding: 0; margin: 0;\n  opacity: 0; border: 0; background: none; cursor: pointer; font-size: 16px;\n}\n#pg-plans #laterBtn.on { background: var(--ink); color: var(--bg); }\n#pg-plans #laterBtn[hidden] { display: none; }\n#pg-plans .more-later { display: block; width: 100%; appearance: none; border: 0; background: none; cursor: pointer; font-family: inherit;\n  color: var(--muted); font-size: 14px; font-weight: 600; padding: 14px 0; text-align: center; }\nbody.viewonly #pg-plans #addBtn, body.viewonly #pg-plans #gear, body.viewonly #pg-plans #clearBtn { display: none !important; }\nbody.viewonly #pg-plans #list, body.viewonly #pg-plans #gotList, body.viewonly #pg-plans #days { pointer-events: none; }\nbody.viewonly #pg-plans .who, body.viewonly #pg-plans .kind, body.viewonly #pg-plans .dpill, body.viewonly #pg-plans .store, body.viewonly #pg-plans .check, body.viewonly #pg-plans .when, body.viewonly #pg-plans .tile, body.viewonly #pg-plans .cell { cursor: default; }\n#pg-plans .undo {\n  position: fixed; left: 50%; bottom: calc(84px + env(safe-area-inset-bottom, 0px)); z-index: 30;\n  transform: translate(-50%, 16px); opacity: 0; pointer-events: none; transition: opacity .2s, transform .2s;\n  display: flex; align-items: center; gap: 14px; max-width: calc(100% - 32px);\n  background: var(--ink); color: var(--bg); border-radius: 22px; padding: 10px 10px 10px 16px;\n  font-size: 14px; font-weight: 600; box-shadow: 0 6px 24px rgba(0,0,0,.2);\n}\n#pg-plans .undo.show { opacity: 1; transform: translate(-50%, 0); pointer-events: auto; }\n#pg-plans .undo span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n#pg-plans .undo button { border: 0; border-radius: 14px; background: var(--ben); color: #fff; font: inherit; font-size: 14px; font-weight: 800; padding: 6px 14px; cursor: pointer; flex: none; }\n#pg-plans .swipe { position: relative; overflow: hidden; }\n#pg-plans .swipe .item { position: relative; background: var(--bg); transition: transform .2s ease; touch-action: pan-y; }\n#pg-plans .swipe.dragging .item { transition: none; }\n#pg-plans .swipe .delbg {\n  position: absolute; top: 0; right: 0; bottom: 0; width: 88px; border: 0; cursor: pointer;\n  background: var(--ash); color: #fff; font: inherit; font-size: 15px; font-weight: 700;\n}\nbody.viewonly #pg-plans .swipe .delbg { display: none; }\n#pg-plans .swipe .delbg { visibility: hidden; }\n#pg-plans .swipe.dragging .delbg, #pg-plans .swipe.open .delbg { visibility: visible; }\n#pg-plans .feed-p { margin: 0 0 16px; color: var(--muted); font-size: 15px; line-height: 1.45; }\n#pg-plans .feed-p b { color: var(--ink); }\n#pg-plans .feed-go, #pg-plans .feed-copy { display: block; width: 100%; border: 0; border-radius: 12px; font: inherit; font-size: 16px; font-weight: 700; padding: 13px; cursor: pointer; margin-bottom: 8px; }\n#pg-plans .feed-go { background: var(--accent); color: var(--on-accent); }\n#pg-plans .feed-copy { background: var(--chip); color: var(--ink); }\n#pg-plans .feed-note { margin: 4px 0 0; color: var(--muted); font-size: 13px; line-height: 1.4; min-height: 1em; }\nbody.viewonly #pg-plans #feedBtn { display: none; }\n#pg-plans .timerow { display: flex; align-items: center; gap: 8px; margin-top: 10px; flex-wrap: wrap; }\n#pg-plans .timerow[hidden] { display: none; }\n#pg-plans .allday { border: 0; border-radius: 16px; background: var(--chip); color: var(--muted); font: inherit; font-size: 14px; font-weight: 700; padding: 8px 14px; cursor: pointer; }\n#pg-plans .allday.on { background: var(--ink); color: var(--bg); }\n#pg-plans .tfield { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700; color: var(--muted); }\n#pg-plans .tfield[hidden] { display: none; }\n#pg-plans .tfield input { width: auto; min-width: 104px; margin: 0; padding: 8px 10px; font-size: 16px; }\n#pg-plans .sheet .kind-seg { margin: 0 0 4px; }\n/* calendars: Everything | Fun, the add-bar pill, the chips on a plan, the dot on ideas */\n#pg-plans .pfilter { display: flex; gap: 6px; padding: 2px 0 6px; }\n#pg-plans .pfilter button { border: 0; border-radius: 15px; background: var(--chip); color: var(--muted); font: inherit; font-size: 13px; font-weight: 750; padding: 5px 12px; cursor: pointer; }\n#pg-plans .pfilter button.on { background: var(--ink); color: var(--bg); }\n#pg-plans .calpick { flex: none; display: inline-flex; align-items: center; gap: 6px; max-width: 108px; border: 0; border-radius: 10px; background: var(--chip); color: var(--ink); font: inherit; font-size: 14px; font-weight: 750; padding: 0 10px; cursor: pointer; }\n#pg-plans .calpick i, #pg-plans .calchips i, #pg-plans .cdot { flex: none; width: 11px; height: 11px; border-radius: 6px; display: inline-block; }\n#pg-plans .calpick span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n#pg-plans .calchips { display: flex; flex-wrap: wrap; gap: 6px; margin: 12px 0 0; }\n#pg-plans .calchips button { display: inline-flex; align-items: center; gap: 6px; border: 0; border-radius: 15px; background: var(--chip); color: var(--ink); font: inherit; font-size: 14px; font-weight: 700; padding: 6px 12px; cursor: pointer; opacity: .6; }\n#pg-plans .calchips button.on { opacity: 1; box-shadow: inset 0 0 0 2px var(--ink); }\n#pg-plans .item .cdot { width: 9px; height: 9px; margin-right: 7px; vertical-align: 1px; }\n/* quick add: name + date on top; Add to Ideas / Add to Calendar underneath */\n#pg-plans .qbtns { display: flex; gap: 8px; width: 100%; }\n#pg-plans .qadd { position: relative; flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-height: 46px; border: 0; border-radius: 12px; font: inherit; font-size: 15px; font-weight: 750; color: var(--ink); cursor: pointer; overflow: hidden; -webkit-tap-highlight-color: transparent; transition: transform .12s; }\n#pg-plans .qadd:active { transform: scale(.97); }\n#pg-plans .qadd svg, #pg-plans .swbg svg { width: 18px; height: 18px; flex: none; stroke: currentColor; fill: none; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; }\n#pg-plans .to-idea { background: color-mix(in srgb, #e9b000 24%, var(--chip)); }\n#pg-plans .to-cal { background: color-mix(in srgb, var(--accent) 24%, var(--chip)); }\n#pg-plans .qadd input.wpick { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; margin: 0; padding: 0; border: 0; font-size: 16px; cursor: pointer; -webkit-appearance: none; appearance: none; }\n#pg-plans .to-cal.wait { opacity: .5; }\n#pg-plans #quickWhen.need { animation: needdate .9s ease; box-shadow: 0 0 0 2px var(--accent); }\n@keyframes needdate { 0%, 100% { transform: none; } 20%, 60% { transform: translateX(-4px); } 40%, 80% { transform: translateX(4px); } }\n/* swipe an idea left: To Calendar; swipe a calendar plan left: To Ideas */\n#pg-plans .swipe .swbg { position: absolute; top: 0; bottom: 0; right: 88px; width: 96px; border: 0; cursor: pointer; font: inherit; font-size: 13px; font-weight: 750; color: var(--ink); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; visibility: hidden; overflow: hidden; }\n#pg-plans .swipe.dragging .swbg, #pg-plans .swipe.open .swbg { visibility: visible; }\n#pg-plans .swbg input.wpick { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; margin: 0; border: 0; font-size: 16px; -webkit-appearance: none; appearance: none; }\nbody.viewonly #pg-plans .swipe .swbg { display: none; }\n/* old switch (kept for the item screen) */\n#pg-plans .sheet.quick { flex-wrap: wrap; }\n#pg-plans .sheet.quick #quickText { flex: 1 1 40%; margin: 0; }\n#pg-plans .sheet.quick #quickWhen { align-self: stretch; height: auto; min-width: 64px; }\n#pg-plans .sheet.quick .qkind { flex: 1 1 auto; margin: 0; }\n#pg-plans .sheet.quick .qkind button { padding: 8px 0; font-size: 15px; }\n#pg-plans .qkind button, #pg-plans .kind-seg button { display: inline-flex; align-items: center; justify-content: center; gap: 6px; }\n#pg-plans .qkind svg, #pg-plans .kind-seg svg { width: 17px; height: 17px; flex: none; stroke: currentColor; fill: none; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; }\n#pg-plans .sheet.quick #quickBtn { min-height: 40px; }\n#pg-plans .kind-hint { margin: 6px 2px 0; font-size: 13px; font-weight: 600; color: var(--ash); }\n#pg-plans .kind-hint[hidden] { display: none; }\n#pg-plans .item .when-line { font-size: 13px; font-weight: 700; color: var(--ink); opacity: .75; margin-top: 2px; }\n",

  html: "  <div class=\"top\">\n  <header>\n    <div><h1>Plans<span class=\"count\" id=\"count\"></span></h1></div>\n    <div class=\"nav\">\n      <button id=\"addBtn\" aria-label=\"Add a plan\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.6\" stroke-linecap=\"round\"><path d=\"M12 5v14M5 12h14\"/></svg></button>\n      <button id=\"feedBtn\" aria-label=\"Plans in your Calendar app\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20 11a8 8 0 0 0-14.5-4.5M4 13a8 8 0 0 0 14.5 4.5\"/><path d=\"M5.5 2.5v4h4M18.5 21.5v-4h-4\"/></svg></button>\n      <button id=\"laterBtn\" aria-label=\"Show plans further out\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/></svg></button>\n      <span class=\"vo\">View only</span>\n    </div>\n  </header>\n  <div class=\"seg\" id=\"seg\"><button type=\"button\" data-v=\"up\" class=\"on\">On the Calendar<span class=\"n\" id=\"nUp\"></span></button><button type=\"button\" data-v=\"ideas\">Ideas<span class=\"n\" id=\"nIdeas\"></span></button></div>\n  <div class=\"pfilter\" id=\"pFilter\"><button type=\"button\" data-f=\"all\">Everything</button><button type=\"button\" data-f=\"fun\">★ Fun</button></div>\n  <div class=\"cols\" id=\"cols\"><span id=\"colTitle\">Plan</span><span id=\"colWhen\">When</span></div>\n  </div>\n  <div id=\"list\"></div>\n<div class=\"sheet-bg\" id=\"sheetBg\"></div>\n<form class=\"sheet quick\" id=\"quickSheet\" autocomplete=\"off\">\n  <button type=\"button\" class=\"calpick\" id=\"quickCal\" aria-label=\"Calendar\"><i></i><span></span></button>\n  <input id=\"quickText\" placeholder=\"Add a plan\" enterkeyhint=\"enter\">\n  <span class=\"when\" id=\"quickWhen\"><b></b><input type=\"date\" class=\"wpick\" id=\"quickDate\" aria-label=\"Date\"></span>\n  <div class=\"qbtns\"><span class=\"qadd to-cal\" id=\"addCal\" role=\"button\" tabindex=\"0\"><svg viewBox=\"0 0 24 24\"><rect x=\"4\" y=\"5.5\" width=\"16\" height=\"14\" rx=\"2.5\"/><path d=\"M4 10h16M8.5 3.5v4M15.5 3.5v4M9 14.8l2 2 4-4\"/></svg><span>Add to Calendar</span></span><button type=\"button\" class=\"qadd to-idea\" id=\"addIdea\"><svg viewBox=\"0 0 24 24\"><path d=\"M9 17.5h6M10 20.5h4M12 3.5a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2v1.2h5.2v-1.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3.5z\"/></svg>Add to Ideas</button></div>\n</form>\n<div class=\"sheet\" id=\"sheet\">\n  <div class=\"seg kind-seg\" id=\"fKind\"><button type=\"button\" data-k=\"up\"><svg viewBox=\"0 0 24 24\"><rect x=\"4\" y=\"5.5\" width=\"16\" height=\"14\" rx=\"2.5\"/><path d=\"M4 10h16M8.5 3.5v4M15.5 3.5v4M9 14.8l2 2 4-4\"/></svg>Calendar</button><button type=\"button\" data-k=\"idea\"><svg viewBox=\"0 0 24 24\"><path d=\"M9 17.5h6M10 20.5h4M12 3.5a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2v1.2h5.2v-1.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3.5z\"/></svg>Ideas</button></div>\n  <p class=\"kind-hint\" id=\"kindHint\">Pick a date to put it on the calendar.</p>\n  <div class=\"calchips\" id=\"fCal\"></div>\n  <label for=\"fTitle\">Plan</label>\n  <input id=\"fTitle\" autocomplete=\"off\">\n  <label>Date</label>\n  <div class=\"datebtns\">\n    <!-- the real date input sits invisibly over the button, so a tap opens the iPhone date picker -->\n    <span class=\"dbtn datepick\"><svg viewBox=\"0 0 24 24\"><rect x=\"4\" y=\"5.5\" width=\"16\" height=\"14\" rx=\"2.5\"/><path d=\"M4 10h16M8.5 3.5v4M15.5 3.5v4\"/></svg><span id=\"dateLabel\">Set date</span><input id=\"fDate\" type=\"date\" aria-label=\"Date\"></span>\n    <button type=\"button\" class=\"dbtn\" id=\"clearDate\">Remove date</button>\n  </div>\n  <div class=\"timerow\" id=\"timeRow\">\n    <button type=\"button\" class=\"allday\" id=\"allDay\">All day</button>\n    <span class=\"tfield\" id=\"startWrap\"><span>Starts</span><input id=\"fStart\" type=\"time\" aria-label=\"Start time\"></span>\n    <span class=\"tfield\" id=\"endWrap\"><span>Ends</span><input id=\"fEnd\" type=\"time\" aria-label=\"End time\"></span>\n  </div>\n  <label for=\"fPlace\">Where</label>\n  <input id=\"fPlace\" autocomplete=\"off\" placeholder=\"Park, venue, a friend’s house…\">\n  <label for=\"fNote\">Note</label>\n  <textarea id=\"fNote\" placeholder=\"Who's coming, tickets, what to bring\u2026\"></textarea>\n  <div class=\"row\"><button class=\"del\" id=\"delBtn\">Delete</button><button class=\"done\" id=\"doneBtn\">Done</button></div>\n</div>\n<div class=\"sheet\" id=\"feedSheet\">\n  <h3>Plans in your Calendar</h3>\n  <p class=\"feed-p\">Every plan on the calendar tab shows up in a <b>Home Board Plans</b> calendar on this phone, and stays up to date by itself (the iPhone checks about once an hour). Set it up once on each phone.</p>\n  <button type=\"button\" class=\"feed-go\" id=\"feedGo\">Subscribe on this phone</button>\n  <button type=\"button\" class=\"feed-copy\" id=\"feedCopy\">Copy link</button>\n  <p class=\"feed-note\" id=\"feedNote\"></p>\n  <div class=\"row\"><button class=\"done\" id=\"feedDone\">Done</button></div>\n</div>\n",

  mount: function (root) {
    root.innerHTML = this.html;

    var db = HB.db;

    var $ = function (id) { return root.querySelector("#" + id); };

    // shared helpers from the app shell
    var swipeable = HB.swipeable, deleteWithUndo = HB.deleteWithUndo, notPending = HB.notPending, flushDelete = HB.flushDelete;
    function reveal(id) { HB.reveal(root, id); }
    var lastAdded = null;
    function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
    var toast = HB.toast;
    function oops(res) { if (res && res.error) { toast("Couldn't save. Check your connection."); loadAll(); return true; } return false; }
    var openId = null;

    // Tap-through pills: repaint the pill now, but hold the list still (and the save) until
    // the taps stop, so you can cycle past options without the row jumping away.
    var SETTLE_MS = 1500, settleT = null, pendingSaves = {}, afterSettle = null;
    function settleLater(key, saveFn, then) {
      pendingSaves[key] = saveFn; if (then) afterSettle = then;
      clearTimeout(settleT);
      settleT = setTimeout(function () {
        settleT = null;
        var fns = pendingSaves; pendingSaves = {};
        Object.keys(fns).forEach(function (k) { fns[k](); });
        var f = afterSettle; afterSettle = null;
        render(); if (f) f();
      }, SETTLE_MS);
    }

    // quick-add bar sits right on top of the iPhone keyboard
    function hugKeyboard() {
      var vv = window.visualViewport, q = $("quickSheet");
      if (!vv || !q.classList.contains("show")) { q.style.bottom = ""; return; }
      q.style.bottom = Math.max(0, window.innerHeight - vv.height - vv.offsetTop) + "px";
    }
    if (window.visualViewport) { visualViewport.addEventListener("resize", hugKeyboard); visualViewport.addEventListener("scroll", hugKeyboard); }
    function paintQuick() {
      $("addCal").classList.toggle("wait", !quickWhen);   // faded until there's a date
      $("quickWhen").classList.remove("need");
    }
    function showQuick() {
      $("quickText").value = ""; paintQuick(); paintQuickCal(); paintQuickCal();
      $("quickSheet").classList.add("show"); $("sheetBg").classList.add("show"); $("quickText").focus(); hugKeyboard();
    }
    function closeQuick() {
      $("quickSheet").style.bottom = ""; $("quickSheet").classList.remove("show"); $("sheetBg").classList.remove("show");
      if (document.activeElement) document.activeElement.blur();
    }
    function showSheet() { $("sheet").classList.add("show"); $("sheetBg").classList.add("show"); }
    function hideSheet() { if (document.activeElement) document.activeElement.blur(); $("sheet").classList.remove("show"); $("sheetBg").classList.remove("show"); }

    // ---- Plans ----
    var plans = [];   // [{id, name, note, date ('YYYY-MM-DD' or null), created_at}]
    var MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    var FULLMON = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    var DOW = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    var CAL = '<svg viewBox="0 0 24 24"><rect x="4" y="5.5" width="16" height="14" rx="2.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/></svg>';
    function iso(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
    function parse(s) { var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
    function add(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
    var today, monday0;
    function computeDates() {
      today = new Date(); today.setHours(0, 0, 0, 0);
      monday0 = add(today, -((today.getDay() + 6) % 7));
    }
    computeDates();
    // an idea can have a date (a maybe for that day); only On the Calendar goes on the calendar
    function isIdea(p) { return !!p.idea || !p.date; }
    // calendars (Family settings): each plan belongs to one; colours match the person everywhere
    function calOf(p) { return HB.calOf(p.cal || ""); }
    function calBg(p) { return HB.colorVar(HB.calColor(calOf(p))); }
    var filter = "all";
    try { filter = localStorage.getItem("hb-plan-filter") === "fun" ? "fun" : "all"; } catch (e) {}
    function shown(p) { return filter === "all" || !!calOf(p).fun; }   // Fun = any starred calendar
    root.querySelectorAll("#pFilter button").forEach(function (b) {
      b.addEventListener("click", function () {
        filter = b.dataset.f; try { localStorage.setItem("hb-plan-filter", filter); } catch (e) {}
        render(); window.scrollTo(0, 0);
      });
    });
    function byId(id) { for (var i = 0; i < plans.length; i++) if (plans[i].id === id) return plans[i]; return null; }
    function save(p, fields) { db.from("plans").update(fields).eq("id", p.id).then(oops); }

    function daysAway(v) { return Math.round((parse(v) - today) / 86400000); }
    // "18:30" -> "6:30 PM"; a range drops the repeated AM/PM ("6:30 – 8:30 PM")
    function fmtTime(t) { var h = +t.slice(0, 2), m = t.slice(3, 5); return (h % 12 || 12) + (m !== "00" ? ":" + m : "") + (h < 12 ? " AM" : " PM"); }
    function timeLabel(p) {
      if (!p.start_time) return "";
      var a = fmtTime(p.start_time);
      if (!p.end_time) return a;
      var b = fmtTime(p.end_time);
      if (a.slice(-2) === b.slice(-2)) a = a.slice(0, -3);
      return a + " – " + b;
    }
    function whenLine(p) { return [p.date ? timeLabel(p) : "", p.location || ""].filter(Boolean).join(" · "); }
    function soonLabel(v) { var n = daysAway(v); return n === 0 ? "Today" : n === 1 ? "Tomorrow" : n < 7 ? "In " + n + " days" : ""; }
    function paintWhen(el, v) {
      var t = el.querySelector("b") || el;
      el.classList.remove("idea");
      var inp = el.querySelector("input"); if (inp) { inp.value = v || ""; inp.min = iso(today); }
      if (!v) { t.innerHTML = CAL; el.classList.add("idea"); el.setAttribute("aria-label", "Pick a date"); return; }
      var d = parse(v); t.textContent = DOW[d.getDay()] + " " + d.getDate();
    }

    var EYE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
    var EYE_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.3 4.1M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7a9.8 9.8 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>';
    var view = "up";          // always opens on On the Calendar
    var showLater = false;    // eye: show plans beyond the next two months
    $("laterBtn").addEventListener("click", function () { showLater = !showLater; render(); });
    root.querySelectorAll("#seg button").forEach(function (b) {
      b.addEventListener("click", function () { view = b.dataset.v; render(); window.scrollTo(0, 0); });
    });

    // ---- moving between the two lists (swipe a row left) ----
    var ICON_CAL = '<svg viewBox="0 0 24 24"><rect x="4" y="5.5" width="16" height="14" rx="2.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4M9 14.8l2 2 4-4"/></svg>';
    var ICON_BULB = '<svg viewBox="0 0 24 24"><path d="M9 17.5h6M10 20.5h4M12 3.5a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2v1.2h5.2v-1.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3.5z"/></svg>';
    function moveTo(p, idea, date) {
      HB.closeSwipe();
      var ch = { idea: idea }; if (date) ch.date = date;
      Object.assign(p, ch); save(p, ch);
      setTimeout(function () { render(); }, 200);
      toast(p.name + (idea ? " → Ideas" : " → On the Calendar"));
    }
    function moveBtn(p, toIdea) {
      var b = document.createElement("span"); b.className = "swbg " + (toIdea ? "to-idea" : "to-cal");
      b.setAttribute("role", "button");
      b.innerHTML = (toIdea ? ICON_BULB + "To Ideas" : ICON_CAL + "To Calendar");
      if (!toIdea && !p.date) {
        // no date yet: open it with Calendar chosen, so you pick the date there (closing without one keeps it an idea)
        b.addEventListener("click", function () { HB.closeSwipe(); openSheet(p.id); sheetKind = "up"; paintKind(); });
      } else b.addEventListener("click", function () { moveTo(p, toIdea); });
      return b;
    }
    function tileRow(p) {
      var el = document.createElement("div"); el.className = "item up"; el.dataset.id = p.id;
      var d = parse(p.date), sl = soonLabel(p.date);
      el.innerHTML = '<button class="tile" aria-label="Change date" style="background:' + calBg(p) + '">' +
        '<span class="d">' + DOW[d.getDay()] + '</span><span class="n">' + d.getDate() + '</span></button>' +
        '<button class="main"><div class="name">' + esc(p.name) + '</div>' +
        (whenLine(p) ? '<div class="when-line">' + esc(whenLine(p)) + '</div>' : '') +
        (p.note ? '<div class="note">' + esc(p.note) + '</div>' : '') +
        (sl ? '<div class="soon">' + sl + '</div>' : '') + '</button>';
      el.querySelector(".tile").addEventListener("click", function () { openSheet(p.id, true); });
      el.querySelector(".main").addEventListener("click", function () { openSheet(p.id); });
      return swipeable(el, deleter(p), moveBtn(p, true));
    }
    function deleter(p) {
      return function () {
        if (String(p.id).indexOf("tmp") === 0) return;
        plans = plans.filter(function (x) { return x !== p; }); render();
        deleteWithUndo(p.id, p.name,
          function () { db.from("plans").delete().eq("id", p.id).then(oops); },
          function () { plans.push(p); render(); });
      };
    }
    function ideaRow(p) {
      var el = document.createElement("div"); el.className = "item"; el.dataset.id = p.id;
      el.innerHTML = '<button class="main"><div class="name"><i class="cdot" style="background:' + calBg(p) + '"></i>' + esc(p.name) + '</div>' +
        (p.location ? '<div class="when-line">' + esc(p.location) + '</div>' : '') +
        (p.note ? '<div class="note">' + esc(p.note) + '</div>' : '') + '</button><span class="when"><b></b><input type="date" class="wpick" aria-label="Date for ' + esc(p.name) + '"></span>';
      var w = el.querySelector(".when"); paintWhen(w, p.date);
      // tap = the phone's calendar; it stays an idea (open it and tap On the Calendar to make it a plan)
      w.querySelector("input").addEventListener("change", function (e) {
        var v = e.target.value || null;
        if (v === (p.date || null)) return;
        p.date = v; p.idea = true; paintWhen(w, v); save(p, { date: v, idea: true });
        setTimeout(render, 700);
      });
      el.querySelector(".main").addEventListener("click", function () { openSheet(p.id); });
      return swipeable(el, deleter(p), moveBtn(p, false));
    }
    function render() {
      publishFeed();   // keep the Calendar feed in step (waits a moment, skips if nothing changed)
      computeDates();
      $("list").innerHTML = "";
      var upcoming = plans.filter(function (p) { return !isIdea(p) && parse(p.date) >= today && shown(p); }).sort(function (a, b) { return a.date < b.date ? -1 : 1; });
      // ideas: dated ones first (soonest first), then the rest newest first
      var ideas = plans.filter(function (p) { return isIdea(p) && shown(p); }).sort(function (a, b) {
        if (!!a.date !== !!b.date) return a.date ? -1 : 1;
        if (a.date && b.date && a.date !== b.date) return a.date < b.date ? -1 : 1;
        return a.created_at < b.created_at ? 1 : -1;
      });
      $("nUp").textContent = upcoming.length || ""; $("nIdeas").textContent = ideas.length || "";
      root.querySelectorAll("#seg button").forEach(function (b) { b.classList.toggle("on", b.dataset.v === view); });
      root.querySelectorAll("#pFilter button").forEach(function (b) { b.classList.toggle("on", b.dataset.f === filter); });
      // Ideas: idea | when chip.  On the Calendar: date tile | plan
      $("colTitle").textContent = view === "ideas" ? "Idea" : "When";
      $("colWhen").textContent = view === "ideas" ? "When" : "Plan";
      $("cols").classList.toggle("up", view !== "ideas");
      $("count").textContent = "";
      $("laterBtn").hidden = view === "ideas";
      $("laterBtn").classList.toggle("on", showLater);
      $("laterBtn").innerHTML = showLater ? EYE_OFF : EYE;
      if (view === "ideas") {
        ideas.forEach(function (p) { $("list").appendChild(ideaRow(p)); });
        if (!ideas.length) $("list").innerHTML = '<div class="empty">' + (filter === "fun" ? "No Fun ideas yet." : "No ideas yet. Tap + to add some.") + '</div>';
        return;
      }
      var horizon = add(today, 7 * 8);   // about two months ahead, unless the eye is on
      var soon = showLater ? upcoming : upcoming.filter(function (p) { return parse(p.date) <= horizon; });
      var hiddenLater = upcoming.length - soon.length;
      var lastMonth = -1;   // always label the first month too
      soon.forEach(function (p) {
        var m = parse(p.date).getMonth();
        if (m !== lastMonth) { var h = document.createElement("div"); h.className = "month"; h.textContent = FULLMON[m]; $("list").appendChild(h); lastMonth = m; }
        $("list").appendChild(tileRow(p));
      });
      if (!soon.length && !hiddenLater) $("list").innerHTML = '<div class="empty">' + (filter === "fun" ? "Nothing Fun on the calendar yet." : "Nothing on the calendar yet. Check Ideas.") + '</div>';
      if (hiddenLater) {
        var more = document.createElement("button"); more.type = "button"; more.className = "more-later";
        more.textContent = hiddenLater + " more after " + MON[horizon.getMonth()] + " " + horizon.getDate() + " · Show";
        more.addEventListener("click", function () { showLater = true; render(); });
        $("list").appendChild(more);
      }
    }

    // ---- quick add: name, optional weekend, Enter for the next one ----
    var quickWhen = "";
    $("quickDate").addEventListener("change", function () { quickWhen = $("quickDate").value || ""; paintWhen($("quickWhen"), quickWhen); paintQuick(); });
    $("addIdea").addEventListener("click", function () { addQuick(true); });
    // the calendar needs a date: without one, point at the date button instead of adding
    $("addCal").addEventListener("click", function () {
      if (quickWhen) { addQuick(false); return; }
      var w = $("quickWhen"); w.classList.remove("need"); void w.offsetWidth; w.classList.add("need");
      toast("Pick a date first");
    });
    $("addBtn").addEventListener("click", function () {
      quickWhen = ""; paintWhen($("quickWhen"), "");
      $("quickText").placeholder = "What’s the plan?";
      showQuick();
    });
    // Enter on the keyboard: a date means the calendar, no date means Ideas
    $("quickSheet").addEventListener("submit", function (e) { e.preventDefault(); addQuick(!quickWhen); });
    var quickCal = "";
    try { quickCal = localStorage.getItem("hb-plan-cal") || ""; } catch (e) {}
    function paintQuickCal() {
      var c = HB.calOf(quickCal); quickCal = c.id;
      $("quickCal").querySelector("i").style.background = HB.colorVar(HB.calColor(c));
      $("quickCal").querySelector("span").textContent = c.name;
    }
    $("quickCal").addEventListener("click", function () {
      var cs = HB.calendars(), i = cs.indexOf(HB.calOf(quickCal));
      quickCal = cs[(i + 1) % cs.length].id; paintQuickCal(); $("quickText").focus();
      try { localStorage.setItem("hb-plan-cal", quickCal); } catch (e) {}
    });
    function addQuick(idea) {
      var v = $("quickText").value.trim();
      if (!v) { toast("Type what the plan is first."); $("quickText").focus(); return; }
      var date = quickWhen || null;
      if (!idea && !date) return;
      var cal = HB.calOf(quickCal).id;
      var temp = { id: "tmp" + Date.now() + Math.random(), name: v, note: "", date: date, idea: idea, cal: cal, created_at: new Date().toISOString() };
      view = idea ? "ideas" : "up";   // land on the list it went into
      closeQuick();
      plans.push(temp); render(); lastAdded = temp.id; reveal(temp.id);
      toast(idea ? "Added to Ideas" : "Added to the calendar");
      db.from("plans").insert({ name: v, date: date, idea: idea, cal: cal }).select().single().then(function (res) {
        if (oops(res)) return;
        if (lastAdded === temp.id) lastAdded = res.data.id;
        var i = plans.indexOf(temp);
        if (byId(res.data.id)) { if (i >= 0) plans.splice(i, 1); } else if (i >= 0) plans[i] = res.data; else plans.push(res.data);
        render(); if (lastAdded === res.data.id) reveal(res.data.id);
      });
    }

    // ---- edit sheet: exact date (any day) via the phone's date picker ----
    function openSheet(id, toDate) {
      var p = byId(id); if (!p || String(p.id).indexOf("tmp") === 0) return;
      openId = id; $("fTitle").value = p.name; $("fNote").value = p.note || ""; $("fDate").value = p.date || "";
      $("fPlace").value = p.location || ""; $("fStart").value = p.start_time || ""; $("fEnd").value = p.end_time || "";
      allDay = !p.start_time; paintTimes();
      sheetKind = isIdea(p) ? "idea" : "up"; paintKind();
      sheetCal = calOf(p).id; paintSheetCal();
      showSheet();
      paintCal();
      if (toDate) { $("fDate").focus(); try { $("fDate").showPicker(); } catch (e) {} }
    }
    $("clearDate").addEventListener("click", function () { $("fDate").value = ""; paintCal(); });
    // On the Calendar <-> Idea
    var sheetKind = "idea", sheetCal = "";
    function paintSheetCal() {
      $("fCal").innerHTML = HB.calendars().map(function (c) {
        return '<button type="button" data-c="' + esc(c.id) + '"' + (c.id === sheetCal ? ' class="on"' : '') + '><i style="background:' + HB.colorVar(HB.calColor(c)) + '"></i>' + esc(c.name) + '</button>';
      }).join("");
    }
    $("fCal").addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) { sheetCal = b.dataset.c; paintSheetCal(); } });
    function paintKind() {
      root.querySelectorAll("#fKind button").forEach(function (b) { b.classList.toggle("on", b.dataset.k === sheetKind); });
      $("kindHint").hidden = !(sheetKind === "up" && !$("fDate").value);
    }
    root.querySelectorAll("#fKind button").forEach(function (b) {
      b.addEventListener("click", function () { sheetKind = b.dataset.k; paintKind(); });
    });
    // "Set date" shows the chosen date once picked; "Remove date" is greyed out until there is one
    function paintCal() {
      var v = $("fDate").value;
      if (v) { var d = parse(v); $("dateLabel").textContent = DOW[d.getDay()] + ", " + MON[d.getMonth()] + " " + d.getDate(); }
      else $("dateLabel").textContent = "Set date";
      $("clearDate").disabled = !v;
      $("timeRow").hidden = !v;          // times only make sense once there's a date
      paintKind();
    }
    // All day (default) <-> start / end times
    var allDay = true;
    function paintTimes() {
      $("allDay").classList.toggle("on", allDay);
      $("startWrap").hidden = allDay; $("endWrap").hidden = allDay;
    }
    $("allDay").addEventListener("click", function () {
      allDay = !allDay;
      if (allDay) { $("fStart").value = ""; $("fEnd").value = ""; }
      else if (!$("fStart").value) { $("fStart").value = "18:00"; $("fEnd").value = "19:00"; lastStart = "18:00"; }
      paintTimes();
    });
    // moving the start keeps the same length (like the Calendar app); no end yet = 1 hour
    function mins(t) { return +t.slice(0, 2) * 60 + +t.slice(3, 5); }
    function hhmm(n) { n = Math.max(0, Math.min(23 * 60 + 59, n)); return String(Math.floor(n / 60)).padStart(2, "0") + ":" + String(n % 60).padStart(2, "0"); }
    var lastStart = "";
    $("fStart").addEventListener("focus", function () { lastStart = $("fStart").value; });
    $("fStart").addEventListener("change", function () {
      var a = $("fStart").value, b = $("fEnd").value; if (!a) return;
      var len = lastStart && b && mins(b) > mins(lastStart) ? mins(b) - mins(lastStart) : 60;
      $("fEnd").value = hhmm(mins(a) + len); lastStart = a;
    });
    $("fDate").addEventListener("input", paintCal); $("fDate").addEventListener("change", paintCal);

    // ---- calendar text helpers. A time in the name or note ("2pm", "6:30 pm") makes a 2-hour event; otherwise all-day.
    function icsText(v) { return String(v || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n"); }
    function stamp(d) { return d.getFullYear() + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0") + "T" + String(d.getHours()).padStart(2, "0") + String(d.getMinutes()).padStart(2, "0") + "00"; }
    // ---- Plans calendar feed ----
    // One calendar file with every dated plan. Each phone subscribes to it once in the Calendar app;
    // this page rewrites the file whenever the plans change. The file name has a long random code
    // (kept in the household-only app_settings table), so only people with the link can read it.
    var feedPath = null, feedLast = null, loadedOnce = false;
    try { feedLast = localStorage.getItem("hb-feed-sum"); } catch (e) {}
    function fold(line) {   // calendar files want lines of at most 75 characters
      var out = [], s = line;
      while (s.length > 74) { out.push(s.slice(0, 74)); s = " " + s.slice(74); }
      out.push(s); return out.join("\r\n");
    }
    function eventLines(p) {
      var d = parse(p.date), ymd = p.date.replace(/-/g, ""), note = p.note || "";
      var t = (p.name + " " + note).match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm|a|p)\b/i);
      var made = new Date(p.created_at || Date.now()).toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
      var L = ["BEGIN:VEVENT", "UID:" + p.id + "@home-board", "DTSTAMP:" + made];
      if (t) {
        var h = (+t[1] % 12) + (/p/i.test(t[3]) ? 12 : 0), start = new Date(d); start.setHours(h, +(t[2] || 0), 0, 0);
        var end = new Date(start.getTime() + 2 * 3600000);
        L.push("DTSTART:" + stamp(start), "DTEND:" + stamp(end));
      } else L.push("DTSTART;VALUE=DATE:" + ymd, "DTEND;VALUE=DATE:" + iso(add(d, 1)).replace(/-/g, ""));
      L.push("SUMMARY:" + icsText(p.name));
      if (note) L.push("DESCRIPTION:" + icsText(note));
      L.push("END:VEVENT");
      return L;
    }
    function buildFeed(list) {
      var from = iso(add(new Date(), -60));
      var L = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Home Board//Plans//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
               "X-WR-CALNAME:Home Board Plans", "X-WR-TIMEZONE:America/New_York",
               "REFRESH-INTERVAL;VALUE=DURATION:PT1H", "X-PUBLISHED-TTL:PT1H"];
      list.filter(function (p) { return !isIdea(p) && p.date >= from && String(p.id).indexOf("tmp") !== 0; })
          .sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : String(a.id) < String(b.id) ? -1 : 1; })
          .forEach(function (p) { L = L.concat(eventLines(p)); });
      L.push("END:VCALENDAR");
      return L.map(fold).join("\r\n") + "\r\n";
    }
    function checksum(t) { var h = 0; for (var i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) | 0; return String(h) + ":" + t.length; }
    function findFeed() {
      if (feedPath) return Promise.resolve(feedPath);
      return db.from("app_settings").select("value").eq("key", "calendar_feed").then(function (r) {
        var row = r.data && r.data[0];
        if (r.error || !row) return null;
        feedPath = "plans-" + row.value + ".ics"; return feedPath;
      });
    }
    var feedT = null;
    function publishFeed() {
      if (HB.viewer || !loadedOnce) return;
      clearTimeout(feedT);
      feedT = setTimeout(function () {
        var text = buildFeed(plans.filter(notPending)), sum = checksum(text);
        if (sum === feedLast) return;
        findFeed().then(function (path) {
          if (!path) return;
          db.storage.from("calendar").upload(path, new Blob([text], { type: "text/calendar" }), { upsert: true, contentType: "text/calendar", cacheControl: "300" }).then(function (res) {
            if (res.error) return;
            feedLast = sum; try { localStorage.setItem("hb-feed-sum", sum); } catch (e) {}
          });
        });
      }, 1500);
    }
    function feedUrl() { return db.storage.from("calendar").getPublicUrl(feedPath).data.publicUrl; }
    function showFeedSheet() { $("feedSheet").classList.add("show"); $("sheetBg").classList.add("show"); }
    function hideFeedSheet() { $("feedSheet").classList.remove("show"); $("sheetBg").classList.remove("show"); }
    $("feedBtn").addEventListener("click", function () {
      $("feedNote").textContent = "";
      findFeed().then(function (path) {
        if (!path) { toast("The calendar link isn't set up on the server yet"); return; }
        feedLast = null; publishFeed();   // make sure the file is there and current
        showFeedSheet();
      });
    });
    $("feedGo").addEventListener("click", function () {
      // webcal:// is the link type that makes the iPhone offer "Subscribe"
      location.href = feedUrl().replace(/^https?:/, "webcal:");
    });
    $("feedCopy").addEventListener("click", function () {
      var url = feedUrl();
      var ok = function () { $("feedNote").textContent = "Copied. On a phone: Settings → Apps → Calendar → Calendar Accounts → Add Account → Other → Add Subscribed Calendar, then paste."; };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(ok, function () { $("feedNote").textContent = url; });
      else $("feedNote").textContent = url;
    });
    $("feedDone").addEventListener("click", hideFeedSheet);
    function closeSheet(keep) {
      var p = byId(openId);
      if (p && keep) {
        var ch = { name: $("fTitle").value.trim() || p.name, note: $("fNote").value.trim(), date: $("fDate").value || null,
                   idea: sheetKind === "idea" || !$("fDate").value, cal: sheetCal,
                   location: $("fPlace").value.trim(),
                   start_time: !allDay && $("fDate").value ? $("fStart").value : "",
                   end_time: !allDay && $("fDate").value && $("fStart").value ? $("fEnd").value : "" };
        var same = function (k) { return String(ch[k] || "") === String(p[k] || ""); };
        var wasIdea = isIdea(p);
        if (!["name", "note", "date", "location", "start_time", "end_time"].every(same) || !!p.idea !== ch.idea || calOf(p).id !== ch.cal) { Object.assign(p, ch); save(p, ch); }
        if (wasIdea !== isIdea(p)) toast(p.name + (isIdea(p) ? " → Ideas" : " → On the Calendar"));
      }
      openId = null; hideSheet(); render();
    }
    $("doneBtn").addEventListener("click", function () { closeSheet(true); });
    $("delBtn").addEventListener("click", function () {
      var id = openId; plans = plans.filter(function (x) { return x.id !== id; }); closeSheet(false);
      db.from("plans").delete().eq("id", id).then(oops);
    });
    $("sheetBg").addEventListener("click", function () {
      if ($("feedSheet").classList.contains("show")) hideFeedSheet();
      else if ($("quickSheet").classList.contains("show")) closeQuick(); else closeSheet(true);
    });

    function loadAll() {
      return db.from("plans").select("*").then(function (r) {
        if (r.error) { toast("Couldn't load plans."); return; }
        plans = (r.data || []).filter(notPending);
        loadedOnce = true;
        if (!openId && !settleT) render();
        openWanted();
        publishFeed();
      });
    }
    // keep "Tomorrow" / "In 3 days" fresh past midnight while the app stays open
    setInterval(function () { if (started && !openId && !settleT) render(); }, 60000);

    // ---- load + live sync ----
    var reloadT;
    function soon() { clearTimeout(reloadT); reloadT = setTimeout(loadAll, 250); }
    var started = false;
    function START() {
      if (started) { loadAll(); return; }
      started = true;
      db.channel("plans" + "-live").on("postgres_changes", { event: "*", schema: "public", table: "plans" }, soon).subscribe();
      render(); loadAll();
    }

    // hooks the app shell calls
    this.refresh = function () { if (started) loadAll(); };   // phone woke up, or this tab opened again
    this.shown = function () {
      if (HB.planToOpen) { openWanted(); return; }
      if (view !== "up") { view = "up"; render(); }   // always opens on On the Calendar
    };
    // At a Glance: tapping a plan's tag opens it here
    function openWanted() {
      var id = HB.planToOpen; if (!id) return;
      if (!byId(id)) { if (!loadedOnce) return; HB.planToOpen = null; toast("That plan was removed."); return; }
      HB.planToOpen = null; view = isIdea(byId(id)) ? "ideas" : "up"; render(); openSheet(id);
    }
    HB.onFamily(function () { if (started && !openId) { render(); paintQuickCal(); } });   // calendar names / colours changed
    START();
  }
});
