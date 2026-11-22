"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, X, ArrowUpRight, Calendar, Building2 } from "lucide-react";
import type { Portfolio } from "@/db/schema";
import { FadeIn } from "@/components/ui/MotionPrimitives";
import { MascotPose } from "@/components/ui/MascotPose";

export function PortfolioSection({ portfolios }: { portfolios: Portfolio[] }) {
  const categories = React.useMemo(() => {
    const unique = Array.from(new Set(portfolios.map((p) => p.category)));
    return ["Semua", ...unique];
  }, [portfolios]);

  const [activeCategory, setActiveCategory] = React.useState("Semua");
  const [selected, setSelected] = React.useState<Portfolio | null>(null);

  const filtered = React.useMemo(() => {
    if (activeCategory === "Semua") return portfolios;
    return portfolios.filter((p) => p.category === activeCategory);
  }, [portfolios, activeCategory]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <section id="portofolio" className="border-t border-line bg-subtle/45 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <FadeIn className="max-w-2xl">
            <p className="text-xs font-bold tracking-widest text-brand-blue uppercase">
              Hasil Portofolio
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.025em] text-ink sm:text-4xl">
              Karya Nyata untuk Klien di Berbagai Industri
            </h2>
            <p className="mt-3 text-base text-ink-secondary">
              Setiap project dikelola langsung melalui CMS KodeLokal. Klik salah satu karya untuk
              melihat detail arsitektur dan teknologi yang digunakan.
            </p>
          </FadeIn>

          <FadeIn delay={0.1} className="hidden md:block">
            <MascotPose pose="yay" size={118} bubble="Lihat hasil karya kami!" />
          </FadeIn>
        </div>

        {/* Interactive Category Tabs */}
        <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Filter kategori portofolio">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveCategory(cat)}
                className={`relative rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? "text-white"
                    : "border border-line bg-surface text-ink-secondary hover:border-brand-blue hover:text-ink"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="portfolio-tab-pill"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    className="absolute inset-0 rounded-xl bg-brand-blue"
                  />
                )}
                <span className="relative z-10">{cat}</span>
              </button>
            );
          })}
        </div>

        {/* Portfolio Grid */}
        <motion.div layout className="mt-10 grid gap-6 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((item) => (
              <motion.article
                key={item.id}
                layout
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3 }}
                onClick={() => setSelected(item)}
                className="surface-card surface-card-interactive group cursor-pointer overflow-hidden rounded-3xl"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-elevated">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                    <span className="rounded-lg bg-surface/92 px-3 py-1 text-xs font-bold text-ink shadow-sm backdrop-blur-sm">
                      {item.category}
                    </span>
                    <span className="rounded-lg bg-brand-navy/85 px-2.5 py-1 font-mono text-xs font-semibold text-white backdrop-blur-sm dark:bg-canvas/85">
                      {item.projectYear}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-xs font-semibold text-brand-orange">{item.clientName}</p>
                  <h3 className="mt-1 text-xl font-bold tracking-tight text-ink transition-colors group-hover:text-brand-blue">
                    {item.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-secondary">
                    {item.summary}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                    <div className="flex flex-wrap gap-1.5">
                      {(item.techStack ?? []).slice(0, 4).map((tech) => (
                        <span
                          key={tech}
                          className="rounded-lg bg-subtle px-2.5 py-1 font-mono text-[11px] font-medium text-ink-secondary"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-blue">
                      Detail Studi Kasus
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <div className="surface-card mt-10 flex flex-col items-center rounded-3xl p-10 text-center">
            <MascotPose pose="confused" size={110} float={false} />
            <p className="mt-4 text-sm font-medium text-ink-secondary">
              Belum ada portofolio pada kategori ini.
            </p>
          </div>
        )}
      </div>

      {/* Case Study Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ duration: 0.22 }}
              onClick={(e) => e.stopPropagation()}
              className="surface-card relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl"
            >
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Tutup detail portofolio"
                className="absolute top-4 right-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-surface/90 text-ink shadow-md backdrop-blur-sm transition-colors hover:bg-brand-orange hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="relative aspect-[16/9] w-full bg-elevated">
                <Image
                  src={selected.imageUrl}
                  alt={selected.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 720px"
                  className="object-cover"
                />
              </div>

              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-ink-secondary">
                  <span className="rounded-lg bg-sky-100 px-2.5 py-1 text-brand-blue dark:bg-sky-500/20">
                    {selected.category}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5 text-brand-orange" />
                    {selected.clientName}
                  </span>
                  <span className="inline-flex items-center gap-1 font-mono">
                    <Calendar className="h-3.5 w-3.5 text-brand-blue" />
                    {selected.projectYear}
                  </span>
                </div>

                <h3 className="mt-3 text-2xl font-extrabold tracking-tight text-ink">
                  {selected.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
                  {selected.description}
                </p>

                <div className="mt-6">
                  <p className="text-xs font-bold tracking-wider text-ink-muted uppercase">
                    Teknologi yang Digunakan
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {(selected.techStack ?? []).map((tech) => (
                      <span
                        key={tech}
                        className="rounded-lg border border-line bg-subtle px-3 py-1 font-mono text-xs font-semibold text-ink"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-line pt-5">
                  <Link
                    href="/#kontak"
                    onClick={() => setSelected(null)}
                    className="btn-primary text-sm"
                  >
                    Buat Project Serupa
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  {selected.liveUrl && (
                    <a
                      href={selected.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary text-sm"
                    >
                      Kunjungi Tautan
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
