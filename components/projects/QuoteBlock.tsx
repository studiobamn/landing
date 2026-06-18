"use client";

// Left column — Resting state atmospheric quote. Center-left, sparse, low
// contrast. Slides/fades via the forwarded ref (driven by ProjectsView /
// useProjectsInspect).

import { forwardRef } from "react";

interface QuoteBlockProps {
  quote: string;
}

export const QuoteBlock = forwardRef<HTMLDivElement, QuoteBlockProps>(
  function QuoteBlock({ quote }, ref) {
    return (
      <div
        ref={ref}
        className="pointer-events-none absolute inset-0 flex justify-start items-center pt-[150px] px-[8%] flex-col"
      >
        <p className="font-title font-semibold uppercase max-w-sm text-2xl whitespace-pre-line text-bamn-black">
          {quote}
        </p>
        <p
          className="font-written max-w-sm text-3xl text-left whitespace-pre-line text-bamn-red w-full"
          style={{ letterSpacing: "normal", lineHeight: 1.4 }}
        >
          {"- by bamn "}
        </p>
      </div>
    );
  },
);
