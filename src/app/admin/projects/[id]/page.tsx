import { notFound } from "next/navigation";
import { asc, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { clientProjects, projectMilestones, users } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { ProjectDetailManager } from "@/components/admin/ProjectDetailManager";

export default async function AdminProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAuth();
  const canWrite = hasPermission(user.role, "projects:write");
  const { id } = await params;

  const [project] = await db
    .select()
    .from(clientProjects)
    .where(eq(clientProjects.id, id))
    .limit(1);

  if (!project) notFound();

  const [milestones, workers] = await Promise.all([
    db
      .select()
      .from(projectMilestones)
      .where(eq(projectMilestones.projectId, project.id))
      .orderBy(asc(projectMilestones.sortOrder), asc(projectMilestones.createdAt)),
    db
      .select({ id: users.id, name: users.name, role: users.role })
      .from(users)
      .where(ne(users.role, "CLIENT"))
      .orderBy(asc(users.name)),
  ]);

  return (
    <ProjectDetailManager
      project={project}
      milestones={milestones}
      workers={workers}
      canWrite={canWrite}
    />
  );
}
