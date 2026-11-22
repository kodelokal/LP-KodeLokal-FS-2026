import { NextResponse } from "next/server";
import { getPublicProjectByCode } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code") ?? "";

  if (!code.trim()) {
    return NextResponse.json({ error: "Kode tracking wajib diisi." }, { status: 400 });
  }

  const project = await getPublicProjectByCode(code);
  if (!project) {
    return NextResponse.json(
      { error: `Project dengan kode "${code.trim().toUpperCase()}" tidak ditemukan.` },
      { status: 404 }
    );
  }

  return NextResponse.json({ project });
}
