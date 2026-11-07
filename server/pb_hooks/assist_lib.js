// Home Board assistant: the shared engine behind the assistant button (and, later, the chat page).
// Loaded with require from assist.pb.js; not a hook file itself.
//
// How it works: the text (or the words Whisper heard) goes to the language model on bkllm together with
// the household's store names and the usual items that sound like what was said (grocery_usuals). The model may only answer with actions from ACTIONS below, as JSON in a
// fixed shape. This file checks every action and saves it itself, for the signed-in editor's household.
// The model never touches the database.
//
// Settings live in PocketBase's environment on bkweb (sudo systemctl edit pocketbase):
//   HB_ASSIST_OLLAMA   e.g. http://192.168.197.50:11434   (required)
//   HB_ASSIST_WHISPER  e.g. http://192.168.197.50:8080    (for the mic button)
//   HB_ASSIST_MODEL    default qwen2.5:7b
//   HB_ASSIST_FASTPATH set to "off" to send everything to the model (see quickList below)
//
// Adding an action later (to-dos, plans, meals, Binder...): add an entry to ACTIONS with a line for the
// model (`describe`), the fields it fills (`fields`) and `run`, which saves it and returns what was done.

const MAX_TEXT = 2000;
const MAX_ACTIONS = 25;

function cfg() {
  return {
    ollama: String($os.getenv("HB_ASSIST_OLLAMA") || "").replace(/\/+$/, ""),
    whisper: String($os.getenv("HB_ASSIST_WHISPER") || "").replace(/\/+$/, ""),
    model: String($os.getenv("HB_ASSIST_MODEL") || "qwen2.5:7b"),
    fast: String($os.getenv("HB_ASSIST_FASTPATH") || "").toLowerCase() !== "off",
    // the language model is optional: with HB_ASSIST_LLM=off (or no HB_ASSIST_OLLAMA) every message is
    // handled as a plain list (listOnly below): usual items, sound-alike fixes, anything new as said
    llm: !!$os.getenv("HB_ASSIST_OLLAMA") && String($os.getenv("HB_ASSIST_LLM") || "").toLowerCase() !== "off",
  };
}

function nowIso() { return new Date().toISOString(); }
function clean(s, max) { return String(s == null ? "" : s).replace(/\s+/g, " ").trim().slice(0, max || 200); }
function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

// ---- what the assistant is allowed to do ----
const ACTIONS = {
  add_grocery: {
    describe: "add_grocery: put one thing to buy on the grocery list. name = a short shopping-list name; store = one of the store names, only when the message names that store.",
    fields: { name: { type: "string" }, store: { type: "string" } },
    run(app, me, a, ctx) {
      let name = cap(clean(a.name, 120));
      if (!name) return null;
      const usual = ctx.u.find(app, me.getString("household"), name);
      if (usual) name = usual.getString("name");        // the family's own spelling of a usual item
      if (ctx.onList[name.toLowerCase()]) return { type: "add_grocery", skipped: true, name: name, label: name + " (already on the list)" };
      const storeName = clean(a.store, 80).toLowerCase();
      const store = storeName ? ctx.stores.find((s) => s.getString("name").toLowerCase() === storeName) : null;
      const r = new Record(app.findCollectionByNameOrId("grocery_items"));
      r.set("name", name);
      r.set("store_id", store ? store.id : "");          // no store named: usuals.pb.js fills in the usual one
      r.set("done", false);
      r.set("household", me.getString("household"));
      r.set("created_at", nowIso()); r.set("updated_at", nowIso());
      app.save(r);
      ctx.onList[name.toLowerCase()] = true;
      const st = ctx.stores.find((s) => s.id === r.getString("store_id"));
      return { type: "add_grocery", table: "grocery_items", id: r.id, name: name, store: st ? st.getString("name") : "",
               label: name + (st ? " (" + st.getString("name") + ")" : "") };
    },
  },
};

// the household's grocery stores, the names already waiting on the list, and its usual items
function groceryContext(app, household) {
  const u = require(`${__hooks}/usuals_lib.js`);
  const stores = app.findRecordsByFilter("grocery_stores", "household = {:h}", "position", 100, 0, { h: household });
  const items = app.findRecordsByFilter("grocery_items", "household = {:h} && done = false", "", 2000, 0, { h: household });
  const onList = {};
  items.forEach((r) => { onList[r.getString("name").trim().toLowerCase()] = true; });
  return { stores: stores, onList: onList, u: u, usuals: u.top(app, household, 5000) };
}

// The usual items that share a word with what was said (so the prompt stays short and fast): "red bag chicken"
// brings in "Red bag chicken", "Chicken bouillon"... Sorted by name, so the same request gives the same prompt.
function wordsOf(s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/)
    .filter((w) => w.length >= 3).map((w) => w.replace(/(ies)$/, "y").replace(/([^s])s$/, "$1"));
}
function usualsFor(ctx, text) {
  const said = {}; wordsOf(text).forEach((w) => { said[w] = true; });
  return ctx.usuals.filter((x) => wordsOf(x.name).some((w) => said[w])).slice(0, 40)
    .sort((a, b) => (a.name < b.name ? -1 : 1));
}

// A hint for Whisper: the household's store names and most-bought items, so it spells them right.
function hintFor(app, household) {
  const u = require(`${__hooks}/usuals_lib.js`);
  const stores = app.findRecordsByFilter("grocery_stores", "household = {:h}", "position", 50, 0, { h: household }).map((s) => s.getString("name"));
  const names = u.top(app, household, 40).map((x) => x.name);
  return clean("Grocery list. Stores: " + stores.join(", ") + ". Items: " + names.join(", ") + ".", 600);
}

// The instructions stay word-for-word the same from one request to the next (only the store names can
// change), so Ollama keeps them read and only has to read the short part that changes: the message.
function systemPrompt(ctx) {
  const stores = ctx.stores.map((s) => s.getString("name")).filter(Boolean);
  return [
    "You turn a family's short messages into actions for their Home Board app.",
    "Allowed actions:",
    Object.keys(ACTIONS).map((k) => "- " + ACTIONS[k].describe).join("\n"),
    "Grocery stores: " + (stores.length ? stores.join(", ") : "(none set up)") + ".",
    "The message may come with their usual items that sound like it. When what they said means one of these, use that exact name, and leave store empty unless they named a store (the usual store is filled in for you).",
    "Rules for groceries: one action per thing to buy. Include EVERY item they mention, even in a long list; never drop one.",
    "Anything they want to buy goes on the list, not only food: household things like light bulbs, paper towels, batteries or dog food count too.",
    "Short names like a shopping list (Milk, Ground beef, Taco shells, Chicken bouillon).",
    "If they say where they are going or shopping (\"going to Costco\", \"at Aldi\"), use that store for every item that doesn't name a different one.",
    "Speech-to-text may split one item with a period or comma (\"chicken. Bullion\" means Chicken bouillon); join it back and fix the spelling.",
    "Speech-to-text also mishears food words. When words make no sense as something to buy, use the item they most likely were (\"fissory chicken\" means Rotisserie chicken, \"key no a\" means Quinoa).",
    "Turn vague requests into the usual items (\"taco stuff\" means Taco shells, Ground beef, Shredded cheese, Salsa).",
    "Keep an amount only if they said one, in the name (Eggs, 2 dozen). Never invent a store.",
    "If the message isn't something these actions can do, return no actions and say briefly that you can only add groceries for now.",
    "reply: one short, friendly sentence about what you did.",
    "Answer only with JSON exactly like this, nothing else:",
    '{"reply": "Added 2 groceries.", "actions": [{"type": "add_grocery", "name": "Milk", "store": ""}, {"type": "add_grocery", "name": "Bread", "store": "Aldi"}]}',
  ].join("\n");
}

// The part that changes every time: the day, the page, the usual items that sound like it, and the words.
function userMessage(ctx, page, text) {
  const d = new Date(Date.now() - 5 * 3600000);   // close enough to New York time for the day
  const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const us = usualsFor(ctx, text);
  return [
    "Today is " + DAYS[d.getUTCDay()] + ", " + d.toISOString().slice(0, 10) + ". They are on the " + (page || "home") + " page.",
    us.length ? "Usual items that may match: " + us.map((x) => x.name + (x.store ? " [" + x.store + "]" : "")).join(", ") + "." : "",
    "Message: " + text,
  ].filter(Boolean).join("\n");
}

// Whisper: an uploaded recording -> the words in it
function transcribe(file, hint) {
  const c = cfg();
  if (!c.whisper) throw new BadRequestError("Voice isn't set up yet. Type it instead.");
  const ext = (String(file.originalName || file.name || "").match(/\.(webm|mp4|m4a|ogg|wav|mp3|aac|caf)$/i) || [".webm"])[0];
  const tmp = $os.tempDir() + "/hb-assist-" + $security.randomString(16) + ext;
  const rd = file.reader.open();
  try { $os.writeFile(tmp, toBytes(rd, 8 * 1048576), 0o600); } finally { rd.close(); }
  let out = "";
  try {
    const args = ["-s", "--max-time", "90", "-F", "file=@" + tmp, "-F", "response_format=json"];
    if (hint) args.push("--form-string", "prompt=" + hint);   // --form-string: the words are sent as-is, never read as a file
    args.push(c.whisper + "/inference");
    out = toString($os.cmd("curl", ...args).output());
  } catch (err) {
    throw new BadRequestError("Couldn't reach the voice helper. Type it instead.");
  } finally {
    try { $os.remove(tmp); } catch (err) {}
  }
  let text = "";
  try { text = String(JSON.parse(out).text || ""); } catch (err) {}
  text = text.replace(/\[[^\]]*\]|\([^)]*\)/g, " ").replace(/\s+/g, " ").trim();   // drop [BLANK_AUDIO], (music) and the like
  if (!text) throw new BadRequestError("Didn't catch that. Try again a little closer to the mic.");
  return text;
}

// ---- the fast path: a plain list of usual items needs no model ----
// "We need red bag chicken, milk and eggs from Aldi" -> pieces "red bag chicken" / "milk" / "eggs" (Aldi).
// Every piece must be one of the household's usual items, or the whole thing goes to the model instead,
// so this can only ever be quicker, never worse. Turn it off with HB_ASSIST_FASTPATH=off.
const FILLER = /^(?:(?:and|also|then|plus|oh|um+|uh+|so|okay|ok|alright|yeah|let'?s see)[\s,]+)*(?:(?:we|i)(?:'re|\u2019re| are)?\s+(?:need|needs|want|out of|running low on|low on|also need)\s+|(?:we|i)\s+(?:need|want)\s+|we'?re out of\s+|(?:out of|running low on|low on|need|needs|get|grab|pick up|picking up|buy|add|put|some|more|another|a couple of|couple of|a few)\s+)*(?:some\s+|a\s+|an\s+|the\s+)?/i;
// "Going to Aldi: red bag chicken, milk and eggs from Costco" -> [{p:"red bag chicken", store:"Aldi"}, ...]
function listPieces(ctx, text) {
  const storeNames = ctx.stores.map((s) => s.getString("name")).filter(Boolean);
  const esc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const storeRe = storeNames.length ? "(" + storeNames.map(esc).join("|") + ")" : null;
  let t = " " + String(text || "").replace(/[\u2018\u2019]/g, "'") + " ";
  // "going to Costco, ..." / "at Aldi we need ..." / "for Costco": a store for the whole list
  let all = "";
  if (storeRe) {
    const g = t.match(new RegExp("\\b(?:going to|heading to|headed to|shopping at|at|for)\\s+" + storeRe + "\\b", "i"));
    if (g) { all = g[1]; t = t.replace(g[0], " "); }
  }
  const pieces = t.split(/[,.;!?]|\band\b|\balso\b|\bplus\b/i);
  const out = [];
  for (let i = 0; i < pieces.length; i++) {
    let p = pieces[i].replace(/\s+/g, " ").trim();
    if (!p) continue;
    let store = all;
    if (storeRe) {
      const f = p.match(new RegExp("\\s+(?:from|at)\\s+" + storeRe + "\\s*$", "i"));
      if (f) { store = f[1]; p = p.slice(0, f.index).trim(); }
    }
    p = p.replace(FILLER, "").replace(/\s+(?:please|too|as well|again)$/i, "").trim();
    if (!p || /^(?:um+|uh+|okay|ok|so|yeah|that'?s it|that'?s all|done)$/i.test(p)) continue;
    out.push({ p: p, store: store });
  }
  return out;
}

// the usual item with this name, allowing for singular and plural
function usualHit(ctx, p) {
  const key = ctx.u.keyOf(p), u = ctx.usualByKey;
  return u[key] || u[key.replace(/s$/, "")] || u[key + "s"] || u[key.replace(/ies$/, "y")] || u[key.replace(/y$/, "ies")] || u[key + "es"] || u[key.replace(/es$/, "")] || null;
}

function quickList(ctx, text) {
  if (!ctx.usuals.length) return null;
  const pieces = listPieces(ctx, text), out = [];
  for (let i = 0; i < pieces.length; i++) {
    const p = pieces[i].p, store = pieces[i].store;
    const hit = usualHit(ctx, p);
    if (!hit) return null;                                // something it doesn't know: let the model handle it all
    out.push({ type: "add_grocery", name: hit.name, store: store });
  }
  return out.length ? out : null;
}

// ---- safety net: the model sometimes leaves a thing out of a list ("kombucha, light bulbs and tomatoes"
// came back without the light bulbs). Any piece of the list that no saved item resembles is added as said.
// "Resembles": a word of 3+ letters close to a word of an item's name, so "chicken. Bullion" is covered by
// "Chicken bouillon" and "fissory chicken" by "Rotisserie chicken".
function wordsIn(s) { return String(s || "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").split(/\s+/).filter((w) => w.length >= 3); }
function near(a, b) {
  if (a === b || a.replace(/(es|s)$/, "") === b.replace(/(es|s)$/, "")) return true;
  if (a.length >= 5 && b.length >= 5 && a.slice(0, 4) === b.slice(0, 4)) return true;
  if (Math.abs(a.length - b.length) > 2) return false;
  const d = []; for (let i = 0; i <= a.length; i++) { d.push([i]); }
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length] <= 2;
}
// a rough "sounds like" key: "bullion" and "bouillon" -> "bln", "key no a" and "quinoa" -> "kn"
function sound(s) {
  s = String(s || "").toLowerCase().replace(/[^a-z]+/g, "").replace(/ph/g, "f").replace(/[cq]/g, "k").replace(/z/g, "s");
  if (!s) return "";
  return (s[0] + s.slice(1).replace(/[aeiouyhw]+/g, "")).replace(/(.)\1+/g, "$1");
}
function missedPieces(ctx, text, names) {
  const got = [], sounds = {};
  names.forEach((n) => {
    wordsIn(n).forEach((w) => { got.push(w); const k = sound(w); if (k.length >= 3) sounds[k] = true; });
    const whole = sound(n); if (whole.length >= 2) sounds[whole] = true;
  });
  const storeWords = {}; ctx.stores.forEach((s) => wordsIn(s.getString("name")).forEach((w) => { storeWords[w] = true; }));
  return listPieces(ctx, text).filter((x) => {
    const ws = wordsIn(x.p).filter((w) => !storeWords[w]);
    if (!ws.length || x.p.split(/\s+/).length > 5) return false;      // a store on its own, or a whole sentence: leave it to the model
    if (sounds[sound(x.p)]) return false;                               // "key no a" -> Quinoa
    return !ws.some((w) => got.some((g) => near(w, g)) || (sound(w).length >= 3 && sounds[sound(w)]));
  });
}

// ---- no-model mode: a usual item that sounds like what was heard ("red back chicken" -> Red bag chicken).
// Every word heard must be close to a word of the item and every word of the item heard, so "chicken"
// never turns into "Rotisserie chicken".
function snapToUsual(ctx, p) {
  const ws = wordsIn(p);
  if (!ws.length) return null;
  const whole = sound(p);
  const close = (a, b) => near(a, b) || (sound(a).length >= 3 && sound(a) === sound(b));
  for (let i = 0; i < ctx.usuals.length; i++) {          // most-bought first
    const name = ctx.usuals[i].name, nw = wordsIn(name);
    if (!nw.length) continue;
    if (whole.length >= 3 && whole === sound(name)) return ctx.usuals[i];
    if (nw.length === ws.length && ws.every((w) => nw.some((n) => close(w, n))) && nw.every((n) => ws.some((w) => close(w, n)))) return ctx.usuals[i];
  }
  return null;
}
function listOnly(app, me, ctx, text) {
  const done = [], skipped = [];
  listPieces(ctx, text).forEach((x) => {
    if (done.length >= MAX_ACTIONS) return;
    if (x.p.split(/\s+/).length > 6) { skipped.push(x.p); return; }   // a whole sentence, not an item
    const hit = usualHit(ctx, x.p) || snapToUsual(ctx, x.p);
    const r = ACTIONS.add_grocery.run(app, me, { type: "add_grocery", name: hit ? hit.name : cap(x.p), store: x.store }, ctx);
    if (r) done.push(r);
  });
  const n = done.filter((d) => !d.skipped).length;
  let reply = n ? "Added " + n + (n === 1 ? " item." : " items.") : done.length ? "Those are already on the list." : "I didn't catch any items. Try a list like \u201cmilk, eggs and bread\u201d.";
  if (skipped.length) reply = done.length ? reply + " Skipped \u201c" + clean(skipped[0], 40) + "\u2026\u201d: say items as a list." : "That sounded like a sentence. Say items as a list, like \u201cmilk, eggs and bread\u201d.";
  return { heard: text, reply: reply, done: done, quick: true };
}

// The main entry: words in, saved actions out.
function run(app, me, text, page) {
  const c = cfg();
  text = String(text || "").trim().slice(0, MAX_TEXT);
  if (!text) throw new BadRequestError("Type or say what to add.");
  const household = me.getString("household");
  const ctx = groceryContext(app, household);
  ctx.usualByKey = {}; ctx.usuals.forEach((x) => { ctx.usualByKey[ctx.u.keyOf(x.name)] = x; });

  if (!c.llm) return listOnly(app, me, ctx, text);

  const quick = c.fast ? quickList(ctx, text) : null;
  if (quick) {
    const done = quick.slice(0, MAX_ACTIONS).map((a) => ACTIONS.add_grocery.run(app, me, a, ctx)).filter(Boolean);
    const n = done.filter((d) => !d.skipped).length;
    return { heard: text, reply: n ? "Added " + n + (n === 1 ? " item." : " items.") : "Those are already on the list.", done: done, quick: true };
  }

  let res;
  try {
    res = $http.send({
      url: c.ollama + "/api/chat", method: "POST", timeout: 120,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        // "json" mode, not the full schema: forcing an exact shape is very slow on a CPU. The shape is
        // spelled out in the prompt instead, and every action is still checked below before anything is saved.
        model: c.model, stream: false, format: "json", keep_alive: "24h",
        options: { temperature: 0, num_predict: 400, num_ctx: 3072 },
        messages: [{ role: "system", content: systemPrompt(ctx) }, { role: "user", content: userMessage(ctx, page, text) }],
      }),
    });
  } catch (err) {
    throw new BadRequestError("Couldn't reach the assistant on bkllm. Add it by hand for now.");
  }
  if (res.statusCode >= 400) throw new BadRequestError("The assistant had a problem (" + res.statusCode + "). Add it by hand for now.");
  let answer = null;
  try { answer = JSON.parse(res.json.message.content); } catch (err) {}
  if (!answer || !Array.isArray(answer.actions)) throw new BadRequestError("The assistant's answer didn't make sense. Try saying it another way.");

  const done = [];
  answer.actions.slice(0, MAX_ACTIONS).forEach((a) => {
    const def = a && ACTIONS[a.type];
    if (!def) return;                                 // anything not on the list is ignored
    const r = def.run(app, me, a, ctx);
    if (r) done.push(r);
  });
  // only when the model did add groceries: a message that wasn't a list ("what's the weather") stays untouched
  let missed = [];
  const groceries = answer.actions.filter((a) => a && a.type === "add_grocery" && a.name);
  if (groceries.length) {
    missed = missedPieces(ctx, text, groceries.map((a) => String(a.name)));
    missed.slice(0, Math.max(0, MAX_ACTIONS - done.length)).forEach((x) => {
      const r = ACTIONS.add_grocery.run(app, me, { type: "add_grocery", name: x.p.charAt(0).toUpperCase() + x.p.slice(1), store: x.store }, ctx);
      if (r) done.push(r);
    });
  }
  const n = done.filter((d) => !d.skipped).length;
  const reply = missed.length ? (n ? "Added " + n + (n === 1 ? " item." : " items.") : "Those are already on the list.") : clean(answer.reply, 300);
  return { heard: text, reply: reply, done: done };
}

module.exports = { cfg, run, transcribe, hintFor, quickList, listPieces, missedPieces, snapToUsual, ACTIONS };
