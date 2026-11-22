"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Lock, Mail, Loader2, LogIn } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { MascotPose } from "@/components/ui/MascotPose";

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/admin";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login gagal.");
      } else {
        router.push(nextPath.startsWith("/admin") ? nextPath : "/admin");
        router.refresh();
      }
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="hero-backdrop flex min-h-screen flex-col">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-ink-secondary hover:text-brand-blue"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Beranda
        </Link>
        <ThemeToggle />
      </div>

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="surface-card grid w-full max-w-4xl overflow-hidden rounded-3xl md:grid-cols-12">
          {/* Brand Left Panel */}
          <div className="flex flex-col items-center justify-center bg-subtle/70 p-8 text-center md:col-span-5">
            <BrandLogo className="h-11 w-auto" priority />
            <div className="mt-6">
              <MascotPose pose="hello" size={145} bubble="Selamat datang kembali!" />
            </div>
            <p className="mt-4 text-xs leading-relaxed text-ink-secondary">
              Portal Internal KodeLokal untuk pengelolaan CMS Landing Page, Portofolio, Struktur
              Tim, dan Manajemen Project Client.
            </p>
          </div>

          {/* Login Form Right Panel */}
          <div className="p-8 sm:p-10 md:col-span-7">
            <p className="text-xs font-bold tracking-widest text-brand-orange uppercase">
              Portal Tim & CMS
            </p>
            <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-ink">
              Masuk ke Dashboard KodeLokal
            </h1>
            <p className="mt-2 text-sm text-ink-secondary">
              Gunakan akun internal (CEO, CTO, Admin, PM, atau Marketing) yang terdaftar.
            </p>

            <form id="login-form" onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="login-email" className="mb-1.5 block text-xs font-bold text-ink">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                  <input
                    id="login-email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="ceo@kodelokal.store"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="login-password" className="mb-1.5 block text-xs font-bold text-ink">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                  <input
                    id="login-password"
                    type="password"
                    required
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
                  {error}
                </div>
              )}

              <button
                id="login-submit-btn"
                type="submit"
                disabled={loading}
                className="btn-primary w-full text-sm disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Memverifikasi...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Masuk ke Portal
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-canvas" />}>
      <LoginFormInner />
    </React.Suspense>
  );
}
