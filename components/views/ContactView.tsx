"use client";

// Contact — the quietest, most restrained view (instructions/CONTACT.md).
// Static by design: external links + mailto only. The only motion is the calm,
// staggered GSAP entry (and its reverse on exit). One full-scale red header.

import { useRef } from "react";
import gsap from "gsap";
import { useViewTransition } from "@/hooks/useTransitionRouter";
import { HomeIcon } from "@/components/HomeIcon";
import { ContactHeader } from "@/components/contact/ContactHeader";
import { SocialRow } from "@/components/contact/SocialRow";
import { LocationBlock } from "@/components/contact/LocationBlock";
import { ContactPhoto } from "@/components/contact/ContactPhoto";
import { ContactForm } from "@/components/contact/ContactForm";
import { CONTACT_HEADER, ENTER } from "@/components/contact/constants";
import type { ContactFormConfig } from "@/components/contact/ContactForm";
import type {
  ContactLocation,
  ContactPhoto as ContactPhotoData,
  ContactSocial,
} from "@/types";
import { LanguageSwitcher } from "../LanguageSwitcher";

interface ContactViewProps {
  socials: ContactSocial[];
  location: ContactLocation | null;
  photo: ContactPhotoData | null;
  formConfig: ContactFormConfig;
}

export default function ContactView({
  socials,
  location,
  photo,
  formConfig,
}: ContactViewProps) {
  const root = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLHeadingElement>(null);
  const socialRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const inquiriesRef = useRef<HTMLDivElement>(null);
  const homeIconRef = useRef<HTMLButtonElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useViewTransition({
    enter: () => {
      // fromTo's immediateRender pre-states each element (no flash).
      const tl = gsap.timeline();
      tl.fromTo(
        headerRef.current,
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, duration: ENTER.header, ease: "power2.out" },
        ENTER.headerAt,
      );
      tl.fromTo(
        homeIconRef.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.4, ease: "power2.out" },
        ENTER.headerAt,
      );
      tl.fromTo(
        socialRef.current,
        { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, duration: ENTER.social, ease: "power2.out" },
        ENTER.socialAt,
      );
      tl.fromTo(
        "[data-divider]",
        { scaleX: 0 },
        { scaleX: 1, duration: ENTER.divider, ease: "power2.inOut" },
        ENTER.dividerAt,
      );
      tl.fromTo(
        [locationRef.current, formRef.current],
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, duration: ENTER.location, ease: "power2.out" },
        ENTER.locationAt,
      );
      tl.fromTo(
        photoRef.current,
        { autoAlpha: 0, x: 60 },
        { autoAlpha: 1, x: 0, duration: ENTER.photo, ease: "power2.out" },
        ENTER.photoAt,
      );
      return tl;
    },
    exit: () =>
      new Promise<void>((resolve) => {
        const tl = gsap.timeline({ onComplete: resolve });
        tl.to(
          photoRef.current,
          { autoAlpha: 0, x: 60, duration: 0.35, ease: "power2.in" },
          0,
        );
        tl.to(
          "[data-divider]",
          { autoAlpha: 0, x: 60, duration: 0.35, ease: "power2.in" },
          0,
        );
        tl.to(
          [locationRef.current, inquiriesRef.current, formRef.current],
          { autoAlpha: 0, y: 30, duration: 0.3, ease: "power2.in" },
          0,
        );
        tl.to(
          [headerRef.current, socialRef.current, homeIconRef.current],
          { autoAlpha: 0, duration: 0.3, ease: "power2.in" },
          0,
        );
      }),
  });

  return (
    <main ref={root} className="relative min-h-screen px-[6vw] pt-10 pb-16">
      <div
        // ref={dividerRef}
        data-divider
        className="absolute top-0 right-[8vw] z-40 bg-bamn-muted/50 w-[2px] h-full"
      />
      <div
        // ref={dividerRef}
        data-divider
        className="absolute top-0 right-[13vw]  bg-bamn-muted/50 w-[2px] h-full"
      />
      <div
        // ref={dividerRef}
        data-divider
        className="absolute top-0 left-[5vw]  bg-bamn-muted/50 w-[2px] h-full"
      />
      {/* <div className="absolute top-[220px] left-0 bg-bamn-muted/50 w-screen h-[2px]" /> */}
      <HomeIcon ref={homeIconRef} />

      <ContactHeader ref={headerRef} text={CONTACT_HEADER} />

      <div className="mt-8 relative">
        <SocialRow ref={socialRef} socials={socials} />
        <div
          // ref={dividerRef}
          data-divider
          className="mt-6 h-px w-[92vw] -left-[6vw] absolute origin-left bg-bamn-muted/40"
        />
      </div>

      {/* Details: location top-left, inquiries bottom-left, photo bottom-right. */}
      <div className="mt-16 grid grid-cols-1 gap-16 md:grid-cols-2">
        <div className="flex flex-col justify-start gap-24 relative z-40">
          {location && <LocationBlock ref={locationRef} location={location} />}
          <div
            // ref={dividerRef}
            data-divider
            className="mt-6 h-px w-[92vw] top-[200px]  -left-[6vw] absolute origin-left z-40 bg-bamn-muted/40"
          />
          <ContactForm ref={formRef} config={formConfig} />
          {/* {inquiries && (
            <InquiryBlocks ref={inquiriesRef} inquiries={inquiries} />
          )} */}
        </div>
        <div className="flex items-start justify-end">
          {photo && <ContactPhoto ref={photoRef} photo={photo} />}
        </div>
      </div>
    </main>
  );
}
