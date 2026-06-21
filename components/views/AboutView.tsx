"use client";

// About — static editorial collage (instructions/ABOUT.md). Absolute-positioned
// layers on the paper; the only motion is the GSAP assemble (enter) and
// come-apart (exit). Content comes from site_content key 'about'.

import { useRef } from "react";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { useViewTransition } from "@/hooks/useTransitionRouter";
import { HomeIcon } from "@/components/HomeIcon";
import { resolveMediaUrl } from "@/lib/drive";
import { GuideLines } from "@/components/about/GuideLines";
import { Headline } from "@/components/about/Headline";
import { VerticalLabel } from "@/components/about/VerticalLabel";
import { AboutPhotos } from "@/components/about/AboutPhotos";
import { PlaceList } from "@/components/about/PlaceList";
import { Manifesto } from "@/components/about/Manifesto";
import { Keywords } from "@/components/about/Keywords";
import { FooterMeta } from "@/components/about/FooterMeta";
import { Scrawls } from "@/components/about/Scrawls";
import useMobile from "@/hooks/useMobile";
import type { AboutContent } from "@/types";
import { CustomComp } from "../CustomComp";

interface AboutViewProps {
  content: AboutContent | null;
}

export default function AboutView({ content }: AboutViewProps) {
  const { t } = useTranslation();
  const isMobile = useMobile();
  const root = useRef<HTMLElement>(null);
  const guideRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLImageElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const imageARef = useRef<HTMLImageElement>(null);
  const imageBRef = useRef<HTMLImageElement>(null);
  const placeRef = useRef<HTMLDivElement>(null);
  const manifestoRef = useRef<HTMLParagraphElement>(null);
  const keywordsRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const scrawlLeftRef = useRef<HTMLImageElement>(null);
  const scrawlRightRef = useRef<HTMLImageElement>(null);
  const homeIconRef = useRef<HTMLButtonElement>(null);

  useViewTransition({
    // Assemble — elements arrive in layered order (fromTo pre-states each).
    enter: () => {
      const tl = gsap.timeline();
      tl.fromTo(
        guideRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          transformOrigin: "top center",
          duration: 0.3,
          ease: "power2.out",
        },
        0,
      );
      tl.fromTo(
        headlineRef.current,
        { autoAlpha: 0, scale: 0.97 },
        { autoAlpha: 1, scale: 1, duration: 0.5, ease: "power2.out" },
        0.05,
      );
      tl.fromTo(
        homeIconRef.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.2, ease: "power2.out" },
        0.1,
      );
      tl.fromTo(
        imageARef.current,
        { autoAlpha: 0, x: 15 },
        { autoAlpha: 1, x: 0, duration: 0.4, ease: "power2.out" },
        0.2,
      );
      tl.fromTo(
        imageBRef.current,
        { autoAlpha: 0, x: 10 },
        { autoAlpha: 1, x: 0, duration: 0.4, ease: "power2.out" },
        0.32,
      );
      tl.fromTo(
        placeRef.current,
        { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out" },
        0.35,
      );
      tl.fromTo(
        labelRef.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.3, ease: "power2.out" },
        0.4,
      );
      tl.fromTo(
        manifestoRef.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.35, ease: "power2.out" },
        0.43,
      );
      tl.fromTo(
        keywordsRef.current,
        { autoAlpha: 0, y: 8 },
        { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" },
        0.5,
      );
      tl.fromTo(
        footerRef.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.25, ease: "power2.out" },
        0.55,
      );
      tl.fromTo(
        scrawlLeftRef.current,
        { autoAlpha: 0 },
        { autoAlpha: 0.85, duration: 0.35, ease: "power2.out" },
        0.65,
      );
      tl.fromTo(
        scrawlRightRef.current,
        { autoAlpha: 0 },
        { autoAlpha: 0.85, duration: 0.35, ease: "power2.out" },
        0.72,
      );
      return tl;
    },
    // Come apart — reverse layered order.
    exit: () =>
      new Promise<void>((resolve) => {
        const tl = gsap.timeline({ onComplete: resolve });
        tl.to(
          [scrawlLeftRef.current, scrawlRightRef.current],
          { autoAlpha: 0, duration: 0.2, ease: "power2.in" },
          0,
        );
        tl.to(
          [
            keywordsRef.current,
            manifestoRef.current,
            placeRef.current,
            footerRef.current,
          ],
          {
            autoAlpha: 0,
            y: 12,
            duration: 0.25,
            ease: "power2.in",
            stagger: 0.05,
          },
          0.05,
        );
        tl.to(
          labelRef.current,
          { autoAlpha: 0, duration: 0.2, ease: "power2.in" },
          0.1,
        );
        tl.to(
          imageBRef.current,
          { autoAlpha: 0, x: 20, duration: 0.3, ease: "power2.in" },
          0.15,
        );
        tl.to(
          imageARef.current,
          { autoAlpha: 0, x: 15, duration: 0.3, ease: "power2.in" },
          0.23,
        );
        tl.to(
          headlineRef.current,
          { autoAlpha: 0, scale: 0.97, duration: 0.3, ease: "power2.in" },
          0.3,
        );
        tl.to(
          guideRef.current,
          {
            scaleY: 0,
            transformOrigin: "bottom center",
            duration: 0.25,
            ease: "power2.in",
          },
          0.35,
        );
        tl.to(
          homeIconRef.current,
          { autoAlpha: 0, duration: 0.15, ease: "power2.in" },
          0.4,
        );
      }),
  });

  if (!content) {
    return (
      <main ref={root} className="relative h-screen w-full overflow-hidden">
        <HomeIcon ref={homeIconRef} />
        <p className="font-secondary absolute top-1/2 left-1/2 -translate-x-1/2 text-sm text-bamn-muted">
          {t("about.noContent")}
        </p>
      </main>
    );
  }

  return (
    <div className="pb-20">
      <main ref={root} className="relative h-screen w-full overflow-hidden">
        <HomeIcon ref={homeIconRef} />

        <GuideLines ref={guideRef} />
        <Headline
          ref={headlineRef}
          src={resolveMediaUrl(content.headline_image) ?? ""}
          isMobile={isMobile}
        />
        <VerticalLabel
          ref={labelRef}
          line1={content.vertical_label_line1}
          isMobile={isMobile}
        />
        <AboutPhotos
          imageA={content.image_a}
          imageB={content.image_b}
          imageARef={imageARef}
          imageBRef={imageBRef}
          isMobile={isMobile}
        />
        <PlaceList
          ref={placeRef}
          items={content.place_list}
          isMobile={isMobile}
        />
        <Manifesto ref={manifestoRef} isMobile={isMobile} />
        <Keywords
          ref={keywordsRef}
          items={content.keywords}
          isMobile={isMobile}
        />
        <FooterMeta ref={footerRef} isMobile={isMobile} />
        <Scrawls
          left={content.scrawl_images?.[0]}
          right={content.scrawl_images?.[1]}
          leftRef={scrawlLeftRef}
          rightRef={scrawlRightRef}
          isMobile={isMobile}
        />
      </main>
      {content.sections.length > 0 && (
        <div className="flex flex-col gap-18">
          {content.sections.map((section) => {
            const imgUrl = resolveMediaUrl(section.imgUrl) ?? section.imgUrl;
            return (
              <CustomComp
                key={section.text}
                imgUrl={imgUrl}
                text={section.text}
                imgPosition={section.imgPosition}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
