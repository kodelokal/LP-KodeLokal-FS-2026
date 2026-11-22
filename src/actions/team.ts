"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { teamMembers, type UserRole } from "@/db/schema";
import { requirePermission } from "@/lib/auth";
import { ALL_ROLES } from "@/lib/rbac";

export async function createTeamMemberAction(formData: FormData) {
  await requirePermission("team:write");

  const name = String(formData.get("name") || "").trim();
  const rawRole = String(formData.get("roleCode") || "WORKER").trim() as UserRole;
  const roleCode: UserRole = ALL_ROLES.includes(rawRole) ? rawRole : "WORKER";
  const positionTitle = String(formData.get("positionTitle") || "").trim();
  const department = String(formData.get("department") || "Engineering").trim();
  const parentId = String(formData.get("parentId") || "").trim() || null;
  const bio = String(formData.get("bio") || "").trim();
  const skills = String(formData.get("skills") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const isOpenPosition = formData.get("isOpenPosition") === "on";
  const sortOrder = Number(formData.get("sortOrder") || 10) || 10;

  if (!name || !positionTitle) return;

  await db.insert(teamMembers).values({
    name,
    roleCode,
    positionTitle,
    department,
    parentId,
    bio,
    skills,
    isOpenPosition,
    sortOrder,
    isVisible: true,
  });

  revalidatePath("/");
  revalidatePath("/admin/team");
}

export async function toggleTeamOpenPositionAction(formData: FormData) {
  await requirePermission("team:write");
  const id = String(formData.get("id") || "");
  const current = formData.get("current") === "true";
  if (!id) return;

  await db
    .update(teamMembers)
    .set({ isOpenPosition: !current })
    .where(eq(teamMembers.id, id));

  revalidatePath("/");
  revalidatePath("/admin/team");
}

export async function deleteTeamMemberAction(formData: FormData) {
  await requirePermission("team:write");
  const id = String(formData.get("id") || "");
  if (!id) return;

  await db.delete(teamMembers).where(eq(teamMembers.id, id));
  revalidatePath("/");
  revalidatePath("/admin/team");
}
