// =========================================================
// Product view — shared constants (see instructions/PRODUCT.md).
// The one rigidly-gridded view; the only expressive moment is the BAMNED
// header drawing itself on load.
// =========================================================

/** BAMNED draw timing (seconds).
 *  Order: "BAMN" writes on → the strike cuts across → "ED" writes on.
 *  Each letter's fill is wiped in left→right (a written look). */
export const DRAW = {
  duration: 0.5, // ← per-letter write speed (tune the velocity here)
  letterStagger: 0.4, // delay B→A→M→N, then E→D
  lineStart: 2.5, // strikethrough begins after BAMN
  line: 0.5, // strikethrough sweep (left→right)
  edStart: 3.5, // "ED" begins after the strike
} as const;

/** Grid item stagger-in (seconds). */
export const GRID_STAGGER = 0.06;

/** Expand-from-card modal (seconds). */
export const MODAL_S = 0.45;
export const CROSSFADE_S = 0.8; // variation image crossfade
