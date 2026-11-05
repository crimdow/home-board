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
  return { stores: stores, onList: onList, u: u, usuals: u.top(app, household, 400) };
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
    "Short names like a shopping list (Milk, Ground beef, Taco shells, Chicken bouillon).",
    "If they say where they are going or shopping (\"going to Costco\", \"at Aldi\"), use that store for every item that doesn't name a different one.",
    "Speech-to-text may split one item with a period or comma (\"chicken. Bullion\" means Chicken bouillon); join it back and fix the spelling.",
    "Speech-to-text also mishears food words. When a name isn't a real grocery item, use the item it most likely was (\"fissory chicken\" means Rotisserie chicken, \"key no a\" means Quinoa).",
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

// The main entry: words in, saved actions out.
function run(app, me, text, page) {
  const c = cfg();
  if (!c.ollama) throw new BadRequestError("The assistant isn't set up yet.");
  text = String(text || "").trim().slice(0, MAX_TEXT);
  if (!text) throw new BadRequestError("Type or say what to add.");
  const household = me.getString("household");
  const ctx = groceryContext(app, household);

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
  return { heard: text, reply: clean(answer.reply, 300), done: done };
}

module.exports = { cfg, run, transcribe, hintFor, ACTIONS };
