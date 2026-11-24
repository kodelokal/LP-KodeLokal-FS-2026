import { NextResponse } from "next/server";
import { z } from "zod";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { users, workerApplications } from "@/db/schema";
import { hashPassword } from "@/lib/auth";

const applySchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(120),
  email: z.string().trim().email("Format email tidak valid"),
  phone: z.string().trim().min(8, "Nomor WhatsApp minimal 8 digit").max(40),
  password: z.string().min(8, "Password akun minimal 8 karakter").max(100),
  specialty: z.string().trim().min(2).max(100),
  experienceLevel: z.string().trim().min(2).max(80),
  skills: z.string().trim().min(2, "Isi minimal 1 keahlian / tech stack").max(500),
  portfolioUrl: z.string().trim().max(300).optional().default(""),
  githubUrl: z.string().trim().max(300).optional().default(""),
  linkedinUrl: z.string().trim().max(300).optional().default(""),
  expectedHourlyRate: z.coerce.number().min(0).max(5000000).optional().default(0),
  bio: z
    .string()
    .trim()
    .min(20, "Ceritakan pengalaman / proyekmu minimal 20 karakter")
    .max(2000),
});

function generateApplicationCode(): string {
  const year = new Date().getFullYear();
  const num = Math.floor(1000 + Math.random() * 9000);
  return `WRK-${year}-${num}`;
}

function normalizeUrl(val: string): string | null {
  const cleaned = val.trim();
  if (!cleaned) return null;
  if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) return cleaned;
  return `https://${cleaned}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = applySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data pendaftaran belum lengkap." },
        { status: 400 }
      );
    }

    const emailNormalized = parsed.data.email.toLowerCase();

    // Prevent duplicate registration if already an active internal user
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, emailNormalized))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "Email ini sudah terdaftar di KodeLokal. Silakan langsung masuk di halaman /login." },
        { status: 409 }
      );
    }

    // Prevent duplicate active pending/interview applications for same email
    const existingApp = await db
      .select({ applicationCode: workerApplications.applicationCode })
      .from(workerApplications)
      .where(
        and(
          eq(workerApplications.email, emailNormalized),
          inArray(workerApplications.status, ["PENDING", "INTERVIEW"])
        )
      )
      .limit(1);

    if (existingApp.length > 0) {
      return NextResponse.json(
        {
          error: `Email ini sudah memiliki pendaftaran aktif (${existingApp[0].applicationCode}). Cek statusmu di bagian bawah halaman ya!`,
        },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const skills = parsed.data.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const applicationCode = generateApplicationCode();

    const [created] = await db
      .insert(workerApplications)
      .values({
        applicationCode,
        name: parsed.data.name,
        email: emailNormalized,
        phone: parsed.data.phone,
        passwordHash,
        specialty: parsed.data.specialty,
        experienceLevel: parsed.data.experienceLevel,
        skills,
        portfolioUrl: normalizeUrl(parsed.data.portfolioUrl),
        githubUrl: normalizeUrl(parsed.data.githubUrl),
        linkedinUrl: normalizeUrl(parsed.data.linkedinUrl),
        expectedHourlyRate: Math.round(parsed.data.expectedHourlyRate || 0),
        bio: parsed.data.bio,
        status: "PENDING",
      })
      .returning({
        applicationCode: workerApplications.applicationCode,
        name: workerApplications.name,
        specialty: workerApplications.specialty,
        status: workerApplications.status,
      });

    return NextResponse.json({ ok: true, application: created }, { status: 201 });
  } catch (err) {
    console.error("Worker apply error:", err);
    return NextResponse.json(
      { error: "Terjadi gangguan saat mengirim pendaftaran. Coba lagi ya." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") || "").trim();

  if (!query) {
    return NextResponse.json(
      { error: "Masukkan kode pendaftaran (mis. WRK-2026-1234) atau email." },
      { status: 400 }
    );
  }

  const isEmail = query.includes("@");
  const rows = await db
    .select({
      applicationCode: workerApplications.applicationCode,
      name: workerApplications.name,
      specialty: workerApplications.specialty,
      experienceLevel: workerApplications.experienceLevel,
      status: workerApplications.status,
      reviewNote: workerApplications.reviewNote,
      createdAt: workerApplications.createdAt,
      reviewedAt: workerApplications.reviewedAt,
    })
    .from(workerApplications)
    .where(
      isEmail
        ? eq(workerApplications.email, query.toLowerCase())
        : eq(workerApplications.applicationCode, query.toUpperCase())
    )
    .orderBy(desc(workerApplications.createdAt))
    .limit(1);

  if (rows.length === 0) {
    return NextResponse.json(
      { error: "Data pendaftaran tidak ditemukan. Pastikan kode atau email sudah benar." },
      { status: 404 }
    );
  }

  return NextResponse.json({ application: rows[0] });
}
