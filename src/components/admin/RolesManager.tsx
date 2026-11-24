"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Check, Minus, Loader2 } from "lucide-react";
import type { SafeUser } from "@/lib/auth";
import { ALL_ROLES, ROLE_META, hasPermission } from "@/lib/rbac";
import {
  createUserAction,
  updateUserAction,
  toggleUserActiveAction,
} from "@/actions/users";
import { AdminModal, AdminToast, useAdminToast } from "@/components/admin/AdminModal";

export function RolesManager({
  actorId,
  allUsers,
  canManage,
}: {
  actorId: string;
  allUsers: SafeUser[];
  canManage: boolean;
}) {
  const router = useRouter();
  const { toast, showToast, clearToast } = useAdminToast();

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<SafeUser | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [togglingId, setTogglingId] = React.useState<string | null>(null);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData(e.currentTarget);
      const res = await createUserAction(fd);
      if (res.ok) {
        setCreateOpen(false);
        showToast("success", res.message);
        router.refresh();
      } else {
        showToast("error", res.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData(e.currentTarget);
      const res = await updateUserAction(fd);
      if (res.ok) {
        setEditing(null);
        showToast("success", res.message);
        router.refresh();
      } else {
        showToast("error", res.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleActive(u: SafeUser) {
    setTogglingId(u.id);
    try {
      const res = await toggleUserActiveAction(u.id, u.isActive);
      showToast(res.ok ? "success" : "error", res.message);
      if (res.ok) router.refresh();
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold tracking-widest text-brand-blue uppercase">
            Fondasi Multi-Role &amp; RBAC
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Manajemen Akun &amp; Matriks Role
          </h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Dukungan penuh untuk struktur role KodeLokal: CEO, CTO, Admin, PM, Marketing, Worker,
            dan Client.
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="btn-primary shrink-0 text-sm"
          >
            <Plus className="h-4 w-4" />
            Tambah Akun Tim
          </button>
        )}
      </div>

      {/* Role Permission Matrix */}
      <div className="surface-card overflow-hidden rounded-3xl p-6">
        <h2 className="text-base font-bold text-ink">Matriks Hak Akses Role</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead>
              <tr className="border-b border-line text-ink-muted">
                <th className="py-2.5 pr-4 font-bold">Role</th>
                <th className="px-3 py-2.5 text-center font-bold">CMS &amp; Konten</th>
                <th className="px-3 py-2.5 text-center font-bold">Portofolio</th>
                <th className="px-3 py-2.5 text-center font-bold">Struktur Tim</th>
                <th className="px-3 py-2.5 text-center font-bold">Project Client</th>
                <th className="px-3 py-2.5 text-center font-bold">Worker Hub</th>
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
                  hasPermission(role, "workers:self"),
                  hasPermission(role, "inquiries:write"),
                  hasPermission(role, "users:manage"),
                ];
                return (
                  <tr key={role}>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-md px-2 py-0.5 font-mono text-[11px] font-bold ${meta.badgeClass}`}
                        >
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

      {/* Registered Users */}
      <div className="surface-card rounded-3xl p-6">
        <h2 className="text-base font-bold text-ink">Daftar Akun Terdaftar ({allUsers.length})</h2>
        <div className="mt-4 space-y-3">
          {allUsers.map((u) => {
            const isToggling = togglingId === u.id;
            return (
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
                    <button
                      type="button"
                      onClick={() => setEditing(u)}
                      className="btn-blue px-3 py-1.5 text-xs"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit Role &amp; Akun
                    </button>

                    {u.id !== actorId && (
                      <button
                        type="button"
                        disabled={isToggling}
                        onClick={() => handleToggleActive(u)}
                        className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-60"
                      >
                        {isToggling ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Memproses...
                          </>
                        ) : u.isActive ? (
                          "Nonaktifkan"
                        ) : (
                          "Aktifkan"
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CREATE USER MODAL */}
      <AdminModal
        open={createOpen}
        onClose={() => !submitting && setCreateOpen(false)}
        title="Tambah Akun Tim / Worker"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Nama Lengkap *</label>
            <input name="name" required placeholder="Nama anggota tim" className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Email *</label>
            <input
              name="email"
              type="email"
              required
              placeholder="nama@kodelokal.store"
              className="input-field"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">
              Password (min. 8 karakter) *
            </label>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="Minimal 8 karakter"
              className="input-field"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Role</label>
              <select name="role" defaultValue="PM" className="input-field">
                {ALL_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r} — {ROLE_META[r].label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Jabatan</label>
              <input name="title" placeholder="Project Manager" className="input-field" />
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <button
              type="button"
              disabled={submitting}
              onClick={() => setCreateOpen(false)}
              className="btn-secondary px-4 py-2 text-xs"
            >
              Batal
            </button>
            <button type="submit" disabled={submitting} className="btn-primary px-5 py-2 text-xs">
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Membuat...
                </>
              ) : (
                "Buat Akun"
              )}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* EDIT USER MODAL */}
      <AdminModal
        open={Boolean(editing)}
        onClose={() => !submitting && setEditing(null)}
        title="Edit Akun & Role"
        subtitle={editing?.email}
        maxWidth="max-w-lg"
      >
        {editing && (
          <form key={editing.id} onSubmit={handleUpdate} className="space-y-4">
            <input type="hidden" name="id" value={editing.id} />
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Nama Lengkap *</label>
              <input name="name" required defaultValue={editing.name} className="input-field" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold text-ink">Role</label>
                <select name="role" defaultValue={editing.role} className="input-field">
                  {ALL_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r} — {ROLE_META[r].label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-ink">Jabatan</label>
                <input name="title" defaultValue={editing.title} className="input-field" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">
                Reset Password (opsional, kosongkan jika tidak diubah)
              </label>
              <input
                name="password"
                type="password"
                minLength={8}
                placeholder="Isi password baru minimal 8 karakter..."
                className="input-field"
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-line pt-4">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setEditing(null)}
                className="btn-secondary px-4 py-2 text-xs"
              >
                Batal
              </button>
              <button type="submit" disabled={submitting} className="btn-primary px-5 py-2 text-xs">
                {submitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Perubahan"
                )}
              </button>
            </div>
          </form>
        )}
      </AdminModal>

      <AdminToast toast={toast} onClose={clearToast} />
    </div>
  );
}
