import type { Config } from "tailwindcss";

// BAMN brand colors exposed as Tailwind utilities (bg-bamn-cream, text-bamn-red,
// border-bamn-muted, …). Values reference the CSS variables defined in
// styles/globals.css (:root), which stay the single source of truth.
//
// Tailwind v4 note: this file is NOT auto-loaded — it's pulled in via the
// `@config` directive at the top of styles/globals.css.
const config: Config = {
  theme: {
    extend: {
      colors: {
        bamn: {
          cream: "var(--bamn-cream)",
          black: "var(--bamn-black)",
          red: "var(--bamn-red)",
          muted: "var(--bamn-muted)",
        },
      },
    },
  },
};

export default config;
