"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Star } from "lucide-react";
import type { Testimonial, Faq } from "@/db/schema";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StaggerGrid, StaggerCard } from "@/components/ui/MotionPrimitives";

export function TestimonialsFaqSection({
  testimonials,
  faqs,
}: {
  testimonials: Testimonial[];
  faqs: Faq[];
}) {
  const [openFaqId, setOpenFaqId] = React.useState<string | null>(faqs[0]?.id ?? null);

  return (
    <div className="border-t border-line">
      {/* TESTIMONI */}
      {testimonials.length > 0 && (
        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              watermark="TESTIMONI"
              titlePrefix="Apa Kata"
              titleHighlight="Mereka?"
              highlightColor="orange"
              subtitle="Review jujur dari klien & founder yang udah mempercayakan website dan sistem bisnisnya bareng mimin KodeLokal."
            />

            <StaggerGrid className="mt-12 grid gap-6 md:grid-cols-3">
              {testimonials.map((t) => (
                <StaggerCard key={t.id}>
                  <blockquote className="surface-card flex h-full flex-col justify-between rounded-3xl p-6">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex gap-1">
                          {Array.from({ length: Math.min(5, Math.max(1, t.rating)) }).map((_, i) => (
                            <Star
                              key={i}
                              className="h-4 w-4 fill-brand-amber text-brand-amber"
                            />
                          ))}
                        </div>
                        <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[10px] font-bold text-brand-blue dark:bg-sky-500/20">
                          Verified Client
                        </span>
                      </div>
                      <p className="mt-4 text-sm leading-relaxed text-ink">“{t.quote}”</p>
                    </div>
                    <footer className="mt-6 flex items-center gap-3 border-t border-line pt-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-blue/15 text-xs font-extrabold text-brand-blue">
                        {t.clientName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-ink">{t.clientName}</p>
                        <p className="text-xs text-ink-secondary">
                          {t.clientRole}, {t.companyName}
                        </p>
                      </div>
                    </footer>
                  </blockquote>
                </StaggerCard>
              ))}
            </StaggerGrid>
          </div>
        </section>
      )}

      {/* FAQ (Centered stacked cards like bilcode.id) */}
      {faqs.length > 0 && (
        <section id="faq" className="border-t border-line py-20 sm:py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              watermark="FAQ"
              titlePrefix="Pertanyaan yang Sering"
              titleHighlight="Ditanyain ke Mimin"
              highlightColor="blue"
              subtitle="Masih bingung soal estimasi waktu, budget, atau cara pantau project? Cek jawaban cepatnya di bawah ya."
            />

            <div className="mt-10 space-y-3">
              {faqs.map((faq) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className={`surface-card overflow-hidden rounded-2xl transition-colors ${
                      isOpen ? "border-brand-blue/40" : ""
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4.5 text-left"
                    >
                      <span className="text-sm font-bold text-ink sm:text-base">
                        {faq.question}
                      </span>
                      <span
                        className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors ${
                          isOpen
                            ? "bg-brand-blue text-white"
                            : "bg-subtle text-ink-secondary"
                        }`}
                      >
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-200 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pt-0 pb-5 text-sm leading-relaxed text-ink-secondary">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
