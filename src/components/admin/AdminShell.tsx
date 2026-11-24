"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Inbox,
  FileEdit,
  Briefcase,
  Network,
  Shield,
  HardHat,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Loader2,
} from "lucide-react";
import type { SafeUser } from "@/lib/auth";
import { ROLE_META, hasPermission } from "@/lib/rbac";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  show?: boolean;
};

export function AdminShell({
  user,
  newInquiryCount,
  pendingWorkerAppsCount = 0,
  children,
}: {
  user: SafeUser;
  newInquiryCount: number;
  pendingWorkerAppsCount?: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [loggingOut, setLoggingOut] = React.useState(false);

  const isWorkerOnly = user.role === "WORKER";

  const navGroups: { title: string; items: NavItem[] }[] = [
    {
      title: "Utama",
      items: [{ href: "/admin", label: "Ringkasan", icon: LayoutDashboard, show: true }],
    },
    {
      title: "Operasional Klien",
      items: [
        {
          href: "/admin/projects",
          label: "Project Client",
          icon: FolderKanban,
          show: true,
        },
        {
          href: "/admin/inquiries",
          label: "Inbox Inquiry",
          icon: Inbox,
          badge: newInquiryCount > 0 ? String(newInquiryCount) : undefined,
          show: !isWorkerOnly,
        },
        {
          href: "/admin/workers",
          label: "Worker Hub",
          icon: HardHat,
          badge: pendingWorkerAppsCount > 0 ? String(pendingWorkerAppsCount) : undefined,
          show: true,
        },
      ],
    },
    {
      title: "CMS Website",
      items: [
        {
          href: "/admin/cms",
          label: "Konten & Pengaturan",
          icon: FileEdit,
          show: !isWorkerOnly,
        },
        {
          href: "/admin/portfolio",
          label: "Portofolio",
          icon: Briefcase,
          show: !isWorkerOnly,
        },
        {
          href: "/admin/team",
          label: "Struktur Tim",
          icon: Network,
          show: !isWorkerOnly,
        },
      ],
    },
    {
      title: "Akses & Organisasi",
      items: [
        {
          href: "/admin/roles",
          label: "User & RBAC",
          icon: Shield,
          show: hasPermission(user.role, "users:manage") || !isWorkerOnly,
        },
      ],
    },
  ].filter((g) => g.items.some((i) => i.show !== false));

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  const roleMeta = ROLE_META[user.role];

  const SidebarContent = (
    <div className="flex h-full flex-col bg-surface">
      <div className="flex h-16 items-center justify-between border-b border-line px-5">
        <Link href="/admin" className="flex items-center gap-2">
          <BrandLogo className="h-8 w-auto" />
        </Link>
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-secondary hover:bg-subtle lg:hidden"
          aria-label="Tutup menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {navGroups.map((group) => (
          <div key={group.title}>
            <p className="px-3 text-[11px] font-bold tracking-wider text-ink-muted uppercase">
              {group.title}
            </p>
            <div className="mt-2 space-y-1">
              {group.items
                .filter((i) => i.show !== false)
                .map((item) => {
                  const Icon = item.icon;
                  const active =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                        active
                          ? "bg-brand-blue text-white shadow-xs"
                          : "text-ink-secondary hover:bg-subtle hover:text-ink"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </span>
                      {item.badge && (
                        <span
                          className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${
                            active
                              ? "bg-white/20 text-white"
                              : item.badge === "Soon"
                                ? "bg-orange-100 text-brand-orange dark:bg-orange-500/20"
                                : "bg-brand-orange text-white"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom User Card */}
      <div className="border-t border-line p-4">
        <div className="rounded-2xl bg-elevated p-3.5">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-bold text-ink">{user.name}</p>
            <span className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-bold ${roleMeta.badgeClass}`}>
              {user.role}
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-ink-muted">{user.email}</p>
          <div className="mt-3 flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs font-semibold text-ink hover:border-brand-blue"
            >
              <ExternalLink className="h-3.5 w-3.5 text-brand-blue" />
              Website
            </Link>
            <button
              id="admin-logout-btn"
              type="button"
              disabled={loggingOut}
              onClick={handleLogout}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-60 dark:text-rose-400 dark:hover:bg-rose-500/10"
            >
              {loggingOut ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <LogOut className="h-3.5 w-3.5" />
              )}
              {loggingOut ? "Keluar..." : "Keluar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Desktop Sidebar */}
      <aside className="hidden w-68 shrink-0 border-r border-line lg:block">
        <div className="sticky top-0 h-screen">{SidebarContent}</div>
      </aside>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 flex bg-slate-950/50 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="w-72 max-w-[85vw]" onClick={(e) => e.stopPropagation()}>
            {SidebarContent}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="glass-nav sticky top-0 z-30 flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Buka navigasi admin"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-ink lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-xs font-semibold text-ink-muted">KodeLokal Control Center</p>
              <p className="text-sm font-bold text-ink">Portal CMS & Project Client</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/track"
              className="hidden rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold text-ink-secondary hover:border-brand-blue hover:text-ink sm:inline-flex"
            >
              Halaman Tracking Publik
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
