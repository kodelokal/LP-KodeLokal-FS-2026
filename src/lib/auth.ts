import crypto from "crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users, type User } from "@/db/schema";
import { hasPermission, type PermissionKey } from "@/lib/rbac";

export const SESSION_COOKIE_NAME = "kl_session";
const SESSION_DURATION_DAYS = 14;

export type SafeUser = Omit<User, "passwordHash">;

function hashToken(rawToken: string): string {
  const secret = process.env.AUTH_SECRET || "kodelokal-default-secret";
  return crypto.createHmac("sha256", secret).update(rawToken).digest("hex");
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string): Promise<void> {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);

  await db.insert(sessions).values({
    userId,
    tokenHash,
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, rawToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (rawToken) {
    const tokenHash = hashToken(rawToken);
    await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getCurrentUser(): Promise<SafeUser | null> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!rawToken) return null;

  const tokenHash = hashToken(rawToken);
  const rows = await db
    .select({
      user: users,
      sessionExpiresAt: sessions.expiresAt,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, new Date())))
    .limit(1);

  if (rows.length === 0) return null;

  const { user } = rows[0];
  if (!user.isActive) return null;

  const { passwordHash: _ignored, ...safeUser } = user;
  void _ignored;
  return safeUser;
}

export async function requireAuth(): Promise<SafeUser> {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, "admin:access")) {
    redirect("/login");
  }
  return user;
}

export async function requirePermission(permission: PermissionKey): Promise<SafeUser> {
  const user = await requireAuth();
  if (!hasPermission(user.role, permission)) {
    throw new Error("Anda tidak memiliki hak akses untuk tindakan ini.");
  }
  return user;
}
