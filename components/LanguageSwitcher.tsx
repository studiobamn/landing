"use client";

import { useI18nContext } from "./I18nProvider";

export function LanguageSwitcher() {
  const { langs, current, change } = useI18nContext();

  if (langs.length <= 1) return null;

  return (
    <div className="font-secondary font-bold flex items-center gap-2 text-xs tracking-widest uppercase">
      {langs.map((lang, i) => (
        <span key={lang.label} className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => change(lang.label)}
            className={`cursor-pointer transition-opacity ${
              current === lang.label
                ? "text-bamn-red"
                : "text-bamn-muted hover:text-bamn-muted hover:opacity-80"
            }`}
          >
            {lang.label.toUpperCase()}
          </button>
          {i < langs.length - 1 && <span className="text-bamn-red/50">/</span>}
        </span>
      ))}
    </div>
  );
}
