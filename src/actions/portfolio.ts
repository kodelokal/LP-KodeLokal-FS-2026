"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { portfolios } from "@/db/schema";
import { requirePermission } from "@/lib/auth";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createPortfolioAction(formData: FormData) {
  await requirePermission("portfolio:write");

  const title = String(formData.get("title") || "").trim();
  const clientName = String(formData.get("clientName") || "").trim();
  const category = String(formData.get("category") || "Web App").trim();
  const summary = String(formData.get("summary") || "").trim();
  const description = String(formData.get("description") || summary).trim();
  const imageUrl =
    String(formData.get("imageUrl") || "").trim() || "/portfolio/kriya-commerce.jpg";
  const galleryImages = String(formData.get("galleryImages") || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const liveUrl = String(formData.get("liveUrl") || "").trim() || null;
  const projectYear = Number(formData.get("projectYear") || 2026) || 2026;
  const techStack = String(formData.get("techStack") || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const featured = formData.get("featured") === "on";

  if (!title || !clientName || !summary) return;

  const slug = `${slugify(title)}-${Date.now().toString(36).slice(-4)}`;
  await db.insert(portfolios).values({
    slug,
    title,
    clientName,
    category,
    summary,
    description,
    imageUrl,
    galleryImages,
    liveUrl,
    projectYear,
    techStack,
    featured,
    isPublished: true,
  });

  revalidatePath("/");
  revalidatePath("/admin/portfolio");
}

export async function updatePortfolioMediaAction(formData: FormData) {
  await requirePermission("portfolio:write");

  const id = String(formData.get("id") || "").trim();
  const slug = String(formData.get("slug") || "").trim();
  const imageUrl = String(formData.get("imageUrl") || "").trim();
  const galleryImages = String(formData.get("galleryImages") || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (!id || !imageUrl) return;

  await db
    .update(portfolios)
    .set({
      imageUrl,
      galleryImages,
      updatedAt: new Date(),
    })
    .where(eq(portfolios.id, id));

  revalidatePath("/");
  if (slug) revalidatePath(`/portfolio/${slug}`);
  revalidatePath("/admin/portfolio");
}

export async function togglePortfolioPublishAction(formData: FormData) {
  await requirePermission("portfolio:write");
  const id = String(formData.get("id") || "");
  const current = formData.get("current") === "true";
  if (!id) return;

  await db
    .update(portfolios)
    .set({ isPublished: !current, updatedAt: new Date() })
    .where(eq(portfolios.id, id));

  revalidatePath("/");
  revalidatePath("/admin/portfolio");
}

export async function deletePortfolioAction(formData: FormData) {
  await requirePermission("portfolio:write");
  const id = String(formData.get("id") || "");
  if (!id) return;

  await db.delete(portfolios).where(eq(portfolios.id, id));
  revalidatePath("/");
  revalidatePath("/admin/portfolio");
}
