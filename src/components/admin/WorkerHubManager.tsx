"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  KanbanSquare,
  Users,
  Clock,
  Wallet,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  CheckCircle2,
  CircleDashed,
  Coins,
  ExternalLink,
  Calendar,
  Building2,
} from "lucide-react";
import type {
  ClientProject,
  ProjectMilestone,
  WorkerProfile,
  WorkerWorkLog,
  WorkerPayout,
  TaskStatus,
  PayoutStatus,
  UserRole,
} from "@/db/schema";
import {
  TASK_STATUS_META,
  AVAILABILITY_META,
  PAYOUT_STATUS_META,
  ROLE_META,
  formatRupiah,
} from "@/lib/rbac";
import {
  onboardWorkerAction,
  upsertWorkerProfileAction,
  assignWorkerTaskAction,
  workerUpdateTaskStatusAction,
  createWorkLogAction,
  deleteWorkLogAction,
  createPayoutAction,
  generatePayoutFromMilestoneAction,
  updatePayoutStatusAction,
  deletePayoutAction,
} from "@/actions/workers";
import { deleteMilestoneAction } from "@/actions/projects";
import {
  AdminModal,
  ConfirmDeleteModal,
  AdminToast,
  useAdminToast,
} from "@/components/admin/AdminModal";

export type WorkerDirectoryEntry = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  isActive: boolean;
  profile: WorkerProfile | null;
};

type HubTab = "tasks" | "directory" | "timesheet" | "payouts";

const TASK_COLUMNS: { key: TaskStatus; label: string; accent: string }[] = [
  { key: "TODO", label: "Menunggu", accent: "bg-slate-400" },
  { key: "IN_PROGRESS", label: "Dikerjakan", accent: "bg-brand-blue" },
  { key: "REVIEW", label: "Review", accent: "bg-brand-amber" },
  { key: "DONE", label: "Selesai", accent: "bg-emerald-500" },
];

function formatDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}j`;
  return `${h}j ${m}m`;
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

export function WorkerHubManager({
  actorId,
  actorRole,
  canManage,
  workers,
  projects,
  milestones,
  workLogs,
  payouts,
}: {
  actorId: string;
  actorRole: UserRole;
  canManage: boolean;
  workers: WorkerDirectoryEntry[];
  projects: ClientProject[];
  milestones: ProjectMilestone[];
  workLogs: WorkerWorkLog[];
  payouts: WorkerPayout[];
}) {
  const router = useRouter();
  const { toast, showToast, clearToast } = useAdminToast();

  const [activeTab, setActiveTab] = React.useState<HubTab>("tasks");
  const [filterWorkerId, setFilterWorkerId] = React.useState<string>("ALL");
  const [filterProjectId, setFilterProjectId] = React.useState<string>("ALL");

  // Modal states
  const [onboardOpen, setOnboardOpen] = React.useState(false);
  const [editingProfile, setEditingProfile] = React.useState<WorkerDirectoryEntry | null>(null);
  const [taskModal, setTaskModal] = React.useState<"create" | ProjectMilestone | null>(null);
  const [workLogOpen, setWorkLogOpen] = React.useState(false);
  const [payoutOpen, setPayoutOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<
    | { kind: "milestone"; item: ProjectMilestone }
    | { kind: "worklog"; item: WorkerWorkLog }
    | { kind: "payout"; item: WorkerPayout }
    | null
  >(null);

  // Loading states
  const [submitting, setSubmitting] = React.useState(false);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [selectedLogProjectId, setSelectedLogProjectId] = React.useState<string>(
    projects[0]?.id ?? ""
  );

  // Quick lookup maps
  const workerMap = React.useMemo(() => new Map(workers.map((w) => [w.id, w])), [workers]);
  const projectMap = React.useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);
  const milestoneMap = React.useMemo(
    () => new Map(milestones.map((m) => [m.id, m])),
    [milestones]
  );
  const payoutMilestoneIds = React.useMemo(
    () => new Set(payouts.map((p) => p.milestoneId).filter(Boolean) as string[]),
    [payouts]
  );

  // Filtered tasks for Task Board
  const visibleMilestones = React.useMemo(() => {
    return milestones.filter((m) => {
      if (!canManage && m.assigneeId !== actorId) return false;
      if (filterProjectId !== "ALL" && m.projectId !== filterProjectId) return false;
      if (canManage && filterWorkerId !== "ALL") {
        if (filterWorkerId === "UNASSIGNED") return !m.assigneeId;
        return m.assigneeId === filterWorkerId;
      }
      return true;
    });
  }, [milestones, canManage, actorId, filterProjectId, filterWorkerId]);

  // Scoped work logs & payouts
  const visibleWorkLogs = React.useMemo(
    () => (canManage ? workLogs : workLogs.filter((l) => l.workerId === actorId)),
    [workLogs, canManage, actorId]
  );
  const visiblePayouts = React.useMemo(
    () => (canManage ? payouts : payouts.filter((p) => p.workerId === actorId)),
    [payouts, canManage, actorId]
  );

  // Summary metrics
  const activeTaskCount = visibleMilestones.filter((m) => m.status !== "DONE").length;
  const totalLoggedMinutes = visibleWorkLogs.reduce((acc, l) => acc + l.durationMinutes, 0);
  const totalPendingAmount = visiblePayouts
    .filter((p) => p.status === "PENDING")
    .reduce((acc, p) => acc + p.amount, 0);
  const totalApprovedAmount = visiblePayouts
    .filter((p) => p.status === "APPROVED")
    .reduce((acc, p) => acc + p.amount, 0);
  const totalPaidAmount = visiblePayouts
    .filter((p) => p.status === "PAID")
    .reduce((acc, p) => acc + p.amount, 0);

  const actorWorkerEntry = workerMap.get(actorId) ?? null;

  // Handlers
  async function handleOnboard(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await onboardWorkerAction(new FormData(e.currentTarget));
      if (res.ok) {
        setOnboardOpen(false);
        showToast("success", res.message);
        router.refresh();
      } else {
        showToast("error", res.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await upsertWorkerProfileAction(new FormData(e.currentTarget));
      if (res.ok) {
        setEditingProfile(null);
        showToast("success", res.message);
        router.refresh();
      } else {
        showToast("error", res.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await assignWorkerTaskAction(new FormData(e.currentTarget));
      if (res.ok) {
        setTaskModal(null);
        showToast("success", res.message);
        router.refresh();
      } else {
        showToast("error", res.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleQuickTaskStatus(m: ProjectMilestone, nextStatus: TaskStatus) {
    setBusyId(m.id);
    try {
      const res = await workerUpdateTaskStatusAction(m.id, nextStatus);
      showToast(res.ok ? "success" : "error", res.message);
      if (res.ok) router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function handleGeneratePayout(m: ProjectMilestone) {
    setBusyId(`payout-${m.id}`);
    try {
      const res = await generatePayoutFromMilestoneAction(m.id);
      showToast(res.ok ? "success" : "error", res.message);
      if (res.ok) router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function handleAddWorkLog(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await createWorkLogAction(new FormData(e.currentTarget));
      if (res.ok) {
        setWorkLogOpen(false);
        showToast("success", res.message);
        router.refresh();
      } else {
        showToast("error", res.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCreatePayout(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await createPayoutAction(new FormData(e.currentTarget));
      if (res.ok) {
        setPayoutOpen(false);
        showToast("success", res.message);
        router.refresh();
      } else {
        showToast("error", res.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePayoutStatus(p: WorkerPayout, status: PayoutStatus) {
    setBusyId(`paystat-${p.id}`);
    try {
      const res = await updatePayoutStatusAction(p.id, status);
      showToast(res.ok ? "success" : "error", res.message);
      if (res.ok) router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      const res =
        deleteTarget.kind === "milestone"
          ? await deleteMilestoneAction(deleteTarget.item.id, deleteTarget.item.projectId)
          : deleteTarget.kind === "worklog"
            ? await deleteWorkLogAction(deleteTarget.item.id)
            : await deletePayoutAction(deleteTarget.item.id);
      if (res.ok) {
        setDeleteTarget(null);
        showToast("success", res.message);
        router.refresh();
      } else {
        showToast("error", res.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  const tabs: { id: HubTab; label: string; icon: React.ComponentType<{ className?: string }>; count?: number }[] = [
    { id: "tasks", label: "Task Board", icon: KanbanSquare, count: activeTaskCount },
    { id: "directory", label: "Direktori & Beban Kerja", icon: Users, count: workers.length },
    { id: "timesheet", label: "Timesheet", icon: Clock, count: visibleWorkLogs.length },
    { id: "payouts", label: "Komisi & Payout", icon: Wallet, count: visiblePayouts.length },
  ];

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold tracking-widest text-brand-orange uppercase">
            KodeLokal Worker Hub · {actorRole}
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            {canManage ? "Pusat Manajemen Worker & Tugas" : "Ruang Kerja Worker"}
          </h1>
          <p className="mt-1 text-sm text-ink-secondary">
            {canManage
              ? "Bagi tugas milestone ke worker, pantau beban kerja, catat timesheet, dan kelola pencairan komisi dalam satu dashboard."
              : "Pantau tugas milestone kamu, catat jam kerja harian, dan cek status pencairan komisi secara transparan."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!canManage && actorWorkerEntry && (
            <button
              type="button"
              onClick={() => setEditingProfile(actorWorkerEntry)}
              className="btn-secondary px-3.5 py-2 text-xs"
            >
              <Pencil className="h-3.5 w-3.5 text-brand-blue" />
              Profil &amp; Rekening Saya
            </button>
          )}
          <button
            type="button"
            onClick={() => setWorkLogOpen(true)}
            className="btn-secondary px-3.5 py-2 text-xs"
          >
            <Clock className="h-3.5 w-3.5 text-brand-blue" />
            Catat Jam Kerja
          </button>
          {canManage && (
            <>
              <button
                type="button"
                onClick={() => setOnboardOpen(true)}
                className="btn-blue px-3.5 py-2 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                Tambah Worker
              </button>
              <button
                type="button"
                onClick={() => setTaskModal("create")}
                className="btn-primary px-3.5 py-2 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                Tugaskan Milestone
              </button>
            </>
          )}
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="surface-card rounded-2xl p-4">
          <p className="text-xs font-semibold text-ink-muted">Tugas Aktif</p>
          <p className="mt-1 font-mono text-2xl font-extrabold text-brand-orange">
            {activeTaskCount}
          </p>
          <p className="mt-0.5 text-[11px] text-ink-secondary">
            dari {visibleMilestones.length} total milestone
          </p>
        </div>
        <div className="surface-card rounded-2xl p-4">
          <p className="text-xs font-semibold text-ink-muted">Total Jam Tercatat</p>
          <p className="mt-1 font-mono text-2xl font-extrabold text-brand-blue">
            {formatDuration(totalLoggedMinutes)}
          </p>
          <p className="mt-0.5 text-[11px] text-ink-secondary">
            {visibleWorkLogs.length} entri timesheet
          </p>
        </div>
        <div className="surface-card rounded-2xl p-4">
          <p className="text-xs font-semibold text-ink-muted">Komisi Pending &amp; Siap Cair</p>
          <p className="mt-1 font-mono text-xl font-extrabold text-amber-600 dark:text-amber-400">
            {formatRupiah(totalPendingAmount + totalApprovedAmount)}
          </p>
          <p className="mt-0.5 text-[11px] text-ink-secondary">
            Disetujui: {formatRupiah(totalApprovedAmount)}
          </p>
        </div>
        <div className="surface-card rounded-2xl p-4">
          <p className="text-xs font-semibold text-ink-muted">Total Komisi Dicairkan</p>
          <p className="mt-1 font-mono text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatRupiah(totalPaidAmount)}
          </p>
          <p className="mt-0.5 text-[11px] text-ink-secondary">
            {visiblePayouts.filter((p) => p.status === "PAID").length} transaksi selesai
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-line pb-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
                active
                  ? "bg-brand-blue text-white shadow-xs"
                  : "border border-line bg-surface text-ink-secondary hover:border-brand-blue hover:text-ink"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
              {typeof tab.count === "number" && (
                <span
                  className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] ${
                    active ? "bg-white/20 text-white" : "bg-subtle text-ink-muted"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ==================== TAB 1: TASK BOARD ==================== */}
      {activeTab === "tasks" && (
        <div className="space-y-5">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              aria-label="Filter berdasarkan project"
              value={filterProjectId}
              onChange={(e) => setFilterProjectId(e.target.value)}
              className="input-field w-auto min-w-[200px] py-1.5 text-xs"
            >
              <option value="ALL">Semua Project ({projects.length})</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.trackingCode}] {p.title}
                </option>
              ))}
            </select>

            {canManage && (
              <select
                aria-label="Filter berdasarkan worker"
                value={filterWorkerId}
                onChange={(e) => setFilterWorkerId(e.target.value)}
                className="input-field w-auto min-w-[190px] py-1.5 text-xs"
              >
                <option value="ALL">Semua Worker</option>
                <option value="UNASSIGNED">Belum Ditugaskan</option>
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.role})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 4-Column Kanban Status Board */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {TASK_COLUMNS.map((col) => {
              const colTasks = visibleMilestones.filter((m) => m.status === col.key);
              return (
                <div
                  key={col.key}
                  className="flex flex-col rounded-3xl border border-line bg-elevated/50 p-3.5"
                >
                  <div className="flex items-center justify-between px-1 pb-3">
                    <span className="inline-flex items-center gap-2 text-xs font-extrabold text-ink">
                      <span className={`h-2.5 w-2.5 rounded-full ${col.accent}`} />
                      {col.label}
                    </span>
                    <span className="rounded-full bg-surface px-2 py-0.5 font-mono text-[11px] font-bold text-ink-muted">
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {colTasks.map((m) => {
                      const proj = projectMap.get(m.projectId);
                      const assignee = m.assigneeId ? workerMap.get(m.assigneeId) : null;
                      const isBusy = busyId === m.id;
                      const isGeneratingPayout = busyId === `payout-${m.id}`;
                      const alreadyHasPayout = payoutMilestoneIds.has(m.id);

                      return (
                        <div key={m.id} className="surface-card rounded-2xl p-3.5">
                          <div className="flex items-start justify-between gap-2">
                            {proj ? (
                              <Link
                                href={`/admin/projects/${proj.id}`}
                                className="inline-flex items-center gap-1 rounded-md bg-subtle px-2 py-0.5 font-mono text-[10px] font-bold text-brand-blue hover:underline"
                              >
                                {proj.trackingCode}
                              </Link>
                            ) : (
                              <span />
                            )}
                            {m.feeAmount > 0 && (
                              <span className="font-mono text-[10px] font-bold text-brand-orange">
                                {formatRupiah(m.feeAmount)}
                              </span>
                            )}
                          </div>

                          <p className="mt-2 text-sm font-bold leading-snug text-ink">{m.title}</p>
                          {m.description && (
                            <p className="mt-1 line-clamp-2 text-[11px] text-ink-secondary">
                              {m.description}
                            </p>
                          )}

                          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[10px] text-ink-muted">
                            {assignee ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-sky-100/80 px-2 py-0.5 font-semibold text-sky-900 dark:bg-sky-500/20 dark:text-sky-200">
                                {assignee.name}
                              </span>
                            ) : (
                              <span className="rounded-full border border-dashed border-line-strong px-2 py-0.5 italic">
                                Belum ditugaskan
                              </span>
                            )}
                            {m.estimatedHours > 0 && (
                              <span className="font-mono">Est. {m.estimatedHours}j</span>
                            )}
                            {m.dueDate && (
                              <span className="inline-flex items-center gap-0.5 font-mono">
                                <Calendar className="h-2.5 w-2.5" />
                                {m.dueDate}
                              </span>
                            )}
                          </div>

                          {/* Quick status switcher & actions */}
                          <div className="mt-3 flex items-center gap-1.5 border-t border-line pt-2.5">
                            {isBusy && (
                              <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-brand-blue" />
                            )}
                            <select
                              aria-label={`Ubah status ${m.title}`}
                              disabled={isBusy}
                              value={m.status}
                              onChange={(e) =>
                                handleQuickTaskStatus(m, e.target.value as TaskStatus)
                              }
                              className="input-field flex-1 py-1 text-[11px] disabled:opacity-60"
                            >
                              <option value="TODO">Menunggu</option>
                              <option value="IN_PROGRESS">Dikerjakan</option>
                              <option value="REVIEW">Review</option>
                              <option value="DONE">Selesai</option>
                            </select>

                            {canManage && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setTaskModal(m)}
                                  aria-label={`Edit tugas ${m.title}`}
                                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-brand-blue hover:border-brand-blue"
                                >
                                  <Pencil className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteTarget({ kind: "milestone", item: m })}
                                  aria-label={`Hapus tugas ${m.title}`}
                                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </>
                            )}
                          </div>

                          {/* 1-click Generate Payout button when milestone is DONE & has fee */}
                          {canManage &&
                            m.status === "DONE" &&
                            m.assigneeId &&
                            m.feeAmount > 0 && (
                              <div className="mt-2">
                                {alreadyHasPayout ? (
                                  <span className="inline-flex w-full items-center justify-center gap-1 rounded-lg bg-emerald-100/80 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Komisi Sudah Tercatat
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    disabled={isGeneratingPayout}
                                    onClick={() => handleGeneratePayout(m)}
                                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-orange-100 py-1.5 text-[11px] font-bold text-brand-orange transition-colors hover:bg-brand-orange hover:text-white disabled:opacity-60 dark:bg-orange-500/20"
                                  >
                                    {isGeneratingPayout ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Coins className="h-3 w-3" />
                                    )}
                                    Buat Komisi ({formatRupiah(m.feeAmount)})
                                  </button>
                                )}
                              </div>
                            )}
                        </div>
                      );
                    })}

                    {colTasks.length === 0 && (
                      <div className="rounded-2xl border border-dashed border-line py-8 text-center text-[11px] text-ink-muted">
                        Belum ada tugas
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== TAB 2: DIRECTORY & WORKLOAD ==================== */}
      {activeTab === "directory" && (
        <div className="grid gap-5 md:grid-cols-2">
          {workers.map((w) => {
            const avail = w.profile?.availability ?? "AVAILABLE";
            const availMeta = AVAILABILITY_META[avail];
            const workerTasks = milestones.filter((m) => m.assigneeId === w.id);
            const openTasks = workerTasks.filter((m) => m.status !== "DONE").length;
            const doneTasks = workerTasks.filter((m) => m.status === "DONE").length;
            const loggedMins = workLogs
              .filter((l) => l.workerId === w.id)
              .reduce((acc, l) => acc + l.durationMinutes, 0);
            const workloadPct = Math.min(100, Math.round((openTasks / 5) * 100));
            const canEditThis = canManage || w.id === actorId;

            return (
              <div key={w.id} className="surface-card flex flex-col justify-between rounded-3xl p-6">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-blue/15 text-sm font-extrabold text-brand-blue">
                        {getInitials(w.name)}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h2 className="text-base font-bold text-ink">{w.name}</h2>
                          <span
                            className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-bold ${
                              ROLE_META[w.role].badgeClass
                            }`}
                          >
                            {w.role}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-brand-orange">
                          {w.profile?.specialty || w.title}
                        </p>
                        <p className="text-[11px] text-ink-muted">{w.email}</p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${availMeta.badgeClass}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${availMeta.dotClass}`} />
                      {availMeta.label}
                    </span>
                  </div>

                  {/* Skills */}
                  {(w.profile?.skills ?? []).length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {w.profile!.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-lg bg-subtle px-2.5 py-0.5 font-mono text-[11px] font-medium text-ink-secondary"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Workload Monitor */}
                  <div className="mt-5 rounded-2xl bg-elevated p-3.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-ink-secondary">
                        Beban Kerja Aktif ({openTasks} tugas · {doneTasks} selesai)
                      </span>
                      <span className="font-mono font-bold text-brand-blue">
                        {formatDuration(loggedMins)} logged
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-line">
                      <div
                        className={`h-full rounded-full transition-all ${
                          workloadPct >= 80 ? "bg-brand-orange" : "bg-brand-blue"
                        }`}
                        style={{ width: `${workloadPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Rate & Bank info (visible to Manager or Owner) */}
                  {canEditThis && (
                    <div className="mt-4 grid gap-2 text-xs text-ink-secondary sm:grid-cols-2">
                      <div className="rounded-xl border border-line px-3 py-2">
                        <p className="text-[10px] text-ink-muted">Rate / Jam</p>
                        <p className="font-mono font-bold text-ink">
                          {w.profile?.hourlyRate
                            ? `${formatRupiah(w.profile.hourlyRate)}/jam`
                            : "Per Milestone"}
                        </p>
                      </div>
                      <div className="rounded-xl border border-line px-3 py-2">
                        <p className="text-[10px] text-ink-muted">Rekening Payout</p>
                        <p className="truncate font-mono font-bold text-ink">
                          {w.profile?.bankName
                            ? `${w.profile.bankName} · ${w.profile.bankAccountNumber ?? "-"}`
                            : "Belum diisi"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4">
                  {w.profile?.portfolioUrl ? (
                    <a
                      href={w.profile.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand-blue hover:underline"
                    >
                      Portofolio / GitHub
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-[11px] text-ink-muted">
                      {w.isActive ? "Akun aktif" : "Akun nonaktif"}
                    </span>
                  )}

                  {canEditThis && (
                    <button
                      type="button"
                      onClick={() => setEditingProfile(w)}
                      className="btn-blue px-3.5 py-1.5 text-xs"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit Profil &amp; Skill
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==================== TAB 3: TIMESHEET WORK LOGS ==================== */}
      {activeTab === "timesheet" && (
        <div className="surface-card rounded-3xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-ink">
                Riwayat Timesheet &amp; Log Kerja ({visibleWorkLogs.length})
              </h2>
              <p className="text-xs text-ink-secondary">
                Total akumulasi tercatat:{" "}
                <strong className="font-mono text-brand-blue">
                  {formatDuration(totalLoggedMinutes)}
                </strong>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setWorkLogOpen(true)}
              className="btn-primary px-4 py-2 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Catat Jam Kerja
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {visibleWorkLogs.map((log) => {
              const worker = workerMap.get(log.workerId);
              const project = projectMap.get(log.projectId);
              const ms = log.milestoneId ? milestoneMap.get(log.milestoneId) : null;
              const canDelete = canManage || log.workerId === actorId;

              return (
                <div
                  key={log.id}
                  className="flex flex-col justify-between gap-3 rounded-2xl border border-line bg-elevated/50 p-4 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-lg bg-sky-100 px-2.5 py-0.5 font-mono font-bold text-brand-blue dark:bg-sky-500/20">
                        {formatDuration(log.durationMinutes)}
                      </span>
                      <span className="font-mono text-ink-muted">{log.workDate}</span>
                      <span className="font-bold text-ink">{worker?.name ?? "Worker"}</span>
                      {project && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-subtle px-2 py-0.5 font-mono text-[11px] text-ink-secondary">
                          <Building2 className="h-3 w-3 text-brand-orange" />
                          {project.trackingCode}
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-sm text-ink">{log.summary}</p>
                    {ms && (
                      <p className="mt-0.5 text-[11px] text-ink-muted">
                        Milestone: <span className="font-semibold text-ink-secondary">{ms.title}</span>
                      </p>
                    )}
                  </div>

                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => setDeleteTarget({ kind: "worklog", item: log })}
                      aria-label="Hapus log kerja"
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              );
            })}

            {visibleWorkLogs.length === 0 && (
              <div className="py-10 text-center text-sm text-ink-muted">
                Belum ada log jam kerja tercatat. Klik &ldquo;Catat Jam Kerja&rdquo; untuk mulai
                mencatat progres harian.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== TAB 4: PAYOUTS & COMMISSIONS ==================== */}
      {activeTab === "payouts" && (
        <div className="surface-card rounded-3xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-ink">
                Daftar Komisi, Fee &amp; Pencairan ({visiblePayouts.length})
              </h2>
              <p className="text-xs text-ink-secondary">
                Alur pencairan transparan: Menunggu Review → Disetujui → Sudah Dicairkan.
              </p>
            </div>
            {canManage && (
              <button
                type="button"
                onClick={() => setPayoutOpen(true)}
                className="btn-primary px-4 py-2 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                Catat Komisi / Payout
              </button>
            )}
          </div>

          <div className="mt-5 space-y-3">
            {visiblePayouts.map((p) => {
              const worker = workerMap.get(p.workerId);
              const project = p.projectId ? projectMap.get(p.projectId) : null;
              const isBusy = busyId === `paystat-${p.id}`;

              return (
                <div
                  key={p.id}
                  className="flex flex-col justify-between gap-4 rounded-2xl border border-line bg-elevated/50 p-4 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          PAYOUT_STATUS_META[p.status].badgeClass
                        }`}
                      >
                        {PAYOUT_STATUS_META[p.status].label}
                      </span>
                      {project && (
                        <span className="rounded-md bg-subtle px-2 py-0.5 font-mono text-[10px] font-bold text-brand-blue">
                          {project.trackingCode}
                        </span>
                      )}
                      {p.paymentMethod && (
                        <span className="font-mono text-[11px] text-ink-muted">
                          {p.paymentMethod}
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-sm font-bold text-ink">{p.title}</p>
                    <p className="mt-0.5 text-xs text-ink-secondary">
                      Penerima: <strong className="text-ink">{worker?.name ?? "Worker"}</strong>
                      {p.notes ? ` · ${p.notes}` : ""}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-base font-extrabold text-brand-orange">
                      {formatRupiah(p.amount)}
                    </span>

                    {canManage && (
                      <>
                        {p.status === "PENDING" && (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handlePayoutStatus(p, "APPROVED")}
                            className="btn-blue px-3 py-1.5 text-xs disabled:opacity-60"
                          >
                            {isBusy ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              "Setujui"
                            )}
                          </button>
                        )}
                        {p.status !== "PAID" && (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handlePayoutStatus(p, "PAID")}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
                          >
                            {isBusy ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Tandai Cair
                              </>
                            )}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setDeleteTarget({ kind: "payout", item: p })}
                          aria-label={`Hapus payout ${p.title}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {visiblePayouts.length === 0 && (
              <div className="py-10 text-center text-sm text-ink-muted">
                Belum ada riwayat komisi atau payout. Selesaikan milestone ber-fee di Task Board
                atau klik &ldquo;Catat Komisi / Payout&rdquo;.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== MODAL 1: ONBOARD WORKER ==================== */}
      <AdminModal
        open={onboardOpen}
        onClose={() => !submitting && setOnboardOpen(false)}
        title="Tambah Worker Baru"
        subtitle="Otomatis membuat akun login role WORKER beserta profil skill & rekening payout."
      >
        <form onSubmit={handleOnboard} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Nama Lengkap *</label>
            <input name="name" required placeholder="Mis. Dimas Pratama" className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Email Login *</label>
            <input
              name="email"
              type="email"
              required
              placeholder="worker@kodelokal.store"
              className="input-field"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">
              Password Awal (min. 8 karakter) *
            </label>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="Minimal 8 karakter"
              className="input-field"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Spesialisasi *</label>
            <input
              name="specialty"
              required
              defaultValue="Full-Stack Developer"
              placeholder="Frontend / UI-UX / Backend / QA"
              className="input-field"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Status Ketersediaan</label>
            <select name="availability" defaultValue="AVAILABLE" className="input-field">
              <option value="AVAILABLE">Tersedia</option>
              <option value="BUSY">Fokus Project</option>
              <option value="ON_LEAVE">Cuti / Off</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Rate / Jam (Rp, opsional)</label>
            <input
              name="hourlyRate"
              type="number"
              min={0}
              defaultValue={0}
              placeholder="75000"
              className="input-field font-mono"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-bold text-ink">
              Keahlian / Tech Stack (pisahkan koma)
            </label>
            <input
              name="skills"
              placeholder="Next.js, TypeScript, Tailwind CSS, Figma"
              className="input-field font-mono text-xs"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Bank / E-Wallet</label>
            <input name="bankName" placeholder="BCA / Mandiri / SeaBank" className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Nomor Rekening</label>
            <input name="bankAccountNumber" placeholder="1234567890" className="input-field font-mono" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Atas Nama Rekening</label>
            <input name="bankAccountHolder" placeholder="Nama pemilik rekening" className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">URL GitHub / Portofolio</label>
            <input name="portfolioUrl" type="url" placeholder="https://github.com/..." className="input-field" />
          </div>
          <div className="flex justify-end gap-2 border-t border-line pt-4 sm:col-span-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => setOnboardOpen(false)}
              className="btn-secondary px-4 py-2 text-xs"
            >
              Batal
            </button>
            <button type="submit" disabled={submitting} className="btn-primary px-5 py-2 text-xs">
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Daftarkan Worker"
              )}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* ==================== MODAL 2: EDIT WORKER PROFILE ==================== */}
      <AdminModal
        open={Boolean(editingProfile)}
        onClose={() => !submitting && setEditingProfile(null)}
        title="Edit Profil & Skill Worker"
        subtitle={editingProfile ? `${editingProfile.name} (${editingProfile.email})` : undefined}
      >
        {editingProfile && (
          <form key={editingProfile.id} onSubmit={handleSaveProfile} className="grid gap-4 sm:grid-cols-2">
            <input type="hidden" name="userId" value={editingProfile.id} />
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Spesialisasi</label>
              <input
                name="specialty"
                required
                defaultValue={editingProfile.profile?.specialty || editingProfile.title}
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Ketersediaan</label>
              <select
                name="availability"
                defaultValue={editingProfile.profile?.availability ?? "AVAILABLE"}
                className="input-field"
              >
                <option value="AVAILABLE">Tersedia</option>
                <option value="BUSY">Fokus Project</option>
                <option value="ON_LEAVE">Cuti / Off</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold text-ink">
                Skill Matrix (pisahkan koma)
              </label>
              <input
                name="skills"
                defaultValue={(editingProfile.profile?.skills ?? []).join(", ")}
                placeholder="Next.js, PostgreSQL, Tailwind CSS, QA"
                className="input-field font-mono text-xs"
              />
            </div>
            {canManage && (
              <div>
                <label className="mb-1 block text-xs font-bold text-ink">Rate / Jam (Rp)</label>
                <input
                  name="hourlyRate"
                  type="number"
                  min={0}
                  defaultValue={editingProfile.profile?.hourlyRate ?? 0}
                  className="input-field font-mono"
                />
              </div>
            )}
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">URL GitHub / Portofolio</label>
              <input
                name="portfolioUrl"
                type="url"
                defaultValue={editingProfile.profile?.portfolioUrl ?? ""}
                placeholder="https://github.com/..."
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Bank / E-Wallet</label>
              <input
                name="bankName"
                defaultValue={editingProfile.profile?.bankName ?? ""}
                placeholder="BCA / Mandiri / SeaBank"
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Nomor Rekening</label>
              <input
                name="bankAccountNumber"
                defaultValue={editingProfile.profile?.bankAccountNumber ?? ""}
                className="input-field font-mono"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold text-ink">Atas Nama Rekening</label>
              <input
                name="bankAccountHolder"
                defaultValue={editingProfile.profile?.bankAccountHolder ?? ""}
                className="input-field"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold text-ink">Catatan</label>
              <textarea
                name="notes"
                rows={2}
                defaultValue={editingProfile.profile?.notes ?? ""}
                className="input-field"
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-line pt-4 sm:col-span-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setEditingProfile(null)}
                className="btn-secondary px-4 py-2 text-xs"
              >
                Batal
              </button>
              <button type="submit" disabled={submitting} className="btn-primary px-5 py-2 text-xs">
                {submitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Profil"
                )}
              </button>
            </div>
          </form>
        )}
      </AdminModal>

      {/* ==================== MODAL 3: CREATE / EDIT TASK ASSIGNMENT ==================== */}
      <AdminModal
        open={Boolean(taskModal)}
        onClose={() => !submitting && setTaskModal(null)}
        title={taskModal === "create" ? "Tugaskan Milestone ke Worker" : "Edit Penugasan Milestone"}
        subtitle="Status milestone ini terhubung langsung ke progress Project Client & halaman /track."
      >
        {taskModal && (
          <form
            key={taskModal === "create" ? "new-task" : taskModal.id}
            onSubmit={handleSaveTask}
            className="grid gap-4 sm:grid-cols-2"
          >
            {taskModal !== "create" && <input type="hidden" name="id" value={taskModal.id} />}
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold text-ink">Project Client *</label>
              <select
                name="projectId"
                required
                defaultValue={taskModal === "create" ? projects[0]?.id ?? "" : taskModal.projectId}
                className="input-field"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.trackingCode}] {p.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold text-ink">Judul Milestone / Tugas *</label>
              <input
                name="title"
                required
                defaultValue={taskModal === "create" ? "" : taskModal.title}
                placeholder="Contoh: Slicing Halaman Checkout & Integrasi Midtrans"
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Ditugaskan ke Worker</label>
              <select
                name="assigneeId"
                defaultValue={taskModal === "create" ? "" : taskModal.assigneeId ?? ""}
                className="input-field"
              >
                <option value="">— Belum Ditugaskan —</option>
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.role})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Status</label>
              <select
                name="status"
                defaultValue={taskModal === "create" ? "TODO" : taskModal.status}
                className="input-field"
              >
                <option value="TODO">Menunggu</option>
                <option value="IN_PROGRESS">Dikerjakan</option>
                <option value="REVIEW">Review</option>
                <option value="DONE">Selesai</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Fee Milestone (Rp)</label>
              <input
                name="feeAmount"
                type="number"
                min={0}
                defaultValue={taskModal === "create" ? 0 : taskModal.feeAmount}
                placeholder="500000"
                className="input-field font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-bold text-ink">Est. Jam</label>
                <input
                  name="estimatedHours"
                  type="number"
                  min={0}
                  defaultValue={taskModal === "create" ? 4 : taskModal.estimatedHours}
                  className="input-field font-mono"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-ink">Deadline</label>
                <input
                  name="dueDate"
                  type="date"
                  defaultValue={taskModal === "create" ? "" : taskModal.dueDate ?? ""}
                  className="input-field"
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold text-ink">Detail Brief / Deskripsi</label>
              <textarea
                name="description"
                rows={3}
                defaultValue={taskModal === "create" ? "" : taskModal.description ?? ""}
                className="input-field"
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-line pt-4 sm:col-span-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setTaskModal(null)}
                className="btn-secondary px-4 py-2 text-xs"
              >
                Batal
              </button>
              <button type="submit" disabled={submitting} className="btn-primary px-5 py-2 text-xs">
                {submitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Penugasan"
                )}
              </button>
            </div>
          </form>
        )}
      </AdminModal>

      {/* ==================== MODAL 4: LOG TIMESHEET ==================== */}
      <AdminModal
        open={workLogOpen}
        onClose={() => !submitting && setWorkLogOpen(false)}
        title="Catat Jam Kerja (Timesheet)"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleAddWorkLog} className="space-y-4">
          {canManage && (
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Worker</label>
              <select name="workerId" defaultValue={actorId} className="input-field">
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.role})
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Project Client *</label>
            <select
              name="projectId"
              required
              value={selectedLogProjectId}
              onChange={(e) => setSelectedLogProjectId(e.target.value)}
              className="input-field"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.trackingCode}] {p.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Milestone (opsional)</label>
            <select name="milestoneId" defaultValue="" className="input-field">
              <option value="">— Aktivitas Umum Project —</option>
              {milestones
                .filter((m) => m.projectId === selectedLogProjectId)
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Tanggal</label>
              <input
                name="workDate"
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
                className="input-field text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Jam</label>
              <input name="hours" type="number" min={0} max={24} defaultValue={2} className="input-field font-mono" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Menit</label>
              <input name="minutes" type="number" min={0} max={59} defaultValue={0} className="input-field font-mono" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Ringkasan Pekerjaan *</label>
            <textarea
              name="summary"
              required
              rows={3}
              placeholder="Contoh: Implementasi API checkout dan perbaikan tampilan responsif mobile."
              className="input-field"
            />
          </div>
          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <button
              type="button"
              disabled={submitting}
              onClick={() => setWorkLogOpen(false)}
              className="btn-secondary px-4 py-2 text-xs"
            >
              Batal
            </button>
            <button type="submit" disabled={submitting} className="btn-primary px-5 py-2 text-xs">
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Timesheet"
              )}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* ==================== MODAL 5: CREATE PAYOUT ==================== */}
      <AdminModal
        open={payoutOpen}
        onClose={() => !submitting && setPayoutOpen(false)}
        title="Catat Komisi / Fee Worker"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreatePayout} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Worker Penerima *</label>
            <select name="workerId" required className="input-field">
              {workers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.role})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Project Terkait (opsional)</label>
            <select name="projectId" defaultValue="" className="input-field">
              <option value="">— Tanpa Project Spesifik —</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.trackingCode}] {p.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Judul Komisi / Fee *</label>
            <input
              name="title"
              required
              placeholder="Contoh: Fee Slicing Landing Page Batch 1"
              className="input-field"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Nominal (Rp) *</label>
              <input
                name="amount"
                type="number"
                min={1000}
                required
                placeholder="750000"
                className="input-field font-mono"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Status</label>
              <select name="status" defaultValue="PENDING" className="input-field">
                <option value="PENDING">Menunggu Review</option>
                <option value="APPROVED">Disetujui · Siap Cair</option>
                <option value="PAID">Sudah Dicairkan</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Metode Transfer</label>
            <input name="paymentMethod" placeholder="Transfer BCA / SeaBank / GoPay" className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Catatan</label>
            <textarea name="notes" rows={2} className="input-field" />
          </div>
          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <button
              type="button"
              disabled={submitting}
              onClick={() => setPayoutOpen(false)}
              className="btn-secondary px-4 py-2 text-xs"
            >
              Batal
            </button>
            <button type="submit" disabled={submitting} className="btn-primary px-5 py-2 text-xs">
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Komisi"
              )}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* ==================== DELETE CONFIRM MODAL ==================== */}
      <ConfirmDeleteModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        loading={submitting}
        title="Konfirmasi Hapus"
        description={
          deleteTarget?.kind === "milestone"
            ? `Hapus tugas milestone "${deleteTarget.item.title}"?`
            : deleteTarget?.kind === "worklog"
              ? "Hapus entri timesheet jam kerja ini?"
              : deleteTarget?.kind === "payout"
                ? `Hapus catatan komisi "${deleteTarget.item.title}"?`
                : "Yakin ingin menghapus data ini?"
        }
      />

      {/* Keep icon import used cleanly */}
      <span className="hidden">
        <CircleDashed />
        {TASK_STATUS_META.TODO.label}
      </span>

      <AdminToast toast={toast} onClose={clearToast} />
    </div>
  );
}
