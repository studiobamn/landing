"use client";

// Expand-from-card modal (PRODUCT.md). The modal element is rendered at its
// natural centered size, then GSAP Flip.fit snaps it onto the clicked card and
// animates back to identity — so it appears to grow out of the card, fading its
// opacity in so it never pops at full size. Once fully open, a full-screen
// backdrop (dim + blur) fades in behind it. Closing reverses both.

import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { MODAL_S } from "@/components/products/constants";
import type { ProductWithVariants } from "@/types";

interface ModalRefs {
  modalRef: React.RefObject<HTMLDivElement | null>;
  backdropRef: React.RefObject<HTMLButtonElement | null>;
}

export function useProductModal({ modalRef, backdropRef }: ModalRefs) {
  const [openProduct, setOpenProduct] = useState<ProductWithVariants | null>(
    null,
  );
  const originRef = useRef<HTMLElement | null>(null);
  const animating = useRef(false);

  const fadeBackdrop = (on: boolean) =>
    backdropRef.current
      ? gsap.to(backdropRef.current, {
          autoAlpha: on ? 1 : 0,
          duration: 0.3,
          ease: "power1.inOut",
        })
      : Promise.resolve();

  const open = useCallback(
    (product: ProductWithVariants, originEl: HTMLElement | null) => {
      if (animating.current || openProduct) return;
      animating.current = true;
      originRef.current = originEl;

      flushSync(() => setOpenProduct(product));
      const modal = modalRef.current;
      if (!modal || !originEl) {
        animating.current = false;
        return;
      }
      // Pre-state before paint: dim hidden, modal invisible.
      gsap.set(backdropRef.current, { autoAlpha: 0 });
      gsap.set(modal, { clearProps: "transform", autoAlpha: 0 });
      Flip.fit(modal, originEl, { scale: true }); // snap onto the card
      gsap
        .to(modal, {
          x: 0,
          y: 0,
          scaleX: 1,
          scaleY: 1,
          autoAlpha: 1, // fade in while growing → no pop
          duration: MODAL_S,
          ease: "power2.inOut",
        })
        .then(() => {
          gsap.set(modal, { clearProps: "transform" });
          fadeBackdrop(true); // dim + blur in, just after fully open
          animating.current = false;
        });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [openProduct],
  );

  const close = useCallback(() => {
    const modal = modalRef.current;
    const origin = originRef.current;
    if (animating.current || !openProduct) return;
    animating.current = true;

    const finish = () => {
      flushSync(() => setOpenProduct(null));
      originRef.current = null;
      animating.current = false;
    };

    fadeBackdrop(false);
    if (!modal || !origin) {
      finish();
      return;
    }
    // Contract back into the (re-measured) card, fading out.
    Flip.fit(modal, origin, {
      scale: true,
      duration: MODAL_S,
      ease: "power2.inOut",
      opacity: 0,
      onComplete: finish,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openProduct]);

  // Close on Escape.
  useEffect(() => {
    if (!openProduct) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openProduct, close]);

  return { openProduct, open, close };
}
