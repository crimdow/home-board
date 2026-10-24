# Home Board — notes for Claude

The Kildow family's home-screen web app (Ash, Ben, Stella, Evie). This repo also holds the **server** for all the family apps (Home Board, Pocket Binder, Hearts, Spinner).

## Never
- Put passwords, service keys or secret keys in any file. Only public keys go in pages. Passwords live in Keeper.
- Tell Ben to re-run `server/setup.sh` on bkweb: it overwrites the custom Caddyfile.
- Write the Binder clipper key into a file (pages fetch it from the `clip_keys` table).

## How it runs
- **Server:** PocketBase 0.40.3 on the home-lab VM "bkweb" (Ubuntu 24.04), behind a Cloudflare Tunnel. Caddy serves this repo's files and the other sites.
- **Deploy:** Ben pushes to GitHub and a deploy script pulls. It restarts PocketBase when `server/pb_migrations/` changes. After a hook change, if it doesn't take, run `sudo systemctl restart pocketbase`.
- **Logins:** PocketBase `users`. Each user has a `household` (relation) and a `role` (editor or viewer). Every table row carries `household`, and the hooks set it on create. `hearts_role` on users is for Hearts.

## Files
- `_index.src.html` is the app shell (gate, tab bar, More sheet, theme, shared helpers). Build `index.html` from it with `python3 _build.py`; it inlines `_docs.*`, `_family.*`, `_skins.css` and `_gate.css`. Always ship both files.
- Page modules are loaded as `src + "?v=" + VERSION`:
  - `week.js` (At a Glance)
  - `groceries.js`
  - `meals.js`
  - `todos.js`
  - `plans.js`
- **Bump `VERSION` in `_index.src.html` whenever any page JS changes.** Otherwise phones keep the cached old file, and it looks like "the change isn't working".
- `pb-client.js` is a small `db.from(...)` layer over `pocketbase.umd.js`.
  - It's loaded as `pb-client.js?v=…`; bump that too when it changes.
  - **Fast open:** `getSession()` answers at once from the saved login and refreshes it in the background. A refused login signs out; a changed role, household or site admin reloads the app. Don't put the server check back in front of the first draw.
  - **Saved copies:** every select is kept in localStorage (`hb-cache:<user>:<query>`, at most 40, cleared on sign-out). A page shows `query().cached()` at start, then the fresh result. Pages build each query in one function (`query()`, `queries()`, `daysQuery()`...) so the cached copy and the fresh load use the same key.
  - `.onOrAfter("date", d)` means "on or after d, or no date". Meals use it so only the weeks the slider reaches are downloaded.
- `groceries.html`, `meals.html` and the other `*.html` pages just redirect old bookmarks to `./#page`.
- `manifest.webmanifest`, `icon.svg`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` and `favicon.ico` hold the grey painted-house icon. Links use `?v=2`; bump it if the icon changes.
- `server/pb_hooks/`:
  - `main.pb.js`: households, invites, members, site admin, calendar feed.
  - `hb_lib.js`
  - `meals.pb.js`: a day-only meal gets the next date for that weekday.
  - `binder.pb.js`: clipper form, photo saving, Google Maps place lookup.
- `server/pb_migrations/`: one file per schema change, numbered by timestamp. Add new ones and never edit old ones.
- Old root copies of `hb_lib.js`, `main.pb.js`, `house.js`, `notes.js` and `recipes.js` are leftovers and are no longer used.

## Shared helpers (in `_index.src.html`)
- `HB.swipeable(el, onDelete)`: swipe a row left to show Delete; a full swipe deletes.
- `HB.deleteWithUndo`: shows the Undo bar.
- `HB.weekOffset`: the shared week. The Meals week slider follows At a Glance and the reverse.
- Each page can have a `refresh` hook, which runs when the page is shown again.
- Theme:
  - `homeboard-theme` holds light, dark or nothing; nothing means Auto.
  - `homeboard-skin` holds the colour theme: Classic, Barbie, Espresso or Halloween.
  - Both are set in the More sheet: Appearance is a `.seg` control with Light / Dark / Auto, Theme is shown as `.skins` cards.

## Pages and decisions
- **Pages:** week, groceries, meals, todos, plans. Recipes and Notes moved to Binder, which uses the same `recipes` / `notes` tables. The House page and the Binder link were removed.
- **Meals:**
  - Each meal has a real `date` (YYYY-MM-DD). The legacy `day` field counts as this week.
  - Keep the single list with **tap-to-cycle day pills** plus the week slider (two weeks back to six ahead). Ben rejected a layout grouped by day as too cumbersome.
- **Plans:** start and end time, a location, and `idea` (true when there's no date). Binder's "+ Plans" creates rows here.
- **Tab bar stays at the bottom:** iOS home-screen apps can keep the page's viewport shorter than the screen after the keyboard closes, which floats the tab bar, + and Undo partway up. `pinBottom()` compares `visualViewport` with `innerHeight` and sets `--pin`, which `.bottom`, `.fab` and `.undo` use as `translate`, and nudges the scroll by a pixel when the keyboard closes. Keep their own `transform`s separate from that `translate`.
- **Zoom:** locked with viewport `minimum-scale=1, maximum-scale=1, user-scalable=no`, plus `body{overflow-x:clip}`.

## Look (shared by all the family apps)
- **Light:** background `#e4e5e8`, cards `#eeeff1`, ink `#2b2e33`.
- **Dark:** background `#1d1e22`, cards `#25262b`, ink `#e4e4e2`.
- **App colours:** blue `#4f7bd4`, red `#d45b6c`, amber `#c98a3e`, green `#3f9a66`, violet `#8a6bb8`, teal `#36ad9c`.
- **Type and controls:** system font, heavy weights, round grey icon buttons, solid pills, sheets that slide up from the bottom, and a ☰ menu.

## Testing
- Run a local PocketBase 0.40.3 with `--publicDir` set to this repo, plus `--hooksDir server/pb_hooks --migrationsDir server/pb_migrations`. Create throwaway test users in one household and drive the app with Playwright on a phone-sized viewport.
- Unset the proxy variables (`HTTPS_PROXY` and friends) for localhost.
- Never `pkill -f` a pattern that matches your own shell command (exit 144). Use `pkill -x pocketbase`.
