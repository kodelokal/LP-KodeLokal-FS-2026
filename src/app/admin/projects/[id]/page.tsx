import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { ArrowLeft, ExternalLink, Plus, Trash2, CheckCircle2, Clock, CircleDashed } from "lucide-react";
import { db } from "@/db";
import { clientProjects, projectMilestones } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { hasPermission, TASK_STATUS_META } from "@/lib/rbac";
import {
  updateClientProjectAction,
  createMilestoneAction,
  updateMilestoneStatusAction,
  deleteMilestoneAction,
} from "@/actions/projects";

export default async function AdminProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAuth();
  const canWrite = hasPermission(user.role, "projects:write");
  const { id } = await params;

  const [project] = await db
    .select()
    .from(clientProjects)
    .where(eq(clientProjects.id, id))
    .limit(1);

  if (!project) notFound();

  const milestones = await db
    .select()
    .from(projectMilestones)
    .where(eq(projectMilestones.projectId, project.id))
    .orderBy(asc(projectMilestones.sortOrder), asc(projectMilestones.createdAt));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/projects"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-blue hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali ke Daftar Project
          </Link>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-ink">
            {project.title}
          </h1>
          <p className="mt-1 text-xs text-ink-secondary">
            Kode Tracking:{" "}
            <span className="font-mono font-bold text-brand-orange">{project.trackingCode}</span> ·
            Klien: {project.clientName} ({project.clientEmail})
          </p>
        </div>

        <Link
          href={`/track?code=${encodeURIComponent(project.trackingCode)}`}
          target="_blank"
          className="btn-secondary text-xs"
        >
          <ExternalLink className="h-4 w-4 text-brand-blue" />
          Buka Halaman Tracking Klien
        </Link>
      </div>

      {/* Edit Project Metadata */}
      <form action={updateClientProjectAction} className="surface-card rounded-3xl p-6">
        <input type="hidden" name="id" value={project.id} />
        <h2 className="text-base font-bold text-ink">Status & Informasi Project</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Status</label>
            <select name="status" defaultValue={project.status} className="input-field" disabled={!canWrite}>
              <option value="INQUIRY">Diskusi Awal</option>
              <option value="PLANNING">Perencanaan</option>
              <option value="IN_PROGRESS">Sedang Dikerjakan</option>
              <option value="REVIEW">Review & UAT</option>
              <option value="COMPLETED">Selesai</option>
              <option value="ON_HOLD">Ditunda</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Prioritas</label>
            <select name="priority" defaultValue={project.priority} className="input-field" disabled={!canWrite}>
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
              disabled={!canWrite}
              className="input-field font-mono"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Target Selesai</label>
            <input
              name="dueDate"
              type="date"
              defaultValue={project.dueDate ?? ""}
              disabled={!canWrite}
              className="input-field"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-bold text-ink">URL Preview Staging</label>
            <input
              name="stagingUrl"
              type="url"
              defaultValue={project.stagingUrl ?? ""}
              disabled={!canWrite}
              placeholder="https://preview.kodelokal.store"
              className="input-field"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-bold text-ink">URL Repository GitHub</label>
            <input
              name="repositoryUrl"
              type="url"
              defaultValue={project.repositoryUrl ?? ""}
              disabled={!canWrite}
              placeholder="https://github.com/kodelokal/..."
              className="input-field"
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <label className="mb-1 block text-xs font-bold text-ink">Catatan Project</label>
            <textarea
              name="notes"
              rows={2}
              defaultValue={project.notes ?? ""}
              disabled={!canWrite}
              className="input-field"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-ink">
            <input
              type="checkbox"
              name="isPublicTracking"
              defaultChecked={project.isPublicTracking}
              disabled={!canWrite}
              className="h-4 w-4 rounded accent-brand-blue"
            />
            Aktifkan Pelacakan Publik di /track
          </label>
          {canWrite && (
            <button type="submit" className="btn-primary text-xs">
              Simpan Perubahan Project
            </button>
          )}
        </div>
      </form>

      {/* Milestones Section */}
      <div className="surface-card rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-ink">
              Milestone & Deliverable ({milestones.length})
            </h2>
            <p className="text-xs text-ink-secondary">
              Mengubah status milestone otomatis menghitung ulang persentase progress project.
            </p>
          </div>
        </div>

        {/* Add Milestone */}
        {canWrite && (
          <form
            action={createMilestoneAction}
            className="mt-5 grid gap-3 rounded-2xl border border-line bg-elevated/60 p-4 sm:grid-cols-12"
          >
            <input type="hidden" name="projectId" value={project.id} />
            <div className="sm:col-span-5">
              <input
                name="title"
                required
                placeholder="Judul milestone baru..."
                className="input-field text-sm"
              />
            </div>
            <div className="sm:col-span-4">
              <input
                name="description"
                placeholder="Deskripsi singkat (opsional)"
                className="input-field text-sm"
              />
            </div>
            <div className="sm:col-span-3 flex gap-2">
              <input name="dueDate" type="date" className="input-field text-xs" />
              <button type="submit" className="btn-blue shrink-0 px-3 text-xs">
                <Plus className="h-4 w-4" />
                Tambah
              </button>
            </div>
          </form>
        )}

        {/* Milestone Rows */}
        <div className="mt-5 space-y-3">
          {milestones.map((m) => (
            <div
              key={m.id}
              className="flex flex-col justify-between gap-3 rounded-2xl border border-line bg-surface p-4 sm:flex-row sm:items-center"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {m.status === "DONE" ? (
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
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        TASK_STATUS_META[m.status].badgeClass
                      }`}
                    >
                      {TASK_STATUS_META[m.status].label}
                    </span>
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
                  <form action={updateMilestoneStatusAction} className="flex items-center gap-1.5">
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="projectId" value={project.id} />
                    <select
                      name="status"
                      defaultValue={m.status}
                      className="input-field py-1.5 text-xs"
                    >
                      <option value="TODO">Menunggu</option>
                      <option value="IN_PROGRESS">Dikerjakan</option>
                      <option value="REVIEW">Review</option>
                      <option value="DONE">Selesai</option>
                    </select>
                    <button type="submit" className="btn-secondary px-2.5 py-1.5 text-xs">
                      Update
                    </button>
                  </form>
                  <form action={deleteMilestoneAction}>
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="projectId" value={project.id} />
                    <button
                      type="submit"
                      aria-label="Hapus milestone"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
