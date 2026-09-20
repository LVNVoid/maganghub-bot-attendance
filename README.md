# MagangHub Bot Attendance

Web application manajemen bot absensi dan auto-submit laporan harian magang ke portal Monev MagangHub Kemnaker (`https://monev.maganghub.kemnaker.go.id`) untuk multi-user peserta magang (posisi programmer/developer).

Sistem mengintegrasikan ekstraksi riwayat commit GitHub otomatis, sintesis laporan harian 3 bagian berbasis AI via 9router (`combo-flash`), Direct REST API submission tanpa browser automation (zero Chromium/Playwright), dialog konfirmasi modal native React, dan feedback interaktif via `react-hot-toast`.

---

## ⚡ Fitur Utama

- **Direct REST API Kemnaker (Zero Browser)**:
  - Mengalirkan autentikasi SSO Kemnaker (`account.kemnaker.go.id`) dan menukar auth code dengan portal Monev MagangHub.
  - Submit kehadiran dan laporan harian langsung lewat HTTP POST (`/api/v1/attendances/with-daily-log`).
  - Eksekusi instan (< 1 detik) tanpa beban memori browser, 100% kompatibel dengan serverless runtime.
- **Respon Validasi Asli Portal (Native API Pass-through)**:
  - Respon dan validasi dikembalikan apa adanya dari server Monev Kemnaker (seperti HTTP 409 `Presensi sudah ada`, HTTP 422, dsb.) dan dicatat ke log audit.
- **Keamanan Kredensial Tingkat Tinggi**:
  - Email dan password akun MagangHub pengguna disimpan di database dengan enkripsi **AES-256-GCM** (`node:crypto`).
  - Password tidak pernah dikembalikan ke client dalam bentuk plaintext.
- **Pilihan Mode Automasi (User-Choice)**:
  - **Mode Manual (Dashboard Web)**: Generate draft laporan dari commit GitHub dan tekan "Submit Kehadiran Sekarang" dengan 1-klik.
  - **Mode Automasi Terjadwal (Cron VPS / Railway Worker)**: Setiap user memiliki `webhookKey` unik. Web app menyediakan snippet perintah `curl` yang siap dipasang pada `crontab` VPS Linux pribadi atau scheduled task Railway/GitHub Actions.
- **Integrasi GitHub Commits**:
  - Hubungkan repository dan branch proyek yang sedang dikerjakan. Auto-detect branch default (`master`/`main`).
  - Mengambil commit history harian zona waktu WIB (`Asia/Jakarta`) secara otomatis sebagai bahan dasar laporan.
- **AI Report Synthesizer (9router combo-flash + Contextual Parser)**:
  - Menghasilkan laporan dalam bahasa Indonesia semi-formal non-teknis (sesuai aturan Monev Kemnaker).
  - Terdiri dari 3 bagian: **Uraian Aktivitas**, **Pembelajaran yang Diperoleh**, dan **Kendala yang Dihadapi**.
  - Parser kontekstual menerjemahkan jenis commit (`feat`, `fix`, `refactor`, `docs`, `config`) ke kalimat bermakna tanpa awalan klise generik.
- **Riwayat Laporan & Manajemen Draft (`/reports/history`)**:
  - Tabel riwayat laporan lengkap dengan live search, filter status (`ALL`, `DRAFT`, `SUBMITTED`, `FAILED`), pagination 10 item, dan expandable accordion view.
  - Fitur hapus draft laporan dengan konfirmasi modal `<ConfirmDialog>` dan proteksi penguncian untuk laporan berstatus `SUBMITTED`.
- **UI & Feedback System (Supabase Dark Theme + react-hot-toast)**:
  - Tema dark Supabase (`#171717` canvas, `#2e2e2e` border, `#3ecf8e` emerald).
  - Notifikasi melayang non-intrusif via `react-hot-toast` (`ToasterProvider`), tanpa layout shift status banner statis inline.

---

## 🛠️ Tech Stack & Arsitektur

| Layer | Teknologi |
| :--- | :--- |
| **Framework** | Next.js 16.3.5 (App Router, Turbopack, React 19) |
| **Language** | TypeScript (Strict mode, zero `any`) |
| **Architecture** | Simple Scalable Architecture (`src/actions`, `src/services`, `src/schemas`, `src/hooks`, `src/types`, `src/utils`) |
| **HTTP Client** | Axios |
| **Database** | PostgreSQL di **Neon** (Serverless Postgres) |
| **ORM** | Prisma ORM v7.10.0 (`@prisma/adapter-pg` + `pg` driver adapter + `prisma.config.ts`) |
| **Authentication** | Auth.js v5 (`next-auth@beta`) + `@auth/prisma-adapter` + `bcryptjs` (salt rounds 12) |
| **Validation** | Zod v3.24 |
| **Styling** | Tailwind CSS v4 (`@theme inline`), Lucide React |
| **Notifications** | `react-hot-toast` |
| **Testing** | Vitest v3 |

---

## 📋 Kebutuhan Sistem & Prasyarat

Sebelum menjalankan proyek ini, pastikan Anda telah menyiapkan:

1. **Node.js**: Versi `>= 20.0.0` (Direkomendasikan Node.js v22 LTS).
2. **Database PostgreSQL**: Akun dan database di [Neon Serverless Postgres](https://neon.tech) atau PostgreSQL lokal.
3. **GitHub OAuth App**:
   - Buka GitHub Settings -> Developer settings -> OAuth Apps -> New OAuth App.
   - Homepage URL: `http://localhost:3000` (atau domain production Anda).
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`.
4. **Encryption Key**: 32-byte hex key (64 karakter hex) untuk enkripsi AES-256-GCM kredensial dan API Key user.
5. **AI Provider (BYOK / Bring Your Own Key)**:
   - Setiap pengguna dapat memasukkan API Key mereka sendiri melalui menu **Pengaturan** (misal: Groq gratis `https://api.groq.com/openai/v1`, OpenRouter, atau OpenAI).
   - Server juga menyediakan **Smart Local Synthesizer (0-Token)** yang otomatis mengonversi commit message ke laporan baku tanpa biaya AI jika user belum mengisi API Key.
   - Variabel `OPENAI_API_KEY` di server opsional sebagai fallback bawaan.

---

## ⚙️ Konfigurasi Environment (`.env`)

Salin file `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Isi variabel lingkungan berikut:

```env
# 1. Database PostgreSQL di Neon
DATABASE_URL="postgresql://<user>:<password>@<host>.neon.tech/<dbname>?sslmode=require"

# 2. NextAuth v5 Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="buat-string-acak-minimal-32-karakter-untuk-keamanan-sesi"

# 3. GitHub OAuth App (Untuk fitur Masuk dengan GitHub)
GITHUB_CLIENT_ID="your_github_oauth_client_id"
GITHUB_CLIENT_SECRET="your_github_oauth_client_secret"

# 4. Security / Enkripsi Kredensial MagangHub (Wajib 64 karakter hex / 32 byte)
# Generate via node: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

# 5. AI Provider (9router Gateway)
OPENAI_BASE_URL="http://43.157.204.138:20128/v1"
OPENAI_MODEL="combo-flash"
OPENAI_API_KEY="your_9router_api_key"
```

---

## 🚀 Langkah Instalasi & Menjalankan

### 1. Install Dependencies
```bash
npm install
```

### 2. Validasi & Generate Prisma 7
```bash
npx prisma validate
npx prisma generate
```

### 3. Push Schema ke Database
```bash
npx prisma db push
```
Perintah ini akan membuat dan menyinkronkan tabel (`User`, `Account`, `Session`, `MaganghubCredential`, `GithubRepo`, `Report`, `SubmitLog`, `AutomationConfig`) beserta indeks database.

### 4. Jalankan Development Server
```bash
npm run dev
```
Buka browser di `http://localhost:3000`.

### 5. Build untuk Production
```bash
npm run build
npm run start
```

---

## 📖 Panduan Penggunaan Lengkap

### 1. Registrasi Akun Web App
1. Buka `http://localhost:3000/register`.
2. Masukkan Nama Lengkap, Email, dan Password (minimal 8 karakter).
3. Atau klik tombol **Masuk dengan GitHub** di halaman Login.

### 2. Konfigurasi Kredensial MagangHub (SSO Kemnaker)
1. Buka menu **Pengaturan & Bot** (`/settings`).
2. Pada card **Kredensial MagangHub (SSO Kemnaker)**, masukkan email dan kata sandi akun Kemnaker (`account.kemnaker.go.id`).
3. Klik **Simpan Kredensial**. Password langsung dienkripsi menggunakan AES-256-GCM sebelum disimpan ke database.
4. Klik tombol **Uji Login Monev** untuk memastikan akun Kemnaker valid dan dapat berkomunikasi dengan portal Monev.

### 3. Konfigurasi AI Pribadi (BYOK - Bring Your Own Key)
1. Buka menu **Pengaturan & Bot** (`/settings`) -> card **Model AI Pribadi (BYOK)**.
2. Pilih preset yang diinginkan:
   - **Groq (Gratis / Rekomendasi)**: Base URL `https://api.groq.com/openai/v1`, Model `llama-3.3-70b-versatile`. Dapatkan key gratis di [console.groq.com/keys](https://console.groq.com/keys).
   - **OpenRouter**: Base URL `https://openrouter.ai/api/v1`, Model `meta-llama/llama-3.3-70b-instruct`.
   - **OpenAI**: Base URL `https://api.openai.com/v1`, Model `gpt-4o-mini`.
   - **Custom**: Masukkan Base URL dan model server AI Anda sendiri.
3. Masukkan API Key Anda lalu klik **Simpan Konfigurasi AI**. Kunci disimpan terenkripsi AES-256-GCM.
4. Klik tombol **Uji Koneksi AI** untuk memastikan koneksi ke model AI berhasil.
5. Indikator kesiapan AI akan otomatis menyala:
   - **Dashboard**: Kartu metrik "Status Model AI" berubah menjadi 🟢 `Siap (BYOK)` dengan nama model aktif.
   - **Editor Laporan**: Badge di samping tombol Generate AI berubah menjadi 🟢 `AI Siap • <model>`.
   - Jika belum mengisi API Key, sistem tetap dapat digunakan dengan indikator 🟡 `Fallback (0-Token)`.

### 4. Hubungkan Repository GitHub
1. Pada menu **Pengaturan & Bot** -> card **GitHub Repositories**.
2. Masukkan nama repository yang sedang dikerjakan dengan format `owner/repo` (contoh: `LVNVoid/lvn` atau URL GitHub) dan tentukan branch (default: `main` / auto-detect).
3. Klik **Tambah Repo**. Anda dapat menambahkan lebih dari satu repository.

### 4. Pilihan Mode Eksekusi:

#### Opsi A: Manual Submit (1-Klik di Web)
1. Buka menu **Laporan Harian** (`/reports`).
2. Klik tombol **Generate AI** untuk merangkum commit GitHub hari ini menjadi draf laporan 3 bagian (Aktivitas, Pembelajaran, Kendala).
3. Edit isi uraian jika diperlukan (tersedia counter jumlah karakter).
4. Klik **Simpan Draft** atau buka **Dashboard** lalu tekan **Submit Kehadiran Sekarang**.

#### Opsi B: Automasi Terjadwal (Cron VPS / Cloud Worker)
1. Buka menu **Pengaturan & Bot** -> card **Metode Eksekusi & Automasi**.
2. Nyalakan switch toggle **Automasi Terjadwal**.
3. Tentukan jam target submit (contoh: `13:50` WIB).
4. Salin curl command pada kotak **Webhook Endpoint Token**:
   ```bash
   # Pasang di crontab VPS Linux (crontab -e)
   50 13 * * 1-6 curl -s -X POST https://domain-anda.com/api/cron/trigger \
     -H "Authorization: Bearer <WEBHOOK_KEY>" >> /var/log/maganghub-cron.log 2>&1
   ```
5. Saat cron berjalan:
   - Jika belum ada draf, sistem otomatis menarik commit GitHub hari itu, men-generate laporan via AI, menyimpan draf, login SSO Kemnaker, dan submit ke Monev.
   - Jika sudah ada draf, sistem mengirimkan draf yang ada.
   - Respon asli dari portal Monev (HTTP 200, 409, 422, dsb.) dicatat ke tabel log audit.

### 5. Melihat Riwayat & Menghapus Draft (`/reports/history`)
1. Buka menu **Riwayat Laporan** di sidebar.
2. Gunakan kolom pencarian dan filter status (`ALL`, `DRAFT`, `SUBMITTED`, `FAILED`) untuk menemukan laporan.
3. Klik baris laporan untuk melihat detail ekspansif 3 bagian laporan.
4. Klik ikon tong sampah (**Hapus**) pada laporan berstatus `DRAFT` atau `FAILED` untuk menghapus. Konfirmasi modal `<ConfirmDialog>` akan muncul sebelum penghapusan diproses. Laporan berstatus `SUBMITTED` terkunci permanen dan tidak dapat dihapus.

---

## 📡 API Endpoints

| Method | Endpoint | Deskripsi | Autentikasi | Rate Limit |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/cron/trigger` | Memicu eksekusi submit harian untuk user pemilik webhook | Header `Authorization: Bearer <key>` | 10 req/menit per IP |
| `GET` | `/api/github/commits` | Ambil daftar commit hari ini dari repository yang dilacak | Session Cookie (Auth.js) | - |
| `GET/POST` | `/api/auth/[...nextauth]` | Endpoint autentikasi Auth.js v5 | Public / OAuth Callback | - |

---

## 🧪 Testing & Verifikasi

Proyek dilengkapi dengan pengujian unit otomatis menggunakan Vitest:

```bash
# Menjalankan seluruh unit test
npm test

# Typecheck TypeScript
npm run typecheck

# Production Build check (Next.js Turbopack)
npm run build
```

Cakupan pengujian (20 tests passed):
- `src/lib/crypto.test.ts`: Validasi enkripsi/dekripsi AES-256-GCM, IV unik, dan anti-tamper.
- `src/lib/ai.test.ts`: Validasi sintesis teks dan enforcement minimal 100 karakter per bagian.
- `src/lib/github.test.ts`: Validasi pembersihan commit message, auto-detect branch, dan filter merge commit.
- `src/lib/activity-extractor.test.ts`: Validasi ekstraksi aktivitas developer.
- `src/lib/maganghub-api.test.ts`: Validasi penanganan error API Monev.
- `src/lib/date-utils.test.ts`: Validasi utilitas tanggal zona waktu WIB.
- `src/lib/submit-orchestrator.test.ts`: Validasi modul orchestrator.

---

## 🔒 Lisensi & Keamanan

Dibangun untuk kebutuhan peserta magang programmer Kemnaker RI. Kredensial SSO Kemnaker dienkripsi secara simetris (AES-256-GCM) dan tidak pernah dibagikan kepada pihak ketiga.
