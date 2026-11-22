import Link from "next/link";
import { Compass, ShieldCheck } from "lucide-react";
import type { SiteSettings } from "@/db/schema";
import { BrandLogo } from "@/components/ui/BrandLogo";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export function Footer({ settings }: { settings: SiteSettings }) {
  const socials = settings.socialLinks ?? {};

  return (
    <footer className="border-t border-line bg-surface pt-14 pb-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Link href="/" className="inline-flex">
              <BrandLogo className="h-11 w-auto" />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-secondary">
              {settings.aboutDescription}
            </p>
            <div className="mt-5 flex items-center gap-2.5">
              {socials.instagram && (
                <a
                  href={socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram KodeLokal"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-line text-ink-secondary transition-colors hover:border-brand-orange hover:text-brand-orange"
                >
                  <InstagramIcon className="h-4 w-4" />
                </a>
              )}
              {socials.github && (
                <a
                  href={socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub KodeLokal"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-line text-ink-secondary transition-colors hover:border-brand-blue hover:text-brand-blue"
                >
                  <GithubIcon className="h-4 w-4" />
                </a>
              )}
              {socials.linkedin && (
                <a
                  href={socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn KodeLokal"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-line text-ink-secondary transition-colors hover:border-brand-blue hover:text-brand-blue"
                >
                  <LinkedinIcon className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-xs font-bold tracking-wider text-ink uppercase">Navigasi</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-secondary">
              <li>
                <Link href="/#layanan" className="hover:text-brand-blue">
                  Layanan Pengembangan
                </Link>
              </li>
              <li>
                <Link href="/#portofolio" className="hover:text-brand-blue">
                  Hasil Portofolio
                </Link>
              </li>
              <li>
                <Link href="/#alur-kerja" className="hover:text-brand-blue">
                  Alur Kerja
                </Link>
              </li>
              <li>
                <Link href="/#tim" className="hover:text-brand-blue">
                  Struktur Tim Pengembang
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-brand-blue">
                  Pertanyaan Umum
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h3 className="text-xs font-bold tracking-wider text-ink uppercase">
              Portal & Akses Cepat
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-secondary">
              <li>
                <Link href="/track" className="inline-flex items-center gap-2 hover:text-brand-orange">
                  <Compass className="h-4 w-4 text-brand-orange" />
                  Lacak Progress Project Klien
                </Link>
              </li>
              <li>
                <Link href="/login" className="inline-flex items-center gap-2 hover:text-brand-blue">
                  <ShieldCheck className="h-4 w-4 text-brand-blue" />
                  Login Portal Tim & CMS
                </Link>
              </li>
              <li className="pt-2 text-xs text-ink-muted">
                {settings.contactEmail} · {settings.officeAddress}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 text-xs text-ink-muted sm:flex-row">
          <p>
            © {new Date().getFullYear()} {settings.brandName} ({settings.tagline}). Hak cipta
            dilindungi.
          </p>
          <p className="font-mono">kodelokal.store</p>
        </div>
      </div>
    </footer>
  );
}
