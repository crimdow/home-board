/// <reference path="../pb_data/types.d.ts" />
// At a Glance: who's home each day (the little house beside the date)
migrate((app) => {
  const c = app.findCollectionByNameOrId("days");
  c.fields.add(new TextField({ name: "home", max: 20 }));
  app.save(c);
}, (app) => {
  const c = app.findCollectionByNameOrId("days");
  c.fields.removeByName("home");
  app.save(c);
});
