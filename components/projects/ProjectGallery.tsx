"use client";

// Project gallery (used inside InspectStage). Big active image on top — its
// wrapper carries imageRef so useProjectsInspect can slide it in/out. Below: a
// horizontal thumbnail strip (5px gap) with arrow buttons that scroll it. The
// cover is the first thumbnail; selecting a thumb crossfades it into the big
// image (GSAP). Thumb proportions come from each image's width/height.

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { resolveMediaUrl } from "@/lib/drive";
import type { ProjectImage } from "@/types";
import useMobile from "@/hooks/useMobile";
import { StripWords } from "./StripWords";

interface GalleryItem {
  src: string;
  ratio: string;
}

interface ProjectGalleryProps {
  cover: string | null;
  images: ProjectImage[];
  stripWords: string[];
  imageRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
}

export function ProjectGallery({
  cover,
  images,
  stripWords,
  imageRef,
  onClose,
}: ProjectGalleryProps) {
  const items: GalleryItem[] = [
    ...(cover ? [{ src: resolveMediaUrl(cover) ?? "", ratio: "3 / 2" }] : []),
    ...images.map((img) => ({
      src: resolveMediaUrl(img.drive_id) ?? "",
      ratio: img.width && img.height ? `${img.width} / ${img.height}` : "3 / 2",
    })),
  ];
  const isMobile = useMobile();

  const [active, setActive] = useState(0);
  const [overflowing, setOverflowing] = useState(false);
  const bigImgRef = useRef<HTMLImageElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Crossfade the big image whenever the active item changes.
  useEffect(() => {
    if (bigImgRef.current) {
      gsap.fromTo(
        bigImgRef.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.3, ease: "power1.out" },
      );
    }
  }, [active]);

  // Show the arrows only when the thumbnail strip overflows horizontally.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const measure = () => setOverflowing(el.scrollWidth - el.clientWidth > 1);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [items.length]);

  const select = (idx: number) => {
    if (idx === active || !bigImgRef.current) return;
    gsap.to(bigImgRef.current, {
      autoAlpha: 0,
      duration: 0.2,
      ease: "power1.in",
      onComplete: () => setActive(idx),
    });
  };

  const scrollStrip = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    gsap.to(el, {
      scrollLeft: el.scrollLeft + dir * el.clientWidth * 0.8,
      duration: 1,
      ease: "power2.out",
    });
  };

  const activeSrc = items[active]?.src ?? "";

  return (
    <div>
      {/* Big image — slid in/out by useProjectsInspect via imageRef. */}
      <div ref={imageRef} className="relative w-full">
        {activeSrc ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={bigImgRef}
              src={activeSrc}
              alt=""
              draggable={false}
              style={{ height: isMobile ? 400 : 600 }}
              className="block w-full select-none object-cover"
            />
            {items.length > 1 && (
              <>
                <div
                  className="absolute inset-y-0 left-0 w-1/2 cursor-pointer"
                  onClick={() =>
                    select((active - 1 + items.length) % items.length)
                  }
                />
                <div
                  className="absolute inset-y-0 right-0 w-1/2 cursor-pointer"
                  onClick={() => select((active + 1) % items.length)}
                />
              </>
            )}
          </>
        ) : (
          <div className="flex h-[40vh] w-full items-center justify-center bg-bamn-muted/20 text-sm text-bamn-muted">
            No image
          </div>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            top: isMobile ? "-25px" : "-6px",
            right: isMobile ? "0px" : "-25px",
          }}
          className="font-secondary absolute cursor-pointer text-2xl leading-none text-bamn-red transition-opacity hover:opacity-60"
        >
          ×
        </button>
        <StripWords words={stripWords} />
        <div id="divider-top" className="h-[1px] bg-bamn-muted w-full" />
        {/* Horizontal thumbnail strip with arrow controls. */}
        {items.length > 1 && (
          <div className="mt-1 flex items-center gap-2">
            {overflowing && (
              <button
                type="button"
                onClick={() => scrollStrip(-1)}
                aria-label="Scroll left"
                className="font-secondary shrink-0 cursor-pointer px-1 text-xl leading-none text-bamn-black/50 transition-colors hover:text-bamn-black"
              >
                ‹
              </button>
            )}
            <div ref={trackRef} className="flex gap-[5px] overflow-x-hidden">
              {items.map((it, idx) => (
                <button
                  key={`${idx}-${it.src}`}
                  type="button"
                  onClick={() => select(idx)}
                  aria-label={`Image ${idx + 1}`}
                  className={`block h-16 shrink-0 cursor-pointer overflow-hidden border transition-colors ${
                    idx === active ? "border-bamn-red" : "border-transparent"
                  }`}
                  style={{ aspectRatio: it.ratio }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={it.src}
                    alt=""
                    draggable={false}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
            {overflowing && (
              <button
                type="button"
                onClick={() => scrollStrip(1)}
                aria-label="Scroll right"
                className="font-secondary shrink-0 cursor-pointer px-1 text-xl leading-none text-bamn-black/50 transition-colors hover:text-bamn-black"
              >
                ›
              </button>
            )}
          </div>
        )}
        <div className="h-[1px] mt-1 bg-bamn-muted w-full" />
      </div>
    </div>
  );
}
