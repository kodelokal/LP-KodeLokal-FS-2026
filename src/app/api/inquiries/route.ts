import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { inquiries } from "@/db/schema";

const inquirySchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(120),
  email: z.string().trim().email("Format email tidak valid"),
  phone: z.string().trim().max(40).optional().default(""),
  company: z.string().trim().max(120).optional().default(""),
  serviceInterest: z.string().trim().min(2).max(120),
  budgetRange: z.string().trim().max(80).optional().default(""),
  message: z.string().trim().min(10, "Mohon ceritakan kebutuhan minimal 10 karakter").max(2500),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = inquirySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Input tidak valid" },
        { status: 400 }
      );
    }

    const [created] = await db
      .insert(inquiries)
      .values({
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        company: parsed.data.company || null,
        serviceInterest: parsed.data.serviceInterest,
        budgetRange: parsed.data.budgetRange || null,
        message: parsed.data.message,
        status: "NEW",
      })
      .returning({ id: inquiries.id });

    return NextResponse.json({ ok: true, id: created.id }, { status: 201 });
  } catch (err) {
    console.error("Failed to create inquiry:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menyimpan pesan Anda." },
      { status: 500 }
    );
  }
}
