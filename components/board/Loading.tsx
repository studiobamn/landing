"use client";

// Loading view — shown while the board snapshot is being fetched from the
// database (and Excalidraw initializes). Three dots bounce in a GSAP wave.

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function Loading({ label }: { label?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(".loading-dot", {
        y: -12,
        duration: 0.45,
        ease: "power1.inOut",
        // each dot bounces up/down forever, offset to form a wave
        stagger: { each: 0.15, repeat: -1, yoyo: true },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={ref}
      className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-6"
    >
      <div className="flex items-end gap-2">
        <span className="loading-dot h-3 w-3 rounded-full bg-bamn-black" />
        <span className="loading-dot h-3 w-3 rounded-full bg-bamn-black" />
        <span className="loading-dot h-3 w-3 rounded-full bg-bamn-black" />
      </div>
      {label && (
        <p className="font-secondary text-xs tracking-widest text-bamn-muted uppercase">
          {label}
        </p>
      )}
    </div>
  );
}
