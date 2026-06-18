"use client";

// Confirmation before the destructive Nuke (BOARD.md). Red accent is allowed
// here — it's a destructive action.

import { useTranslation } from "react-i18next";

interface NukeConfirmModalProps {
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function NukeConfirmModal({
  busy,
  onCancel,
  onConfirm,
}: NukeConfirmModalProps) {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <button
        type="button"
        aria-label={t("common.cancel")}
        onClick={onCancel}
        className="absolute inset-0 cursor-default bg-bamn-black/40 backdrop-blur-sm"
      />
      <div className="relative z-10 w-[90vw] max-w-md bg-bamn-cream p-8">
        <h2 className="font-primary text-xl font-bold text-bamn-black">
          {t("admin.nukeHeading")}
        </h2>
        <p className="font-secondary mt-4 text-sm leading-relaxed text-bamn-black/80">
          {t("admin.nukeDescription")}
        </p>
        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="font-secondary cursor-pointer border border-bamn-black px-4 py-2 text-xs tracking-widest uppercase transition-colors hover:bg-bamn-black hover:text-bamn-cream disabled:opacity-50"
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="font-secondary cursor-pointer bg-bamn-red px-4 py-2 text-xs tracking-widest text-bamn-cream uppercase transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            {busy ? t("admin.nuking") : t("admin.nukeConfirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
