# MagangHub Bot Attendance

Web app manajemen bot absensi dan auto-submit laporan harian magang ke portal Monev MagangHub Kemnaker (`https://monev.maganghub.kemnaker.go.id`) untuk multi-user peserta magang (posisi programmer/developer).

Sistem mengintegrasikan ekstraksi commit history GitHub secara otomatis, sintesis laporan harian 3 bagian (minimal 100 karakter per bagian) berbasis AI, serta Direct REST API submission tanpa browser automation (zero Chromium/Playwright).

---

## ⚡ Fitur Utama

- **Direct REST API Kemnaker (Zero Browser)**:
  - Meniru alur autentikasi SSO Kemnaker (`account.kemnaker.go.id`) dan bertukar auth code dengan portal Monev MagangHub.
  - Submit kehadiran dan laporan harian langsung lewat HTTP POST (`/api/v1/attendances/with-daily-log`).
  - Eksekusi instan (< 1 detik) tanpa beban memori browser, 100% kompatibel dengan serverless runtime (Vercel/Railway).
- **Keamanan Kredensial Tingkat Tinggi**:
  - Email dan password akun MagangHub pengguna disimpan di database dengan enkripsi **AES-256-GCM** (`node:crypto`).
  - Password tidak pernah dikembalikan ke client dalam bentuk plaintext.
- **Pilihan Mode Automasi (User-Choice)**:
  - **Mode Manual (Dashboard Web)**: Generate draft laporan dari commit GitHub dan tekan "Submit Kehadiran Sekarang" dengan 1-klik.
  - **Mode Automasi Terjadwal (Cron VPS / Railway Worker)**: Setiap user memiliki `webhookKey` unik. Web app menyediakan snippet perintah `curl` yang siap dipasang pada `crontab` VPS Linux pribadi atau scheduled task Railway/GitHub Actions.
- **Integrasi GitHub Commits**:
  - Hubungkan repository dan branch proyek yang sedang dikerjakan.
  - Mengambil commit history harian secara otomatis sebagai bahan dasar laporan.
- **AI Report Synthesizer (OpenAI / Groq + Fallback)**:
  - Menghasilkan laporan dalam bahasa Indonesia semi-formal non-teknis (sesuai aturan Monev Kemnaker).
  - Terdiri dari 3 bagian: **Uraian Aktivitas**, **Pembelajaran yang Diperoleh**, dan **Kendala yang Dihadapi**.
  - **Enforced Min-Length Check**: Setiap bagian dijamin memenuhi batas minimal validasi sistem MagangHub (≥ 100 karakter).
  - Memiliki fallback generator deterministik jika API AI offline atau kehabisan kuota.
- **Kalender & Monitoring Absensi**:
  - Visualisasi kalender bulanan status absensi (Submitted, Draft, Gagal, Kosong).
  - Feed log eksekusi bot audit trail (HTTP code, timestamp, trigger source).
- **Admin Panel**:
  - Monitoring kumulatif pengguna, success rate API, dan status kredensial peserta magang.

---

## 🛠️ Tech Stack

| Layer | Teknologi |
| :--- | :--- |
| **Framework** | Next.js 16.3.5 (App Router, Turbopack, React 19) |
| **Language** | TypeScript (Strict mode) |
| **HTTP Client** | Axios |
| **Database** | PostgreSQL di **Neon** (Serverless Postgres) |
| **ORM** | Prisma ORM v6 |
| **Authentication** | Auth.js v5 (`next-auth@beta`) + `@auth/prisma-adapter` + `bcryptjs` |
| **Styling** | Tailwind CSS v4 (`@theme inline`), Lucide React |
| **Design System** | Supabase dark-first theme (`#171717` canvas, `#3ecf8e` emerald accent) |
| **Testing** | Vitest v3 |

---

## 📋 Kebutuhan Sistem & Prasyarat

Sebelum menjalankan proyek ini, pastikan Anda telah menyiapkan:

1. **Node.js**: Versi `>= 20.0.0` (Direkomendasikan Node.js v22 LTS).
2. **Database PostgreSQL**: Akun dan database di [Neon Serverless Postgres](https://neon.tech) (atau database PostgreSQL lokal/cloud lainnya).
3. **GitHub OAuth App**:
   - Buka GitHub Settings -> Developer settings -> OAuth Apps -> New OAuth App.
   - Homepage URL: `http://localhost:3000` (atau domain production Anda).
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`.
4. **Encryption Key**: 32-byte hex key (64 karakter hex) untuk enkripsi AES-256-GCM.
5. **AI API Key (Opsional)**:
   - OpenAI API Key (`OPENAI_API_KEY`) atau Groq API Key (`GROQ_API_KEY`).
   - Jika dikosongkan, sistem tetap berjalan normal menggunakan engine fallback bawaan.

---

## ⚙️ Konfigurasi Environment (`.env`)

Salin file `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Isi variabel lingkungan berikut:

```env
# 1. Database PostgreSQL di Neon
DATABASE_URL="postgresql://<user>:<password>@<ep-hostname>.neon.tech/<dbname>?sslmode=require"

# 2. NextAuth v5 Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="buat-string-acak-minimal-32-karakter-untuk-keamanan-sesi"

# 3. GitHub OAuth App (Untuk fitur Masuk dengan GitHub)
GITHUB_CLIENT_ID="your_github_oauth_client_id"
GITHUB_CLIENT_SECRET="your_github_oauth_client_secret"

# 4. Security / Enkripsi Kredensial MagangHub (Wajib 64 karakter hex / 32 byte)
# Contoh generate di bash/terminal: node -e "console.log(crypto.randomBytes(32).toString('hex'))"
ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

# 5. AI Provider (Opsional, pilih salah satu atau keduanya)
OPENAI_API_KEY=""
GROQ_API_KEY=""
```

---

## 🚀 Langkah Instalasi & Menjalankan

### 1. Install Dependencies
```bash
npm install
```

### 2. Push Schema ke Database Neon
Pastikan `DATABASE_URL` pada `.env` sudah mengarah ke database Neon Anda, lalu jalankan:
```bash
npx prisma db push
```
Perintah ini akan membuat seluruh tabel yang dibutuhkan (`User`, `Account`, `MaganghubCredential`, `GithubRepo`, `Report`, `SubmitLog`, `AutomationConfig`).

### 3. Generate Prisma Client
```bash
npx prisma generate
```

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

## 📖 Panduan Penggunaan

### 1. Registrasi Akun
1. Buka `http://localhost:3000/register`.
2. Masukkan Nama, Email, dan Password.
3. Atau klik tombol **Masuk dengan GitHub** di halaman Login.

### 2. Konfigurasi Kredensial MagangHub
1. Masuk ke menu **Pengaturan & Bot** (`/settings`).
2. Pada bagian **Kredensial MagangHub (SSO Kemnaker)**, masukkan email dan password akun Kemnaker yang Anda gunakan untuk login ke portal Monev MagangHub.
3. Klik **Simpan Kredensial**. Password Anda akan langsung dienkripsi menggunakan AES-256-GCM sebelum masuk ke database.

### 3. Hubungkan Repository GitHub
1. Pada menu **Pengaturan & Bot** -> bagian **GitHub Repositories**.
2. Masukkan nama repository yang sedang Anda kerjakan dengan format `owner/repo` (contoh: `facebook/react` atau URL GitHub) dan tentukan nama branch (default: `main`).
3. Klik **Tambah Repo**. Anda dapat menghubungkan lebih dari satu repository.

### 4. Pilihan Mode Automasi:

#### Opsi A: Manual Submit (Tanpa Server Tambahan)
1. Buka menu **Laporan Harian** (`/reports`).
2. Klik tombol **Generate AI** untuk merangkum commit hari ini menjadi draf laporan 3 bagian.
3. Anda dapat mengedit isi uraian, pembelajaran, dan kendala (tersedia live counter memastikan masing-masing ≥ 100 karakter).
4. Klik **Simpan Draft** atau buka **Dashboard** lalu tekan tombol **Submit Kehadiran Sekarang**.

#### Opsi B: Automasi Terjadwal (Cron VPS / Railway)
1. Buka menu **Pengaturan & Bot** -> bagian **Metode Eksekusi & Automasi**.
2. Nyalakan switch toggle **Automasi Terjadwal**.
3. Tentukan jam target submit (contoh: `13:50` WIB).
4. Salin perintah `curl` atau konfigurasi `crontab` yang tertera pada kotak **Webhook Endpoint Token**:
   ```bash
   # Contoh crontab di VPS Linux (crontab -e)
   50 13 * * 1-6 curl -s -X POST https://domain-anda.com/api/cron/trigger \
     -H "Authorization: Bearer <TOKEN_WEBHOOK_ANDA>" >> /var/log/maganghub.log 2>&1
   ```
5. Bot di VPS akan memanggil endpoint web app setiap Senin-Sabtu jam 13:50 WIB. Web app akan otomatis mengambil commit, menghasilkan laporan, login ke SSO Kemnaker, dan mengirimkan absensi.

---

## 📡 API Endpoints

| Method | Endpoint | Deskripsi | Autentikasi |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/cron/trigger` | Trigger eksekusi harian untuk user pemilik webhook | Header `Authorization: Bearer <webhookKey>` |
| `GET` | `/api/github/commits` | Ambil daftar commit hari ini dari tracked repos | Session Cookie (Auth.js) |
| `GET/POST` | `/api/auth/[...nextauth]` | Endpoint autentikasi Auth.js v5 | Public / OAuth Callback |

---

## 🧪 Testing & Verifikasi

Proyek dilengkapi dengan pengujian unit otomatis menggunakan Vitest:

```bash
# Menjalankan seluruh unit test
npm test

# Typecheck TypeScript
npm run typecheck

# Production Build check
npm run build
```

Cakupan pengujian:
- `src/lib/crypto.test.ts`: Validasi enkripsi/dekripsi AES-256-GCM, IV unik, dan anti-tamper.
- `src/lib/ai.test.ts`: Validasi sintesis teks dan enforcement minimal 100 karakter per bagian.
- `src/lib/github.test.ts`: Validasi pembersihan commit message dan filter merge commit.
- `src/lib/activity-extractor.test.ts`: Validasi pengelompokan aktivitas developer.
- `src/lib/maganghub-api.test.ts`: Validasi struktur client HTTP dan error handling.

---

## 🔒 Lisensi & Privasi

Proyek ini dibangun untuk kebutuhan internal peserta magang programmer Kemnaker. Kredensial SSO Kemnaker pengguna dienkripsi secara simetris dan tidak pernah dibagikan kepada pihak ketiga.
