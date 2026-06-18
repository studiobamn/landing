# BAMN — STACK & ARCHITECTURE SPEC

## Overview

This document defines the complete technical stack, architecture, and conventions for the BAMN architecture studio website. It is the source of truth for _how_ the site is built. The five view specs (HOME.md, PROJECTS.md, PRODUCT.md, ABOUT.md, CONTACT.md) define _what_ each view does; this file defines the foundation they all sit on.

---

## Core Stack

| Concern               | Choice                                                |
| --------------------- | ----------------------------------------------------- |
| Framework             | **Next.js (App Router)**                              |
| Language              | **TypeScript** (always, strict mode)                  |
| Styling               | **Tailwind CSS**                                      |
| Physics (Home)        | **Matter.js**                                         |
| Animation (all views) | **GSAP** (incl. Flip plugin + ScrollTrigger)          |
| Smooth scroll         | **Lenis**                                             |
| Global state          | **Zustand**                                           |
| Database              | **Supabase (Postgres)**                               |
| Media storage         | **Google Drive** (file IDs stored in Supabase)        |
| Email                 | **Resend**                                            |
| Hosting               | **Vercel**                                            |
| Content management    | **Supabase dashboard** (no custom admin panel for v1) |
| Auth                  | **None** (no admin panel, no user accounts in v1)     |

---

## Routing Model — Option B: Real Routes + Controlled Transitions

### Routes

Real, deep-linkable routes via the App Router:

```
/            → Home   (physics canvas)
/projects    → Projects
/product     → Product
/about       → About
/contact     → Contact
```

Optional future: `/projects/[slug]` for individually shareable projects (v2 — structure data to allow it, don't build it yet).

### The Navigation Contract

Views do **not** hard-navigate. Navigation is choreographed: the current view animates **out**, then the route changes, then the next view animates **in** from a blank state. This is owned by a custom hook.

### `useTransitionRouter` hook

Wraps Next's `useRouter` and enforces the sequence:

```
navigate(to: string)
  1. set navigationState = 'exiting'
  2. await currentView.exit()         // GSAP timeline → Promise, runs while page still mounted
  3. router.push(to)                  // Next swaps route; blank cream gap covers the swap
  4. new view mounts in pre-state
  5. set navigationState = 'entering'
  6. currentView.enter()              // plays on mount
  7. set navigationState = 'idle'
```

**Key mechanic — animate before navigate:**
The old page DOM is animated **while still mounted** (no route change yet). Only after `exit()` resolves do we call `router.push`. The blank cream gap between push and the next view's `enter()` covers the actual route swap. This avoids fighting App Router's unmount lifecycle — no `template.tsx` freeze-frame tricks needed.

### Deep-link behavior

When a user lands **directly** on a route (pasted URL, client link, refresh):

- The view plays **only its own `enter()` animation**
- **No abyss, no Home boot-through** — direct URLs go straight to that view's entrance
- The abyss/Home physics exit only plays during **in-app navigation**
- Detect this via a "has navigated within app" flag in Zustand (false on first load → skip exit logic, play enter only)

### The View Contract (every view implements this)

Each view component exposes the same interface so the hook is generic:

```ts
interface TransitionView {
  enter: () => gsap.core.Timeline; // plays on mount from blank pre-state
  exit: () => Promise<void>; // plays before navigation, resolves when done
}
```

Views read `navigationState` ('idle' | 'exiting' | 'entering') from Zustand.
The hook orchestrates; **each view owns its own enter/exit animations** (defined in that view's spec).

- **Home's `exit()`** = the abyss (physics drop-out + poem fall).
- **Each sub-view's `exit()`** = its specified exit animation.
- The Home icon (top-left in sub-views) calls `navigate('/')`.

---

## Data Fetching Strategy

### Server-fetch, then hydrate

- **Server Components** fetch from Supabase at request/build time
- Data passed as **props** into **Client Components** that own the Matter.js / GSAP logic
- Client components handle all interactivity and animation; they never fetch directly (v1)

### Rendering mode

- Portfolio content changes rarely → use **ISR (Incremental Static Regeneration)** or static generation with revalidation
- Suggested: `export const revalidate = 60` (or higher) on data-driven routes, so content edits in Supabase appear without a redeploy
- The animation-heavy views are client-side after hydration

### Pattern per view

```
app/projects/page.tsx        (Server Component)
  → fetch projects from Supabase
  → render <ProjectsView projects={data} />   (Client Component '"use client"')
       → owns GSAP timelines, state machine, DOM
```

---

## Media Storage — Google Drive

### Why Drive

The studio already pays for Google Drive and will host a large volume of media there. Supabase Storage would incur additional cost at this volume. Drive is the storage bucket; Supabase stores **references**, not the media itself.

### Store file IDs, not full URLs

In the database, store the **Google Drive file ID** (not a full share URL). Construct the display URL in code via a helper. This way, if Google changes the URL format, it's fixed in **one place**.

```ts
// lib/drive.ts
export function driveImageUrl(fileId: string): string {
  // Direct-view format for embedding images
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
  // NOTE: if Google throttles/changes this, swap the format here only.
}
```

### Setup requirements

- Drive files/folders holding media must be set to **"Anyone with the link can view"** so they're publicly embeddable
- Consider a dedicated Drive folder structure: `/projects`, `/products`, `/about`, `/contact`
- The helper module (`lib/drive.ts`) isolates all Drive logic so it's **swappable** if the studio ever migrates to Supabase Storage / a real CDN later

### Image optimization caveat

- `next/image` optimization on Drive URLs is **unreliable** (domain allowlist + Google redirects fight it)
- **Decision:** Drive-hosted media uses raw `<img>` tags. Only local/Supabase-hosted assets (icons, static UI) may use `next/image`
- The Home physics textures and all gallery images = raw `<img>` synced to Matter.js bodies / rendered directly
- This resolves the earlier "try both" question: **Drive media → `<img>`; static local assets → `next/image`**

---

## Database — Supabase (Postgres)

### Approach

- SQL `CREATE TABLE` statements written **in the codebase** (a `/supabase/schema.sql` file) as a **pre-state** starting point
- These are intentionally **mutable** — expect to edit columns/tables freely as the project evolves
- Run them in the Supabase SQL editor; treat the file as living documentation of current schema, not a locked migration
- Content is managed directly via the **Supabase dashboard** (table editor)

### Starter Schema (pre-state — edit freely)

```sql
-- =========================================
-- BAMN — starter schema (pre-state)
-- Edit columns/tables freely as needs change.
-- Media: store Google Drive FILE IDs, not URLs.
-- =========================================

-- PROJECTS
create table if not exists projects (
  id           uuid primary key default gen_random_uuid(),
  number       text,                       -- display number e.g. "01"
  slug         text unique,                -- for future /projects/[slug]
  title        text not null,
  year         text,
  category     text,
  location     text,
  description  text,
  cover_drive_id text,                     -- Google Drive file ID for cover
  tags         text[],                     -- optional material/keyword tags
  sort_order   int default 0,              -- manual ordering
  published    boolean default true,
  created_at   timestamptz default now()
);

-- optional: extra gallery images per project (v2)
create table if not exists project_images (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid references projects(id) on delete cascade,
  drive_id    text not null,
  sort_order  int default 0,
  type
);

-- PRODUCTS (current line / volume)
create table if not exists products (
  id           uuid primary key default gen_random_uuid(),
  volume       text,                       -- e.g. "Vol. 01"
  line_name    text,                       -- e.g. "Objects in Steel"
  name         text not null,
  description  text,
  materials    text,
  dimensions   text,
  sort_order   int default 0,
  published    boolean default true,
  created_at   timestamptz default now()
);

-- product variations (one row per variant)
create table if not exists product_variants (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid references products(id) on delete cascade,
  label       text,                        -- e.g. "Black", "Red", "Raw"
  drive_id    text not null,               -- Google Drive file ID for this variant image
  sort_order  int default 0
);

-- TEAM (About view)
create table if not exists team_members (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  role         text,
  note         text,                       -- personal fragment / phrase
  name_drive_id text,                      -- handwritten name asset (Drive file ID)
  sort_order   int default 0,
  published    boolean default true,
  created_at   timestamptz default now()
);

-- rotation frames per member (sprite-sheet sequence)
create table if not exists team_rotation_frames (
  id          uuid primary key default gen_random_uuid(),
  member_id   uuid references team_members(id) on delete cascade,
  drive_id    text not null,
  frame_index int not null                 -- 0..N order of rotation
);

-- scattered sketch assets per member
create table if not exists team_assets (
  id          uuid primary key default gen_random_uuid(),
  member_id   uuid references team_members(id) on delete cascade,
  type        text,                        -- 'sketch' | 'tag' | 'swatch' etc.
  drive_id    text not null,
  pos_x       text,                        -- e.g. "12%"
  pos_y       text,                        -- e.g. "20%"
  depth       text default 'back'          -- 'front' | 'back' for parallax
);

-- SITE CONTENT (single-row-ish editable copy: manifesto, contact, home poem)
create table if not exists site_content (
  key          text primary key,           -- e.g. 'home_poem', 'about_manifesto', 'contact'
  value        jsonb                        -- flexible blob per section
);
```

> The `site_content` table holds editable copy that isn't list-structured: the Home poem text, the About manifesto, the Contact details/inquiry blocks. Stored as `jsonb` so the shape can flex without schema changes.

---

## Email — Resend

### Setup

- Contact form submissions and product inquiries send email via **Resend**
- Implemented as a Next.js **Route Handler**: `app/api/contact/route.ts`
- Requires a **verified sending domain** in Resend (e.g. `studio@bamn.com`) — flag to studio early
- Environment variable: `RESEND_API_KEY`

### Two entry points (per PRODUCT.md and CONTACT.md)

1. **Product CTA** (PRODUCT.md, Option A — inline form): posts to `/api/contact` with the product name pre-filled in the message
2. **Contact view** (CONTACT.md): primarily `mailto:` links (no form), but if a form is ever added it hits the same route

> Note: CONTACT.md is intentionally static (mailto only). The only true form is the Product inquiry. Both share the `/api/contact` handler if/when needed.

---

## Global State — Zustand

### Stores

A single lightweight store (or a couple of slices):

```ts
interface AppState {
  // navigation / transitions
  navigationState: "idle" | "exiting" | "entering";
  hasNavigatedInApp: boolean; // false on first load → deep-link plays enter only
  setNavigationState: (s: AppState["navigationState"]) => void;

  // home view
  homeAssignments: string[]; // shuffled view→position mapping per load

  // product inquiry handoff (if Product → Contact routing is ever used)
  pendingProductInquiry?: string; // product name carried to contact
}
```

Keep it minimal. Most view-internal state (which project is open, current rotation frame, etc.) lives in local component state, **not** global. Global is only for cross-view concerns: transition state and the deep-link flag.

---

## Smooth Scroll — Lenis

- Lenis wraps the app for smooth scrolling on views that scroll (Projects sidebar, About sections)
- Integrate Lenis with **GSAP ScrollTrigger** (sync Lenis's scroll to ScrollTrigger's update) so scroll-triggered animations in About stay in sync
- Disable/bypass Lenis on the Home view if it interferes with Matter.js drag (Home has no scroll anyway)
- Respect `prefers-reduced-motion`: reduce Lenis smoothing and GSAP durations when set

---

## Animation — GSAP

- **GSAP core** for all timelines (enter/exit per view, internal transitions)
- **Flip plugin** for the PRODUCT.md expand-from-card modal (the FLIP technique) — now free
- **ScrollTrigger** for About's scroll-triggered manifesto/team reveals
- Each view exports its `enter()` (returns a timeline) and `exit()` (returns a Promise) per the View Contract
- Matter.js handles Home's _physics_; GSAP handles Home's _choreographed_ moments (the settle tween, the abyss gravity ramp can be GSAP-driven or Matter-driven — coordinate so they don't fight)

---

## Styling — Tailwind + CSS Brand Tokens

### Tailwind

- Tailwind for layout, spacing, responsive utilities
- Extend the Tailwind theme with BAMN brand tokens (colors, fonts) so they're usable as utilities

### Fonts (placeholder for now)

- Two CSS classes as placeholders: **`font-primary`** (display) and **`font-secondary`** (body/mono)
- Actual typefaces specified later — swap the `@font-face` / `next/font` definitions behind these classes
- Wire them into Tailwind config so `font-primary` / `font-secondary` work as utilities

### Brand color tokens (define in Tailwind config + CSS vars)

```
--bamn-cream:  #F5F2EC   (background / paper)   — confirm exact value
--bamn-black:  #0A0A0A   (text, logo)
--bamn-red:    #E63419   (the signature accent — confirm exact value)
--bamn-muted:  #A8A4A0   (low-contrast text)
```

> Red is used **rarely and deliberately** — only as accents and the full-scale Contact header. Don't scatter it.

---

## Project Structure

```
/app
  layout.tsx                 ← root layout, Lenis provider, GSAP registration, Zustand provider
  page.tsx                   ← Home (server) → <HomeView /> (client)
  projects/page.tsx          ← server fetch → <ProjectsView />
  product/page.tsx           ← server fetch → <ProductView />
  about/page.tsx             ← server fetch → <AboutView />
  contact/page.tsx           ← server fetch → <ContactView />
  api/contact/route.ts       ← Resend email handler

/components
  views/
    HomeView.tsx             ← Matter.js physics, DOM sync, abyss exit
    ProjectsView.tsx
    ProductView.tsx
    AboutView.tsx
    ContactView.tsx
  HomeIcon.tsx               ← persistent back-to-home mark (sub-views)
  TransitionLayer.tsx        ← blank cream gap / transition overlay if needed

/hooks
  useTransitionRouter.ts     ← the controlled navigation hook

/lib
  supabase.ts                ← Supabase client
  drive.ts                   ← Drive file ID → URL helper (swappable)
  queries.ts                 ← typed data fetch functions per view

/store
  useAppStore.ts             ← Zustand store

/supabase
  schema.sql                 ← starter schema (pre-state, edit freely)

/styles
  globals.css                ← brand tokens, font classes, Tailwind directives

/types
  index.ts                   ← Project, Product, TeamMember, etc. TS types
```

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # server-only, for privileged reads if needed
RESEND_API_KEY=
RESEND_FROM_EMAIL=studio@bamn...  # verified domain
```

---

## Build Order Recommendation

1. **Scaffold** — Next.js + TS + Tailwind + folder structure
2. **Foundation** — Supabase client, Drive helper, schema, types, Zustand store
3. **Navigation core** — `useTransitionRouter` + the View Contract + blank transition layer (test with placeholder views)
4. **Home** — Matter.js physics + abyss exit (the riskiest piece — build early)
5. **Projects** → **Product** → **About** → **Contact** (in spec order)
6. **Resend** contact handler
7. **Lenis + ScrollTrigger** polish
8. **Responsive + reduced-motion + deep-link testing**
9. **Fonts** swap-in when finalized

---

## Open Items to Confirm with Studio (not blocking dev)

- Exact brand hex values (cream, red)
- Final typefaces (licensed)
- Resend sending domain verification
- Google Drive folder setup + "anyone with link" sharing on media
- Whether `/projects/[slug]` deep-linkable projects are wanted (affects v2, structure now)

---

## Key Architectural Principles

1. **Views own their animations; the hook owns the sequence.** The View Contract (`enter`/`exit`) is the connective tissue between all five view specs.
2. **Animate before navigate.** Exit runs while the page is still mounted; the route swap happens in the blank gap. No fighting App Router's lifecycle.
3. **Deep links play enter only.** No forced Home boot-through. Client-shareable URLs go straight to their view.
4. **Drive is isolated.** All Drive logic lives in one swappable helper; the rest of the app only knows file IDs.
5. **Schema is mutable.** The starter SQL is a pre-state, expected to change. Content is managed in the Supabase dashboard.
6. **Red is rare.** The brand restraint is enforced in the design tokens and intent, not just per-view.
