import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kodelokal.store";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/track"],
        disallow: ["/admin", "/login", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
