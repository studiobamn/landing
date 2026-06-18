# BAMN — HOME VIEW SPEC

## Overview
The Home view is the entry point of the BAMN architecture studio website. It has no traditional navigation, header, or footer. It is a physics-driven canvas where 4 custom image components act as the only navigation. The entire experience is built with Matter.js for physics and a DOM sync layer for real image rendering.

---

## Tech Stack for This View
- **Matter.js** — physics engine (bodies, gravity, sleeping, mouse constraint)
- **DOM sync layer** — `<div>` or `<img>` elements positioned via `requestAnimationFrame` to match each Matter.js body's `x`, `y`, and `angle` every frame
- **Canvas layer** — transparent, sits above the text layer, below nothing (no UI drawn on canvas itself)
- **Three stacked layers total:**
  1. Back layer — static poem/text (plain DOM, `z-index: 0`)
  2. Canvas layer — Matter.js canvas, transparent background (`z-index: 1`)
  3. DOM image layer — synced image divs (`z-index: 2`)

---

## Visual Design
- Background: off-white / cream (`#F5F2EC` or similar paper tone)
- No header, no footer, no navigation bar, no menu
- Font: condensed bold sans-serif for any labels (matching BAMN brand — see brand notes)
- The **BAMN logo circle** is not a nav element — it can sit as a subtle watermark or be absent on Home entirely since the components ARE the navigation

---

## Layer 1 — Background Text (The Poem)
- A short text fragment or quote sits scattered across the background
- Style: sparse, wide letter-spacing, small size, low contrast against the background (e.g. `color: #C8C4BC`)
- The text is **static** — it does not move during physics interaction
- It is purely atmospheric — it does not function as navigation
- On exit (abyss animation) the text animates **downward and fades out** simultaneously with the physics bodies falling

---

## Layer 2 — Physics Bodies (Matter.js)

### Setup
- Create a Matter.js `Engine`, `Render` (with transparent canvas background), `Runner`, and `World`
- Canvas render background: `transparent` — the cream page color shows through from the HTML body
- Gravity: default downward (`gravity.y = 1` or slightly higher for snappier drop)
- Add a **floor** body at the bottom of the viewport (static, invisible) for bodies to land on
- Add **left and right wall** bodies (static, invisible) to keep bodies in viewport during fall

### The 4 Bodies
- Each body is a **rectangle** sized to match its corresponding image component
- Suggested sizes: roughly `280px × 380px` for portrait images, adjust per content
- Body properties:
  - `restitution: 0.3` (slight bounce on impact)
  - `friction: 0.8`
  - `frictionAir: 0.02`
  - `density: 0.002`
- Each body spawns **above the viewport** (`y: -200` to `-600`) with staggered timing (e.g. 0ms, 150ms, 300ms, 450ms delays) and slight random horizontal offset within a safe range so they don't all fall in the exact same column

### Fixed Target Positions
Define 4 fixed `(x, y)` target positions on the canvas — a slightly asymmetric scattered layout, not a perfect grid. Suggested approximate positions for a 1440×900 viewport (scale proportionally):
```
Position A: { x: 320,  y: 580 }
Position B: { x: 780,  y: 420 }
Position C: { x: 1100, y: 640 }
Position D: { x: 560,  y: 720 }
```
Adjust to taste — the goal is an organic "gathered" look, not a grid.

### Randomized Assignment
On every page load, shuffle the array of 4 view components (`['projects', 'product', 'about', 'contact']`) and assign one to each position. This means the layout is always the same 4 positions but the content in each position changes every load.

```js
const views = ['projects', 'product', 'about', 'contact'];
const shuffled = views.sort(() => Math.random() - 0.5);
// shuffled[0] → Position A, shuffled[1] → Position B, etc.
```

### Settle Behavior
- When a body's velocity drops near zero, **tween it to its assigned fixed target position** using a short easing animation (150–200ms, ease-out)
- Then call `Matter.Sleeping.set(body, true)` to sleep the body at that position
- This ensures no overlap between bodies in their rested state
- Bodies **wake on drag** automatically via `MouseConstraint`

### Sleeping State
- Once all 4 bodies are settled and sleeping, the physics world is still running
- A user drag **wakes** the dragged body — it can be thrown and will interact with other bodies
- Other sleeping bodies wake on collision impact
- This creates the "fixed but alive" feel — the layout holds but is never truly frozen

---

## Layer 3 — DOM Image Components

### Structure
Each of the 4 components is a `<div class="component">` containing:
- A `<img>` tag with the view's custom image (full bleed, `object-fit: cover`)
- A `<span class="label">` with the view name — hidden by default, visible on hover

```html
<div class="component" data-view="projects">
  <img src="/assets/projects-cover.jpg" alt="Projects" draggable="false" />
  <span class="label">Projects</span>
</div>
```

### DOM Sync Loop
Every frame via `requestAnimationFrame`, read each Matter.js body's `position.x`, `position.y`, and `angle`, then apply to the corresponding DOM element:

```js
Matter.Events.on(engine, 'afterUpdate', () => {
  bodies.forEach((body, i) => {
    const el = componentEls[i];
    el.style.transform = `
      translate(${body.position.x - el.offsetWidth / 2}px, 
                ${body.position.y - el.offsetHeight / 2}px) 
      rotate(${body.angle}rad)
    `;
  });
});
```

### Label Behavior
- Label `<span>` sits bottom-center of the component, small condensed type
- `opacity: 0` by default
- On `mouseover` of the component: `opacity: 1` (transition 200ms)
- On `mouseleave`: `opacity: 0`
- Label text: `Projects`, `Product`, `About`, `Contact` — in BAMN brand typeface, uppercase, small size

---

## Interaction — Drag vs Click Detection

Use `Matter.MouseConstraint` for dragging. Detect click vs drag with a threshold:

```js
let mouseDownTime = 0;
let mouseDownPos = { x: 0, y: 0 };
const CLICK_THRESHOLD_MS = 200;
const CLICK_THRESHOLD_PX = 5;

// On mousedown
mouseDownTime = Date.now();
mouseDownPos = { x: e.clientX, y: e.clientY };

// On mouseup
const elapsed = Date.now() - mouseDownTime;
const dx = Math.abs(e.clientX - mouseDownPos.x);
const dy = Math.abs(e.clientY - mouseDownPos.y);

if (elapsed < CLICK_THRESHOLD_MS && dx < CLICK_THRESHOLD_PX && dy < CLICK_THRESHOLD_PX) {
  // It's a click — trigger navigation
  triggerAbyssExit(targetView);
} else {
  // It's a drag — let Matter.js handle it, no navigation
}
```

---

## Exit Animation — "The Abyss"

Triggered when user clicks a component. The target view string is passed to the router.

### Sequence:
1. **Remove the floor body** from the Matter.js world (`Matter.World.remove(world, floor)`)
2. **Increase gravity** sharply: `engine.gravity.y = 4`
3. **Wake all sleeping bodies**: call `Matter.Sleeping.set(body, false)` on each
4. All 4 bodies **fall off the bottom** of the screen under amplified gravity
5. Simultaneously: background poem text animates `translateY(+80px)` and `opacity: 0` over 600ms
6. After 800ms (bodies are off screen): **fade entire canvas and DOM layer to opacity 0** over 200ms
7. Screen is now blank cream
8. **Trigger the target view's entry animation**

---

## Entry Animation — On Load and On Return from any view

The same spawn sequence runs:
1. Reshuffle the 4 view assignments to positions
2. Spawn bodies above viewport with staggered delays
3. Restore floor, restore gravity to default
4. Bodies fall, collide, settle into fixed positions
5. Background poem text fades in (`opacity: 0` → `1`) over 400ms, starting when first body lands

**On return from a sub-view:** play the exact same sequence. Fresh drop every time.

---

## Persistent Element — Home Icon
- The Home icon does **not appear on the Home view itself**
- It only appears in all other views (Projects, Product, About, Contact)
- It is an abstract geometric mark — a minimal reduction of the BAMN circle, or a custom SVG icon
- Positioned top-left in all sub-views
- On click: triggers the sub-view exit animation → Home entry animation

---

## Assets Required from BAMN
1. **4 custom cover images** — one per view (Projects, Product, About, Contact)
   - These should be strong, editorial photographs
   - Suggested aspect ratio: portrait `3:4` or square `1:1` — confirm with studio
   - The image alone should communicate what section it leads to (no reliance on label text)
2. **Background poem/text** — a short text fragment chosen by the studio (optional — can be a placeholder quote during development)
3. **Home icon SVG** — the abstract mark used as back-to-home button in all sub-views

---

## Responsive Behavior
- **Desktop (primary):** full physics experience as described
- **Mobile:** reduce to 2 bodies visible at a time, or scale bodies down proportionally. Physics still runs but with reduced body count or simplified collision. Drag-to-throw still works via touch events (`Matter.Mouse` supports touch).
- Touch events use the same drag vs tap detection logic substituting `touchstart`/`touchend` for `mousedown`/`mouseup`

---

## Performance Notes
- Only 4 physics bodies — this is extremely lightweight, no performance concern
- Sleep inactive bodies immediately after settling to reduce engine load
- Use `Matter.Runner` with a fixed timestep
- Canvas render can be set to `wireframes: false`, `background: 'transparent'`, `pixelRatio: window.devicePixelRatio` for sharp rendering

---

## File Structure Suggestion
```
/home
  index.html
  home.js        ← all Matter.js logic, DOM sync, interaction
  home.css       ← layer stacking, component styles, label styles
/assets
  projects-cover.jpg
  product-cover.jpg
  about-cover.jpg
  contact-cover.jpg
```
