"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Save, Loader2, Star } from "lucide-react";
import type { SiteSettings, Service, Testimonial, Faq } from "@/db/schema";
import {
  updateSiteSettingsAction,
  createServiceAction,
  updateServiceAction,
  deleteServiceAction,
  createTestimonialAction,
  updateTestimonialAction,
  deleteTestimonialAction,
  createFaqAction,
  updateFaqAction,
  deleteFaqAction,
} from "@/actions/cms";
import {
  AdminModal,
  ConfirmDeleteModal,
  AdminToast,
  useAdminToast,
} from "@/components/admin/AdminModal";

type DeleteTarget =
  | { kind: "service"; item: Service }
  | { kind: "testimonial"; item: Testimonial }
  | { kind: "faq"; item: Faq };

export function CmsManager({
  settings,
  services,
  testimonials,
  faqs,
  canWrite,
}: {
  settings: SiteSettings;
  services: Service[];
  testimonials: Testimonial[];
  faqs: Faq[];
  canWrite: boolean;
}) {
  const router = useRouter();
  const { toast, showToast, clearToast } = useAdminToast();

  const [savingSettings, setSavingSettings] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  // Service modals
  const [serviceModal, setServiceModal] = React.useState<"create" | Service | null>(null);
  // Testimonial modals
  const [testimonialModal, setTestimonialModal] = React.useState<"create" | Testimonial | null>(null);
  // FAQ modals
  const [faqModal, setFaqModal] = React.useState<"create" | Faq | null>(null);
  // Unified Delete confirm modal
  const [deleteTarget, setDeleteTarget] = React.useState<DeleteTarget | null>(null);

  const stats =
    settings.stats && settings.stats.length >= 4
      ? settings.stats
      : [
          { value: "25+", label: "Project udah live" },
          { value: "18+", label: "Klien & partner hepi" },
          { value: "99%", label: "Puas & repeat order" },
          { value: "100%", label: "Progres transparan" },
        ];

  async function handleSaveSettings(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const fd = new FormData(e.currentTarget);
      const res = await updateSiteSettingsAction(fd);
      showToast(res.ok ? "success" : "error", res.message);
      if (res.ok) router.refresh();
    } finally {
      setSavingSettings(false);
    }
  }

  async function handleServiceSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData(e.currentTarget);
      const res =
        serviceModal === "create"
          ? await createServiceAction(fd)
          : await updateServiceAction(fd);
      if (res.ok) {
        setServiceModal(null);
        showToast("success", res.message);
        router.refresh();
      } else {
        showToast("error", res.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleTestimonialSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData(e.currentTarget);
      const res =
        testimonialModal === "create"
          ? await createTestimonialAction(fd)
          : await updateTestimonialAction(fd);
      if (res.ok) {
        setTestimonialModal(null);
        showToast("success", res.message);
        router.refresh();
      } else {
        showToast("error", res.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFaqSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData(e.currentTarget);
      const res =
        faqModal === "create" ? await createFaqAction(fd) : await updateFaqAction(fd);
      if (res.ok) {
        setFaqModal(null);
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
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      const res =
        deleteTarget.kind === "service"
          ? await deleteServiceAction(deleteTarget.item.id)
          : deleteTarget.kind === "testimonial"
            ? await deleteTestimonialAction(deleteTarget.item.id)
            : await deleteFaqAction(deleteTarget.item.id);
      if (res.ok) {
        setDeleteTarget(null);
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

      {/* 1. SITE SETTINGS & HERO */}
      <form onSubmit={handleSaveSettings} className="surface-card rounded-3xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-ink">Identitas, Hero, Statistik &amp; Kontak</h2>
          {canWrite && (
            <button
              type="submit"
              disabled={savingSettings}
              className="btn-primary text-xs disabled:opacity-60"
            >
              {savingSettings ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Simpan Pengaturan
                </>
              )}
            </button>
          )}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Nama Brand</label>
            <input name="brandName" defaultValue={settings.brandName} disabled={!canWrite} className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Tagline</label>
            <input name="tagline" defaultValue={settings.tagline} disabled={!canWrite} className="input-field" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-bold text-ink">Judul Utama Hero (H1)</label>
            <input name="heroTitle" defaultValue={settings.heroTitle} disabled={!canWrite} className="input-field" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-bold text-ink">Subjudul Hero</label>
            <textarea
              name="heroSubtitle"
              rows={2}
              defaultValue={settings.heroSubtitle}
              disabled={!canWrite}
              className="input-field"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Teks Tombol Utama</label>
            <input name="heroCtaPrimary" defaultValue={settings.heroCtaPrimary} disabled={!canWrite} className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Teks Tombol Sekunder</label>
            <input name="heroCtaSecondary" defaultValue={settings.heroCtaSecondary} disabled={!canWrite} className="input-field" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-bold text-ink">Deskripsi Singkat Studio (Footer)</label>
            <textarea
              name="aboutDescription"
              rows={2}
              defaultValue={settings.aboutDescription}
              disabled={!canWrite}
              className="input-field"
            />
            <input type="hidden" name="aboutTitle" value={settings.aboutTitle} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">No. WhatsApp (format 628...)</label>
            <input name="whatsappNumber" defaultValue={settings.whatsappNumber} disabled={!canWrite} className="input-field font-mono" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Email Kontak</label>
            <input name="contactEmail" defaultValue={settings.contactEmail} disabled={!canWrite} className="input-field" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-bold text-ink">Alamat / Lokasi Studio</label>
            <input name="officeAddress" defaultValue={settings.officeAddress} disabled={!canWrite} className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Instagram URL</label>
            <input name="instagram" defaultValue={settings.socialLinks?.instagram ?? ""} disabled={!canWrite} className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">GitHub URL</label>
            <input name="github" defaultValue={settings.socialLinks?.github ?? ""} disabled={!canWrite} className="input-field" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-bold text-ink">LinkedIn URL</label>
            <input name="linkedin" defaultValue={settings.socialLinks?.linkedin ?? ""} disabled={!canWrite} className="input-field" />
          </div>
        </div>

        <div className="mt-6 border-t border-line pt-5">
          <p className="text-xs font-bold tracking-wider text-ink-muted uppercase">
            Statistik Ringkasan (4 Kartu)
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((idx) => (
              <div key={idx} className="space-y-2 rounded-2xl bg-elevated p-3">
                <input
                  name={`statValue_${idx}`}
                  defaultValue={stats[idx]?.value ?? ""}
                  disabled={!canWrite}
                  className="input-field font-mono text-sm font-bold"
                />
                <input
                  name={`statLabel_${idx}`}
                  defaultValue={stats[idx]?.label ?? ""}
                  disabled={!canWrite}
                  className="input-field text-xs"
                />
              </div>
            ))}
          </div>
        </div>
      </form>

      {/* 2. SERVICES */}
      <div className="surface-card rounded-3xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-ink">Daftar Layanan ({services.length})</h2>
          {canWrite && (
            <button
              type="button"
              onClick={() => setServiceModal("create")}
              className="btn-blue px-3.5 py-2 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Tambah Layanan
            </button>
          )}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {services.map((srv) => (
            <div
              key={srv.id}
              className="flex flex-col justify-between gap-3 rounded-2xl border border-line bg-elevated/50 p-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-bold text-ink">{srv.title}</p>
                  <span className="shrink-0 rounded-full bg-surface px-2.5 py-0.5 font-mono text-[11px] font-bold text-brand-orange">
                    {srv.startingPrice}
                  </span>
                </div>
                <p className="mt-1 text-xs text-ink-secondary">{srv.shortDescription}</p>
              </div>
              {canWrite && (
                <div className="flex items-center justify-end gap-2 border-t border-line pt-3">
                  <button
                    type="button"
                    onClick={() => setServiceModal(srv)}
                    className="btn-secondary px-3 py-1 text-xs"
                  >
                    <Pencil className="h-3 w-3 text-brand-blue" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget({ kind: "service", item: srv })}
                    aria-label={`Hapus layanan ${srv.title}`}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-surface text-rose-600 hover:bg-rose-50 dark:text-rose-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. TESTIMONIALS & FAQS */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Testimonials */}
        <div className="surface-card rounded-3xl p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-ink">Testimoni ({testimonials.length})</h2>
            {canWrite && (
              <button
                type="button"
                onClick={() => setTestimonialModal("create")}
                className="btn-blue px-3 py-1.5 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                Tambah
              </button>
            )}
          </div>
          <div className="mt-4 space-y-3">
            {testimonials.map((t) => (
              <div key={t.id} className="rounded-2xl border border-line bg-elevated/50 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, Math.max(1, t.rating)) }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-brand-amber text-brand-amber" />
                      ))}
                    </div>
                    <p className="mt-1 text-xs font-bold text-ink">
                      {t.clientName} ·{" "}
                      <span className="font-normal text-ink-secondary">
                        {t.clientRole}, {t.companyName}
                      </span>
                    </p>
                  </div>
                  {canWrite && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setTestimonialModal(t)}
                        aria-label="Edit testimoni"
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-surface text-brand-blue hover:border-brand-blue"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget({ kind: "testimonial", item: t })}
                        aria-label="Hapus testimoni"
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-surface text-rose-500 hover:bg-rose-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-ink-secondary">“{t.quote}”</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="surface-card rounded-3xl p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-ink">FAQ ({faqs.length})</h2>
            {canWrite && (
              <button
                type="button"
                onClick={() => setFaqModal("create")}
                className="btn-blue px-3 py-1.5 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                Tambah
              </button>
            )}
          </div>
          <div className="mt-4 space-y-3">
            {faqs.map((f) => (
              <div key={f.id} className="rounded-2xl border border-line bg-elevated/50 p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-bold text-ink">{f.question}</p>
                  {canWrite && (
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setFaqModal(f)}
                        aria-label="Edit FAQ"
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-surface text-brand-blue hover:border-brand-blue"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget({ kind: "faq", item: f })}
                        aria-label="Hapus FAQ"
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-surface text-rose-500 hover:bg-rose-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-secondary">{f.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SERVICE CREATE/EDIT MODAL */}
      <AdminModal
        open={Boolean(serviceModal)}
        onClose={() => !submitting && setServiceModal(null)}
        title={serviceModal === "create" ? "Tambah Layanan Baru" : "Edit Layanan"}
        maxWidth="max-w-xl"
      >
        {serviceModal && (
          <form
            key={serviceModal === "create" ? "new-srv" : serviceModal.id}
            onSubmit={handleServiceSubmit}
            className="grid gap-4 sm:grid-cols-2"
          >
            {serviceModal !== "create" && <input type="hidden" name="id" value={serviceModal.id} />}
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold text-ink">Nama Layanan *</label>
              <input
                name="title"
                required
                defaultValue={serviceModal === "create" ? "" : serviceModal.title}
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Harga Mulai</label>
              <input
                name="startingPrice"
                defaultValue={serviceModal === "create" ? "Mulai Rp 3,5 Jt" : serviceModal.startingPrice}
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Urutan</label>
              <input
                name="sortOrder"
                type="number"
                defaultValue={serviceModal === "create" ? services.length + 1 : serviceModal.sortOrder}
                className="input-field font-mono"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Ikon</label>
              <select
                name="iconName"
                defaultValue={serviceModal === "create" ? "Code2" : serviceModal.iconName}
                className="input-field"
              >
                <option value="Rocket">Rocket</option>
                <option value="Code2">Code2</option>
                <option value="Layers">Layers</option>
                <option value="Sparkles">Sparkles</option>
                <option value="Globe">Globe</option>
                <option value="Database">Database</option>
                <option value="Smartphone">Smartphone</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Warna Aksen</label>
              <select
                name="accentColor"
                defaultValue={serviceModal === "create" ? "blue" : serviceModal.accentColor}
                className="input-field"
              >
                <option value="blue">Biru KodeLokal</option>
                <option value="orange">Oranye KodeLokal</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold text-ink">Deskripsi Singkat *</label>
              <textarea
                name="shortDescription"
                required
                rows={2}
                defaultValue={serviceModal === "create" ? "" : serviceModal.shortDescription}
                className="input-field"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold text-ink">
                Fitur Unggulan (1 baris per poin)
              </label>
              <textarea
                name="features"
                rows={4}
                defaultValue={
                  serviceModal === "create" ? "" : (serviceModal.features ?? []).join("\n")
                }
                className="input-field text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-line pt-4 sm:col-span-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setServiceModal(null)}
                className="btn-secondary px-4 py-2 text-xs"
              >
                Batal
              </button>
              <button type="submit" disabled={submitting} className="btn-primary px-5 py-2 text-xs">
                {submitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Layanan"
                )}
              </button>
            </div>
          </form>
        )}
      </AdminModal>

      {/* TESTIMONIAL CREATE/EDIT MODAL */}
      <AdminModal
        open={Boolean(testimonialModal)}
        onClose={() => !submitting && setTestimonialModal(null)}
        title={testimonialModal === "create" ? "Tambah Testimoni Baru" : "Edit Testimoni"}
        maxWidth="max-w-lg"
      >
        {testimonialModal && (
          <form
            key={testimonialModal === "create" ? "new-testi" : testimonialModal.id}
            onSubmit={handleTestimonialSubmit}
            className="space-y-4"
          >
            {testimonialModal !== "create" && (
              <input type="hidden" name="id" value={testimonialModal.id} />
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold text-ink">Nama Klien *</label>
                <input
                  name="clientName"
                  required
                  defaultValue={testimonialModal === "create" ? "" : testimonialModal.clientName}
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-ink">Perusahaan *</label>
                <input
                  name="companyName"
                  required
                  defaultValue={testimonialModal === "create" ? "" : testimonialModal.companyName}
                  className="input-field"
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold text-ink">Jabatan</label>
                <input
                  name="clientRole"
                  defaultValue={testimonialModal === "create" ? "Founder" : testimonialModal.clientRole}
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-ink">Rating (1-5)</label>
                <input
                  name="rating"
                  type="number"
                  min={1}
                  max={5}
                  defaultValue={testimonialModal === "create" ? 5 : testimonialModal.rating}
                  className="input-field font-mono"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Kutipan Testimoni *</label>
              <textarea
                name="quote"
                required
                rows={3}
                defaultValue={testimonialModal === "create" ? "" : testimonialModal.quote}
                className="input-field"
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-line pt-4">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setTestimonialModal(null)}
                className="btn-secondary px-4 py-2 text-xs"
              >
                Batal
              </button>
              <button type="submit" disabled={submitting} className="btn-primary px-5 py-2 text-xs">
                {submitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Testimoni"
                )}
              </button>
            </div>
          </form>
        )}
      </AdminModal>

      {/* FAQ CREATE/EDIT MODAL */}
      <AdminModal
        open={Boolean(faqModal)}
        onClose={() => !submitting && setFaqModal(null)}
        title={faqModal === "create" ? "Tambah FAQ Baru" : "Edit FAQ"}
        maxWidth="max-w-lg"
      >
        {faqModal && (
          <form
            key={faqModal === "create" ? "new-faq" : faqModal.id}
            onSubmit={handleFaqSubmit}
            className="space-y-4"
          >
            {faqModal !== "create" && <input type="hidden" name="id" value={faqModal.id} />}
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Pertanyaan *</label>
              <input
                name="question"
                required
                defaultValue={faqModal === "create" ? "" : faqModal.question}
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Jawaban *</label>
              <textarea
                name="answer"
                required
                rows={4}
                defaultValue={faqModal === "create" ? "" : faqModal.answer}
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Urutan</label>
              <input
                name="sortOrder"
                type="number"
                defaultValue={faqModal === "create" ? faqs.length + 1 : faqModal.sortOrder}
                className="input-field font-mono"
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-line pt-4">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setFaqModal(null)}
                className="btn-secondary px-4 py-2 text-xs"
              >
                Batal
              </button>
              <button type="submit" disabled={submitting} className="btn-primary px-5 py-2 text-xs">
                {submitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan FAQ"
                )}
              </button>
            </div>
          </form>
        )}
      </AdminModal>

      {/* UNIFIED DELETE CONFIRM MODAL */}
      <ConfirmDeleteModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        loading={submitting}
        title="Konfirmasi Hapus"
        description={
          deleteTarget?.kind === "service"
            ? `Hapus layanan "${deleteTarget.item.title}" dari landing page?`
            : deleteTarget?.kind === "testimonial"
              ? `Hapus testimoni dari "${deleteTarget.item.clientName}"?`
              : deleteTarget?.kind === "faq"
                ? `Hapus pertanyaan "${deleteTarget.item.question}"?`
                : "Yakin ingin menghapus data ini?"
        }
      />

      <AdminToast toast={toast} onClose={clearToast} />
    </div>
  );
}
