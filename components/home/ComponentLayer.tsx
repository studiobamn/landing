"use client";

// Layer 3 — the 4 nav components. Registers each element into the shared
// itemRefs array (indexed to match Position A..D) so the physics hook can
// sync them every frame. `assignments[i]` is the view shown at position i.

import { useTranslation } from "react-i18next";
import { HomeComponent } from "./HomeComponent";
import { VIEW_SIZE, type ViewKey } from "./constants";
import { resolveMediaUrl } from "@/lib/drive";
import type { HomeCovers } from "@/types";

interface ComponentLayerProps {
  assignments: ViewKey[];
  covers: HomeCovers | null;
  itemsRef: React.RefObject<(HTMLDivElement | null)[]>;
}

export function ComponentLayer({
  assignments,
  covers,
  itemsRef,
}: ComponentLayerProps) {
  const { t } = useTranslation();
  // "product" view key maps to the "products" nav label
  const navKey = (v: ViewKey) => (v === "product" ? "nav.products" : `nav.${v}`);
  return (
    <div className="absolute inset-0 z-20">
      {assignments.map((view, i) => (
        <HomeComponent
          key={view}
          num={i}
          ref={(el) => {
            itemsRef.current[i] = el;
          }}
          src={resolveMediaUrl(covers?.[view])}
          label={t(navKey(view))}
          view={view}
          width={VIEW_SIZE[view].width}
          height={VIEW_SIZE[view].height}
        />
      ))}
    </div>
  );
}
