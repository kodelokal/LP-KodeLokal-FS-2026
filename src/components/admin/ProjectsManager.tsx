"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Compass, ArrowRight, ExternalLink, Pencil, Trash2, Loader2 } from "lucide-react";
import type { ClientProject } from "@/db/schema";
import { PROJECT_STATUS_META, PRIORITY_META } from "@/lib/rbac";
import {
  createClientProjectAction,
  updateClientProjectAction,
  deleteClientProjectAction,
} from "@/actions/projects";
import {
  AdminModal,
  ConfirmDeleteModal,
  AdminToast,
  useAdminToast,
} from "@/components/admin/AdminModal";

export function ProjectsManager({
  projects,
  canWrite,
}: {
  projects: ClientProject[];
  canWrite: boolean;
}) {
  const router = useRouter();
  const { toast, showToast, clearToast } = useAdminToast();

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ClientProject | null>(null);
  const [deleting, setDeleting] = React.useState<ClientProject | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData(e.currentTarget);
      const res = await createClientProjectAction(fd);
      if (res.ok) {
        setCreateOpen(false);
        showToast("success", res.message);
        router.refresh();
      } else {
        showToast("error", res.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData(e.currentTarget);
      const res = await updateClientProjectAction(fd);
      if (res.ok) {
        setEditing(null);
        showToast("success", res.message);
        router.refresh();
      } else {
        showToast("error", res.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleting) return;
    setSubmitting(true);
    try {
      const res = await deleteClientProjectAction(deleting.id);
      if (res.ok) {
        setDeleting(null);
        showToast("success", res.message);
        router.refresh();
      } else {
        showToast("error", res.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold tracking-widest text-brand-orange uppercase">
            Manajemen Project Client
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Daftar Project Klien &amp; Kode Tracking
          </h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Setiap project memiliki kode tracking unik untuk dipantau klien di{" "}
            <code className="rounded bg-subtle px-1.5 py-0.5 font-mono text-xs">/track</code>.
          </p>
        </div>

        {canWrite && (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="btn-primary shrink-0 text-sm"
          >
            <Plus className="h-4 w-4" />
            Tambah Project Client
          </button>
        )}
      </div>

      {/* Projects List */}
      <div className="grid gap-4">
        {projects.map((p) => (
          <div
            key={p.id}
            className="surface-card flex flex-col justify-between gap-5 rounded-3xl p-6 md:flex-row md:items-center"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-subtle px-2.5 py-1 font-mono text-xs font-bold text-brand-blue">
                  <Compass className="h-3.5 w-3.5" />
                  {p.trackingCode}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    PROJECT_STATUS_META[p.status].badgeClass
                  }`}
                >
                  {PROJECT_STATUS_META[p.status].label}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    PRIORITY_META[p.priority].badgeClass
                  }`}
                >
                  Prioritas: {PRIORITY_META[p.priority].label}
                </span>
              </div>

              <h2 className="mt-2.5 text-lg font-extrabold text-ink">{p.title}</h2>
              <p className="mt-0.5 text-xs text-ink-secondary">
                {p.clientName}
                {p.clientCompany ? ` · ${p.clientCompany}` : ""} · {p.serviceCategory}
                {p.budget ? ` · ${p.budget}` : ""}
                {p.dueDate ? ` · Target: ${p.dueDate}` : ""}
              </p>

              <div className="mt-3 max-w-md">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-ink-muted">Progress</span>
                  <span className="font-mono font-bold text-brand-orange">{p.progress}%</span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full rounded-full bg-brand-orange"
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/track?code=${encodeURIComponent(p.trackingCode)}`}
                target="_blank"
                className="btn-secondary px-3 py-2 text-xs"
              >
                <ExternalLink className="h-3.5 w-3.5 text-brand-blue" />
                Link Klien
              </Link>
              {canWrite && (
                <button
                  type="button"
                  onClick={() => setEditing(p)}
                  className="btn-secondary px-3 py-2 text-xs"
                >
                  <Pencil className="h-3.5 w-3.5 text-brand-orange" />
                  Edit
                </button>
              )}
              <Link href={`/admin/projects/${p.id}`} className="btn-blue px-3.5 py-2 text-xs">
                Milestone
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              {canWrite && (
                <button
                  type="button"
                  onClick={() => setDeleting(p)}
                  aria-label={`Hapus project ${p.title}`}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-line text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <div className="surface-card rounded-3xl p-10 text-center text-sm text-ink-muted">
            Belum ada project client. Klik tombol &ldquo;Tambah Project Client&rdquo; di atas.
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      <AdminModal
        open={createOpen}
        onClose={() => !submitting && setCreateOpen(false)}
        title="Tambah Project Client Baru"
        subtitle="Kode tracking otomatis dibuat jika dibiarkan kosong."
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-bold text-ink">Nama Project *</label>
            <input
              name="title"
              required
              placeholder="Contoh: Aplikasi Kasir & Katalog Toko Berkah"
              className="input-field"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Kode Tracking (opsional)</label>
            <input
              name="trackingCode"
              placeholder="Auto KL-2026-XXX"
              className="input-field font-mono uppercase"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Nama Klien *</label>
            <input name="clientName" required placeholder="Nama PIC klien" className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Email Klien *</label>
            <input
              name="clientEmail"
              type="email"
              required
              placeholder="klien@perusahaan.com"
              className="input-field"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Perusahaan / Brand</label>
            <input name="clientCompany" placeholder="PT / CV / Brand" className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Kategori Layanan</label>
            <select name="serviceCategory" className="input-field">
              <option value="Landing Page">Landing Page</option>
              <option value="Web App">Web App</option>
              <option value="E-Commerce">E-Commerce</option>
              <option value="Sistem Informasi">Sistem Informasi</option>
              <option value="UI/UX & Maintenance">UI/UX &amp; Maintenance</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Status Awal</label>
            <select name="status" defaultValue="PLANNING" className="input-field">
              <option value="INQUIRY">Diskusi Awal</option>
              <option value="PLANNING">Perencanaan</option>
              <option value="IN_PROGRESS">Sedang Dikerjakan</option>
              <option value="REVIEW">Review &amp; UAT</option>
              <option value="COMPLETED">Selesai</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Prioritas</label>
            <select name="priority" defaultValue="MEDIUM" className="input-field">
              <option value="LOW">Rendah</option>
              <option value="MEDIUM">Normal</option>
              <option value="HIGH">Tinggi</option>
              <option value="URGENT">Mendesak</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Budget / Kontrak</label>
            <input name="budget" placeholder="Rp 10.000.000" className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Target Selesai</label>
            <input name="dueDate" type="date" className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">URL Preview Staging</label>
            <input name="stagingUrl" type="url" placeholder="https://..." className="input-field" />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="mb-1 block text-xs font-bold text-ink">Catatan Internal</label>
            <textarea name="notes" rows={2} className="input-field" />
          </div>
          <div className="flex justify-end gap-2 border-t border-line pt-4 sm:col-span-2 lg:col-span-3">
            <button
              type="button"
              disabled={submitting}
              onClick={() => setCreateOpen(false)}
              className="btn-secondary px-4 py-2 text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary px-5 py-2 text-xs disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Project"
              )}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* EDIT MODAL */}
      <AdminModal
        open={Boolean(editing)}
        onClose={() => !submitting && setEditing(null)}
        title="Edit Project Client"
        subtitle={editing ? `Kode Tracking: ${editing.trackingCode}` : undefined}
        maxWidth="max-w-3xl"
      >
        {editing && (
          <form key={editing.id} onSubmit={handleUpdate} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <input type="hidden" name="id" value={editing.id} />
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="mb-1 block text-xs font-bold text-ink">Nama Project *</label>
              <input name="title" required defaultValue={editing.title} className="input-field" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Nama Klien *</label>
              <input name="clientName" required defaultValue={editing.clientName} className="input-field" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Email Klien *</label>
              <input name="clientEmail" type="email" required defaultValue={editing.clientEmail} className="input-field" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Perusahaan</label>
              <input name="clientCompany" defaultValue={editing.clientCompany ?? ""} className="input-field" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Status</label>
              <select name="status" defaultValue={editing.status} className="input-field">
                <option value="INQUIRY">Diskusi Awal</option>
                <option value="PLANNING">Perencanaan</option>
                <option value="IN_PROGRESS">Sedang Dikerjakan</option>
                <option value="REVIEW">Review &amp; UAT</option>
                <option value="COMPLETED">Selesai</option>
                <option value="ON_HOLD">Ditunda</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Prioritas</label>
              <select name="priority" defaultValue={editing.priority} className="input-field">
                <option value="LOW">Rendah</option>
                <option value="MEDIUM">Normal</option>
                <option value="HIGH">Tinggi</option>
                <option value="URGENT">Mendesak</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Progress (%)</label>
              <input name="progress" type="number" min={0} max={100} defaultValue={editing.progress} className="input-field font-mono" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Budget</label>
              <input name="budget" defaultValue={editing.budget ?? ""} className="input-field" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Target Selesai</label>
              <input name="dueDate" type="date" defaultValue={editing.dueDate ?? ""} className="input-field" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">URL Staging</label>
              <input name="stagingUrl" type="url" defaultValue={editing.stagingUrl ?? ""} className="input-field" />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="mb-1 block text-xs font-bold text-ink">Catatan</label>
              <textarea name="notes" rows={2} defaultValue={editing.notes ?? ""} className="input-field" />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 sm:col-span-2 lg:col-span-3">
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-ink">
                <input
                  type="checkbox"
                  name="isPublicTracking"
                  defaultChecked={editing.isPublicTracking}
                  className="h-4 w-4 accent-brand-blue"
                />
                Aktifkan Tracking Publik (/track)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setEditing(null)}
                  className="btn-secondary px-4 py-2 text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary px-5 py-2 text-xs disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Perubahan"
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </AdminModal>

      {/* DELETE MODAL */}
      <ConfirmDeleteModal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleConfirmDelete}
        loading={submitting}
        title="Hapus Project Client?"
        description={`Project "${deleting?.title ?? ""}" beserta seluruh milestone-nya akan dihapus permanen.`}
      />

      <AdminToast toast={toast} onClose={clearToast} />
    </div>
  );
}
