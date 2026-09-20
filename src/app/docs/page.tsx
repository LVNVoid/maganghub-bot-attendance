import {
  DocsPage,
  DocsTitle,
  DocsDescription,
  DocsBody,
} from "fumadocs-ui/page";
import Link from "next/link";
import {
  Cpu,
  ShieldCheck,
  Calendar,
  GitBranch,
  Bot,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function DocsOverviewPage() {
  return (
    <DocsPage>
      <DocsTitle>Pengenalan &amp; Fitur MagangHub Bot</DocsTitle>
      <DocsDescription>
        Dokumentasi lengkap dan panduan interaktif penggunaan sistem otomasi
        absensi dan pelaporan harian peserta magang Kemnaker RI.
      </DocsDescription>

      <DocsBody>
        <div className="p-4 rounded-md border border-primary/20 bg-primary/5 text-xs text-ink-primary space-y-2 mb-6">
          <div className="font-semibold text-primary flex items-center gap-1.5 text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Selamat Datang di Dokumentasi MagangHub Bot</span>
          </div>
          <p className="text-ink-secondary leading-relaxed">
            Aplikasi ini dibangun untuk membantu peserta magang di portal Monev
            MagangHub Kemnaker agar proses absensi harian dan penyusunan laporan
            aktivitas magang berjalan otomatis, konsisten, dan akurat berdasarkan
            pengerjaan kode di GitHub.
          </p>
        </div>

        <h2>Fitur Utama Sistem</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 not-prose">
          <div className="p-4 rounded-md border border-hairline bg-surface space-y-2">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <Bot className="w-4 h-4" />
              <span>Direct REST API Kemnaker</span>
            </div>
            <p className="text-xs text-ink-secondary">
              Berkomunikasi langsung via HTTP ke SSO Kemnaker dan Monev API tanpa
              ketergantungan browser (Playwright/Puppeteer). Sangat hemat RAM
              dan CPU.
            </p>
          </div>

          <div className="p-4 rounded-md border border-hairline bg-surface space-y-2">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <Cpu className="w-4 h-4" />
              <span>AI BYOK (Bring Your Own Key)</span>
            </div>
            <p className="text-xs text-ink-secondary">
              Dukungan API Key pribadi (Groq gratis, OpenRouter, OpenAI). Tersedia
              juga generator lokal 0-token yang siap merangkum aktivitas tanpa
              biaya.
            </p>
          </div>

          <div className="p-4 rounded-md border border-hairline bg-surface space-y-2">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <GitBranch className="w-4 h-4" />
              <span>GitHub Commits Ingestion</span>
            </div>
            <p className="text-xs text-ink-secondary">
              Menarik daftar commit harian Anda dan secara otomatis mengubah
              istilah teknis menjadi bahasa laporan formal yang mudah dipahami
              pembimbing.
            </p>
          </div>

          <div className="p-4 rounded-md border border-hairline bg-surface space-y-2">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>Keamanan Kredensial AES-256-GCM</span>
            </div>
            <p className="text-xs text-ink-secondary">
              Email, password akun Kemnaker, dan API Key Anda dienkripsi secara
              simetris di database sehingga aman dari kebocoran data.
            </p>
          </div>
        </div>

        <h2>Alur Cepat Memulai</h2>
        <ol>
          <li>
            <strong>Daftar / Masuk Akun</strong>: Akses halaman <code>/register</code> atau <code>/login</code>.
          </li>
          <li>
            <strong>Simpan Kredensial Kemnaker</strong>: Masukkan kredensial akun Monev di menu Pengaturan &amp; Bot dan uji koneksinya.
          </li>
          <li>
            <strong>Atur Model AI</strong>: Masukkan API Key Groq/OpenAI Anda untuk hasil optimal, atau gunakan fallback bawaan.
          </li>
          <li>
            <strong>Hubungkan Repository</strong>: Masukkan nama repo pengerjaan tugas magang (contoh: <code>owner/repo</code>).
          </li>
          <li>
            <strong>Submit Laporan</strong>: Pilih mode manual 1-klik di Dashboard atau pasang webhook cron di server Anda.
          </li>
        </ol>

        <div className="mt-8 pt-4 border-t border-hairline flex items-center justify-between">
          <span className="text-xs text-ink-muted">Mulai ke langkah pertama:</span>
          <Link
            href="/docs/panduan/registrasi"
            className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
          >
            <span>1. Panduan Registrasi &amp; Login</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </DocsBody>
    </DocsPage>
  );
}
