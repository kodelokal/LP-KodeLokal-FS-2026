"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { siteSettings, services, testimonials, faqs } from "@/db/schema";
import { requirePermission } from "@/lib/auth";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function updateSiteSettingsAction(formData: FormData) {
  await requirePermission("cms:write");

  const brandName = String(formData.get("brandName") || "KodeLokal").trim();
  const tagline = String(formData.get("tagline") || "Mitra Digital Anda").trim();
  const heroTitle = String(formData.get("heroTitle") || "").trim();
  const heroSubtitle = String(formData.get("heroSubtitle") || "").trim();
  const heroCtaPrimary = String(formData.get("heroCtaPrimary") || "Konsultasi Project Gratis").trim();
  const heroCtaSecondary = String(formData.get("heroCtaSecondary") || "Jelajahi Portofolio").trim();
  const aboutTitle = String(formData.get("aboutTitle") || "").trim();
  const aboutDescription = String(formData.get("aboutDescription") || "").trim();
  const whatsappNumber = String(formData.get("whatsappNumber") || "").trim();
  const contactEmail = String(formData.get("contactEmail") || "").trim();
  const officeAddress = String(formData.get("officeAddress") || "").trim();

  const socialLinks = {
    instagram: String(formData.get("instagram") || "").trim() || undefined,
    github: String(formData.get("github") || "").trim() || undefined,
    linkedin: String(formData.get("linkedin") || "").trim() || undefined,
  };

  const stats = [0, 1, 2, 3]
    .map((idx) => ({
      value: String(formData.get(`statValue_${idx}`) || "").trim(),
      label: String(formData.get(`statLabel_${idx}`) || "").trim(),
    }))
    .filter((s) => s.value && s.label);

  await db
    .update(siteSettings)
    .set({
      brandName,
      tagline,
      heroTitle,
      heroSubtitle,
      heroCtaPrimary,
      heroCtaSecondary,
      aboutTitle,
      aboutDescription,
      whatsappNumber,
      contactEmail,
      officeAddress,
      socialLinks,
      stats,
      updatedAt: new Date(),
    })
    .where(eq(siteSettings.id, 1));

  revalidatePath("/");
  revalidatePath("/track");
  revalidatePath("/admin/cms");
}

export async function createServiceAction(formData: FormData) {
  await requirePermission("cms:write");

  const title = String(formData.get("title") || "").trim();
  const shortDescription = String(formData.get("shortDescription") || "").trim();
  const startingPrice = String(formData.get("startingPrice") || "Hubungi Kami").trim();
  const iconName = String(formData.get("iconName") || "Code2").trim();
  const accentColor = String(formData.get("accentColor") || "blue").trim();
  const featuresRaw = String(formData.get("features") || "");
  const features = featuresRaw
    .split("\n")
    .map((f) => f.trim())
    .filter(Boolean);
  const sortOrder = Number(formData.get("sortOrder") || 0) || 0;

  if (!title || !shortDescription) return;

  const slug = `${slugify(title)}-${Date.now().toString(36).slice(-4)}`;
  await db.insert(services).values({
    slug,
    title,
    shortDescription,
    startingPrice,
    iconName,
    accentColor: accentColor === "orange" ? "orange" : "blue",
    features,
    sortOrder,
    isPublished: true,
  });

  revalidatePath("/");
  revalidatePath("/admin/cms");
}

export async function deleteServiceAction(formData: FormData) {
  await requirePermission("cms:write");
  const id = String(formData.get("id") || "");
  if (!id) return;
  await db.delete(services).where(eq(services.id, id));
  revalidatePath("/");
  revalidatePath("/admin/cms");
}

export async function createTestimonialAction(formData: FormData) {
  await requirePermission("cms:write");
  const clientName = String(formData.get("clientName") || "").trim();
  const clientRole = String(formData.get("clientRole") || "").trim();
  const companyName = String(formData.get("companyName") || "").trim();
  const quote = String(formData.get("quote") || "").trim();
  const rating = Math.min(5, Math.max(1, Number(formData.get("rating") || 5)));

  if (!clientName || !quote) return;

  await db.insert(testimonials).values({
    clientName,
    clientRole: clientRole || "Klien",
    companyName: companyName || "Mitra Bisnis",
    quote,
    rating,
    isPublished: true,
  });

  revalidatePath("/");
  revalidatePath("/admin/cms");
}

export async function deleteTestimonialAction(formData: FormData) {
  await requirePermission("cms:write");
  const id = String(formData.get("id") || "");
  if (!id) return;
  await db.delete(testimonials).where(eq(testimonials.id, id));
  revalidatePath("/");
  revalidatePath("/admin/cms");
}

export async function createFaqAction(formData: FormData) {
  await requirePermission("cms:write");
  const question = String(formData.get("question") || "").trim();
  const answer = String(formData.get("answer") || "").trim();
  const sortOrder = Number(formData.get("sortOrder") || 0) || 0;
  if (!question || !answer) return;

  await db.insert(faqs).values({
    question,
    answer,
    sortOrder,
    isPublished: true,
  });

  revalidatePath("/");
  revalidatePath("/admin/cms");
}

export async function deleteFaqAction(formData: FormData) {
  await requirePermission("cms:write");
  const id = String(formData.get("id") || "");
  if (!id) return;
  await db.delete(faqs).where(eq(faqs.id, id));
  revalidatePath("/");
  revalidatePath("/admin/cms");
}
