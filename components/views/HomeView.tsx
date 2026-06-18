"use client";

// Home — physics-driven entry view (instructions/HOME.md).
// Three stacked layers: poem (z0) · canvas (z10) · nav components (z20).
// The bodies ARE the navigation. Clicking one runs the choreographed exit
// (the "abyss") via useTransitionRouter, which calls this view's exit().
//
// Responsibilities here are kept thin: shuffle the assignment, own the gsap
// enter/exit timelines, and delegate all Matter.js work to useHomePhysics.

import { useRef, useState } from "react";
import gsap from "gsap";
import {
  useTransitionRouter,
  useViewTransition,
} from "@/hooks/useTransitionRouter";
import { useHomePhysics } from "@/hooks/useHomePhysics";
import { PoemLayer } from "@/components/home/PoemLayer";
import { ComponentLayer } from "@/components/home/ComponentLayer";
import {
  ABYSS,
  VIEW_KEYS,
  shuffle,
  type ViewKey,
} from "@/components/home/constants";
import type { HomeCovers, HomePoem } from "@/types";
import { LanguageSwitcher } from "../LanguageSwitcher";

interface HomeViewProps {
  poem: HomePoem | null;
  covers: HomeCovers | null;
}

export default function HomeView({ poem, covers }: HomeViewProps) {
  const { navigate } = useTransitionRouter();

  // Fresh shuffle per mount (= per page load and per return from a sub-view).
  const [assignments] = useState<ViewKey[]>(() => shuffle(VIEW_KEYS));
  const [reduceMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  const surfaceRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poemRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  const { spawn, startAbyss } = useHomePhysics({
    surfaceRef,
    canvasRef,
    itemRefs: itemsRef,
    assignments,
    onItemClick: (view) => navigate(`/${view}`),
    reduceMotion,
  });

  useViewTransition({
    enter: () => {
      gsap.set(surfaceRef.current, { autoAlpha: 1 });
      spawn();
      const tl = gsap.timeline();
      tl.fromTo(
        poemRef.current,
        { y: 0, autoAlpha: 0 },
        {
          autoAlpha: 1,
          duration: reduceMotion ? 0.01 : 0.4,
          delay: reduceMotion ? 0 : 0.2,
          ease: "power1.out",
        },
      );
      return tl;
    },
    exit: () => {
      startAbyss();
      const tl = gsap.timeline();
      tl.to(
        poemRef.current,
        { y: 80, autoAlpha: 0, duration: ABYSS.poemFall, ease: "power2.in" },
        0,
      );
      tl.to(
        surfaceRef.current,
        { autoAlpha: 0, duration: ABYSS.layerFade, ease: "power1.out" },
        ABYSS.layerFadeDelay,
      );
      return new Promise<void>((resolve) => {
        tl.eventCallback("onComplete", resolve);
      });
    },
  });

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <PoemLayer ref={poemRef} poem={poem} />
      <div
        ref={surfaceRef}
        className="absolute inset-0 z-10"
        style={{ touchAction: "none" }}
      >
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0"
        />
        <ComponentLayer
          assignments={assignments}
          covers={covers}
          itemsRef={itemsRef}
        />
      </div>
      <div className="fixed top-1 left-2 z-50">
        <LanguageSwitcher />
      </div>
    </div>
  );
}
