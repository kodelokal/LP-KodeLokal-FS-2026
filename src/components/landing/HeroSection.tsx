"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Compass, Layers } from "lucide-react";
import type { SiteSettings } from "@/db/schema";
import { MascotPose } from "@/components/ui/MascotPose";

export function HeroSection({ settings }: { settings: SiteSettings }) {
  const stats =
    settings.stats && settings.stats.length > 0
      ? settings.stats
      : [
          { label: "Project Terselesaikan", value: "25+" },
          { label: "Klien & Mitra Aktif", value: "18+" },
          { label: "Kepuasan Klien", value: "99%" },
          { label: "Transparansi Progress", value: "100%" },
        ];

  return (
    <section className="hero-backdrop relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Left Copy Column */}
          <div className="lg:col-span-7">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.38 }}
              className="text-sm font-bold tracking-wide text-brand-blue uppercase"
            >
              {settings.brandName} · {settings.tagline}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.06 }}
              className="mt-4 text-4xl font-extrabold tracking-[-0.03em] text-ink sm:text-5xl lg:text-[3.4rem] lg:leading-[1.1]"
            >
              {settings.heroTitle}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.14 }}
              className="mt-6 max-w-2xl text-base leading-relaxed text-ink-secondary sm:text-lg"
            >
              {settings.heroSubtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2 }}
              className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center"
            >
              <Link href="/#kontak" id="hero-primary-cta" className="btn-primary text-base">
                {settings.heroCtaPrimary}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/#portofolio" id="hero-secondary-cta" className="btn-secondary text-base">
                <Layers className="h-4 w-4 text-brand-blue" />
                {settings.heroCtaSecondary}
              </Link>
            </motion.div>

            {/* Quick Value Points */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.28 }}
              className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-secondary"
            >
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-orange" />
                Next.js & PostgreSQL Modern
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-blue" />
                Pelacakan Progress Real-Time
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-orange" />
                CMS Mandiri & SEO-Ready
              </span>
            </motion.div>
          </div>

          {/* Right Interactive Mascot & Live Tracker Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5"
          >
            <div className="surface-card relative rounded-3xl p-6 sm:p-8">
              {/* Soft dual-tone organic backdrop inside card */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-3xl opacity-70"
                style={{
                  background:
                    "radial-gradient(260px circle at 25% 25%, rgba(53,146,212,0.12), transparent 65%), radial-gradient(240px circle at 85% 80%, rgba(234,108,31,0.12), transparent 65%)",
                }}
              />

              <div className="relative flex flex-col items-center text-center">
                <MascotPose
                  pose="hello"
                  size={215}
                  bubble="Halo! Siap bangun produk digitalmu?"
                  priority
                />

                {/* Interactive Client Tracker Preview Card */}
                <Link
                  href="/track?code=KL-2026-001"
                  id="hero-live-tracker-preview"
                  className="mt-6 w-full rounded-2xl border border-line bg-elevated p-4 text-left transition-colors hover:border-brand-blue"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-brand-blue">
                      <Compass className="h-3.5 w-3.5" />
                      KL-2026-001
                    </span>
                    <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-[11px] font-semibold text-orange-800 dark:bg-orange-500/20 dark:text-orange-300">
                      Sedang Dikerjakan
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-bold text-ink">
                    Pantau Progress Project Secara Langsung
                  </p>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-ink-secondary">
                      <span>Milestone Sprint 3/4</span>
                      <span className="font-mono font-semibold text-ink">65%</span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-line">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "65%" }}
                        transition={{ duration: 0.9, delay: 0.35, ease: "easeOut" }}
                        className="h-full rounded-full bg-brand-orange"
                      />
                    </div>
                  </div>
                  <p className="mt-2.5 text-xs font-semibold text-brand-blue">
                    Coba Demo Pelacakan Klien →
                  </p>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Clean Metrics Strip */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.32 }}
          className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:mt-18"
        >
          {stats.map((item, idx) => (
            <div
              key={`${item.label}-${idx}`}
              className="surface-card rounded-2xl px-5 py-4 text-center sm:text-left"
            >
              <p className="font-mono text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
                <span className={idx % 2 === 0 ? "text-brand-blue" : "text-brand-orange"}>
                  {item.value}
                </span>
              </p>
              <p className="mt-1 text-xs font-medium text-ink-secondary sm:text-sm">
                {item.label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
