"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Eye, EyeOff, Trash2, Loader2, ExternalLink } from "lucide-react";
import type { Portfolio } from "@/db/schema";
import {
  createPortfolioAction,
  updatePortfolioAction,
  togglePortfolioPublishAction,
  deletePortfolioAction,
} from "@/actions/portfolio";
import {
  AdminModal,
  ConfirmDeleteModal,
  AdminToast,
  useAdminToast,
} from "@/components/admin/AdminModal";
import {
  CloudinarySingleUpload,
  CloudinaryMultiUpload,
} from "@/components/admin/CloudinaryImageUpload";

export function PortfolioManager({
  items,
  canWrite,
}: {
  items: Portfolio[];
  canWrite: boolean;
}) {
  const router = useRouter();
  const { toast, showToast, clearToast } = useAdminToast();

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Portfolio | null>(null);
  const [deleting, setDeleting] = React.useState<Portfolio | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData(e.currentTarget);
      const res = await createPortfolioAction(fd);
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
      const res = await updatePortfolioAction(fd);
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

  async function handleTogglePublish(item: Portfolio) {
    setBusyId(item.id);
    try {
      const res = await togglePortfolioPublishAction(item.id, item.isPublished, item.slug);
      showToast(res.ok ? "success" : "error", res.message);
      if (res.ok) router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function handleConfirmDelete() {
    if (!deleting) return;
    setSubmitting(true);
    try {
      const res = await deletePortfolioAction(deleting.id);
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
          <p className="text-xs font-bold tracking-widest text-brand-blue uppercase">
            CMS Portofolio · Cloudinary Storage
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Kelola Hasil Portofolio KodeLokal
          </h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Tambah, edit lengkap, dan unggah galeri studi kasus ke Cloudinary untuk halaman{" "}
            <code className="rounded bg-subtle px-1.5 py-0.5 font-mono text-xs">
              /portfolio/[slug]
            </code>
            .
          </p>
        </div>

        {canWrite && (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="btn-primary shrink-0 text-sm"
          >
            <Plus className="h-4 w-4" />
            Tambah Portofolio
          </button>
        )}
      </div>

      {/* Portfolio Cards Grid */}
      <div className="grid gap-5 md:grid-cols-2">
        {items.map((item) => {
          const isBusy = busyId === item.id;
          return (
            <div key={item.id} className="surface-card flex flex-col overflow-hidden rounded-3xl">
              <div className="relative aspect-[16/9] w-full bg-elevated">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                      item.isPublished
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-800/85 text-slate-200"
                    }`}
                  >
                    {item.isPublished ? "Terpublikasi" : "Draft"}
                  </span>
                  <span className="rounded-lg bg-slate-900/75 px-2.5 py-1 font-mono text-[11px] font-semibold text-white">
                    {(item.galleryImages ?? []).length + 1} foto
                  </span>
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs text-ink-secondary">
                    <span className="font-semibold text-brand-orange">{item.clientName}</span>
                    <span className="font-mono">
                      {item.category} · {item.projectYear}
                    </span>
                  </div>

                  <a
                    href={`/portfolio/${item.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1.5 text-lg font-bold text-ink hover:text-brand-blue"
                  >
                    {item.title}
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
                  </a>

                  <p className="mt-1.5 line-clamp-2 text-xs text-ink-secondary">{item.summary}</p>

                  {(item.techStack ?? []).length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {item.techStack.slice(0, 4).map((t) => (
                        <span
                          key={t}
                          className="rounded-md bg-subtle px-2 py-0.5 font-mono text-[10px] font-medium text-ink-secondary"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {canWrite && (
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditing(item)}
                        className="btn-blue px-3 py-1.5 text-xs"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleTogglePublish(item)}
                        className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-60"
                      >
                        {isBusy ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-blue" />
                            Memproses...
                          </>
                        ) : item.isPublished ? (
                          <>
                            <EyeOff className="h-3.5 w-3.5" />
                            Jadikan Draft
                          </>
                        ) : (
                          <>
                            <Eye className="h-3.5 w-3.5 text-brand-blue" />
                            Publikasikan
                          </>
                        )}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setDeleting(item)}
                      aria-label={`Hapus portofolio ${item.title}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE MODAL */}
      <AdminModal
        open={createOpen}
        onClose={() => !submitting && setCreateOpen(false)}
        title="Tambah Karya Portofolio Baru"
        subtitle="Isi detail karya & upload gambar cover + galeri langsung ke Cloudinary."
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Judul Karya *</label>
            <input
              name="title"
              required
              placeholder="Contoh: Sistem ERP & Gudang PT Nusantara"
              className="input-field"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Nama Klien *</label>
            <input name="clientName" required placeholder="Nama klien / brand" className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Kategori</label>
            <select name="category" className="input-field">
              <option value="Web App">Web App</option>
              <option value="Landing Page">Landing Page</option>
              <option value="E-Commerce">E-Commerce</option>
              <option value="Sistem Informasi">Sistem Informasi</option>
              <option value="Mobile App">Mobile App</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Tahun Project</label>
            <input name="projectYear" type="number" defaultValue={2026} className="input-field font-mono" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-bold text-ink">
              Gambar Cover Utama (Cloudinary) *
            </label>
            <CloudinarySingleUpload
              name="imageUrl"
              folder="portfolio"
              label="Upload Cover Portofolio"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-bold text-ink">
              Galeri Gambar Tambahan (Cloudinary — tampil di /portfolio/[slug])
            </label>
            <CloudinaryMultiUpload name="galleryImages" folder="portfolio" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">URL Live / Demo</label>
            <input name="liveUrl" type="url" placeholder="https://..." className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">
              Tech Stack (pisahkan dengan koma)
            </label>
            <input
              name="techStack"
              placeholder="Next.js, TypeScript, Tailwind CSS, Neon DB"
              className="input-field font-mono text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-bold text-ink">Ringkasan Singkat *</label>
            <input
              name="summary"
              required
              placeholder="1-2 kalimat singkat untuk kartu portofolio"
              className="input-field"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-bold text-ink">Deskripsi Studi Kasus</label>
            <textarea
              name="description"
              rows={3}
              placeholder="Ceritakan tantangan klien, solusi yang dibangun KodeLokal, dan dampaknya..."
              className="input-field"
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 sm:col-span-2">
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-ink">
              <input type="checkbox" name="featured" defaultChecked className="h-4 w-4 accent-brand-orange" />
              Portofolio Unggulan
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setCreateOpen(false)}
                className="btn-secondary px-4 py-2 text-xs"
              >
                Batal
              </button>
              <button type="submit" disabled={submitting} className="btn-primary px-5 py-2 text-xs disabled:opacity-60">
                {submitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5" />
                    Simpan Portofolio
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </AdminModal>

      {/* EDIT MODAL */}
      <AdminModal
        open={Boolean(editing)}
        onClose={() => !submitting && setEditing(null)}
        title="Edit Portofolio"
        subtitle={editing ? `Memperbarui studi kasus: ${editing.title}` : undefined}
        maxWidth="max-w-3xl"
      >
        {editing && (
          <form key={editing.id} onSubmit={handleUpdate} className="grid gap-4 sm:grid-cols-2">
            <input type="hidden" name="id" value={editing.id} />
            <input type="hidden" name="slug" value={editing.slug} />

            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Judul Karya *</label>
              <input name="title" required defaultValue={editing.title} className="input-field" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Nama Klien *</label>
              <input
                name="clientName"
                required
                defaultValue={editing.clientName}
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Kategori</label>
              <select name="category" defaultValue={editing.category} className="input-field">
                <option value="Web App">Web App</option>
                <option value="Landing Page">Landing Page</option>
                <option value="E-Commerce">E-Commerce</option>
                <option value="Sistem Informasi">Sistem Informasi</option>
                <option value="Mobile App">Mobile App</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-bold text-ink">Tahun</label>
                <input
                  name="projectYear"
                  type="number"
                  defaultValue={editing.projectYear}
                  className="input-field font-mono"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-ink">Urutan</label>
                <input
                  name="sortOrder"
                  type="number"
                  defaultValue={editing.sortOrder}
                  className="input-field font-mono"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-bold text-ink">
                Gambar Cover Utama (Cloudinary)
              </label>
              <CloudinarySingleUpload
                name="imageUrl"
                folder="portfolio"
                defaultValue={editing.imageUrl}
                label="Ganti Cover"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-bold text-ink">
                Galeri Gambar Tambahan (Cloudinary)
              </label>
              <CloudinaryMultiUpload
                name="galleryImages"
                folder="portfolio"
                defaultValues={editing.galleryImages ?? []}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-ink">URL Live / Demo</label>
              <input
                name="liveUrl"
                type="url"
                defaultValue={editing.liveUrl ?? ""}
                placeholder="https://..."
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">
                Tech Stack (pisahkan dengan koma)
              </label>
              <input
                name="techStack"
                defaultValue={(editing.techStack ?? []).join(", ")}
                className="input-field font-mono text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold text-ink">Ringkasan Singkat *</label>
              <input name="summary" required defaultValue={editing.summary} className="input-field" />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold text-ink">Deskripsi Studi Kasus</label>
              <textarea
                name="description"
                rows={4}
                defaultValue={editing.description}
                className="input-field"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 sm:col-span-2">
              <div className="flex flex-wrap items-center gap-4">
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-ink">
                  <input
                    type="checkbox"
                    name="featured"
                    defaultChecked={editing.featured}
                    className="h-4 w-4 accent-brand-orange"
                  />
                  Unggulan
                </label>
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-ink">
                  <input
                    type="checkbox"
                    name="isPublished"
                    defaultChecked={editing.isPublished}
                    className="h-4 w-4 accent-brand-blue"
                  />
                  Terpublikasi
                </label>
              </div>
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

      {/* DELETE CONFIRM MODAL */}
      <ConfirmDeleteModal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleConfirmDelete}
        loading={submitting}
        title="Hapus Portofolio?"
        description={`Yakin ingin menghapus portofolio "${deleting?.title ?? ""}"? Halaman detailnya tidak akan bisa diakses lagi.`}
      />

      <AdminToast toast={toast} onClose={clearToast} />
    </div>
  );
}
