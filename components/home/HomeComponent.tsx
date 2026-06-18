"use client";

import useMobile from "@/hooks/useMobile";
// A single draggable nav component (Layer 3). Position/rotation/scale is driven
// imperatively by the physics DOM-sync loop via the forwarded ref, so this
// stays purely presentational. Size is per-view (mixed vertical/horizontal
// formats). Drive/external media → raw <img> (per STACK.md).

import { forwardRef } from "react";
import { ViewKey } from "./constants";
import { useI18nContext } from "../I18nProvider";

interface HomeComponentProps {
  src: string | null;
  label: string;
  width: number;
  height: number;
  num: number;
  view: ViewKey;
}

const possitions = {
  top: ["-top-6 left-0", "-top-6 right-0"],
  bottom: ["-bottom-6 left-0", "-bottom-6 right-0"],
};
const positionPicker: ["top", "bottom"] = ["top", "bottom"];

const textByViewEn: Record<ViewKey, string> = {
  projects: "Made by Us",
  product: "Collections",
  about: "Meet Us",
  contact: "Let's Talk",
  board: "Be Creative",
};
const textByViewEs: Record<ViewKey, string> = {
  projects: "Hecho por Nosotros",
  product: "Colecciones",
  about: "Conocenos",
  contact: "Hablemos",
  board: "Sé Creativo",
};

export const HomeComponent = forwardRef<HTMLDivElement, HomeComponentProps>(
  function HomeComponent({ src, label, width, height, num, view }, ref) {
    const isMobile = useMobile();
    const randomPicker = Math.floor(Math.random() * 2);
    const numberWhere: "top" | "bottom" = positionPicker[randomPicker];
    const textWhere: "top" | "bottom" =
      numberWhere === "top" ? "bottom" : "top";
    const randomNum = Math.floor(
      Math.random() * possitions[numberWhere].length,
    );
    const randomText = Math.floor(Math.random() * possitions[textWhere].length);
    const numberPosition = possitions[numberWhere][randomNum];
    const textPosition = possitions[textWhere][randomText];
    const { current } = useI18nContext();
    const text = current === "es" ? textByViewEs[view] : textByViewEn[view];

    return (
      <div
        ref={ref}
        className="group absolute top-0 left-0 will-change-transform select-none cursor-pointer"
        // Fixed base size (physics reads offsetWidth); parked off-screen until
        // the first frame positions it.
        style={{ width, height, transform: "translate(-9999px, -9999px)" }}
      >
        {src ? (
          // Drive/external media uses raw <img> by design (STACK.md).
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={label}
            draggable={false}
            className="pointer-events-none h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted/30 text-xs text-muted">
            {label}
          </div>
        )}
        <span className="font-primary bg-bamn-muted/50 font-semibold backdrop-blur-md tracking-[3px] h-full flex justify-center items-center pointer-events-none absolute py-2 inset-x-0 bottom-0 text-center text-lg text-bamn-black uppercase opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          {label}
        </span>

        <span
          className={`absolute text-bamn-black/50 md:text-sm ${textPosition}`}
        >
          {text}
        </span>
        <span
          className={`absolute text-bamn-black/50 text-md md:text-sm ${numberPosition}`}
        >
          {`(${num}) `}
          {isMobile && (
            <>
              <span className="">{label}</span>
            </>
          )}
        </span>
      </div>
    );
  },
);
