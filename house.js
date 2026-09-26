/* Home Board: House page (facts + repeating checklist). Household logins only; the friend account can't see it.
   The list, reader and editor are shared with Recipes and Notes (see index.html). */
HB.docPage("house", {
  title: "House", table: "house_items", kind: "house", householdOnly: true,
  noun: ["item", "items"],
  titleHint: "Furnace filter, living room paint…",
  suggest: ["Kitchen", "HVAC", "Paint", "Cars", "Yard", "Utilities", "Appliances"]
});
