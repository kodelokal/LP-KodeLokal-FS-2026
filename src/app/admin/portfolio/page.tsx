import { asc, desc } from "drizzle-orm";
import { db } from "@/db";
import { portfolios } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { PortfolioManager } from "@/components/admin/PortfolioManager";

export default async function AdminPortfolioPage() {
  const user = await requireAuth();
  const canWrite = hasPermission(user.role, "portfolio:write");

  const items = await db
    .select()
    .from(portfolios)
    .orderBy(asc(portfolios.sortOrder), desc(portfolios.projectYear));

  return <PortfolioManager items={items} canWrite={canWrite} />;
}
