"use client";

// A single product card: variant image + name + variation dots. Hovering/tapping
// a dot crossfades the image to that variant (GSAP). Clicking the image opens
// the expand-from-card modal (the clicked <img> is the FLIP origin).

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { resolveMediaUrl } from "@/lib/drive";
import { CROSSFADE_S } from "./constants";
import type { ProductWithVariants } from "@/types";

const pSlug = (name: string) => name.toLowerCase().replace(/\s+/g, "-");

interface ProductCardProps {
  product: ProductWithVariants;
  onOpen: (product: ProductWithVariants, originEl: HTMLElement | null) => void;
}

export function ProductCard({ product, onOpen }: ProductCardProps) {
  const { t } = useTranslation();
  const slug = pSlug(product.name);
  const displayName = t(`db.products.${slug}.name`, {
    defaultValue: product.name,
  });
  const imgRef = useRef<HTMLImageElement>(null);
  const [variant, setVariant] = useState(0);
  const variants = product.variants;
  const src = resolveMediaUrl(variants[variant]?.drive_id);

  // Image proportions follow the current variant's extras {width, height}.
  const extras = variants[variant]?.extras;
  const aspectRatio =
    extras?.width && extras?.height
      ? `${extras.width} / ${extras.height}`
      : "4 / 5";

  // Fade the new variant image in whenever it changes.
  useEffect(() => {
    if (imgRef.current) {
      gsap.fromTo(
        imgRef.current,
        { opacity: 0 },
        { opacity: 1, duration: CROSSFADE_S / 2, ease: "power1.out" },
      );
    }
  }, [variant]);

  const showVariant = (i: number) => {
    if (i === variant || !imgRef.current) return;
    gsap.to(imgRef.current, {
      opacity: 0,
      duration: CROSSFADE_S / 2,
      ease: "power1.in",
      onComplete: () => setVariant(i),
    });
  };
  return (
    <div
      data-grid-item
      className="flex flex-col"
      style={{
        width: `${extras?.width}px` || "auto",
        height: `${extras?.height}px` || "auto",
      }}
    >
      <button
        type="button"
        onClick={() => onOpen(product, imgRef.current)}
        className="block w-full cursor-pointer overflow-hidden"
        style={{
          aspectRatio,
        }}
        // style={{ aspectRatio }}
        aria-label={displayName}
      >
        {src ? (
          // Drive/external media → raw <img> (STACK.md).
          // eslint-disable-next-line @next/next/no-img-element
          <img
            ref={imgRef}
            src={src}
            alt={displayName}
            draggable={false}
            className={`h-full w-full object-cover${!product.available ? " grayscale" : ""}`}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-bamn-muted/20 text-xs text-bamn-muted">
            {displayName}
          </span>
        )}
      </button>

      <span className="font-primary mt-2 text-md md:text-lg tracking-wide text-bamn-black">
        {displayName}
      </span>

      {!product.available && (
        <span className="font-secondary mt-1 text-[10px] tracking-widest uppercase text-bamn-red">
          {"Sold Out"}
        </span>
      )}

      {variants.length > 1 && (
        <div className="mt-2 flex gap-2">
          {variants.map((v, i) => (
            <button
              key={v.id}
              type="button"
              aria-label={v.label ?? `Variant ${i + 1}`}
              onMouseEnter={() => showVariant(i)}
              onClick={() => showVariant(i)}
              className={`h-2 w-2 rounded-full border border-bamn-black transition-colors ${
                i === variant ? "bg-bamn-black" : "bg-transparent"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
