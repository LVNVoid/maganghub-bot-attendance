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
import { AIProvidersMarquee } from "@/components/ai-providers-marquee";
import { auth } from "@/lib/auth";

export const metadata = {
  title: "MagangHub Bot Attendance | Otomatisasi Laporan & Presensi Harian Kemnaker",
  description:
    "Web app manajemen bot absensi dan auto-submit laporan harian magang ke portal Monev MagangHub Kemnaker berbasis GitHub commits dan direct REST API.",
};

export default async function Home() {
  const session = await auth();

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

        <div className="flex items-center gap-1.5 sm:gap-3">
          <Link href="/docs" className="hidden sm:inline-flex">
            <Button variant="ghost" size="sm" className="text-xs gap-1.5 h-8 sm:h-9">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Dokumentasi</span>
            </Button>
          </Link>
          {session ? (
            <Link href="/dashboard">
              <Button variant="emerald" size="sm" className="text-xs gap-1.5 h-8 sm:h-9">
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button variant="outline" size="sm" className="text-xs h-8 sm:h-9">
                Masuk
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-8 pb-12 sm:pt-16 sm:pb-20 md:pt-20 md:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-hairline">
        {/* Subtle radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary-soft blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto text-center space-y-5 sm:space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft border border-primary/25 text-primary text-[11px] sm:text-xs font-mono tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Asisten Logbook Magang &bull; Auto-Sync GitHub
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-ink-primary leading-snug sm:leading-tight">
            Otomatisasi Laporan &amp; Presensi{" "}
            <span className="text-primary">MagangHub Kemnaker</span>
          </h1>

          <p className="text-xs sm:text-base text-ink-secondary max-w-2xl mx-auto leading-relaxed">
            Cukup push commit ke GitHub saat kerja. Bot otomatis merangkum aktivitas harian jadi 3 bagian laporan resmi (Aktivitas, Pembelajaran, Kendala) dan mengirim presensi ke Monev Kemnaker tepat waktu.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-row items-center justify-center gap-2 sm:gap-3 pt-2">
            <Link href={session ? "/dashboard" : "/login"} className="flex-1 sm:flex-initial">
              <Button variant="emerald" size="lg" className="w-full sm:w-auto gap-1.5 sm:gap-2 px-3 sm:px-6 h-9 sm:h-11 text-xs sm:text-sm">
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              </Button>
            </Link>

            <Link href="/docs" className="flex-1 sm:flex-initial">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto gap-1.5 sm:gap-2 px-3 sm:px-6 h-9 sm:h-11 text-xs sm:text-sm">
                <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0" />
                <span>Dokumentasi</span>
              </Button>
            </Link>
          </div>

          {/* Trust & Architecture Metrics */}
          <div className="pt-6 sm:pt-8 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-left max-w-3xl mx-auto">
            <div className="bg-canvas-subtle/80 border border-hairline p-3 rounded-md">
              <div className="text-base sm:text-lg font-bold text-ink-primary font-mono">0 Menit</div>
              <div className="text-[10px] sm:text-[11px] text-ink-muted">Waktu ngetik laporan</div>
            </div>
            <div className="bg-canvas-subtle/80 border border-hairline p-3 rounded-md">
              <div className="text-base sm:text-lg font-bold text-primary font-mono">3 Bagian</div>
              <div className="text-[10px] sm:text-[11px] text-ink-muted">Lolos min. 100 karakter</div>
            </div>
            <div className="bg-canvas-subtle/80 border border-hairline p-3 rounded-md">
              <div className="text-base sm:text-lg font-bold text-ink-primary font-mono">Tepat Waktu</div>
              <div className="text-[10px] sm:text-[11px] text-ink-muted">Bebas lupa absen harian</div>
            </div>
            <div className="bg-canvas-subtle/80 border border-hairline p-3 rounded-md">
              <div className="text-base sm:text-lg font-bold text-ink-primary font-mono">Terenkripsi</div>
              <div className="text-[10px] sm:text-[11px] text-ink-muted">Kredensial aman di akun</div>
            </div>
          </div>
        </div>
      </section>

      {/* Supported AI Providers Marquee */}
      <AIProvidersMarquee />

      {/* Main Features */}
      <section id="fitur" className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-6 sm:space-y-10">
        <div className="text-center space-y-1.5 sm:space-y-2 max-w-xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-ink-primary">
            Masalah Nyata yang Diselesaikan
          </h2>
          <p className="text-xs sm:text-sm text-ink-secondary">
            Bukan sekadar bot, ini asisten yang memastikan hak dan penilaian magang Anda tetap aman.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-6">
          {/* Card 1 */}
          <div className="bg-canvas-subtle border border-hairline rounded-lg p-3 sm:p-6 space-y-2 sm:space-y-3 hover:border-hairline-prominent transition-colors">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-md bg-surface border border-hairline flex items-center justify-center text-primary">
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <h3 className="text-xs sm:text-base font-semibold text-ink-primary line-clamp-1">
              Bebas Lupa Absen
            </h3>
            <p className="text-[11px] sm:text-xs text-ink-secondary leading-relaxed line-clamp-2 sm:line-clamp-none">
              Capek kerja seharian sering bikin lupa presensi pulang. Bot memastikan status kehadiran Anda tercatat sebelum batas waktu habis.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-canvas-subtle border border-hairline rounded-lg p-3 sm:p-6 space-y-2 sm:space-y-3 hover:border-hairline-prominent transition-colors">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-md bg-surface border border-hairline flex items-center justify-center text-primary">
              <GitBranch className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <h3 className="text-xs sm:text-base font-semibold text-ink-primary line-clamp-1">
              Commit Jadi Laporan
            </h3>
            <p className="text-[11px] sm:text-xs text-ink-secondary leading-relaxed line-clamp-2 sm:line-clamp-none">
              Tak perlu bingung mau nulis apa. Pekerjaan teknis yang Anda push ke GitHub langsung diterjemahkan jadi logbook yang masuk akal.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-canvas-subtle border border-hairline rounded-lg p-3 sm:p-6 space-y-2 sm:space-y-3 hover:border-hairline-prominent transition-colors">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-md bg-surface border border-hairline flex items-center justify-center text-primary">
              <Cpu className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <h3 className="text-xs sm:text-base font-semibold text-ink-primary line-clamp-1">
              Lolos Syarat 100 Karakter
            </h3>
            <p className="text-[11px] sm:text-xs text-ink-secondary leading-relaxed line-clamp-2 sm:line-clamp-none">
              Monev menolak laporan terlalu singkat. Tiga bagian laporan otomatis disusun padat dan memenuhi batas karakter wajib.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-canvas-subtle border border-hairline rounded-lg p-3 sm:p-6 space-y-2 sm:space-y-3 hover:border-hairline-prominent transition-colors">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-md bg-surface border border-hairline flex items-center justify-center text-primary">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <h3 className="text-xs sm:text-base font-semibold text-ink-primary line-clamp-1">
              Hemat Waktu Tiap Sore
            </h3>
            <p className="text-[11px] sm:text-xs text-ink-secondary leading-relaxed line-clamp-2 sm:line-clamp-none">
              Hentikan rutinitas buka web lemot dan ketik ulang laporan. Waktu Anda lebih berharga untuk belajar dan istirahat.
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-canvas-subtle border border-hairline rounded-lg p-3 sm:p-6 space-y-2 sm:space-y-3 hover:border-hairline-prominent transition-colors">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-md bg-surface border border-hairline flex items-center justify-center text-primary">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <h3 className="text-xs sm:text-base font-semibold text-ink-primary line-clamp-1">
              Kredensial Aman Terjaga
            </h3>
            <p className="text-[11px] sm:text-xs text-ink-secondary leading-relaxed line-clamp-2 sm:line-clamp-none">
              Password Monev dan API key Anda disimpan dengan enkripsi kuat. Hanya akun Anda yang bisa mengaksesnya.
            </p>
          </div>

          {/* Card 6 */}
          <div className="bg-canvas-subtle border border-hairline rounded-lg p-3 sm:p-6 space-y-2 sm:space-y-3 hover:border-hairline-prominent transition-colors">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-md bg-surface border border-hairline flex items-center justify-center text-primary">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <h3 className="text-xs sm:text-base font-semibold text-ink-primary line-clamp-1">
              Logbook Tetap Rapi
            </h3>
            <p className="text-[11px] sm:text-xs text-ink-secondary leading-relaxed line-clamp-2 sm:line-clamp-none">
              Cegah risiko uang saku tertunda atau teguran akibat logbook bolong. Riwayat bulanan Anda selalu tercatat lengkap.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="alur" className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8 border-y border-hairline bg-canvas-subtle/40">
        <div className="max-w-5xl mx-auto space-y-6 sm:space-y-10">
          <div className="text-center space-y-1.5 sm:space-y-2 max-w-xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-ink-primary">
              Alur Singkat Tiga Langkah
            </h2>
            <p className="text-xs sm:text-sm text-ink-secondary">
              Dari nulis kode biasa sampai laporan terverifikasi di portal Monev.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-6 relative">
            <div className="bg-surface border border-hairline p-3 sm:p-5 rounded-md space-y-1.5 sm:space-y-2">
              <div className="text-[10px] sm:text-xs font-mono text-primary font-semibold">LANGKAH 01</div>
              <h3 className="text-xs sm:text-sm font-semibold text-ink-primary line-clamp-1">1. Push ke GitHub</h3>
              <p className="text-[11px] sm:text-xs text-ink-secondary leading-relaxed line-clamp-2 sm:line-clamp-none">
                Tulis kode dan buat commit harian seperti biasa di proyek Anda. Tanpa format rumit.
              </p>
            </div>

            <div className="bg-surface border border-hairline p-3 sm:p-5 rounded-md space-y-1.5 sm:space-y-2">
              <div className="text-[10px] sm:text-xs font-mono text-primary font-semibold">LANGKAH 02</div>
              <h3 className="text-xs sm:text-sm font-semibold text-ink-primary line-clamp-1">2. Rangkum Otomatis</h3>
              <p className="text-[11px] sm:text-xs text-ink-secondary leading-relaxed line-clamp-2 sm:line-clamp-none">
                Pesan commit diubah jadi 3 bagian laporan yang rapi dan memenuhi batas minimal karakter.
              </p>
            </div>

            <div className="col-span-2 md:col-span-1 bg-surface border border-hairline p-3 sm:p-5 rounded-md space-y-1.5 sm:space-y-2">
              <div className="text-[10px] sm:text-xs font-mono text-primary font-semibold">LANGKAH 03</div>
              <h3 className="text-xs sm:text-sm font-semibold text-ink-primary line-clamp-1">3. Masuk ke Monev</h3>
              <p className="text-[11px] sm:text-xs text-ink-secondary leading-relaxed line-clamp-2 sm:line-clamp-none">
                Kehadiran dan laporan langsung masuk ke akun Kemnaker Anda sebelum jam batas harian.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Documentation Shortcut Banner */}
      <section id="panduan" className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="bg-canvas-subtle border border-hairline rounded-xl p-4 sm:p-10 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-5 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline pb-4 sm:pb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary text-xs font-mono uppercase tracking-wider">
                  <BookOpen className="w-4 h-4" />
                  <span>Pusat Panduan</span>
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-ink-primary">
                  Panduan Setup Praktis
                </h3>
                <p className="text-xs sm:text-sm text-ink-secondary">
                  Cara mudah hubungkan akun Monev, pilih model AI, dan pasang jadwal submit.
                </p>
              </div>

              <Link href="/docs">
                <Button variant="emerald" size="sm" className="gap-2 shrink-0 h-9 sm:h-10 text-xs sm:text-sm w-full sm:w-auto">
                  <span>Dokumentasi</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Quick Links Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 pt-1 sm:pt-2">
              <Link
                href="/docs"
                className="group p-2.5 sm:p-3.5 bg-surface/70 hover:bg-surface border border-hairline hover:border-primary/40 rounded-md transition-colors"
              >
                <div className="flex items-center gap-1.5 sm:gap-2 text-ink-primary font-medium text-xs group-hover:text-primary transition-colors">
                  <KeyRound className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="line-clamp-1">Akun Monev</span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-ink-muted mt-1 leading-normal line-clamp-2">
                  Cara simpan dan tes login akun
                </p>
              </Link>

              <Link
                href="/docs"
                className="group p-2.5 sm:p-3.5 bg-surface/70 hover:bg-surface border border-hairline hover:border-primary/40 rounded-md transition-colors"
              >
                <div className="flex items-center gap-1.5 sm:gap-2 text-ink-primary font-medium text-xs group-hover:text-primary transition-colors">
                  <Cpu className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="line-clamp-1">Model AI</span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-ink-muted mt-1 leading-normal line-clamp-2">
                  Pakai Groq, OpenAI, atau lainnya
                </p>
              </Link>

              <Link
                href="/docs"
                className="group p-2.5 sm:p-3.5 bg-surface/70 hover:bg-surface border border-hairline hover:border-primary/40 rounded-md transition-colors"
              >
                <div className="flex items-center gap-1.5 sm:gap-2 text-ink-primary font-medium text-xs group-hover:text-primary transition-colors">
                  <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="line-clamp-1">Jadwal Harian</span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-ink-muted mt-1 leading-normal line-clamp-2">
                  Atur bot jalan otomatis tiap sore
                </p>
              </Link>

              <Link
                href="/docs"
                className="group p-2.5 sm:p-3.5 bg-surface/70 hover:bg-surface border border-hairline hover:border-primary/40 rounded-md transition-colors"
              >
                <div className="flex items-center gap-1.5 sm:gap-2 text-ink-primary font-medium text-xs group-hover:text-primary transition-colors">
                  <GitBranch className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="line-clamp-1">GitHub Repo</span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-ink-muted mt-1 leading-normal line-clamp-2">
                  Koneksikan repo proyek magang
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
            Jalani Magang Lebih Tenang Mulai Hari Ini
          </h2>
          <p className="text-xs sm:text-sm text-ink-secondary">
            Daftar sekali, hubungkan repositori Anda, dan biarkan urusan absensi serta logbook beres otomatis tepat waktu.
          </p>
          <div className="pt-2 flex flex-row items-center justify-center gap-2 sm:gap-3">
            <Link href={session ? "/dashboard" : "/login"} className="flex-1 sm:flex-initial">
              <Button variant="emerald" size="lg" className="w-full sm:w-auto gap-1.5 sm:gap-2 px-3 sm:px-6 h-9 sm:h-11 text-xs sm:text-sm">
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              </Button>
            </Link>
            <Link href="/docs" className="flex-1 sm:flex-initial">
              <Button variant="outline" size="lg" className="w-full sm:w-auto gap-1.5 sm:gap-2 px-3 sm:px-6 h-9 sm:h-11 text-xs sm:text-sm">
                <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span>Dokumentasi</span>
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
            {session ? (
              <Link href="/dashboard" className="hover:text-ink-primary transition-colors">
                Dashboard
              </Link>
            ) : (
              <Link href="/login" className="hover:text-ink-primary transition-colors">
                Masuk
              </Link>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
