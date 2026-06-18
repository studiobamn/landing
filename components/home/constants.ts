// =========================================================
// Home view — shared constants (see instructions/HOME.md).
// Positions are authored for a 1440×900 design viewport and scaled to the
// real viewport at runtime (see useHomePhysics).
//
// Motion model (revised): components fly in from above straight into their
// target ("sleep") position, THEN physics activates as a slow zero-gravity
// drift — not a gravity drop + settle.
// =========================================================

// Board is the 5th Home component (BOARD.md): 5 views, 5 bodies, 5 positions.
export const VIEW_KEYS = [
  "projects",
  "product",
  "about",
  "contact",
  "board",
] as const;
export type ViewKey = (typeof VIEW_KEYS)[number];

export const VIEW_LABEL: Record<ViewKey, string> = {
  projects: "Projects",
  product: "Products",
  about: "About",
  contact: "Contact",
  board: "Board",
};

/** Per-view cover footprint — deliberately mixed formats, smallish. */
export const VIEW_SIZE: Record<ViewKey, { width: number; height: number }> = {
  projects: { width: 150, height: 230 }, // vertical
  product: { width: 250, height: 160 }, // horizontal
  about: { width: 180, height: 180 }, // square
  contact: { width: 140, height: 210 }, // vertical
  board: { width: 220, height: 150 }, // horizontal
};

/** Design-space viewport the positions below were authored against. */
export const BASE_VIEWPORT = { width: 1440, height: 900 };

/** 5 fixed, slightly asymmetric target slots — Position A..E. */
export const TARGET_POSITIONS = [
  { x: 400, y: 380 }, // A
  { x: 950, y: 360 }, // B
  { x: 1120, y: 600 }, // C
  { x: 500, y: 680 }, // D
  { x: 760, y: 560 }, // E (Board)
] as const;

/** Extra shrink applied to bodies + DOM on small screens. */
export const MOBILE_BODY_SCALE = 0.62;
export const MOBILE_BREAKPOINT = 768;

/** Zero-gravity float. Bodies drift very slowly and bounce inside the box. */
export const FLOAT_GRAVITY_Y = 0;
export const FLOAT_BODY = {
  restitution: 0.4, // soft bounce — collisions absorb energy
  friction: 0,
  frictionAir: 0.04, // heavy drag → a throw bleeds off quickly, feels weighty
  density: 0.006, // more mass → harder to fling from a tap
  inertia: Infinity, // never rotate — images stay upright at all times
} as const;
export const FLOAT_SPEED = 0.3; // initial drift speed (px/step) — very slow

/** MouseConstraint stiffness — low = heavy, laggy drag (less fling on release). */
export const DRAG_STIFFNESS = 0.06;

/** Abyss exit: floor drops, gravity ramps, everything falls away. */
export const ABYSS_GRAVITY_Y = 4;

/** Entry: animate from above into the target slot, then release to float. */
export const ENTRY_DURATION = 0.9; // seconds
export const ENTRY_STAGGER = 0.15; // seconds between components
export const ENTRY_EASE = "power2.out";

/** Click-vs-drag discrimination. */
export const CLICK_THRESHOLD_MS = 200;
export const CLICK_THRESHOLD_PX = 5;

/** Abyss timing (seconds). */
export const ABYSS = {
  poemFall: 0.6,
  layerFadeDelay: 0.8,
  layerFade: 0.2,
} as const;

/** Fisher–Yates shuffle (returns a new array). */
export function shuffle<T>(input: readonly T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
