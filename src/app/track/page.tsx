import type { Metadata } from "next";
import { getPublicProjectByCode, getLandingPageData } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { ProjectTrackerClient } from "@/components/track/ProjectTrackerClient";

export const metadata: Metadata = {
  title: "Lacak Progress Project Klien",
  description:
    "Pantau perkembangan pengerjaan website dan aplikasi kamu di KodeLokal secara real-time menggunakan kode tracking.",
  alternates: {
    canonical: "/track",
  },
  openGraph: {
    title: "Lacak Progress Project Klien | KodeLokal",
    description:
      "Masukkan kode tracking dari mimin KodeLokal untuk melihat progres milestone project kamu secara langsung.",
    url: "/track",
    images: [
      {
        url: "/brand/og-kodelokal.png",
        width: 1200,
        height: 630,
        alt: "KodeLokal — Lacak Progress Project Klien",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lacak Progress Project Klien | KodeLokal",
    description:
      "Pantau progres pengerjaan website & aplikasi kamu di KodeLokal secara transparan.",
    images: ["/brand/og-kodelokal.png"],
  },
};

export const dynamic = "force-dynamic";

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const params = await searchParams;
  const code = params.code?.trim() ?? "";

  const [initialProject, landing, currentUser] = await Promise.all([
    code ? getPublicProjectByCode(code) : Promise.resolve(null),
    getLandingPageData(),
    getCurrentUser(),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar isLoggedIn={Boolean(currentUser)} />
      <main className="hero-backdrop flex-1">
        <ProjectTrackerClient initialCode={code} initialProject={initialProject} />
      </main>
      <Footer settings={landing.settings} />
    </div>
  );
}
