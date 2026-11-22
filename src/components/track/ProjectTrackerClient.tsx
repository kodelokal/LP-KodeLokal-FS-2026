"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Search,
  CheckCircle2,
  Clock,
  CircleDashed,
  ExternalLink,
  Calendar,
  Building2,
  Loader2,
} from "lucide-react";
import type { ProjectStatus, TaskStatus } from "@/db/schema";
import { PROJECT_STATUS_META, TASK_STATUS_META } from "@/lib/rbac";
import { MascotPose } from "@/components/ui/MascotPose";

export type PublicTrackedProject = {
  id: string;
  trackingCode: string;
  title: string;
  clientName: string;
  clientCompany: string | null;
  serviceCategory: string;
  status: ProjectStatus;
  progress: number;
  startDate: string | null;
  dueDate: string | null;
  stagingUrl: string | null;
  updatedAt: string | Date;
  milestones: {
    id: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    dueDate: string | null;
    completedAt: string | Date | null;
  }[];
};

export function ProjectTrackerClient({
  initialCode = "",
  initialProject = null,
}: {
  initialCode?: string;
  initialProject?: PublicTrackedProject | null;
}) {
  const [code, setCode] = React.useState(initialCode);
  const [project, setProject] = React.useState<PublicTrackedProject | null>(initialProject);
  const [error, setError] = React.useState<string | null>(
    initialCode && !initialProject
      ? `Project dengan kode "${initialCode.toUpperCase()}" tidak ditemukan.`
      : null
  );
  const [loading, setLoading] = React.useState(false);

  async function lookup(targetCode: string) {
    const cleaned = targetCode.trim().toUpperCase();
    if (!cleaned) return;
    setLoading(true);
    setError(null);
    setCode(cleaned);

    try {
      const res = await fetch(`/api/track?code=${encodeURIComponent(cleaned)}`);
      const data = await res.json();
      if (!res.ok) {
        setProject(null);
        setError(data.error || "Kode tracking tidak ditemukan.");
      } else {
        setProject(data.project);
        window.history.replaceState(null, "", `/track?code=${encodeURIComponent(cleaned)}`);
      }
    } catch {
      setError("Gagal menghubungi server. Coba lagi beberapa saat.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="text-center">
        <p className="text-xs font-bold tracking-widest text-brand-blue uppercase">
          Client Project Tracker
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.025em] text-ink sm:text-4xl">
          Lacak Progress Project Secara Real-Time
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-ink-secondary sm:text-base">
          Masukkan kode tracking yang diberikan oleh Project Manager KodeLokal untuk memantau
          status pengerjaan, persentase selesai, dan tahapan milestone terbaru.
        </p>
      </div>

      {/* Search Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          lookup(code);
        }}
        className="surface-card mx-auto mt-8 flex max-w-xl flex-col gap-3 rounded-2xl p-3 sm:flex-row"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            id="track-code-input"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Masukkan kode, mis. KL-2026-001"
            className="input-field pl-10 font-mono uppercase"
          />
        </div>
        <button
          id="track-search-btn"
          type="submit"
          disabled={loading}
          className="btn-primary shrink-0 text-sm disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Lacak Sekarang
        </button>
      </form>

      {/* Demo quick codes */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-ink-muted">
        <span>Coba kode demo:</span>
        {["KL-2026-001", "KL-2026-002"].map((demo) => (
          <button
            key={demo}
            type="button"
            onClick={() => lookup(demo)}
            className="rounded-lg border border-line bg-surface px-2.5 py-1 font-mono font-semibold text-brand-blue transition-colors hover:border-brand-orange hover:text-brand-orange"
          >
            {demo}
          </button>
        ))}
      </div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="surface-card mt-10 flex flex-col items-center rounded-3xl p-8 text-center"
        >
          <MascotPose pose="confused" size={120} float={false} />
          <h2 className="mt-4 text-lg font-bold text-ink">Kode Tidak Ditemukan</h2>
          <p className="mt-1 text-sm text-ink-secondary">{error}</p>
        </motion.div>
      )}

      {/* Initial Empty State */}
      {!project && !error && (
        <div className="surface-card mt-10 flex flex-col items-center rounded-3xl p-10 text-center">
          <MascotPose pose="coding" size={135} bubble="Masukkan kode project kamu di atas!" />
          <p className="mt-4 max-w-md text-sm text-ink-secondary">
            Data progress diperbarui langsung oleh tim developer dan PM KodeLokal setiap kali
            sebuah milestone diselesaikan.
          </p>
        </div>
      )}

      {/* Project Result */}
      {project && (
        <motion.div
          key={project.trackingCode}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mt-10 space-y-6"
        >
          {/* Summary Card */}
          <div className="surface-card rounded-3xl p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-subtle px-2.5 py-1 font-mono text-xs font-bold text-brand-blue">
                    {project.trackingCode}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      PROJECT_STATUS_META[project.status].badgeClass
                    }`}
                  >
                    {PROJECT_STATUS_META[project.status].label}
                  </span>
                  <span className="rounded-lg bg-elevated px-2.5 py-1 text-xs font-medium text-ink-secondary">
                    {project.serviceCategory}
                  </span>
                </div>
                <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-ink">
                  {project.title}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-ink-secondary">
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-brand-orange" />
                    {project.clientName}
                    {project.clientCompany ? ` · ${project.clientCompany}` : ""}
                  </span>
                  {project.dueDate && (
                    <span className="inline-flex items-center gap-1.5 font-mono">
                      <Calendar className="h-3.5 w-3.5 text-brand-blue" />
                      Target: {project.dueDate}
                    </span>
                  )}
                </div>
              </div>

              {project.stagingUrl && (
                <a
                  href={project.stagingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-xs"
                >
                  Preview Staging
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mt-6 rounded-2xl bg-elevated p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-ink">Progress Keseluruhan</span>
                <span className="font-mono text-lg font-extrabold text-brand-orange">
                  {project.progress}%
                </span>
              </div>
              <div className="mt-2.5 h-3 w-full overflow-hidden rounded-full bg-line">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, Math.max(0, project.progress))}%` }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="h-full rounded-full bg-brand-orange"
                />
              </div>
            </div>
          </div>

          {/* Milestones Timeline */}
          <div className="surface-card rounded-3xl p-6 sm:p-8">
            <h3 className="text-lg font-bold text-ink">Tahapan Milestone</h3>
            {project.milestones.length === 0 ? (
              <p className="mt-3 text-sm text-ink-secondary">
                Milestone detail sedang disusun oleh tim Project Manager.
              </p>
            ) : (
              <ol className="mt-6 space-y-4">
                {project.milestones.map((m, idx) => {
                  const isDone = m.status === "DONE";
                  const isWorking = m.status === "IN_PROGRESS" || m.status === "REVIEW";
                  return (
                    <li
                      key={m.id}
                      className="flex gap-4 rounded-2xl border border-line bg-elevated/60 p-4"
                    >
                      <div className="mt-0.5 shrink-0">
                        {isDone ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        ) : isWorking ? (
                          <Clock className="h-5 w-5 text-brand-orange" />
                        ) : (
                          <CircleDashed className="h-5 w-5 text-ink-muted" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-bold text-ink">
                            {idx + 1}. {m.title}
                          </p>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                              TASK_STATUS_META[m.status].badgeClass
                            }`}
                          >
                            {TASK_STATUS_META[m.status].label}
                          </span>
                        </div>
                        {m.description && (
                          <p className="mt-1 text-xs leading-relaxed text-ink-secondary">
                            {m.description}
                          </p>
                        )}
                        {m.dueDate && (
                          <p className="mt-2 font-mono text-[11px] text-ink-muted">
                            Estimasi selesai: {m.dueDate}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
