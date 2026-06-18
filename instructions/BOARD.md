# BAMN — BOARD VIEW SPEC

## Overview
The Board view is an **infinite interactive graffiti wall** built with **tldraw**. It is a shared canvas: anyone visiting `/board` can draw and move things, and their changes autosave and sync live for everyone (Model B — collaborative shared wall). A separate `/board/admin` route gives authenticated admins the full tldraw toolset plus board-management controls (save/commit, wipe, nuke).

The canvas background is **transparent** so the site's paper texture shows through — it feels like drawing directly on BAMN's paper.

> ⚠️ **HOME INTEGRATION NOTE:** Board is a **new 5th Home component**. Home was previously specced with 4 physics bodies / 4 fixed positions. Board must be **added to Home as a 5th component** — meaning 5 physics bodies, 5 fixed positions, and the load-shuffle now distributes across **5 views** (`projects`, `product`, `about`, `contact`, `board`). **Do NOT assume HOME.md already reflects this** — HOME.md has not been updated. Whoever integrates Board must update Home's component count, positions array, and shuffle logic to include Board. Board gets its own custom cover image for the Home physics body, and clicking it navigates to `/board`.

---

## Tech Stack for This View
- **tldraw** — React canvas component (client component, `'use client'`)
- **Supabase Realtime** — live sync of strokes/changes between concurrent users (broadcast channel)
- **Supabase Postgres** — durable persistence of the board snapshot (the `board` table)
- **Supabase Auth** — admin login (login only, no signup; admins created via Supabase dashboard)
- **GSAP** — enter/exit animations per the View Contract
- Server **Route Handlers** for all admin/destructive operations (commit, wipe, nuke)

> **tldraw license note (open item):** tldraw shows a "made with tldraw" watermark unless licensed. For a client studio site, BAMN will likely want the paid license key to hide it. Not a blocker for dev, but flag it. The license key is set via the tldraw component props/env.

---

## Routes

### `/board` — Public graffiti wall
- No login
- Anyone can read + write
- **Limited toolset:** select/move + draw (pen) only. Hide most of the default UI (no page menu, no complex shape tools beyond what's wanted — confirm exact allowed tools with BAMN; recommended baseline: select, draw, eraser, basic move/pan/zoom)
- All user changes **autosave** (debounced) to the `data` column and broadcast live via Realtime
- No save / commit / wipe / nuke controls visible

### `/board/admin` — Admin board
- **Supabase Auth login required** (login only — no signup UI)
- Admins are created exclusively via the Supabase dashboard
- On successful auth: **full tldraw toolset** (all default tools/UI)
- Admin-only controls visible: **Save/Commit**, **Wipe**, **Nuke**
- Admin's freehand edits write to the same `data` column as users (admin editing without committing = just updating live, like anyone else, until they explicitly commit)

> The earlier `?edit=true` query-param idea is **dropped** in favor of the dedicated `/board/admin` route.

---

## Data Model — `board` table

One row, singleton, identified by `name = "live"`:

```sql
create table if not exists board (
  name           text primary key default 'live',   -- singleton; always "live"
  data           jsonb,                              -- the live/working snapshot (everyone writes)
  restore_point  jsonb,                              -- committed checkpoint (admin commit only)
  updated_at     timestamptz default now()
);

-- ensure the single row exists
insert into board (name, data, restore_point)
values ('live', null, null)
on conflict (name) do nothing;
```

### Column meaning
- **`data`** — the current working board. Users autosave here; admin live-edits here; admin save-on-exit writes here. This is what both routes **load** on mount.
- **`restore_point`** — only ever written by the admin **Commit** action. The "point of return."
- **`updated_at`** — bump on every write.

---

## Persistence Architecture — Realtime + Debounced Snapshot

Two cooperating layers:

### Layer 1 — Live sync (ephemeral, fast)
- **Supabase Realtime broadcast channel** (e.g. channel `board:live`)
- On local change, tldraw's `store.listen` emits record-level diffs → broadcast **incremental changes** (NOT the whole document — broadcasting full snapshots per stroke would be huge/laggy)
- Remote clients receive diffs and apply them to their tldraw store
- Per-client **draw throttle** to avoid flooding the channel
- This is what makes concurrent drawing feel live (no stomping mid-stroke)

### Layer 2 — Durable persistence (debounced snapshot)
- The full snapshot (`editor.store.getSnapshot()`) is written to `board.data` on a **debounce** (e.g. every 2–3s of inactivity), NOT every stroke
- This is what survives reloads
- On mount, both routes load `board.data` via `loadSnapshot()`

### Why both
Broadcast = live feel between active users. Debounced snapshot = durability for the next visitor. Together they make a real shared graffiti wall that persists.

> **Conflict note (last-write-wins on the snapshot):** Realtime keeps concurrent users visually in sync, so the debounced snapshot write reflects the merged live state most of the time. The snapshot write is still last-write-wins at the row level, but because everyone is synced live, the saved blob represents the shared current state rather than one user's isolated copy.

---

## Admin Operations (all server-route gated)

All destructive/admin writes go through **server Route Handlers** that verify the Supabase Auth session belongs to an admin **server-side** before writing. The public autosave to `data` stays open (graffiti wall); only these privileged operations are gated.

### Save / Commit — "Set as restore point"
- **The Save button and Commit are the same action.**
- Writes the current snapshot into **both** `data` AND `restore_point`
- This establishes the new point of return
- Route: `POST /api/board/commit`
- Server verifies admin session → writes both columns in one update (atomic, single row)

### Wipe / Reset — restore to checkpoint
- Copies `restore_point` → `data`
- The board snaps back to the last committed checkpoint; everything drawn since the last commit disappears
- **If `restore_point` is empty/null** → return error, surface message to admin: **"There is no point of return"**
- Route: `POST /api/board/wipe`
- Server verifies admin session → checks restore_point exists → copies to data (or returns the error)
- After wipe, broadcast the new state so all connected clients update to the restored board

### Nuke — blank the live board
- Sets `data` to **blank** (empty canvas snapshot)
- **Keeps `restore_point` intact** (restore point survives a nuke)
- **Requires a confirmation modal** before executing (see Nuke Modal below)
- Route: `POST /api/board/nuke`
- Server verifies admin session → writes blank snapshot to `data` only
- After nuke, broadcast blank state so all connected clients clear

### Admin save-on-exit
- When the admin navigates away (the `exit()` transition), flush a final save to **`data` only** (NOT restore_point)
- Commit is the **sole** writer of `restore_point` — exit-save never touches it, keeping the checkpoint deliberate
- Route: reuse `POST /api/board/save` (data only) or the commit route with a `dataOnly` flag

---

## Nuke Confirmation Modal
Triggered when admin clicks Nuke. Must explain what nuke does before proceeding:

```
┌─────────────────────────────────────────────┐
│  Nuke the live board?                         │
│                                               │
│  This clears the live board to blank for      │
│  everyone, immediately. The restore point     │
│  will be kept — you can still wipe back to     │
│  your last committed checkpoint.              │
│                                               │
│            [ Cancel ]    [ Nuke it ]          │
└─────────────────────────────────────────────┘
```
- Cancel → close, no action
- Nuke it → calls `/api/board/nuke`
- Styled per BAMN brand (red accent appropriate here — destructive action)

---

## RLS (Row-Level Security) Policies

On the `board` table:
```sql
alter table board enable row level security;

-- anyone can read the board
create policy "board_public_read"
  on board for select
  using (true);

-- anyone can update the live data (public graffiti wall)
create policy "board_public_update"
  on board for update
  using (true)
  with check (true);

-- no one deletes the row (we never delete it; we clear contents instead)
-- (no delete policy = delete denied)
```

> **Important:** Public `update` is open because users must write to `data`. This means RLS alone cannot protect commit/wipe/nuke (those are also updates). Therefore destructive/admin operations are protected at the **server route layer** (verify admin Supabase Auth session before writing), NOT by RLS. The open update policy is intentional for the graffiti-wall model; the privileged operations are gated in the route handlers.

---

## Transparent Canvas Over Paper Texture

### Goal
The site's paper texture background shows through the tldraw canvas, so drawing feels like writing on BAMN's paper.

### Implementation notes
- The **paper texture** is a layer **behind** the tldraw component (the existing site background image)
- Override tldraw's canvas background to **`transparent`** via its CSS custom properties / theme overrides
- Ensure **no opaque wrapper** sits between the paper layer and the tldraw shape layers
- **Disable the default grid** (or restyle it subtly) — the grid assumes a solid background and would fight the paper texture
- Verify **stroke contrast**: BAMN's black-on-cream is high contrast, so default dark strokes read well. Confirm default draw color is dark (black/near-black) so it's legible on the paper
- Test that selection boxes, handles, and UI chrome still read against the paper (they're drawn above shapes, generally fine)

---

## View Contract (enter / exit) — plugs into useTransitionRouter

Board implements the same `TransitionView` interface as every other view:

```ts
interface TransitionView {
  enter: () => gsap.core.Timeline;
  exit: () => Promise<void>;
}
```

### Enter
- Plays on mount from blank cream pre-state
- tldraw canvas + loaded board fade/scale in (keep it simple — a fade up is fine; the canvas itself is the content)
- Initialize tldraw, load `board.data`, subscribe to the Realtime channel
- Home icon fades in top-left

### Exit (critical cleanup)
Because Board holds a live Realtime subscription and a full-screen canvas, `exit()` must:
1. **Flush a final debounced save** to `board.data` (so nothing is lost)
   - If admin: this is the `data`-only save-on-exit
   - If user: final autosave of their changes
2. **Tear down the Realtime subscription** (unsubscribe from the channel, remove store listeners)
3. Play the exit animation (fade/scale out to blank cream)
4. Resolve the Promise → `useTransitionRouter` proceeds to navigate

> Failing to tear down the subscription on exit would leak channels/listeners across navigations — this cleanup is mandatory.

---

## Persistent Element — Home Icon
- Top-left, `24px` from edges (same as all sub-views)
- Abstract geometric SVG mark (BAMN-provided)
- On click: triggers Board's `exit()` (with cleanup above) → navigate to Home (`/`) → Home entry animation
- Must not be obscured by the tldraw toolbar — position with adequate z-index above the canvas

---

## Rate / Size Limits (tune later)
Defaults, adjustable:
- **Shape count soft cap:** ~**2,000** total shapes. Past it, new draws are blocked with a small unobtrusive notice ("The board is full"). Prevents unbounded growth.
- **Snapshot size guard:** ~**2–3 MB** ceiling before writing to Supabase. If exceeded, block further additions / warn.
- **Per-client draw throttle:** limit broadcast frequency per client to prevent spam-flooding the Realtime channel.
- These are abuse mitigations for a public, unauthenticated, persistent canvas. Tune the numbers after real-world testing.

---

## Responsive Behavior
- **Desktop (primary):** full tldraw canvas, infinite pan/zoom, full interaction
- **Tablet/Mobile:** tldraw supports touch (draw, pan, pinch-zoom) natively. On `/board`, keep the limited toolset compact. The admin route is desktop-oriented (board management is a desktop task) but should remain usable on tablet. Ensure the Home icon and any admin buttons don't collide with tldraw's mobile UI.

---

## Assets / Setup Required
1. **Board cover image** — custom image for Board's Home physics body (the 5th component)
2. **tldraw license key** (optional but recommended) — to hide the watermark
3. **Admin users** — created in the Supabase dashboard (Supabase Auth)
4. **Paper texture** — already exists as the site background; confirm it sits behind the canvas layer
5. **Home icon SVG** — shared with other views

---

## Environment Variables (additions)
```
# (Supabase + Resend vars already defined in STACK.md)
NEXT_PUBLIC_TLDRAW_LICENSE_KEY=     # optional, to hide watermark
BOARD_ADMIN_CHECK=                  # server-side admin verification handled via Supabase Auth session; no shared password
```
> No shared password env var — admin access is via Supabase Auth login. Admin verification in route handlers checks the authenticated user's session/role server-side.

---

## File Structure Suggestion
```
/app
  board/
    page.tsx               ← public board (server shell) → <BoardView mode="user" />
    admin/
      page.tsx             ← admin board; requires Supabase Auth → <BoardView mode="admin" />
      login/page.tsx       ← admin login (login only, no signup)
  api/board/
    commit/route.ts        ← admin: write data + restore_point (Set as restore point)
    wipe/route.ts          ← admin: restore_point → data (or "There is no point of return")
    nuke/route.ts          ← admin: blank data, keep restore_point
    save/route.ts          ← admin save-on-exit (data only)

/components
  views/
    BoardView.tsx          ← tldraw integration, realtime, persistence, enter/exit, admin controls
  board/
    NukeConfirmModal.tsx
    AdminControls.tsx      ← Save/Commit, Wipe, Nuke buttons (admin only)

/lib
  board-sync.ts            ← realtime broadcast + store.listen wiring
  board-persistence.ts     ← debounced snapshot save/load helpers
```

---

## State Machine Summary
```
HIDDEN
  ↓ (home abyss exit complete OR direct deep-link to /board)
ENTERING (canvas fades in, board.data loaded, realtime subscribed)
  ↓ (ready)
ACTIVE
  ├─ user draws → store.listen → broadcast diff + debounced save to data
  ├─ remote diff received → apply to store
  └─ (admin only)
        ├─ Save/Commit → /api/board/commit → data + restore_point
        ├─ Wipe       → /api/board/wipe   → restore_point→data (or "no point of return")
        └─ Nuke       → confirm modal → /api/board/nuke → blank data, keep restore_point
  ↓ (click home icon)
EXITING (flush final save → unsubscribe realtime → exit animation)
  ↓
→ HOME
```

---

## Key Principles for This View
1. **Public writes are open by design; destructive ops are server-gated.** RLS allows anyone to update `data` (the whole point of a graffiti wall). Commit/wipe/nuke are protected in route handlers via Supabase Auth, not RLS.
2. **Commit is the only writer of `restore_point`.** Everything else (user autosave, admin live edits, admin exit-save) writes only `data`. This keeps the checkpoint deliberate and meaningful.
3. **Wipe = restore checkpoint; Nuke = blank live (checkpoint survives).** Two distinct destructive actions, nuke guarded by a confirmation modal.
4. **Realtime for feel, snapshot for durability.** Broadcast diffs live; persist debounced snapshots.
5. **Always clean up on exit.** Flush save + tear down the realtime subscription before navigating away.
6. **It's BAMN's paper.** Transparent canvas over the paper texture — the graffiti wall is literally drawn on the studio's paper.
```
