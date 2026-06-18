"use client";

// Element 2 — the dominant handwritten headline PNG (top, bleeds left).

import { forwardRef } from "react";

interface HeadlineProps {
  src: string;
  isMobile?: boolean;
}

export const Headline = forwardRef<HTMLImageElement, HeadlineProps>(
  function Headline({ src, isMobile }, ref) {
    return (
      <div
        style={{
          // object-fit needs a definite height on the box too, not just width.
          ...(isMobile
            ? { top: "4%", right: "8%", width: "54%" }
            : { top: "10%", left: "5%", width: "30%" }),
        }}
        className="pointer-events-none absolute z-10 select-none"
      >
        {/* Drive/external/local media → raw <img> (STACK.md). */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={ref}
          src={src}
          alt="BAMN"
          draggable={false}
          style={{
            width: "100%",
            height: "100%",
            // cover fills the box & crops the PNG's empty margins (the words
            // sit top-left), so the lettering reads large instead of tiny.
            objectFit: "cover",
            objectPosition: "top left",
          }}
        />
      </div>
    );
  },
);
