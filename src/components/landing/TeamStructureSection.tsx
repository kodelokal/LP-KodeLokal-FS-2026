"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Network, LayoutGrid, UserCheck, UserPlus, Sparkles } from "lucide-react";
import type { TeamMember } from "@/db/schema";
import { ROLE_META } from "@/lib/rbac";
import { FadeIn } from "@/components/ui/MotionPrimitives";

type TeamNode = TeamMember & { children: TeamNode[] };

function buildOrgTree(members: TeamMember[]): TeamNode[] {
  const map = new Map<string, TeamNode>();
  members.forEach((m) => map.set(m.id, { ...m, children: [] }));
  const roots: TeamNode[] = [];

  members.forEach((m) => {
    const node = map.get(m.id)!;
    if (m.parentId && map.has(m.parentId)) {
      map.get(m.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

function OrgMemberCard({ member, compact = false }: { member: TeamMember; compact?: boolean }) {
  const roleInfo = ROLE_META[member.roleCode];
  const isExec = member.roleCode === "CEO" || member.roleCode === "CTO";

  return (
    <div
      className={`surface-card surface-card-interactive relative flex flex-col rounded-2xl text-left ${
        compact ? "w-64 p-4" : "h-full p-6"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-bold text-white ${
              member.isOpenPosition
                ? "border border-dashed border-brand-blue bg-subtle text-brand-blue"
                : isExec
                  ? "bg-brand-orange"
                  : "bg-brand-blue"
            }`}
          >
            {member.isOpenPosition ? (
              <UserPlus className="h-5 w-5" />
            ) : (
              <span className="text-sm">{getInitials(member.name)}</span>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-ink">{member.name}</h3>
            <p className="truncate text-xs text-ink-secondary">{member.positionTitle}</p>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className={`rounded-md px-2 py-0.5 font-mono text-[11px] font-bold ${roleInfo.badgeClass}`}>
          {member.roleCode}
        </span>
        <span className="rounded-md bg-subtle px-2 py-0.5 text-[11px] font-medium text-ink-secondary">
          {member.department}
        </span>
        {member.isOpenPosition ? (
          <span className="inline-flex items-center gap-1 rounded-md border border-dashed border-brand-orange/50 px-2 py-0.5 text-[10px] font-semibold text-brand-orange">
            Slot Mendatang
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100/80 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
            <UserCheck className="h-3 w-3" />
            Aktif
          </span>
        )}
      </div>

      {!compact && member.bio && (
        <p className="mt-3 text-xs leading-relaxed text-ink-secondary">{member.bio}</p>
      )}

      {(member.skills ?? []).length > 0 && (
        <div className="mt-3.5 flex flex-wrap gap-1.5 border-t border-line pt-3">
          {(member.skills ?? []).slice(0, compact ? 3 : 4).map((skill) => (
            <span
              key={skill}
              className="rounded-md bg-elevated px-2 py-0.5 font-mono text-[10px] text-ink-secondary"
            >
              {skill}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function OrgTreeBranch({ node }: { node: TeamNode }) {
  return (
    <div className="flex flex-col items-center">
      <OrgMemberCard member={node} compact />
      {node.children.length > 0 && (
        <div className="flex flex-col items-center">
          <div className="h-7 w-0.5 bg-line-strong" />
          <div className="relative flex flex-wrap items-start justify-center gap-5 pt-5">
            {node.children.length > 1 && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-0 right-16 left-16 hidden h-0.5 bg-line-strong md:block"
              />
            )}
            {node.children.map((child) => (
              <div key={child.id} className="relative flex flex-col items-center">
                <div
                  aria-hidden="true"
                  className="pointer-events-none -mt-5 mb-0 hidden h-5 w-0.5 bg-line-strong md:block"
                />
                <OrgTreeBranch node={child} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function TeamStructureSection({ members }: { members: TeamMember[] }) {
  const [viewMode, setViewMode] = React.useState<"chart" | "grid">("chart");
  const orgRoots = React.useMemo(() => buildOrgTree(members), [members]);

  return (
    <section id="tim" className="border-t border-line bg-subtle/45 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <FadeIn className="max-w-2xl">
            <p className="text-xs font-bold tracking-widest text-brand-blue uppercase">
              Struktur Tim Pengembang
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.025em] text-ink sm:text-4xl">
              Organisasi Terstruktur, Siap Berkembang Bersama Skala Project
            </h2>
            <p className="mt-3 text-base text-ink-secondary">
              KodeLokal membangun struktur kolaborasi lintas peran — mulai dari CEO, CTO, Project
              Manager, Marketing, Admin, hingga Worker Pool — yang dapat diperbarui langsung dari
              CMS seiring pertumbuhan tim.
            </p>
          </FadeIn>

          {/* View Switcher */}
          <FadeIn delay={0.08}>
            <div className="inline-flex rounded-xl border border-line bg-surface p-1 shadow-xs">
              <button
                id="team-view-chart-btn"
                type="button"
                onClick={() => setViewMode("chart")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                  viewMode === "chart"
                    ? "bg-brand-blue text-white"
                    : "text-ink-secondary hover:text-ink"
                }`}
              >
                <Network className="h-3.5 w-3.5" />
                Bagan Struktur
              </button>
              <button
                id="team-view-grid-btn"
                type="button"
                onClick={() => setViewMode("grid")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                  viewMode === "grid"
                    ? "bg-brand-blue text-white"
                    : "text-ink-secondary hover:text-ink"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                Daftar Peran
              </button>
            </div>
          </FadeIn>
        </div>

        <div className="mt-12">
          <AnimatePresence mode="wait">
            {viewMode === "chart" ? (
              <motion.div
                key="chart"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="overflow-x-auto pb-4"
              >
                <div className="flex min-w-max flex-col items-center gap-10 px-2">
                  {orgRoots.map((root) => (
                    <OrgTreeBranch key={root.id} node={root} />
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
              >
                {members.map((m) => (
                  <OrgMemberCard key={m.id} member={m} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Future Worker & Role Ecosystem Callout */}
        <FadeIn delay={0.14} className="mt-10">
          <div className="surface-card flex flex-col items-start justify-between gap-4 rounded-2xl p-5 sm:flex-row sm:items-center sm:px-6">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-brand-orange dark:bg-orange-500/15">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-ink">
                  Ekosistem Worker & Multi-Role (Segera Hadir)
                </p>
                <p className="mt-0.5 text-xs text-ink-secondary">
                  Arsitektur RBAC untuk CEO, CTO, PM, Marketing, Admin, dan Worker sudah tertanam
                  di sistem KodeLokal untuk mendukung ekspansi kolaborasi developer di fase berikutnya.
                </p>
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-subtle px-3 py-1 font-mono text-xs font-semibold text-brand-blue">
              Roadmap 2026
            </span>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
