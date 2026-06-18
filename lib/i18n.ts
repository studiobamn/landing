import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Initialised with no resources — I18nProvider loads them from Supabase at
// runtime and calls i18n.addResourceBundle() before marking ready.
i18n.use(initReactI18next).init({
  lng: "en",
  fallbackLng: "en",
  ns: ["translation"],
  defaultNS: "translation",
  resources: {},
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export default i18n;
