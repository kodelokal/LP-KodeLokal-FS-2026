import Link from "next/link";
import { desc } from "drizzle-orm";
import {
  FolderKanban,
  Inbox,
  Briefcase,
  Network,
  ArrowRight,
  Compass,
  HardHat,
} from "lucide-react";
import { db } from "@/db";
import { clientProjects, inquiries, portfolios, teamMembers } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { PROJECT_STATUS_META, INQUIRY_STATUS_META } from "@/lib/rbac";

export default async function AdminOverviewPage() {
  const user = await requireAuth();

  const [allProjects, allInquiries, allPortfolios, allTeam] = await Promise.all([
    db.select().from(clientProjects).orderBy(desc(clientProjects.updatedAt)),
    db.select().from(inquiries).orderBy(desc(inquiries.createdAt)),
    db.select().from(portfolios),
    db.select().from(teamMembers),
  ]);

  const activeProjects = allProjects.filter((p) => p.status !== "COMPLETED").length;
  const newInquiriesCount = allInquiries.filter((i) => i.status === "NEW").length;

  const summaryCards = [
    {
      label: "Project Klien Aktif",
      value: activeProjects,
      sub: `${allProjects.length} total project`,
      href: "/admin/projects",
      icon: FolderKanban,
      accent: "orange",
    },
    {
      label: "Inquiry Baru",
      value: newInquiriesCount,
      sub: `${allInquiries.length} total pesan`,
      href: "/admin/inquiries",
      icon: Inbox,
      accent: "blue",
    },
    {
      label: "Portofolio Live",
      value: allPortfolios.filter((p) => p.isPublished).length,
      sub: `${allPortfolios.length} total karya`,
      href: "/admin/portfolio",
      icon: Briefcase,
      accent: "blue",
    },
    {
      label: "Struktur Tim",
      value: allTeam.length,
      sub: `${allTeam.filter((t) => t.isOpenPosition).length} slot mendatang`,
      href: "/admin/team",
      icon: Network,
      accent: "orange",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold tracking-widest text-brand-blue uppercase">
            Dashboard Operasional
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Halo, {user.name}
          </h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Pantau project klien, tindak lanjuti prospek baru, dan perbarui konten website{" "}
            <span className="font-mono font-semibold text-ink">kodelokal.store</span> dari satu
            tempat.
          </p>
        </div>
        <Link href="/admin/projects" className="btn-primary text-sm">
          Kelola Project Client
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          const isOrange = card.accent === "orange";
          return (
            <Link
              key={card.label}
              href={card.href}
              className="surface-card surface-card-interactive rounded-2xl p-5"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${
                    isOrange
                      ? "bg-orange-100 text-brand-orange dark:bg-orange-500/15"
                      : "bg-sky-100 text-brand-blue dark:bg-sky-500/15"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <ArrowRight className="h-4 w-4 text-ink-muted" />
              </div>
              <p className="mt-4 font-mono text-3xl font-extrabold text-ink">{card.value}</p>
              <p className="mt-0.5 text-sm font-bold text-ink">{card.label}</p>
              <p className="mt-0.5 text-xs text-ink-muted">{card.sub}</p>
            </Link>
          );
        })}
      </div>

      {/* Recent Projects & Inquiries */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="surface-card rounded-3xl p-6 lg:col-span-7">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink">Project Client Terbaru</h2>
            <Link
              href="/admin/projects"
              className="text-xs font-semibold text-brand-blue hover:underline"
            >
              Lihat Semua →
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {allProjects.slice(0, 4).map((p) => (
              <Link
                key={p.id}
                href={`/admin/projects/${p.id}`}
                className="block rounded-2xl border border-line bg-elevated/60 p-4 transition-colors hover:border-brand-blue"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-brand-blue">
                    <Compass className="h-3.5 w-3.5" />
                    {p.trackingCode}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      PROJECT_STATUS_META[p.status].badgeClass
                    }`}
                  >
                    {PROJECT_STATUS_META[p.status].label}
                  </span>
                </div>
                <p className="mt-1.5 text-sm font-bold text-ink">{p.title}</p>
                <div className="mt-2 flex items-center justify-between text-xs text-ink-secondary">
                  <span>{p.clientName}</span>
                  <span className="font-mono font-bold text-brand-orange">{p.progress}%</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full rounded-full bg-brand-orange"
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
              </Link>
            ))}
            {allProjects.length === 0 && (
              <p className="py-6 text-center text-sm text-ink-muted">Belum ada project klien.</p>
            )}
          </div>
        </div>

        <div className="space-y-6 lg:col-span-5">
          <div className="surface-card rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink">Inbox Inquiry Terbaru</h2>
              <Link
                href="/admin/inquiries"
                className="text-xs font-semibold text-brand-blue hover:underline"
              >
                Kelola →
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {allInquiries.slice(0, 3).map((inq) => (
                <div key={inq.id} className="rounded-2xl border border-line bg-elevated/60 p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-bold text-ink">{inq.name}</p>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        INQUIRY_STATUS_META[inq.status].badgeClass
                      }`}
                    >
                      {INQUIRY_STATUS_META[inq.status].label}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-brand-blue">{inq.serviceInterest}</p>
                  <p className="mt-1.5 line-clamp-2 text-xs text-ink-secondary">{inq.message}</p>
                </div>
              ))}
              {allInquiries.length === 0 && (
                <p className="py-4 text-center text-sm text-ink-muted">Belum ada pesan masuk.</p>
              )}
            </div>
          </div>

          <Link
            href="/admin/workers"
            className="surface-card surface-card-interactive flex items-center justify-between gap-4 rounded-3xl bg-subtle/60 p-5"
          >
            <div className="flex items-center gap-3.5">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-brand-orange dark:bg-orange-500/20">
                <HardHat className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-ink">Worker Hub (Segera Hadir)</p>
                <p className="text-xs text-ink-secondary">
                  Lihat kesiapan skema penugasan Worker & RBAC.
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-brand-orange" />
          </Link>
        </div>
      </div>
    </div>
  );
}
