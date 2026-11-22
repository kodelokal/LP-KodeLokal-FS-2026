"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, type UserRole } from "@/db/schema";
import { hashPassword, requirePermission } from "@/lib/auth";
import { ALL_ROLES } from "@/lib/rbac";

export async function createUserAction(formData: FormData) {
  await requirePermission("users:manage");

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "").trim();
  const rawRole = String(formData.get("role") || "WORKER").trim() as UserRole;
  const role: UserRole = ALL_ROLES.includes(rawRole) ? rawRole : "WORKER";
  const title = String(formData.get("title") || role).trim();

  if (!name || !email || password.length < 8) return;

  const passwordHash = await hashPassword(password);
  await db
    .insert(users)
    .values({
      name,
      email,
      passwordHash,
      role,
      title,
      isActive: true,
    })
    .onConflictDoNothing({ target: users.email });

  revalidatePath("/admin/roles");
}

export async function updateUserRoleAction(formData: FormData) {
  const actor = await requirePermission("users:manage");
  const id = String(formData.get("id") || "");
  const rawRole = String(formData.get("role") || "WORKER") as UserRole;
  if (!id || !ALL_ROLES.includes(rawRole)) return;

  // Prevent accidentally stripping own CEO/CTO admin privileges via self-demotion
  if (id === actor.id && !["CEO", "CTO", "ADMIN"].includes(rawRole)) {
    return;
  }

  await db
    .update(users)
    .set({ role: rawRole, updatedAt: new Date() })
    .where(eq(users.id, id));

  revalidatePath("/admin/roles");
}

export async function toggleUserActiveAction(formData: FormData) {
  const actor = await requirePermission("users:manage");
  const id = String(formData.get("id") || "");
  const current = formData.get("current") === "true";
  if (!id || id === actor.id) return;

  await db
    .update(users)
    .set({ isActive: !current, updatedAt: new Date() })
    .where(eq(users.id, id));

  revalidatePath("/admin/roles");
}
