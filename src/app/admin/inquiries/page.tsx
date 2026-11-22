import { desc } from "drizzle-orm";
import { Mail, Phone, Building2, FolderPlus } from "lucide-react";
import { db } from "@/db";
import { inquiries } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { INQUIRY_STATUS_META, hasPermission } from "@/lib/rbac";
import {
  updateInquiryStatusAction,
  convertInquiryToProjectAction,
} from "@/actions/projects";

export default async function AdminInquiriesPage() {
  const user = await requireAuth();
  const canWrite = hasPermission(user.role, "inquiries:write");
  const canConvert = hasPermission(user.role, "projects:write");

  const list = await db.select().from(inquiries).orderBy(desc(inquiries.createdAt));

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold tracking-widest text-brand-blue uppercase">
          Prospek & Konsultasi Masuk
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          Inbox Inquiry Landing Page
        </h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Semua pesan dari formulir konsultasi di beranda langsung masuk ke sini dan bisa
          dikonversi 1-klik menjadi Project Client.
        </p>
      </div>

      <div className="space-y-4">
        {list.map((inq) => (
          <div key={inq.id} className="surface-card rounded-3xl p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      INQUIRY_STATUS_META[inq.status].badgeClass
                    }`}
                  >
                    {INQUIRY_STATUS_META[inq.status].label}
                  </span>
                  <span className="rounded-lg bg-subtle px-2.5 py-0.5 text-xs font-semibold text-brand-blue">
                    {inq.serviceInterest}
                  </span>
                  {inq.budgetRange && (
                    <span className="rounded-lg bg-elevated px-2.5 py-0.5 font-mono text-xs text-ink-secondary">
                      {inq.budgetRange}
                    </span>
                  )}
                </div>

                <h2 className="mt-2.5 text-lg font-extrabold text-ink">{inq.name}</h2>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-secondary">
                  <span className="inline-flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-brand-blue" />
                    {inq.email}
                  </span>
                  {inq.phone && (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-brand-orange" />
                      {inq.phone}
                    </span>
                  )}
                  {inq.company && (
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5 text-ink-muted" />
                      {inq.company}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {canWrite && (
                  <form action={updateInquiryStatusAction} className="flex items-center gap-1.5">
                    <input type="hidden" name="id" value={inq.id} />
                    <select
                      name="status"
                      defaultValue={inq.status}
                      className="input-field py-1.5 text-xs"
                    >
                      <option value="NEW">Baru</option>
                      <option value="CONTACTED">Sudah Dihubungi</option>
                      <option value="PROPOSAL">Proposal Dikirim</option>
                      <option value="CONVERTED">Jadi Project</option>
                      <option value="ARCHIVED">Diarsipkan</option>
                    </select>
                    <button type="submit" className="btn-secondary px-3 py-1.5 text-xs">
                      Simpan
                    </button>
                  </form>
                )}

                {canConvert && inq.status !== "CONVERTED" && (
                  <form action={convertInquiryToProjectAction}>
                    <input type="hidden" name="inquiryId" value={inq.id} />
                    <button type="submit" className="btn-primary px-3.5 py-2 text-xs">
                      <FolderPlus className="h-3.5 w-3.5" />
                      Konversi jadi Project
                    </button>
                  </form>
                )}
              </div>
            </div>

            <p className="mt-4 rounded-2xl bg-elevated p-4 text-sm leading-relaxed text-ink">
              {inq.message}
            </p>
          </div>
        ))}

        {list.length === 0 && (
          <div className="surface-card rounded-3xl p-10 text-center text-sm text-ink-muted">
            Belum ada pesan konsultasi masuk.
          </div>
        )}
      </div>
    </div>
  );
}
