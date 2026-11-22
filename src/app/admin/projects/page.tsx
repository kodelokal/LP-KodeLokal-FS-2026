import { desc } from "drizzle-orm";
import { db } from "@/db";
import { clientProjects } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { ProjectsManager } from "@/components/admin/ProjectsManager";

export default async function AdminProjectsPage() {
  const user = await requireAuth();
  const canWrite = hasPermission(user.role, "projects:write");

  const projects = await db
    .select()
    .from(clientProjects)
    .orderBy(desc(clientProjects.updatedAt));

  return <ProjectsManager projects={projects} canWrite={canWrite} />;
}
