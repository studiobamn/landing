"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n";

interface LangMeta {
  label: string;
  language: string;
}

interface I18nContextValue {
  langs: LangMeta[];
  current: string;
  change: (label: string) => void;
}

const I18nContext = createContext<I18nContextValue>({
  langs: [],
  current: "en",
  change: () => {},
});

export function useI18nContext() {
  return useContext(I18nContext);
}

const CACHE_KEY = "bamn_i18n_cache";
const CACHE_TTL = 60 * 60 * 1000; // 1 hour
const LANG_KEY = "bamn_lang";

type LangRow = { label: string; language: string; content: Record<string, unknown> };

async function fetchFromSupabase(): Promise<LangRow[] | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    const res = await fetch(
      `${url}/rest/v1/languages?select=label,language,content`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } },
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function loadInto(rows: LangRow[]) {
  for (const row of rows) {
    i18n.addResourceBundle(row.label, "translation", row.content, true, true);
  }
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [langs, setLangs] = useState<LangMeta[]>([]);
  const [current, setCurrent] = useState("en");

  useEffect(() => {
    const savedLang = localStorage.getItem(LANG_KEY) ?? "en";

    async function bootstrap() {
      // --- Try localStorage cache first ---
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) {
          const { rows, ts } = JSON.parse(raw) as {
            rows: LangRow[];
            ts: number;
          };
          if (Date.now() - ts < CACHE_TTL && rows.length > 0) {
            loadInto(rows);
            setLangs(rows.map(({ label, language }) => ({ label, language })));
            const lang = rows.find((r) => r.label === savedLang)
              ? savedLang
              : rows[0].label;
            await i18n.changeLanguage(lang);
            setCurrent(lang);
            setReady(true);
            // Refresh in background — don't await
            fetchFromSupabase().then((fresh) => {
              if (fresh && fresh.length > 0) {
                loadInto(fresh);
                localStorage.setItem(
                  CACHE_KEY,
                  JSON.stringify({ rows: fresh, ts: Date.now() }),
                );
              }
            });
            return;
          }
        }
      } catch {
        // Corrupted cache — fall through to network fetch
      }

      // --- Fetch from Supabase ---
      const rows = await fetchFromSupabase();
      if (rows && rows.length > 0) {
        loadInto(rows);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ rows, ts: Date.now() }));
        setLangs(rows.map(({ label, language }) => ({ label, language })));
        const lang = rows.find((r) => r.label === savedLang)
          ? savedLang
          : rows[0].label;
        await i18n.changeLanguage(lang);
        setCurrent(lang);
      }
      setReady(true);
    }

    bootstrap();
  }, []);

  function change(label: string) {
    i18n.changeLanguage(label);
    localStorage.setItem(LANG_KEY, label);
    setCurrent(label);
  }

  if (!ready) return null;

  return (
    <I18nContext.Provider value={{ langs, current, change }}>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </I18nContext.Provider>
  );
}
