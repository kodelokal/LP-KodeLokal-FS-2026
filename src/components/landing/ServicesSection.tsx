"use client";

import Link from "next/link";
import {
  Rocket,
  Code2,
  Layers,
  Sparkles,
  Check,
  ArrowUpRight,
  Globe,
  Database,
  Smartphone,
} from "lucide-react";
import type { Service } from "@/db/schema";
import { FadeIn, StaggerGrid, StaggerCard } from "@/components/ui/MotionPrimitives";
import { MascotPose } from "@/components/ui/MascotPose";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Rocket,
  Code2,
  Layers,
  Sparkles,
  Globe,
  Database,
  Smartphone,
};

export function ServicesSection({ services }: { services: Service[] }) {
  return (
    <section id="layanan" className="border-t border-line py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <FadeIn className="max-w-2xl">
            <p className="text-xs font-bold tracking-widest text-brand-orange uppercase">
              Layanan Kami
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.025em] text-ink sm:text-4xl">
              Solusi Pengembangan Digital yang Disesuaikan Kebutuhan Bisnis
            </h2>
            <p className="mt-3 text-base text-ink-secondary">
              Dari landing page siap konversi hingga sistem manajemen operasional full-stack,
              setiap baris kode dirancang rapi agar mudah dikembangkan jangka panjang.
            </p>
          </FadeIn>

          <FadeIn delay={0.1} className="hidden md:block">
            <MascotPose pose="coding" size={125} bubble="Kode rapi & siap skala!" />
          </FadeIn>
        </div>

        <StaggerGrid className="mt-12 grid gap-6 md:grid-cols-2">
          {services.map((service) => {
            const Icon = ICON_MAP[service.iconName] ?? Code2;
            const isOrange = service.accentColor === "orange";

            return (
              <StaggerCard key={service.id}>
                <article className="surface-card surface-card-interactive flex h-full flex-col justify-between rounded-3xl p-6 sm:p-8">
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div
                        className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${
                          isOrange
                            ? "bg-orange-100 text-brand-orange dark:bg-orange-500/15"
                            : "bg-sky-100 text-brand-blue dark:bg-sky-500/15"
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="rounded-full bg-subtle px-3.5 py-1 font-mono text-xs font-semibold text-ink">
                        {service.startingPrice}
                      </span>
                    </div>

                    <h3 className="mt-5 text-xl font-bold tracking-tight text-ink">
                      {service.title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-ink-secondary">
                      {service.shortDescription}
                    </p>

                    <ul className="mt-5 space-y-2.5">
                      {(service.features ?? []).map((feat, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-ink">
                          <span
                            className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                              isOrange
                                ? "bg-orange-100 text-brand-orange dark:bg-orange-500/20"
                                : "bg-sky-100 text-brand-blue dark:bg-sky-500/20"
                            }`}
                          >
                            <Check className="h-3 w-3" />
                          </span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-7 border-t border-line pt-5">
                    <Link
                      href={`/#kontak`}
                      className={`inline-flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                        isOrange
                          ? "text-brand-orange hover:text-brand-orange-dark"
                          : "text-brand-blue hover:text-brand-blue-dark"
                      }`}
                    >
                      Diskusikan Layanan Ini
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              </StaggerCard>
            );
          })}
        </StaggerGrid>
      </div>
    </section>
  );
}
