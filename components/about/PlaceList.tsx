"use client";

// Element 5 — left-column word list with alternating heavy/light rhythm.

import { forwardRef } from "react";
import type { AboutPlaceItem } from "@/types";
import { useI18nContext } from "../I18nProvider";

interface PlaceListProps {
  items: AboutPlaceItem[];
  isMobile?: boolean;
}

export const PlaceList = forwardRef<HTMLDivElement, PlaceListProps>(
  function PlaceList({ items, isMobile }, ref) {
    const { current } = useI18nContext();
    return (
      <div
        ref={ref}
        className=" absolute z-50 text-bamn-black"
        style={{
          ...(isMobile
            ? { top: "60%", left: "5%", width: "44%" }
            : { top: "52%", left: "3%", width: "28%" }),
          lineHeight: 1.2,
        }}
      >
        {items.map((item, i) => (
          <p
            key={`${item.text}-${i}`}
            className={`${item.weight === "bold" ? "font-bold font-title" : "font-normal font-title"} ${
              item.case === "upper" ? "uppercase" : ""
            }`}
            style={{ fontSize: isMobile ? "0.72rem" : "0.8rem" }}
          >
            {current === "es" ? item.textEs : item.text}
          </p>
        ))}
      </div>
    );
  },
);
