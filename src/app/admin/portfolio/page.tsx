import Image from "next/image";
import { asc, desc } from "drizzle-orm";
import { Plus, Eye, EyeOff, Trash2 } from "lucide-react";
import { db } from "@/db";
import { portfolios } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import {
  createPortfolioAction,
  togglePortfolioPublishAction,
  deletePortfolioAction,
} from "@/actions/portfolio";

export default async function AdminPortfolioPage() {
  const user = await requireAuth();
  const canWrite = hasPermission(user.role, "portfolio:write");

  const items = await db
    .select()
    .from(portfolios)
    .orderBy(asc(portfolios.sortOrder), desc(portfolios.projectYear));

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold tracking-widest text-brand-blue uppercase">CMS Portofolio</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          Kelola Hasil Portofolio KodeLokal
        </h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Tambahkan atau perbarui studi kasus yang tampil pada bagian Portofolio di halaman depan.
        </p>
      </div>

      {canWrite && (
        <details className="surface-card group rounded-3xl p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between text-base font-bold text-ink">
            <span className="inline-flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-brand-blue text-white">
                <Plus className="h-4 w-4" />
              </span>
              Tambah Karya Portofolio Baru
            </span>
            <span className="text-xs font-semibold text-brand-blue group-open:hidden">
              Buka Formulir +
            </span>
            <span className="hidden text-xs font-semibold text-ink-muted group-open:inline">
              Tutup −
            </span>
          </summary>

          <form
            action={createPortfolioAction}
            className="mt-6 grid gap-4 border-t border-line pt-5 sm:grid-cols-2"
          >
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
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">URL Gambar Cover</label>
              <input
                name="imageUrl"
                defaultValue="/portfolio/kriya-commerce.jpg"
                placeholder="/portfolio/... atau https://..."
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">URL Live / Demo</label>
              <input name="liveUrl" type="url" placeholder="https://..." className="input-field" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold text-ink">
                Galeri Gambar Tambahan untuk Halaman Detail (opsional, 1 URL per baris)
              </label>
              <textarea
                name="galleryImages"
                rows={2}
                placeholder={"/portfolio/showcase-devices.jpg\n/portfolio/showcase-tablet.jpg"}
                className="input-field font-mono text-xs"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold text-ink">
                Tech Stack (pisahkan dengan koma)
              </label>
              <input
                name="techStack"
                placeholder="Next.js, TypeScript, Tailwind CSS, Neon PostgreSQL"
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
            <div className="flex items-center justify-between sm:col-span-2">
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-ink">
                <input type="checkbox" name="featured" defaultChecked className="h-4 w-4 accent-brand-orange" />
                Tandai sebagai Portofolio Unggulan
              </label>
              <button type="submit" className="btn-primary text-sm">
                <Plus className="h-4 w-4" />
                Publikasikan Portofolio
              </button>
            </div>
          </form>
        </details>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        {items.map((item) => (
          <div key={item.id} className="surface-card overflow-hidden rounded-3xl">
            <div className="relative aspect-[16/9] w-full bg-elevated">
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              <span
                className={`absolute top-3 left-3 rounded-lg px-2.5 py-1 text-xs font-bold ${
                  item.isPublished
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-800/85 text-slate-200"
                }`}
              >
                {item.isPublished ? "Terpublikasi" : "Draft"}
              </span>
            </div>
            <div className="p-5">
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
                className="mt-1 block text-lg font-bold text-ink hover:text-brand-blue"
              >
                {item.title} ↗
              </a>
              <p className="mt-1.5 line-clamp-2 text-xs text-ink-secondary">{item.summary}</p>

              {canWrite && (
                <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                  <form action={togglePortfolioPublishAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="current" value={String(item.isPublished)} />
                    <button type="submit" className="btn-secondary px-3 py-1.5 text-xs">
                      {item.isPublished ? (
                        <>
                          <EyeOff className="h-3.5 w-3.5" />
                          Sembunyikan
                        </>
                      ) : (
                        <>
                          <Eye className="h-3.5 w-3.5 text-brand-blue" />
                          Publikasikan
                        </>
                      )}
                    </button>
                  </form>
                  <form action={deletePortfolioAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <button
                      type="submit"
                      aria-label={`Hapus portofolio ${item.title}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
