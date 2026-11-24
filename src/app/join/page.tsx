import type { Metadata } from "next";
import { getLandingPageData } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { JoinWorkerClient } from "@/components/join/JoinWorkerClient";

export const metadata: Metadata = {
  title: "Gabung Jadi Worker KodeLokal",
  description:
    "Daftar jadi Worker remote di KodeLokal (Full-Stack, Frontend, Backend, UI/UX, Mobile, QA). Kerja berbasis milestone dengan sistem Worker Hub & komisi transparan.",
  alternates: {
    canonical: "/join",
  },
  openGraph: {
    title: "Gabung Jadi Worker KodeLokal — Remote Digital Squad",
    description:
      "Yuk gabung jadi bagian dari Worker Squad KodeLokal! Kerja fleksibel berbasis milestone dengan fee transparan.",
    url: "/join",
    images: [
      {
        url: "/brand/og-kodelokal.png",
        width: 1200,
        height: 630,
        alt: "Gabung Jadi Worker KodeLokal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gabung Jadi Worker KodeLokal",
    description:
      "Daftar jadi Worker remote KodeLokal dan bangun produk digital bareng mimin!",
    images: ["/brand/og-kodelokal.png"],
  },
};

export const dynamic = "force-dynamic";

export default async function JoinWorkerPage() {
  const [landing, currentUser] = await Promise.all([getLandingPageData(), getCurrentUser()]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar isLoggedIn={Boolean(currentUser)} />
      <main className="flex-1">
        <JoinWorkerClient />
      </main>
      <Footer settings={landing.settings} />
    </div>
  );
}
