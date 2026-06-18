"use client";

// Element 1 — vertical guide lines. The structural skeleton (bottom layer).
// The container is animated (scaleY) by AboutView via the forwarded ref.

import { forwardRef } from "react";
import { GUIDE_LINES, GUIDE_COLOR } from "./constants";

export const GuideLines = forwardRef<HTMLDivElement>(function GuideLines(
  _props,
  ref,
) {
  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 z-0">
      {GUIDE_LINES.map((line) => (
        <span
          key={line.left}
          className="absolute top-0 bottom-0"
          style={{
            left: line.left,
            borderLeftWidth: 1,
            borderLeftStyle: line.dashed ? "dashed" : "solid",
            borderColor: GUIDE_COLOR,
          }}
        />
      ))}
    </div>
  );
});
