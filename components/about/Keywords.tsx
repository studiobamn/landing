"use client";

// Element 7 — keyword stack (design values), mixed weight, ALL CAPS.

import { forwardRef } from "react";
import type { AboutKeyword } from "@/types";
import { useI18nContext } from "../I18nProvider";

interface KeywordsProps {
  items: AboutKeyword[];
  isMobile?: boolean;
}

export const Keywords = forwardRef<HTMLDivElement, KeywordsProps>(
  function Keywords({ items, isMobile }, ref) {
    const { current } = useI18nContext();
    return (
      <div
        ref={ref}
        className="font-primary absolute z-10 text-bamn-black lowercase"
        style={{
          ...(isMobile
            ? { top: "75%", left: "5%", width: "60%" }
            : { top: "73%", left: "3%", width: "30%" }),
          lineHeight: 1.25,
        }}
      >
        {items.map((kw, i) => (
          <p
            key={`${kw.text}-${i}`}
            className={kw.weight === "bold" ? "font-bold" : "font-normal"}
            style={{ fontSize: isMobile ? "1.3rem" : "1.7rem", lineHeight: 1 }}
          >
            {current === "es" ? kw.textEs : kw.text}
          </p>
        ))}
      </div>
    );
  },
);
