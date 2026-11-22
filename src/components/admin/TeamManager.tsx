"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Loader2, ExternalLink } from "lucide-react";
import type { TeamMember } from "@/db/schema";
import {
  createTeamMemberAction,
  updateTeamMemberAction,
  deleteTeamMemberAction,
} from "@/actions/team";
import {
  AdminModal,
  ConfirmDeleteModal,
  AdminToast,
  useAdminToast,
} from "@/components/admin/AdminModal";
import { CloudinarySingleUpload } from "@/components/admin/CloudinaryImageUpload";

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

export function TeamManager({
  members,
  canWrite,
}: {
  members: TeamMember[];
  canWrite: boolean;
}) {
  const router = useRouter();
  const { toast, showToast, clearToast } = useAdminToast();

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<TeamMember | null>(null);
  const [deleting, setDeleting] = React.useState<TeamMember | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const memberNameById = React.useMemo(
    () => new Map(members.map((m) => [m.id, `${m.name} (${m.positionTitle})`])),
    [members]
  );

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData(e.currentTarget);
      const res = await createTeamMemberAction(fd);
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
      const res = await updateTeamMemberAction(fd);
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

  async function handleConfirmDelete() {
    if (!deleting) return;
    setSubmitting(true);
    try {
      const res = await deleteTeamMemberAction(deleting.id);
      if (res.ok) {
        setDeleting(null);
        showToast("success", res.message);
        router.refresh();
      } else {
        showToast("error", res.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold tracking-widest text-brand-blue uppercase">
            Struktur Tim Pengembang · Cloudinary Storage
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Kelola Anggota &amp; Bagan Struktur Tim
          </h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Atur Foto, Nama, Jabatan, Atasan (Bagan Struktur), dan link opsional GitHub, LinkedIn,
            Instagram lewat pop-up card.
          </p>
        </div>

        {canWrite && (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="btn-primary shrink-0 text-sm"
          >
            <Plus className="h-4 w-4" />
            Tambah Anggota Tim
          </button>
        )}
      </div>

      {/* Clean Team Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((m) => (
          <div key={m.id} className="surface-card flex flex-col justify-between rounded-3xl p-5">
            <div>
              <div className="flex items-center gap-3.5">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-line bg-subtle">
                  {m.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.avatarUrl} alt={m.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-brand-blue/15 text-sm font-extrabold text-brand-blue">
                      {getInitials(m.name)}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-base font-bold text-ink">{m.name}</h2>
                  <p className="truncate text-xs font-semibold text-brand-orange">
                    {m.positionTitle}
                  </p>
                  {m.parentId && memberNameById.has(m.parentId) && (
                    <p className="mt-0.5 truncate text-[11px] text-ink-muted">
                      Atasan: {memberNameById.get(m.parentId)}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5 text-[11px]">
                {m.githubUrl && (
                  <a
                    href={m.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full bg-subtle px-2.5 py-0.5 font-semibold text-ink-secondary hover:text-brand-blue"
                  >
                    GitHub <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                )}
                {m.linkedinUrl && (
                  <a
                    href={m.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full bg-subtle px-2.5 py-0.5 font-semibold text-ink-secondary hover:text-brand-blue"
                  >
                    LinkedIn <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                )}
                {m.instagramUrl && (
                  <a
                    href={m.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full bg-subtle px-2.5 py-0.5 font-semibold text-ink-secondary hover:text-brand-orange"
                  >
                    Instagram <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                )}
                {!m.githubUrl && !m.linkedinUrl && !m.instagramUrl && (
                  <span className="text-[11px] text-ink-muted">Tanpa tautan sosial media</span>
                )}
              </div>
            </div>

            {canWrite && (
              <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
                <button
                  type="button"
                  onClick={() => setEditing(m)}
                  className="btn-blue px-3.5 py-1.5 text-xs"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setDeleting(m)}
                  aria-label={`Hapus ${m.name}`}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* CREATE MODAL */}
      <AdminModal
        open={createOpen}
        onClose={() => !submitting && setCreateOpen(false)}
        title="Tambah Anggota Tim"
        subtitle="Upload foto ke Cloudinary dan lengkapi nama, jabatan, serta sosmed opsional."
      >
        <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Nama *</label>
            <input name="name" required placeholder="Contoh: Ahmad Fauzi" className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Jabatan *</label>
            <input
              name="positionTitle"
              required
              placeholder="Contoh: Full-Stack Developer"
              className="input-field"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-bold text-ink">
              Foto Profil (Cloudinary — opsional)
            </label>
            <CloudinarySingleUpload
              name="avatarUrl"
              folder="team"
              label="Upload Foto Anggota"
              shape="circle"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">GitHub (opsional)</label>
            <input name="githubUrl" placeholder="https://github.com/..." className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">LinkedIn (opsional)</label>
            <input
              name="linkedinUrl"
              placeholder="https://linkedin.com/in/..."
              className="input-field"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink">Instagram (opsional)</label>
            <input
              name="instagramUrl"
              placeholder="https://instagram.com/..."
              className="input-field"
            />
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
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-bold text-ink">
              Atasan (Bagan Struktur)
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
          <div className="flex justify-end gap-2 border-t border-line pt-4 sm:col-span-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => setCreateOpen(false)}
              className="btn-secondary px-4 py-2 text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary px-5 py-2 text-xs disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Anggota"
              )}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* EDIT MODAL */}
      <AdminModal
        open={Boolean(editing)}
        onClose={() => !submitting && setEditing(null)}
        title="Edit Anggota Tim"
        subtitle={editing ? `Memperbarui profil ${editing.name}` : undefined}
      >
        {editing && (
          <form key={editing.id} onSubmit={handleUpdate} className="grid gap-4 sm:grid-cols-2">
            <input type="hidden" name="id" value={editing.id} />
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Nama *</label>
              <input name="name" required defaultValue={editing.name} className="input-field" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Jabatan *</label>
              <input
                name="positionTitle"
                required
                defaultValue={editing.positionTitle}
                className="input-field"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-bold text-ink">
                Foto Profil (Cloudinary)
              </label>
              <CloudinarySingleUpload
                name="avatarUrl"
                folder="team"
                defaultValue={editing.avatarUrl ?? ""}
                label="Upload Foto"
                shape="circle"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">GitHub (opsional)</label>
              <input
                name="githubUrl"
                defaultValue={editing.githubUrl ?? ""}
                placeholder="https://github.com/..."
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">LinkedIn (opsional)</label>
              <input
                name="linkedinUrl"
                defaultValue={editing.linkedinUrl ?? ""}
                placeholder="https://linkedin.com/in/..."
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Instagram (opsional)</label>
              <input
                name="instagramUrl"
                defaultValue={editing.instagramUrl ?? ""}
                placeholder="https://instagram.com/..."
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Urutan Tampil</label>
              <input
                name="sortOrder"
                type="number"
                defaultValue={editing.sortOrder}
                className="input-field font-mono"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold text-ink">
                Atasan (Bagan Struktur)
              </label>
              <select name="parentId" defaultValue={editing.parentId ?? ""} className="input-field">
                <option value="">— Puncak Struktur (Root) —</option>
                {members
                  .filter((opt) => opt.id !== editing.id)
                  .map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name} — {opt.positionTitle}
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 border-t border-line pt-4 sm:col-span-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setEditing(null)}
                className="btn-secondary px-4 py-2 text-xs"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary px-5 py-2 text-xs disabled:opacity-60"
              >
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

      {/* DELETE MODAL */}
      <ConfirmDeleteModal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleConfirmDelete}
        loading={submitting}
        title="Hapus Anggota Tim?"
        description={`Yakin ingin menghapus "${deleting?.name ?? ""}" dari Struktur Tim Pengembang?`}
      />

      <AdminToast toast={toast} onClose={clearToast} />
    </div>
  );
}
