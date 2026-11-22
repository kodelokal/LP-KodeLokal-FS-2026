import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { uploadImageBufferToCloudinary, type UploadFolder } from "@/lib/cloudinary";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (
      !user ||
      (!hasPermission(user.role, "cms:write") &&
        !hasPermission(user.role, "portfolio:write") &&
        !hasPermission(user.role, "team:write"))
    ) {
      return NextResponse.json({ error: "Akses upload ditolak." }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const rawFolder = String(formData.get("folder") || "general");
    const folder: UploadFolder =
      rawFolder === "portfolio" || rawFolder === "team" ? rawFolder : "general";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File gambar tidak ditemukan." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Format gambar harus JPG, PNG, WebP, GIF, atau AVIF." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "Ukuran gambar maksimal 10MB." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploaded = await uploadImageBufferToCloudinary(buffer, folder);
    return NextResponse.json({ ok: true, ...uploaded }, { status: 201 });
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    return NextResponse.json(
      { error: "Gagal mengunggah gambar ke Cloudinary." },
      { status: 500 }
    );
  }
}
