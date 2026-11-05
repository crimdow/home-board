/// <reference path="../pb_data/types.d.ts" />
// Home Board assistant button: POST /api/hb/assist
//   JSON      { text: "milk, eggs and taco stuff", page: "groceries" }
//   or a form with an `audio` recording (hold-to-talk) and `page`
// Household editors only. The work happens in assist_lib.js (shared with the chat page later).
routerAdd("POST", "/api/hb/assist", (e) => {
  const hb = require(`${__hooks}/hb_lib.js`);
  const assist = require(`${__hooks}/assist_lib.js`);
  const me = hb.editorOf(e);
  const body = e.requestInfo().body || {};
  const page = String(body.page || "").replace(/[^a-z]/g, "").slice(0, 20);

  let text = String(body.text || "");
  let files = [];
  try { files = e.findUploadedFiles("audio") || []; } catch (err) {}
  if (files.length) {
    if ((files[0].size || 0) > 8 * 1048576) throw new BadRequestError("That recording is too long. Keep it under a minute.");
    text = assist.transcribe(files[0]);
  }
  return e.json(200, assist.run($app, me, text, page));
}, $apis.requireAuth(), $apis.bodyLimit(10 * 1048576));

// Is the assistant set up? (The button shows a hint instead of failing when it isn't.)
routerAdd("GET", "/api/hb/assist", (e) => {
  const hb = require(`${__hooks}/hb_lib.js`);
  const assist = require(`${__hooks}/assist_lib.js`);
  hb.editorOf(e);
  const c = assist.cfg();
  return e.json(200, { ready: !!c.ollama, voice: !!c.whisper });
}, $apis.requireAuth());
