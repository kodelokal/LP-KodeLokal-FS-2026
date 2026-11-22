import type {
  UserRole,
  ProjectStatus,
  ProjectPriority,
  InquiryStatus,
  TaskStatus,
} from "@/db/schema";

export const ALL_ROLES: UserRole[] = [
  "CEO",
  "CTO",
  "ADMIN",
  "PM",
  "MARKETING",
  "WORKER",
  "CLIENT",
];

export const ROLE_META: Record<
  UserRole,
  {
    label: string;
    shortDesc: string;
    badgeClass: string;
    isSoon?: boolean;
  }
> = {
  CEO: {
    label: "CEO",
    shortDesc: "Akses penuh ke seluruh sistem, strategi, CMS, project, dan manajemen tim.",
    badgeClass:
      "bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300",
  },
  CTO: {
    label: "CTO",
    shortDesc: "Akses penuh ke arsitektur teknis, CMS, project client, dan manajemen tim.",
    badgeClass:
      "bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300",
  },
  ADMIN: {
    label: "Admin",
    shortDesc: "Mengelola CMS, portofolio, project client, inquiry, serta akun operasional.",
    badgeClass:
      "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300",
  },
  PM: {
    label: "Project Manager",
    shortDesc: "Mengelola project client, timeline milestone, dan konversi inquiry.",
    badgeClass:
      "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
  },
  MARKETING: {
    label: "Marketing",
    shortDesc: "Mengelola konten landing page, portofolio, testimoni, FAQ, dan prospek.",
    badgeClass:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
  },
  WORKER: {
    label: "Worker",
    shortDesc: "Eksekusi milestone & tugas teknis project (Modul Worker Hub segera hadir).",
    badgeClass:
      "bg-slate-200 text-slate-800 dark:bg-slate-700/60 dark:text-slate-200",
    isSoon: true,
  },
  CLIENT: {
    label: "Client",
    shortDesc: "Memantau progress project melalui kode tracking publik / portal client.",
    badgeClass:
      "bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300",
  },
};

export type PermissionKey =
  | "cms:write"
  | "portfolio:write"
  | "team:write"
  | "projects:write"
  | "inquiries:write"
  | "users:manage"
  | "admin:access";

const PERMISSION_MAP: Record<PermissionKey, UserRole[]> = {
  "admin:access": ["CEO", "CTO", "ADMIN", "PM", "MARKETING", "WORKER"],
  "cms:write": ["CEO", "CTO", "ADMIN", "MARKETING"],
  "portfolio:write": ["CEO", "CTO", "ADMIN", "MARKETING"],
  "team:write": ["CEO", "CTO", "ADMIN"],
  "projects:write": ["CEO", "CTO", "ADMIN", "PM"],
  "inquiries:write": ["CEO", "CTO", "ADMIN", "PM", "MARKETING"],
  "users:manage": ["CEO", "CTO", "ADMIN"],
};

export function hasPermission(role: UserRole | undefined | null, perm: PermissionKey): boolean {
  if (!role) return false;
  return PERMISSION_MAP[perm].includes(role);
}

export const PROJECT_STATUS_META: Record<
  ProjectStatus,
  { label: string; badgeClass: string; stepIndex: number }
> = {
  INQUIRY: {
    label: "Diskusi Awal",
    badgeClass: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    stepIndex: 0,
  },
  PLANNING: {
    label: "Perencanaan",
    badgeClass: "bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300",
    stepIndex: 1,
  },
  IN_PROGRESS: {
    label: "Sedang Dikerjakan",
    badgeClass: "bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300",
    stepIndex: 2,
  },
  REVIEW: {
    label: "Review & UAT",
    badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
    stepIndex: 3,
  },
  COMPLETED: {
    label: "Selesai",
    badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
    stepIndex: 4,
  },
  ON_HOLD: {
    label: "Ditunda",
    badgeClass: "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300",
    stepIndex: 1,
  },
};

export const PRIORITY_META: Record<ProjectPriority, { label: string; badgeClass: string }> = {
  LOW: {
    label: "Rendah",
    badgeClass: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  },
  MEDIUM: {
    label: "Normal",
    badgeClass: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300",
  },
  HIGH: {
    label: "Tinggi",
    badgeClass: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300",
  },
  URGENT: {
    label: "Mendesak",
    badgeClass: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
  },
};

export const INQUIRY_STATUS_META: Record<InquiryStatus, { label: string; badgeClass: string }> = {
  NEW: {
    label: "Baru",
    badgeClass: "bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300",
  },
  CONTACTED: {
    label: "Sudah Dihubungi",
    badgeClass: "bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300",
  },
  PROPOSAL: {
    label: "Proposal Dikirim",
    badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
  },
  CONVERTED: {
    label: "Jadi Project",
    badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
  },
  ARCHIVED: {
    label: "Diarsipkan",
    badgeClass: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  },
};

export const TASK_STATUS_META: Record<TaskStatus, { label: string; badgeClass: string }> = {
  TODO: {
    label: "Menunggu",
    badgeClass: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  },
  IN_PROGRESS: {
    label: "Dikerjakan",
    badgeClass: "bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300",
  },
  REVIEW: {
    label: "Review",
    badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
  },
  DONE: {
    label: "Selesai",
    badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
  },
};
