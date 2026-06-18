"use client";

// Projects state machine: Resting ⇄ Inspecting (+ switching), fully sequenced
// and GSAP-driven.
//
// Motion model (slide cross at the screen edges):
//   • Opening  : the filmstrip thumbnail slides OUT to the right, while the
//                inspect image slides IN from the left into its place.
//   • Closing  : the inspect image slides OUT to the left, while the thumbnail
//                slides back IN from the right into its slot.
//   • Switching: A leaves (image→left, A-thumb→in from right) fully, THEN B
//                enters (B-thumb→out right, image→in from left).
//
// The clicked thumbnail element is passed in (the filmstrip is duplicated for
// the infinite scroll, so two nodes share a data-thumb id — we animate the one
// that was actually clicked). scrollPaused freezes the auto-scroll for inspect.

import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import gsap from "gsap";
import {
  FILMSTRIP_WIDTH,
  FILMSTRIP_WIDTH_MOBILE,
  TRAVEL_S,
  WIDTH_S,
} from "@/components/projects/constants";
import useMobile from "./useMobile";

interface InspectRefs {
  filmstripColRef: React.RefObject<HTMLDivElement | null>;
  quoteRef: React.RefObject<HTMLDivElement | null>;
  infoRef: React.RefObject<HTMLDivElement | null>;
  imageRef: React.RefObject<HTMLDivElement | null>;
}

const EASE = "power3.inOut";

export function useProjectsInspect({
  filmstripColRef,
  quoteRef,
  infoRef,
  imageRef,
}: InspectRefs) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scrollPaused, setScrollPaused] = useState(false);
  const selectedRef = useRef<string | null>(null);
  const activeThumbRef = useRef<HTMLElement | null>(null);
  const animating = useRef(false);
  const isMobile = useMobile();
  // open/close/switchTo are memoized once (useCallback []), so reading isMobile
  // directly would capture its first-render value (false). Mirror it into a ref
  // that stays current so setFilmstrip always picks the right width set.
  const isMobileRef = useRef(isMobile);
  useEffect(() => {
    isMobileRef.current = isMobile;
  }, [isMobile]);

  const commit = (next: string | null) => {
    selectedRef.current = next;
    flushSync(() => setSelectedId(next));
  };

  // Inspect image enters from off the left edge to its natural spot.
  const imageIn = async (duration?: number) => {
    const el = imageRef.current;
    if (!el) return;
    gsap.set(el, { clearProps: "transform", autoAlpha: 0 });
    const rect = el.getBoundingClientRect();
    gsap.set(el, { x: -rect.right - 100, autoAlpha: 1 });
    await gsap.to(el, {
      x: 0,
      duration: duration || TRAVEL_S,
      ease: EASE,
      delay: 1,
    });
    gsap.set(el, { clearProps: "transform" });
  };

  // Inspect image exits off the left edge.
  const imageOut = async (duration?: number) => {
    const el = imageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    await gsap.to(el, {
      x: -rect.right - 40,
      duration: duration || TRAVEL_S,
      ease: EASE,
    });
  };

  // Filmstrip thumbnail exits off the right edge.
  const thumbOut = async (el: HTMLElement | null) => {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    await gsap.to(el, {
      x: window.innerWidth - rect.left + 40,
      duration: TRAVEL_S,
      ease: EASE,
    });
  };

  // Filmstrip thumbnail slides back in from the right to its slot.
  const thumbIn = async (el: HTMLElement | null) => {
    if (!el) return;
    await gsap.to(el, { x: 0, duration: TRAVEL_S, ease: EASE });
    gsap.set(el, { clearProps: "transform" });
  };

  const fadeInfoIn = () =>
    infoRef.current
      ? gsap.fromTo(
          infoRef.current,
          { autoAlpha: 0, y: 30 },
          { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" },
        )
      : Promise.resolve();
  const fadeInfoOut = () =>
    infoRef.current
      ? gsap.to(infoRef.current, {
          autoAlpha: 0,
          y: 30,
          duration: 0.3,
          ease: "power2.in",
        })
      : Promise.resolve();

  const setFilmstrip = (state: "resting" | "inspect") => {
    if (!filmstripColRef.current) return Promise.resolve();
    const widths = isMobileRef.current
      ? FILMSTRIP_WIDTH_MOBILE
      : FILMSTRIP_WIDTH;
    return gsap.to(filmstripColRef.current, {
      width: `${widths[state]}vw`,
      duration: WIDTH_S,
      ease: "power2.inOut",
    });
  };

  const quoteOut = () =>
    quoteRef.current
      ? gsap.to(quoteRef.current, {
          autoAlpha: 0,
          y: -40,
          duration: 0.35,
          ease: "power2.in",
        })
      : Promise.resolve();
  const quoteIn = () =>
    quoteRef.current
      ? gsap.fromTo(
          quoteRef.current,
          { autoAlpha: 0, y: -20 },
          { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" },
        )
      : Promise.resolve();

  const open = useCallback(async (id: string, el: HTMLElement | null) => {
    activeThumbRef.current = el;
    await quoteOut();
    commit(id);
    setFilmstrip("inspect");
    await Promise.all([thumbOut(el), imageIn()]);
    await fadeInfoIn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = useCallback(async () => {
    if (!selectedRef.current) return;
    const el = activeThumbRef.current;
    await Promise.all([
      imageOut(0.3),
      thumbIn(el),
      fadeInfoOut(),
      setFilmstrip("resting"),
    ]);
    activeThumbRef.current = null;
    commit(null);
    await quoteIn();
    setScrollPaused(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchTo = useCallback(async (id: string, el: HTMLElement | null) => {
    if (!selectedRef.current) return;
    const prevEl = activeThumbRef.current;
    await Promise.all([imageOut(), thumbIn(prevEl), fadeInfoOut()]);
    activeThumbRef.current = el;
    commit(id);
    await Promise.all([thumbOut(el), imageIn()]);
    await fadeInfoIn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const select = useCallback(
    (id: string, el: HTMLElement | null) => {
      if (animating.current) return;
      const cur = selectedRef.current;
      if (cur === id) return;
      animating.current = true;
      setScrollPaused(true); // freeze auto-scroll immediately
      (cur === null ? open(id, el) : switchTo(id, el)).finally(() => {
        animating.current = false;
        setScrollPaused(false);
      });
    },
    [open, switchTo],
  );

  const requestClose = useCallback(() => {
    if (animating.current) return;
    animating.current = true;
    close().finally(() => {
      animating.current = false;
    });
  }, [close]);

  return { selectedId, select, close: requestClose, scrollPaused, imageOut };
}
