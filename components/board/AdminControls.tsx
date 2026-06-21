"use client";

// Admin-only board controls (Excalidraw/Yjs refactor): Set Checkpoint, Restore
// Checkpoint, Clear Board. Restore & Clear are destructive → confirm first.
// Also shows a soft element-count hint to prompt checkpointing when heavy.

import { useEffect, useState } from "react";
import { ConfirmModal } from "./ConfirmModal";

interface AdminControlsProps {
  onSetCheckpoint: () => Promise<boolean>;
  onRestoreCheckpoint: () => Promise<boolean>;
  onClear: () => void;
  elementCount: number;
  mode: "admin" | "user";
  save: () => Promise<boolean>;
  loadingSave: boolean;
}

type Status = { text: string; tone: "ok" | "error" } | null;
type Pending = null | "restore" | "clear";

const SOFT_LIMIT = 2000;

export function AdminControls({
  onSetCheckpoint,
  onRestoreCheckpoint,
  onClear,
  elementCount,
  mode,
}: AdminControlsProps) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(null), 15_000);
    return () => clearTimeout(t);
  }, [status]);
  const [pending, setPending] = useState<Pending>(null);

  const checkpoint = async () => {
    setBusy(true);
    setStatus(null);
    const ok = await onSetCheckpoint();
    setStatus(
      ok
        ? { text: "Checkpoint saved.", tone: "ok" }
        : { text: "Checkpoint failed.", tone: "error" },
    );
    setBusy(false);
  };

  const runPending = async () => {
    if (!pending) return;
    setBusy(true);
    try {
      if (pending === "clear") {
        onClear();
        setStatus({ text: "Board cleared.", tone: "ok" });
      } else {
        const ok = await onRestoreCheckpoint();
        setStatus(
          ok
            ? { text: "Restored to checkpoint.", tone: "ok" }
            : { text: "No checkpoint found.", tone: "error" },
        );
      }
    } finally {
      setBusy(false);
      setPending(null);
    }
  };

  const heavy = elementCount > SOFT_LIMIT;
  const btn =
    "cursor-pointer border border-bamn-black bg-bamn-cream px-3 py-2 text-[10px] tracking-widest uppercase transition-colors hover:bg-bamn-black hover:text-bamn-cream disabled:opacity-50";

  return (
    <>
      {mode === "admin" && (
        <div
          style={{ zIndex: 4 }}
          className="font-secondary pointer-events-auto fixed top-[100px] right-5  flex flex-col items-start gap-2"
        >
          <div className="flex gap-2">
            <button
              type="button"
              onClick={checkpoint}
              disabled={busy}
              className={btn}
            >
              Set checkpoint
            </button>
            <button
              type="button"
              onClick={() => setPending("restore")}
              disabled={busy}
              className={btn}
            >
              Restore
            </button>
            <button
              type="button"
              onClick={() => setPending("clear")}
              disabled={busy}
              className="cursor-pointer border border-bamn-red bg-bamn-cream px-3 py-2 text-[10px] tracking-widest text-bamn-red uppercase transition-colors hover:bg-bamn-red hover:text-bamn-cream disabled:opacity-50"
            >
              Clear board
            </button>
          </div>

          <p
            className={`text-[10px] tracking-wide ${
              heavy ? "text-bamn-red" : "text-bamn-black/60"
            }`}
          >
            {elementCount} elements
            {heavy ? " — getting heavy, consider checkpoint / clear" : ""}
          </p>

          {status && (
            <p
              className={`text-[10px] tracking-wide ${
                status.tone === "error" ? "text-bamn-red" : "text-bamn-black/70"
              }`}
            >
              {status.text}
            </p>
          )}
          {pending && (
            <ConfirmModal
              busy={busy}
              title={
                pending === "clear" ? "Clear the board?" : "Restore checkpoint?"
              }
              message={
                pending === "clear"
                  ? "This wipes the live board to blank for everyone, immediately."
                  : "This replaces the live board with your last checkpoint for everyone."
              }
              confirmLabel={pending === "clear" ? "Clear it" : "Restore"}
              onCancel={() => setPending(null)}
              onConfirm={runPending}
            />
          )}
        </div>
      )}
    </>
  );
}
