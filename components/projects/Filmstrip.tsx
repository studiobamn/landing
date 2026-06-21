"use client";

// Right column — vertical filmstrip with an infinite slow auto-scroll. The
// project list is rendered twice and the wrapper is translated upward by one
// set height on a seamless loop (GSAP). Speed is FILMSTRIP_SCROLL_SPEED (px/s).
// The loop pauses while a project is being inspected.
//
// Manual scroll: wheel events pause the animation and adjust the y transform
// directly. After RESUME_DELAY ms of no scrolling the loop restarts from the
// current position by seeking a fresh fromTo tween to the matching time.

import { useCallback, useEffect, useRef } from "react";
import gsap from "gsap";
import { ProjectEntry } from "./ProjectEntry";
import { ENTRY_GAP, FILMSTRIP_SCROLL_SPEED } from "./constants";
import type { Project } from "@/types";

interface FilmstripProps {
  projects: Project[];
  onSelect: (id: string, el: HTMLElement | null) => void;
  paused: boolean;
}

const RESUME_DELAY = 2000;

export function Filmstrip({ projects, onSelect, paused }: FilmstripProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const setHeightRef = useRef(0);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pausedRef = useRef(paused);
  const userScrollingRef = useRef(false);

  // Keep pausedRef in sync so wheel-handler timeouts read the latest value.
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  // Start (or restart) the infinite loop from the element's current y position.
  // Uses fromTo so the repeat always goes 0 → -setHeight regardless of where
  // we seek to, giving a clean seamless wrap.
  const startLoop = useCallback(() => {
    const wrap = wrapRef.current;
    const setHeight = setHeightRef.current;
    if (!wrap || setHeight <= 0) return;

    tweenRef.current?.kill();

    const currentY = gsap.getProperty(wrap, "y") as number;
    const clampedY = Math.max(-setHeight, Math.min(0, currentY));

    const tween = gsap.fromTo(
      wrap,
      { y: 0 },
      {
        y: -setHeight,
        duration: setHeight / FILMSTRIP_SCROLL_SPEED,
        ease: "none",
        repeat: -1,
      },
    );

    // Seek the tween to the position matching clampedY so the animation
    // continues seamlessly from wherever the user left off.
    tween.time(-clampedY / FILMSTRIP_SCROLL_SPEED);
    tweenRef.current = tween;

    if (pausedRef.current) tween.pause();
  }, []);

  // Build the seamless loop once the (duplicated) entries are laid out.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || projects.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const kids = wrap.children;
    if (kids.length <= projects.length) return;

    const setHeight =
      (kids[projects.length] as HTMLElement).offsetTop -
      (kids[0] as HTMLElement).offsetTop;
    if (setHeight <= 0) return;

    setHeightRef.current = setHeight;
    gsap.set(wrap, { y: 0 });
    startLoop();

    return () => {
      tweenRef.current?.kill();
      tweenRef.current = null;
    };
  }, [projects, startLoop]);

  // Pause/resume with inspect state. Don't play() while user is scrolling.
  useEffect(() => {
    const t = tweenRef.current;
    if (!t) return;
    if (paused) t.pause();
    else if (!userScrollingRef.current) t.play();
  }, [paused]);

  // Wheel handler: intercept scroll, move the y transform manually, then
  // restart the auto-loop RESUME_DELAY ms after the last wheel event.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();

      const wrap = wrapRef.current;
      const setHeight = setHeightRef.current;
      if (!wrap || setHeight <= 0) return;

      userScrollingRef.current = true;
      tweenRef.current?.pause();

      let y = gsap.getProperty(wrap, "y") as number;
      y -= e.deltaY;
      // Wrap y into the seamless range so the loop stays coherent.
      while (y > 0) y -= setHeight;
      while (y < -setHeight) y += setHeight;

      gsap.set(wrap, { y });

      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = setTimeout(() => {
        userScrollingRef.current = false;
        if (!pausedRef.current) startLoop();
      }, RESUME_DELAY);
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", onWheel);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, [startLoop]);

  return (
    <div ref={containerRef} className="scrollbar-hide h-full overflow-hidden">
      <div
        ref={wrapRef}
        className="flex flex-col items-end"
        style={{ gap: ENTRY_GAP }}
      >
        {projects.map((p) => (
          <ProjectEntry key={`${p.id}-a`} project={p} onSelect={onSelect} />
        ))}
        {projects.map((p) => (
          <ProjectEntry key={`${p.id}-b`} project={p} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}
