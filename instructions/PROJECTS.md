# BAMN — PROJECTS VIEW SPEC

## Overview
The Projects view is a two-column editorial layout. The left side is a sparse text/quote zone that transforms into a project detail space when a project is selected. The right side is a persistent vertical filmstrip of numbered project images. All transitions are **positional movements** — nothing fades in place, everything travels to where it belongs. There are no page reloads, no routing — this is a single-view state machine with 2 states: **Resting** and **Inspect**.

---

## Tech Stack for This View
- Vanilla JS or lightweight framework (no heavy dependencies needed)
- CSS transitions and transforms for all motion (no JS animation library required — all movement is `transform + transition` or `transform + requestAnimationFrame`)
- No Matter.js in this view — motion is choreographed, not physics-driven

---

## Entry Animation — View Coming In
Triggered after the Home abyss exit completes and the screen is blank cream.

### Sequence:
1. Left column fades in first — quote text slides up from `translateY(20px)` to `translateY(0)` + `opacity: 0 → 1` over 400ms
2. Right column project images enter **staggered from top to bottom** — each image slides in from `translateX(40px)` to `translateX(0)` + `opacity: 0 → 1`, with 80ms delay between each item
3. Number labels (`01`, `02`, `03`...) appear simultaneously with their image
4. Total entry sequence: approximately 800ms–1200ms depending on project count
5. Home icon fades in top-left simultaneously with step 1

---

## Layout — Resting State

```
┌─────────────────────────────────────────────────────────────────┐
│ ↖ [home icon]                                                   │
│                                                                 │
│   LEFT COLUMN (45% width)    │   RIGHT COLUMN (55% width)      │
│                              │                                  │
│   Quote text fragment        │   01  [project image]           │
│   sparse, low contrast       │   02  [project image]           │
│   lots of breathing room     │   03  [project image]           │
│                              │   04  [project image]           │
│                              │   05  [project image]           │
│                              │   ...                           │
└─────────────────────────────────────────────────────────────────┘
```

### Left Column — Resting
- Contains a short quote or text fragment chosen by BAMN
- Typography: small, condensed, wide letter-spacing, low contrast (`color: #A8A4A0`)
- Positioned roughly center-left of the column, not top-aligned
- No other elements — lots of empty cream space

### Right Column — Resting
- Vertical list of project entries
- Each entry: number label + thumbnail image side by side
- Number label: `01`, `02`, `03`... — small monospaced or condensed type, sits to the left of the image, vertically centered with the image
- Thumbnail: fixed height (suggested `180px`), full column width minus label space
- `object-fit: cover` on all thumbnails
- Small gap between entries (suggested `16px`)
- Column is **scrollable** if projects exceed viewport height — subtle custom scrollbar or no scrollbar (overflow hidden on the column, scroll via mouse wheel)
- Right column has a right-edge clip — images extend to viewport edge with no padding on the right

---

## Interaction — Clicking a Project

### Click target
The entire project entry row (number + image) is clickable. Cursor changes to pointer on hover. On hover: a very subtle brightness increase on the thumbnail (`filter: brightness(1.05)`).

### What happens on click — The Swap

All of the following happen **simultaneously**, not sequentially:

**Left column:**
- Quote text slides **down and out** of the viewport: `translateY(+60px)` + `opacity: 0`, duration 300ms ease-in
- As quote exits, project info slides **up and in** from below: `translateY(+40px) → translateY(0)` + `opacity: 0 → 1`, duration 400ms ease-out, starting 150ms after quote begins exiting

**Right column:**
- All project entries **compress and shift right** simultaneously
- The right column container narrows from ~55% width to ~18% width over 400ms
- At 18% width, only a **sliver** of each image is visible — cropped by the container's right edge clip
- Number labels remain fully visible outside the image clip zone — they sit to the left of the images and do not get clipped
- The selected project's entry **does not compress** — it leaves its slot (see below)

**Selected image:**
- The clicked thumbnail **detaches from the right column** and travels left across the screen to fill the left column space
- Motion path: from its current position in the right column to the left column center
- Simultaneously **scales up** from thumbnail size to large display size (filling roughly 80% of left column width)
- Duration: 500ms, cubic-bezier ease-in-out
- The image arrives in the left column as the project info is finishing its slide-up
- A **close button** appears top-right corner of the expanded image after it settles (200ms delay after arrival), small `×` or collapse arrow icon, condensed type

**Timing summary:**
```
0ms    → Quote begins sliding down + out
        → Right column begins compressing
        → Selected image begins traveling left + scaling up
150ms  → Project info begins sliding up + in
500ms  → All animations complete, Inspect state reached
```

---

## Layout — Inspect State

```
┌─────────────────────────────────────────────────────────────────┐
│ ↖ [home icon]                                                   │
│                                                                 │
│   LEFT COLUMN (82% width)         │  RIGHT SIDEBAR (18%)       │
│                                   │                            │
│   [large project image]    [×]    │ 01 [▌]  ← sliver          │
│                                   │ 02 [▌]                     │
│   Project Title                   │ 03 [▌]  ← selected slot   │
│   Year · Category                 │    (empty or dimmed)       │
│   Description text                │ 04 [▌]                     │
│   ...                             │ 05 [▌]                     │
│                                   │                            │
└─────────────────────────────────────────────────────────────────┘
```

### Left Column — Inspect
- Large project image fills the top portion of the left column
- Below the image: project information block (see Project Info below)
- Close button `×` sits top-right of the image — small, in BAMN condensed type
- The left column is now **scrollable** if project info is long

### Right Sidebar — Inspect
- Container width: ~18% of viewport
- Each project image is clipped by the container right edge — only a sliver is visible
- Number labels (`01`, `02`...) remain fully readable, sitting just outside the clip
- The **slot of the selected project** is empty or shows a dimmed placeholder — its image has traveled to the left column
- All slivers are **still clickable** — the tap/click target extends to the number label area

### Project Info Block
Sits below the expanded image in the left column. Content provided by BAMN per project:
```
[Project Title]           ← large, bold, BAMN display type
[Year]  ·  [Category]     ← small, monospaced, muted
[Location]                ← small, monospaced, muted

[Description paragraph]  ← body text, readable size, moderate line-height

[optional: material tags or keywords as small inline chips]
```

---

## Interaction — Folding Back (Close)

Triggered by clicking the `×` close button on the expanded image.

### Sequence (all simultaneous):
1. Expanded image **travels right and shrinks** back into its exact numbered slot in the right sidebar — reverse of the opening travel
2. Right column **expands back** from 18% to 55% width over 400ms
3. Project info slides **back down and out**: `translateY(+40px)` + `opacity: 0`, 300ms
4. Quote text slides **back up and in**: `translateY(+20px) → 0` + `opacity: 0 → 1`, 400ms, starting 100ms after project info begins exiting
5. View returns to **Resting state** exactly

---

## Interaction — Switching Projects (One Already Open)

Triggered by clicking a sliver in the right sidebar while another project is in Inspect state.

### Sequence:
1. Currently expanded image begins **traveling right and shrinking** back to its slot
2. **Simultaneously** (no wait, no pause) — the newly selected image begins **traveling left and growing** toward the left column
3. The two images **pass each other mid-screen** in motion — they are both animating at the same time
4. Project info for the current project slides **down and out**
5. Project info for the new project slides **up and in** with a 150ms delay
6. The right column width does **not change** during a switch — it stays in sidebar mode throughout
7. Duration: same 500ms for both travel animations

This feels like a **physical swap** — two objects trading places, passing mid-air.

---

## Exit Animation — Going Back to Home

Triggered by clicking the Home icon (top-left, persistent).

### Sequence:
1. If in Inspect state: snap immediately to Resting state (skip the fold animation, hard cut or 150ms quick fade)
2. All right column images slide **right and out** of viewport: `translateX(+100%)` + `opacity: 0`, staggered 60ms between each, 300ms duration
3. Left column content (quote or project info) slides **down and out**: `translateY(+40px)` + `opacity: 0`, 300ms
4. Home icon fades out: `opacity: 0`, 200ms
5. Screen is blank cream
6. **Trigger Home entry animation** (physics bodies spawn from above)

---

## Persistent Element — Home Icon
- Position: top-left, `24px` from top and left edges
- Always visible in this view, all states
- Abstract geometric SVG mark (BAMN-provided or minimal circle reduction)
- On hover: subtle opacity change (0.6 → 1.0)
- On click: triggers exit animation → Home

---

## Scrolling Behavior
- **Resting state:** right column scrolls independently if project list exceeds viewport. Left column does not scroll (quote is static).
- **Inspect state:** left column scrolls (for long project descriptions). Right sidebar does not scroll independently — it stays fixed and aligned to viewport height.
- No full-page scroll — only column-level scroll where needed.

---

## Responsive Behavior
- **Desktop (primary):** two-column layout as described
- **Tablet:** same layout, right column slightly wider (60%), left column (40%)
- **Mobile:** single column. Resting state shows full-width project list (filmstrip). Tapping a project expands it to full screen with project info below. A back-to-list button replaces the desktop close `×`. The sliver sidebar is not used on mobile — instead a horizontal swipe gesture switches projects while one is open.

---

## Assets Required from BAMN
Per project, BAMN must provide:
1. **Cover image** — used as the thumbnail in the filmstrip and as the expanded image in Inspect state. Suggested: landscape or portrait, minimum `1200px` wide, high quality.
2. **Project title**
3. **Year**
4. **Category** (e.g. Residential, Commercial, Interior, etc.)
5. **Location**
6. **Description** — 2–4 sentences or a short paragraph
7. **Optional:** material tags, additional gallery images (if the Inspect state needs a gallery — this can be a v2 feature)

Additionally:
- **Left column quote text** — a single short text fragment BAMN wants to use as the resting state atmospheric text. Can be their manifesto fragment, a quote, or a phrase.

---

## Data Structure Suggestion
```js
const projects = [
  {
    id: 'project-01',
    number: '01',
    title: 'Project Name',
    year: '2024',
    category: 'Residential',
    location: 'Caracas, Venezuela',
    description: 'Short description of the project...',
    cover: '/assets/projects/project-01-cover.jpg',
    tags: ['concrete', 'minimal', 'private residence'] // optional
  },
  // ... repeat per project
];
```

---

## File Structure Suggestion
```
/projects
  projects.js      ← state machine, animation logic, DOM manipulation
  projects.css     ← column layout, clip behavior, transition definitions
/assets/projects/
  project-01-cover.jpg
  project-02-cover.jpg
  ...
```

---

## State Machine Summary
```
HIDDEN
  ↓ (home abyss exit complete)
ENTERING (staggered entry animation)
  ↓ (animation complete)
RESTING (quote visible, filmstrip full width)
  ↓ (click project)
INSPECTING (image expanded left, sidebar clipped right)
  ↓ (click ×)           ↓ (click another sliver)
RESTING               SWITCHING → INSPECTING (new project)
  ↓ (click home icon)
EXITING → HOME
```
