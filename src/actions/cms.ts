"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { siteSettings, services, testimonials, faqs } from "@/db/schema";
import { requirePermission } from "@/lib/auth";
import type { ActionResult } from "./portfolio";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function updateSiteSettingsAction(formData: FormData): Promise<ActionResult> {
  try {
    await requirePermission("cms:write");

    const brandName = String(formData.get("brandName") || "KodeLokal").trim();
    const tagline = String(formData.get("tagline") || "Mitra Digital Anda").trim();
    const heroTitle = String(formData.get("heroTitle") || "").trim();
    const heroSubtitle = String(formData.get("heroSubtitle") || "").trim();
    const heroCtaPrimary = String(formData.get("heroCtaPrimary") || "Ngobrol Sama Mimin").trim();
    const heroCtaSecondary = String(formData.get("heroCtaSecondary") || "Kepoin Portofolio").trim();
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
    return { ok: true, message: "Pengaturan situs berhasil disimpan!" };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Gagal menyimpan pengaturan situs.",
    };
  }
}

export async function createServiceAction(formData: FormData): Promise<ActionResult> {
  try {
    await requirePermission("cms:write");

    const title = String(formData.get("title") || "").trim();
    const shortDescription = String(formData.get("shortDescription") || "").trim();
    const startingPrice = String(formData.get("startingPrice") || "Hubungi Mimin").trim();
    const iconName = String(formData.get("iconName") || "Code2").trim();
    const accentColor = String(formData.get("accentColor") || "blue").trim();
    const features = String(formData.get("features") || "")
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);
    const sortOrder = Number(formData.get("sortOrder") || 0) || 0;

    if (!title || !shortDescription) {
      return { ok: false, message: "Nama dan deskripsi layanan wajib diisi." };
    }

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
    return { ok: true, message: "Layanan baru berhasil ditambahkan!" };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Gagal menambahkan layanan.",
    };
  }
}

export async function updateServiceAction(formData: FormData): Promise<ActionResult> {
  try {
    await requirePermission("cms:write");

    const id = String(formData.get("id") || "").trim();
    const title = String(formData.get("title") || "").trim();
    const shortDescription = String(formData.get("shortDescription") || "").trim();
    const startingPrice = String(formData.get("startingPrice") || "Hubungi Mimin").trim();
    const iconName = String(formData.get("iconName") || "Code2").trim();
    const accentColor = String(formData.get("accentColor") || "blue").trim();
    const features = String(formData.get("features") || "")
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);
    const sortOrder = Number(formData.get("sortOrder") || 0) || 0;

    if (!id || !title || !shortDescription) {
      return { ok: false, message: "Nama dan deskripsi layanan wajib diisi." };
    }

    await db
      .update(services)
      .set({
        title,
        shortDescription,
        startingPrice,
        iconName,
        accentColor: accentColor === "orange" ? "orange" : "blue",
        features,
        sortOrder,
      })
      .where(eq(services.id, id));

    revalidatePath("/");
    revalidatePath("/admin/cms");
    return { ok: true, message: "Layanan berhasil diperbarui!" };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Gagal memperbarui layanan.",
    };
  }
}

export async function deleteServiceAction(id: string): Promise<ActionResult> {
  try {
    await requirePermission("cms:write");
    if (!id) return { ok: false, message: "ID layanan tidak valid." };
    await db.delete(services).where(eq(services.id, id));
    revalidatePath("/");
    revalidatePath("/admin/cms");
    return { ok: true, message: "Layanan berhasil dihapus." };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Gagal menghapus layanan.",
    };
  }
}

export async function createTestimonialAction(formData: FormData): Promise<ActionResult> {
  try {
    await requirePermission("cms:write");
    const clientName = String(formData.get("clientName") || "").trim();
    const clientRole = String(formData.get("clientRole") || "").trim();
    const companyName = String(formData.get("companyName") || "").trim();
    const quote = String(formData.get("quote") || "").trim();
    const rating = Math.min(5, Math.max(1, Number(formData.get("rating") || 5)));

    if (!clientName || !quote) {
      return { ok: false, message: "Nama klien dan kutipan testimoni wajib diisi." };
    }

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
    return { ok: true, message: "Testimoni berhasil ditambahkan!" };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Gagal menambahkan testimoni.",
    };
  }
}

export async function updateTestimonialAction(formData: FormData): Promise<ActionResult> {
  try {
    await requirePermission("cms:write");
    const id = String(formData.get("id") || "").trim();
    const clientName = String(formData.get("clientName") || "").trim();
    const clientRole = String(formData.get("clientRole") || "").trim();
    const companyName = String(formData.get("companyName") || "").trim();
    const quote = String(formData.get("quote") || "").trim();
    const rating = Math.min(5, Math.max(1, Number(formData.get("rating") || 5)));

    if (!id || !clientName || !quote) {
      return { ok: false, message: "Nama klien dan kutipan testimoni wajib diisi." };
    }

    await db
      .update(testimonials)
      .set({
        clientName,
        clientRole: clientRole || "Klien",
        companyName: companyName || "Mitra Bisnis",
        quote,
        rating,
      })
      .where(eq(testimonials.id, id));

    revalidatePath("/");
    revalidatePath("/admin/cms");
    return { ok: true, message: "Testimoni berhasil diperbarui!" };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Gagal memperbarui testimoni.",
    };
  }
}

export async function deleteTestimonialAction(id: string): Promise<ActionResult> {
  try {
    await requirePermission("cms:write");
    if (!id) return { ok: false, message: "ID testimoni tidak valid." };
    await db.delete(testimonials).where(eq(testimonials.id, id));
    revalidatePath("/");
    revalidatePath("/admin/cms");
    return { ok: true, message: "Testimoni berhasil dihapus." };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Gagal menghapus testimoni.",
    };
  }
}

export async function createFaqAction(formData: FormData): Promise<ActionResult> {
  try {
    await requirePermission("cms:write");
    const question = String(formData.get("question") || "").trim();
    const answer = String(formData.get("answer") || "").trim();
    const sortOrder = Number(formData.get("sortOrder") || 0) || 0;
    if (!question || !answer) {
      return { ok: false, message: "Pertanyaan dan jawaban wajib diisi." };
    }

    await db.insert(faqs).values({
      question,
      answer,
      sortOrder,
      isPublished: true,
    });

    revalidatePath("/");
    revalidatePath("/admin/cms");
    return { ok: true, message: "FAQ baru berhasil ditambahkan!" };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Gagal menambahkan FAQ.",
    };
  }
}

export async function updateFaqAction(formData: FormData): Promise<ActionResult> {
  try {
    await requirePermission("cms:write");
    const id = String(formData.get("id") || "").trim();
    const question = String(formData.get("question") || "").trim();
    const answer = String(formData.get("answer") || "").trim();
    const sortOrder = Number(formData.get("sortOrder") || 0) || 0;
    if (!id || !question || !answer) {
      return { ok: false, message: "Pertanyaan dan jawaban wajib diisi." };
    }

    await db
      .update(faqs)
      .set({ question, answer, sortOrder })
      .where(eq(faqs.id, id));

    revalidatePath("/");
    revalidatePath("/admin/cms");
    return { ok: true, message: "FAQ berhasil diperbarui!" };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Gagal memperbarui FAQ.",
    };
  }
}

export async function deleteFaqAction(id: string): Promise<ActionResult> {
  try {
    await requirePermission("cms:write");
    if (!id) return { ok: false, message: "ID FAQ tidak valid." };
    await db.delete(faqs).where(eq(faqs.id, id));
    revalidatePath("/");
    revalidatePath("/admin/cms");
    return { ok: true, message: "FAQ berhasil dihapus." };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Gagal menghapus FAQ.",
    };
  }
}
