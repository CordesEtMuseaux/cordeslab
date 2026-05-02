import React from "react";

type Props = {
  open: boolean;
  title: string;
  body: string;
  ctaLabel: string;
  onClose: () => void;
  onUpgrade: () => void;
};

export function UpgradeModal({ open, title, body, ctaLabel, onClose, onUpgrade }: Props) {
  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/45" onClick={onClose} />

      <div className="relative w-[92vw] max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="text-lg font-semibold text-gray-900">{title}</div>
        <div className="mt-2 text-sm leading-relaxed text-gray-600">{body}</div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            onClick={onClose}
          >
            Plus tard
          </button>

          <button
            type="button"
            className="rounded-xl bg-black px-4 py-2 text-sm text-white hover:opacity-90"
            onClick={onUpgrade}
          >
            {ctaLabel}
          </button>
        </div>
      </div>
    </div>
  );
}