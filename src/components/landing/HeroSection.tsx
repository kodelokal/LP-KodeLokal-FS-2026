"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Compass, Sparkles } from "lucide-react";
import type { SiteSettings } from "@/db/schema";

const MASCOT_MOODS = [
  {
    pose: "hello",
    bubble: "Halo! Mau bikin web apa nih? Ngobrol sama mimin yuk!",
    tag: "Sapa Mimin",
  },
  {
    pose: "coding",
    bubble: "Tenang, biar mimin & tim yang ngoding ngebut sampai beres.",
    tag: "Lagi Ngoding",
  },
  {
    pose: "idea",
    bubble: "Punya ide gokil tapi bingung mulai dari mana? Spill aja!",
    tag: "Spill Ide",
  },
  {
    pose: "yay",
    bubble: "Yeay! Website ngebut, tampilan kece, bisnis makin cuan.",
    tag: "Siap Live",
  },
  {
    pose: "top",
    bubble: "Bisa pantau progres kapan aja, anti ghosting & transparan!",
    tag: "Anti Ribet",
  },
] as const;

export function HeroSection({ settings }: { settings: SiteSettings }) {
  const [moodIndex, setMoodIndex] = React.useState(0);
  const currentMood = MASCOT_MOODS[moodIndex];

  const stats =
    settings.stats && settings.stats.length > 0
      ? settings.stats
      : [
          { label: "Project udah live", value: "25+" },
          { label: "Klien & partner hepi", value: "18+" },
          { label: "Puas & repeat order", value: "99%" },
          { label: "Progres transparan", value: "100%" },
        ];

  function nextMood() {
    setMoodIndex((prev) => (prev + 1) % MASCOT_MOODS.length);
  }

  return (
    <section className="hero-backdrop relative overflow-hidden pt-10 pb-14 sm:pt-14 sm:pb-20 lg:pt-18 lg:pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Editorial Top Headline Block — Bold, Direct, Human */}
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7 xl:col-span-8">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.36 }}
              className="flex items-center gap-3 text-sm font-semibold text-ink-secondary"
            >
              <span className="inline-block h-0.5 w-8 rounded-full bg-brand-orange" />
              <span>
                Halo dari{" "}
                <strong className="font-bold text-brand-blue">kode</strong>
                <strong className="font-bold text-brand-orange">lokal</strong> —{" "}
                {settings.tagline}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="mt-5 text-[2.45rem] leading-[1.08] font-extrabold tracking-[-0.035em] text-ink sm:text-5xl lg:text-[3.75rem]"
            >
              {settings.heroTitle}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.12 }}
              className="mt-6 max-w-2xl text-base leading-relaxed text-ink-secondary sm:text-lg"
            >
              {settings.heroSubtitle}
            </motion.p>

            {/* Clean Action Row */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.18 }}
              className="mt-8 flex flex-wrap items-center gap-3.5"
            >
              <Link href="/#kontak" id="hero-primary-cta" className="btn-primary text-sm sm:text-base">
                {settings.heroCtaPrimary}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/#portofolio"
                id="hero-secondary-cta"
                className="btn-secondary text-sm sm:text-base"
              >
                {settings.heroCtaSecondary}
              </Link>
              <Link
                href="/track?code=KL-2026-001"
                id="hero-track-shortcut"
                className="inline-flex items-center gap-1.5 px-2 py-2 text-sm font-bold text-brand-blue transition-colors hover:text-brand-orange"
              >
                <Compass className="h-4 w-4" />
                Cek Progres Project
              </Link>
            </motion.div>
          </div>

          {/* Right Open-Air Interactive Mascot Stage (No boxy generic card!) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative flex flex-col items-center justify-center lg:col-span-5 xl:col-span-4"
          >
            {/* Soft organic dual-tone shape behind mascot */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-1/2 -z-0 h-68 w-68 -translate-x-1/2 -translate-y-1/2 rounded-[42%_58%_60%_40%/46%_44%_56%_54%] bg-brand-blue/12 blur-[2px] dark:bg-brand-blue/16 sm:h-76 sm:w-76"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-6 bottom-8 -z-0 h-28 w-28 rounded-full bg-brand-orange/15 blur-xl"
            />

            {/* Speech Bubble from Mimin */}
            <div className="relative z-10 mb-3 min-h-[56px] max-w-[290px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentMood.pose}
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.22 }}
                  className="relative rounded-2xl border border-line bg-surface px-4 py-2.5 text-center text-xs leading-snug font-semibold text-ink shadow-md sm:text-sm"
                >
                  “{currentMood.bubble}”
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-r border-b border-line bg-surface"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Interactive Clickable Mascot */}
            <button
              type="button"
              id="hero-mascot-interactive"
              onClick={nextMood}
              aria-label="Klik maskot KodeLokal untuk melihat ekspresi lain"
              className="group relative z-10 cursor-pointer focus-visible:outline-none"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentMood.pose}
                  initial={{ opacity: 0, scale: 0.88, rotate: -4 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0, y: [0, -8, 0] }}
                  exit={{ opacity: 0, scale: 0.9, rotate: 4 }}
                  transition={{
                    opacity: { duration: 0.2 },
                    scale: { duration: 0.24 },
                    rotate: { duration: 0.24 },
                    y: { duration: 3.4, repeat: Infinity, ease: "easeInOut" },
                  }}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Image
                    src={`/mascot/${currentMood.pose}.png`}
                    alt={`Maskot KodeLokal — ${currentMood.tag}`}
                    width={240}
                    height={240}
                    priority
                    className="h-auto w-48 select-none drop-shadow-[0_18px_28px_rgba(20,58,89,0.2)] sm:w-56 dark:drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]"
                  />
                </motion.div>
              </AnimatePresence>
            </button>

            {/* Mood Selector Pills */}
            <div className="relative z-10 mt-4 flex flex-wrap items-center justify-center gap-1.5">
              {MASCOT_MOODS.map((m, i) => {
                const active = i === moodIndex;
                return (
                  <button
                    key={m.pose}
                    type="button"
                    onClick={() => setMoodIndex(i)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                      active
                        ? "bg-brand-orange text-white"
                        : "bg-surface/85 text-ink-secondary hover:bg-subtle hover:text-ink"
                    }`}
                  >
                    {m.tag}
                  </button>
                );
              })}
            </div>
            <p className="relative z-10 mt-2 inline-flex items-center gap-1 text-[11px] text-ink-muted">
              <Sparkles className="h-3 w-3 text-brand-orange" />
              Klik maskotnya buat lihat gaya lain!
            </p>
          </motion.div>
        </div>

        {/* Clean Editorial Metrics Strip (Divider-based, NOT 4 generic boxed cards!) */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.26 }}
          className="mt-14 border-y border-line py-6 sm:mt-18"
        >
          <div className="grid grid-cols-2 gap-y-6 sm:grid-cols-4 sm:divide-x sm:divide-line">
            {stats.map((item, idx) => (
              <div
                key={`${item.label}-${idx}`}
                className="flex flex-col sm:px-6 sm:first:pl-0 sm:last:pr-0"
              >
                <span
                  className={`font-mono text-2xl font-extrabold tracking-tight sm:text-3xl ${
                    idx % 2 === 0 ? "text-brand-blue" : "text-brand-orange"
                  }`}
                >
                  {item.value}
                </span>
                <span className="mt-1 text-xs font-medium text-ink-secondary sm:text-sm">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
