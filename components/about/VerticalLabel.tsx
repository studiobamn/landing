"use client";

// Element 3 — small label in the top-right corner. Vertical (writing-mode) on
// desktop; a small horizontal line on mobile.

import { forwardRef } from "react";
import { useTranslation } from "react-i18next";

interface VerticalLabelProps {
  line1: string;
  isMobile?: boolean;
}

export const VerticalLabel = forwardRef<HTMLDivElement, VerticalLabelProps>(
  function VerticalLabel({ line1, isMobile }, ref) {
    const { t } = useTranslation();
    return (
      <div
        ref={ref}
        className={`font-primary absolute z-30 flex gap-2 tracking-[0.15em] text-bamn-black uppercase ${
          isMobile ? "text-lg" : "text-3xl"
        }`}
        style={
          isMobile
            ? { top: "1.5%", right: "3%", writingMode: "vertical-rl" }
            : { top: "3%", right: "1.5%", writingMode: "vertical-rl" }
        }
      >
        <span>{line1}</span>
        <span className="text-bamn-muted">{t("db.siteContent.aboutVerticalLabelLine2")}</span>
      </div>
    );
  },
);
