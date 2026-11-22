import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, verifyPassword } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";

const loginSchema = z.object({
  email: z.string().trim().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data login tidak valid." },
        { status: 400 }
      );
    }

    const emailNormalized = parsed.data.email.toLowerCase();
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, emailNormalized))
      .limit(1);

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: "Email atau password tidak sesuai." },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Email atau password tidak sesuai." },
        { status: 401 }
      );
    }

    if (!hasPermission(user.role, "admin:access")) {
      return NextResponse.json(
        { error: "Akun Anda tidak memiliki akses ke Portal Tim." },
        { status: 403 }
      );
    }

    await createSession(user.id);

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Gagal memproses login." }, { status: 500 });
  }
}
