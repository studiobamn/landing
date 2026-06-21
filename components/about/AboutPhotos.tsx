"use client";

// Element 4 — two overlapping black-and-white photographs (A behind, B front).
// Refs are passed in so AboutView can animate them separately.

import { resolveMediaUrl } from "@/lib/drive";

interface AboutPhotosProps {
  imageA: string;
  imageB: string;
  imageARef: React.RefObject<HTMLImageElement | null>;
  imageBRef: React.RefObject<HTMLImageElement | null>;
  isMobile?: boolean;
}

export function AboutPhotos({
  imageA,
  imageB,
  imageARef,
  imageBRef,
  isMobile,
}: AboutPhotosProps) {
  const a = resolveMediaUrl(imageA);
  const b = resolveMediaUrl(imageB);

  return (
    <>
      {/* Image A (back) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imageARef}
        src={a ?? ""}
        alt=""
        draggable={false}
        className="absolute z-20 grayscale contrast-[1.1]"
        style={{
          ...(isMobile
            ? { top: "24%", left: "6%", width: "48%" }
            : { top: "10%", right: "10%", width: "28%" }),
          aspectRatio: "3 / 4",
          objectFit: "cover",
        }}
      />
      {/* Image B (front) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imageBRef}
        src={b ?? ""}
        alt=""
        draggable={false}
        className="absolute z-[21] grayscale contrast-[1.1]"
        style={{
          ...(isMobile
            ? { top: "33%", left: "44%", width: "44%" }
            : { top: "40%", left: "50%", width: "18%" }),
          aspectRatio: "3 / 4",
          objectFit: "cover",
        }}
      />
    </>
  );
}
