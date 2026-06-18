"use client";

// Persistent back-to-home mark, shown in sub-views (top-left).
// Calls the choreographed navigate('/') — never a hard link.

import { useTranslation } from "react-i18next";
import { useTransitionRouter } from "@/hooks/useTransitionRouter";

export function HomeIcon({
  ref,
  top = 15,
}: {
  ref?: React.RefObject<HTMLButtonElement | null>;
  top?: number;
}) {
  const { t } = useTranslation();
  const { navigate } = useTransitionRouter();

  return (
    <button
      type="button"
      ref={ref}
      onClick={() => navigate("/")}
      aria-label={t("common.backToHome")}
      style={{ top: `${top}px` }}
      className="font-primary fixed left-6 z-50 text-xl tracking-wide text-bamn-red cursor-pointer font-bold"
    >
      {"BAMN"}
    </button>
  );
}
