import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full border border-hairline bg-canvas-subtle p-8 rounded-lg space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-mono tracking-wider uppercase">
          MagangHub Monev Bot
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-ink-primary">
          Otomatisasi Laporan & Presensi
        </h1>
        <p className="text-sm text-ink-secondary leading-relaxed">
          Platform manajemen pelaporan magang terintegrasi GitHub Commits dan Direct REST API MagangHub Kemnaker.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link href="/dashboard">
            <Button variant="emerald" size="lg" className="w-full sm:w-auto">
              Buka Dashboard
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Masuk / Daftar
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
