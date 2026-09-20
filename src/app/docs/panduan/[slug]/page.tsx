import {
  DocsPage,
  DocsTitle,
  DocsDescription,
  DocsBody,
} from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, KeyRound, Cpu, Terminal, History, GitBranch } from "lucide-react";

interface GuidePageProps {
  params: Promise<{ slug: string }>;
}

const GUIDES: Record<
  string,
  {
    title: string;
    description: string;
    prev?: { title: string; href: string };
    next?: { title: string; href: string };
    content: React.ReactNode;
  }
> = {
  registrasi: {
    title: "1. Panduan Registrasi & Login",
    description: "Cara membuat akun pengguna baru dan login ke platform MagangHub Bot.",
    prev: { title: "Pengenalan & Fitur", href: "/docs" },
    next: { title: "2. Kredensial MagangHub", href: "/docs/panduan/kredensial-maganghub" },
    content: (
      <>
        <h2>Membuat Akun Baru</h2>
        <p>
          Untuk mulai menggunakan MagangHub Bot, Anda perlu mendaftarkan akun di sistem:
        </p>
        <ol>
          <li>Buka tautan <code>/register</code> pada aplikasi.</li>
          <li>Masukkan <strong>Nama Lengkap</strong>, <strong>Alamat Email</strong> aktif, dan <strong>Kata Sandi</strong> (minimal 8 karakter).</li>
          <li>Klik tombol <strong>Daftar Akun</strong>. Kata sandi Anda akan di-hash secara aman menggunakan algoritma <code>bcrypt</code> dengan 12 salt rounds.</li>
          <li>Setelah pendaftaran berhasil, Anda akan dialihkan secara otomatis ke halaman login.</li>
        </ol>

        <h2>Metode Login yang Didukung</h2>
        <ul>
          <li>
            <strong>Email &amp; Password</strong>: Masuk menggunakan kredensial yang didaftarkan pada formulir registrasi.
          </li>
          <li>
            <strong>GitHub OAuth</strong>: Jika administrator mengaktifkan GitHub OAuth App, Anda cukup menekan tombol <strong>Masuk dengan GitHub</strong> untuk login 1-klik tanpa perlu mengingat kata sandi.
          </li>
        </ul>

        <div className="p-4 rounded-md border border-hairline bg-surface text-xs text-ink-secondary space-y-1 my-4">
          <div className="font-semibold text-ink-primary flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
            <span>Sesi &amp; Keamanan</span>
          </div>
          <p>
            Sesi login Anda dilindungi oleh Auth.js v5 menggunakan token JWT terenkripsi dengan masa berlaku sesi yang aman.
          </p>
        </div>
      </>
    ),
  },
  "kredensial-maganghub": {
    title: "2. Kredensial MagangHub (SSO Kemnaker)",
    description: "Menyimpan dan menguji kredensial akun Monev Kemnaker secara aman.",
    prev: { title: "1. Registrasi & Login", href: "/docs/panduan/registrasi" },
    next: { title: "3. Konfigurasi AI Pribadi (BYOK)", href: "/docs/panduan/ai-byok" },
    content: (
      <>
        <h2>Mengapa Kredensial Kemnaker Diperlukan?</h2>
        <p>
          Bot memerlukan otorisasi untuk melakukan check-in kehadiran dan pengiriman laporan harian ke portal resmi Monev MagangHub (<code>https://monev.maganghub.kemnaker.go.id</code>).
        </p>

        <h2>Langkah Konfigurasi</h2>
        <ol>
          <li>Masuk ke dashboard lalu pilih menu <strong>Pengaturan &amp; Bot</strong> (<code>/settings</code>).</li>
          <li>Pada kartu <strong>Kredensial MagangHub (SSO Kemnaker)</strong>:
            <ul>
              <li>Masukkan <strong>Email Akun Kemnaker</strong> yang terdaftar sebagai peserta magang aktif.</li>
              <li>Masukkan <strong>Password Akun Kemnaker</strong>.</li>
            </ul>
          </li>
          <li>Klik <strong>Simpan Kredensial</strong>.</li>
        </ol>

        <h2>Uji Koneksi Akun</h2>
        <p>
          Setelah menyimpan kredensial, tekan tombol <strong>Uji Login Monev</strong>. Sistem akan melakukan simulasi autentikasi langsung ke SSO Kemnaker:
        </p>
        <ul>
          <li><strong>Status Valid (Hijau)</strong>: Autentikasi berhasil, token sesi SSO valid, dan akun siap digunakan untuk absensi.</li>
          <li><strong>Status Tidak Valid (Merah)</strong>: Email atau kata sandi keliru, atau akun Kemnaker mengalami penolakan SSO. Silakan periksa kembali kata sandi Anda.</li>
        </ul>

        <div className="p-4 rounded-md border border-primary/20 bg-primary/5 text-xs text-ink-primary space-y-1 my-4">
          <div className="font-semibold text-primary flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Enkripsi Standar Perbankan (AES-256-GCM)</span>
          </div>
          <p className="text-ink-secondary">
            Kredensial Anda tidak disimpan dalam bentuk teks biasa. Data dienkripsi menggunakan algoritma AES-256-GCM dengan Initialization Vector (IV) unik dan authentication tag anti-manipulasi.
          </p>
        </div>
      </>
    ),
  },
  "ai-byok": {
    title: "3. Konfigurasi AI Pribadi (BYOK)",
    description: "Mengatur API Key model AI pribadi (Groq, OpenRouter, OpenAI, dll) agar tidak membebani server.",
    prev: { title: "2. Kredensial MagangHub", href: "/docs/panduan/kredensial-maganghub" },
    next: { title: "4. Hubungkan Repository GitHub", href: "/docs/panduan/github-repo" },
    content: (
      <>
        <h2>Apa itu Model BYOK (Bring Your Own Key)?</h2>
        <p>
          Model BYOK memungkinkan setiap pengguna membawa kunci API AI mereka sendiri. Ini memastikan akun Anda memiliki kuota mandiri, bebas dari rate-limit pengguna lain, dan tidak membebani biaya pemilik server.
        </p>

        <h2>Pilihan Preset Provider</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4 not-prose">
          <div className="p-3.5 rounded-md border border-primary/30 bg-surface space-y-1">
            <span className="font-semibold text-primary text-xs">Groq (Gratis / Direkomendasikan)</span>
            <p className="text-[11px] text-ink-secondary">
              Kecepatan inferensi sangat tinggi dan gratis. Model bawaan: <code>llama-3.3-70b-versatile</code>. Dapatkan key di <a href="https://console.groq.com/keys" target="_blank" className="text-primary underline">console.groq.com</a>.
            </p>
          </div>
          <div className="p-3.5 rounded-md border border-hairline bg-surface space-y-1">
            <span className="font-semibold text-ink-primary text-xs">OpenRouter</span>
            <p className="text-[11px] text-ink-secondary">
              Akses ke ratusan model open-source dan komersial via satu API. Model: <code>meta-llama/llama-3.3-70b-instruct</code>.
            </p>
          </div>
          <div className="p-3.5 rounded-md border border-hairline bg-surface space-y-1">
            <span className="font-semibold text-ink-primary text-xs">OpenAI</span>
            <p className="text-[11px] text-ink-secondary">
              Model resmi dari OpenAI seperti <code>gpt-4o-mini</code> untuk akurasi tata bahasa tinggi.
            </p>
          </div>
          <div className="p-3.5 rounded-md border border-hairline bg-surface space-y-1">
            <span className="font-semibold text-ink-primary text-xs">Custom / Self-Hosted</span>
            <p className="text-[11px] text-ink-secondary">
              Mendukung proxy API atau instance vLLM/Ollama yang kompatibel dengan format endpoint OpenAI.
            </p>
          </div>
        </div>

        <h2>Langkah Memasang API Key</h2>
        <ol>
          <li>Buka menu <strong>Pengaturan &amp; Bot</strong> (<code>/settings</code>) -&gt; kartu <strong>Model AI Pribadi (BYOK)</strong>.</li>
          <li>Pilih preset provider (contoh: <em>Groq</em>). Base URL dan Nama Model akan terisi secara otomatis.</li>
          <li>Tempelkan API Key Anda di kolom <strong>API Key Pribadi</strong>.</li>
          <li>Klik <strong>Simpan Konfigurasi AI</strong>.</li>
          <li>Klik <strong>Uji Koneksi AI</strong> untuk memastikan API Key aktif dan dapat merespons.</li>
        </ol>

        <h2>Indikator Kesiapan AI Live</h2>
        <p>
          Setelah disimpan, sistem akan menampilkan indikator live di antarmuka:
        </p>
        <ul>
          <li><strong>🟢 AI Siap (BYOK)</strong>: Menyala di Dashboard dan Editor Laporan dengan nama model aktif. Laporan Anda akan dirangkum oleh model AI pilihan Anda.</li>
          <li><strong>🟡 Fallback (0-Token)</strong>: Jika Anda belum mengisi API Key, sistem tetap berfungsi menggunakan generator cerdas lokal yang menerjemahkan commit GitHub tanpa biaya token sama sekali.</li>
        </ul>
      </>
    ),
  },
  "github-repo": {
    title: "4. Hubungkan Repository GitHub",
    description: "Melacak commit pengerjaan kode sebagai sumber data otomatis penyusunan laporan harian.",
    prev: { title: "3. Konfigurasi AI Pribadi (BYOK)", href: "/docs/panduan/ai-byok" },
    next: { title: "5. Submit Laporan & Absensi", href: "/docs/panduan/submit-laporan" },
    content: (
      <>
        <h2>Cara Kerja Pelacakan Repository</h2>
        <p>
          Bot menggunakan riwayat commit harian Anda sebagai fakta dasar pengerjaan. Setiap commit yang Anda push pada hari tersebut (rentang zona waktu WIB <code>00:00 - 23:59</code>) akan ditarik dan disintesis menjadi laporan magang resmi.
        </p>

        <h2>Menambahkan Repository</h2>
        <ol>
          <li>Buka menu <strong>Pengaturan &amp; Bot</strong> (<code>/settings</code>).</li>
          <li>Pada kartu <strong>GitHub Repositories</strong>, masukkan nama repository dengan format <code>owner/repo</code> (contoh: <code>LVNVoid/maganghub-bot-attendance</code> atau URL lengkap GitHub).</li>
          <li>Tentukan nama branch utama pengerjaan Anda (default: <code>main</code> atau <code>master</code>). Sistem memiliki fitur auto-detect jika branch default berbeda.</li>
          <li>Klik tombol <strong>Tambah Repo</strong>.</li>
        </ol>

        <div className="p-4 rounded-md border border-hairline bg-surface text-xs text-ink-secondary space-y-2 my-4">
          <div className="font-semibold text-ink-primary flex items-center gap-1.5">
            <GitBranch className="w-3.5 h-3.5 text-primary" />
            <span>Mendukung Multi-Repository</span>
          </div>
          <p>
            Jika dalam satu hari Anda mengerjakan beberapa repository sekaligus, Anda dapat menambahkan seluruh repository tersebut. Bot akan menggabungkan seluruh commit dari semua repo yang aktif secara rapi.
          </p>
        </div>
      </>
    ),
  },
  "submit-laporan": {
    title: "5. Submit Laporan & Absensi",
    description: "Menyusun draf laporan magang 3 bagian dan mengirimkan kehadiran ke portal Kemnaker.",
    prev: { title: "4. Hubungkan Repository GitHub", href: "/docs/panduan/github-repo" },
    next: { title: "6. Automasi Terjadwal (Cron VPS)", href: "/docs/panduan/automasi-cron" },
    content: (
      <>
        <h2>Format Wajib Laporan Magang 3 Bagian</h2>
        <p>
          Sesuai ketentuan portal Monev Kemnaker, laporan harian wajib terdiri dari 3 bagian dengan panjang minimal 100 karakter:
        </p>
        <ol>
          <li><strong>Uraian Aktivitas</strong>: Rincian pengerjaan teknis nyata yang diselesaikan hari ini berdasarkan commit yang ada.</li>
          <li><strong>Pembelajaran yang Diperoleh</strong>: Pemahaman teknis, arsitektur sistem, atau praktik terbaik yang didapatkan dari aktivitas tersebut.</li>
          <li><strong>Kendala yang Dihadapi</strong>: Tantangan teknis yang ditemui dan langkah konkret yang diambil untuk menyelesaikannya.</li>
        </ol>

        <h2>Alur Eksekusi Manual (1-Klik Web)</h2>
        <ol>
          <li>Buka menu <strong>Editor Laporan</strong> (<code>/reports</code>).</li>
          <li>Pilih tanggal yang ingin dilaporkan (default: hari ini).</li>
          <li>Tekan tombol <strong>Generate AI</strong>. Sistem akan mengambil commit hari itu dan menyusun teks laporan secara otomatis.</li>
          <li>Periksa draf laporan. Indikator karakter di pojok kanan bawah setiap kolom akan menunjukkan apakah teks telah memenuhi syarat (&gt;= 100 karakter).</li>
          <li>Klik <strong>Simpan Draft</strong> untuk menyimpan ke database.</li>
          <li>Buka <strong>Dashboard</strong> lalu tekan <strong>Submit Kehadiran Sekarang</strong> untuk mengirimkan data ke portal Kemnaker.</li>
        </ol>

        <div className="p-4 rounded-md border border-primary/20 bg-primary/5 text-xs text-ink-primary space-y-1 my-4">
          <div className="font-semibold text-primary flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Validasi Asli Portal Kemnaker</span>
          </div>
          <p className="text-ink-secondary">
            Aplikasi tidak melakukan blokade lokal buatan sendiri. Respon validasi asli dari portal Monev (misal HTTP 200 Sukses, HTTP 409 Presensi sudah ada, dsb.) akan diteruskan langsung kepada Anda.
          </p>
        </div>
      </>
    ),
  },
  "automasi-cron": {
    title: "6. Automasi Terjadwal (Cron VPS)",
    description: "Mengaktifkan bot otomatis agar berjalan sendiri setiap hari pada jam yang ditentukan.",
    prev: { title: "5. Submit Laporan & Absensi", href: "/docs/panduan/submit-laporan" },
    next: { title: "7. Riwayat & Hapus Draft", href: "/docs/panduan/riwayat-laporan" },
    content: (
      <>
        <h2>Prinsip Kerja Automasi Webhook</h2>
        <p>
          Setiap pengguna memiliki token rahasia (<code>webhookKey</code>) unik. Server Linux VPS atau scheduler cron memicu endpoint webhook aplikasi via HTTP POST, dan bot akan memproses absensi pengguna secara mandiri.
        </p>

        <h2>Langkah Pemasangan di Crontab VPS</h2>
        <ol>
          <li>Buka menu <strong>Pengaturan &amp; Bot</strong> (<code>/settings</code>) -&gt; kartu <strong>Metode Eksekusi &amp; Automasi</strong>.</li>
          <li>Nyalakan toggle <strong>Automasi Terjadwal</strong> dan pilih preferensi jam target (contoh: <code>13:50</code> WIB).</li>
          <li>Salin baris perintah <code>curl</code> yang tertera pada kotak Webhook.</li>
          <li>Buka terminal server VPS Linux Anda dan buka editor crontab:
            <pre className="bg-canvas-deep p-3 rounded text-xs font-mono my-2 text-ink-primary border border-hairline">
              crontab -e
            </pre>
          </li>
          <li>Tambahkan baris jadwal berikut (contoh: berjalan setiap Senin - Sabtu pukul 13:50 WIB):
            <pre className="bg-canvas-deep p-3 rounded text-xs font-mono my-2 text-ink-primary border border-hairline">
              50 13 * * 1-6 curl -s -X POST https://domain-anda.com/api/cron/trigger -H &quot;Authorization: Bearer &lt;TOKEN_ANDA&gt;&quot; &gt;&gt; /var/log/maganghub-cron.log 2&gt;&amp;1
            </pre>
          </li>
          <li>Simpan crontab. Bot kini akan berjalan otomatis setiap hari!</li>
        </ol>

        <h2>Perilaku Saat Cron Berjalan</h2>
        <ul>
          <li><strong>Jika belum ada draf</strong>: Bot otomatis mengambil commit GitHub hari itu, men-generate laporan via AI pribadi Anda, menyimpan draf, login SSO Kemnaker, dan submit ke Monev.</li>
          <li><strong>Jika sudah ada draf manual</strong>: Bot menggunakan teks laporan yang sudah Anda tulis dan langsung mengirimkannya ke Monev.</li>
          <li><strong>Jika sudah pernah terkirim</strong>: Bot tidak akan mengirim ulang untuk mencegah duplikasi data.</li>
        </ul>
      </>
    ),
  },
  "riwayat-laporan": {
    title: "7. Kelola Riwayat & Hapus Draft",
    description: "Melihat riwayat laporan masa lalu, filter status, dan menghapus draf yang tidak diinginkan.",
    prev: { title: "6. Automasi Terjadwal (Cron VPS)", href: "/docs/panduan/automasi-cron" },
    next: { title: "Arsitektur Sistem (SSA)", href: "/docs/arsitektur/sistem" },
    content: (
      <>
        <h2>Halaman Riwayat Laporan (/reports/history)</h2>
        <p>
          Halaman riwayat laporan menyediakan pencatatan lengkap seluruh absensi dan draf laporan yang pernah dibuat:
        </p>

        <h2>Fitur Manajemen Riwayat</h2>
        <ul>
          <li><strong>Pencarian Real-Time</strong>: Cari laporan berdasarkan tanggal, uraian aktivitas, atau pembelajaran tertentu.</li>
          <li><strong>Filter Status</strong>: Saring laporan berdasarkan status <code>ALL</code>, <code>DRAFT</code>, <code>SUBMITTED</code>, atau <code>FAILED</code>.</li>
          <li><strong>Ekspansi Baris</strong>: Klik pada baris laporan untuk membaca teks lengkap 3 bagian laporan harian.</li>
          <li><strong>Pagination Cepat</strong>: Navigasi riwayat dengan batas 10 item per halaman untuk menjaga kecepatan loading.</li>
        </ul>

        <h2>Menghapus Draf Laporan</h2>
        <p>
          Laporan yang berstatus <code>DRAFT</code> atau <code>FAILED</code> dapat dihapus sewaktu-waktu:
        </p>
        <ol>
          <li>Cari laporan yang ingin dihapus pada tabel riwayat.</li>
          <li>Klik ikon tong sampah (<strong>Hapus</strong>) pada kolom Aksi.</li>
          <li>Dialog konfirmasi modal (<code>ConfirmDialog</code>) akan muncul untuk memastikan Anda tidak menghapus secara tidak sengaja.</li>
          <li>Tekan <strong>Hapus Laporan</strong>. Data akan dihapus dari database dan notifikasi toast akan muncul.</li>
        </ol>

        <div className="p-4 rounded-md border border-hairline bg-surface text-xs text-ink-muted space-y-1 my-4">
          <div className="font-semibold text-ink-primary flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-warning" />
            <span>Laporan SUBMITTED Terkunci Permanen</span>
          </div>
          <p>
            Laporan yang telah sukses terkirim ke portal Kemnaker (berstatus <code>SUBMITTED</code>) dikunci secara permanen dan tidak dapat dihapus untuk menjaga integritas data audit absensi.
          </p>
        </div>
      </>
    ),
  },
};

export default async function GuideDetailPage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = GUIDES[slug];

  if (!guide) {
    notFound();
  }

  return (
    <DocsPage>
      <DocsTitle>{guide.title}</DocsTitle>
      <DocsDescription>{guide.description}</DocsDescription>

      <DocsBody>{guide.content}</DocsBody>

      <div className="mt-12 pt-6 border-t border-hairline flex items-center justify-between">
        {guide.prev ? (
          <Link
            href={guide.prev.href}
            className="inline-flex items-center gap-1.5 text-xs text-ink-secondary hover:text-ink-primary"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{guide.prev.title}</span>
          </Link>
        ) : (
          <div />
        )}

        {guide.next ? (
          <Link
            href={guide.next.href}
            className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
          >
            <span>{guide.next.title}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        ) : (
          <div />
        )}
      </div>
    </DocsPage>
  );
}
