import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kodelokal.store";
const OG_IMAGE = "/brand/og-kodelokal.png";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "KodeLokal",
  category: "technology",
  title: {
    default: "KodeLokal — Mitra Digital Anda | Jasa Website, Aplikasi Web & CMS",
    template: "%s | KodeLokal",
  },
  description:
    "Bikin website, landing page, toko online UMKM, aplikasi web custom Next.js, dan CMS modern bareng mimin KodeLokal — lengkap dengan pantau progres project real-time.",
  keywords: [
    "KodeLokal",
    "kodelokal.store",
    "jasa pembuatan website",
    "jasa landing page murah profesional",
    "jasa buat web app Next.js",
    "software house Indonesia",
    "pembuatan website UMKM",
    "jasa toko online custom",
    "CMS website Indonesia",
    "Mitra Digital Anda",
  ],
  authors: [{ name: "KodeLokal", url: SITE_URL }],
  creator: "KodeLokal",
  publisher: "KodeLokal",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/brand/icon-256.png", sizes: "256x256", type: "image/png" },
      { url: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: SITE_URL,
    siteName: "KodeLokal — Mitra Digital Anda",
    title: "KodeLokal — Bikin Website & Aplikasi Nggak Pake Ribet",
    description:
      "Landing page, toko online, web app custom & CMS modern bareng mimin KodeLokal dengan pelacakan progres project secara real-time.",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "KodeLokal — Mitra Digital Anda (Logo & Maskot KodeLokal)",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@kodelokal",
    creator: "@kodelokal",
    title: "KodeLokal — Bikin Website & Aplikasi Nggak Pake Ribet",
    description:
      "Jasa landing page, toko online, aplikasi web custom & CMS modern dengan pantau progres real-time di kodelokal.store.",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "KodeLokal — Mitra Digital Anda (Logo & Maskot KodeLokal)",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafbfd" },
    { media: "(prefers-color-scheme: dark)", color: "#08131f" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${plusJakarta.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen antialiased selection:bg-brand-orange/20 selection:text-ink">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
