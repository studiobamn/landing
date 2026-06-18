// =========================================================
// Projects view — shared constants (see instructions/PROJECTS.md).
// Two states: Resting (filmstrip wide) and Inspect (image expanded left,
// filmstrip clipped to a sliver sidebar).
// =========================================================

/** Right (filmstrip) column width per state, in vw. Left column is flex-1. */
export const FILMSTRIP_WIDTH = {
  resting: 30,
  inspect: 20,
} as const;
export const FILMSTRIP_WIDTH_MOBILE = {
  resting: 101,
  inspect: 0,
} as const;

/** Expanded image / info live in an overlay covering the left region (vw). */
export const STAGE_WIDTH = 82;

export const THUMB_HEIGHT = 180; // px — filmstrip thumbnail height
export const NUMBER_WIDTH = 56; // px — number-label column
export const ENTRY_GAP = 16; // px — vertical gap between entries

/** Thumbnail image width (vw) — bleeds toward the right edge; clipped to a
 *  sliver by the column in Inspect. */
export const FILMSTRIP_IMG_VW = 48;

/** Durations (seconds). */
export const TRAVEL_S = 1; // image travel between columns
export const WIDTH_S = 0.5; // filmstrip compress / expand
export const ENTRY_STAGGER = 1; // entry slide-in stagger

/** Infinite filmstrip auto-scroll speed, in px per second (higher = faster). */
export const FILMSTRIP_SCROLL_SPEED = 60;

/** Fallback resting quote if site_content has none. */
export const DEFAULT_QUOTE =
  "We do not decorate the world.\nWe take a position in it.";

export const PROJECTS_FILM_IMG_SIZE: Record<
  string,
  { width: number; height: number }
> = {
  "01": {
    width: 200,
    height: 230,
  },
  "02": {
    width: 250,
    height: 160,
  },
  "03": {
    width: 210,
    height: 180,
  },
  "04": {
    width: 240,
    height: 210,
  },
  "05": {
    width: 250,
    height: 180,
  },
  "06": {
    width: 250,
    height: 160,
  },
  "07": {
    width: 300,
    height: 180,
  },
  "08": {
    width: 250,
    height: 210,
  },
  "09": {
    width: 200,
    height: 180,
  },
  "10": {
    width: 250,
    height: 160,
  },
  "11": {
    width: 250,
    height: 250,
  },
};
