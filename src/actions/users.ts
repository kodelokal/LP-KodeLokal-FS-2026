"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, type UserRole } from "@/db/schema";
import { hashPassword, requirePermission } from "@/lib/auth";
import { ALL_ROLES } from "@/lib/rbac";
import type { ActionResult } from "./portfolio";

export async function createUserAction(formData: FormData): Promise<ActionResult> {
  try {
    await requirePermission("users:manage");

    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "").trim();
    const rawRole = String(formData.get("role") || "WORKER").trim() as UserRole;
    const role: UserRole = ALL_ROLES.includes(rawRole) ? rawRole : "WORKER";
    const title = String(formData.get("title") || role).trim();

    if (!name || !email || password.length < 8) {
      return { ok: false, message: "Nama, email, dan password minimal 8 karakter wajib diisi." };
    }

    const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      return { ok: false, message: "Email tersebut sudah terdaftar." };
    }

    const passwordHash = await hashPassword(password);
    await db.insert(users).values({
      name,
      email,
      passwordHash,
      role,
      title,
      isActive: true,
    });

    revalidatePath("/admin/roles");
    return { ok: true, message: `Akun ${name} (${role}) berhasil dibuat!` };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Gagal membuat akun.",
    };
  }
}

export async function updateUserAction(formData: FormData): Promise<ActionResult> {
  try {
    const actor = await requirePermission("users:manage");
    const id = String(formData.get("id") || "").trim();
    const name = String(formData.get("name") || "").trim();
    const title = String(formData.get("title") || "").trim();
    const rawRole = String(formData.get("role") || "WORKER") as UserRole;
    const newPassword = String(formData.get("password") || "").trim();

    if (!id || !name || !ALL_ROLES.includes(rawRole)) {
      return { ok: false, message: "Data akun tidak valid." };
    }

    if (id === actor.id && !["CEO", "CTO", "ADMIN"].includes(rawRole)) {
      return { ok: false, message: "Tidak bisa menurunkan hak akses admin milik sendiri." };
    }

    if (newPassword && newPassword.length < 8) {
      return { ok: false, message: "Password baru minimal 8 karakter." };
    }

    const passwordPatch = newPassword ? { passwordHash: await hashPassword(newPassword) } : {};

    await db
      .update(users)
      .set({
        name,
        title: title || rawRole,
        role: rawRole,
        ...passwordPatch,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));

    revalidatePath("/admin/roles");
    return { ok: true, message: "Data akun & role berhasil diperbarui!" };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Gagal memperbarui akun.",
    };
  }
}

export async function toggleUserActiveAction(
  id: string,
  current: boolean
): Promise<ActionResult> {
  try {
    const actor = await requirePermission("users:manage");
    if (!id || id === actor.id) {
      return { ok: false, message: "Tidak bisa menonaktifkan akun sendiri." };
    }

    await db
      .update(users)
      .set({ isActive: !current, updatedAt: new Date() })
      .where(eq(users.id, id));

    revalidatePath("/admin/roles");
    return {
      ok: true,
      message: !current ? "Akun berhasil diaktifkan." : "Akun berhasil dinonaktifkan.",
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Gagal mengubah status akun.",
    };
  }
}
