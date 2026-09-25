import React, { useState, useEffect, useRef } from "react";
import { Lock, KeyRound, ArrowRight, X, CheckCircle2, ShieldCheck, Download, AlertCircle, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CvAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  cvUrl?: string;
  correctCode?: string;
  candidateName?: string;
}

export function CvAccessModal({
  isOpen,
  onClose,
  cvUrl,
  correctCode = "19112191",
  candidateName = "Bintang Prasetyo"
}: CvAccessModalProps) {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPasscode, setShowPasscode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Normalize code check (trimmed)
  const targetCode = (correctCode && correctCode.trim()) || "19112191";

  // Reset states and auto-focus input upon opening
  useEffect(() => {
    if (isOpen) {
      setPasscode("");
      setError(null);
      setIsSuccess(false);
      setIsSubmitting(false);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!passcode.trim()) {
      setError("Silakan masukkan kode akses.");
      inputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);

    if (passcode.trim() === targetCode) {
      setError(null);
      setIsSuccess(true);

      // Trigger download / view after small visual confirmation
      setTimeout(() => {
        if (cvUrl) {
          const link = document.createElement("a");
          link.href = cvUrl;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.download = `CV-${candidateName.replace(/\s+/g, "_")}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        // Close modal gracefully after trigger
        setTimeout(() => {
          onClose();
        }, 1200);
      }, 500);
    } else {
      setIsSubmitting(false);
      setError("Kode akses salah. Silakan masukkan kode akses yang benar.");
      inputRef.current?.select();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="glass-card max-w-md w-full p-6 sm:p-8 rounded-[28px] border border-[rgba(120,170,255,0.25)] bg-[rgba(8,18,36,0.96)] shadow-[0_25px_60px_rgba(0,0,0,0.7),0_0_40px_rgba(125,179,255,0.12)] flex flex-col gap-5 relative text-left"
        onClick={(e) => e.stopPropagation()}
        style={{ WebkitBackdropFilter: "blur(20px)" }}
      >
        {/* Subtle top neon ambient sheen */}
        <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-[#7DB3FF]/15 to-transparent pointer-events-none rounded-t-[28px]" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
              isSuccess 
                ? "bg-emerald-500/15 border border-emerald-500/35 text-emerald-400" 
                : "bg-[#7DB3FF]/15 border border-[#7DB3FF]/30 text-[#7DB3FF]"
            }`}>
              {isSuccess ? <CheckCircle2 size={22} /> : <KeyRound size={22} />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {isSuccess ? "Akses Diterima" : "Kode Akses Diperlukan"}
              </h3>
              <p className="text-xs text-text-muted">
                {isSuccess ? "Menyiapkan berkas Curriculum Vitae..." : "Proteksi Unduh CV & Resume"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/40 hover:text-white p-1.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition-colors cursor-pointer"
            title="Tutup dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10">
            <div className="flex flex-col gap-1.5">
              <p className="text-xs sm:text-sm text-[#A8B8CC] font-light leading-relaxed">
                Untuk mengunduh dokumen resmi CV <strong>{candidateName}</strong>, silakan masukkan kode akses otorisasi:
              </p>
            </div>

            {/* Input Box */}
            <div className="flex flex-col gap-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7DB3FF]">
                  <Lock size={16} />
                </div>
                <input
                  ref={inputRef}
                  id="cv-passcode-input"
                  type={showPasscode ? "text" : "password"}
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Masukkan kode akses otorisasi..."
                  autoComplete="off"
                  disabled={isSubmitting}
                  className={`w-full pl-10 pr-11 py-3 rounded-xl bg-white/[0.05] border ${
                    error ? "border-rose-500/70 focus:border-rose-400" : "border-white/15 focus:border-[#7DB3FF]"
                  } text-white placeholder-white/30 text-sm font-mono tracking-wider outline-none transition-all shadow-inner`}
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-white/40 hover:text-white transition-colors cursor-pointer"
                  title={showPasscode ? "Sembunyikan" : "Tampilkan"}
                >
                  {showPasscode ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg"
                  >
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[#A8B8CC]/70 bg-white/[0.02] border border-white/5 px-3.5 py-2.5 rounded-xl">
              <ShieldCheck size={14} className="text-[#7DB3FF] shrink-0" />
              <span>Dokumen CV terproteksi. Masukkan kode akses otorisasi yang telah diberikan.</span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="ios-glass-btn px-4 py-2.5 text-xs text-text-secondary hover:text-white cursor-pointer"
              >
                <span>Batal</span>
              </button>
              <button
                id="submit-cv-passcode-btn"
                type="submit"
                disabled={isSubmitting}
                className="ios-glass-btn ios-glass-primary px-5 py-2.5 text-xs font-semibold text-white flex items-center gap-2 cursor-pointer shadow-[0_0_16px_rgba(125,179,255,0.25)] hover:shadow-[0_0_22px_rgba(125,179,255,0.4)] transition-all"
              >
                <span>Verifikasi & Unduh</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 gap-4 text-center relative z-10 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.3)] animate-pulse">
              <Download size={28} />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-base font-semibold text-white">Otorisasi Berhasil</p>
              <p className="text-xs text-[#A8B8CC]">
                Pengunduhan berkas sedang berjalan. Jendela baru akan terbuka.
              </p>
            </div>
            {cvUrl && (
              <a
                href={cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#7DB3FF] hover:underline flex items-center gap-1 mt-1"
              >
                <span>Klik di sini jika unduhan tidak otomatis dimulai</span>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
