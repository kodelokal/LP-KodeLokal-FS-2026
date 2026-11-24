"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Code2,
  Palette,
  Database,
  Smartphone,
  ShieldCheck,
  Wallet,
  Clock,
  KanbanSquare,
  Send,
  Search,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Copy,
  Check,
  LogIn,
} from "lucide-react";
import type { ApplicationStatus } from "@/db/schema";
import { APPLICATION_STATUS_META } from "@/lib/rbac";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MascotPose } from "@/components/ui/MascotPose";

const OPEN_SPECIALTIES = [
  {
    name: "Full-Stack Developer",
    stack: "Next.js · TypeScript · PostgreSQL",
    icon: Code2,
    accent: "blue",
  },
  {
    name: "Frontend & UI Engineer",
    stack: "React · Tailwind CSS · Framer Motion",
    icon: Code2,
    accent: "orange",
  },
  {
    name: "UI/UX Designer",
    stack: "Figma · Design System · Prototyping",
    icon: Palette,
    accent: "blue",
  },
  {
    name: "Backend & API Engineer",
    stack: "Node.js · Drizzle · REST/Auth",
    icon: Database,
    accent: "orange",
  },
  {
    name: "Mobile Developer",
    stack: "React Native · Flutter · API",
    icon: Smartphone,
    accent: "blue",
  },
  {
    name: "QA & Testing Specialist",
    stack: "Manual QA · Playwright · Bug Report",
    icon: ShieldCheck,
    accent: "orange",
  },
];

const WORKER_STEPS = [
  {
    num: "01",
    title: "Daftar & Bikin Password",
    desc: "Isi profil, spesialisasi, link GitHub/portofolio, sekaligus tentuin password akun kamu di formulir bawah.",
  },
  {
    num: "02",
    title: "Review Tim CTO & PM",
    desc: "Tim KodeLokal meninjau portofolio & skill kamu. Kalau cocok, mimin hubungin via WhatsApp buat ngobrol singkat.",
  },
  {
    num: "03",
    title: "Akun Worker Langsung Aktif",
    desc: "Begitu disetujui, akun Worker kamu aktif otomatis — tinggal login di /login pakai email & password pendaftaran.",
  },
  {
    num: "04",
    title: "Ambil Milestone & Terima Fee",
    desc: "Kerjakan milestone di Kanban Worker Hub, catat timesheet, dan pantau pencairan komisi secara transparan.",
  },
];

type LookupResult = {
  applicationCode: string;
  name: string;
  specialty: string;
  experienceLevel: string;
  status: ApplicationStatus;
  reviewNote: string | null;
  createdAt: string;
};

export function JoinWorkerClient() {
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    specialty: "Full-Stack Developer",
    experienceLevel: "Mid-Level (1–3 thn)",
    skills: "",
    portfolioUrl: "",
    githubUrl: "",
    linkedinUrl: "",
    expectedHourlyRate: "",
    bio: "",
  });

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [submittedCode, setSubmittedCode] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  // Status check widget
  const [lookupQuery, setLookupQuery] = React.useState("");
  const [lookupLoading, setLookupLoading] = React.useState(false);
  const [lookupError, setLookupError] = React.useState<string | null>(null);
  const [lookupResult, setLookupResult] = React.useState<LookupResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/workers/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          expectedHourlyRate: Number(form.expectedHourlyRate || 0) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal mengirim pendaftaran.");
      } else {
        setSubmittedCode(data.application.applicationCode);
        setLookupQuery(data.application.applicationCode);
      }
    } catch {
      setError("Gagal terhubung ke server. Coba beberapa saat lagi ya.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    if (!lookupQuery.trim()) return;
    setLookupLoading(true);
    setLookupError(null);

    try {
      const res = await fetch(`/api/workers/apply?q=${encodeURIComponent(lookupQuery.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setLookupResult(null);
        setLookupError(data.error || "Data pendaftaran tidak ditemukan.");
      } else {
        setLookupResult(data.application);
      }
    } catch {
      setLookupError("Gagal memeriksa status. Coba lagi ya.");
    } finally {
      setLookupLoading(false);
    }
  }

  function selectSpecialty(name: string) {
    setForm((prev) => ({ ...prev, specialty: name }));
    const el = document.getElementById("daftar-worker");
    el?.scrollIntoView({ behavior: "smooth" });
  }

  async function copyCode() {
    if (!submittedCode) return;
    try {
      await navigator.clipboard.writeText(submittedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  }

  return (
    <div>
      {/* HERO */}
      <section className="hero-backdrop border-b border-line pt-12 pb-16 sm:pt-16 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3.5 py-1 text-xs font-bold text-brand-orange dark:bg-orange-500/20">
                OPEN RECRUITMENT · KODELOKAL WORKER SQUAD
              </span>
              <h1 className="mt-4 text-4xl leading-[1.1] font-extrabold tracking-[-0.035em] text-ink sm:text-5xl">
                Gabung Jadi <span className="text-brand-blue">Worker</span> &amp; Bangun Project
                Klien Bareng <span className="text-brand-orange">KodeLokal.</span>
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-secondary">
                Suka ngoding, desain UI/UX, atau QA secara remote? Yuk masuk ke ekosistem Worker
                KodeLokal! Kerja fleksibel berbasis milestone, alur tugas rapi di Worker Hub, dan
                fee jelas transparan.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a href="#daftar-worker" className="btn-primary rounded-full px-6 text-sm">
                  Daftar Jadi Worker
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a href="#cek-status" className="btn-secondary rounded-full px-5 text-sm">
                  <Search className="h-4 w-4 text-brand-blue" />
                  Cek Status Lamaran
                </a>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-2 py-2 text-xs font-bold text-brand-blue hover:text-brand-orange"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  Sudah jadi Worker? Login
                </Link>
              </div>

              {/* 3 Quick Perks */}
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="surface-card rounded-2xl p-3.5">
                  <KanbanSquare className="h-4 w-4 text-brand-blue" />
                  <p className="mt-2 text-xs font-bold text-ink">Task Board Rapi</p>
                  <p className="mt-0.5 text-[11px] text-ink-secondary">
                    Brief jelas per milestone langsung di Worker Hub.
                  </p>
                </div>
                <div className="surface-card rounded-2xl p-3.5">
                  <Clock className="h-4 w-4 text-brand-orange" />
                  <p className="mt-2 text-xs font-bold text-ink">100% Remote Fleksibel</p>
                  <p className="mt-0.5 text-[11px] text-ink-secondary">
                    Atur ketersediaan (Tersedia / Fokus / Off) sendiri.
                  </p>
                </div>
                <div className="surface-card rounded-2xl p-3.5">
                  <Wallet className="h-4 w-4 text-emerald-500" />
                  <p className="mt-2 text-xs font-bold text-ink">Fee Transparan</p>
                  <p className="mt-0.5 text-[11px] text-ink-secondary">
                    Nominal fee &amp; status pencairan tercatat real-time.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center lg:col-span-5">
              <MascotPose
                pose="coding"
                size={230}
                bubble="Yuk gabung ngoding bareng mimin!"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* OPEN SPECIALTIES */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            watermark="SPESIALISASI"
            titlePrefix="Peran Worker yang"
            titleHighlight="Lagi Dibutuhin"
            highlightColor="blue"
            subtitle="Klik salah satu spesialisasi di bawah buat langsung pilih peran tersebut di formulir pendaftaran."
          />

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {OPEN_SPECIALTIES.map((role) => {
              const Icon = role.icon;
              const isOrange = role.accent === "orange";
              return (
                <button
                  key={role.name}
                  type="button"
                  onClick={() => selectSpecialty(role.name)}
                  className="surface-card surface-card-interactive flex items-start gap-4 rounded-3xl p-5 text-left"
                >
                  <span
                    className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                      isOrange
                        ? "bg-orange-100 text-brand-orange dark:bg-orange-500/15"
                        : "bg-sky-100 text-brand-blue dark:bg-sky-500/15"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-ink">{role.name}</h3>
                    <p className="mt-1 font-mono text-xs text-ink-secondary">{role.stack}</p>
                    <span className="mt-2 inline-block text-xs font-bold text-brand-blue">
                      Daftar Peran Ini →
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4-STEP REGISTRATION FLOW */}
      <section className="border-t border-line bg-subtle/45 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            watermark="ALUR GABUNG"
            titlePrefix="Alur Daftar Jadi"
            titleHighlight="Worker KodeLokal"
            highlightColor="orange"
            subtitle="Dari isi formulir sampai akun Worker aktif & siap terima tugas — semua simpel dan transparan."
          />

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {WORKER_STEPS.map((s) => (
              <div key={s.num} className="surface-card rounded-3xl p-6">
                <span className="font-mono text-2xl font-extrabold text-brand-blue">{s.num}</span>
                <h3 className="mt-3 text-base font-bold text-ink">{s.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-secondary">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REGISTRATION FORM */}
      <section id="daftar-worker" className="border-t border-line py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            watermark="DAFTAR"
            titlePrefix="Formulir Pendaftaran"
            titleHighlight="Worker Baru"
            highlightColor="blue"
            subtitle="Isi data diri dan portofoliomu. Password yang kamu buat di sini akan langsung aktif untuk login begitu lamaran disetujui tim."
          />

          <div className="surface-card mt-10 rounded-3xl p-6 sm:p-10">
            {submittedCode ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-6 text-center"
              >
                <MascotPose pose="yay" size={145} float={false} />
                <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" />
                  Pendaftaran Berhasil Dikirim!
                </span>
                <h3 className="mt-3 text-2xl font-extrabold text-ink">
                  Mantap! Data Kamu Udah Masuk ke Tim KodeLokal.
                </h3>
                <p className="mt-2 max-w-md text-sm text-ink-secondary">
                  Simpan kode pendaftaran di bawah ini untuk memantau status review lamaran kamu
                  kapan saja:
                </p>

                <div className="mt-5 flex items-center gap-2 rounded-2xl border border-line bg-elevated px-5 py-3">
                  <span className="font-mono text-lg font-extrabold text-brand-orange">
                    {submittedCode}
                  </span>
                  <button
                    type="button"
                    onClick={copyCode}
                    className="inline-flex items-center gap-1 rounded-lg bg-surface px-2.5 py-1 text-xs font-bold text-brand-blue hover:bg-subtle"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Disalin" : "Salin"}
                  </button>
                </div>

                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <a href="#cek-status" className="btn-blue text-xs">
                    Cek Status Sekarang
                  </a>
                  <button
                    type="button"
                    onClick={() => setSubmittedCode(null)}
                    className="btn-secondary text-xs"
                  >
                    Daftar Lagi
                  </button>
                </div>
              </motion.div>
            ) : (
              <form id="worker-apply-form" onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="wrk-name" className="mb-1.5 block text-xs font-bold text-ink">
                      Nama Lengkap *
                    </label>
                    <input
                      id="wrk-name"
                      required
                      type="text"
                      placeholder="Contoh: Reza Mahendra"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label htmlFor="wrk-phone" className="mb-1.5 block text-xs font-bold text-ink">
                      No. WhatsApp Aktif *
                    </label>
                    <input
                      id="wrk-phone"
                      required
                      type="tel"
                      placeholder="0812xxxxxxxx"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="wrk-email" className="mb-1.5 block text-xs font-bold text-ink">
                      Email (untuk login Worker Hub nanti) *
                    </label>
                    <input
                      id="wrk-email"
                      required
                      type="email"
                      placeholder="kamu@email.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label htmlFor="wrk-pass" className="mb-1.5 block text-xs font-bold text-ink">
                      Buat Password Akun (min. 8 karakter) *
                    </label>
                    <input
                      id="wrk-pass"
                      required
                      minLength={8}
                      type="password"
                      placeholder="Minimal 8 karakter"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label htmlFor="wrk-spec" className="mb-1.5 block text-xs font-bold text-ink">
                      Spesialisasi Utama *
                    </label>
                    <select
                      id="wrk-spec"
                      value={form.specialty}
                      onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                      className="input-field"
                    >
                      {OPEN_SPECIALTIES.map((s) => (
                        <option key={s.name} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="wrk-exp" className="mb-1.5 block text-xs font-bold text-ink">
                      Level Pengalaman
                    </label>
                    <select
                      id="wrk-exp"
                      value={form.experienceLevel}
                      onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}
                      className="input-field"
                    >
                      <option value="Junior (< 1 thn)">Junior (&lt; 1 thn)</option>
                      <option value="Mid-Level (1–3 thn)">Mid-Level (1–3 thn)</option>
                      <option value="Senior (3+ thn)">Senior (3+ thn)</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="wrk-rate" className="mb-1.5 block text-xs font-bold text-ink">
                      Rate Harapan / Jam (Rp)
                    </label>
                    <input
                      id="wrk-rate"
                      type="number"
                      min={0}
                      placeholder="75000 (opsional)"
                      value={form.expectedHourlyRate}
                      onChange={(e) => setForm({ ...form, expectedHourlyRate: e.target.value })}
                      className="input-field font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="wrk-skills" className="mb-1.5 block text-xs font-bold text-ink">
                    Skill / Tech Stack Utama (pisahkan dengan koma) *
                  </label>
                  <input
                    id="wrk-skills"
                    required
                    type="text"
                    placeholder="Next.js, TypeScript, Tailwind CSS, PostgreSQL, Figma"
                    value={form.skills}
                    onChange={(e) => setForm({ ...form, skills: e.target.value })}
                    className="input-field font-mono text-sm"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label htmlFor="wrk-github" className="mb-1.5 block text-xs font-bold text-ink">
                      Link GitHub
                    </label>
                    <input
                      id="wrk-github"
                      type="text"
                      placeholder="https://github.com/..."
                      value={form.githubUrl}
                      onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label htmlFor="wrk-port" className="mb-1.5 block text-xs font-bold text-ink">
                      Link Portofolio / Behance
                    </label>
                    <input
                      id="wrk-port"
                      type="text"
                      placeholder="https://..."
                      value={form.portfolioUrl}
                      onChange={(e) => setForm({ ...form, portfolioUrl: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label htmlFor="wrk-li" className="mb-1.5 block text-xs font-bold text-ink">
                      Link LinkedIn
                    </label>
                    <input
                      id="wrk-li"
                      type="text"
                      placeholder="https://linkedin.com/in/..."
                      value={form.linkedinUrl}
                      onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="wrk-bio" className="mb-1.5 block text-xs font-bold text-ink">
                    Ceritakan Pengalaman &amp; Project Terbaikmu *
                  </label>
                  <textarea
                    id="wrk-bio"
                    required
                    rows={4}
                    placeholder="Ceritain santai aja — project apa yang pernah kamu bangun, peranmu di sana, dan jam kerja fleksibel yang cocok buatmu..."
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    className="input-field resize-y"
                  />
                </div>

                {error && (
                  <div className="rounded-xl bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
                    {error}
                  </div>
                )}

                <button
                  id="wrk-submit-btn"
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full rounded-full py-3.5 text-sm disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Mengirim Pendaftaran...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Kirim Pendaftaran Worker
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* CHECK APPLICATION STATUS */}
      <section id="cek-status" className="border-t border-line bg-subtle/45 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <p className="text-xs font-bold tracking-widest text-brand-blue uppercase">
            Status Pendaftaran
          </p>
          <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Sudah Daftar? Cek Status Lamaran Kamu
          </h2>
          <p className="mt-2 text-sm text-ink-secondary">
            Masukkan Kode Pendaftaran (mis.{" "}
            <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs font-bold text-brand-orange">
              WRK-2026-XXXX
            </code>
            ) atau email yang kamu gunakan saat mendaftar.
          </p>

          <form
            onSubmit={handleLookup}
            className="surface-card mt-6 flex flex-col gap-3 rounded-2xl p-3 sm:flex-row"
          >
            <input
              type="text"
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
              placeholder="Kode WRK-2026-... atau email kamu"
              className="input-field flex-1"
            />
            <button
              type="submit"
              disabled={lookupLoading}
              className="btn-blue shrink-0 text-xs disabled:opacity-60"
            >
              {lookupLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Cek Status
            </button>
          </form>

          {lookupError && (
            <p className="mt-4 text-xs font-semibold text-rose-600 dark:text-rose-400">
              {lookupError}
            </p>
          )}

          {lookupResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="surface-card mt-6 rounded-3xl p-6 text-left"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-brand-blue">
                  {lookupResult.applicationCode}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    APPLICATION_STATUS_META[lookupResult.status].badgeClass
                  }`}
                >
                  {APPLICATION_STATUS_META[lookupResult.status].label}
                </span>
              </div>
              <h3 className="mt-2.5 text-lg font-extrabold text-ink">{lookupResult.name}</h3>
              <p className="text-xs font-semibold text-brand-orange">
                {lookupResult.specialty} · {lookupResult.experienceLevel}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
                {lookupResult.reviewNote || APPLICATION_STATUS_META[lookupResult.status].desc}
              </p>

              {lookupResult.status === "APPROVED" && (
                <div className="mt-5 border-t border-line pt-4">
                  <Link href="/login" className="btn-primary text-xs">
                    <LogIn className="h-4 w-4" />
                    Masuk ke Ruang Kerja Worker (/login)
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
