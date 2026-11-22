"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Star, Quote } from "lucide-react";
import type { Testimonial, Faq } from "@/db/schema";
import { FadeIn, StaggerGrid, StaggerCard } from "@/components/ui/MotionPrimitives";
import { MascotPose } from "@/components/ui/MascotPose";

export function TestimonialsFaqSection({
  testimonials,
  faqs,
}: {
  testimonials: Testimonial[];
  faqs: Faq[];
}) {
  const [openFaqId, setOpenFaqId] = React.useState<string | null>(faqs[0]?.id ?? null);

  return (
    <section id="faq" className="border-t border-line py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Testimonials */}
        {testimonials.length > 0 && (
          <div>
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
              <FadeIn className="max-w-2xl">
                <p className="text-xs font-bold tracking-widest text-brand-orange uppercase">
                  Testimoni Klien
                </p>
                <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.025em] text-ink sm:text-4xl">
                  Dipercaya Mitra Bisnis & Founder
                </h2>
              </FadeIn>
              <FadeIn delay={0.08} className="hidden md:block">
                <MascotPose pose="top" size={110} bubble="Kualitas & komitmen no. 1!" />
              </FadeIn>
            </div>

            <StaggerGrid className="mt-10 grid gap-6 md:grid-cols-3">
              {testimonials.map((t) => (
                <StaggerCard key={t.id}>
                  <blockquote className="surface-card flex h-full flex-col justify-between rounded-3xl p-6">
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          {Array.from({ length: Math.min(5, Math.max(1, t.rating)) }).map((_, i) => (
                            <Star
                              key={i}
                              className="h-4 w-4 fill-brand-amber text-brand-amber"
                            />
                          ))}
                        </div>
                        <Quote className="h-5 w-5 text-line-strong" />
                      </div>
                      <p className="mt-4 text-sm leading-relaxed text-ink">“{t.quote}”</p>
                    </div>
                    <footer className="mt-6 border-t border-line pt-4">
                      <p className="text-sm font-bold text-ink">{t.clientName}</p>
                      <p className="text-xs text-ink-secondary">
                        {t.clientRole}, {t.companyName}
                      </p>
                    </footer>
                  </blockquote>
                </StaggerCard>
              ))}
            </StaggerGrid>
          </div>
        )}

        {/* FAQ */}
        {faqs.length > 0 && (
          <div className="mt-20 grid gap-10 lg:grid-cols-12 lg:items-start">
            <FadeIn className="lg:col-span-4">
              <p className="text-xs font-bold tracking-widest text-brand-blue uppercase">
                Pertanyaan Umum
              </p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.025em] text-ink">
                Hal yang Sering Ditanyakan
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
                Masih bingung menentukan teknologi atau estimasi biaya? Tim KodeLokal siap
                membantu merancang opsi paling efisien untuk kebutuhan Anda.
              </p>
              <div className="mt-6 hidden lg:block">
                <MascotPose pose="thinking" size={145} bubble="Ada pertanyaan lain?" />
              </div>
            </FadeIn>

            <div className="space-y-3 lg:col-span-8">
              {faqs.map((faq) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <div key={faq.id} className="surface-card overflow-hidden rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    >
                      <span className="text-sm font-bold text-ink sm:text-base">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-brand-blue transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
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
                          <div className="border-t border-line px-5 pt-3 pb-5 text-sm leading-relaxed text-ink-secondary">
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
        )}
      </div>
    </section>
  );
}
