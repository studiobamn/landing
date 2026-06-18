"use client";

// The one full-scale use of red on the site — the massive CONTACT word.

import { forwardRef } from "react";

interface ContactHeaderProps {
  text: string;
}

export const ContactHeader = forwardRef<HTMLHeadingElement, ContactHeaderProps>(
  function ContactHeader({ text }, ref) {
    return (
      <h1
        ref={ref}
        className="font-primary text-[18vw] leading-[0.85] font-bold tracking-tight text-bamn-red text-end uppercase md:text-[12vw]"
      >
        {text}
      </h1>
    );
  },
);
