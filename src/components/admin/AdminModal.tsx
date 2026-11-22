"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react";

export function AdminModal({
  open,
  onClose,
  title,
  subtitle,
  maxWidth = "max-w-2xl",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  maxWidth?: string;
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, scale: 0.95, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className={`surface-card flex max-h-[90vh] w-full ${maxWidth} flex-col overflow-hidden rounded-3xl`}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-4.5">
              <div>
                <h2 className="text-lg font-extrabold tracking-tight text-ink">{title}</h2>
                {subtitle && <p className="mt-0.5 text-xs text-ink-secondary">{subtitle}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup pop-up"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-line bg-elevated text-ink-secondary transition-colors hover:border-brand-orange hover:text-brand-orange"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="overflow-y-auto px-6 py-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ConfirmDeleteModal({
  open,
  onClose,
  onConfirm,
  loading,
  title = "Konfirmasi Hapus",
  description = "Data yang dihapus tidak dapat dikembalikan. Yakin ingin melanjutkan?",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  title?: string;
  description?: string;
}) {
  return (
    <AdminModal open={open} onClose={loading ? () => {} : onClose} title={title} maxWidth="max-w-md">
      <div className="flex items-start gap-3.5">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <p className="text-sm leading-relaxed text-ink-secondary">{description}</p>
      </div>

      <div className="mt-6 flex items-center justify-end gap-2.5">
        <button
          type="button"
          disabled={loading}
          onClick={onClose}
          className="btn-secondary px-4 py-2 text-xs disabled:opacity-50"
        >
          Batal
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={onConfirm}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-rose-700 disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Menghapus...
            </>
          ) : (
            "Ya, Hapus"
          )}
        </button>
      </div>
    </AdminModal>
  );
}

export type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

export function useAdminToast() {
  const [toast, setToast] = React.useState<ToastState>(null);

  const showToast = React.useCallback((type: "success" | "error", message: string) => {
    setToast({ type, message });
  }, []);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  return { toast, showToast, clearToast: () => setToast(null) };
}

export function AdminToast({ toast, onClose }: { toast: ToastState; onClose: () => void }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.96 }}
          className="fixed right-5 bottom-5 z-50"
        >
          <div
            className={`flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-xs font-bold shadow-xl backdrop-blur-md ${
              toast.type === "success"
                ? "border-emerald-500/30 bg-emerald-600 text-white"
                : "border-rose-500/30 bg-rose-600 text-white"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{toast.message}</span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup notifikasi"
              className="ml-1 rounded-lg p-0.5 opacity-80 hover:bg-white/15 hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
