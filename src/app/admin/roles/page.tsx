import { asc } from "drizzle-orm";
import { Plus, Check, Minus } from "lucide-react";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { ALL_ROLES, ROLE_META, hasPermission } from "@/lib/rbac";
import {
  createUserAction,
  updateUserRoleAction,
  toggleUserActiveAction,
} from "@/actions/users";

export default async function AdminRolesPage() {
  const actor = await requireAuth();
  const canManage = hasPermission(actor.role, "users:manage");

  const allUsers = await db.select().from(users).orderBy(asc(users.createdAt));

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold tracking-widest text-brand-blue uppercase">
          Fondasi Multi-Role & RBAC
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          Manajemen Akun & Matriks Role
        </h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Dukungan penuh untuk struktur role KodeLokal: CEO, CTO, Admin, PM, Marketing, Worker,
          dan Client.
        </p>
      </div>

      {/* Role Permission Matrix */}
      <div className="surface-card overflow-hidden rounded-3xl p-6">
        <h2 className="text-base font-bold text-ink">Matriks Hak Akses Role</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead>
              <tr className="border-b border-line text-ink-muted">
                <th className="py-2.5 pr-4 font-bold">Role</th>
                <th className="px-3 py-2.5 text-center font-bold">CMS & Konten</th>
                <th className="px-3 py-2.5 text-center font-bold">Portofolio</th>
                <th className="px-3 py-2.5 text-center font-bold">Struktur Tim</th>
                <th className="px-3 py-2.5 text-center font-bold">Project Client</th>
                <th className="px-3 py-2.5 text-center font-bold">Inquiry</th>
                <th className="px-3 py-2.5 text-center font-bold">Kelola User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {ALL_ROLES.map((role) => {
                const meta = ROLE_META[role];
                const perms = [
                  hasPermission(role, "cms:write"),
                  hasPermission(role, "portfolio:write"),
                  hasPermission(role, "team:write"),
                  hasPermission(role, "projects:write"),
                  hasPermission(role, "inquiries:write"),
                  hasPermission(role, "users:manage"),
                ];
                return (
                  <tr key={role}>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-md px-2 py-0.5 font-mono text-[11px] font-bold ${meta.badgeClass}`}>
                          {role}
                        </span>
                        {meta.isSoon && (
                          <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-semibold text-brand-orange dark:bg-orange-500/20">
                            Soon
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[11px] text-ink-muted">{meta.shortDesc}</p>
                    </td>
                    {perms.map((allowed, idx) => (
                      <td key={idx} className="px-3 py-3 text-center">
                        {allowed ? (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                        ) : (
                          <Minus className="mx-auto h-4 w-4 text-line-strong" />
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Internal Account */}
      {canManage && (
        <form action={createUserAction} className="surface-card rounded-3xl p-6">
          <h2 className="text-base font-bold text-ink">Tambah Akun Tim / Worker</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <input name="name" required placeholder="Nama Lengkap *" className="input-field text-sm" />
            <input name="email" type="email" required placeholder="email@kodelokal.store *" className="input-field text-sm" />
            <input
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="Password (min. 8 karakter) *"
              className="input-field text-sm"
            />
            <select name="role" defaultValue="PM" className="input-field text-sm">
              {ALL_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r} — {ROLE_META[r].label}
                </option>
              ))}
            </select>
            <input name="title" placeholder="Jabatan (mis. Project Manager)" className="input-field text-sm" />
            <button type="submit" className="btn-primary text-sm">
              <Plus className="h-4 w-4" />
              Buat Akun
            </button>
          </div>
        </form>
      )}

      {/* Registered Users */}
      <div className="surface-card rounded-3xl p-6">
        <h2 className="text-base font-bold text-ink">Daftar Akun Terdaftar ({allUsers.length})</h2>
        <div className="mt-4 space-y-3">
          {allUsers.map((u) => (
            <div
              key={u.id}
              className="flex flex-col justify-between gap-3 rounded-2xl border border-line bg-elevated/60 p-4 sm:flex-row sm:items-center"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-bold text-ink">{u.name}</p>
                  <span
                    className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-bold ${
                      ROLE_META[u.role].badgeClass
                    }`}
                  >
                    {u.role}
                  </span>
                  {!u.isActive && (
                    <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">
                      Nonaktif
                    </span>
                  )}
                </div>
                <p className="text-xs text-ink-secondary">
                  {u.email} · {u.title}
                </p>
              </div>

              {canManage && (
                <div className="flex flex-wrap items-center gap-2">
                  <form action={updateUserRoleAction} className="flex items-center gap-1.5">
                    <input type="hidden" name="id" value={u.id} />
                    <select name="role" defaultValue={u.role} className="input-field py-1.5 text-xs">
                      {ALL_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="btn-secondary px-3 py-1.5 text-xs">
                      Ubah Role
                    </button>
                  </form>

                  {u.id !== actor.id && (
                    <form action={toggleUserActiveAction}>
                      <input type="hidden" name="id" value={u.id} />
                      <input type="hidden" name="current" value={String(u.isActive)} />
                      <button type="submit" className="btn-secondary px-3 py-1.5 text-xs">
                        {u.isActive ? "Nonaktifkan" : "Aktifkan"}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
