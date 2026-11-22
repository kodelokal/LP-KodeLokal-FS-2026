import Link from "next/link";
import { eq } from "drizzle-orm";
import { CheckCircle2, Clock, KanbanSquare, Wallet, Users, ArrowRight } from "lucide-react";
import { db } from "@/db";
import { users, teamMembers } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { MascotPose } from "@/components/ui/MascotPose";

const UPCOMING_MODULES = [
  {
    title: "Worker Task & Milestone Board",
    desc: "Penugasan milestone dari Project Client langsung ke masing-masing Worker (kolom assignee_id sudah siap di Neon DB).",
    icon: KanbanSquare,
    status: "Skema DB Siap",
  },
  {
    title: "Timesheet & Workload Monitor",
    desc: "Pemantauan beban kerja developer lintas project agar CTO & PM dapat membagi tugas secara adil.",
    icon: Clock,
    status: "Fase 2",
  },
  {
    title: "Komisi, Fee & Payout Worker",
    desc: "Perhitungan otomatis komisi per milestone selesai beserta riwayat pencairan dana transparan.",
    icon: Wallet,
    status: "Fase 2",
  },
  {
    title: "Onboarding & Skill Matrix",
    desc: "Direktori keahlian worker (Next.js, Mobile, UI/UX, QA) yang terhubung dengan Struktur Tim Pengembang.",
    icon: Users,
    status: "Fase 2",
  },
];

export default async function AdminWorkersPage() {
  await requireAuth();

  const [workerUsers, workerSlots] = await Promise.all([
    db.select().from(users).where(eq(users.role, "WORKER")),
    db.select().from(teamMembers).where(eq(teamMembers.roleCode, "WORKER")),
  ]);

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="surface-card relative overflow-hidden rounded-3xl p-6 sm:p-10">
        <div className="grid items-center gap-8 md:grid-cols-12">
          <div className="md:col-span-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 font-mono text-xs font-bold text-brand-orange dark:bg-orange-500/20">
              COMING SOON · FASE 2
            </span>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
              KodeLokal Worker Hub
            </h1>
            <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-ink-secondary">
              Ruang kolaborasi khusus untuk para developer, desainer, dan kontributor dengan role{" "}
              <code className="rounded bg-subtle px-1.5 py-0.5 font-mono text-xs font-bold text-ink">
                WORKER
              </code>
              . Fondasi tabel database RBAC dan relasi penugasan milestone sudah terpasang sehingga
              siap diaktifkan kapan pun tim mulai merekrut worker.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/admin/roles" className="btn-blue text-xs">
                Kelola Role & Akun
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link href="/admin/team" className="btn-secondary text-xs">
                Atur Slot Worker di Struktur Tim
              </Link>
            </div>
          </div>

          <div className="flex justify-center md:col-span-4">
            <MascotPose pose="sleepy" size={160} bubble="Segera bangun di Fase 2!" />
          </div>
        </div>
      </div>

      {/* Upcoming Modules */}
      <div className="grid gap-5 sm:grid-cols-2">
        {UPCOMING_MODULES.map((mod) => {
          const Icon = mod.icon;
          return (
            <div key={mod.title} className="surface-card rounded-3xl p-6">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-brand-blue dark:bg-sky-500/15">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="rounded-full bg-subtle px-2.5 py-1 font-mono text-[11px] font-semibold text-ink-secondary">
                  {mod.status}
                </span>
              </div>
              <h2 className="mt-4 text-base font-bold text-ink">{mod.title}</h2>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-secondary">{mod.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Live Database Readiness */}
      <div className="surface-card rounded-3xl p-6">
        <h2 className="text-base font-bold text-ink">Kesiapan Data Worker Saat Ini</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-elevated p-4">
            <p className="text-xs font-semibold text-ink-muted">Akun dengan Role WORKER</p>
            <p className="mt-1 font-mono text-2xl font-extrabold text-brand-blue">
              {workerUsers.length}
            </p>
            <p className="mt-1 text-xs text-ink-secondary">
              Tambahkan akun worker kapan saja lewat menu User & RBAC.
            </p>
          </div>
          <div className="rounded-2xl bg-elevated p-4">
            <p className="text-xs font-semibold text-ink-muted">Slot Worker di Struktur Tim</p>
            <p className="mt-1 font-mono text-2xl font-extrabold text-brand-orange">
              {workerSlots.length}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-secondary">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              Ditampilkan otomatis di Bagan Struktur Tim Landing Page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
