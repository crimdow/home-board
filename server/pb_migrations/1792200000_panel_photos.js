/// <reference path="../pb_data/types.d.ts" />
// Wall panel screensaver photos.
//  - panel_photos: one row per photo the family picked for the Surface's screensaver
//  - image is resized on the phone before upload; w/h are its size in pixels
//  - focus_x / focus_y (0–1) are the point of the photo kept in the middle of the screen,
//    zoom (1 = just fills the screen) is how far in it's framed. Set on the Screensaver page.
// Same walls as the other Home Board tables: your household only; editors add, frame and remove.

migrate((app) => {
  const MINE = "household = @request.auth.household && @request.auth.household != ''";
  const MEMBER = "(@request.auth.role = 'editor' || @request.auth.role = 'viewer')";
  const EDITOR = "@request.auth.role = 'editor'";
  const NO_MOVE = "@request.body.household:isset = false";

  app.save(new Collection({
    type: "base",
    name: "panel_photos",
    listRule: MINE + " && " + MEMBER,
    viewRule: MINE + " && " + MEMBER,
    createRule: EDITOR + " && @request.auth.household != ''",
    updateRule: MINE + " && " + EDITOR + " && " + NO_MOVE + " && @request.body.image:isset = false",
    deleteRule: MINE + " && " + EDITOR,
    fields: [
      { name: "household", type: "text", max: 30 },
      { name: "image", type: "file", maxSelect: 1, required: true, maxSize: 15 * 1048576,
        mimeTypes: ["image/jpeg", "image/png", "image/webp"], thumbs: ["0x720"] },   // 0x720: 720 tall, same shape (for the phone's grid)
      { name: "w", type: "number" },
      { name: "h", type: "number" },
      { name: "focus_x", type: "number" },
      { name: "focus_y", type: "number" },
      { name: "zoom", type: "number" },
      { name: "added", type: "number" },
    ],
    indexes: ["CREATE INDEX idx_panel_photos_household ON panel_photos (household)"],
  }));
}, (app) => {
  app.delete(app.findCollectionByNameOrId("panel_photos"));
});
