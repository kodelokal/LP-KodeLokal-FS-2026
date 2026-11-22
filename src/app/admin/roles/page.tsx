import { asc } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { RolesManager } from "@/components/admin/RolesManager";

export default async function AdminRolesPage() {
  const actor = await requireAuth();
  const canManage = hasPermission(actor.role, "users:manage");

  const rawUsers = await db.select().from(users).orderBy(asc(users.createdAt));
  const safeUsers = rawUsers.map(({ passwordHash: _ignored, ...rest }) => {
    void _ignored;
    return rest;
  });

  return <RolesManager actorId={actor.id} allUsers={safeUsers} canManage={canManage} />;
}
