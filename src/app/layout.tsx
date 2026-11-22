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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "KodeLokal — Mitra Digital Anda | Jasa Website, Aplikasi Web & CMS",
    template: "%s | KodeLokal",
  },
  description:
    "KodeLokal membantu bisnis, UMKM, dan startup membangun landing page modern, aplikasi web custom Next.js, CMS terintegrasi, dan sistem manajemen project klien yang transparan.",
  keywords: [
    "KodeLokal",
    "kodelokal.store",
    "jasa pembuatan website",
    "jasa landing page",
    "software house Indonesia",
    "aplikasi web custom",
    "Next.js Indonesia",
  ],
  authors: [{ name: "KodeLokal", url: SITE_URL }],
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: SITE_URL,
    siteName: "KodeLokal",
    title: "KodeLokal — Mitra Digital Anda",
    description:
      "Bangun landing page, aplikasi web custom, dan sistem digital modern dengan pelacakan progress project yang transparan.",
    images: [
      {
        url: "/brand/logo-full-light.png",
        width: 930,
        height: 360,
        alt: "KodeLokal — Mitra Digital Anda",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KodeLokal — Mitra Digital Anda",
    description:
      "Mitra pengembangan website, aplikasi web custom, dan CMS modern untuk bisnis Indonesia.",
    images: ["/brand/logo-full-light.png"],
  },
  robots: {
    index: true,
    follow: true,
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
