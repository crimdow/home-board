/// <reference path="../pb_data/types.d.ts" />
// Meals added with only a weekday (an older phone, or an older Binder) get a date:
// the next time that weekday comes round, so they land in the week being planned.
onRecordCreateRequest((e) => {
  const day = e.record.getString("day"), DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  if (day && !e.record.getString("date") && DAYS.indexOf(day) >= 0) {
    const pad = (n) => String(n).padStart(2, "0");
    const now = new Date(Date.now() - 4 * 3600000);   // Ohio time, near enough for picking the day
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    let diff = DAYS.indexOf(day) - (d.getUTCDay() + 6) % 7;
    if (diff < 0) diff += 7;
    d.setUTCDate(d.getUTCDate() + diff);
    e.record.set("date", d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate()));
  }
  return e.next();
}, "meals");
