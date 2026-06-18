"use client";

// Element 9 — loose ink scrawl PNGs that bleed off the bottom edges (top layer).
// Refs passed in so AboutView can fade them in last.

import { resolveMediaUrl } from "@/lib/drive";

interface ScrawlsProps {
  left?: string;
  right?: string;
  leftRef: React.RefObject<HTMLImageElement | null>;
  rightRef: React.RefObject<HTMLImageElement | null>;
  isMobile?: boolean;
}

export function Scrawls({
  left,
  right,
  leftRef,
  rightRef,
  isMobile,
}: ScrawlsProps) {
  const l = resolveMediaUrl(left);
  const r = resolveMediaUrl(right);

  return (
    <>
      {l && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={leftRef}
          src={l}
          alt=""
          draggable={false}
          className="pointer-events-none absolute z-40 select-none"
          style={{
            ...(isMobile
              ? { bottom: "-6%", left: "-12%", width: "55%" }
              : { bottom: "-20%", left: "-10%", width: "30%" }),
            opacity: 0.85,
            rotate: "-5deg",
          }}
        />
      )}
      {r && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={rightRef}
          src={r}
          alt=""
          draggable={false}
          className="pointer-events-none absolute z-40 select-none"
          style={{
            ...(isMobile
              ? { bottom: "10%", right: "-20%", width: "50%" }
              : { bottom: "-10%", right: "-2%", width: "25%" }),
            opacity: 0.85,
            rotate: "3deg",
          }}
        />
      )}
    </>
  );
}
