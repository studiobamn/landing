# BAMN — ABOUT VIEW SPEC

## Overview
The About view is a **static editorial collage** — a single composed broadsheet/poster page in the spirit of a hand-made print layout. It does not scroll into sections or feature interactive characters. It is **fully static** with only enter and exit animations (like the Contact view). 

The composition is an **absolute-positioned layered layout** on the cream/paper background. Think of it as a printed poster that has been assembled by hand: structural vertical lines run the full height like a binder-rule grid, a massive hand-drawn word dominates the top half, two black-and-white photographs overlap in the center-right, text blocks are scattered to the left at varying sizes and weights, a small label runs vertically in the top-right corner, and loose ink scrawl marks bleed off the bottom edges. Nothing is perfectly aligned. Elements overlap. The off-grid placement is intentional.

All editable text and image references are stored in Supabase `site_content` (key `about`) as a jsonb blob so the studio can update copy without a redeploy. The hand-drawn elements are transparent PNG assets (scrawl cannot be reproduced in code).

---

## Tech Stack for This View
- Vanilla React client component (`'use client'`)
- **GSAP** for enter/exit timelines (per the View Contract)
- CSS with absolute positioning for the collage layout (Tailwind for utilities, custom CSS for the precise positions)
- Data fetched server-side from Supabase `site_content` (key `about`), passed as props
- No Matter.js, no tldraw, no sprite sheets, no scroll sections — fully static composition

---

## Layout — Full Spatial Description

The viewport is the canvas. Every element is absolutely positioned. The following describes each element's approximate position, size, and z-order. All percentages are relative to viewport width/height. These are design targets — small adjustments for visual balance are expected.

### Coordinate system
- Origin: top-left of viewport
- x increases rightward, y increases downward
- The cream paper background fills the entire viewport (from the site's global paper texture)

---

### Element 1 — Vertical Guide Lines
**What they are:** 3 to 4 thin vertical lines running the full height of the viewport. A mix of one solid hairline and two or three dashed lines. They look like the ruling lines on a binder or a printer's registration marks — structural but subtle.

**Appearance:**
- Thickness: 1px
- Color: very light grey, low contrast on cream (e.g. `#D0CBC3`)
- Two of them are `border-style: dashed`, one is solid
- They run from `top: 0` to `bottom: 0`

**Positions (approximate x values, adjust for visual balance):**
- Line 1 (solid): `left: 38%`
- Line 2 (dashed): `left: 62%`
- Line 3 (dashed): `left: 80%`
- Optional Line 4 (dashed): `left: 20%`

**Z-order:** behind everything else — they are the bottom structural layer.

---

### Element 2 — Big Handwritten Headline (PNG)
**What it is:** A large transparent PNG of a hand-drawn/scanned handwritten word or phrase. This is the dominant visual element of the entire composition. It occupies the top ~45% of the viewport height and most of the width.

**Appearance:**
- A single handwritten word or two-word phrase in loose, large brush/pen lettering
- Black ink on transparent background
- The letterforms are imprecise, gestural, large — the kind of writing you'd see on a sketchbook cover
- It is NOT rendered as a web font — it is a PNG image

**Position:**
- `top: 2%`, `left: -2%` (slightly bleeds off the left edge)
- `width: 75%` of viewport width
- The image's natural proportions are preserved (`object-fit: contain`, `object-position: top left`)
- Z-order: above the vertical lines, below the photographs

---

### Element 3 — Vertical Label (top-right corner)
**What it is:** A small block of text rotated 90 degrees clockwise, sitting in the top-right corner of the viewport. It reads as two stacked short lines of uppercase text — like a magazine's section label or a poster's collection name printed in the margin.

**Appearance:**
- Two short text lines, e.g. first line: "BAMN" (or "STUDIO"), second line: "STUDIO COLLECTION" (or "ABOUT")
- `font-primary`, uppercase, very tight tracking (`letter-spacing: 0.15em`), small (`font-size: 0.6rem` or `10px`)
- Color: dark (`--bamn-black`)
- Rotated 90deg clockwise: `transform: rotate(90deg)`
- `writing-mode: vertical-rl` can also be used — result is the same

**Position:**
- `top: 3%`, `right: 1.5%`
- After rotation the text reads top-to-bottom along the right edge
- Z-order: above the guide lines, in the top layer

---

### Element 4 — Two Overlapping Photographs
**What they are:** Two black-and-white photographs. Image A is slightly larger and sits behind Image B. Image B overlaps Image A, offset down and to the left, so roughly the top-right quadrant of Image B covers the bottom-left area of Image A. Together they form a staggered overlapping pair — like two prints placed on a desk, one partially covering the other.

**Image A (back):**
- Size: approximately `28% of viewport width` wide, aspect ratio roughly 3:4 (portrait)
- Position: `top: 28%`, `left: 53%`
- Slight clockwise rotation: `transform: rotate(1.5deg)`
- Z-order: below Image B, above the headline PNG

**Image B (front):**
- Size: approximately `22% of viewport width` wide, same 3:4 portrait aspect ratio
- Position: `top: 42%`, `left: 43%`
- Slight counter-clockwise rotation: `transform: rotate(-1deg)`
- Z-order: above Image A
- The two images overlap by roughly `8% of viewport width` horizontally and `10% of viewport height` vertically

**Appearance of both:**
- Black and white (`filter: grayscale(100%)`)
- Optional: very subtle `contrast(1.1)` for a print/halftone feel
- Rendered as raw `<img>` tags (Drive-hosted media)
- No border, no shadow — they sit directly on the paper

---

### Element 5 — Place-Name / Word List (left column)
**What it is:** A dense vertical stack of short text lines on the left side, roughly mid-height. Some lines are bold/uppercase, some are lighter-weight mixed-case — creating a typographic rhythm that alternates heavy and light, like a list of place names or categories printed at different weights.

**Appearance:**
- `font-secondary` (monospaced or condensed), small (`font-size: 0.7rem` to `0.85rem`)
- Lines alternate: some ALL CAPS bold, some mixed-case normal weight
- Tight line-height (`1.2`)
- Color: `--bamn-black`
- Example visual rhythm (content is editable, but the weight pattern should be like):
  ```
  FIRST ENTRY BOLD CAPS
  Second Entry Normal Case
    Third Entry Indented Normal
  FOURTH BOLD CAPS
  Fifth mixed case
  ```

**Position:**
- `top: 52%`, `left: 3%`
- `width: 28%` — stays within the left zone, does not reach the center vertical line
- Z-order: above the guide lines, below the photographs

---

### Element 6 — Manifesto Paragraph (faint body text)
**What it is:** A short paragraph of small running text — the studio's actual about/philosophy copy. It is intentionally low-contrast and small, like fine print or a caption. It sits near the place-name list, slightly below or beside it. The user has to look for it; it rewards reading.

**Appearance:**
- `font-secondary`, small (`font-size: 0.65rem`)
- Color: muted (`--bamn-muted`, e.g. `#A8A4A0`) — noticeably lighter than the rest of the text
- Max width: narrow column, approximately `26% of viewport width`
- Normal line-height (`1.5`)

**Position:**
- `top: 64%`, `left: 3%`
- Sits below the place-name list with a small gap
- Z-order: same layer as the place-name list

---

### Element 7 — Keyword Stack
**What it is:** A short column of 3 to 5 single words or short phrases, larger and bolder than the manifesto text. These are BAMN's design values or themes — evocative, declarative words. Some are bold, some normal weight, creating rhythm. They sit between the manifesto paragraph and the bottom of the page.

**Appearance:**
- `font-primary`, mixed weight: some lines `font-weight: 700`, some `font-weight: 400`
- Size: medium (`font-size: 1rem` to `1.2rem`)
- Color: `--bamn-black`
- ALL CAPS

**Position:**
- `top: 73%`, `left: 3%`
- `width: 30%`
- Z-order: same layer as the place list

---

### Element 8 — Date / Footer Meta Block
**What it is:** A small block of metadata text in the lower-center area of the composition — year, city, time, or any print-style reference information. It sits isolated in some whitespace, like a colophon or an exhibition date card.

**Appearance:**
- `font-secondary` (monospaced), small (`font-size: 0.65rem`)
- Color: `--bamn-black`
- Two short lines, e.g.:
  ```
  EST. 20XX  ·  MARCH
  CARACAS  ·  BY APPOINTMENT
  ```
- Slight bold on the year/city

**Position:**
- `top: 80%`, `left: 42%`
- Sits roughly between the left text column and the photographs
- Z-order: above guide lines

---

### Element 9 — Scrawl Marks (PNG assets, bottom edges)
**What they are:** Two (or more) loose ink scrawl / signature marks — large, gestural, imprecise brush or pen strokes. They are transparent PNGs. They sit near the bottom of the composition and deliberately bleed off the left and/or right viewport edges, as if someone grabbed a marker and drew off the edge of the paper.

**Scrawl Left:**
- A large loose ink mark / abstract scrawl
- `width: 30% of viewport`, proportional height
- Position: `bottom: -5%`, `left: -3%` (bleeds off left and bottom edges)
- `transform: rotate(-5deg)` for looseness
- Z-order: top layer — sits above everything else including photographs

**Scrawl Right:**
- A second loose ink mark, different in shape from the first
- `width: 25% of viewport`
- Position: `bottom: 0%`, `right: -2%` (bleeds off right edge)
- `transform: rotate(3deg)`
- Z-order: top layer

**Appearance of both:**
- Black ink on transparent background (PNG)
- `opacity: 0.85` — not pure black, slightly recedes
- Rendered as raw `<img>` tags

---

### Element 10 — Home Icon
- Top-left, `top: 24px`, `left: 24px`
- Abstract geometric SVG mark (BAMN-provided)
- Z-order: top layer — always above everything
- On click: triggers `exit()` animation → navigate to `/`

---

## Reading the Composition as a Whole

When fully assembled, a viewer's eye moves like this:
1. The **massive handwritten headline** at top captures attention first — it is the largest single element and occupies the most space
2. The **two overlapping photographs** in the center-right draw the eye second — they are the only photographic content and have strong visual weight
3. The **vertical guide lines** give the composition structure and a print-grid feeling without calling attention to themselves
4. The **text blocks on the left** (place list, manifesto, keywords) invite close reading — they reward the viewer who lingers
5. The **scrawl marks** at the bottom bleed off the edges, giving the composition an uncontained, hand-made energy
6. The **vertical label** in the top-right anchors the top-right corner and identifies the studio quietly

The overall feeling: **a page torn from BAMN's sketchbook** — art-directed but not over-designed. The chaos is given form, which is exactly the BAMN philosophy.

---

## Data — `site_content` (key: `about`)

The `site_content` table (defined in STACK.md) holds a row where `key = 'about'`. The `value` jsonb stores all editable content and Drive file IDs:

```json
{
  "headline_image": "DRIVE_FILE_ID",
  "vertical_label_line1": "BAMN",
  "vertical_label_line2": "STUDIO COLLECTION",
  "image_a": "DRIVE_FILE_ID",
  "image_b": "DRIVE_FILE_ID",
  "place_list": [
    { "text": "CARACAS", "weight": "bold", "case": "upper" },
    { "text": "Venezuela", "weight": "normal", "case": "mixed" },
    { "text": "RESIDENTIAL", "weight": "bold", "case": "upper" },
    { "text": "Commercial", "weight": "normal", "case": "mixed" }
  ],
  "manifesto": "We use the beauty of chaos and give it form. Every project begins with the willingness to not know the answer yet.",
  "keywords": [
    { "text": "CHAOS", "weight": "bold" },
    { "text": "FORM", "weight": "normal" },
    { "text": "CURIOSITY", "weight": "bold" },
    { "text": "PRECISION", "weight": "normal" }
  ],
  "footer_meta_line1": "EST. 2020  ·  MARCH",
  "footer_meta_line2": "CARACAS  ·  BY APPOINTMENT",
  "scrawl_images": [
    "DRIVE_FILE_ID_SCRAWL_1",
    "DRIVE_FILE_ID_SCRAWL_2"
  ]
}
```

All Drive file IDs are resolved to display URLs via `lib/drive.ts` (per STACK.md). All images rendered as raw `<img>` tags.

### Seed row
```sql
insert into site_content (key, value)
values ('about', '{}'::jsonb)
on conflict (key) do update set value = excluded.value;
```

---

## Entry Animation — View Coming In
Triggered after the Home abyss exit completes, or on direct deep-link (enter only, no abyss).

The collage **assembles itself** — elements arrive in layered order as if being placed onto the paper one by one. All via a single GSAP timeline:

### Sequence:
1. **Vertical guide lines** — `scaleY: 0 → 1` from top, `transform-origin: top center`, 300ms ease-out (the structural skeleton appears first)
2. **Headline PNG** — `opacity: 0 → 1` + `scale: 0.97 → 1`, 500ms ease-out, starts at +50ms (the dominant element arrives)
3. **Image A** — `opacity: 0 → 1` + `translateX(+15px) → 0`, 400ms ease-out, starts at +200ms
4. **Image B** — `opacity: 0 → 1` + `translateX(+10px) → 0`, 400ms ease-out, starts at +320ms (B lands over A, forming the overlap)
5. **Place list** — `opacity: 0 → 1` + `translateY(+10px) → 0`, 350ms, starts at +350ms
6. **Manifesto paragraph** — `opacity: 0 → 1`, 350ms, starts at +430ms
7. **Keywords** — `opacity: 0 → 1` + `translateY(+8px) → 0`, 300ms, starts at +500ms
8. **Footer meta** — `opacity: 0 → 1`, 250ms, starts at +550ms
9. **Vertical label** — `opacity: 0 → 1`, 300ms, starts at +400ms
10. **Scrawl left** — `opacity: 0 → 0.85`, 350ms, starts at +650ms
11. **Scrawl right** — `opacity: 0 → 0.85`, 350ms, starts at +720ms (scrawls arrive last as the final hand-made flourish)
12. **Home icon** — `opacity: 0 → 1`, 200ms, starts at +100ms

Total timeline: ~1.2s. Unhurried. The page composes itself.

---

## Exit Animation — Going Back to Home
Triggered by the Home icon. The collage **comes apart**:

1. Scrawl marks fade out: `opacity → 0`, 200ms
2. Text blocks (keywords, manifesto, place list, footer) — `opacity → 0` + `translateY(+12px)`, staggered 50ms apart, 250ms each
3. Vertical label fades out: 200ms
4. Image B slides right + fades: `translateX(+20px)` + `opacity → 0`, 300ms
5. Image A slides right + fades: `translateX(+15px)` + `opacity → 0`, 300ms, 80ms after B
6. Headline PNG fades + slight scale down: `opacity → 0` + `scale → 0.97`, 300ms
7. Vertical guide lines — `scaleY → 0` from bottom (`transform-origin: bottom center`), 250ms
8. Home icon fades out: 150ms
9. Blank cream → Promise resolves → `useTransitionRouter` navigates to `/` → Home entry animation

---

## View Contract (per STACK.md)
```ts
// AboutView implements TransitionView:
enter(): gsap.core.Timeline   // the assembly sequence above
exit(): Promise<void>         // the come-apart sequence above, resolves on complete
```

---

## Static — No Scroll, No Interaction
- **No scroll.** The composition fits the viewport — it is a poster, read as a whole.
- **No interaction** beyond the Home icon.
- If content overflows on very small viewports, scale the composition down uniformly rather than adding scroll.

---

## Responsive Behavior

### Desktop (primary)
Full absolute-positioned poster as described. All overlaps and positions as specified.

### Tablet
- Scale proportional positions down
- Keep the headline PNG large at top, reduce its bleed
- Images stack slightly less overlapped
- Text blocks compress toward left edge
- Scrawls scale down proportionally

### Mobile
The absolute poster layout cannot fit a narrow screen. Switch to a **single-column stacked layout** that preserves the spirit:
1. Headline PNG at top, full width, scaled to fit
2. Vertical label repositioned as a small horizontal line below the headline (no rotation on mobile)
3. The two images side-by-side with a small overlap (or one stacked over the other, slightly offset)
4. Place list below the images
5. Manifesto paragraph below that
6. Keywords below that
7. Footer meta below that
8. Scrawl left bleeds off left edge near bottom
9. Scrawl right bleeds off right edge near bottom
10. 1 vertical guide line retained on the right side for texture
- Enter/exit animations simplified: fade + short translate only

---

## Assets Required from BAMN
1. **Headline PNG** — transparent PNG of the large handwritten word(s), scanned or drawn digitally, black ink on transparent background, high resolution (min 1600px wide)
2. **Scrawl PNGs (×2 minimum)** — transparent PNGs of loose ink marks/signatures, similarly high resolution
3. **Two photographs** — editorial black-and-white photos (studio, people, materials, work — studio's choice), portrait orientation preferred, minimum 800px wide each
4. **All copy** — vertical label lines, place list entries (with bold/normal rhythm specified), manifesto paragraph, keyword stack (with bold/normal rhythm), footer meta lines

> **Production note:** This view is light to produce. No controlled photo shoot required. The PNG assets (headline + scrawls) can be created in one sitting with a brush pen and scanner, or digitally in Procreate. The two photographs can be any strong editorial images from the studio's existing library.

---

## File Structure
```
/app
  about/page.tsx              <- server: fetch site_content key='about' -> <AboutView content={data} />
/components
  views/
    AboutView.tsx             <- collage layout, absolute positions, GSAP enter/exit
/lib
  drive.ts                    <- resolves Drive file IDs to image URLs (shared utility)
```

---

## State Machine Summary
```
HIDDEN
  ↓ (home abyss exit OR direct deep-link)
ENTERING (collage assembles element by element via GSAP timeline)
  ↓
RESTING (fully static — Home icon only)
  ↓ (click home icon)
EXITING (collage comes apart) → blank cream → HOME
```

---

## Key Principle for This View
**Describe it in space, not in code.** Every element has a precise position, size, z-order, rotation, and opacity. The developer's job is to place those elements exactly where specified and wire the GSAP timeline. There is no interaction logic, no state machine, no data fetching beyond the initial load. The composition *is* the design — keep the positions, the overlaps, and the weight rhythm of the typography exactly as described. Adjustments for visual balance on the actual content are expected and encouraged, but the spatial logic (dominant headline top, photographs center-right overlapping, text left, scrawls bleeding off bottom) must be preserved.
