"use client";

import * as React from "react";
import { Send, Mail, MapPin, MessageCircle, CheckCircle2, Loader2 } from "lucide-react";
import type { SiteSettings, Service } from "@/db/schema";
import { FadeIn } from "@/components/ui/MotionPrimitives";
import { MascotPose } from "@/components/ui/MascotPose";

const BUDGET_OPTIONS = [
  "Di bawah Rp 5 Jt",
  "Rp 5 Jt – Rp 10 Jt",
  "Rp 10 Jt – Rp 25 Jt",
  "Di atas Rp 25 Jt",
  "Belum Ditentukan / Diskusi",
];

export function ContactSection({
  settings,
  services,
}: {
  settings: SiteSettings;
  services: Service[];
}) {
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [form, setForm] = React.useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    serviceInterest: services[0]?.title ?? "Landing Page & Company Profile",
    budgetRange: BUDGET_OPTIONS[1],
    message: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal mengirim permintaan. Silakan periksa kembali isian Anda.");
      } else {
        setSubmitted(true);
        setForm({
          name: "",
          email: "",
          phone: "",
          company: "",
          serviceInterest: services[0]?.title ?? "Landing Page & Company Profile",
          budgetRange: BUDGET_OPTIONS[1],
          message: "",
        });
      }
    } catch {
      setError("Terjadi gangguan jaringan. Silakan coba lagi beberapa saat.");
    } finally {
      setSubmitting(false);
    }
  }

  const waHref = `https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
    "Halo KodeLokal, saya ingin berdiskusi mengenai pembuatan website / aplikasi."
  )}`;

  return (
    <section id="kontak" className="border-t border-line bg-subtle/45 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
          {/* Left Column */}
          <FadeIn className="lg:col-span-5">
            <p className="text-xs font-bold tracking-widest text-brand-orange uppercase">
              Mulai Kolaborasi
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.025em] text-ink sm:text-4xl">
              Punya Ide Project? Mari Wujudkan Bersama KodeLokal.
            </h2>
            <p className="mt-3 text-base leading-relaxed text-ink-secondary">
              Ceritakan kebutuhan website, CMS, atau aplikasi bisnis Anda. Permintaan ini langsung
              tercatat di sistem operasional kami dan akan ditindaklanjuti oleh tim dalam 1×24 jam.
            </p>

            <div className="mt-7 space-y-3.5 text-sm">
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="surface-card flex items-center gap-3.5 rounded-2xl p-4 hover:border-brand-orange"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-brand-orange dark:bg-orange-500/15">
                  <MessageCircle className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-ink-muted">WhatsApp Cepat</p>
                  <p className="font-bold text-ink">+{settings.whatsappNumber}</p>
                </div>
              </a>

              <a
                href={`mailto:${settings.contactEmail}`}
                className="surface-card flex items-center gap-3.5 rounded-2xl p-4 hover:border-brand-blue"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-brand-blue dark:bg-sky-500/15">
                  <Mail className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-ink-muted">Email Resmi</p>
                  <p className="font-bold text-ink">{settings.contactEmail}</p>
                </div>
              </a>

              <div className="surface-card flex items-center gap-3.5 rounded-2xl p-4">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-subtle text-brand-blue">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-ink-muted">Studio</p>
                  <p className="font-medium text-ink">{settings.officeAddress}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 hidden lg:block">
              <MascotPose pose="idea" size={145} bubble="Yuk diskusi ide hebatmu!" />
            </div>
          </FadeIn>

          {/* Right Form Column */}
          <FadeIn delay={0.1} className="lg:col-span-7">
            <div className="surface-card rounded-3xl p-6 sm:p-8">
              {submitted ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <MascotPose pose="yay" size={145} float={false} />
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
                    <CheckCircle2 className="h-4 w-4" />
                    Permintaan Terkirim
                  </div>
                  <h3 className="mt-3 text-2xl font-extrabold text-ink">
                    Terima Kasih! Pesan Anda Sudah Kami Terima.
                  </h3>
                  <p className="mt-2 max-w-md text-sm text-ink-secondary">
                    Tim KodeLokal akan segera meninjau kebutuhan project Anda dan menghubungi lewat
                    email atau WhatsApp yang tercantum.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="btn-secondary mt-6 text-sm"
                  >
                    Kirim Permintaan Lainnya
                  </button>
                </div>
              ) : (
                <form id="contact-inquiry-form" onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="inq-name" className="mb-1.5 block text-xs font-bold text-ink">
                        Nama Lengkap *
                      </label>
                      <input
                        id="inq-name"
                        required
                        type="text"
                        placeholder="Contoh: Budi Santoso"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label htmlFor="inq-email" className="mb-1.5 block text-xs font-bold text-ink">
                        Email *
                      </label>
                      <input
                        id="inq-email"
                        required
                        type="email"
                        placeholder="nama@perusahaan.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="inq-phone" className="mb-1.5 block text-xs font-bold text-ink">
                        No. WhatsApp
                      </label>
                      <input
                        id="inq-phone"
                        type="tel"
                        placeholder="0812xxxxxxxx"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label htmlFor="inq-company" className="mb-1.5 block text-xs font-bold text-ink">
                        Bisnis / Perusahaan
                      </label>
                      <input
                        id="inq-company"
                        type="text"
                        placeholder="Nama brand atau instansi"
                        value={form.company}
                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="inq-service" className="mb-1.5 block text-xs font-bold text-ink">
                        Jenis Layanan
                      </label>
                      <select
                        id="inq-service"
                        value={form.serviceInterest}
                        onChange={(e) => setForm({ ...form, serviceInterest: e.target.value })}
                        className="input-field"
                      >
                        {services.map((s) => (
                          <option key={s.id} value={s.title}>
                            {s.title}
                          </option>
                        ))}
                        <option value="Custom / Konsultasi Umum">Custom / Konsultasi Umum</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="inq-budget" className="mb-1.5 block text-xs font-bold text-ink">
                        Estimasi Budget
                      </label>
                      <select
                        id="inq-budget"
                        value={form.budgetRange}
                        onChange={(e) => setForm({ ...form, budgetRange: e.target.value })}
                        className="input-field"
                      >
                        {BUDGET_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="inq-message" className="mb-1.5 block text-xs font-bold text-ink">
                      Ceritakan Kebutuhan Project Anda *
                    </label>
                    <textarea
                      id="inq-message"
                      required
                      rows={4}
                      placeholder="Jelaskan secara singkat tujuan website/aplikasi, fitur utama yang diinginkan, serta target waktu peluncuran..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="input-field resize-y"
                    />
                  </div>

                  {error && (
                    <div className="rounded-xl bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
                      {error}
                    </div>
                  )}

                  <button
                    id="inq-submit-btn"
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full text-sm disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Mengirim Permintaan...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Kirim Permintaan Konsultasi
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
