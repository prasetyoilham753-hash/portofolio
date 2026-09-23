import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  itemName?: string;
  description?: string;
  confirmLabel?: string;
  isDeleting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({
  isOpen,
  title,
  itemName,
  description = "Tindakan ini permanen dan data yang dihapus tidak dapat dipulihkan.",
  confirmLabel = "Ya, Hapus Permanen",
  isDeleting = false,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onCancel}
    >
      <div 
        className="glass-card max-w-md w-full p-6 sm:p-7 rounded-3xl border border-red-500/30 bg-[rgba(12,20,35,0.96)] shadow-[0_25px_60px_rgba(0,0,0,0.6),0_0_30px_rgba(239,68,68,0.15)] flex flex-col gap-5 relative text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Icon + Title */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {title}
              </h3>
              <p className="text-xs text-text-muted">Konfirmasi Tindakan Hapus</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="text-white/40 hover:text-white p-1 rounded-lg transition-colors cursor-pointer disabled:opacity-30"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex flex-col gap-2">
          {itemName && (
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold text-white/90 break-words line-clamp-2">
              &ldquo;{itemName}&rdquo;
            </div>
          )}
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            {description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="ios-glass-btn px-4 py-2 text-xs text-text-secondary hover:text-white cursor-pointer disabled:opacity-40"
          >
            <span>Batal</span>
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="ios-glass-btn px-5 py-2 text-xs font-semibold text-white bg-gradient-to-b from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 border border-red-400/50 shadow-[0_4px_16px_rgba(239,68,68,0.4)] cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            <Trash2 size={13} />
            <span>{isDeleting ? "Menghapus..." : confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
