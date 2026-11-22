import type { Metadata } from "next";
import { getPublicProjectByCode, getLandingPageData } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { ProjectTrackerClient } from "@/components/track/ProjectTrackerClient";

export const metadata: Metadata = {
  title: "Lacak Progress Project Klien",
  description:
    "Pantau perkembangan pengerjaan website dan aplikasi Anda di KodeLokal secara real-time menggunakan kode tracking.",
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
