"use client";

import Modal from "./Modal";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  detail?: string;
  confirmLabel?: string;
  confirmVariant?: "danger" | "primary";
  loading?: boolean;
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  detail,
  confirmLabel = "Confirm",
  confirmVariant = "danger",
  loading = false,
}: ConfirmDialogProps) {
  const btnClass =
    confirmVariant === "danger"
      ? "bg-red-500 hover:bg-red-600 text-white"
      : "bg-violet-600 hover:bg-violet-700 text-white";

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-gray-600 text-sm">{message}</p>
      {detail && (
        <p className="mt-2 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">{detail}</p>
      )}
      <div className="flex gap-3 mt-6 justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50 transition-colors ${btnClass}`}
        >
          {loading ? "..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
