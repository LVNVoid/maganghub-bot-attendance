import Link from "next/link";
import {
  Bot,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Cpu,
  GitBranch,
  Send,
  Clock,
  KeyRound,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "MagangHub Bot Attendance | Otomatisasi Laporan & Presensi Harian Kemnaker",
  description:
    "Web app manajemen bot absensi dan auto-submit laporan harian magang ke portal Monev MagangHub Kemnaker berbasis GitHub commits dan direct REST API.",
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink-primary selection:bg-primary/20 selection:text-primary">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 h-14 border-b border-hairline bg-canvas/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-sm bg-primary-soft border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
            <Bot className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-ink-primary">
              MagangHub Bot
            </span>
            <span className="text-[10px] font-mono text-ink-muted leading-none">
              Attendance &amp; Reports
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link href="/docs" className="hidden sm:inline-flex">
            <Button variant="ghost" size="sm" className="text-xs gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Dokumentasi</span>
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="sm" className="text-xs">
              Masuk
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="emerald" size="sm" className="text-xs gap-1.5">
              <span>Buka Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-hairline">
        {/* Subtle radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary-soft blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft border border-primary/25 text-primary text-xs font-mono tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Direct REST API • Zero Browser Overhead
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-ink-primary leading-tight sm:leading-tight">
            Otomatisasi Laporan &amp; Presensi{" "}
            <span className="text-primary">MagangHub Kemnaker</span>
          </h1>

          <p className="text-sm sm:text-base text-ink-secondary max-w-2xl mx-auto leading-relaxed">
            Kirim kehadiran harian dan susun laporan 3 bagian otomatis dari commit
            GitHub. Tanpa perlu browser Playwright/Chromium, aman terenkripsi AES-256-GCM.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button variant="emerald" size="lg" className="w-full sm:w-auto gap-2 px-6">
                <span>Mulai ke Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Link href="/docs" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto gap-2 px-6">
                <BookOpen className="w-4 h-4 text-primary" />
                <span>Pelajari Dokumentasi</span>
              </Button>
            </Link>
          </div>

          {/* Trust & Architecture Metrics */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left max-w-3xl mx-auto">
            <div className="bg-canvas-subtle/80 border border-hairline p-3 rounded-md">
              <div className="text-lg font-bold text-ink-primary font-mono">&lt; 1 Detik</div>
              <div className="text-[11px] text-ink-muted">Latensi submit API</div>
            </div>
            <div className="bg-canvas-subtle/80 border border-hairline p-3 rounded-md">
              <div className="text-lg font-bold text-primary font-mono">0 Token</div>
              <div className="text-[11px] text-ink-muted">Fallback lokal gratis</div>
            </div>
            <div className="bg-canvas-subtle/80 border border-hairline p-3 rounded-md">
              <div className="text-lg font-bold text-ink-primary font-mono">AES-256</div>
              <div className="text-[11px] text-ink-muted">Enkripsi GCM kredensial</div>
            </div>
            <div className="bg-canvas-subtle/80 border border-hairline p-3 rounded-md">
              <div className="text-lg font-bold text-ink-primary font-mono">Multi-User</div>
              <div className="text-[11px] text-ink-muted">Webhook cron terpisah</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section id="fitur" className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-10">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl font-bold tracking-tight text-ink-primary">
            Fitur Inti Sistem
          </h2>
          <p className="text-xs sm:text-sm text-ink-secondary">
            Dirancang untuk efisiensi eksekusi di VPS tanpa membebani memori server.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-canvas-subtle border border-hairline rounded-lg p-6 space-y-3 hover:border-hairline-prominent transition-colors">
            <div className="w-9 h-9 rounded-md bg-surface border border-hairline flex items-center justify-center text-primary">
              <Send className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-ink-primary">
              Direct REST API Kemnaker
            </h3>
            <p className="text-xs text-ink-secondary leading-relaxed">
              Mengakses endpoint Monev Kemnaker langsung lewat Axios. Tanpa membuka browser,
              proses absensi selesai dalam hitungan detik dengan konsumsi RAM di bawah 50 MB.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-canvas-subtle border border-hairline rounded-lg p-6 space-y-3 hover:border-hairline-prominent transition-colors">
            <div className="w-9 h-9 rounded-md bg-surface border border-hairline flex items-center justify-center text-primary">
              <GitBranch className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-ink-primary">
              Ekstraksi Commit GitHub
            </h3>
            <p className="text-xs text-ink-secondary leading-relaxed">
              Hubungkan repositori proyek aktif. Aktivitas kerja harian dibaca langsung
              dari commit message yang Anda buat pada hari tersebut.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-canvas-subtle border border-hairline rounded-lg p-6 space-y-3 hover:border-hairline-prominent transition-colors">
            <div className="w-9 h-9 rounded-md bg-surface border border-hairline flex items-center justify-center text-primary">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-ink-primary">
              AI Generator &amp; Fallback 0-Token
            </h3>
            <p className="text-xs text-ink-secondary leading-relaxed">
              Pakai API Key sendiri (Groq gratis atau OpenAI) untuk merangkum commit menjadi
              format baku 3 bagian. Jika kuota habis, sintesis lokal otomatis berjalan.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-canvas-subtle border border-hairline rounded-lg p-6 space-y-3 hover:border-hairline-prominent transition-colors">
            <div className="w-9 h-9 rounded-md bg-surface border border-hairline flex items-center justify-center text-primary">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-ink-primary">
              Pilihan Eksekusi Fleksibel
            </h3>
            <p className="text-xs text-ink-secondary leading-relaxed">
              Pilih mode submit manual 1-klik di dashboard atau pasang webhook unik di crontab
              VPS agar bot berjalan otomatis setiap sore.
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-canvas-subtle border border-hairline rounded-lg p-6 space-y-3 hover:border-hairline-prominent transition-colors">
            <div className="w-9 h-9 rounded-md bg-surface border border-hairline flex items-center justify-center text-primary">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-ink-primary">
              Enkripsi AES-256-GCM
            </h3>
            <p className="text-xs text-ink-secondary leading-relaxed">
              Password Kemnaker dan API Key tersimpan dalam kondisi terenkripsi simetris
              dengan initialization vector (IV) acak dan tag autentikasi unik per record.
            </p>
          </div>

          {/* Card 6 */}
          <div className="bg-canvas-subtle border border-hairline rounded-lg p-6 space-y-3 hover:border-hairline-prominent transition-colors">
            <div className="w-9 h-9 rounded-md bg-surface border border-hairline flex items-center justify-center text-primary">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-ink-primary">
              Kalender &amp; Log Monitoring
            </h3>
            <p className="text-xs text-ink-secondary leading-relaxed">
              Pantau histori kehadiran bulanan lewat kalender interaktif. Cek respon status
              HTTP dari Monev Kemnaker jika terjadi kendala jaringan.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="alur" className="py-16 px-4 sm:px-6 lg:px-8 border-y border-hairline bg-canvas-subtle/40">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl font-bold tracking-tight text-ink-primary">
              Alur Kerja Sistem
            </h2>
            <p className="text-xs sm:text-sm text-ink-secondary">
              Tiga tahap ringkas dari commit kode hingga laporan terverifikasi di Kemnaker.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div className="bg-surface border border-hairline p-5 rounded-md space-y-2">
              <div className="text-xs font-mono text-primary font-semibold">LANGKAH 01</div>
              <h3 className="text-sm font-semibold text-ink-primary">Bekerja &amp; Commit</h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Anda melakukan push commit kerja harian ke repo GitHub seperti biasa. Bot
                mengambil pesan commit tanggal berjalan.
              </p>
            </div>

            <div className="bg-surface border border-hairline p-5 rounded-md space-y-2">
              <div className="text-xs font-mono text-primary font-semibold">LANGKAH 02</div>
              <h3 className="text-sm font-semibold text-ink-primary">Sintesis Laporan</h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Commit diubah menjadi 3 bagian: Aktivitas, Pembelajaran, dan Kendala. Masing-masing
                divalidasi agar memenuhi syarat minimal 100 karakter.
              </p>
            </div>

            <div className="bg-surface border border-hairline p-5 rounded-md space-y-2">
              <div className="text-xs font-mono text-primary font-semibold">LANGKAH 03</div>
              <h3 className="text-sm font-semibold text-ink-primary">Submit Kemnaker</h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Bot menukar kredensial SSO Kemnaker menjadi Bearer token, lalu mengirim presensi
                hadir beserta teks laporan ke server Monev.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Documentation Shortcut Banner */}
      <section id="panduan" className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="bg-canvas-subtle border border-hairline rounded-xl p-6 sm:p-10 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline pb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary text-xs font-mono uppercase tracking-wider">
                  <BookOpen className="w-4 h-4" />
                  <span>Pusat Dokumentasi</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-ink-primary">
                  Panduan Lengkap &amp; Konfigurasi
                </h3>
                <p className="text-xs sm:text-sm text-ink-secondary">
                  Pelajari cara integrasi webhook cron VPS, pengaturan BYOK model AI, dan tips pengisian kredensial.
                </p>
              </div>

              <Link href="/docs">
                <Button variant="emerald" size="default" className="gap-2 shrink-0">
                  <span>Buka Dokumentasi Lengkap</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Quick Links Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              <Link
                href="/docs"
                className="group p-3.5 bg-surface/70 hover:bg-surface border border-hairline hover:border-primary/40 rounded-md transition-colors"
              >
                <div className="flex items-center gap-2 text-ink-primary font-medium text-xs group-hover:text-primary transition-colors">
                  <KeyRound className="w-3.5 h-3.5 text-primary" />
                  <span>Kredensial Kemnaker</span>
                </div>
                <p className="text-[11px] text-ink-muted mt-1 leading-normal">
                  Cara input dan tes login akun Monev
                </p>
              </Link>

              <Link
                href="/docs"
                className="group p-3.5 bg-surface/70 hover:bg-surface border border-hairline hover:border-primary/40 rounded-md transition-colors"
              >
                <div className="flex items-center gap-2 text-ink-primary font-medium text-xs group-hover:text-primary transition-colors">
                  <Cpu className="w-3.5 h-3.5 text-primary" />
                  <span>Model AI (BYOK)</span>
                </div>
                <p className="text-[11px] text-ink-muted mt-1 leading-normal">
                  Setup API Key Groq atau OpenAI pribadi
                </p>
              </Link>

              <Link
                href="/docs"
                className="group p-3.5 bg-surface/70 hover:bg-surface border border-hairline hover:border-primary/40 rounded-md transition-colors"
              >
                <div className="flex items-center gap-2 text-ink-primary font-medium text-xs group-hover:text-primary transition-colors">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span>Automasi Cron VPS</span>
                </div>
                <p className="text-[11px] text-ink-muted mt-1 leading-normal">
                  Format perintah curl crontab harian
                </p>
              </Link>

              <Link
                href="/docs"
                className="group p-3.5 bg-surface/70 hover:bg-surface border border-hairline hover:border-primary/40 rounded-md transition-colors"
              >
                <div className="flex items-center gap-2 text-ink-primary font-medium text-xs group-hover:text-primary transition-colors">
                  <GitBranch className="w-3.5 h-3.5 text-primary" />
                  <span>Integrasi GitHub</span>
                </div>
                <p className="text-[11px] text-ink-muted mt-1 leading-normal">
                  Koneksi repo &amp; ekstraksi commit
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 px-4 text-center border-t border-hairline bg-canvas-deep">
        <div className="max-w-xl mx-auto space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-ink-primary">
            Siap Mengotomatiskan Laporan Harian?
          </h2>
          <p className="text-xs sm:text-sm text-ink-secondary">
            Daftar akun sekarang, hubungkan repositori Anda, dan biarkan sistem menyelesaikan presensi MagangHub Kemnaker tepat waktu.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
            <Link href="/login">
              <Button variant="emerald" size="lg" className="gap-2">
                <span>Daftar / Masuk Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/docs">
              <Button variant="outline" size="lg" className="gap-2">
                <BookOpen className="w-4 h-4" />
                <span>Baca Panduan</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-hairline bg-canvas py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-muted">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-primary" />
            <span className="text-ink-primary font-medium">MagangHub Bot Attendance</span>
            <span>&bull;</span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>

          <div className="flex items-center gap-5 text-xs">
            <a href="#fitur" className="hover:text-ink-primary transition-colors">
              Fitur
            </a>
            <a href="#alur" className="hover:text-ink-primary transition-colors">
              Cara Kerja
            </a>
            <Link href="/docs" className="hover:text-ink-primary transition-colors text-primary font-medium">
              Dokumentasi
            </Link>
            <Link href="/login" className="hover:text-ink-primary transition-colors">
              Masuk
            </Link>
            <Link href="/dashboard" className="hover:text-ink-primary transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
