"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  users,
  workerProfiles,
  workerWorkLogs,
  workerPayouts,
  workerApplications,
  projectMilestones,
  clientProjects,
  type WorkerAvailability,
  type PayoutStatus,
  type TaskStatus,
  type ApplicationStatus,
} from "@/db/schema";
import { hashPassword, requireAuth, requirePermission } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import type { ActionResult } from "./portfolio";

async function recalcProjectProgress(projectId: string) {
  const rows = await db
    .select()
    .from(projectMilestones)
    .where(eq(projectMilestones.projectId, projectId));
  if (rows.length === 0) return;
  const doneCount = rows.filter((m) => m.status === "DONE").length;
  const activeCount = rows.filter(
    (m) => m.status === "IN_PROGRESS" || m.status === "REVIEW"
  ).length;
  const computed = Math.round(((doneCount + activeCount * 0.45) / rows.length) * 100);
  const clamped = Math.min(100, Math.max(0, computed));

  await db
    .update(clientProjects)
    .set({ progress: clamped, updatedAt: new Date() })
    .where(eq(clientProjects.id, projectId));
}

/**
 * Onboard a brand-new Worker (creates user with role WORKER + worker_profiles row)
 */
export async function onboardWorkerAction(formData: FormData): Promise<ActionResult> {
  try {
    await requirePermission("workers:manage");

    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "").trim();
    const specialty = String(formData.get("specialty") || "Full-Stack Developer").trim();
    const skills = String(formData.get("skills") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const availability = (String(formData.get("availability") || "AVAILABLE") as WorkerAvailability);
    const hourlyRate = Math.max(0, Number(formData.get("hourlyRate") || 0) || 0);
    const bankName = String(formData.get("bankName") || "").trim() || null;
    const bankAccountNumber = String(formData.get("bankAccountNumber") || "").trim() || null;
    const bankAccountHolder = String(formData.get("bankAccountHolder") || "").trim() || null;
    const portfolioUrl = String(formData.get("portfolioUrl") || "").trim() || null;
    const notes = String(formData.get("notes") || "").trim() || null;

    if (!name || !email || password.length < 8) {
      return { ok: false, message: "Nama, email, dan password minimal 8 karakter wajib diisi." };
    }

    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existing.length > 0) {
      return { ok: false, message: "Email tersebut sudah terdaftar." };
    }

    const passwordHash = await hashPassword(password);
    const [createdUser] = await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash,
        role: "WORKER",
        title: specialty,
        isActive: true,
      })
      .returning();

    await db.insert(workerProfiles).values({
      userId: createdUser.id,
      specialty,
      skills,
      availability,
      hourlyRate,
      bankName,
      bankAccountNumber,
      bankAccountHolder,
      portfolioUrl,
      notes,
    });

    revalidatePath("/admin/workers");
    revalidatePath("/admin/roles");
    return { ok: true, message: `Worker "${name}" berhasil ditambahkan ke Worker Hub!` };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Gagal menambahkan worker baru.",
    };
  }
}

/**
 * Create or update a Worker Profile (Managers can edit anyone; Worker can edit their own profile)
 */
export async function upsertWorkerProfileAction(formData: FormData): Promise<ActionResult> {
  try {
    const actor = await requireAuth();
    const userId = String(formData.get("userId") || "").trim();
    if (!userId) return { ok: false, message: "User tidak valid." };

    const canManage = hasPermission(actor.role, "workers:manage");
    if (!canManage && actor.id !== userId) {
      return { ok: false, message: "Kamu hanya bisa mengubah profil milikmu sendiri." };
    }

    const specialty = String(formData.get("specialty") || "Full-Stack Developer").trim();
    const skills = String(formData.get("skills") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const availability = (String(formData.get("availability") || "AVAILABLE") as WorkerAvailability);
    const hourlyRate = Math.max(0, Number(formData.get("hourlyRate") || 0) || 0);
    const bankName = String(formData.get("bankName") || "").trim() || null;
    const bankAccountNumber = String(formData.get("bankAccountNumber") || "").trim() || null;
    const bankAccountHolder = String(formData.get("bankAccountHolder") || "").trim() || null;
    const portfolioUrl = String(formData.get("portfolioUrl") || "").trim() || null;
    const notes = String(formData.get("notes") || "").trim() || null;

    await db
      .insert(workerProfiles)
      .values({
        userId,
        specialty,
        skills,
        availability,
        hourlyRate,
        bankName,
        bankAccountNumber,
        bankAccountHolder,
        portfolioUrl,
        notes,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: workerProfiles.userId,
        set: {
          specialty,
          skills,
          availability,
          ...(canManage ? { hourlyRate } : {}),
          bankName,
          bankAccountNumber,
          bankAccountHolder,
          portfolioUrl,
          notes,
          updatedAt: new Date(),
        },
      });

    // Keep user's title synced with specialty when edited
    await db.update(users).set({ title: specialty, updatedAt: new Date() }).where(eq(users.id, userId));

    revalidatePath("/admin/workers");
    revalidatePath("/admin/roles");
    return { ok: true, message: "Profil worker berhasil diperbarui!" };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Gagal memperbarui profil worker.",
    };
  }
}

/**
 * Assign / Update a Milestone's Worker, Status, Fee, Due Date, and Estimated Hours
 */
export async function assignWorkerTaskAction(formData: FormData): Promise<ActionResult> {
  try {
    await requirePermission("workers:manage");

    const id = String(formData.get("id") || "").trim();
    const projectId = String(formData.get("projectId") || "").trim();
    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim() || null;
    const assigneeId = String(formData.get("assigneeId") || "").trim() || null;
    const status = String(formData.get("status") || "TODO") as TaskStatus;
    const dueDate = String(formData.get("dueDate") || "").trim() || null;
    const feeAmount = Math.max(0, Number(formData.get("feeAmount") || 0) || 0);
    const estimatedHours = Math.max(0, Number(formData.get("estimatedHours") || 0) || 0);

    if (!projectId || !title) {
      return { ok: false, message: "Project dan judul tugas wajib diisi." };
    }

    if (id) {
      await db
        .update(projectMilestones)
        .set({
          projectId,
          title,
          description,
          assigneeId,
          status,
          dueDate,
          feeAmount,
          estimatedHours,
          completedAt: status === "DONE" ? new Date() : null,
        })
        .where(eq(projectMilestones.id, id));
    } else {
      await db.insert(projectMilestones).values({
        projectId,
        title,
        description,
        assigneeId,
        status,
        dueDate,
        feeAmount,
        estimatedHours,
        completedAt: status === "DONE" ? new Date() : null,
      });
    }

    await recalcProjectProgress(projectId);

    revalidatePath("/admin/workers");
    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${projectId}`);
    revalidatePath("/track");
    return {
      ok: true,
      message: id ? "Penugasan milestone berhasil diperbarui!" : "Tugas baru berhasil ditugaskan!",
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Gagal menyimpan penugasan tugas.",
    };
  }
}

/**
 * Worker self-service or Manager quick task status update
 */
export async function workerUpdateTaskStatusAction(
  milestoneId: string,
  status: TaskStatus
): Promise<ActionResult> {
  try {
    const actor = await requireAuth();
    const [m] = await db
      .select()
      .from(projectMilestones)
      .where(eq(projectMilestones.id, milestoneId))
      .limit(1);

    if (!m) return { ok: false, message: "Tugas tidak ditemukan." };

    const canManage = hasPermission(actor.role, "workers:manage");
    if (!canManage && m.assigneeId !== actor.id) {
      return { ok: false, message: "Kamu hanya bisa mengubah status tugas yang ditugaskan kepadamu." };
    }

    await db
      .update(projectMilestones)
      .set({
        status,
        completedAt: status === "DONE" ? new Date() : null,
      })
      .where(eq(projectMilestones.id, milestoneId));

    await recalcProjectProgress(m.projectId);

    revalidatePath("/admin/workers");
    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${m.projectId}`);
    revalidatePath("/track");
    return { ok: true, message: "Status tugas berhasil diperbarui!" };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Gagal mengubah status tugas.",
    };
  }
}

/**
 * Log Timesheet Work Hours (Worker logs for self, Manager can log for any worker)
 */
export async function createWorkLogAction(formData: FormData): Promise<ActionResult> {
  try {
    const actor = await requireAuth();
    const canManage = hasPermission(actor.role, "workers:manage");

    const requestedWorkerId = String(formData.get("workerId") || "").trim();
    const workerId = canManage && requestedWorkerId ? requestedWorkerId : actor.id;
    const projectId = String(formData.get("projectId") || "").trim();
    const milestoneId = String(formData.get("milestoneId") || "").trim() || null;
    const workDate =
      String(formData.get("workDate") || "").trim() || new Date().toISOString().slice(0, 10);
    const hours = Math.max(0, Number(formData.get("hours") || 0) || 0);
    const minutes = Math.max(0, Number(formData.get("minutes") || 0) || 0);
    const durationMinutes = hours * 60 + minutes;
    const summary = String(formData.get("summary") || "").trim();

    if (!projectId || !summary || durationMinutes <= 0) {
      return { ok: false, message: "Project, durasi kerja, dan ringkasan aktivitas wajib diisi." };
    }

    await db.insert(workerWorkLogs).values({
      workerId,
      projectId,
      milestoneId,
      workDate,
      durationMinutes,
      summary,
    });

    revalidatePath("/admin/workers");
    return { ok: true, message: "Log jam kerja berhasil dicatat!" };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Gagal mencatat timesheet.",
    };
  }
}

export async function deleteWorkLogAction(id: string): Promise<ActionResult> {
  try {
    const actor = await requireAuth();
    const [log] = await db
      .select()
      .from(workerWorkLogs)
      .where(eq(workerWorkLogs.id, id))
      .limit(1);
    if (!log) return { ok: false, message: "Log kerja tidak ditemukan." };

    const canManage = hasPermission(actor.role, "workers:manage");
    if (!canManage && log.workerId !== actor.id) {
      return { ok: false, message: "Tidak punya izin menghapus log kerja ini." };
    }

    await db.delete(workerWorkLogs).where(eq(workerWorkLogs.id, id));
    revalidatePath("/admin/workers");
    return { ok: true, message: "Log kerja berhasil dihapus." };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Gagal menghapus log kerja.",
    };
  }
}

/**
 * Create Commission / Payout Entry (Managers only)
 */
export async function createPayoutAction(formData: FormData): Promise<ActionResult> {
  try {
    await requirePermission("workers:manage");

    const workerId = String(formData.get("workerId") || "").trim();
    const projectId = String(formData.get("projectId") || "").trim() || null;
    const milestoneId = String(formData.get("milestoneId") || "").trim() || null;
    const title = String(formData.get("title") || "").trim();
    const amount = Math.max(0, Number(formData.get("amount") || 0) || 0);
    const status = String(formData.get("status") || "PENDING") as PayoutStatus;
    const paymentMethod = String(formData.get("paymentMethod") || "").trim() || null;
    const notes = String(formData.get("notes") || "").trim() || null;

    if (!workerId || !title || amount <= 0) {
      return { ok: false, message: "Worker, judul komisi, dan nominal (> 0) wajib diisi." };
    }

    await db.insert(workerPayouts).values({
      workerId,
      projectId,
      milestoneId,
      title,
      amount,
      status,
      paymentMethod,
      notes,
      paidAt: status === "PAID" ? new Date() : null,
    });

    revalidatePath("/admin/workers");
    return { ok: true, message: "Komisi / payout worker berhasil dicatat!" };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Gagal mencatat komisi worker.",
    };
  }
}

export async function generatePayoutFromMilestoneAction(
  milestoneId: string
): Promise<ActionResult> {
  try {
    await requirePermission("workers:manage");

    const [m] = await db
      .select()
      .from(projectMilestones)
      .where(eq(projectMilestones.id, milestoneId))
      .limit(1);

    if (!m || !m.assigneeId || m.feeAmount <= 0) {
      return {
        ok: false,
        message: "Milestone harus memiliki Worker tertugas dan nominal Fee > Rp 0.",
      };
    }

    const existing = await db
      .select({ id: workerPayouts.id })
      .from(workerPayouts)
      .where(eq(workerPayouts.milestoneId, milestoneId))
      .limit(1);

    if (existing.length > 0) {
      return { ok: false, message: "Komisi untuk milestone ini sudah pernah dicatat." };
    }

    const [profile] = await db
      .select()
      .from(workerProfiles)
      .where(eq(workerProfiles.userId, m.assigneeId))
      .limit(1);

    const paymentMethod = profile?.bankName
      ? `${profile.bankName}${profile.bankAccountNumber ? ` · ${profile.bankAccountNumber}` : ""}`
      : null;

    await db.insert(workerPayouts).values({
      workerId: m.assigneeId,
      projectId: m.projectId,
      milestoneId: m.id,
      title: `Fee Milestone: ${m.title}`,
      amount: m.feeAmount,
      status: "PENDING",
      paymentMethod,
      notes: "Dibuat otomatis dari penyelesaian milestone.",
    });

    revalidatePath("/admin/workers");
    return { ok: true, message: "Komisi otomatis masuk daftar Payout (Menunggu Review)!" };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Gagal membuat komisi dari milestone.",
    };
  }
}

export async function updatePayoutStatusAction(
  id: string,
  status: PayoutStatus
): Promise<ActionResult> {
  try {
    await requirePermission("workers:manage");
    if (!id) return { ok: false, message: "ID payout tidak valid." };

    await db
      .update(workerPayouts)
      .set({
        status,
        paidAt: status === "PAID" ? new Date() : null,
      })
      .where(eq(workerPayouts.id, id));

    revalidatePath("/admin/workers");
    return {
      ok: true,
      message:
        status === "PAID"
          ? "Payout ditandai Sudah Dicairkan!"
          : status === "APPROVED"
            ? "Payout disetujui & siap dicairkan!"
            : "Status payout dikembalikan ke Menunggu Review.",
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Gagal memperbarui status payout.",
    };
  }
}

export async function deletePayoutAction(id: string): Promise<ActionResult> {
  try {
    await requirePermission("workers:manage");
    if (!id) return { ok: false, message: "ID payout tidak valid." };

    await db.delete(workerPayouts).where(eq(workerPayouts.id, id));
    revalidatePath("/admin/workers");
    return { ok: true, message: "Data payout berhasil dihapus." };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Gagal menghapus payout.",
    };
  }
}

/**
 * 1-Click Approve Worker Application -> Auto-create User (role WORKER) + Worker Profile
 */
export async function approveWorkerApplicationAction(
  applicationId: string,
  reviewNote?: string
): Promise<ActionResult> {
  try {
    const actor = await requirePermission("workers:manage");

    const [app] = await db
      .select()
      .from(workerApplications)
      .where(eq(workerApplications.id, applicationId))
      .limit(1);

    if (!app) return { ok: false, message: "Data pendaftar tidak ditemukan." };
    if (app.status === "APPROVED" && app.createdUserId) {
      return { ok: false, message: "Pendaftar ini sudah disetujui sebelumnya." };
    }

    // Check if user with this email already exists
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, app.email.toLowerCase()))
      .limit(1);

    let workerUserId: string;
    if (existingUsers.length > 0) {
      workerUserId = existingUsers[0].id;
      await db
        .update(users)
        .set({ isActive: true, title: app.specialty, updatedAt: new Date() })
        .where(eq(users.id, workerUserId));
    } else {
      const [created] = await db
        .insert(users)
        .values({
          name: app.name,
          email: app.email.toLowerCase(),
          passwordHash: app.passwordHash,
          role: "WORKER",
          title: app.specialty,
          isActive: true,
        })
        .returning({ id: users.id });
      workerUserId = created.id;
    }

    await db
      .insert(workerProfiles)
      .values({
        userId: workerUserId,
        specialty: app.specialty,
        skills: app.skills ?? [],
        availability: "AVAILABLE",
        hourlyRate: app.expectedHourlyRate ?? 0,
        portfolioUrl: app.portfolioUrl || app.githubUrl || app.linkedinUrl,
        notes: `Bergabung lewat formulir /join (${app.applicationCode}) · ${app.experienceLevel} · WA: ${app.phone}`,
      })
      .onConflictDoUpdate({
        target: workerProfiles.userId,
        set: {
          specialty: app.specialty,
          skills: app.skills ?? [],
          hourlyRate: app.expectedHourlyRate ?? 0,
          portfolioUrl: app.portfolioUrl || app.githubUrl || app.linkedinUrl,
          updatedAt: new Date(),
        },
      });

    await db
      .update(workerApplications)
      .set({
        status: "APPROVED",
        reviewNote: reviewNote?.trim() || "Selamat bergabung di squad Worker KodeLokal! Silakan login di /login menggunakan email & password pendaftaranmu.",
        reviewedById: actor.id,
        createdUserId: workerUserId,
        reviewedAt: new Date(),
      })
      .where(eq(workerApplications.id, applicationId));

    revalidatePath("/admin/workers");
    revalidatePath("/admin/roles");
    revalidatePath("/admin");
    return {
      ok: true,
      message: `Selamat! Akun Worker "${app.name}" aktif & siap login di /login.`,
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Gagal menyetujui pendaftar worker.",
    };
  }
}

export async function updateWorkerApplicationStatusAction(
  applicationId: string,
  status: Exclude<ApplicationStatus, "APPROVED">,
  reviewNote?: string
): Promise<ActionResult> {
  try {
    const actor = await requirePermission("workers:manage");
    if (!applicationId) return { ok: false, message: "ID pendaftar tidak valid." };

    await db
      .update(workerApplications)
      .set({
        status,
        reviewNote: reviewNote?.trim() || null,
        reviewedById: actor.id,
        reviewedAt: new Date(),
      })
      .where(eq(workerApplications.id, applicationId));

    revalidatePath("/admin/workers");
    revalidatePath("/admin");
    return {
      ok: true,
      message:
        status === "INTERVIEW"
          ? "Status diubah ke Tahap Ngobrol / Tes!"
          : status === "REJECTED"
            ? "Lamaran ditandai Belum Cocok."
            : "Status lamaran dikembalikan ke Menunggu Review.",
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Gagal memperbarui status lamaran.",
    };
  }
}

export async function deleteWorkerApplicationAction(id: string): Promise<ActionResult> {
  try {
    await requirePermission("workers:manage");
    if (!id) return { ok: false, message: "ID pendaftar tidak valid." };

    await db.delete(workerApplications).where(eq(workerApplications.id, id));
    revalidatePath("/admin/workers");
    revalidatePath("/admin");
    return { ok: true, message: "Data pendaftar berhasil dihapus." };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Gagal menghapus data pendaftar.",
    };
  }
}
