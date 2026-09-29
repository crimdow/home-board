/// <reference path="../pb_data/types.d.ts" />
// Plans: which calendar each plan is on (Girls, Ben, Family, ... set up in Family settings).
// Empty = the Family calendar, so every existing plan starts out as Family.
migrate((app) => {
  const c = app.findCollectionByNameOrId("plans");
  if (!c.fields.getByName("cal")) c.fields.add(new TextField({ name: "cal", max: 30 }));
  app.save(c);
}, (app) => {
  const c = app.findCollectionByNameOrId("plans");
  c.fields.removeByName("cal");
  app.save(c);
});
