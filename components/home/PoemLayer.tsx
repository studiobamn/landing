"use client";

// Layer 1 — the background poem, with the BAMN acronym reveal.
//
// On load the paragraph opens with "By Any Means Necessary" in huge Bank
// Gothic — each word's INITIAL letter much larger than the rest, and the whole
// phrase much larger than the poem body. It occupies the first lines of the
// poem. After a beat the non-initial letters + the spaces shrink/fade away,
// leaving just "BAMN"; because the phrase shares the poem's text flow, the
// poem reflows up into the freed space (like a window-resize rewrap).
//
// The wrapper opacity (fade in / exit fall) is still owned by HomeView via the
// forwarded ref; this component owns only the internal collapse.

import { forwardRef, Fragment, useEffect, useRef } from "react";
import gsap from "gsap";
import type { HomePoem } from "@/types";
import useMobile from "@/hooks/useMobile";

interface PoemLayerProps {
  poem: HomePoem | null;
}

// BAMN = By Any Means Necessary. `initial` stays; `rest` collapses away.
const BAMN_WORDS = [
  { initial: "B", rest: "y" },
  { initial: "A", rest: "ny" },
  { initial: "M", rest: "eans" },
  { initial: "N", rest: "ecessary" },
] as const;

const INITIAL_SIZE = "clamp(3rem, 8vw, 8rem)";
const REST_SIZE = "clamp(1.6rem, 4.2vw, 4.4rem)";
const COLLAPSE_DELAY = 3; // seconds the full phrase holds before collapsing

export const PoemLayer = forwardRef<HTMLDivElement, PoemLayerProps>(
  function PoemLayer({ poem }, ref) {
    const bamnRef = useRef<HTMLSpanElement>(null);
    const isMobile = useMobile();

    useEffect(() => {
      const el = bamnRef.current;
      if (!el) return;
      const collapsibles = el.querySelectorAll<HTMLElement>("[data-collapse]");
      if (!collapsibles.length) return;

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduce) {
        gsap.set(collapsibles, { fontSize: 0, opacity: 0 });
        return;
      }

      const ctx = gsap.context(() => {
        gsap.to(collapsibles, {
          opacity: 0,
          x: -40, // drift left while fading
          width: 0, // collapse layout → initials merge to BAMN, poem reflows
          duration: 1.5,
          letterSpacing: "1px",
          ease: "power3.inOut",
          // Sweep right→left, letter by letter: last letter of "Necessary" → "By".
          delay: COLLAPSE_DELAY,
        });
      }, el);
      return () => ctx.revert();
    }, [poem?.data]);

    if (!poem?.data) return <div ref={ref} className="absolute inset-0 z-0" />;

    return (
      <div
        ref={ref}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 flex items-start justify-start p-5"
        style={{ opacity: 0 }}
      >
        <p
          className="font-primary w-full text-justify text-sm font-bold text-bamn-red/60"
          style={{ letterSpacing: "0.2em" }}
        >
          <span
            ref={bamnRef}
            className="font-primary align-baseline font-bold text-bamn-red"
            style={{
              lineHeight: 0.85,
              float: "left",
              marginRight: "20px",
              letterSpacing: isMobile ? "-2px" : "-6px",
            }}
          >
            {BAMN_WORDS.map((w, i) => (
              <Fragment key={w.initial}>
                <span className="whitespace-nowrap">
                  <span style={{ fontSize: INITIAL_SIZE }}>{w.initial}</span>
                  {[...w.rest].map((ch, j) => (
                    <span
                      key={`${w.initial}-${j}`}
                      data-collapse
                      style={{ fontSize: REST_SIZE, display: "inline-block" }}
                    >
                      {ch}
                    </span>
                  ))}
                </span>
                {i < BAMN_WORDS.length - 1 && (
                  <span
                    data-collapse
                    style={{ fontSize: REST_SIZE, display: "inline-block" }}
                  >
                    &nbsp;
                  </span>
                )}
              </Fragment>
            ))}
          </span>{" "}
          {poem.data}
        </p>
      </div>
    );
  },
);
