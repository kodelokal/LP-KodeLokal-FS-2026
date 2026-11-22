"use client";

import Link from "next/link";
import { Compass, ArrowRight, MessageSquareText, Palette, Terminal, Rocket } from "lucide-react";
import { FadeIn, StaggerGrid, StaggerCard } from "@/components/ui/MotionPrimitives";

const STEPS = [
  {
    num: "01",
    title: "Discovery & Analisis Kebutuhan",
    desc: "Kami memetakan target bisnis, struktur fitur, estimasi waktu, dan spesifikasi database agar tidak ada biaya tersembunyi.",
    icon: MessageSquareText,
    accent: "blue",
  },
  {
    num: "02",
    title: "Desain UI/UX & Prototipe",
    desc: "Penyusunan tampilan responsif desktop & mobile beserta identitas warna brand sebelum masuk ke tahap penulisan kode.",
    icon: Palette,
    accent: "orange",
  },
  {
    num: "03",
    title: "Pengembangan & Tracking Live",
    desc: "Pengerjaan bertahap per milestone. Anda menerima kode tracking unik untuk memantau progress dan preview staging kapan saja.",
    icon: Terminal,
    accent: "blue",
  },
  {
    num: "04",
    title: "QA Testing, Deploy & Garansi",
    desc: "Optimasi kecepatan, deploy ke domain produksi Anda, pelatihan CMS, serta garansi pemeliharaan pasca peluncuran.",
    icon: Rocket,
    accent: "orange",
  },
];

export function WorkflowSection() {
  return (
    <section id="alur-kerja" className="border-t border-line py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="max-w-2xl">
          <p className="text-xs font-bold tracking-widest text-brand-orange uppercase">
            Alur Kerja Transparan
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.025em] text-ink sm:text-4xl">
            Empat Langkah Terstruktur dari Ide hingga Live
          </h2>
          <p className="mt-3 text-base text-ink-secondary">
            Tidak perlu menebak-nebak status pengerjaan website Anda. Setiap tahap tercatat rapi
            di sistem manajemen project KodeLokal.
          </p>
        </FadeIn>

        <StaggerGrid className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isOrange = step.accent === "orange";
            return (
              <StaggerCard key={step.num}>
                <div className="surface-card flex h-full flex-col rounded-3xl p-6">
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${
                        isOrange
                          ? "bg-orange-100 text-brand-orange dark:bg-orange-500/15"
                          : "bg-sky-100 text-brand-blue dark:bg-sky-500/15"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="font-mono text-2xl font-extrabold text-line-strong">
                      {step.num}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-ink">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{step.desc}</p>
                </div>
              </StaggerCard>
            );
          })}
        </StaggerGrid>

        {/* Client Project Tracking CTA Strip */}
        <FadeIn delay={0.12} className="mt-10">
          <div className="surface-card flex flex-col items-start justify-between gap-6 rounded-3xl bg-subtle/70 p-6 sm:flex-row sm:items-center sm:p-8">
            <div className="flex items-start gap-4">
              <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-blue text-white">
                <Compass className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-ink">
                  Sudah Menjadi Klien KodeLokal?
                </h3>
                <p className="mt-1 text-sm text-ink-secondary">
                  Masukkan Kode Tracking Anda (contoh demo:{" "}
                  <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs font-bold text-brand-orange">
                    KL-2026-001
                  </code>
                  ) untuk melihat persentase pengerjaan & milestone terbaru secara real-time.
                </p>
              </div>
            </div>
            <Link href="/track" className="btn-blue shrink-0 text-sm">
              Buka Lacak Project
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
