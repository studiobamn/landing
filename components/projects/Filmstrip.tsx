"use client";

// Right column — vertical filmstrip with an infinite slow auto-scroll. The
// project list is rendered twice and the wrapper is translated upward by one
// set height on a seamless loop (GSAP). Speed is FILMSTRIP_SCROLL_SPEED (px/s).
// The loop pauses while a project is being inspected.

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ProjectEntry } from "./ProjectEntry";
import { ENTRY_GAP, FILMSTRIP_SCROLL_SPEED } from "./constants";
import type { Project } from "@/types";

interface FilmstripProps {
  projects: Project[];
  onSelect: (id: string, el: HTMLElement | null) => void;
  paused: boolean;
}

export function Filmstrip({ projects, onSelect, paused }: FilmstripProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  // Build the seamless loop once the (duplicated) entries are laid out.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || projects.length === 0) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) return;

    const kids = wrap.children;
    if (kids.length <= projects.length) return;
    // Distance after which the second copy aligns with the first (layout-based,
    // so unaffected by any transforms in flight).
    const setHeight =
      (kids[projects.length] as HTMLElement).offsetTop -
      (kids[0] as HTMLElement).offsetTop;
    if (setHeight <= 0) return;

    gsap.set(wrap, { y: 0 });
    const tween = gsap.to(wrap, {
      y: -setHeight,
      duration: setHeight / FILMSTRIP_SCROLL_SPEED,
      ease: "none",
      repeat: -1,
    });
    tweenRef.current = tween;
    return () => {
      tween.kill();
      tweenRef.current = null;
    };
  }, [projects]);

  // Pause/resume with inspect state.
  useEffect(() => {
    const t = tweenRef.current;
    if (!t) return;
    if (paused) t.pause();
    else t.play();
  }, [paused]);

  return (
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
  );
}
