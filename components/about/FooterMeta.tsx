"use client";

// Element 8 — colophon / date-meta block in the lower-center whitespace.

import { forwardRef } from "react";
import { useTranslation } from "react-i18next";

interface FooterMetaProps {
  isMobile?: boolean;
}

export const FooterMeta = forwardRef<HTMLDivElement, FooterMetaProps>(
  function FooterMeta({ isMobile }, ref) {
    const { t } = useTranslation();
    return (
      <div
        ref={ref}
        className="font-secondary absolute z-50 text-bamn-black"
        style={{
          ...(isMobile
            ? { top: "95%", left: "52%", fontSize: "0.6rem" }
            : { top: "80%", left: "40%", fontSize: "0.65rem" }),
          lineHeight: 1.4,
        }}
      >
        <p className="font-bold">{t("db.siteContent.aboutFooterMeta1")}</p>
        <p className="text-bamn-red">{t("db.siteContent.aboutFooterMeta2")}</p>
      </div>
    );
  },
);
