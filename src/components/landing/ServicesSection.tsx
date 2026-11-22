"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Rocket,
  Code2,
  Layers,
  Sparkles,
  ArrowUpRight,
  Globe,
  Database,
  Smartphone,
  Check,
} from "lucide-react";
import type { Service } from "@/db/schema";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StaggerGrid, StaggerCard } from "@/components/ui/MotionPrimitives";

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
  const featuredServices = services.slice(0, 2);
  const additionalServices = services.slice(2);

  return (
    <section id="layanan" className="border-t border-line py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          watermark="LAYANAN"
          titlePrefix="Mau Bikin Apa?"
          titleHighlight="Mimin Siap Gasin."
          highlightColor="blue"
          subtitle="Dari landing page buat naikin omzet sampai aplikasi web & CMS custom — semua dibikin rapi, ngebut, dan gampang kamu kelola sendiri."
        />

        {/* Top Row: 2 Featured Visual Cards (matching bilcode.id Services layout) */}
        <StaggerGrid className="mt-12 grid gap-6 md:grid-cols-2">
          {featuredServices.map((service, idx) => {
            const isOrange = idx === 1 || service.accentColor === "orange";
            return (
              <StaggerCard key={service.id}>
                <article className="surface-card surface-card-interactive flex h-full flex-col overflow-hidden rounded-3xl p-5 sm:p-6">
                  {/* Visual UI Illustration Box on Top */}
                  <div className="relative flex h-48 items-center justify-center overflow-hidden rounded-2xl border border-line bg-elevated/90 p-5 sm:h-54">
                    {idx === 0 ? (
                      <div className="relative flex w-full max-w-sm items-center justify-between gap-4">
                        <div className="flex-1 rounded-xl border border-line bg-surface p-3.5 shadow-sm">
                          <div className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-brand-orange" />
                            <span className="h-2 w-2 rounded-full bg-brand-amber" />
                            <span className="h-2 w-2 rounded-full bg-brand-blue" />
                          </div>
                          <div className="mt-3 h-2.5 w-3/4 rounded-full bg-brand-blue/25" />
                          <div className="mt-2 h-2 w-1/2 rounded-full bg-line" />
                          <div className="mt-4 flex items-center gap-2">
                            <span className="rounded-lg bg-brand-orange px-2.5 py-1 text-[10px] font-bold text-white">
                              Mulai Sekarang
                            </span>
                            <span className="rounded-lg bg-subtle px-2 py-1 font-mono text-[10px] font-semibold text-brand-blue">
                              99/100 SEO
                            </span>
                          </div>
                        </div>
                        <Image
                          src="/mascot/coding.png"
                          alt="Maskot KodeLokal coding"
                          width={108}
                          height={100}
                          className="h-auto w-24 shrink-0 drop-shadow-md"
                        />
                      </div>
                    ) : (
                      <div className="relative flex w-full max-w-sm items-center justify-between gap-4">
                        <Image
                          src="/mascot/idea.png"
                          alt="Maskot KodeLokal ide aplikasi"
                          width={96}
                          height={120}
                          className="h-auto w-22 shrink-0 drop-shadow-md"
                        />
                        <div className="flex-1 space-y-2 rounded-xl border border-line bg-surface p-3.5 shadow-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] font-bold text-brand-blue">
                              API · NEON DB
                            </span>
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                              Online
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <div className="rounded-lg bg-subtle p-2 text-center">
                              <p className="font-mono text-xs font-extrabold text-brand-blue">RBAC</p>
                              <p className="text-[9px] text-ink-muted">Multi-Role</p>
                            </div>
                            <div className="rounded-lg bg-subtle p-2 text-center">
                              <p className="font-mono text-xs font-extrabold text-brand-orange">CMS</p>
                              <p className="text-[9px] text-ink-muted">Real-time</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Copy */}
                  <div className="mt-5 flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-xl font-bold tracking-tight text-ink">
                          {service.title}
                        </h3>
                        <Link
                          href="/#kontak"
                          aria-label={`Tanya layanan ${service.title}`}
                          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-ink-secondary transition-colors hover:border-brand-blue hover:text-brand-blue"
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                        {service.shortDescription}
                      </p>

                      <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
                        {(service.features ?? []).slice(0, 4).map((feat, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs text-ink">
                            <Check
                              className={`h-3.5 w-3.5 shrink-0 ${
                                isOrange ? "text-brand-orange" : "text-brand-blue"
                              }`}
                            />
                            <span className="truncate">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
                      <span className="font-mono text-xs font-bold text-ink">
                        {service.startingPrice}
                      </span>
                      <Link
                        href="/#kontak"
                        className={`inline-flex items-center gap-1 text-xs font-bold ${
                          isOrange ? "text-brand-orange" : "text-brand-blue"
                        } hover:underline`}
                      >
                        Tanya Mimin →
                      </Link>
                    </div>
                  </div>
                </article>
              </StaggerCard>
            );
          })}
        </StaggerGrid>

        {/* Bottom Row: Compact Service Cards */}
        {additionalServices.length > 0 && (
          <StaggerGrid
            className={`mt-6 grid gap-5 ${
              additionalServices.length >= 3 ? "md:grid-cols-3" : "md:grid-cols-2"
            }`}
          >
            {additionalServices.map((service) => {
              const Icon = ICON_MAP[service.iconName] ?? Code2;
              const isOrange = service.accentColor === "orange";
              return (
                <StaggerCard key={service.id}>
                  <article className="surface-card surface-card-interactive flex h-full flex-col justify-between rounded-3xl p-6">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <span
                          className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${
                            isOrange
                              ? "bg-orange-100 text-brand-orange dark:bg-orange-500/15"
                              : "bg-sky-100 text-brand-blue dark:bg-sky-500/15"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                        <ArrowUpRight className="h-4 w-4 text-ink-muted" />
                      </div>
                      <h3 className="mt-4 text-lg font-bold text-ink">{service.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-ink-secondary">
                        {service.shortDescription}
                      </p>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
                      <span className="font-mono text-xs font-semibold text-ink-muted">
                        {service.startingPrice}
                      </span>
                      <Link
                        href="/#kontak"
                        className="text-xs font-bold text-brand-blue hover:text-brand-orange"
                      >
                        Tanya Mimin →
                      </Link>
                    </div>
                  </article>
                </StaggerCard>
              );
            })}
          </StaggerGrid>
        )}
      </div>
    </section>
  );
}
