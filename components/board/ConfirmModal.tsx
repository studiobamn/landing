"use client";

// Generic confirmation modal for destructive board actions (restore / clear).
// Red accent is appropriate — these are destructive.

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel: string;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmModal({
  title,
  message,
  confirmLabel,
  busy,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <button
        type="button"
        aria-label="Cancel"
        onClick={onCancel}
        className="absolute inset-0 cursor-default bg-bamn-black/40 backdrop-blur-sm"
      />
      <div className="relative z-10 w-[90vw] max-w-md bg-bamn-cream p-8">
        <h2 className="font-primary text-xl font-bold text-bamn-black">{title}</h2>
        <p className="font-secondary mt-4 text-sm leading-relaxed text-bamn-black/80">
          {message}
        </p>
        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="font-secondary cursor-pointer border border-bamn-black px-4 py-2 text-xs tracking-widest uppercase transition-colors hover:bg-bamn-black hover:text-bamn-cream disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="font-secondary cursor-pointer bg-bamn-red px-4 py-2 text-xs tracking-widest text-bamn-cream uppercase transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
