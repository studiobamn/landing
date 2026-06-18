"use client";

// Admin-only board controls (BOARD.md): Save/Commit (set restore point),
// Wipe (restore checkpoint), Nuke (blank live, keep checkpoint, confirm modal).
// All hit server routes that verify the admin session; on success we reload the
// board locally and broadcast a reload so other clients re-pull board.data.

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { NukeConfirmModal } from "./NukeConfirmModal";

interface AdminControlsProps {
  getDocument: () => unknown | null; // current tldraw document snapshot
  reload: () => Promise<void>; // re-pull board.data into the editor
  broadcastReload: () => void; // tell other clients to reload
}

type Status = { text: string; tone: "ok" | "error" } | null;

export function AdminControls({
  getDocument,
  reload,
  broadcastReload,
}: AdminControlsProps) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [nukeOpen, setNukeOpen] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  const commit = async () => {
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/board/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snapshot: getDocument() }),
      });
      setStatus(
        res.ok
          ? { text: t("admin.restorePointSet"), tone: "ok" }
          : { text: t("admin.commitFailed"), tone: "error" },
      );
    } finally {
      setBusy(false);
    }
  };

  const wipe = async () => {
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/board/wipe", { method: "POST" });
      if (res.ok) {
        await reload();
        broadcastReload();
        setStatus({ text: t("admin.wipedToCheckpoint"), tone: "ok" });
      } else {
        const body = await res.json().catch(() => ({}));
        setStatus({
          text: body.error ?? t("admin.wipeFailed"),
          tone: "error",
        });
      }
    } finally {
      setBusy(false);
    }
  };

  const nuke = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/board/nuke", { method: "POST" });
      if (res.ok) {
        await reload();
        broadcastReload();
        setStatus({ text: t("admin.boardNuked"), tone: "ok" });
      } else {
        setStatus({ text: t("admin.nukeFailed"), tone: "error" });
      }
    } finally {
      setBusy(false);
      setNukeOpen(false);
    }
  };

  return (
    <>
      <div className="font-secondary pointer-events-auto fixed top-[100px] left-5 z-50 flex flex-col items-end gap-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={commit}
            disabled={busy}
            className="cursor-pointer border border-bamn-black bg-bamn-cream px-3 py-2 text-[10px] tracking-widest uppercase transition-colors hover:bg-bamn-black hover:text-bamn-cream disabled:opacity-50"
          >
            {t("admin.commit")}
          </button>
          <button
            type="button"
            onClick={wipe}
            disabled={busy}
            className="cursor-pointer border border-bamn-black bg-bamn-cream px-3 py-2 text-[10px] tracking-widest uppercase transition-colors hover:bg-bamn-black hover:text-bamn-cream disabled:opacity-50"
          >
            {t("admin.wipe")}
          </button>
          <button
            type="button"
            onClick={() => setNukeOpen(true)}
            disabled={busy}
            className="cursor-pointer border border-bamn-red bg-bamn-cream px-3 py-2 text-[10px] tracking-widest text-bamn-red uppercase transition-colors hover:bg-bamn-red hover:text-bamn-cream disabled:opacity-50"
          >
            {t("admin.nuke")}
          </button>
        </div>
        {status && (
          <p
            className={`text-[10px] tracking-wide ${
              status.tone === "error" ? "text-bamn-red" : "text-bamn-black/70"
            }`}
          >
            {status.text}
          </p>
        )}
      </div>

      {nukeOpen && (
        <NukeConfirmModal
          busy={busy}
          onCancel={() => setNukeOpen(false)}
          onConfirm={nuke}
        />
      )}
    </>
  );
}
