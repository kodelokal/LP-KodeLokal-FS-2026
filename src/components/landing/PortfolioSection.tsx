"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Portfolio } from "@/db/schema";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MascotPose } from "@/components/ui/MascotPose";

export function PortfolioSection({ portfolios }: { portfolios: Portfolio[] }) {
  const categories = React.useMemo(() => {
    const unique = Array.from(new Set(portfolios.map((p) => p.category)));
    return ["Semua", ...unique];
  }, [portfolios]);

  const [activeCategory, setActiveCategory] = React.useState("Semua");

  const filtered = React.useMemo(() => {
    if (activeCategory === "Semua") return portfolios;
    return portfolios.filter((p) => p.category === activeCategory);
  }, [portfolios, activeCategory]);

  return (
    <section id="portofolio" className="border-t border-line py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          watermark="PORTOFOLIO"
          titlePrefix="Karya yang Udah"
          titleHighlight="Mimin Beresin"
          highlightColor="blue"
          subtitle="Biar nggak dikira omon-omon doang, klik aja salah satu project di bawah buat lihat halaman studi kasus dan galeri tampilannya secara penuh."
        />

        {/* Centered Category Tabs */}
        <div
          className="mt-9 flex flex-wrap items-center justify-center gap-2"
          role="tablist"
          aria-label="Filter kategori portofolio"
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveCategory(cat)}
                className={`relative rounded-full px-4 py-2 text-xs font-bold transition-colors sm:text-sm ${
                  isActive
                    ? "text-white"
                    : "border border-line bg-surface text-ink-secondary hover:border-brand-blue hover:text-ink"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="portfolio-tab-pill"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    className="absolute inset-0 rounded-full bg-brand-blue"
                  />
                )}
                <span className="relative z-10">{cat}</span>
              </button>
            );
          })}
        </div>

        {/* Clean 3-Column Portfolio Grid (linking directly to /portfolio/[slug]) */}
        <motion.div layout className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((item) => (
              <motion.article
                key={item.id}
                layout
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.28 }}
                className="group flex flex-col"
              >
                <Link
                  href={`/portfolio/${item.slug}`}
                  className="flex h-full flex-col focus-visible:outline-none"
                >
                  <div className="surface-card relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-elevated">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="mt-4 flex flex-1 flex-col px-1">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-bold text-brand-blue">{item.category}</span>
                      <span className="font-mono text-ink-muted">{item.projectYear}</span>
                    </div>

                    <div className="mt-1.5 flex items-start justify-between gap-2">
                      <h3 className="text-lg font-extrabold tracking-tight text-ink transition-colors group-hover:text-brand-orange">
                        {item.title}
                      </h3>
                      <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-orange" />
                    </div>

                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-secondary">
                      {item.summary}
                    </p>
                  </div>
                </Link>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <div className="surface-card mt-10 flex flex-col items-center rounded-3xl p-10 text-center">
            <MascotPose pose="confused" size={110} float={false} />
            <p className="mt-4 text-sm font-medium text-ink-secondary">
              Belum ada karya di kategori ini, coba pilih kategori lain ya!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
