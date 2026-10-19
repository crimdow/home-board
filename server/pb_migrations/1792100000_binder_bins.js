/// <reference path="../pb_data/types.d.ts" />
// Pocket Binder: Bins.
//  - clips can now be "bins": a storage bin with a short code (G-01) on its printed QR label.
//    info holds its area, spot, code, contents list and the date it was last checked;
//    body is the note and files are photos, as for the other sections.
migrate((app) => {
  const clips = app.findCollectionByNameOrId("clips");
  const type = clips.fields.getByName("type");
  if (type.values.indexOf("bins") < 0) type.values.push("bins");
  app.save(clips);
}, (app) => {
  const clips = app.findCollectionByNameOrId("clips");
  const type = clips.fields.getByName("type");
  type.values = type.values.filter((v) => v !== "bins");
  app.save(clips);
});
