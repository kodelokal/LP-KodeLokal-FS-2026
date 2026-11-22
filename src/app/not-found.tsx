import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <main className="hero-backdrop flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
      <div className="surface-card max-w-md rounded-3xl p-8 sm:p-10">
        <div className="mx-auto mb-6 flex h-36 w-36 items-center justify-center">
          <Image
            src="/mascot/confused.png"
            alt="Maskot KodeLokal bingung mencari halaman"
            width={140}
            height={156}
            className="h-auto w-32 drop-shadow-md"
          />
        </div>
        <p className="font-mono text-sm font-semibold tracking-wider text-brand-orange">
          ERROR 404
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Halaman Tidak Ditemukan
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
          Sepertinya tautan yang kamu buka sudah berpindah atau belum tersedia. Yuk kembali ke
          beranda KodeLokal atau lacak progress project kamu.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/" className="btn-primary text-sm">
            <ArrowLeft className="h-4 w-4" />
            Ke Beranda
          </Link>
          <Link href="/track" className="btn-secondary text-sm">
            <Search className="h-4 w-4" />
            Lacak Project
          </Link>
        </div>
      </div>
    </main>
  );
}
