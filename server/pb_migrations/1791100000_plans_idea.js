/// <reference path="../pb_data/types.d.ts" />
// Plans: an idea can have a date. "idea" keeps it in Ideas (and off the calendar) until it's moved to Coming up.
migrate((app) => {
  const c = app.findCollectionByNameOrId("plans");
  c.fields.add(new BoolField({ name: "idea" }));
  app.save(c);
}, (app) => {
  const c = app.findCollectionByNameOrId("plans");
  c.fields.removeByName("idea");
  app.save(c);
});
