"use client";

// Product — the structured, grid-disciplined view (instructions/PRODUCT.md).
// Signature moment: the BAMNED header draws itself on load. Cards expand into a
// FLIP modal with an inline contact form. All motion is GSAP.

import { useLayoutEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { useViewTransition } from "@/hooks/useTransitionRouter";
import { useProductModal } from "@/hooks/useProductModal";
import { HomeIcon } from "@/components/HomeIcon";
import { BamnedHeader } from "@/components/products/BamnedHeader";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ProductModal } from "@/components/products/ProductModal";
import {
  buildBamnedTimeline,
  prepareBamned,
} from "@/components/products/bamnedDraw";
import { GRID_STAGGER } from "@/components/products/constants";
import type { ProductLine, ProductsByVolume } from "@/types";

interface ProductViewProps {
  products: ProductsByVolume[];
  line: ProductLine | null;
}

export default function ProductView({ products, line }: ProductViewProps) {
  const root = useRef<HTMLElement>(null);
  const headerRef = useRef<SVGSVGElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLButtonElement>(null);
  const homeIconRef = useRef<HTMLButtonElement | null>(null);

  const { t } = useTranslation();
  const { openProduct, open, close } = useProductModal({
    modalRef,
    backdropRef,
  });

  // Pre-state the header (+ subtitle) before paint so they don't flash.
  useLayoutEffect(() => {
    if (headerRef.current) prepareBamned(headerRef.current);
    if (subtitleRef.current) gsap.set(subtitleRef.current, { autoAlpha: 0 });
  }, []);

  useViewTransition({
    enter: () => {
      const tl = gsap.timeline();
      let headerEnd = 0;
      if (headerRef.current) {
        const headerTl = buildBamnedTimeline(headerRef.current);
        tl.add(headerTl, 0);
        headerEnd = headerTl.duration();
      }
      tl.fromTo(
        homeIconRef.current,
        { autoAlpha: 0, y: -30 },
        { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" },
        0,
      );
      // Subtitle fades in from the right, just after the header finishes.
      tl.fromTo(
        subtitleRef.current,
        { autoAlpha: 0, x: 30 },
        { autoAlpha: 1, x: 0, duration: 0.5, ease: "power2.out" },
        headerEnd,
      );
      tl.fromTo(
        "[data-vol-label]",
        { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out", stagger: 0.1 },
        0.8,
      );
      // Grid staggers in once the header draw is ~70% complete.
      tl.fromTo(
        "[data-grid-item]",
        { autoAlpha: 0, y: 20 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
          stagger: GRID_STAGGER,
        },
        1.0,
      );
      return tl;
    },
    exit: () =>
      new Promise<void>((resolve) => {
        const tl = gsap.timeline({ onComplete: resolve });
        tl.to(
          "[data-grid-item]",
          {
            autoAlpha: 0,
            y: 30,
            duration: 0.3,
            ease: "power2.in",
            stagger: 0.04,
          },
          0,
        );
        tl.to(
          homeIconRef.current,
          { autoAlpha: 0, y: -40, duration: 0.3, ease: "power2.in" },
          0,
        );
        tl.to(
          [headerRef.current, subtitleRef.current],
          { autoAlpha: 0, duration: 0.3, ease: "power2.in" },
          0,
        );
        tl.to(
          "[data-vol-label]",
          { autoAlpha: 0, duration: 0.3, ease: "power2.in" },
          0,
        );
      }),
  });

  return (
    <main
      ref={root}
      className="relative min-h-screen overflow-x-hidden px-[6vw] pt-24 pb-24"
    >
      <HomeIcon ref={homeIconRef} />

      {/* Header zone */}
      <div className="flex flex-col items-end justify-center gap-4 mb-24">
        <BamnedHeader ref={headerRef} />
        {line && (
          <p
            ref={subtitleRef}
            className="font-primary mt-2 hidden w-fit text-right text-xs tracking-widest text-bamn-black uppercase md:block"
          >
            {t("db.productLine.subtitle")}
          </p>
        )}
      </div>

      {/* Volumes — one section per grouped volume */}
      {products.length === 0 ? (
        <p className="font-secondary text-sm text-bamn-muted">
          {t("products.noProducts")}
        </p>
      ) : (
        products.map(({ vol, products: volProducts }) => {
          const [volNum, volName] = vol.split(" / ");
          return (
            <div key={vol} className="mb-32">
              <div data-vol-label className="mt-6 mb-15 flex justify-end">
                <p className="font-secondary text-2xl tracking-wide text-bamn-black text-center">
                  {volNum}{" "}
                  {volName && (
                    <span className="text-bamn-muted">/ {volName}</span>
                  )}
                </p>
              </div>
              <ProductGrid products={volProducts} onOpen={open} />
            </div>
          );
        })
      )}

      {/* Expand-from-card modal */}
      {openProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Full-screen dim + blur; fades in once the modal is fully open. */}
          <button
            ref={backdropRef}
            type="button"
            aria-label={t("common.close")}
            onClick={close}
            className="absolute inset-0 cursor-default bg-bamn-muted/50 backdrop-blur-xl"
          />
          <ProductModal
            product={openProduct}
            onClose={close}
            modalRef={modalRef}
          />
        </div>
      )}
    </main>
  );
}
