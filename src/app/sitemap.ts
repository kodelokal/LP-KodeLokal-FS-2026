import type { MetadataRoute } from "next";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { portfolios } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kodelokal.store";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/track`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/join`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  try {
    const publishedPortfolios = await db
      .select({ slug: portfolios.slug, updatedAt: portfolios.updatedAt })
      .from(portfolios)
      .where(eq(portfolios.isPublished, true))
      .orderBy(desc(portfolios.updatedAt));

    const portfolioRoutes: MetadataRoute.Sitemap = publishedPortfolios.map((p) => ({
      url: `${baseUrl}/portfolio/${p.slug}`,
      lastModified: p.updatedAt ?? new Date(),
      changeFrequency: "monthly",
      priority: 0.85,
    }));

    return [...staticRoutes, ...portfolioRoutes];
  } catch {
    return staticRoutes;
  }
}
