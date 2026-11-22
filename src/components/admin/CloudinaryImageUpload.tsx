"use client";

import * as React from "react";
import { Upload, X, Loader2, ImagePlus, CheckCircle2 } from "lucide-react";

type UploadFolder = "portfolio" | "team" | "general";

export function CloudinarySingleUpload({
  name,
  folder = "general",
  defaultValue = "",
  label = "Upload Gambar",
  shape = "rect",
}: {
  name: string;
  folder?: UploadFolder;
  defaultValue?: string;
  label?: string;
  shape?: "rect" | "circle";
}) {
  const [url, setUrl] = React.useState(defaultValue);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal upload gambar.");
      } else {
        setUrl(data.url);
      }
    } catch {
      setError("Gagal terhubung ke server upload.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={url} />
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex flex-wrap items-center gap-3">
        {url && (
          <div
            className={`relative shrink-0 overflow-hidden border border-line bg-elevated ${
              shape === "circle" ? "h-14 w-14 rounded-full" : "h-16 w-24 rounded-xl"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="Preview upload" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => setUrl("")}
              aria-label="Hapus gambar"
              className="absolute top-0.5 right-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/80 text-white hover:bg-rose-600"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-60"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-blue" />
                  Mengunggah ke Cloudinary...
                </>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5 text-brand-blue" />
                  {url ? "Ganti Foto" : label}
                </>
              )}
            </button>
            {url && url.includes("res.cloudinary.com") && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Cloudinary
              </span>
            )}
          </div>

          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Atau tempel URL gambar..."
            className="input-field py-1 text-[11px] font-mono"
          />
        </div>
      </div>

      {error && <p className="text-[11px] font-semibold text-rose-500">{error}</p>}
    </div>
  );
}

export function CloudinaryMultiUpload({
  name,
  folder = "portfolio",
  defaultValues = [],
}: {
  name: string;
  folder?: UploadFolder;
  defaultValues?: string[];
}) {
  const [urls, setUrls] = React.useState<string[]>(defaultValues);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", folder);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: fd,
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || `Gagal mengunggah ${file.name}`);
        }
        uploadedUrls.push(data.url);
      }
      setUrls((prev) => [...prev, ...uploadedUrls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal upload galeri.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={urls.join("\n")} />
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        onChange={handleFilesChange}
        className="hidden"
      />

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="btn-secondary px-3.5 py-2 text-xs disabled:opacity-60"
        >
          {uploading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-orange" />
              Mengunggah ke Cloudinary...
            </>
          ) : (
            <>
              <ImagePlus className="h-3.5 w-3.5 text-brand-orange" />
              Upload Gambar Galeri (Bisa Pilih Banyak)
            </>
          )}
        </button>
        <span className="text-[11px] text-ink-muted">
          {urls.length} gambar di galeri detail portofolio
        </span>
      </div>

      {urls.length > 0 && (
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-5">
          {urls.map((imgUrl, idx) => (
            <div
              key={`${imgUrl}-${idx}`}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-line bg-elevated"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgUrl}
                alt={`Galeri ${idx + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => setUrls((prev) => prev.filter((_, i) => i !== idx))}
                aria-label={`Hapus gambar galeri ${idx + 1}`}
                className="absolute top-1 right-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/80 text-white hover:bg-rose-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-[11px] font-semibold text-rose-500">{error}</p>}
    </div>
  );
}
