"use client";

// Projects — two-column editorial view with a Resting ⇄ Inspect state machine
// (see instructions/PROJECTS.md). Left: quote (resting) / expanded image + info
// (inspect, in an overlay). Right: vertical filmstrip that compresses to a
// sliver sidebar on inspect. Image travel between columns is GSAP Flip.

import { useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { useViewTransition } from "@/hooks/useTransitionRouter";
import { useProjectsInspect } from "@/hooks/useProjectsInspect";
import { HomeIcon } from "@/components/HomeIcon";
import { QuoteBlock } from "@/components/projects/QuoteBlock";
import { Filmstrip } from "@/components/projects/Filmstrip";
import { InspectStage } from "@/components/projects/InspectStage";
import {
  FILMSTRIP_WIDTH,
  FILMSTRIP_WIDTH_MOBILE,
} from "@/components/projects/constants";
import type { ProjectWithImages } from "@/types";
import useMobile from "@/hooks/useMobile";

interface ProjectsViewProps {
  projects: ProjectWithImages[];
}

export default function ProjectsView({ projects }: ProjectsViewProps) {
  const { t } = useTranslation();
  const root = useRef<HTMLElement>(null);
  const filmstripColRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const homeIconRef = useRef<HTMLButtonElement | null>(null);
  const isMobile = useMobile();

  const { selectedId, select, close, scrollPaused, imageOut } =
    useProjectsInspect({
      filmstripColRef,
      quoteRef,
      infoRef,
      imageRef,
    });
  const selectedProject = projects.find((p) => p.id === selectedId) ?? null;

  useViewTransition({
    enter: () => {
      const tl = gsap.timeline();
      tl.fromTo(
        quoteRef.current,
        { autoAlpha: 0, y: -30 },
        { autoAlpha: 1, y: 0, duration: 1, ease: "power2.out", delay: 0.5 },
        0,
      );
      tl.fromTo(
        homeIconRef.current,
        { autoAlpha: 0, y: -30 },
        { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" },
        0,
      );
      // Filmstrip entries rise in from the bottom, matching the upward scroll.
      tl.fromTo(
        "[data-entry]",
        { autoAlpha: 0, y: 80 },
        {
          autoAlpha: 1,
          y: 0,
          justifyContent: "flex-end",
          duration: 0.45,
          ease: "power2.out",
          stagger: 0.08,
        },
        0.4,
      );
      return tl;
    },
    exit: () =>
      new Promise<void>((resolve) => {
        imageOut();
        const tl = gsap.timeline({ onComplete: resolve });
        tl.to(
          "[data-entry]",
          {
            autoAlpha: 0,
            xPercent: 120,
            duration: 0.3,
            ease: "power2.in",
            stagger: 0.06,
          },
          0,
        );
        tl.to(
          homeIconRef.current,
          { autoAlpha: 0, y: -40, duration: 0.3, ease: "power2.in" },
          0,
        );
        tl.to(
          [quoteRef.current, infoRef.current],
          { autoAlpha: 0, y: 40, duration: 0.3, ease: "power2.in" },
          0,
        );
      }),
  });

  const filmWidth = useMemo(
    () =>
      `${isMobile ? FILMSTRIP_WIDTH_MOBILE.resting : FILMSTRIP_WIDTH.resting}vw`,
    [isMobile],
  );

  return (
    <main ref={root} className="relative h-screen w-full overflow-hidden">
      <HomeIcon ref={homeIconRef} />

      {/* Expanded image + info overlay (decoupled from column widths). */}
      <div className="pointer-events-none absolute inset-0 z-20">
        {selectedProject && (
          <InspectStage
            project={selectedProject}
            onClose={close}
            imageRef={imageRef}
            infoRef={infoRef}
          />
        )}
      </div>

      <div className="flex h-full w-full justify-end">
        {/* Left column auto-fills as the filmstrip compresses. */}
        <div className="relative h-full flex-1 hidden md:block">
          <QuoteBlock ref={quoteRef} quote={t("projects.defaultQuote")} />
        </div>

        {/* Right column — infinite auto-scrolling filmstrip; clips its content
            and compresses to slivers in Inspect. */}
        <div
          ref={filmstripColRef}
          className="h-full shrink-0 overflow-hidden"
          style={{
            width: filmWidth,
          }}
        >
          <Filmstrip
            projects={projects}
            onSelect={select}
            paused={scrollPaused}
          />
        </div>
      </div>
    </main>
  );
}
