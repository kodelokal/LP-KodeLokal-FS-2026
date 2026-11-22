"use client";

import * as React from "react";
import { Send, Mail, MessageCircle, CheckCircle2, Loader2 } from "lucide-react";
import type { SiteSettings, Service } from "@/db/schema";
import { FadeIn } from "@/components/ui/MotionPrimitives";
import { MascotPose } from "@/components/ui/MascotPose";

export function ContactSection({
  settings,
  services,
}: {
  settings: SiteSettings;
  services: Service[];
}) {
  const serviceChoices = React.useMemo(() => {
    const names = services.map((s) => s.title);
    return names.length > 0
      ? names
      : ["Landing Page", "Aplikasi Web Custom", "E-Commerce", "Sistem & CMS"];
  }, [services]);

  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [form, setForm] = React.useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    serviceInterest: serviceChoices[0],
    budgetRange: "Diskusi bareng mimin",
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
        setError(data.error || "Gagal kirim pesan, cek lagi isiannya ya!");
      } else {
        setSubmitted(true);
        setForm({
          name: "",
          email: "",
          phone: "",
          company: "",
          serviceInterest: serviceChoices[0],
          budgetRange: "Diskusi bareng mimin",
          message: "",
        });
      }
    } catch {
      setError("Lagi ada gangguan jaringan, coba sebentar lagi ya.");
    } finally {
      setSubmitting(false);
    }
  }

  const waHref = `https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
    "Halo mimin KodeLokal! Aku mau tanya-tanya soal bikin website / aplikasi nih."
  )}`;

  return (
    <section
      id="kontak"
      className="relative overflow-hidden bg-[#0b1929] py-20 text-white sm:py-24 dark:border-t dark:border-line dark:bg-[#050d17]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
          {/* Left High-Contrast Editorial Column (matching bilcode.id dark CTA section) */}
          <FadeIn className="flex flex-col justify-between lg:col-span-5">
            <div>
              <h2 className="text-4xl leading-[1.1] font-extrabold tracking-[-0.03em] text-white sm:text-5xl">
                Siap mulai project bareng mimin?{" "}
                <span className="text-brand-orange">Yuk diskusi.</span>
              </h2>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-slate-300 sm:text-base">
                Nggak harus udah mateng banget konsepnya. Spill aja dulu ide atau kendala bisnismu,
                nanti mimin bantu kasih rekomendasi teknis &amp; estimasinya gratis.
              </p>

              <div className="mt-8 hidden sm:block">
                <MascotPose pose="idea" size={125} />
              </div>
            </div>

            <div className="mt-10 space-y-2 border-t border-white/10 pt-6 text-sm">
              <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                Atau Langsung Hubungi Mimin
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1">
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="inline-flex items-center gap-2 font-semibold text-sky-300 hover:text-white"
                >
                  <Mail className="h-4 w-4" />
                  {settings.contactEmail}
                </a>
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-semibold text-orange-300 hover:text-white"
                >
                  <MessageCircle className="h-4 w-4" />
                  +{settings.whatsappNumber}
                </a>
              </div>
            </div>
          </FadeIn>

          {/* Right Dark Form with Pill Service Selector */}
          <FadeIn delay={0.08} className="lg:col-span-7">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
              {submitted ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <MascotPose pose="yay" size={135} float={false} />
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3.5 py-1 text-xs font-bold text-emerald-300">
                    <CheckCircle2 className="h-4 w-4" />
                    Pesan Udah Masuk!
                  </div>
                  <h3 className="mt-3 text-2xl font-extrabold text-white">
                    Mantap! Mimin Segera Kabarin Kamu.
                  </h3>
                  <p className="mt-2 max-w-md text-sm text-slate-300">
                    Detail projectmu udah tercatat di dashboard KodeLokal. Mimin bakal balas lewat
                    email atau WhatsApp maksimal 1×24 jam ya!
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="mt-6 rounded-full border border-white/20 px-5 py-2.5 text-xs font-bold text-white hover:bg-white/10"
                  >
                    Kirim Pesan Lainnya
                  </button>
                </div>
              ) : (
                <form id="contact-inquiry-form" onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="inq-name"
                        className="mb-1.5 block text-[11px] font-bold tracking-wider text-slate-300 uppercase"
                      >
                        Nama Kamu *
                      </label>
                      <input
                        id="inq-name"
                        required
                        type="text"
                        placeholder="Masukkan nama kamu"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full rounded-xl border border-white/12 bg-white/[0.06] px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-brand-blue focus:outline-none"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="inq-email"
                        className="mb-1.5 block text-[11px] font-bold tracking-wider text-slate-300 uppercase"
                      >
                        Email Kamu *
                      </label>
                      <input
                        id="inq-email"
                        required
                        type="email"
                        placeholder="nama@email.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full rounded-xl border border-white/12 bg-white/[0.06] px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-brand-blue focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="inq-phone"
                        className="mb-1.5 block text-[11px] font-bold tracking-wider text-slate-300 uppercase"
                      >
                        No. WhatsApp
                      </label>
                      <input
                        id="inq-phone"
                        type="tel"
                        placeholder="0812xxxxxxxx"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full rounded-xl border border-white/12 bg-white/[0.06] px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-brand-blue focus:outline-none"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="inq-company"
                        className="mb-1.5 block text-[11px] font-bold tracking-wider text-slate-300 uppercase"
                      >
                        Brand / Usaha (opsional)
                      </label>
                      <input
                        id="inq-company"
                        type="text"
                        placeholder="Nama brand / bisnis"
                        value={form.company}
                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                        className="w-full rounded-xl border border-white/12 bg-white/[0.06] px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-brand-blue focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Interactive Service Pill Selector (like bilcode.id) */}
                  <div>
                    <p className="mb-2 text-[11px] font-bold tracking-wider text-slate-300 uppercase">
                      Layanan yang Lagi Dicari
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {serviceChoices.map((choice) => {
                        const selected = form.serviceInterest === choice;
                        return (
                          <button
                            key={choice}
                            type="button"
                            onClick={() => setForm({ ...form, serviceInterest: choice })}
                            className={`rounded-full px-3.5 py-2 text-xs font-bold transition-colors ${
                              selected
                                ? "bg-brand-blue text-white"
                                : "border border-white/15 bg-white/[0.05] text-slate-200 hover:border-brand-orange hover:text-white"
                            }`}
                          >
                            {choice}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="inq-message"
                      className="mb-1.5 block text-[11px] font-bold tracking-wider text-slate-300 uppercase"
                    >
                      Spill Kebutuhan Project Kamu *
                    </label>
                    <textarea
                      id="inq-message"
                      required
                      rows={4}
                      placeholder="Ceritain santai aja — mau bikin website atau aplikasi apa, fitur utama yang diinginkan, dan target waktu..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full resize-y rounded-xl border border-white/12 bg-white/[0.06] px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-brand-blue focus:outline-none"
                    />
                  </div>

                  {error && (
                    <div className="rounded-xl bg-rose-500/20 px-4 py-3 text-xs font-semibold text-rose-200">
                      {error}
                    </div>
                  )}

                  <button
                    id="inq-submit-btn"
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full rounded-full py-3.5 text-sm disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Lagi Dikirim ke Mimin...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Kirim ke Mimin
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
