import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { clientProjects, projectMilestones } from "@/db/schema";
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

  const milestones = await db
    .select()
    .from(projectMilestones)
    .where(eq(projectMilestones.projectId, project.id))
    .orderBy(asc(projectMilestones.sortOrder), asc(projectMilestones.createdAt));

  return <ProjectDetailManager project={project} milestones={milestones} canWrite={canWrite} />;
}
