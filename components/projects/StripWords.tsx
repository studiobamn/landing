"use client";

// Infinite horizontal marquee of a project's strip_words. The set is rendered
// twice (justify-around across the width) and the track is translated left
// continuously (right→left), looping seamlessly. GSAP-driven.

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface StripWordsProps {
  words: string[];
  /** Marquee speed in px per second. */
  speed?: number;
}

export function StripWords({ words, speed = 20 }: StripWordsProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = trackRef.current;
    if (!el || words.length === 0) return;

    let tween: gsap.core.Tween | undefined;
    const build = () => {
      tween?.kill();
      gsap.set(el, { xPercent: 0 });
      const setWidth = el.offsetWidth / 2; // one of the two identical copies
      if (setWidth <= 0) return;
      tween = gsap.to(el, {
        xPercent: -50, // shift left by exactly one copy → seamless loop
        duration: setWidth / speed,
        ease: "none",
        repeat: -1,
      });
    };

    build();
    const ro = new ResizeObserver(build);
    ro.observe(el);
    return () => {
      ro.disconnect();
      tween?.kill();
    };
  }, [words, speed]);

  if (words.length === 0) return null;

  return (
    <div className="w-full overflow-hidden">
      <div ref={trackRef} className="flex w-[200%]">
        {[0, 1].map((copy) => (
          <div
            key={copy}
            aria-hidden={copy === 1}
            className="font-secondary flex w-1/2 shrink-0 justify-around text-[8px] md:text-xs tracking-widest text-bamn-black/50 md:uppercase"
          >
            {words.map((word, i) => (
              <span
                key={`${copy}-${i}`}
                className="px-2 whitespace-nowrap font-title"
              >
                {`0${i} `}
                {word}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
