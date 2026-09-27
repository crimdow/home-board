/// <reference path="../pb_data/types.d.ts" />
// Plans: start time, end time and location, like a normal calendar entry.
// No start time = an all-day plan. Existing plans that had a time written in their name or
// note ("Dinner 6:30pm") get it copied into the new start/end fields (a 2-hour slot, as before).

migrate((app) => {
  const plans = app.findCollectionByNameOrId("plans");
  plans.fields.add(new TextField({ name: "start_time", max: 5 }));   // "HH:MM", 24-hour
  plans.fields.add(new TextField({ name: "end_time", max: 5 }));
  plans.fields.add(new TextField({ name: "location", max: 500 }));
  app.save(plans);

  const pad = (n) => String(n).padStart(2, "0");
  app.findRecordsByFilter("plans", "date != ''", "", 5000, 0).forEach((r) => {
    const t = (r.getString("name") + " " + r.getString("note")).match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm|a|p)\b/i);
    if (!t) return;
    const h = (Number(t[1]) % 12) + (/p/i.test(t[3]) ? 12 : 0), m = Number(t[2] || 0);
    r.set("start_time", pad(h) + ":" + pad(m));
    r.set("end_time", pad(Math.min(23, h + 2)) + ":" + pad(m));
    app.save(r);
  });
}, (app) => {
  const plans = app.findCollectionByNameOrId("plans");
  ["start_time", "end_time", "location"].forEach((n) => plans.fields.removeByName(n));
  app.save(plans);
});
