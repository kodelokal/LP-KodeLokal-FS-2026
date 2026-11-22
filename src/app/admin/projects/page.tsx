import Link from "next/link";
import { desc } from "drizzle-orm";
import { Plus, Compass, ArrowRight, ExternalLink, Trash2 } from "lucide-react";
import { db } from "@/db";
import { clientProjects } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { PROJECT_STATUS_META, PRIORITY_META, hasPermission } from "@/lib/rbac";
import { createClientProjectAction, deleteClientProjectAction } from "@/actions/projects";

export default async function AdminProjectsPage() {
  const user = await requireAuth();
  const canWrite = hasPermission(user.role, "projects:write");
  const projects = await db
    .select()
    .from(clientProjects)
    .orderBy(desc(clientProjects.updatedAt));

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold tracking-widest text-brand-orange uppercase">
          Manajemen Project Client
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          Daftar Project Klien & Kode Tracking
        </h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Setiap project memiliki kode tracking unik yang bisa dibagikan ke klien melalui{" "}
          <code className="rounded bg-subtle px-1.5 py-0.5 font-mono text-xs">/track</code>.
        </p>
      </div>

      {/* Create New Project Form */}
      {canWrite && (
        <details className="surface-card group rounded-3xl p-6" open={projects.length === 0}>
          <summary className="flex cursor-pointer list-none items-center justify-between text-base font-bold text-ink">
            <span className="inline-flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-brand-orange text-white">
                <Plus className="h-4 w-4" />
              </span>
              Tambah Project Client Baru
            </span>
            <span className="text-xs font-semibold text-brand-blue group-open:hidden">
              Buka Formulir +
            </span>
            <span className="hidden text-xs font-semibold text-ink-muted group-open:inline">
              Tutup −
            </span>
          </summary>

          <form
            action={createClientProjectAction}
            className="mt-6 grid gap-4 border-t border-line pt-5 sm:grid-cols-2 lg:grid-cols-3"
          >
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
              <label className="mb-1 block text-xs font-bold text-ink">
                Kode Tracking (opsional, auto)
              </label>
              <input
                name="trackingCode"
                placeholder="Kosongkan untuk auto KL-2026-XXX"
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
                <option value="UI/UX & Maintenance">UI/UX & Maintenance</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Status Awal</label>
              <select name="status" defaultValue="PLANNING" className="input-field">
                <option value="INQUIRY">Diskusi Awal</option>
                <option value="PLANNING">Perencanaan</option>
                <option value="IN_PROGRESS">Sedang Dikerjakan</option>
                <option value="REVIEW">Review & UAT</option>
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
              <label className="mb-1 block text-xs font-bold text-ink">Nilai Kontrak / Budget</label>
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
              <textarea
                name="notes"
                rows={2}
                placeholder="Ringkasan ruang lingkup atau kebutuhan khusus klien..."
                className="input-field"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <button type="submit" className="btn-primary text-sm">
                <Plus className="h-4 w-4" />
                Simpan Project Client
              </button>
            </div>
          </form>
        </details>
      )}

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
              <Link
                href={`/admin/projects/${p.id}`}
                className="btn-blue px-3.5 py-2 text-xs"
              >
                Kelola & Milestone
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              {canWrite && (
                <form action={deleteClientProjectAction}>
                  <input type="hidden" name="id" value={p.id} />
                  <button
                    type="submit"
                    aria-label={`Hapus project ${p.title}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-line text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
