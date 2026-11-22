"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X, Compass, ShieldCheck, ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const NAV_LINKS = [
  { href: "/#layanan", label: "Layanan" },
  { href: "/#portofolio", label: "Portofolio" },
  { href: "/#alur-kerja", label: "Cara Kerja" },
  { href: "/#tim", label: "Tim Kami" },
  { href: "/#faq", label: "FAQ" },
];

export function Navbar({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <header className="glass-nav sticky top-0 z-50 w-full">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          id="nav-brand-link"
          className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded-lg"
        >
          <BrandLogo className="h-10 w-auto sm:h-11" priority />
        </Link>

        {/* Desktop Nav */}
        <nav aria-label="Navigasi utama" className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-ink-secondary transition-colors hover:bg-subtle hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/track"
            id="nav-track-link"
            className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold text-brand-blue transition-colors hover:bg-subtle"
          >
            <Compass className="h-4 w-4" />
            Lacak Project
          </Link>
        </nav>

        {/* Desktop Right Actions */}
        <div className="hidden items-center gap-2.5 lg:flex">
          <ThemeToggle />
          <Link
            href={isLoggedIn ? "/admin" : "/login"}
            id="nav-portal-link"
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-surface px-3.5 text-sm font-semibold text-ink-secondary transition-colors hover:border-brand-blue hover:text-ink"
          >
            <ShieldCheck className="h-4 w-4 text-brand-blue" />
            {isLoggedIn ? "Dashboard" : "Portal Tim"}
          </Link>
          <Link href="/#kontak" id="nav-cta-btn" className="btn-primary h-10 px-4 text-sm">
            Chat Mimin
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Mobile Controls */}
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            id="mobile-menu-toggle"
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Buka menu navigasi"
            aria-expanded={mobileOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-ink"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden border-t border-line bg-surface lg:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-3.5 py-2.5 text-sm font-medium text-ink hover:bg-subtle"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/track"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-brand-blue hover:bg-subtle"
              >
                <Compass className="h-4 w-4" />
                Lacak Project Client
              </Link>
              <div className="mt-3 flex flex-col gap-2 border-t border-line pt-3">
                <Link
                  href={isLoggedIn ? "/admin" : "/login"}
                  onClick={() => setMobileOpen(false)}
                  className="btn-secondary w-full text-sm"
                >
                  <ShieldCheck className="h-4 w-4 text-brand-blue" />
                  {isLoggedIn ? "Buka Dashboard Admin" : "Portal Tim & CMS"}
                </Link>
                <Link
                  href="/#kontak"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary w-full text-sm"
                >
                  Mulai Project Sekarang
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
