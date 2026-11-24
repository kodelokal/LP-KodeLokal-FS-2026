"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Clock,
  CircleDashed,
  Loader2,
} from "lucide-react";
import type { ClientProject, ProjectMilestone, TaskStatus, UserRole } from "@/db/schema";
import { PROJECT_STATUS_META, PRIORITY_META, TASK_STATUS_META, formatRupiah } from "@/lib/rbac";
import {
  updateClientProjectAction,
  createMilestoneAction,
  updateMilestoneAction,
  updateMilestoneStatusAction,
  deleteMilestoneAction,
} from "@/actions/projects";
import {
  AdminModal,
  ConfirmDeleteModal,
  AdminToast,
  useAdminToast,
} from "@/components/admin/AdminModal";

export function ProjectDetailManager({
  project,
  milestones,
  workers = [],
  canWrite,
}: {
  project: ClientProject;
  milestones: ProjectMilestone[];
  workers?: { id: string; name: string; role: UserRole }[];
  canWrite: boolean;
}) {
  const router = useRouter();
  const { toast, showToast, clearToast } = useAdminToast();
  const workerNameById = React.useMemo(
    () => new Map(workers.map((w) => [w.id, w.name])),
    [workers]
  );

  const [editProjectOpen, setEditProjectOpen] = React.useState(false);
  const [addMilestoneOpen, setAddMilestoneOpen] = React.useState(false);
  const [editingMilestone, setEditingMilestone] = React.useState<ProjectMilestone | null>(null);
  const [deletingMilestone, setDeletingMilestone] = React.useState<ProjectMilestone | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [busyMilestoneId, setBusyMilestoneId] = React.useState<string | null>(null);

  async function handleUpdateProject(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData(e.currentTarget);
      const res = await updateClientProjectAction(fd);
      if (res.ok) {
        setEditProjectOpen(false);
        showToast("success", res.message);
        router.refresh();
      } else {
        showToast("error", res.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddMilestone(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData(e.currentTarget);
      const res = await createMilestoneAction(fd);
      if (res.ok) {
        setAddMilestoneOpen(false);
        showToast("success", res.message);
        router.refresh();
      } else {
        showToast("error", res.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEditMilestone(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData(e.currentTarget);
      const res = await updateMilestoneAction(fd);
      if (res.ok) {
        setEditingMilestone(null);
        showToast("success", res.message);
        router.refresh();
      } else {
        showToast("error", res.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleQuickStatus(m: ProjectMilestone, nextStatus: TaskStatus) {
    setBusyMilestoneId(m.id);
    try {
      const res = await updateMilestoneStatusAction(m.id, project.id, nextStatus);
      showToast(res.ok ? "success" : "error", res.message);
      if (res.ok) router.refresh();
    } finally {
      setBusyMilestoneId(null);
    }
  }

  async function handleDeleteMilestone() {
    if (!deletingMilestone) return;
    setSubmitting(true);
    try {
      const res = await deleteMilestoneAction(deletingMilestone.id, project.id);
      if (res.ok) {
        setDeletingMilestone(null);
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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/projects"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-blue hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali ke Daftar Project
          </Link>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-ink">{project.title}</h1>
          <p className="mt-1 text-xs text-ink-secondary">
            Kode Tracking:{" "}
            <span className="font-mono font-bold text-brand-orange">{project.trackingCode}</span> ·
            Klien: {project.clientName} ({project.clientEmail})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/track?code=${encodeURIComponent(project.trackingCode)}`}
            target="_blank"
            className="btn-secondary text-xs"
          >
            <ExternalLink className="h-4 w-4 text-brand-blue" />
            Halaman Tracking Klien
          </Link>
          {canWrite && (
            <button
              type="button"
              onClick={() => setEditProjectOpen(true)}
              className="btn-blue text-xs"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit Info Project
            </button>
          )}
        </div>
      </div>

      {/* Project Overview Summary Card */}
      <div className="surface-card rounded-3xl p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              PROJECT_STATUS_META[project.status].badgeClass
            }`}
          >
            {PROJECT_STATUS_META[project.status].label}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              PRIORITY_META[project.priority].badgeClass
            }`}
          >
            Prioritas: {PRIORITY_META[project.priority].label}
          </span>
          {project.dueDate && (
            <span className="rounded-full bg-subtle px-3 py-1 font-mono text-xs text-ink-secondary">
              Target: {project.dueDate}
            </span>
          )}
          {project.budget && (
            <span className="rounded-full bg-subtle px-3 py-1 font-mono text-xs font-bold text-ink">
              {project.budget}
            </span>
          )}
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-ink-secondary">Progress Keseluruhan</span>
            <span className="font-mono text-sm font-extrabold text-brand-orange">
              {project.progress}%
            </span>
          </div>
          <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-brand-orange transition-all duration-300"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        {project.notes && (
          <p className="mt-4 rounded-2xl bg-elevated p-3.5 text-xs leading-relaxed text-ink-secondary">
            {project.notes}
          </p>
        )}
      </div>

      {/* Milestones Card */}
      <div className="surface-card rounded-3xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-ink">
              Milestone &amp; Deliverable ({milestones.length})
            </h2>
            <p className="text-xs text-ink-secondary">
              Mengubah status milestone otomatis menghitung ulang persentase progress project.
            </p>
          </div>
          {canWrite && (
            <button
              type="button"
              onClick={() => setAddMilestoneOpen(true)}
              className="btn-primary px-4 py-2 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Tambah Milestone
            </button>
          )}
        </div>

        <div className="mt-5 space-y-3">
          {milestones.map((m) => {
            const isBusy = busyMilestoneId === m.id;
            return (
              <div
                key={m.id}
                className="flex flex-col justify-between gap-3 rounded-2xl border border-line bg-elevated/50 p-4 sm:flex-row sm:items-center"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {isBusy ? (
                      <Loader2 className="h-5 w-5 animate-spin text-brand-blue" />
                    ) : m.status === "DONE" ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : m.status === "IN_PROGRESS" || m.status === "REVIEW" ? (
                      <Clock className="h-5 w-5 text-brand-orange" />
                    ) : (
                      <CircleDashed className="h-5 w-5 text-ink-muted" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ink">{m.title}</p>
                    {m.description && <p className="text-xs text-ink-secondary">{m.description}</p>}
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          TASK_STATUS_META[m.status].badgeClass
                        }`}
                      >
                        {TASK_STATUS_META[m.status].label}
                      </span>
                      {m.assigneeId && workerNameById.has(m.assigneeId) && (
                        <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-brand-blue dark:bg-sky-500/20">
                          Worker: {workerNameById.get(m.assigneeId)}
                        </span>
                      )}
                      {m.feeAmount > 0 && (
                        <span className="font-mono text-[11px] font-bold text-brand-orange">
                          {formatRupiah(m.feeAmount)}
                        </span>
                      )}
                      {m.dueDate && (
                        <span className="font-mono text-[11px] text-ink-muted">
                          Target: {m.dueDate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {canWrite && (
                  <div className="flex items-center gap-2">
                    <select
                      aria-label={`Ubah status ${m.title}`}
                      disabled={isBusy}
                      value={m.status}
                      onChange={(e) => handleQuickStatus(m, e.target.value as TaskStatus)}
                      className="input-field py-1.5 text-xs disabled:opacity-60"
                    >
                      <option value="TODO">Menunggu</option>
                      <option value="IN_PROGRESS">Dikerjakan</option>
                      <option value="REVIEW">Review</option>
                      <option value="DONE">Selesai</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => setEditingMilestone(m)}
                      aria-label={`Edit milestone ${m.title}`}
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-brand-blue hover:border-brand-blue"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingMilestone(m)}
                      aria-label={`Hapus milestone ${m.title}`}
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-rose-600 hover:bg-rose-50 dark:text-rose-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {milestones.length === 0 && (
            <p className="py-6 text-center text-sm text-ink-muted">
              Belum ada milestone. Klik &ldquo;Tambah Milestone&rdquo; untuk memulai.
            </p>
          )}
        </div>
      </div>

      {/* EDIT PROJECT MODAL */}
      <AdminModal
        open={editProjectOpen}
        onClose={() => !submitting && setEditProjectOpen(false)}
        title="Edit Informasi Project"
        subtitle={`Kode Tracking: ${project.trackingCode}`}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleUpdateProject} className="grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="id" value={project.id} />
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-bold text-ink">Nama Project *</label>
            <input name="title" required defaultValue={project.title} className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Status</label>
            <select name="status" defaultValue={project.status} className="input-field">
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
            <select name="priority" defaultValue={project.priority} className="input-field">
              <option value="LOW">Rendah</option>
              <option value="MEDIUM">Normal</option>
              <option value="HIGH">Tinggi</option>
              <option value="URGENT">Mendesak</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Progress (%)</label>
            <input
              name="progress"
              type="number"
              min={0}
              max={100}
              defaultValue={project.progress}
              className="input-field font-mono"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Target Selesai</label>
            <input name="dueDate" type="date" defaultValue={project.dueDate ?? ""} className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">URL Staging</label>
            <input name="stagingUrl" type="url" defaultValue={project.stagingUrl ?? ""} className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">URL Repository GitHub</label>
            <input name="repositoryUrl" type="url" defaultValue={project.repositoryUrl ?? ""} className="input-field" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-bold text-ink">Catatan</label>
            <textarea name="notes" rows={3} defaultValue={project.notes ?? ""} className="input-field" />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 sm:col-span-2">
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-ink">
              <input
                type="checkbox"
                name="isPublicTracking"
                defaultChecked={project.isPublicTracking}
                className="h-4 w-4 accent-brand-blue"
              />
              Pelacakan Publik Aktif
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setEditProjectOpen(false)}
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
      </AdminModal>

      {/* ADD MILESTONE MODAL */}
      <AdminModal
        open={addMilestoneOpen}
        onClose={() => !submitting && setAddMilestoneOpen(false)}
        title="Tambah Milestone Baru"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleAddMilestone} className="space-y-4">
          <input type="hidden" name="projectId" value={project.id} />
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Judul Milestone *</label>
            <input name="title" required placeholder="Contoh: Integrasi Payment Gateway" className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Deskripsi (opsional)</label>
            <textarea name="description" rows={2} className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Tugaskan ke Worker (opsional)</label>
            <select name="assigneeId" defaultValue="" className="input-field">
              <option value="">— Belum Ditugaskan —</option>
              {workers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.role})
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Status</label>
              <select name="status" defaultValue="TODO" className="input-field">
                <option value="TODO">Menunggu</option>
                <option value="IN_PROGRESS">Dikerjakan</option>
                <option value="REVIEW">Review</option>
                <option value="DONE">Selesai</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Target Tanggal</label>
              <input name="dueDate" type="date" className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Fee Worker (Rp)</label>
              <input name="feeAmount" type="number" min={0} defaultValue={0} className="input-field font-mono" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Estimasi Jam</label>
              <input name="estimatedHours" type="number" min={0} defaultValue={0} className="input-field font-mono" />
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <button
              type="button"
              disabled={submitting}
              onClick={() => setAddMilestoneOpen(false)}
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
                  Menambahkan...
                </>
              ) : (
                "Simpan Milestone"
              )}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* EDIT MILESTONE MODAL */}
      <AdminModal
        open={Boolean(editingMilestone)}
        onClose={() => !submitting && setEditingMilestone(null)}
        title="Edit Milestone"
        maxWidth="max-w-lg"
      >
        {editingMilestone && (
          <form key={editingMilestone.id} onSubmit={handleEditMilestone} className="space-y-4">
            <input type="hidden" name="id" value={editingMilestone.id} />
            <input type="hidden" name="projectId" value={project.id} />
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Judul Milestone *</label>
              <input
                name="title"
                required
                defaultValue={editingMilestone.title}
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Deskripsi</label>
              <textarea
                name="description"
                rows={2}
                defaultValue={editingMilestone.description ?? ""}
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Tugaskan ke Worker</label>
              <select
                name="assigneeId"
                defaultValue={editingMilestone.assigneeId ?? ""}
                className="input-field"
              >
                <option value="">— Belum Ditugaskan —</option>
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.role})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-bold text-ink">Status</label>
                <select name="status" defaultValue={editingMilestone.status} className="input-field">
                  <option value="TODO">Menunggu</option>
                  <option value="IN_PROGRESS">Dikerjakan</option>
                  <option value="REVIEW">Review</option>
                  <option value="DONE">Selesai</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-ink">Target Tanggal</label>
                <input
                  name="dueDate"
                  type="date"
                  defaultValue={editingMilestone.dueDate ?? ""}
                  className="input-field"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-bold text-ink">Fee Worker (Rp)</label>
                <input
                  name="feeAmount"
                  type="number"
                  min={0}
                  defaultValue={editingMilestone.feeAmount}
                  className="input-field font-mono"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-ink">Estimasi Jam</label>
                <input
                  name="estimatedHours"
                  type="number"
                  min={0}
                  defaultValue={editingMilestone.estimatedHours}
                  className="input-field font-mono"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-line pt-4">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setEditingMilestone(null)}
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
          </form>
        )}
      </AdminModal>

      {/* DELETE MILESTONE MODAL */}
      <ConfirmDeleteModal
        open={Boolean(deletingMilestone)}
        onClose={() => setDeletingMilestone(null)}
        onConfirm={handleDeleteMilestone}
        loading={submitting}
        title="Hapus Milestone?"
        description={`Yakin ingin menghapus milestone "${deletingMilestone?.title ?? ""}"? Persentase progress project akan dihitung ulang otomatis.`}
      />

      <AdminToast toast={toast} onClose={clearToast} />
    </div>
  );
}
