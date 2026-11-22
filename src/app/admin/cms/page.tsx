import { asc } from "drizzle-orm";
import { Plus, Trash2, Save } from "lucide-react";
import { db } from "@/db";
import { services, testimonials, faqs } from "@/db/schema";
import { getLandingPageData } from "@/lib/data";
import { requireAuth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import {
  updateSiteSettingsAction,
  createServiceAction,
  deleteServiceAction,
  createTestimonialAction,
  deleteTestimonialAction,
  createFaqAction,
  deleteFaqAction,
} from "@/actions/cms";

export default async function AdminCmsPage() {
  const user = await requireAuth();
  const canWrite = hasPermission(user.role, "cms:write");

  const [landing, allServices, allTestimonials, allFaqs] = await Promise.all([
    getLandingPageData(),
    db.select().from(services).orderBy(asc(services.sortOrder)),
    db.select().from(testimonials).orderBy(asc(testimonials.sortOrder)),
    db.select().from(faqs).orderBy(asc(faqs.sortOrder)),
  ]);

  const s = landing.settings;
  const stats =
    s.stats && s.stats.length >= 4
      ? s.stats
      : [
          { value: "25+", label: "Project Terselesaikan" },
          { value: "18+", label: "Klien & Mitra Aktif" },
          { value: "99%", label: "Kepuasan Klien" },
          { value: "100%", label: "Transparansi Progress" },
        ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold tracking-widest text-brand-orange uppercase">
          Content Management System
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          Kelola Konten Landing Page
        </h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Perubahan yang disimpan di sini langsung memperbarui tampilan publik di{" "}
          <span className="font-mono font-semibold text-ink">kodelokal.store</span>.
        </p>
      </div>

      {/* 1. Site Settings & Hero */}
      <form action={updateSiteSettingsAction} className="surface-card rounded-3xl p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-ink">Identitas, Hero, Statistik & Kontak</h2>
          {canWrite && (
            <button type="submit" className="btn-primary text-xs">
              <Save className="h-4 w-4" />
              Simpan Pengaturan
            </button>
          )}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Nama Brand</label>
            <input name="brandName" defaultValue={s.brandName} disabled={!canWrite} className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Tagline</label>
            <input name="tagline" defaultValue={s.tagline} disabled={!canWrite} className="input-field" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-bold text-ink">Judul Utama Hero (H1)</label>
            <input name="heroTitle" defaultValue={s.heroTitle} disabled={!canWrite} className="input-field" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-bold text-ink">Subjudul Hero</label>
            <textarea
              name="heroSubtitle"
              rows={2}
              defaultValue={s.heroSubtitle}
              disabled={!canWrite}
              className="input-field"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Teks Tombol Utama</label>
            <input name="heroCtaPrimary" defaultValue={s.heroCtaPrimary} disabled={!canWrite} className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Teks Tombol Sekunder</label>
            <input name="heroCtaSecondary" defaultValue={s.heroCtaSecondary} disabled={!canWrite} className="input-field" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-bold text-ink">Deskripsi Singkat Studio (Footer)</label>
            <textarea
              name="aboutDescription"
              rows={2}
              defaultValue={s.aboutDescription}
              disabled={!canWrite}
              className="input-field"
            />
            <input type="hidden" name="aboutTitle" value={s.aboutTitle} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">No. WhatsApp (format 628...)</label>
            <input name="whatsappNumber" defaultValue={s.whatsappNumber} disabled={!canWrite} className="input-field font-mono" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Email Kontak</label>
            <input name="contactEmail" defaultValue={s.contactEmail} disabled={!canWrite} className="input-field" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-bold text-ink">Alamat / Lokasi Studio</label>
            <input name="officeAddress" defaultValue={s.officeAddress} disabled={!canWrite} className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Instagram URL</label>
            <input name="instagram" defaultValue={s.socialLinks?.instagram ?? ""} disabled={!canWrite} className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">GitHub URL</label>
            <input name="github" defaultValue={s.socialLinks?.github ?? ""} disabled={!canWrite} className="input-field" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-bold text-ink">LinkedIn URL</label>
            <input name="linkedin" defaultValue={s.socialLinks?.linkedin ?? ""} disabled={!canWrite} className="input-field" />
          </div>
        </div>

        {/* 4 Hero Stats */}
        <div className="mt-6 border-t border-line pt-5">
          <p className="text-xs font-bold tracking-wider text-ink-muted uppercase">
            Statistik Ringkasan Hero (4 Kartu)
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((idx) => (
              <div key={idx} className="rounded-2xl bg-elevated p-3 space-y-2">
                <input
                  name={`statValue_${idx}`}
                  defaultValue={stats[idx]?.value ?? ""}
                  disabled={!canWrite}
                  placeholder="25+"
                  className="input-field font-mono text-sm font-bold"
                />
                <input
                  name={`statLabel_${idx}`}
                  defaultValue={stats[idx]?.label ?? ""}
                  disabled={!canWrite}
                  placeholder="Label statistik"
                  className="input-field text-xs"
                />
              </div>
            ))}
          </div>
        </div>
      </form>

      {/* 2. Services Manager */}
      <div className="surface-card rounded-3xl p-6">
        <h2 className="text-lg font-bold text-ink">Daftar Layanan ({allServices.length})</h2>

        {canWrite && (
          <form
            action={createServiceAction}
            className="mt-4 grid gap-3 rounded-2xl border border-line bg-elevated/60 p-4 sm:grid-cols-2"
          >
            <input name="title" required placeholder="Nama Layanan *" className="input-field text-sm" />
            <input name="startingPrice" placeholder="Mulai Rp 3,5 Jt" className="input-field text-sm" />
            <input
              name="shortDescription"
              required
              placeholder="Deskripsi singkat layanan *"
              className="input-field text-sm sm:col-span-2"
            />
            <textarea
              name="features"
              rows={2}
              placeholder="Fitur unggulan (1 baris per poin)"
              className="input-field text-xs sm:col-span-2"
            />
            <select name="iconName" className="input-field text-xs">
              <option value="Rocket">Ikon: Rocket</option>
              <option value="Code2">Ikon: Code2</option>
              <option value="Layers">Ikon: Layers</option>
              <option value="Sparkles">Ikon: Sparkles</option>
              <option value="Globe">Ikon: Globe</option>
              <option value="Database">Ikon: Database</option>
            </select>
            <div className="flex gap-2">
              <select name="accentColor" className="input-field text-xs">
                <option value="blue">Aksen Biru</option>
                <option value="orange">Aksen Oranye</option>
              </select>
              <button type="submit" className="btn-blue shrink-0 px-4 text-xs">
                <Plus className="h-4 w-4" />
                Tambah
              </button>
            </div>
          </form>
        )}

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {allServices.map((srv) => (
            <div
              key={srv.id}
              className="flex items-start justify-between gap-3 rounded-2xl border border-line bg-surface p-4"
            >
              <div>
                <p className="text-sm font-bold text-ink">{srv.title}</p>
                <p className="font-mono text-xs text-brand-orange">{srv.startingPrice}</p>
                <p className="mt-1 text-xs text-ink-secondary">{srv.shortDescription}</p>
              </div>
              {canWrite && (
                <form action={deleteServiceAction}>
                  <input type="hidden" name="id" value={srv.id} />
                  <button
                    type="submit"
                    aria-label={`Hapus layanan ${srv.title}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line text-rose-600 hover:bg-rose-50 dark:text-rose-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Testimonials & FAQs */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Testimonials */}
        <div className="surface-card rounded-3xl p-6">
          <h2 className="text-lg font-bold text-ink">Testimoni ({allTestimonials.length})</h2>
          {canWrite && (
            <form action={createTestimonialAction} className="mt-4 space-y-2.5 rounded-2xl bg-elevated/60 p-4">
              <div className="grid gap-2.5 sm:grid-cols-2">
                <input name="clientName" required placeholder="Nama Klien *" className="input-field text-xs" />
                <input name="companyName" required placeholder="Perusahaan *" className="input-field text-xs" />
              </div>
              <input name="clientRole" placeholder="Jabatan (mis. Founder)" className="input-field text-xs" />
              <textarea name="quote" required rows={2} placeholder="Kutipan testimoni *" className="input-field text-xs" />
              <button type="submit" className="btn-blue text-xs">
                <Plus className="h-3.5 w-3.5" />
                Tambah Testimoni
              </button>
            </form>
          )}
          <div className="mt-4 space-y-2.5">
            {allTestimonials.map((t) => (
              <div key={t.id} className="flex items-start justify-between gap-2 rounded-2xl border border-line p-3.5">
                <div>
                  <p className="text-xs font-bold text-ink">
                    {t.clientName} · <span className="font-normal text-ink-secondary">{t.companyName}</span>
                  </p>
                  <p className="mt-1 text-xs text-ink-secondary">“{t.quote}”</p>
                </div>
                {canWrite && (
                  <form action={deleteTestimonialAction}>
                    <input type="hidden" name="id" value={t.id} />
                    <button type="submit" className="text-rose-500 hover:text-rose-700" aria-label="Hapus testimoni">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="surface-card rounded-3xl p-6">
          <h2 className="text-lg font-bold text-ink">FAQ ({allFaqs.length})</h2>
          {canWrite && (
            <form action={createFaqAction} className="mt-4 space-y-2.5 rounded-2xl bg-elevated/60 p-4">
              <input name="question" required placeholder="Pertanyaan *" className="input-field text-xs" />
              <textarea name="answer" required rows={2} placeholder="Jawaban *" className="input-field text-xs" />
              <button type="submit" className="btn-blue text-xs">
                <Plus className="h-3.5 w-3.5" />
                Tambah FAQ
              </button>
            </form>
          )}
          <div className="mt-4 space-y-2.5">
            {allFaqs.map((f) => (
              <div key={f.id} className="flex items-start justify-between gap-2 rounded-2xl border border-line p-3.5">
                <div>
                  <p className="text-xs font-bold text-ink">{f.question}</p>
                  <p className="mt-1 text-xs text-ink-secondary">{f.answer}</p>
                </div>
                {canWrite && (
                  <form action={deleteFaqAction}>
                    <input type="hidden" name="id" value={f.id} />
                    <button type="submit" className="text-rose-500 hover:text-rose-700" aria-label="Hapus FAQ">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
