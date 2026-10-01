/// <reference path="../pb_data/types.d.ts" />
// Pocket Binder recipes: the Share-Sheet clipper marks recipe pages so the binder opens them as
// recipes (saved to Home Board's own "recipes" table) instead of as lyrics or a story.
migrate((app) => {
  const inbox = app.findCollectionByNameOrId("clip_inbox");
  if (!inbox.fields.getByName("k")) inbox.fields.add(new TextField({ name: "k", max: 20 }));   // "recipe" or empty
  app.save(inbox);
}, (app) => {
  const inbox = app.findCollectionByNameOrId("clip_inbox");
  inbox.fields.removeByName("k");
  app.save(inbox);
});
