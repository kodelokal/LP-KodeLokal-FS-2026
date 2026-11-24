import { asc, desc, ne } from "drizzle-orm";
import { db } from "@/db";
import {
  users,
  workerProfiles,
  clientProjects,
  projectMilestones,
  workerWorkLogs,
  workerPayouts,
} from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import {
  WorkerHubManager,
  type WorkerDirectoryEntry,
} from "@/components/admin/WorkerHubManager";

export default async function AdminWorkersPage() {
  const actor = await requireAuth();
  const canManage = hasPermission(actor.role, "workers:manage");

  const [allStaff, allProfiles, allProjects, allMilestones, allWorkLogs, allPayouts] =
    await Promise.all([
      db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          title: users.title,
          isActive: users.isActive,
        })
        .from(users)
        .where(ne(users.role, "CLIENT"))
        .orderBy(asc(users.createdAt)),
      db.select().from(workerProfiles),
      db.select().from(clientProjects).orderBy(desc(clientProjects.updatedAt)),
      db
        .select()
        .from(projectMilestones)
        .orderBy(asc(projectMilestones.sortOrder), desc(projectMilestones.createdAt)),
      db.select().from(workerWorkLogs).orderBy(desc(workerWorkLogs.workDate), desc(workerWorkLogs.createdAt)),
      db.select().from(workerPayouts).orderBy(desc(workerPayouts.createdAt)),
    ]);

  const profileByUserId = new Map(allProfiles.map((p) => [p.userId, p]));
  const workers: WorkerDirectoryEntry[] = allStaff.map((u) => ({
    ...u,
    profile: profileByUserId.get(u.id) ?? null,
  }));

  return (
    <WorkerHubManager
      actorId={actor.id}
      actorRole={actor.role}
      canManage={canManage}
      workers={workers}
      projects={allProjects}
      milestones={allMilestones}
      workLogs={allWorkLogs}
      payouts={allPayouts}
    />
  );
}
