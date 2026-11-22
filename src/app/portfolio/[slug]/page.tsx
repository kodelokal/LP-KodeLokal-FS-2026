import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { and, asc, desc, eq, ne } from "drizzle-orm";
import { ArrowLeft, ArrowUpRight, ExternalLink } from "lucide-react";
import { db } from "@/db";
import { portfolios } from "@/db/schema";
import { getLandingPageData } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [item] = await db
    .select()
    .from(portfolios)
    .where(and(eq(portfolios.slug, slug), eq(portfolios.isPublished, true)))
    .limit(1);

  if (!item) return { title: "Portofolio Tidak Ditemukan" };

  return {
    title: `${item.title} — Portofolio`,
    description: item.summary,
    alternates: {
      canonical: `/portfolio/${item.slug}`,
    },
    openGraph: {
      type: "article",
      locale: "id_ID",
      url: `/portfolio/${item.slug}`,
      siteName: "KodeLokal — Mitra Digital Anda",
      title: `${item.title} | Portofolio KodeLokal`,
      description: item.summary,
      images: [
        {
          url: item.imageUrl,
          alt: `${item.title} — Karya KodeLokal untuk ${item.clientName}`,
        },
        {
          url: "/brand/og-kodelokal.png",
          width: 1200,
          height: 630,
          alt: "KodeLokal — Mitra Digital Anda",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${item.title} | Portofolio KodeLokal`,
      description: item.summary,
      images: [item.imageUrl],
    },
  };
}

export default async function PortfolioDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kodelokal.store";

  const [[item], landing, currentUser] = await Promise.all([
    db
      .select()
      .from(portfolios)
      .where(and(eq(portfolios.slug, slug), eq(portfolios.isPublished, true)))
      .limit(1),
    getLandingPageData(),
    getCurrentUser(),
  ]);

  if (!item) notFound();

  const related = await db
    .select()
    .from(portfolios)
    .where(and(eq(portfolios.isPublished, true), ne(portfolios.id, item.id)))
    .orderBy(asc(portfolios.sortOrder), desc(portfolios.projectYear))
    .limit(3);

  const allImages = [
    item.imageUrl,
    ...(item.galleryImages ?? []).filter((img) => img && img !== item.imageUrl),
  ];

  const resolveAbs = (u: string) => (u.startsWith("http") ? u : `${siteUrl}${u}`);
  const portfolioJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        name: item.title,
        headline: item.title,
        description: item.description || item.summary,
        image: allImages.map(resolveAbs),
        url: `${siteUrl}/portfolio/${item.slug}`,
        dateCreated: String(item.projectYear),
        keywords: (item.techStack ?? []).join(", "),
        creator: {
          "@type": "Organization",
          name: "KodeLokal",
          url: siteUrl,
          logo: `${siteUrl}/brand/logo-full-light.png`,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Beranda", item: siteUrl },
          {
            "@type": "ListItem",
            position: 2,
            name: "Portofolio",
            item: `${siteUrl}/#portofolio`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: item.title,
            item: `${siteUrl}/portfolio/${item.slug}`,
          },
        ],
      },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(portfolioJsonLd) }}
      />
      <Navbar isLoggedIn={Boolean(currentUser)} />

      <main className="flex-1 bg-canvas">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <Link
            href="/#portofolio"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-secondary transition-colors hover:text-brand-blue"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali ke Semua Portofolio
          </Link>

          {/* Sticky Left Specs + Vertical Stacked Visual Showcase (bilcode.id reference layout) */}
          <div className="mt-8 grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
            {/* LEFT STICKY SIDEBAR */}
            <aside className="lg:sticky lg:top-24 lg:col-span-4">
              <h1 className="text-3xl leading-[1.12] font-extrabold tracking-[-0.03em] text-ink sm:text-4xl">
                {item.title}
              </h1>

              {/* Key-Value Meta Table */}
              <dl className="mt-7 divide-y divide-line border-y border-line text-sm">
                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-xs font-medium text-ink-muted">Klien</dt>
                  <dd className="text-right font-bold text-ink">{item.clientName}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-xs font-medium text-ink-muted">Kategori</dt>
                  <dd className="text-right font-bold text-ink">{item.category}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-xs font-medium text-ink-muted">Tahun</dt>
                  <dd className="text-right font-mono font-bold text-ink">{item.projectYear}</dd>
                </div>
                {item.liveUrl && (
                  <div className="flex items-center justify-between gap-4 py-3">
                    <dt className="text-xs font-medium text-ink-muted">Live Preview</dt>
                    <dd className="text-right">
                      <a
                        href={item.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-bold text-brand-blue hover:text-brand-orange"
                      >
                        Kunjungi Website
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </dd>
                  </div>
                )}
              </dl>

              {/* Tech Stack Pills */}
              {(item.techStack ?? []).length > 0 && (
                <div className="mt-5 flex flex-wrap gap-1.5 border-b border-line pb-5">
                  {item.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full border border-line bg-surface px-3 py-1 font-mono text-[11px] font-semibold text-ink-secondary"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}

              {/* Narrative Description */}
              <div className="mt-5 space-y-3 text-sm leading-relaxed text-ink-secondary">
                <p>{item.summary}</p>
                {item.description && item.description !== item.summary && (
                  <p>{item.description}</p>
                )}
              </div>

              {/* CTA */}
              <div className="mt-7 flex flex-col gap-2.5">
                <Link href="/#kontak" className="btn-primary w-full rounded-full text-sm">
                  Mau Bikin Kayak Gini? Chat Mimin
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </aside>

            {/* RIGHT STACKED FULL-WIDTH SHOWCASE IMAGES */}
            <div className="space-y-6 lg:col-span-8">
              {allImages.map((imgUrl, idx) => (
                <figure
                  key={`${imgUrl}-${idx}`}
                  className="surface-card overflow-hidden rounded-3xl bg-elevated"
                >
                  <div className="relative aspect-[4/3] w-full sm:aspect-[16/11]">
                    <Image
                      src={imgUrl}
                      alt={`${item.title} — Tampilan ${idx + 1}`}
                      fill
                      priority={idx === 0}
                      sizes="(max-width: 1024px) 100vw, 66vw"
                      className="object-cover"
                    />
                  </div>
                </figure>
              ))}
            </div>
          </div>

          {/* Related Works */}
          {related.length > 0 && (
            <section className="mt-20 border-t border-line pt-14">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold tracking-widest text-brand-orange uppercase">
                    Karya Lainnya
                  </p>
                  <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-ink">
                    Kepoin Project KodeLokal Lainnya
                  </h2>
                </div>
                <Link
                  href="/#portofolio"
                  className="text-xs font-bold text-brand-blue hover:text-brand-orange"
                >
                  Lihat Semua →
                </Link>
              </div>

              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/portfolio/${rel.slug}`}
                    className="group flex flex-col"
                  >
                    <div className="surface-card relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-elevated">
                      <Image
                        src={rel.imageUrl}
                        alt={rel.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="mt-3.5 px-1">
                      <p className="text-xs font-bold text-brand-blue">
                        {rel.category} · {rel.projectYear}
                      </p>
                      <h3 className="mt-1 text-base font-extrabold text-ink transition-colors group-hover:text-brand-orange">
                        {rel.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer settings={landing.settings} />
    </div>
  );
}
