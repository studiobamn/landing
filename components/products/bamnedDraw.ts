// GSAP draw-on for the BAMNED header — a "written" reveal.
// Each letter's FILL (with its stroke) is wiped in left→right via clip-path —
// no outline tracing, no fade-from-bottom. Tune the speed with DRAW.duration.
//
// Order: "BAMN" writes on → the centre strike sweeps across (cutting the word)
// → "ED" writes on, completing "BAMNED".

import gsap from "gsap";
import { DRAW } from "./constants";

const BAMN = ["B", "A", "M", "N"] as const;
const ED = ["E", "D"] as const;

const HIDDEN = "inset(0% 100% 0% 0%)"; // clipped from the right → invisible
const SHOWN = "inset(0% 0% 0% 0%)"; // fully revealed

const letterEl = (svg: SVGSVGElement, id: string) =>
  svg.querySelector<SVGGraphicsElement>(`#${id}`);

const els = (svg: SVGSVGElement, ids: readonly string[]) =>
  ids.map((id) => letterEl(svg, id)).filter((e): e is SVGGraphicsElement => !!e);

/** Pre-state: letters wiped out (clipped), fills solid; strike collapsed left.
 *  Safe to call repeatedly. */
export function prepareBamned(svg: SVGSVGElement) {
  svg.querySelectorAll<SVGPathElement>("path").forEach((p) => {
    gsap.set(p, { fillOpacity: 1 }); // the fill is what reveals
  });
  gsap.set(els(svg, [...BAMN, ...ED]), { autoAlpha: 1, clipPath: HIDDEN });

  const line = svg.querySelector<SVGPathElement>("#line");
  if (line) {
    gsap.set(line, { autoAlpha: 1, transformOrigin: "left center", scaleX: 0 });
  }
}

/** Build the draw-on timeline (does not autoplay — caller controls it). */
export function buildBamnedTimeline(svg: SVGSVGElement): gsap.core.Timeline {
  prepareBamned(svg);
  const tl = gsap.timeline();

  // 1. "BAMN" writes on, left→right, staggered.
  tl.to(
    els(svg, BAMN),
    {
      clipPath: SHOWN,
      duration: DRAW.duration,
      ease: "power1.inOut",
      stagger: DRAW.letterStagger,
    },
    0,
  );

  // 2. The strike sweeps left→right across BAMN.
  const line = svg.querySelector<SVGPathElement>("#line");
  if (line) {
    tl.to(
      line,
      { scaleX: 1, duration: DRAW.line, ease: "power2.inOut" },
      DRAW.lineStart,
    );
  }

  // 3. "ED" writes on.
  tl.to(
    els(svg, ED),
    {
      clipPath: SHOWN,
      duration: DRAW.duration,
      ease: "power1.inOut",
      stagger: DRAW.letterStagger,
    },
    DRAW.edStart,
  );

  return tl;
}
