"use client";

// Contact — the quietest, most restrained view (instructions/CONTACT.md).
// Static by design: external links + mailto only. The only motion is the calm,
// staggered GSAP entry (and its reverse on exit). One full-scale red header.

import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { useViewTransition } from "@/hooks/useTransitionRouter";
import { HomeIcon } from "@/components/HomeIcon";
import { ContactHeader } from "@/components/contact/ContactHeader";
import { SocialRow } from "@/components/contact/SocialRow";
import { LocationBlock } from "@/components/contact/LocationBlock";
import { ContactPhoto } from "@/components/contact/ContactPhoto";
import { CONTACT_HEADER, ENTER } from "@/components/contact/constants";
import type {
  ContactLocation,
  ContactPhoto as ContactPhotoData,
  ContactSocial,
} from "@/types";

interface ContactViewProps {
  socials: ContactSocial[];
  location: ContactLocation | null;
  photo: ContactPhotoData | null;
}

export default function ContactView({
  socials,
  location,
  photo,
}: ContactViewProps) {
  const { t } = useTranslation();
  const root = useRef<HTMLElement>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          message: data.get("message"),
        }),
      });
      setSent(res.ok);
    } catch {
      setSent(false);
    } finally {
      setSending(false);
    }
  }
  const headerRef = useRef<HTMLHeadingElement>(null);
  const socialRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const inquiriesRef = useRef<HTMLDivElement>(null);
  const homeIconRef = useRef<HTMLButtonElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

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
      tl.fromTo(
        "[data-inquiry]",
        { autoAlpha: 0, y: 16 },
        {
          autoAlpha: 1,
          y: 0,
          duration: ENTER.inquiry,
          ease: "power2.out",
          stagger: ENTER.inquiryStagger,
        },
        ENTER.inquiriesAt,
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
        className="absolute top-0 right-[8vw] z-40 bg-bamn-muted/50 w-[2px] h-screen"
      />
      <div
        // ref={dividerRef}
        data-divider
        className="absolute top-0 right-[13vw]  bg-bamn-muted/50 w-[2px] h-screen"
      />
      <div
        // ref={dividerRef}
        data-divider
        className="absolute top-0 left-[5vw]  bg-bamn-muted/50 w-[2px] h-screen"
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
          {sent ? (
            <p className="font-secondary text-sm text-bamn-black">
              {t("contact.thankYou")}
            </p>
          ) : (
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="flex flex-col gap-3"
            >
              <input
                name="name"
                placeholder={t("form.name")}
                required
                className="font-secondary border border-bamn-muted/50 bg-transparent px-3 py-2 text-sm outline-none focus:border-bamn-black"
              />
              <input
                name="email"
                type="email"
                placeholder={t("form.email")}
                required
                className="font-secondary border border-bamn-muted/50 bg-transparent px-3 py-2 text-sm outline-none focus:border-bamn-black"
              />
              <textarea
                name="message"
                rows={7}
                placeholder={t("form.message")}
                className="font-secondary border border-bamn-muted/50 bg-transparent px-3 py-2 text-sm outline-none focus:border-bamn-black"
              />
              <button
                type="submit"
                disabled={sending}
                className="font-secondary cursor-pointer border border-bamn-black px-4 py-3 text-xs tracking-widest uppercase transition-colors hover:bg-bamn-black hover:text-bamn-cream disabled:opacity-50"
              >
                {sending ? t("form.sending") : t("form.sendInquiry")}
              </button>
            </form>
          )}
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
