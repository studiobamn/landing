"use client";

// =========================================================
// Controlled navigation — Option B (real routes + choreographed transitions).
//
// Contract (per STACK.md):
//   1. navigationState → 'exiting'
//   2. await currentView.exit()   (runs while page is still mounted)
//   3. router.push(to)            (route swaps under the blank cream gap)
//   4. next view mounts in pre-state
//   5. navigationState → 'entering'
//   6. currentView.enter()        (plays on mount)
//   7. navigationState → 'idle'
//
// "Animate before navigate": exit resolves BEFORE router.push, so we never
// fight App Router's unmount lifecycle. The cream body background covers the
// route swap; no template.tsx freeze-frame tricks needed.
// =========================================================

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import type gsap from "gsap";
import { useAppStore } from "@/store/useAppStore";

export interface TransitionView {
  enter: () => gsap.core.Timeline; // plays on mount from blank pre-state
  exit: () => Promise<void>; // plays before navigation, resolves when done
}

// Module-level handle to the currently mounted view's controller.
let activeView: TransitionView | null = null;

/** Used by navigation triggers (HomeIcon, menus) to choreograph route changes. */
export function useTransitionRouter() {
  const router = useRouter();
  const setNavigationState = useAppStore((s) => s.setNavigationState);
  const setHasNavigatedInApp = useAppStore((s) => s.setHasNavigatedInApp);

  async function navigate(to: string) {
    setHasNavigatedInApp(true);
    setNavigationState("exiting");

    if (activeView) {
      await activeView.exit(); // animate before navigate
    }

    router.push(to);
    setNavigationState("entering"); // the next view plays enter() on mount
  }

  return { navigate };
}

/**
 * Each view calls this once to register its enter/exit and play `enter()` on
 * mount. Deep links (no in-app navigation yet) still play enter only — there
 * is no forced Home boot-through.
 */
export function useViewTransition(controller: TransitionView) {
  const setNavigationState = useAppStore((s) => s.setNavigationState);
  const ref = useRef(controller);

  // Keep the controller ref current after each render (latest enter/exit).
  useEffect(() => {
    ref.current = controller;
  });

  useEffect(() => {
    activeView = {
      enter: () => ref.current.enter(),
      exit: () => ref.current.exit(),
    };

    const tl = ref.current.enter();
    tl.eventCallback("onComplete", () => setNavigationState("idle"));

    return () => {
      activeView = null;
    };
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
