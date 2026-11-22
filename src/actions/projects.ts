"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  clientProjects,
  projectMilestones,
  inquiries,
  type ProjectStatus,
  type ProjectPriority,
  type TaskStatus,
  type InquiryStatus,
} from "@/db/schema";
import { requirePermission } from "@/lib/auth";

function generateTrackingCode(): string {
  const year = new Date().getFullYear();
  const suffix = Math.floor(100 + Math.random() * 900);
  const randChar = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return `KL-${year}-${suffix}${randChar}`;
}

async function recalculateProjectProgress(projectId: string) {
  const rows = await db
    .select()
    .from(projectMilestones)
    .where(eq(projectMilestones.projectId, projectId));
  if (rows.length === 0) return;
  const doneCount = rows.filter((m) => m.status === "DONE").length;
  const inProgCount = rows.filter((m) => m.status === "IN_PROGRESS" || m.status === "REVIEW").length;
  const computed = Math.round(((doneCount + inProgCount * 0.45) / rows.length) * 100);
  const clamped = Math.min(100, Math.max(0, computed));

  await db
    .update(clientProjects)
    .set({ progress: clamped, updatedAt: new Date() })
    .where(eq(clientProjects.id, projectId));
}

export async function createClientProjectAction(formData: FormData) {
  const user = await requirePermission("projects:write");

  const title = String(formData.get("title") || "").trim();
  const clientName = String(formData.get("clientName") || "").trim();
  const clientEmail = String(formData.get("clientEmail") || "").trim();
  const clientCompany = String(formData.get("clientCompany") || "").trim() || null;
  const clientPhone = String(formData.get("clientPhone") || "").trim() || null;
  const serviceCategory = String(formData.get("serviceCategory") || "Web App").trim();
  const status = (String(formData.get("status") || "PLANNING") as ProjectStatus);
  const priority = (String(formData.get("priority") || "MEDIUM") as ProjectPriority);
  const budget = String(formData.get("budget") || "").trim() || null;
  const dueDate = String(formData.get("dueDate") || "").trim() || null;
  const stagingUrl = String(formData.get("stagingUrl") || "").trim() || null;
  const notes = String(formData.get("notes") || "").trim() || null;

  if (!title || !clientName || !clientEmail) return;

  const trackingCode =
    String(formData.get("trackingCode") || "").trim().toUpperCase() || generateTrackingCode();

  const [created] = await db
    .insert(clientProjects)
    .values({
      trackingCode,
      title,
      clientName,
      clientEmail,
      clientCompany,
      clientPhone,
      serviceCategory,
      status,
      priority,
      progress: status === "COMPLETED" ? 100 : status === "IN_PROGRESS" ? 30 : 10,
      budget,
      startDate: new Date().toISOString().slice(0, 10),
      dueDate,
      stagingUrl,
      notes,
      leadPmId: user.id,
      isPublicTracking: true,
    })
    .returning();

  // Seed default first milestone so tracker looks helpful immediately
  await db.insert(projectMilestones).values({
    projectId: created.id,
    title: "Kickoff, Discovery & Perencanaan Teknis",
    description: "Finalisasi ruang lingkup fitur, wireframe, dan jadwal delivery.",
    status: "IN_PROGRESS",
    dueDate,
    sortOrder: 1,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/projects");
  revalidatePath("/track");
}

export async function updateClientProjectAction(formData: FormData) {
  await requirePermission("projects:write");

  const id = String(formData.get("id") || "");
  if (!id) return;

  const status = String(formData.get("status") || "IN_PROGRESS") as ProjectStatus;
  const priority = String(formData.get("priority") || "MEDIUM") as ProjectPriority;
  const progress = Math.min(100, Math.max(0, Number(formData.get("progress") || 0)));
  const dueDate = String(formData.get("dueDate") || "").trim() || null;
  const stagingUrl = String(formData.get("stagingUrl") || "").trim() || null;
  const repositoryUrl = String(formData.get("repositoryUrl") || "").trim() || null;
  const notes = String(formData.get("notes") || "").trim() || null;
  const isPublicTracking = formData.get("isPublicTracking") === "on";

  await db
    .update(clientProjects)
    .set({
      status,
      priority,
      progress,
      dueDate,
      stagingUrl,
      repositoryUrl,
      notes,
      isPublicTracking,
      updatedAt: new Date(),
    })
    .where(eq(clientProjects.id, id));

  revalidatePath("/admin");
  revalidatePath("/admin/projects");
  revalidatePath(`/admin/projects/${id}`);
  revalidatePath("/track");
}

export async function deleteClientProjectAction(formData: FormData) {
  await requirePermission("projects:write");
  const id = String(formData.get("id") || "");
  if (!id) return;

  await db.delete(clientProjects).where(eq(clientProjects.id, id));
  revalidatePath("/admin");
  revalidatePath("/admin/projects");
  revalidatePath("/track");
}

export async function createMilestoneAction(formData: FormData) {
  await requirePermission("projects:write");

  const projectId = String(formData.get("projectId") || "");
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const dueDate = String(formData.get("dueDate") || "").trim() || null;
  const status = (String(formData.get("status") || "TODO") as TaskStatus);

  if (!projectId || !title) return;

  await db.insert(projectMilestones).values({
    projectId,
    title,
    description,
    status,
    dueDate,
    completedAt: status === "DONE" ? new Date() : null,
  });

  await recalculateProjectProgress(projectId);

  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath("/admin/projects");
  revalidatePath("/track");
}

export async function updateMilestoneStatusAction(formData: FormData) {
  await requirePermission("projects:write");

  const id = String(formData.get("id") || "");
  const projectId = String(formData.get("projectId") || "");
  const status = String(formData.get("status") || "TODO") as TaskStatus;
  if (!id || !projectId) return;

  await db
    .update(projectMilestones)
    .set({
      status,
      completedAt: status === "DONE" ? new Date() : null,
    })
    .where(eq(projectMilestones.id, id));

  await recalculateProjectProgress(projectId);

  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath("/admin/projects");
  revalidatePath("/track");
}

export async function deleteMilestoneAction(formData: FormData) {
  await requirePermission("projects:write");

  const id = String(formData.get("id") || "");
  const projectId = String(formData.get("projectId") || "");
  if (!id || !projectId) return;

  await db.delete(projectMilestones).where(eq(projectMilestones.id, id));
  await recalculateProjectProgress(projectId);

  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath("/admin/projects");
  revalidatePath("/track");
}

export async function updateInquiryStatusAction(formData: FormData) {
  await requirePermission("inquiries:write");
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "CONTACTED") as InquiryStatus;
  if (!id) return;

  await db.update(inquiries).set({ status }).where(eq(inquiries.id, id));
  revalidatePath("/admin");
  revalidatePath("/admin/inquiries");
}

export async function convertInquiryToProjectAction(formData: FormData) {
  const user = await requirePermission("projects:write");
  const inquiryId = String(formData.get("inquiryId") || "");
  if (!inquiryId) return;

  const [inq] = await db.select().from(inquiries).where(eq(inquiries.id, inquiryId)).limit(1);
  if (!inq) return;

  const [project] = await db
    .insert(clientProjects)
    .values({
      trackingCode: generateTrackingCode(),
      title: `${inq.serviceInterest} — ${inq.company || inq.name}`,
      clientName: inq.name,
      clientEmail: inq.email,
      clientCompany: inq.company,
      clientPhone: inq.phone,
      serviceCategory: inq.serviceInterest,
      status: "PLANNING",
      priority: "MEDIUM",
      progress: 10,
      budget: inq.budgetRange,
      startDate: new Date().toISOString().slice(0, 10),
      notes: inq.message,
      leadPmId: user.id,
      isPublicTracking: true,
    })
    .returning();

  await db.insert(projectMilestones).values({
    projectId: project.id,
    title: "Discovery & Proposal Teknis",
    description: "Konversi dari permintaan konsultasi landing page.",
    status: "IN_PROGRESS",
    sortOrder: 1,
  });

  await db.update(inquiries).set({ status: "CONVERTED" }).where(eq(inquiries.id, inquiryId));

  revalidatePath("/admin");
  revalidatePath("/admin/inquiries");
  revalidatePath("/admin/projects");
  revalidatePath("/track");
}
