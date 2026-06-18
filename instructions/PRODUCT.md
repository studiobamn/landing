# BAMN — PRODUCT VIEW SPEC

## Overview
The Product view showcases BAMN's current line of designed objects ("specials" / a numbered Volume). It is the **most structured, grid-disciplined view** of the entire site — a deliberate contrast to the chaos of Home. Products are not sold online. Each product can be inspected via a modal that **expands from its card**, and the only commerce interaction is a single contact CTA.

The signature moment of this view is the **BAMNED SVG header that draws itself on load** — letters traced like a pen, with a strikethrough line drawn across "BAMN" as the final gesture.

---

## Tech Stack for This View
- Vanilla JS or lightweight framework
- **SVG with `stroke-dashoffset` animation** for the BAMNED header
- CSS Grid for the product layout
- CSS transforms + transitions for the expand-from-card modal (FLIP technique recommended — see Modal section)
- No Matter.js in this view

---

## Entry Animation — View Coming In
Triggered after the Home abyss exit completes and the screen is blank cream.

### Sequence:
1. **BAMNED SVG header draws itself** (see SVG Header section) — approximately 1.5–2s
2. Volume label fades in below the header: `opacity: 0 → 1` + `translateY(10px) → 0`, 400ms, starting ~800ms into the header draw
3. Product grid items fade in **staggered**, row by row: each card `opacity: 0 → 1` + `translateY(20px) → 0`, 60ms delay between cards, starting once the header draw is ~70% complete
4. Home icon fades in top-left simultaneously with the volume label

---

## SVG Header — "BAMNED" (Signature Element)

### Visual
The word **BAMNED** rendered as SVG paths, with a horizontal **strikethrough line crossing only the "BAMN" portion** (leaving "ED" un-struck) — matching the BAMN brand mark where "BAMN" is crossed out to read "BAMNED".

### Animation — Draw On
- Each letter is an SVG `<path>` with a defined `stroke`, `stroke-width`, `fill: none` initially
- Use `stroke-dasharray` set to the path length and `stroke-dashoffset` animated from full length to `0` — this creates the "drawing" effect
- Letters draw **in sequence**: B → A → M → N → E → D, each starting slightly after the previous (stagger ~150ms)
- After all letters complete, the **strikethrough line draws last** — a single horizontal stroke crossing the BAMN letters, drawn left to right over ~300ms
- Optional: once drawing completes, `fill` transitions in (`fill-opacity: 0 → 1`) to turn the outlined letters solid black

### Timing
```
0ms     → B begins drawing
150ms   → A begins
300ms   → M begins
450ms   → N begins
600ms   → E begins
750ms   → D begins
~1100ms → all letters drawn
1100ms  → strikethrough line begins drawing
1400ms  → strikethrough complete
1400ms  → optional fill transition (200ms)
```

### Implementation Note
```js
const paths = document.querySelectorAll('#bamned-svg path');
paths.forEach((path, i) => {
  const length = path.getTotalLength();
  path.style.strokeDasharray = length;
  path.style.strokeDashoffset = length;
  path.style.animation = `draw 0.6s ${i * 0.15}s ease forwards`;
});
```
```css
@keyframes draw {
  to { stroke-dashoffset: 0; }
}
```

### Asset Requirement
BAMN must provide the **BAMNED logo as an SVG with clean, single-stroke-friendly paths** (or it must be traced into outline paths). The strikethrough line is a separate `<line>` or `<path>` element so it can animate independently.

---

## Layout — Resting State

```
┌─────────────────────────────────────────────────────────────────┐
│ ↖ [home]                                                        │
│                                                                 │
│   B̶A̶M̶N̶ED                          [studio subtitle line]      │
│   ──────                                                        │
│                                                                 │
│   Vol. 01  /  current line name                                │
│                                                                 │
│   ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                       │
│   │ img  │  │ img  │  │ img  │  │ img  │                       │
│   └──────┘  └──────┘  └──────┘  └──────┘                       │
│   Product   Product   Product   Product                        │
│   ● ● ○      ●          ● ●       ●                            │
│                                                                 │
│   ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                       │
│   │ img  │  │ img  │  │ img  │  │ img  │                       │
│   └──────┘  └──────┘  └──────┘  └──────┘                       │
│   Product   Product   Product   Product                        │
└─────────────────────────────────────────────────────────────────┘
```

### Header Zone
- BAMNED SVG header, large, top-left
- Optional small subtitle line top-right (e.g. "Objects by BAMN" / a short tagline) — small condensed type, matching the CU-RATED reference's right-aligned descriptor

### Volume Label
- Sits below the header where the subtitle lives in the CU-RATED reference
- Format: `Vol. 01 / [line name]` — small, condensed, BAMN type
- This names the current available line ("specials in volumes")
- If there are filter categories, they can sit here as inline tags (e.g. `All (12), Seating, Lighting, Objects`) — but if it's a single line, just the volume name alone

### Product Grid
- **Strict CSS Grid** — this is the one rigidly ordered view on the site
- Suggested: 4 columns on desktop, 3 on tablet, 2 on mobile
- Consistent gap (suggested `24px`)
- Each card: square or `4:5` portrait image, `object-fit: cover`
- Product name below each image — small condensed type, left-aligned under the card
- Variation dots below the name (see Variation Dots)

---

## Variation Dots (Per Card)

If a product has multiple variations (materials, colors, finishes):
- Small row of dots below the product name, one dot per variation
- First dot is "active" by default (filled), others are outlined
- **On hover/tap of a dot:** the card image **crossfades** to that variation's image (200ms), and the hovered dot becomes active
- This lets users preview all variations without opening the modal
- If a product has only one variation, no dots are shown

```html
<div class="card" data-product="chair-01">
  <img src="/assets/products/chair-01-a.jpg" class="card-img" />
  <span class="card-name">Steel Chair</span>
  <div class="dots">
    <button class="dot active" data-variant="0"></button>
    <button class="dot" data-variant="1"></button>
    <button class="dot" data-variant="2"></button>
  </div>
</div>
```

---

## Interaction — Clicking a Product (Expand-from-Card Modal)

### The expand
The modal **originates from the clicked card's exact position and size** and scales outward to fill the center of the screen. This uses the **FLIP technique** (First, Last, Invert, Play) for a smooth transform-based expansion:

1. **First:** record the clicked card's bounding rect (position + size)
2. **Last:** the modal's final centered position + size
3. **Invert:** position the modal at the card's rect using a transform
4. **Play:** transition the transform to identity — the modal animates from card → center

Duration: ~450ms, cubic-bezier ease-in-out.

### Background behavior during expand
- The other grid cards **do not disappear** — they **dim** (`filter: brightness(0.5)` or an overlay at `opacity: 0.4`), 300ms transition
- The grid stays in place behind the modal — no layout shift
- The expanded modal sits above the grid (`z-index` elevated), full opacity

### Modal Layout

```
┌─────────────────────────────────────────────────┐
│                                            [×]   │
│  ┌─────────────────┐                            │
│  │                 │   Product Name             │
│  │  large product  │   Vol. 01                  │
│  │     image       │                            │
│  │                 │   Description text about    │
│  │                 │   the piece, materials,     │
│  └─────────────────┘   dimensions, etc.          │
│                                                  │
│  ● ● ○  (variation swatches)                    │
│                                                  │
│         [ Get in touch about this piece ]       │
└─────────────────────────────────────────────────┘
```

- **Left:** large product image
- **Variation swatches** below the image — larger version of the dots, clicking swaps the main image (crossfade)
- **Right:** product name, volume, description, materials, dimensions
- **Bottom:** single CTA button — `Get in touch about this piece`
- **Top-right:** close button `×`

### The CTA — Contact Interaction
The single CTA is the **only commerce interaction** in the entire site. Two options for behavior (pick one with BAMN):

**Option A — Inline mini-form:** clicking the CTA reveals a minimal inline form within the modal (name, email, message — message pre-filled with "I'm interested in [Product Name]"). Submit sends an email/form submission.

**Option B — Route to Contact view:** clicking the CTA triggers the modal close, then navigates to the Contact view with the product name pre-noted (e.g. a pre-filled inquiry reference).

**Recommended: Option A** — keeps the user in flow, doesn't force a context switch. The form is minimal and the product reference is automatic.

---

## Interaction — Closing the Modal

Triggered by the `×` button, clicking outside the modal (on the dimmed backdrop), or `Esc` key.

### Sequence:
1. Modal **contracts back into the exact card it came from** — reverse FLIP, the modal shrinks and travels back to the card's position/size, 450ms
2. **Simultaneously** the grid brightness **restores** (`filter: brightness(1)`), 300ms
3. Modal fully disappears as it reaches card size
4. View returns to Resting state — grid fully bright, no modal

The contract-back must target the **same card** that was clicked, even if the user has scrolled (recalculate the card's current bounding rect at close time).

---

## Exit Animation — Going Back to Home

Triggered by the Home icon (top-left, persistent).

### Sequence:
1. If a modal is open: close it first (quick 200ms contract) or hard-cut
2. Product grid cards fade and slide down: `opacity: 0` + `translateY(30px)`, staggered 40ms, 300ms
3. BAMNED header fades out: `opacity: 0`, 300ms (no reverse-draw — just fade)
4. Volume label fades out
5. Home icon fades out
6. Screen is blank cream
7. **Trigger Home entry animation**

---

## Persistent Element — Home Icon
- Top-left, `24px` from edges
- Abstract geometric SVG mark (BAMN-provided)
- On click: triggers exit → Home

---

## Responsive Behavior
- **Desktop:** 4-column grid, modal expands to ~70% viewport width
- **Tablet:** 3-column grid, modal ~80% width
- **Mobile:** 2-column grid. Modal expands to near full-screen. Modal layout stacks vertically (image on top, info below, CTA at bottom). Variation dots use tap instead of hover. The expand-from-card still originates from the tapped card.

---

## Assets Required from BAMN
1. **BAMNED logo as clean SVG** — outline paths suitable for stroke-draw animation, with the strikethrough as a separate animatable element
2. **Volume name** — the name of the current line (e.g. "Vol. 01 — [name]")
3. Per product:
   - **Product name**
   - **One image per variation** (or a single image if no variations)
   - **Description** — short paragraph about the piece
   - **Materials** — e.g. "Powder-coated steel, oak"
   - **Dimensions** — e.g. "H 80 × W 45 × D 50 cm"
   - **Variation labels** (optional) — names for each variation if relevant
4. **Optional subtitle line** for top-right of header

---

## Data Structure Suggestion
```js
const productLine = {
  volume: 'Vol. 01',
  lineName: 'Objects in Steel',
  products: [
    {
      id: 'chair-01',
      name: 'Steel Chair',
      description: 'A single-bent steel frame...',
      materials: 'Powder-coated steel',
      dimensions: 'H 80 × W 45 × D 50 cm',
      variants: [
        { label: 'Black', img: '/assets/products/chair-01-black.jpg' },
        { label: 'Red',   img: '/assets/products/chair-01-red.jpg' },
        { label: 'Raw',   img: '/assets/products/chair-01-raw.jpg' }
      ]
    },
    // ... repeat per product
  ]
};
```

---

## File Structure Suggestion
```
/product
  product.js       ← grid render, variation logic, FLIP modal, contact CTA
  product.css      ← grid, card styles, modal styles, dim states
  bamned.svg       ← inline SVG header (or kept in HTML)
/assets/products/
  chair-01-black.jpg
  chair-01-red.jpg
  ...
```

---

## State Machine Summary
```
HIDDEN
  ↓ (home abyss exit complete)
ENTERING (BAMNED draws, grid staggers in)
  ↓ (animation complete)
RESTING (grid bright, no modal)
  ↓ (click card)
MODAL_OPEN (modal expanded from card, grid dimmed)
  ↓ (× / backdrop / esc)        ↓ (click CTA → Option A)
RESTING                       CONTACT_FORM (inline form in modal)
  ↓ (click home icon)
EXITING → HOME
```

---

## Key Principle for This View
**Structure is the statement.** Everywhere else on the site is chaos and physics — here, the strict grid is intentional and felt. The discipline of this view makes the chaos elsewhere read as deliberate rather than accidental. Keep the grid clean, the spacing precise, the type aligned. The only "loose" moment is the BAMNED header drawing itself — one expressive gesture in an otherwise controlled space.
