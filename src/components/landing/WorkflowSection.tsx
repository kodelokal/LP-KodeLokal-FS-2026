"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, ArrowRight, CheckCircle2 } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";

const WORKFLOW_STEPS = [
  {
    step: "01",
    shortLabel: "Spill Ide",
    badge: "Tahap 01 · Discovery",
    title: "Ngobrol Santai & Petain Kebutuhan",
    description:
      "Nggak perlu pakai bahasa teknis yang ribet. Ceritain aja tujuan bisnismu ke mimin, nanti kita bantu susun daftar fitur, struktur halaman, estimasi waktu, dan biayanya di awal.",
    bullets: [
      "Konsultasi gratis langsung sama tim teknis",
      "Rincian fitur & timeline jelas dari hari pertama",
      "Transparan tanpa biaya dadakan di tengah jalan",
    ],
    mascot: "idea",
    statusLabel: "Diskusi & Scope Terkunci",
    progress: 25,
  },
  {
    step: "02",
    shortLabel: "Desain UI",
    badge: "Tahap 02 · Desain",
    title: "Bikin Tampilan yang Pas Sama Brand Kamu",
    description:
      "Sebelum masuk ke tahap ngoding, tim desain nyiapin preview tampilan desktop & mobile biar kamu bisa lihat langsung nuansa warna, tata letak, dan alurnya.",
    bullets: [
      "Responsif rapi di HP, tablet, dan laptop",
      "Support Light Mode & Dark Mode bila dibutuhkan",
      "Revisi tampilan sampai kamu beneran sreg",
    ],
    mascot: "thinking",
    statusLabel: "Desain UI/UX Disetujui",
    progress: 50,
  },
  {
    step: "03",
    shortLabel: "Ngoding & Pantau",
    badge: "Tahap 03 · Development",
    title: "Mimin Ngoding, Kamu Pantau Real-Time",
    description:
      "Pengerjaan jalan per milestone menggunakan Next.js & PostgreSQL. Kamu dikasih kode tracking khusus buat mantau persentase progres dan klik preview staging kapan aja.",
    bullets: [
      "Kode tracking pribadi (contoh: KL-2026-001)",
      "Update progres milestone otomatis di halaman /track",
      "Preview staging bisa langsung dites dari HP",
    ],
    mascot: "coding",
    statusLabel: "Sprint Development Aktif",
    progress: 75,
  },
  {
    step: "04",
    shortLabel: "Live & Garansi",
    badge: "Tahap 04 · Launch",
    title: "Testing Menyeluruh, Deploy & Garansi",
    description:
      "Setelah semua fitur dites dan ngebut, website langsung tayang di domain pilihanmu. Mimin juga kasih panduan pakai CMS dan garansi perbaikan bug pasca rilis.",
    bullets: [
      "Optimasi kecepatan & SEO dasar siap terindeks",
      "Serah terima akses penuh & panduan edit CMS",
      "Garansi maintenance 30 hari pasca live",
    ],
    mascot: "yay",
    statusLabel: "Website Live & Terpantau",
    progress: 100,
  },
] as const;

export function WorkflowSection() {
  const [activeIdx, setActiveIdx] = React.useState(0);
  const active = WORKFLOW_STEPS[activeIdx];

  return (
    <section id="alur-kerja" className="border-t border-line bg-subtle/40 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          watermark="CARA KERJA"
          titlePrefix="Gimana Cara"
          titleHighlight="Kita Kerja?"
          highlightColor="orange"
          subtitle="Nggak pake drama atau ghosting. Cuma 4 langkah santai yang terukur dari ngobrol awal sampai websitemu online."
        />

        {/* Stepper Bar */}
        <div className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-2">
          {WORKFLOW_STEPS.map((s, idx) => {
            const isActive = idx === activeIdx;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => setActiveIdx(idx)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-colors sm:text-sm ${
                  isActive
                    ? "bg-brand-blue text-white shadow-sm"
                    : "border border-line bg-surface text-ink-secondary hover:border-brand-blue hover:text-ink"
                }`}
              >
                <span className="font-mono text-[11px] opacity-80">{s.step}</span>
                {s.shortLabel}
              </button>
            );
          })}
        </div>

        {/* Interactive Split Stage Card (matching bilcode.id Cara Kerja) */}
        <div className="surface-card mx-auto mt-8 max-w-5xl overflow-hidden rounded-3xl p-6 sm:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.step}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.24 }}
              className="grid items-center gap-8 md:grid-cols-12"
            >
              {/* Left Copy */}
              <div className="md:col-span-6">
                <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 font-mono text-xs font-bold text-brand-blue dark:bg-sky-500/20">
                  {active.badge}
                </span>
                <h3 className="mt-4 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
                  {active.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-secondary sm:text-base">
                  {active.description}
                </p>

                <ul className="mt-5 space-y-2.5">
                  {active.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-sm text-ink">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right Interactive Visual Panel */}
              <div className="md:col-span-6">
                <div className="rounded-2xl border border-line bg-elevated p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-xs font-bold text-brand-blue">
                      STEP {active.step} / 04
                    </span>
                    <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-[11px] font-bold text-brand-orange dark:bg-orange-500/20">
                      {active.statusLabel}
                    </span>
                  </div>

                  <div className="my-5 flex items-center justify-center">
                    <Image
                      src={`/mascot/${active.mascot}.png`}
                      alt={active.title}
                      width={150}
                      height={150}
                      className="h-auto w-34 drop-shadow-md"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-ink-secondary">Progres Tahapan</span>
                      <span className="font-mono font-bold text-brand-orange">
                        {active.progress}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-line">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${active.progress}%` }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                        className="h-full rounded-full bg-brand-orange"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Tracker Callout Strip inside footer of stage */}
          <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-line pt-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3 text-sm text-ink-secondary">
              <Compass className="h-5 w-5 shrink-0 text-brand-blue" />
              <span>
                Udah punya kode project? Cek langsung pakai kode demo{" "}
                <code className="rounded bg-subtle px-1.5 py-0.5 font-mono text-xs font-bold text-brand-orange">
                  KL-2026-001
                </code>
              </span>
            </div>
            <Link href="/track?code=KL-2026-001" className="btn-blue shrink-0 px-4 py-2 text-xs">
              Buka Lacak Project
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
