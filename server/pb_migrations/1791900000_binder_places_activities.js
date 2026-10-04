/// <reference path="../pb_data/types.d.ts" />
// Pocket Binder: Places and Activities.
//  - clips can now be "places" or "activities", with tags (your own labels, e.g. "Fun for family"),
//    info (a place's address, phone, hours, map spot; an activity's date and where), and done (we did it).
//  - the Share-Sheet inbox also carries the page's short description and picture.
migrate((app) => {
  const clips = app.findCollectionByNameOrId("clips");
  const type = clips.fields.getByName("type");
  ["places", "activities"].forEach((v) => { if (type.values.indexOf(v) < 0) type.values.push(v); });
  if (!clips.fields.getByName("tags")) clips.fields.add(new JSONField({ name: "tags", maxSize: 10000 }));
  if (!clips.fields.getByName("info")) clips.fields.add(new JSONField({ name: "info", maxSize: 20000 }));
  if (!clips.fields.getByName("done")) clips.fields.add(new BoolField({ name: "done" }));
  app.save(clips);

  const inbox = app.findCollectionByNameOrId("clip_inbox");
  if (!inbox.fields.getByName("d")) inbox.fields.add(new TextField({ name: "d", max: 1000 }));     // page description
  if (!inbox.fields.getByName("img")) inbox.fields.add(new TextField({ name: "img", max: 2000 })); // page picture link
  app.save(inbox);
}, (app) => {
  const clips = app.findCollectionByNameOrId("clips");
  ["tags", "info", "done"].forEach((n) => clips.fields.removeByName(n));
  const type = clips.fields.getByName("type");
  type.values = type.values.filter((v) => v !== "places" && v !== "activities");
  app.save(clips);
  const inbox = app.findCollectionByNameOrId("clip_inbox");
  ["d", "img"].forEach((n) => inbox.fields.removeByName(n));
  app.save(inbox);
});
