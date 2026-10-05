/// <reference path="../pb_data/types.d.ts" />
// Meals get a real date ("2026-10-07"), so you can plan next week without touching this week's.
// Meals that only had a weekday get a date from when they were last changed:
//  - not made yet: the next time that weekday comes round (planning ahead)
//  - already made: the last time that weekday came round
migrate((app) => {
  const meals = app.findCollectionByNameOrId("meals");
  if (!meals.fields.getByName("date")) meals.fields.add(new TextField({ name: "date", max: 10 }));
  app.save(meals);

  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  app.findRecordsByFilter("meals", "day != '' && date = ''", "", 5000, 0).forEach((r) => {
    const want = DAYS.indexOf(r.getString("day"));
    if (want < 0) return;
    let when = new Date(r.getString("updated_at") || r.getString("created_at") || Date.now());
    if (isNaN(when)) when = new Date();
    const d = new Date(when.getFullYear(), when.getMonth(), when.getDate());
    const have = (d.getDay() + 6) % 7;   // Monday = 0
    let diff = want - have;
    if (r.getBool("done")) { if (diff > 0) diff -= 7; } else if (diff < 0) diff += 7;
    d.setDate(d.getDate() + diff);
    r.set("date", iso(d));
    app.save(r);
  });
}, (app) => {
  const meals = app.findCollectionByNameOrId("meals");
  meals.fields.removeByName("date");
  app.save(meals);
});
