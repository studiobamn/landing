"use client";

// Element 6 — faint manifesto paragraph (fine-print, rewards reading).

import { forwardRef } from "react";
import { useTranslation } from "react-i18next";

interface ManifestoProps {
  isMobile?: boolean;
}

export const Manifesto = forwardRef<HTMLParagraphElement, ManifestoProps>(
  function Manifesto({ isMobile }, ref) {
    const { t } = useTranslation();
    return (
      <p
        ref={ref}
        className="font-secondary absolute z-50 text-bamn-red"
        style={{
          ...(isMobile
            ? { top: "62%", right: "5%", width: "44%", fontSize: "0.62rem" }
            : { top: "64%", left: "3%", width: "26%", fontSize: "0.80rem" }),
          lineHeight: 1.5,
        }}
      >
        {t("db.siteContent.aboutManifesto")}
      </p>
    );
  },
);
