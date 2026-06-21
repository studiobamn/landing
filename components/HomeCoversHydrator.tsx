"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import type { HomeCovers } from "@/types";

export function HomeCoversHydrator({ covers }: { covers: HomeCovers | null }) {
  const setHomeCovers = useAppStore((s) => s.setHomeCovers);
  useEffect(() => {
    if (covers) setHomeCovers(covers);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
