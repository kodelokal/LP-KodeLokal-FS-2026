"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Mail, Phone, Building2, FolderPlus, Trash2, Loader2 } from "lucide-react";
import type { Inquiry, InquiryStatus } from "@/db/schema";
import { INQUIRY_STATUS_META } from "@/lib/rbac";
import {
  updateInquiryStatusAction,
  convertInquiryToProjectAction,
  deleteInquiryAction,
} from "@/actions/projects";
import {
  ConfirmDeleteModal,
  AdminToast,
  useAdminToast,
} from "@/components/admin/AdminModal";

export function InquiriesManager({
  list,
  canWrite,
  canConvert,
}: {
  list: Inquiry[];
  canWrite: boolean;
  canConvert: boolean;
}) {
  const router = useRouter();
  const { toast, showToast, clearToast } = useAdminToast();

  const [busyStatusId, setBusyStatusId] = React.useState<string | null>(null);
  const [convertingId, setConvertingId] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState<Inquiry | null>(null);
  const [deletingLoading, setDeletingLoading] = React.useState(false);

  async function handleStatusChange(inq: Inquiry, status: InquiryStatus) {
    setBusyStatusId(inq.id);
    try {
      const res = await updateInquiryStatusAction(inq.id, status);
      showToast(res.ok ? "success" : "error", res.message);
      if (res.ok) router.refresh();
    } finally {
      setBusyStatusId(null);
    }
  }

  async function handleConvert(inq: Inquiry) {
    setConvertingId(inq.id);
    try {
      const res = await convertInquiryToProjectAction(inq.id);
      showToast(res.ok ? "success" : "error", res.message);
      if (res.ok) router.refresh();
    } finally {
      setConvertingId(null);
    }
  }

  async function handleConfirmDelete() {
    if (!deleting) return;
    setDeletingLoading(true);
    try {
      const res = await deleteInquiryAction(deleting.id);
      if (res.ok) {
        setDeleting(null);
        showToast("success", res.message);
        router.refresh();
      } else {
        showToast("error", res.message);
      }
    } finally {
      setDeletingLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold tracking-widest text-brand-blue uppercase">
          Prospek &amp; Konsultasi Masuk
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          Inbox Inquiry Landing Page
        </h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Semua pesan dari formulir konsultasi di beranda langsung masuk ke sini dan bisa
          dikonversi 1-klik menjadi Project Client.
        </p>
      </div>

      <div className="space-y-4">
        {list.map((inq) => {
          const isStatusBusy = busyStatusId === inq.id;
          const isConverting = convertingId === inq.id;

          return (
            <div key={inq.id} className="surface-card rounded-3xl p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        INQUIRY_STATUS_META[inq.status].badgeClass
                      }`}
                    >
                      {INQUIRY_STATUS_META[inq.status].label}
                    </span>
                    <span className="rounded-lg bg-subtle px-2.5 py-0.5 text-xs font-semibold text-brand-blue">
                      {inq.serviceInterest}
                    </span>
                    {inq.budgetRange && (
                      <span className="rounded-lg bg-elevated px-2.5 py-0.5 font-mono text-xs text-ink-secondary">
                        {inq.budgetRange}
                      </span>
                    )}
                  </div>

                  <h2 className="mt-2.5 text-lg font-extrabold text-ink">{inq.name}</h2>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-secondary">
                    <span className="inline-flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5 text-brand-blue" />
                      {inq.email}
                    </span>
                    {inq.phone && (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5 text-brand-orange" />
                        {inq.phone}
                      </span>
                    )}
                    {inq.company && (
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5 text-ink-muted" />
                        {inq.company}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {canWrite && (
                    <div className="relative flex items-center gap-1.5">
                      {isStatusBusy && <Loader2 className="h-4 w-4 animate-spin text-brand-blue" />}
                      <select
                        aria-label={`Ubah status inquiry ${inq.name}`}
                        disabled={isStatusBusy}
                        value={inq.status}
                        onChange={(e) => handleStatusChange(inq, e.target.value as InquiryStatus)}
                        className="input-field py-1.5 text-xs disabled:opacity-60"
                      >
                        <option value="NEW">Baru</option>
                        <option value="CONTACTED">Sudah Dihubungi</option>
                        <option value="PROPOSAL">Proposal Dikirim</option>
                        <option value="CONVERTED">Jadi Project</option>
                        <option value="ARCHIVED">Diarsipkan</option>
                      </select>
                    </div>
                  )}

                  {canConvert && inq.status !== "CONVERTED" && (
                    <button
                      type="button"
                      disabled={isConverting}
                      onClick={() => handleConvert(inq)}
                      className="btn-primary px-3.5 py-2 text-xs disabled:opacity-60"
                    >
                      {isConverting ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Mengonversi...
                        </>
                      ) : (
                        <>
                          <FolderPlus className="h-3.5 w-3.5" />
                          Konversi jadi Project
                        </>
                      )}
                    </button>
                  )}

                  {canWrite && (
                    <button
                      type="button"
                      onClick={() => setDeleting(inq)}
                      aria-label={`Hapus inquiry ${inq.name}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line text-rose-600 hover:bg-rose-50 dark:text-rose-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <p className="mt-4 rounded-2xl bg-elevated p-4 text-sm leading-relaxed text-ink">
                {inq.message}
              </p>
            </div>
          );
        })}

        {list.length === 0 && (
          <div className="surface-card rounded-3xl p-10 text-center text-sm text-ink-muted">
            Belum ada pesan konsultasi masuk.
          </div>
        )}
      </div>

      <ConfirmDeleteModal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleConfirmDelete}
        loading={deletingLoading}
        title="Hapus Inquiry?"
        description={`Yakin ingin menghapus pesan konsultasi dari "${deleting?.name ?? ""}"?`}
      />

      <AdminToast toast={toast} onClose={clearToast} />
    </div>
  );
}
