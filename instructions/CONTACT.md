# BAMN — CONTACT VIEW SPEC

## Overview
The Contact view is the **quietest, most restrained view of the entire site** — a deliberate exhale after the chaos of Home, the motion of Projects, and the personality of About. It is a single composed editorial page: one massive red header, one location (Caracas), one photograph of the studio principals, and a few small inquiry text blocks. No form, no map, no chatbot. The restraint is the statement.

---

## Tech Stack for This View
- Vanilla JS / minimal — this view has almost no interaction logic
- CSS for the editorial layout
- The only "logic" is the entry/exit animation and the Home icon
- No Matter.js, no sprite sheets, no modal

---

## Visual Reference
Based on the Norm Architects / "Contact us" broadsheet reference: a huge bold header in red at the top, social links in a quiet centered row beneath it, a single location block with `label/ value` structure, small inquiry category blocks bottom-left with red labels, and one large photograph anchored bottom-right.

---

## Entry Animation — View Coming In
Triggered after the Home abyss exit completes and the screen is blank cream.

### Sequence:
1. **Red header** enters first — the word draws attention immediately. Either fade up (`opacity: 0 → 1` + `translateY(20px) → 0`, 500ms) OR a subtle horizontal wipe/reveal. Keep it confident and clean — this is the loudest moment of the quietest page.
2. Social links row fades in below the header, 300ms, starting 200ms after header
3. Location block fades/slides up: `translateY(20px) → 0` + `opacity: 0 → 1`, 400ms, staggered after social links
4. Photograph slides in from the right or fades in, anchored bottom-right, 500ms
5. Inquiry category blocks (bottom-left) fade in last, staggered, 300ms
6. Home icon fades in top-left

Total entry: ~1.2s, calm and unhurried — the pacing itself signals "slow down, you've arrived."

---

## Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ ↖ [home]                                                        │
│                                                                 │
│   CONTACT                                                       │
│   ████████  (massive, red, bold)                               │
│                                                                 │
│              Instagram    Behance    LinkedIn                  │
│              (quiet centered social row)                        │
│   ─────────────────────────────────────────────────────────   │
│                                                                 │
│   Caracas        Phone/    +58 ...                             │
│                  Email/    studio@bamn...                       │
│                  Address/  ...                                 │
│                            ...                                 │
│                                          ┌──────────────────┐  │
│                                          │                  │  │
│   Social                                 │  bw photo of     │  │
│   New Business/                          │  sister +        │  │
│   ...                                    │  associate in    │  │
│   Job Applications/                      │  the studio      │  │
│   ...                                    │                  │  │
│   Portfolios/                            └──────────────────┘  │
│   ...                                                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Elements

### Red Header
- The word **"CONTACT"** (or "BAMNED" / "Contact us" — confirm wording with BAMN)
- **Massive bold type** — fills much of the top width, same display weight used elsewhere on the site
- Color: **red** — this is the one place outside accents where red goes full scale. It hits hard precisely because red has been so restrained everywhere else on the site.
- Top-aligned, left or full-width

### Social Links Row
- A quiet horizontal row beneath the header
- Minimum: **Instagram** (their primary channel — `@studio.bamn`)
- Optional: Behance, LinkedIn, or others BAMN uses
- Small, centered or left-aligned, condensed type, dark (not red)
- Each is a link (`target="_blank"`)
- Subtle hover: underline or opacity shift

### Divider
- A thin hairline rule below the social row (optional) — separates header zone from contact details, matching the broadsheet reference

### Location Block — Single Location (Caracas)
- Heading: **Caracas** — bold, BAMN display type, medium size
- Below/beside it, the `label/ value` structure:
```
Phone/      +58 ...
Email/      studio@bamn...
Address/    [street address]
            [city, postal]
            Venezuela
```
- Labels (`Phone/`, `Email/`, `Address/`) in small muted condensed type
- Values aligned in a column to the right of the labels
- Only ONE location — no second city. The single location is intentional and confident.

### Photograph
- One editorial photo of **the sister and her associate** (the studio principals)
- Black and white, candid or semi-candid in the studio space
- Anchored **bottom-right**, large enough to feel like a presence — not a thumbnail
- Suggested: occupies roughly the bottom-right quadrant, `object-fit: cover`
- No caption needed, or a tiny one (names) in small type

### Inquiry Category Blocks (Bottom-Left)
Small text blocks, each with a **red category label** (matching the reference's red "Social / Job Applications/" labels) followed by a line of plain instruction:
```
Social                    ← red label (section header)

New Business/             ← red sub-label
Please direct new project enquiries to studio@bamn...

Job Applications/         ← red sub-label
Send your portfolio to jobs@bamn... Max 10MB, PDF only.

Portfolios/               ← red sub-label
Accepted as PDF only. Max 10MB.
```
- Category labels in red, small, condensed
- Instruction text in dark, small, plain
- Left-aligned, bottom of the page
- These replace a contact form — direct people to email rather than a form

---

## Interaction
This view has almost **no interaction** by design:
- Social links → open external profiles
- Email addresses → `mailto:` links (clicking opens the user's mail client)
- Phone → optional `tel:` link
- Home icon → back to Home
- That's it. No form fields, no submit buttons, no map embed.

The lack of interaction IS the design — it's a calm, printed-feeling endpoint.

---

## Connection from Product View
If the Product view's contact CTA uses **Option B** (route to Contact instead of inline form), then:
- When arriving from a product, a small line can appear near the inquiry blocks: e.g. `Re: [Product Name]` — pre-noting which piece the user was interested in
- The email link can be pre-filled: `mailto:studio@bamn...?subject=Interested in [Product Name]`
- If Product uses **Option A** (inline form, recommended), this connection isn't needed and Contact stays fully static

---

## Exit Animation — Going Back to Home

Triggered by the Home icon (top-left, persistent).

### Sequence:
1. Photograph slides out right + fades: `translateX(+60px)` + `opacity: 0`, 350ms
2. Location block + inquiry blocks fade down: `translateY(+30px)` + `opacity: 0`, 300ms
3. Red header fades out: `opacity: 0`, 300ms
4. Social row fades out
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
- **Desktop:** full broadsheet layout as described, photo bottom-right, inquiry blocks bottom-left
- **Tablet:** header scales down, photo moves to full-width below the location block, inquiry blocks stack below the photo
- **Mobile:**
  - Red header at top (scaled to fit, still bold and red)
  - Social row below
  - Location block stacked (label above value if needed for width)
  - Photo full-width
  - Inquiry blocks stacked at bottom
  - Everything single-column, generous spacing — keep the calm, uncluttered feeling

---

## Assets Required from BAMN
1. **Header wording** — "CONTACT", "Contact us", or "BAMNED" (confirm)
2. **One photograph** — sister + associate, black and white, editorial quality, studio setting
3. **Location details:**
   - Phone number
   - Email address(es) — general, jobs, etc.
   - Full Caracas address
4. **Social links** — Instagram (`@studio.bamn`) minimum, plus any others
5. **Inquiry copy** — the exact instruction text for New Business / Job Applications / Portfolios (or whichever categories BAMN wants)

---

## Data Structure Suggestion
```js
const contact = {
  header: 'CONTACT',
  socials: [
    { label: 'Instagram', url: 'https://instagram.com/studio.bamn' },
    // { label: 'Behance', url: '...' },
  ],
  location: {
    city: 'Caracas',
    phone: '+58 ...',
    email: 'studio@bamn...',
    address: ['Street ...', 'Caracas 1060', 'Venezuela']
  },
  photo: '/assets/contact/principals-bw.jpg',
  inquiries: [
    { label: 'New Business/',     text: 'Direct new project enquiries to studio@bamn...' },
    { label: 'Job Applications/', text: 'Send your portfolio to jobs@bamn... Max 10MB, PDF only.' },
    { label: 'Portfolios/',       text: 'Accepted as PDF only. Max 10MB.' }
  ]
};
```

---

## File Structure Suggestion
```
/contact
  contact.js       ← entry/exit animation, home icon, mailto wiring
  contact.css      ← broadsheet layout, red header, photo anchor, inquiry blocks
/assets/contact/
  principals-bw.jpg
```

---

## State Machine Summary
```
HIDDEN
  ↓ (home abyss exit complete)
ENTERING (red header in, details settle, photo slides in)
  ↓ (animation complete)
RESTING (static — links and mailto only)
  ↓ (click home icon)
EXITING → HOME
```

---

## Key Principle for This View
**Restraint is the statement.** This is the only view where nothing moves, nothing rotates, nothing collides. After a whole site of physics and motion and personality, Contact is the deep breath. One red word, one location, one photograph, a few quiet lines. Every instinct to add a form, a map, an animation — resist it. The emptiness and calm tell the visitor that BAMN is confident enough not to oversell. The single full-scale use of red on the header lands harder here than anywhere because the whole site earned it.
