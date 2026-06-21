"use client";

// Board — collaborative graffiti wall on a transparent Excalidraw canvas over
// the site's paper texture. Live sync via Yjs + Supabase Realtime; persistence
// via Supabase DB. All wiring lives in useBoard (composed of useExcalidrawApi
// and useRaceCondition).

import "@excalidraw/excalidraw/index.css";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import gsap from "gsap";
import {
  useTransitionRouter,
  useViewTransition,
} from "@/hooks/useTransitionRouter";
import { HomeIcon } from "@/components/HomeIcon";
import { Loading } from "@/components/board/Loading";
import { AdminControls } from "@/components/board/AdminControls";
import { useBoard, type BoardApi, type ExcalidrawEl } from "@/hooks/useBoard";
import { ConfirmModal } from "../board/ConfirmModal";
import useMobile from "@/hooks/useMobile";

// Excalidraw is browser-only — never render it on the server.
const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((m) => m.Excalidraw),
  { ssr: false },
);

// Public lockdown — a plain visitor can only draw (no export/load/theme/bg/
// clear, no image tool).
const USER_UI_OPTIONS = {
  canvasActions: {
    saveToActiveFile: false,
    loadScene: false,
    export: false as const,
    toggleTheme: false,
    changeViewBackgroundColor: false,
    clearCanvas: false,
    saveAsImage: false,
  },
  tools: { image: false },
};

export default function BoardView({ mode }: { mode: "user" | "admin" }) {
  const isUser = mode === "user";
  const root = useRef<HTMLDivElement>(null);
  const [loadingSave, setLoadingSave] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const { navigate } = useTransitionRouter();
  const isMobile = useMobile();

  const {
    ready,
    onChange,
    clearBoard,
    restoreCheckpoint,
    save,
    setApi,
    elementCount,
  } = useBoard();

  useViewTransition({
    enter: () =>
      gsap
        .timeline()
        .fromTo(
          root.current,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.6, ease: "power2.out" },
        ),
    exit: async () => {
      await new Promise<void>((resolve) => {
        gsap.to(root.current, {
          autoAlpha: 0,
          duration: 0.4,
          ease: "power2.in",
          onComplete: resolve,
        });
      });
    },
  });

  const saveProgress = async (t: "checkpoint" | "public"): Promise<boolean> => {
    setLoadingSave(true);
    const d = await save(t);
    setLoadingSave(false);
    return d;
  };

  return (
    <div
      ref={root}
      className="board-canvas fixed inset-0"
      style={{ opacity: 0 }}
    >
      <HomeIcon top={isMobile ? 70 : 21} left={isMobile ? 10 : 70} />

      <div
        className="absolute inset-0"
        onContextMenu={isUser ? (e) => e.preventDefault() : undefined}
      >
        <Excalidraw
          excalidrawAPI={(a) => setApi(a as unknown as BoardApi)}
          onChange={(elements) =>
            onChange(elements as unknown as ExcalidrawEl[])
          }
          initialData={{ appState: { viewBackgroundColor: "transparent" } }}
          UIOptions={isUser ? USER_UI_OPTIONS : undefined}
          onPaste={
            isUser
              ? (_data, event) => {
                  event?.preventDefault();
                  return false;
                }
              : undefined
          }
        />
      </div>

      {!ready && <Loading label="Loading the board" />}
      {showLeaveModal && (
        <ConfirmModal
          busy={loadingSave}
          title={"Leave the board?"}
          message={"You have unsaved changes. Are you sure you want to leave?"}
          confirmLabel={"Leave"}
          onCancel={() => setShowLeaveModal(false)}
          onConfirm={() => navigate("/")}
        />
      )}
      {!isUser && (
        <AdminControls
          onSetCheckpoint={() => saveProgress("checkpoint")}
          onRestoreCheckpoint={restoreCheckpoint}
          onClear={clearBoard}
          mode={mode}
          elementCount={elementCount}
          save={() => saveProgress("public")}
          loadingSave={loadingSave}
        />
      )}
    </div>
  );
}
