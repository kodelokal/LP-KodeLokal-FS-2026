"use client";

import Link from "next/link";
import { Compass, ArrowRight, MessageSquareText, Palette, Terminal, Rocket } from "lucide-react";
import { FadeIn, StaggerGrid, StaggerCard } from "@/components/ui/MotionPrimitives";

const STEPS = [
  {
    num: "01",
    title: "Ngobrol & Spill Kebutuhan",
    desc: "Ceritain aja dulu tujuan web atau aplikasimu. Nanti mimin bantu petain fitur, timeline, dan estimasi biayanya tanpa biaya tersembunyi.",
    icon: MessageSquareText,
    accent: "blue",
  },
  {
    num: "02",
    title: "Bikin Tampilannya Dulu",
    desc: "Sebelum masuk ngoding, tim desain bikin tampilan desktop & mobile yang sesuai karakter brand kamu biar sama-sama sreg.",
    icon: Palette,
    accent: "orange",
  },
  {
    num: "03",
    title: "Mimin Ngoding, Kamu Pantau",
    desc: "Pengerjaan jalan per milestone. Kamu dapat kode tracking pribadi buat ngecek progres dan preview staging kapan pun mau.",
    icon: Terminal,
    accent: "blue",
  },
  {
    num: "04",
    title: "Testing, Live & Garansi",
    desc: "Setelah dicek lintas perangkat dan beres semua, web langsung online di domainmu plus diajarin cara pakai CMS & garansi maintenance.",
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
            Gimana Cara Kerjanya?
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.025em] text-ink sm:text-4xl">
            Nggak Pake Drama, Cuma 4 Langkah Santai Sampai Live
          </h2>
          <p className="mt-3 text-base text-ink-secondary">
            Anti ghosting dan nggak perlu nebak-nebak project udah sampai mana. Semua tahapan
            tercatat jelas dan bisa kamu pantau sendiri.
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
                  Lagi Jalan Project Bareng KodeLokal?
                </h3>
                <p className="mt-1 text-sm text-ink-secondary">
                  Masukin aja kode tracking dari mimin (mau coba demo? pake{" "}
                  <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs font-bold text-brand-orange">
                    KL-2026-001
                  </code>
                  ) buat ngecek persentase pengerjaan dan milestone terbaru secara real-time.
                </p>
              </div>
            </div>
            <Link href="/track" className="btn-blue shrink-0 text-sm">
              Cek Progres Sekarang
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
