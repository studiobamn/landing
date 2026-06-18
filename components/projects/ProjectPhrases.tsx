"use client";

// Phrases as a ruled list — same divider rows as MainInfo, one phrase per row.

import { useTranslation } from "react-i18next";

interface ProjectPhrasesProps {
  phrases: string[];
  slug: string;
}

export function ProjectPhrases({ phrases, slug }: ProjectPhrasesProps) {
  const { t } = useTranslation();
  if (phrases.length === 0) return null;

  return (
    <div className="w-full md:w-fit ">
      {phrases.map((phrase, i) => (
        <div key={`${i}-${phrase}`} className="w-full">
          <div className="h-px w-full bg-bamn-muted" />
          <p className="font-secondary py-1 text-left text-xs text-bamn-black md:pr-15">
            {t(`db.projects.${slug}.phrases_${i}`, { defaultValue: phrase })}
          </p>
        </div>
      ))}
    </div>
  );
}
