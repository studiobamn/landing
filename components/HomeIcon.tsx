"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import gsap from "gsap";
import { useTranslation } from "react-i18next";
import { useTransitionRouter } from "@/hooks/useTransitionRouter";
import { useAppStore } from "@/store/useAppStore";
import { resolveMediaUrl } from "@/lib/drive";
import useMobile from "@/hooks/useMobile";
import type { HomeCovers } from "@/types";
import { LanguageSwitcher } from "./LanguageSwitcher";

const NAV_PAGES: { label: string; path: string; key: keyof HomeCovers }[] = [
  { label: "Home", path: "/", key: "home" },
  { label: "Projects", path: "/projects", key: "projects" },
  { label: "Product", path: "/product", key: "product" },
  { label: "About", path: "/about", key: "about" },
  { label: "Contact", path: "/contact", key: "contact" },
  { label: "Board", path: "/board", key: "board" },
];

export function HomeIcon({
  ref,
  top = 15,
  left = 25,
  onClick,
}: {
  ref?: React.RefObject<HTMLButtonElement | null>;
  top?: number;
  left?: number;
  onClick?: () => void;
}) {
  const { t } = useTranslation();
  const { navigate } = useTransitionRouter();
  const covers = useAppStore((s) => s.homeCovers);
  const isMobile = useMobile();
  const [isOpen, setIsOpen] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  // Sync internal triggerRef to parent ref
  useEffect(() => {
    if (ref) ref.current = triggerRef.current;
  }, [ref]);

  // Set bar to hidden off-screen before first paint
  useLayoutEffect(() => {
    if (!barRef.current) return;
    gsap.set(barRef.current, {
      autoAlpha: 0,
      x: isMobile ? 0 : "-100vw",
      y: isMobile ? "-100%" : 0,
    });
  }, [isMobile]);

  const openNav = useCallback(() => {
    setIsOpen(true);
    if (barRef.current) {
      gsap.to(barRef.current, {
        autoAlpha: 1,
        x: 0,
        y: 0,
        duration: 0.45,
        ease: "power3.out",
      });
    }
    if (triggerRef.current) {
      gsap.to(triggerRef.current, { autoAlpha: 0, duration: 0.15 });
    }
  }, []);

  const closeNav = useCallback(
    (then?: () => void) => {
      if (barRef.current) {
        gsap.to(barRef.current, {
          autoAlpha: 0,
          x: isMobile ? 0 : "-100vw",
          y: isMobile ? "-100%" : 0,
          duration: 0.35,
          ease: "power3.in",
          onComplete: () => {
            setIsOpen(false);
            then?.();
          },
        });
      }
      if (triggerRef.current) {
        gsap.to(triggerRef.current, {
          autoAlpha: 1,
          duration: 0.2,
          delay: 0.2,
        });
      }
    },
    [isMobile],
  );

  const goTo = useCallback(
    (path: string) => {
      closeNav(() => navigate(path));
    },
    [closeNav, navigate],
  );

  return (
    <>
      {/* Collapsed trigger — parent views animate this via ref */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (onClick) {
            onClick();
            return;
          }
          openNav();
        }}
        aria-label={t("common.backToHome")}
        style={{ top: `${top}px`, left: `${left}px`, zIndex: 1000 }}
        className="font-primary fixed text-xl tracking-wide text-bamn-red cursor-pointer font-bold"
      >
        BAMN
      </button>

      {/* Expanded nav — desktop: horizontal bar / mobile: full overlay */}
      <div
        ref={barRef}
        className={
          isMobile
            ? "fixed inset-0 flex flex-col bg-bamn-cream px-8 py-6 w-[50%] h-fit"
            : "fixed left-0 right-0 flex flex-row items-center bg-bamn-cream px-6 w-fit"
        }
        style={
          isMobile
            ? { zIndex: 1000 }
            : { top: 0, height: `${top * 2 + 12}px`, zIndex: 1000 }
        }
      >
        {/* ‹ close */}
        <button
          type="button"
          onClick={() => closeNav()}
          className={
            isMobile
              ? "font-primary text-xl w-full flex justify-start leading-none text-bamn-red cursor-pointer font-bold"
              : "font-primary shrink-0 text-xl leading-none text-bamn-red cursor-pointer font-bold"
          }
          aria-label="Close navigation"
        >
          {isMobile ? "^" : "<"}
        </button>

        {/* Page links */}
        <div
          className={
            isMobile
              ? "flex flex-col gap-2 justify-start my-5"
              : "flex flex-row gap-2 px-10 justify-center items-center"
          }
        >
          {NAV_PAGES.map(({ label, path }, i) => {
            const isLast = isMobile ? false : i === NAV_PAGES.length - 1;
            return (
              <button
                key={path}
                type="button"
                onClick={() => goTo(path)}
                className="flex items-center gap-2 cursor-pointer group transition-all duration-300"
              >
                <span className="font-primary text-[10px] tracking-widest uppercase text-bamn-black transition-colors">
                  {label} {isLast ? "" : "/"}
                </span>
              </button>
            );
          })}
        </div>
        <div
          className={
            isMobile
              ? "font-primary w-full flex justify-start text-xl tracking-wide text-bamn-red cursor-pointer font-bold"
              : "font-primary shrink-0 text-xl tracking-wide text-bamn-red cursor-pointer font-bold"
          }
        >
          <LanguageSwitcher />
        </div>
        {/* BAMN → "/" */}
        {/* <button
          type="button"
          onClick={() => closeNav()}
          className={
            isMobile
              ? "font-primary w-full flex justify-start text-xl tracking-wide text-bamn-red cursor-pointer font-bold"
              : "font-primary shrink-0 text-xl tracking-wide text-bamn-red cursor-pointer font-bold"
          }
        >
          BAMN
        </button> */}
      </div>
    </>
  );
}
