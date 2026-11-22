import { asc } from "drizzle-orm";
import { Plus, Trash2, Save } from "lucide-react";
import { db } from "@/db";
import { teamMembers } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import {
  createTeamMemberAction,
  updateTeamMemberAction,
  deleteTeamMemberAction,
} from "@/actions/team";

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

export default async function AdminTeamPage() {
  const user = await requireAuth();
  const canWrite = hasPermission(user.role, "team:write");

  const members = await db
    .select()
    .from(teamMembers)
    .orderBy(asc(teamMembers.sortOrder), asc(teamMembers.createdAt));

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold tracking-widest text-brand-blue uppercase">
          Struktur Tim Pengembang
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          Kelola Anggota & Bagan Struktur Tim
        </h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Atur Foto, Nama, Jabatan, relasi atasan untuk Bagan Struktur, serta tautan GitHub,
          LinkedIn, dan Instagram (opsional) yang tampil di halaman depan.
        </p>
      </div>

      {/* Tambah Anggota Baru */}
      {canWrite && (
        <details className="surface-card group rounded-3xl p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between text-base font-bold text-ink">
            <span className="inline-flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-brand-orange text-white">
                <Plus className="h-4 w-4" />
              </span>
              Tambah Anggota Tim Baru
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
              <label className="mb-1 block text-xs font-bold text-ink">Nama *</label>
              <input
                name="name"
                required
                placeholder="Contoh: Ahmad Fauzi"
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Jabatan *</label>
              <input
                name="positionTitle"
                required
                placeholder="Contoh: Chief Technology Officer"
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">
                URL Foto (opsional)
              </label>
              <input
                name="avatarUrl"
                placeholder="https://... atau /team/foto.jpg"
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">
                Link GitHub (opsional)
              </label>
              <input
                name="githubUrl"
                placeholder="https://github.com/username"
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">
                Link LinkedIn (opsional)
              </label>
              <input
                name="linkedinUrl"
                placeholder="https://linkedin.com/in/username"
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">
                Link Instagram (opsional)
              </label>
              <input
                name="instagramUrl"
                placeholder="https://instagram.com/username"
                className="input-field"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold text-ink">
                Melapor Kepada (Atasan di Bagan Struktur)
              </label>
              <select name="parentId" defaultValue="" className="input-field">
                <option value="">— Puncak Struktur (Root) —</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} — {m.positionTitle}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Urutan Tampil</label>
              <input
                name="sortOrder"
                type="number"
                defaultValue={members.length + 1}
                className="input-field font-mono"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <button type="submit" className="btn-primary text-sm">
                <Plus className="h-4 w-4" />
                Simpan Anggota Tim
              </button>
            </div>
          </form>
        </details>
      )}

      {/* Daftar & Edit Langsung Anggota Tim */}
      <div className="grid gap-5 md:grid-cols-2">
        {members.map((m) => (
          <div key={m.id} className="surface-card rounded-3xl p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-line bg-subtle">
                  {m.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.avatarUrl}
                      alt={m.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-brand-blue/15 text-sm font-extrabold text-brand-blue">
                      {getInitials(m.name)}
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-base font-bold text-ink">{m.name}</h2>
                  <p className="text-xs font-medium text-brand-orange">{m.positionTitle}</p>
                </div>
              </div>

              {canWrite && (
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
              )}
            </div>

            {canWrite && (
              <form
                action={updateTeamMemberAction}
                className="mt-4 space-y-3 border-t border-line pt-4"
              >
                <input type="hidden" name="id" value={m.id} />
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-[11px] font-bold text-ink-secondary">
                      Nama
                    </label>
                    <input
                      name="name"
                      required
                      defaultValue={m.name}
                      className="input-field py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-bold text-ink-secondary">
                      Jabatan
                    </label>
                    <input
                      name="positionTitle"
                      required
                      defaultValue={m.positionTitle}
                      className="input-field py-1.5 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-bold text-ink-secondary">
                    URL Foto (opsional)
                  </label>
                  <input
                    name="avatarUrl"
                    defaultValue={m.avatarUrl ?? ""}
                    placeholder="https://... atau /team/foto.jpg"
                    className="input-field py-1.5 text-xs"
                  />
                </div>

                <div className="grid gap-2.5 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-[11px] font-bold text-ink-secondary">
                      GitHub (opsional)
                    </label>
                    <input
                      name="githubUrl"
                      defaultValue={m.githubUrl ?? ""}
                      placeholder="https://github.com/..."
                      className="input-field py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-bold text-ink-secondary">
                      LinkedIn (opsional)
                    </label>
                    <input
                      name="linkedinUrl"
                      defaultValue={m.linkedinUrl ?? ""}
                      placeholder="https://linkedin.com/in/..."
                      className="input-field py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-bold text-ink-secondary">
                      Instagram (opsional)
                    </label>
                    <input
                      name="instagramUrl"
                      defaultValue={m.instagramUrl ?? ""}
                      placeholder="https://instagram.com/..."
                      className="input-field py-1.5 text-xs"
                    />
                  </div>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-[11px] font-bold text-ink-secondary">
                      Atasan (Bagan Struktur)
                    </label>
                    <select
                      name="parentId"
                      defaultValue={m.parentId ?? ""}
                      className="input-field py-1.5 text-xs"
                    >
                      <option value="">— Puncak Struktur (Root) —</option>
                      {members
                        .filter((opt) => opt.id !== m.id)
                        .map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.name} — {opt.positionTitle}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-bold text-ink-secondary">
                      Urutan
                    </label>
                    <input
                      name="sortOrder"
                      type="number"
                      defaultValue={m.sortOrder}
                      className="input-field py-1.5 font-mono text-xs"
                    />
                  </div>
                </div>

                <button type="submit" className="btn-blue px-3.5 py-2 text-xs">
                  <Save className="h-3.5 w-3.5" />
                  Simpan Perubahan
                </button>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
