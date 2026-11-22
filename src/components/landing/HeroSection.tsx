"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Compass, Code2, Database, Layers, Globe, Cpu } from "lucide-react";
import type { SiteSettings } from "@/db/schema";

const MASCOT_MOODS = [
  { pose: "hello", bubble: "Halo! Mau bikin web apa nih? Chat mimin yuk!" },
  { pose: "coding", bubble: "Biar mimin yang ngoding, kamu santai aja!" },
  { pose: "idea", bubble: "Punya ide gokil? Spill ke mimin sekarang!" },
  { pose: "yay", bubble: "Yeay! Web ngebut & tampilannya kece!" },
  { pose: "top", bubble: "Progres bisa dicek kapan aja, anti ribet!" },
] as const;

const STACK_BADGES = [
  { label: "Next.js 16", icon: Globe, color: "text-ink" },
  { label: "TypeScript", icon: Code2, color: "text-brand-blue" },
  { label: "Tailwind", icon: Layers, color: "text-sky-500" },
  { label: "Neon DB", icon: Database, color: "text-brand-orange" },
  { label: "Vercel Edge", icon: Cpu, color: "text-brand-amber" },
];

export function HeroSection({ settings }: { settings: SiteSettings }) {
  const [moodIdx, setMoodIdx] = React.useState(0);
  const currentMood = MASCOT_MOODS[moodIdx];

  return (
    <section className="hero-backdrop relative overflow-hidden pt-14 pb-20 sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-28">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ================= FLOATING ORBITAL CARDS (DESKTOP) ================= */}
        {/* LEFT TOP: Dark live-delivery telemetry card */}
        <motion.div
          initial={{ opacity: 0, x: -30, y: -10 }}
          animate={{ opacity: 1, x: 0, y: [0, -7, 0] }}
          transition={{
            opacity: { duration: 0.5 },
            x: { duration: 0.5 },
            y: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
          }}
          className="pointer-events-none absolute top-0 left-2 hidden w-52 rounded-2xl border border-slate-700/60 bg-[#0d1f33] p-3.5 text-white shadow-xl xl:left-4 lg:block"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-semibold text-sky-300">BUILD · LIVE</span>
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
          </div>
          <p className="mt-2 text-xs font-bold text-white">25+ Project Udah Online</p>
          <p className="mt-0.5 text-[11px] text-slate-300">Fast load · SEO Ready · CMS</p>
        </motion.div>

        {/* LEFT MIDDLE: Angled Portfolio Mockup */}
        <motion.div
          initial={{ opacity: 0, x: -36 }}
          animate={{ opacity: 1, x: 0, y: [0, 8, 0] }}
          transition={{
            opacity: { duration: 0.55, delay: 0.1 },
            x: { duration: 0.55, delay: 0.1 },
            y: { duration: 5.2, repeat: Infinity, ease: "easeInOut" },
          }}
          className="absolute top-32 -left-2 hidden w-56 -rotate-3 overflow-hidden rounded-2xl border border-line bg-surface p-1.5 shadow-xl xl:left-0 lg:block"
        >
          <Link href="/#portofolio" className="block overflow-hidden rounded-xl">
            <Image
              src="/portfolio/showcase-devices.jpg"
              alt="Preview karya e-commerce KodeLokal"
              width={240}
              height={160}
              className="h-32 w-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </Link>
        </motion.div>

        {/* LEFT BOTTOM: Clickable Live Project Tracker Chip */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: [0, -6, 0] }}
          transition={{
            opacity: { duration: 0.55, delay: 0.2 },
            y: { duration: 4.2, repeat: Infinity, ease: "easeInOut" },
          }}
          className="absolute bottom-2 left-10 hidden w-56 rounded-2xl border border-slate-700/60 bg-[#0d1f33] p-3.5 text-white shadow-xl xl:left-16 lg:block"
        >
          <Link href="/track" className="block">
            <div className="flex items-center justify-between text-[10px]">
              <span className="inline-flex items-center gap-1 font-mono font-bold text-orange-400">
                <Compass className="h-3 w-3" />
                PROJECT TRACKER
              </span>
              <span className="font-mono font-bold text-sky-300">LIVE</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-700">
              <div className="h-full w-[72%] rounded-full bg-brand-orange" />
            </div>
            <p className="mt-2 text-[11px] font-medium text-slate-200">
              Pantau progres project real-time →
            </p>
          </Link>
        </motion.div>

        {/* RIGHT TOP: Interactive Clickable KodeLokal Mascot */}
        <motion.div
          initial={{ opacity: 0, x: 30, y: -8 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="absolute -top-2 right-2 hidden w-56 flex-col items-center xl:right-4 lg:flex"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMood.pose}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="mb-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 text-center text-[11px] font-semibold text-ink shadow-md"
            >
              “{currentMood.bubble}”
            </motion.div>
          </AnimatePresence>
          <button
            type="button"
            id="hero-mascot-interactive"
            onClick={() => setMoodIdx((prev) => (prev + 1) % MASCOT_MOODS.length)}
            aria-label="Klik maskot KodeLokal untuk ganti ekspresi"
            className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
          >
            <Image
              src={`/mascot/${currentMood.pose}.png`}
              alt="Maskot KodeLokal"
              width={118}
              height={118}
              priority
              className="h-auto w-26 drop-shadow-[0_12px_18px_rgba(20,58,89,0.22)]"
            />
          </button>
        </motion.div>

        {/* RIGHT MIDDLE: Angled Tablet Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, x: 36 }}
          animate={{ opacity: 1, x: 0, y: [0, -8, 0] }}
          transition={{
            opacity: { duration: 0.55, delay: 0.14 },
            x: { duration: 0.55, delay: 0.14 },
            y: { duration: 5.0, repeat: Infinity, ease: "easeInOut" },
          }}
          className="absolute top-38 -right-2 hidden w-56 rotate-3 overflow-hidden rounded-2xl border border-line bg-surface p-1.5 shadow-xl xl:right-0 lg:block"
        >
          <Link href="/#portofolio" className="block overflow-hidden rounded-xl">
            <Image
              src="/portfolio/showcase-tablet.jpg"
              alt="Preview sistem dashboard KodeLokal"
              width={240}
              height={160}
              className="h-32 w-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </Link>
        </motion.div>

        {/* RIGHT BOTTOM: Dark Tech & Uptime Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: [0, 6, 0] }}
          transition={{
            opacity: { duration: 0.55, delay: 0.22 },
            y: { duration: 4.6, repeat: Infinity, ease: "easeInOut" },
          }}
          className="pointer-events-none absolute right-10 bottom-2 hidden w-52 rounded-2xl border border-slate-700/60 bg-[#0d1f33] p-3.5 text-white shadow-xl xl:right-16 lg:block"
        >
          <div className="flex items-center justify-between text-[10px]">
            <span className="font-mono font-bold text-sky-300">KODELOKAL</span>
            <span className="rounded bg-orange-500/20 px-1.5 py-0.5 font-mono text-orange-300">
              99% Puas
            </span>
          </div>
          <p className="mt-2 text-xs font-bold text-white">Anti Ghosting &amp; Rapi</p>
          <p className="mt-0.5 text-[11px] text-slate-300">Support garansi pasca live</p>
        </motion.div>

        {/* ================= CENTER HERO CORE ================= */}
        <div className="relative z-10 mx-auto max-w-2xl py-4 text-center sm:py-8 lg:py-12">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="text-xs font-bold tracking-wider text-brand-blue uppercase sm:text-sm"
          >
            {settings.brandName} · {settings.tagline}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.44, delay: 0.06 }}
            className="mt-4 text-4xl leading-[1.1] font-extrabold tracking-[-0.035em] text-ink sm:text-5xl lg:text-[3.5rem]"
          >
            {settings.heroTitle}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.44, delay: 0.12 }}
            className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-ink-secondary sm:text-base"
          >
            {settings.heroSubtitle}
          </motion.p>

          {/* Centered Pill CTA Row */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.44, delay: 0.18 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              href="/#kontak"
              id="hero-primary-cta"
              className="btn-primary rounded-full px-6 py-3 text-sm sm:text-base"
            >
              {settings.heroCtaPrimary}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/#portofolio"
              id="hero-secondary-cta"
              className="btn-secondary rounded-full px-6 py-3 text-sm sm:text-base"
            >
              {settings.heroCtaSecondary}
            </Link>
          </motion.div>

          {/* Centered Circular Tech Stack Badges (Signature bilcode.id detail) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.24 }}
            className="mt-8 flex items-center justify-center gap-3"
          >
            {STACK_BADGES.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  title={item.label}
                  className="surface-card flex h-11 w-11 items-center justify-center rounded-full"
                >
                  <Icon className={`h-5 w-5 ${item.color}`} />
                </div>
              );
            })}
          </motion.div>

          {/* Mobile Mascot Preview (shown below lg breakpoint) */}
          <div className="mt-8 flex flex-col items-center lg:hidden">
            <button
              type="button"
              onClick={() => setMoodIdx((prev) => (prev + 1) % MASCOT_MOODS.length)}
              className="flex flex-col items-center"
            >
              <div className="mb-2 rounded-2xl border border-line bg-surface px-4 py-2 text-xs font-semibold text-ink shadow-xs">
                “{currentMood.bubble}”
              </div>
              <Image
                src={`/mascot/${currentMood.pose}.png`}
                alt="Maskot KodeLokal"
                width={130}
                height={130}
                className="h-auto w-28 drop-shadow-md"
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
