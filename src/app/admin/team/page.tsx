import { asc } from "drizzle-orm";
import { Plus, Trash2, UserCheck, UserPlus } from "lucide-react";
import { db } from "@/db";
import { teamMembers } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { ALL_ROLES, ROLE_META, hasPermission } from "@/lib/rbac";
import {
  createTeamMemberAction,
  toggleTeamOpenPositionAction,
  deleteTeamMemberAction,
} from "@/actions/team";

export default async function AdminTeamPage() {
  const user = await requireAuth();
  const canWrite = hasPermission(user.role, "team:write");

  const members = await db
    .select()
    .from(teamMembers)
    .orderBy(asc(teamMembers.sortOrder), asc(teamMembers.createdAt));

  const nameById = new Map(members.map((m) => [m.id, `${m.name} (${m.roleCode})`]));

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold tracking-widest text-brand-blue uppercase">
          Struktur Tim Pengembang
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          Kelola Bagan Organisasi & Role Mendatang
        </h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Atur posisi CEO, CTO, PM, Marketing, Admin, dan Worker beserta relasi atasan untuk
          menampilkan Bagan Struktur otomatis di halaman utama.
        </p>
      </div>

      {canWrite && (
        <details className="surface-card group rounded-3xl p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between text-base font-bold text-ink">
            <span className="inline-flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-brand-orange text-white">
                <Plus className="h-4 w-4" />
              </span>
              Tambah Anggota / Slot Posisi Baru
            </span>
            <span className="text-xs font-semibold text-brand-blue group-open:hidden">
              Buka Formulir +
            </span>
            <span className="hidden text-xs font-semibold text-ink-muted group-open:inline">
              Tutup −
            </span>
          </summary>

          <form
            action={createTeamMemberAction}
            className="mt-6 grid gap-4 border-t border-line pt-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Nama / Label Slot *</label>
              <input
                name="name"
                required
                placeholder="Mis. Rina Kartika atau Backend Worker"
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Jabatan *</label>
              <input
                name="positionTitle"
                required
                placeholder="Mis. Senior Frontend Engineer"
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Kode Role</label>
              <select name="roleCode" defaultValue="WORKER" className="input-field">
                {ALL_ROLES.filter((r) => r !== "CLIENT").map((role) => (
                  <option key={role} value={role}>
                    {role} — {ROLE_META[role].label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Departemen</label>
              <select name="department" className="input-field">
                <option value="Executive">Executive</option>
                <option value="Engineering">Engineering</option>
                <option value="Product & PM">Product & PM</option>
                <option value="Growth & Marketing">Growth & Marketing</option>
                <option value="Operations">Operations</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">
                Melapor Kepada (Atasan di Org Chart)
              </label>
              <select name="parentId" defaultValue="" className="input-field">
                <option value="">— Puncak Struktur (Root) —</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.roleCode})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Urutan Tampil</label>
              <input name="sortOrder" type="number" defaultValue={members.length + 1} className="input-field font-mono" />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="mb-1 block text-xs font-bold text-ink">
                Keahlian (pisahkan koma)
              </label>
              <input
                name="skills"
                placeholder="Next.js, PostgreSQL, UI/UX, Agile"
                className="input-field font-mono text-sm"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="mb-1 block text-xs font-bold text-ink">Ringkasan Peran / Bio</label>
              <textarea name="bio" rows={2} className="input-field" />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 sm:col-span-2 lg:col-span-3">
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-ink">
                <input type="checkbox" name="isOpenPosition" className="h-4 w-4 accent-brand-orange" />
                Tandai sebagai &ldquo;Slot Mendatang / Open Position&rdquo;
              </label>
              <button type="submit" className="btn-primary text-sm">
                <Plus className="h-4 w-4" />
                Simpan ke Struktur Tim
              </button>
            </div>
          </form>
        </details>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {members.map((m) => (
          <div key={m.id} className="surface-card flex flex-col justify-between rounded-3xl p-5">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className={`rounded-md px-2 py-0.5 font-mono text-[11px] font-bold ${
                        ROLE_META[m.roleCode].badgeClass
                      }`}
                    >
                      {m.roleCode}
                    </span>
                    <span className="rounded-md bg-subtle px-2 py-0.5 text-[11px] text-ink-secondary">
                      {m.department}
                    </span>
                    {m.isOpenPosition ? (
                      <span className="inline-flex items-center gap-1 rounded-md border border-dashed border-brand-orange/60 px-2 py-0.5 text-[10px] font-semibold text-brand-orange">
                        <UserPlus className="h-3 w-3" />
                        Slot Mendatang
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
                        <UserCheck className="h-3 w-3" />
                        Aktif
                      </span>
                    )}
                  </div>
                  <h2 className="mt-2 text-base font-bold text-ink">{m.name}</h2>
                  <p className="text-xs text-ink-secondary">{m.positionTitle}</p>
                  {m.parentId && nameById.has(m.parentId) && (
                    <p className="mt-1 text-[11px] text-ink-muted">
                      Atasan: <span className="font-semibold text-ink">{nameById.get(m.parentId)}</span>
                    </p>
                  )}
                </div>
              </div>
              {m.bio && <p className="mt-3 text-xs leading-relaxed text-ink-secondary">{m.bio}</p>}
            </div>

            {canWrite && (
              <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                <form action={toggleTeamOpenPositionAction}>
                  <input type="hidden" name="id" value={m.id} />
                  <input type="hidden" name="current" value={String(m.isOpenPosition)} />
                  <button type="submit" className="btn-secondary px-3 py-1.5 text-xs">
                    {m.isOpenPosition ? "Tandai Terisi (Aktif)" : "Ubah jadi Slot Mendatang"}
                  </button>
                </form>
                <form action={deleteTeamMemberAction}>
                  <input type="hidden" name="id" value={m.id} />
                  <button
                    type="submit"
                    aria-label={`Hapus ${m.name}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
