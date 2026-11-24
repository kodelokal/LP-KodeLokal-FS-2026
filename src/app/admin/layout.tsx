import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { inquiries, workerApplications } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Dashboard Admin & CMS",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth();
  const canManageWorkers = hasPermission(user.role, "workers:manage");

  const [newInquiries, pendingWorkerApps] = await Promise.all([
    db.select({ id: inquiries.id }).from(inquiries).where(eq(inquiries.status, "NEW")),
    canManageWorkers
      ? db
          .select({ id: workerApplications.id })
          .from(workerApplications)
          .where(eq(workerApplications.status, "PENDING"))
      : Promise.resolve([]),
  ]);

  return (
    <AdminShell
      user={user}
      newInquiryCount={newInquiries.length}
      pendingWorkerAppsCount={pendingWorkerApps.length}
    >
      {children}
    </AdminShell>
  );
}
