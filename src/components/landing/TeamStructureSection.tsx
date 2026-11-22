"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Network, LayoutGrid } from "lucide-react";
import type { TeamMember } from "@/db/schema";
import { SectionHeading } from "@/components/ui/SectionHeading";

type TeamNode = TeamMember & { children: TeamNode[] };

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

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

function TeamMemberCard({ member, compact = false }: { member: TeamMember; compact?: boolean }) {
  const hasSocials = Boolean(member.githubUrl || member.linkedinUrl || member.instagramUrl);

  return (
    <article
      className={`surface-card surface-card-interactive flex flex-col items-center rounded-3xl text-center ${
        compact ? "w-56 p-5" : "h-full p-6"
      }`}
    >
      {/* Foto */}
      <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-line bg-subtle shadow-xs">
        {member.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.avatarUrl}
            alt={member.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-brand-blue/15 text-lg font-extrabold text-brand-blue">
            {getInitials(member.name)}
          </div>
        )}
      </div>

      {/* Nama & Jabatan */}
      <h3 className="mt-4 text-base font-bold tracking-tight text-ink">{member.name}</h3>
      <p className="mt-0.5 text-xs font-medium text-brand-orange">{member.positionTitle}</p>

      {/* Link GitHub, LinkedIn, Instagram (Opsional) */}
      {hasSocials && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {member.githubUrl && (
            <a
              href={member.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`GitHub ${member.name}`}
              title="GitHub"
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-line bg-elevated text-ink-secondary transition-colors hover:border-brand-blue hover:text-brand-blue"
            >
              <GithubIcon className="h-4 w-4" />
            </a>
          )}
          {member.linkedinUrl && (
            <a
              href={member.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`LinkedIn ${member.name}`}
              title="LinkedIn"
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-line bg-elevated text-ink-secondary transition-colors hover:border-brand-blue hover:text-brand-blue"
            >
              <LinkedinIcon className="h-4 w-4" />
            </a>
          )}
          {member.instagramUrl && (
            <a
              href={member.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Instagram ${member.name}`}
              title="Instagram"
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-line bg-elevated text-ink-secondary transition-colors hover:border-brand-orange hover:text-brand-orange"
            >
              <InstagramIcon className="h-4 w-4" />
            </a>
          )}
        </div>
      )}
    </article>
  );
}

function OrgTreeBranch({ node }: { node: TeamNode }) {
  return (
    <div className="flex flex-col items-center">
      <TeamMemberCard member={node} compact />
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
        <SectionHeading
          watermark="TIM KAMI"
          titlePrefix="Struktur & Tim"
          titleHighlight="Pengembang"
          highlightColor="blue"
          subtitle="Ini dia squad di balik layar KodeLokal yang siap bantu wujudin website & aplikasi kamu biar jalan mulus."
        />

        {/* Centered View Switcher */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex rounded-full border border-line bg-surface p-1 shadow-xs">
            <button
              id="team-view-chart-btn"
              type="button"
              onClick={() => setViewMode("chart")}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-colors ${
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
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                viewMode === "grid"
                  ? "bg-brand-blue text-white"
                  : "text-ink-secondary hover:text-ink"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Daftar Tim
            </button>
          </div>
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
                className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              >
                {members.map((m) => (
                  <TeamMemberCard key={m.id} member={m} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
