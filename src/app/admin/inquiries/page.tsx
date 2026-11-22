import { desc } from "drizzle-orm";
import { db } from "@/db";
import { inquiries } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { InquiriesManager } from "@/components/admin/InquiriesManager";

export default async function AdminInquiriesPage() {
  const user = await requireAuth();
  const canWrite = hasPermission(user.role, "inquiries:write");
  const canConvert = hasPermission(user.role, "projects:write");

  const list = await db.select().from(inquiries).orderBy(desc(inquiries.createdAt));

  return <InquiriesManager list={list} canWrite={canWrite} canConvert={canConvert} />;
}
