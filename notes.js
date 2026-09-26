/* Home Board: Notes page. Household logins only; the friend account can't see it.
   The list, reader and editor are shared with Recipes and House (see index.html). */
HB.docPage("notes", {
  title: "Notes", table: "notes", kind: "note", householdOnly: true,
  noun: ["note", "notes"],
  titleHint: "Title",
  tagHint: "How-to, Project, Kids"
});
