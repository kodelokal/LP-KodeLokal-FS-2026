import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  siteSettings,
  services,
  portfolios,
  teamMembers,
  testimonials,
  faqs,
  clientProjects,
  projectMilestones,
  type SiteSettings,
} from "@/db/schema";

const FALLBACK_SETTINGS: SiteSettings = {
  id: 1,
  brandName: "KodeLokal",
  tagline: "Mitra Digital Anda",
  heroTitle: "Bangun Produk Digital yang Cepat, Rapi, dan Siap Tumbuh.",
  heroSubtitle:
    "KodeLokal membantu bisnis, UMKM, dan startup di Indonesia merancang landing page berkonversi tinggi, aplikasi web custom, serta sistem manajemen terintegrasi.",
  heroCtaPrimary: "Konsultasi Project Gratis",
  heroCtaSecondary: "Jelajahi Portofolio",
  aboutTitle: "Satu Tim Solid untuk Solusi Digital End-to-End",
  aboutDescription:
    "Kami menggabungkan desain antarmuka modern, arsitektur kode bersih, dan alur kerja transparan.",
  whatsappNumber: "6281234567890",
  contactEmail: "halo@kodelokal.store",
  officeAddress: "Indonesia — Remote-First Digital Studio",
  socialLinks: {},
  stats: [
    { label: "Project Terselesaikan", value: "25+" },
    { label: "Klien & Mitra Aktif", value: "18+" },
    { label: "Kepuasan Klien", value: "99%" },
    { label: "Transparansi Progress", value: "100%" },
  ],
  updatedAt: new Date(),
};

export async function getLandingPageData() {
  const [settingsRows, serviceRows, portfolioRows, teamRows, testimonialRows, faqRows] =
    await Promise.all([
      db.select().from(siteSettings).where(eq(siteSettings.id, 1)).limit(1),
      db
        .select()
        .from(services)
        .where(eq(services.isPublished, true))
        .orderBy(asc(services.sortOrder), asc(services.createdAt)),
      db
        .select()
        .from(portfolios)
        .where(eq(portfolios.isPublished, true))
        .orderBy(asc(portfolios.sortOrder), desc(portfolios.projectYear)),
      db
        .select()
        .from(teamMembers)
        .where(eq(teamMembers.isVisible, true))
        .orderBy(asc(teamMembers.sortOrder), asc(teamMembers.createdAt)),
      db
        .select()
        .from(testimonials)
        .where(eq(testimonials.isPublished, true))
        .orderBy(asc(testimonials.sortOrder)),
      db
        .select()
        .from(faqs)
        .where(eq(faqs.isPublished, true))
        .orderBy(asc(faqs.sortOrder)),
    ]);

  return {
    settings: settingsRows[0] ?? FALLBACK_SETTINGS,
    services: serviceRows,
    portfolios: portfolioRows,
    teamMembers: teamRows,
    testimonials: testimonialRows,
    faqs: faqRows,
  };
}

export async function getPublicProjectByCode(rawCode: string) {
  const normalized = rawCode.trim().toUpperCase();
  if (!normalized) return null;

  const [project] = await db
    .select()
    .from(clientProjects)
    .where(eq(clientProjects.trackingCode, normalized))
    .limit(1);

  if (!project || !project.isPublicTracking) return null;

  const milestones = await db
    .select()
    .from(projectMilestones)
    .where(eq(projectMilestones.projectId, project.id))
    .orderBy(asc(projectMilestones.sortOrder), asc(projectMilestones.createdAt));

  return {
    id: project.id,
    trackingCode: project.trackingCode,
    title: project.title,
    clientName: project.clientName,
    clientCompany: project.clientCompany,
    serviceCategory: project.serviceCategory,
    status: project.status,
    progress: project.progress,
    startDate: project.startDate,
    dueDate: project.dueDate,
    stagingUrl: project.stagingUrl,
    updatedAt: project.updatedAt,
    milestones: milestones.map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      status: m.status,
      dueDate: m.dueDate,
      completedAt: m.completedAt,
    })),
  };
}
