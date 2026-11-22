# KodeLokal — Mitra Digital Anda (`kodelokal.store`)

Platform Full-Stack Landing Page, Content Management System (CMS), Portofolio, Struktur Tim Pengembang, Manajemen Project Client (beserta Pelacakan Progress Publik), dan Fondasi Multi-Role RBAC (`CEO`, `CTO`, `PM`, `MARKETING`, `ADMIN`, `WORKER`, `CLIENT`).

## Tech Stack

- **Framework**: Next.js 16 (App Router, React 19, TypeScript)
- **Styling & Theme**: Tailwind CSS v4 + `next-themes` (Light Mode & Dark Mode)
- **Animasi**: Framer Motion
- **Database**: Neon PostgreSQL + Drizzle ORM (`@neondatabase/serverless`)
- **Autentikasi**: Email & Password (`bcryptjs`) + Server-side Session Table + HTTP-Only Cookie + RBAC

## Fitur Utama

1. **Landing Page Dinamis (`/`)**: Hero beranimasi dengan maskot KodeLokal, Layanan, Hasil Portofolio berfilter kategori & modal studi kasus, Alur Kerja, Bagan Struktur Tim Pengembang (Org Chart & Grid), Testimoni, FAQ, dan Formulir Konsultasi Project.
2. **Client Project Tracker Publik (`/track`)**: Klien dapat memantau progress dan milestone project secara real-time menggunakan kode tracking (mis. `KL-2026-001`).
3. **Portal Admin & CMS (`/admin`)**:
   - `/admin/projects` — CRUD Project Client, kode tracking otomatis, dan manajemen milestone.
   - `/admin/inquiries` — Inbox permintaan konsultasi dari Landing Page + konversi 1-klik jadi Project Client.
   - `/admin/cms` — Edit pengaturan situs, Hero, statistik, kontak, layanan, testimoni, dan FAQ.
   - `/admin/portfolio` — Kelola studi kasus portofolio.
   - `/admin/team` — Kelola Struktur Tim Pengembang hierarkis & slot posisi mendatang.
   - `/admin/roles` — Matriks RBAC & manajemen akun internal.
   - `/admin/workers` — Worker Hub (Coming Soon Roadmap Fase 2).

## Setup Lokal

1. Salin `.env.example` menjadi `.env.local` dan isi `DATABASE_URL`, `AUTH_SECRET`, serta `NEXT_PUBLIC_SITE_URL`.
2. Install dependensi dan sinkronkan skema Neon PostgreSQL:

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

## Deploy ke Vercel (`https://kodelokal.store`)

1. Hubungkan repositori `kodelokal/LP-KodeLokal-FS-2026` di Vercel.
2. Tambahkan Environment Variables di Vercel Project Settings:
   - `DATABASE_URL` (Neon PostgreSQL connection string)
   - `AUTH_SECRET` (string acak minimal 32 karakter)
   - `NEXT_PUBLIC_SITE_URL=https://kodelokal.store`
3. Tambahkan domain `kodelokal.store` di tab **Domains** Vercel.
