import { eq } from "drizzle-orm";
import { db } from "@/db";
import { inquiries } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth();
  const newInquiries = await db
    .select({ id: inquiries.id })
    .from(inquiries)
    .where(eq(inquiries.status, "NEW"));

  return (
    <AdminShell user={user} newInquiryCount={newInquiries.length}>
      {children}
    </AdminShell>
  );
}
