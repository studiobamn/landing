"use client";

// Quiet centered row of external social links (dark, not red).

import { forwardRef } from "react";
import type { ContactSocial } from "@/types";

interface SocialRowProps {
  socials: ContactSocial[];
}

export const SocialRow = forwardRef<HTMLDivElement, SocialRowProps>(
  function SocialRow({ socials }, ref) {
    return (
      <div
        ref={ref}
        className="flex flex-wrap justify-center gap-8 font-secondary text-xs tracking-widest text-bamn-black uppercase"
      >
        {socials.map((s) => (
          <a
            key={s.label}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-opacity hover:opacity-60"
          >
            {s.label}
          </a>
        ))}
      </div>
    );
  },
);
