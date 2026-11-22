import { asc } from "drizzle-orm";
import { db } from "@/db";
import { services, testimonials, faqs } from "@/db/schema";
import { getLandingPageData } from "@/lib/data";
import { requireAuth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { CmsManager } from "@/components/admin/CmsManager";

export default async function AdminCmsPage() {
  const user = await requireAuth();
  const canWrite = hasPermission(user.role, "cms:write");

  const [landing, allServices, allTestimonials, allFaqs] = await Promise.all([
    getLandingPageData(),
    db.select().from(services).orderBy(asc(services.sortOrder)),
    db.select().from(testimonials).orderBy(asc(testimonials.sortOrder)),
    db.select().from(faqs).orderBy(asc(faqs.sortOrder)),
  ]);

  return (
    <CmsManager
      settings={landing.settings}
      services={allServices}
      testimonials={allTestimonials}
      faqs={allFaqs}
      canWrite={canWrite}
    />
  );
}
