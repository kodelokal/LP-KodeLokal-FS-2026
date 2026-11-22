"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { teamMembers } from "@/db/schema";
import { requirePermission } from "@/lib/auth";

function normalizeOptionalUrl(value: FormDataEntryValue | null): string | null {
  const raw = String(value || "").trim();
  if (!raw) return null;
  if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("/")) {
    return raw;
  }
  return `https://${raw}`;
}

export async function createTeamMemberAction(formData: FormData) {
  await requirePermission("team:write");

  const name = String(formData.get("name") || "").trim();
  const positionTitle = String(formData.get("positionTitle") || "").trim();
  const parentId = String(formData.get("parentId") || "").trim() || null;
  const avatarUrl = normalizeOptionalUrl(formData.get("avatarUrl"));
  const githubUrl = normalizeOptionalUrl(formData.get("githubUrl"));
  const linkedinUrl = normalizeOptionalUrl(formData.get("linkedinUrl"));
  const instagramUrl = normalizeOptionalUrl(formData.get("instagramUrl"));
  const sortOrder = Number(formData.get("sortOrder") || 10) || 10;

  if (!name || !positionTitle) return;

  await db.insert(teamMembers).values({
    name,
    positionTitle,
    parentId,
    avatarUrl,
    githubUrl,
    linkedinUrl,
    instagramUrl,
    sortOrder,
    isVisible: true,
  });

  revalidatePath("/");
  revalidatePath("/admin/team");
}

export async function updateTeamMemberAction(formData: FormData) {
  await requirePermission("team:write");

  const id = String(formData.get("id") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const positionTitle = String(formData.get("positionTitle") || "").trim();
  const rawParentId = String(formData.get("parentId") || "").trim() || null;
  const parentId = rawParentId === id ? null : rawParentId;
  const avatarUrl = normalizeOptionalUrl(formData.get("avatarUrl"));
  const githubUrl = normalizeOptionalUrl(formData.get("githubUrl"));
  const linkedinUrl = normalizeOptionalUrl(formData.get("linkedinUrl"));
  const instagramUrl = normalizeOptionalUrl(formData.get("instagramUrl"));
  const sortOrder = Number(formData.get("sortOrder") || 0) || 0;

  if (!id || !name || !positionTitle) return;

  await db
    .update(teamMembers)
    .set({
      name,
      positionTitle,
      parentId,
      avatarUrl,
      githubUrl,
      linkedinUrl,
      instagramUrl,
      sortOrder,
    })
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
