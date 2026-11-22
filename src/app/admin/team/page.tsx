import { asc } from "drizzle-orm";
import { db } from "@/db";
import { teamMembers } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { TeamManager } from "@/components/admin/TeamManager";

export default async function AdminTeamPage() {
  const user = await requireAuth();
  const canWrite = hasPermission(user.role, "team:write");

  const members = await db
    .select()
    .from(teamMembers)
    .orderBy(asc(teamMembers.sortOrder), asc(teamMembers.createdAt));

  return <TeamManager members={members} canWrite={canWrite} />;
}
