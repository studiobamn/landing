"use client";

// Right-aligned (50% width) ruled list of project meta — location / year /
// category, each on its own line with a horizontal divider — and the short
// description below it, left-aligned. Lives under the title in InspectStage.

import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";
import type { Project } from "@/types";

interface MainInfoProps {
  project: Project;
}

const ATTR_KEYS = ["location", "year", "category"] as const;

export function MainInfo({ project }: MainInfoProps) {
  const { t } = useTranslation();

  const attrs = [
    { label: t("projects.attrLocation"), key: "location" },
    { label: t("projects.attrYear"), key: "year" },
    { label: t("projects.attrCategory"), key: "category" },
  ] satisfies { label: string; key: (typeof ATTR_KEYS)[number] }[];

  return (
    <div className="ml-auto flex w-[90%] md:w-1/2 flex-col items-end my-5 md:my-10">
      {attrs.map(({ label, key }) => {
        const raw = project[key];
        if (!raw) return null;
        const value =
          key === "category"
            ? t(`db.projectCategories.${raw}`, { defaultValue: raw })
            : raw;
        return (
          <div key={key} className="w-full">
            <div className="h-px w-full bg-bamn-muted" />
            <p className="font-secondary py-1 text-left text-[10px] md:text-xs text-bamn-black flex justify-between">
              <span className="text-bamn-muted">{label}: </span>
              {value}
            </p>
          </div>
        );
      })}

      {i18n.exists(`db.projects.${project.slug}.descriptionShort`) && (
        <p className="font-secondary mt-4 w-full md:w-1/2 self-start text-right md:text-left text-sm leading-relaxed text-bamn-black/80">
          {t(`db.projects.${project.slug}.descriptionShort`)}
        </p>
      )}
    </div>
  );
}
