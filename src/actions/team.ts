"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { teamMembers } from "@/db/schema";
import { requirePermission } from "@/lib/auth";
import type { ActionResult } from "./portfolio";

function normalizeOptionalUrl(value: FormDataEntryValue | null): string | null {
  const raw = String(value || "").trim();
  if (!raw) return null;
  if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("/")) {
    return raw;
  }
  return `https://${raw}`;
}

export async function createTeamMemberAction(formData: FormData): Promise<ActionResult> {
  try {
    await requirePermission("team:write");

    const name = String(formData.get("name") || "").trim();
    const positionTitle = String(formData.get("positionTitle") || "").trim();
    const parentId = String(formData.get("parentId") || "").trim() || null;
    const avatarUrl = normalizeOptionalUrl(formData.get("avatarUrl"));
    const githubUrl = normalizeOptionalUrl(formData.get("githubUrl"));
    const linkedinUrl = normalizeOptionalUrl(formData.get("linkedinUrl"));
    const instagramUrl = normalizeOptionalUrl(formData.get("instagramUrl"));
    const sortOrder = Number(formData.get("sortOrder") || 10) || 10;

    if (!name || !positionTitle) {
      return { ok: false, message: "Nama dan jabatan wajib diisi." };
    }

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
    return { ok: true, message: "Anggota tim berhasil ditambahkan!" };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Gagal menambahkan anggota tim.",
    };
  }
}

export async function updateTeamMemberAction(formData: FormData): Promise<ActionResult> {
  try {
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

    if (!id || !name || !positionTitle) {
      return { ok: false, message: "Nama dan jabatan wajib diisi." };
    }

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
    return { ok: true, message: "Data anggota tim berhasil diperbarui!" };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Gagal memperbarui data anggota tim.",
    };
  }
}

export async function deleteTeamMemberAction(id: string): Promise<ActionResult> {
  try {
    await requirePermission("team:write");
    if (!id) return { ok: false, message: "ID anggota tidak valid." };

    await db.delete(teamMembers).where(eq(teamMembers.id, id));
    revalidatePath("/");
    revalidatePath("/admin/team");
    return { ok: true, message: "Anggota tim berhasil dihapus." };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Gagal menghapus anggota tim.",
    };
  }
}
