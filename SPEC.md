# SPEC.md — MagangHub Bot Attendance

> Platform manajemen absensi dan pengisian laporan harian magang ke portal MagangHub Monev Kemnaker.
> Arsitektur: Pure HTTP Client (Direct REST API, Zero Browser) + User-Choice Automation (Manual / External Cron VPS/Railway).

---

## 1. Objective

Menyediakan web app yang memungkinkan peserta magang Kemnaker (posisi Programmer) untuk:
1. Menghubungkan akun MagangHub Monev mereka (disimpan terenkripsi).
2. Menghubungkan repo GitHub sebagai sumber data aktivitas harian dari commit messages.
3. Secara otomatis men-generate laporan harian (Uraian, Pembelajaran, Kendala >100 karakter) menggunakan AI.
4. Memberikan kebebasan mode eksekusi:
   - **Mode Manual (Default)**: Review dan submit dengan 1-klik dari dashboard web.
   - **Mode Automasi (Opt-in)**: Trigger via webhook/cron dari VPS, Railway worker, GitHub Actions, atau cron external service milik user.
5. Melakukan submit secara instan (< 1 detik) menggunakan **Direct REST API** MagangHub tanpa browser automation / Chromium.

### Success Criteria
- User bisa register, login, dan konfigurasi akun MagangHub + GitHub dalam <5 menit.
- Submit laporan harian berjalan via direct HTTP request dalam < 2 detik.
- User memiliki kontrol penuh apakah ingin automasi (cron) atau manual.
- Credential MagangHub terenkripsi AES-256-GCM di database, tidak pernah plaintext.

---

## 2. Tech Stack

| Layer | Technology |
| :--- | :--- |
| Framework | Next.js 16.3.5 (App Router, TypeScript, React 19) |
| Styling | Tailwind CSS v4 (`@theme inline`), shadcn/ui primitives |
| ORM | Prisma |
| Database | PostgreSQL di Neon (Serverless Postgres) |
| Auth | NextAuth.js v5 (GitHub OAuth + credentials) |
| Encryption | AES-256-GCM (node:crypto) untuk kredensial MagangHub |
| State Management | Zustand (client-side state management) |
| API Client | Axios (Direct HTTP client ke Monev REST API, SSO Kemnaker & GitHub) |
| AI Summarization | OpenAI API / Groq API (sintesis commit messages → laporan) |
| Deploy | Vercel (100% Serverless, tanpa dependency headless browser) |
| External Trigger | Webhook endpoint per-user untuk integrasi cron VPS / Railway |
| Design System | Supabase dark-first (lihat DESIGN.md) |

---

## 3. Commands

```bash
# Development
pnpm dev                    # Next.js dev server
pnpm build                  # Production build
pnpm lint                   # ESLint
pnpm typecheck              # tsc --noEmit

# Database
pnpm db:push                # Prisma push schema
pnpm db:migrate             # Prisma migrate
pnpm db:studio              # Prisma Studio
pnpm db:seed                # Seed data

# Test
pnpm test                   # Vitest unit tests
```

---

## 4. Users & Roles

| Role | Capabilities |
| :--- | :--- |
| **Admin** | Manage semua user, audit submit logs, system statistics, force submit |
| **User** | Manage akun sendiri, konfigurasi MagangHub & GitHub, review/submit laporan, generate webhook key |

---

## 5. Core Features

### 5.1 Authentication & User Management
- GitHub OAuth login (primary, sekaligus meminta scope repo).
- Email + password login (secondary).
- Session persistent via database session (Prisma adapter).

### 5.2 MagangHub Credential Management
- Input email & password MagangHub Monev.
- Penyimpanan aman menggunakan **AES-256-GCM** (IV unik per record, auth tag).
- **Test Connection (Direct API)**: Melakukan handshake login ke SSO Kemnaker dan Monev API untuk verifikasi kredensial aktif tanpa simpan session permanen.
- Status kredensial: `UNCHECKED`, `VALID`, `INVALID`, `EXPIRED`.

### 5.3 Data Source Configuration
- **GitHub Commits (Primary)**:
  - Mengambil daftar repo yang dapat diakses user.
  - User memilih repo aktif yang di-track.
  - Mengambil commit messages hari ini via GitHub REST API.
- **Obsidian Vault Logs (Advanced, opsional)**:
  - User mengarahkan ke repo GitHub vault miliknya untuk membaca file session log harian.

### 5.4 AI Report Generation
- Menerima kumpulan commit messages / log vault hari ini.
- AI (OpenAI / Groq) merangkum sesuai format baku MagangHub:
  1. **Uraian Aktivitas** (`activity_log`): min 100 karakter, bahasa Indonesia formal non-teknis.
  2. **Pembelajaran yang Diperoleh** (`lesson_learned`): min 100 karakter.
  3. **Kendala yang Dialami** (`obstacles`): min 100 karakter.
- Status flow laporan: `DRAFT` → `READY` → `SUBMITTED` / `FAILED`.

### 5.5 Direct REST API MagangHub Client
Tidak menggunakan Playwright / Chromium. Semua operasi menggunakan HTTP requests:
1. `GET https://monev-api.maganghub.kemnaker.go.id/api/v1/auth/login` → Dapatkan SSO Auth URL.
2. `GET` ke SSO URL → Dapatkan `csrf-token` dan cookie `kemnaker_ri_session`.
3. `POST https://account.kemnaker.go.id/auth/login` → Kirim email + password. Dapatkan redirect code.
4. `GET https://monev-api.maganghub.kemnaker.go.id/api/v1/auth/login/callback?code=...` → Dapatkan `access_token` Bearer Monev.
5. `POST https://monev-api.maganghub.kemnaker.go.id/api/v1/attendances/with-daily-log` → Kirim kehadiran & laporan harian:
   ```json
   {
     "date": "YYYY-MM-DD",
     "status": "PRESENT",
     "activity_log": "...",
     "lesson_learned": "...",
     "obstacles": "..."
   }
   ```

### 5.6 Pilihan Automasi User (Manual vs Cron Worker Eksternal)
User bebas memilih cara eksekusi:
- **Opsi A: Manual Submit (Default)**
  - User membuka web app setiap siang/sore, klik "Generate Laporan", review isi teks, lalu klik tombol "Submit ke MagangHub".
  - Tidak memerlukan server, VPS, atau cron tambahan.
- **Opsi B: Automasi Cron Eksternal (Opt-in)**
  - User mengaktifkan toggle "Aktifkan Automasi Eksternal" di menu Settings.
  - Web app menghasilkan **Webhook Trigger URL & Token Unik** untuk user tersebut:
    `POST https://<domain-app>/api/cron/trigger`
    Header: `Authorization: Bearer <USER_WEBHOOK_KEY>`
  - User memasang curl command di:
    - Crontab VPS pribadi (misal: `50 13 * * 1-6 curl -X POST ...`)
    - Cron Worker Railway / Render
    - GitHub Actions schedule workflow
    - Layanan cron-job gratis (cron-job.org, Upstash Cron)
  - Saat webhook dipanggil:
    1. Sistem memverifikasi token user.
    2. Sistem mengambil commits hari ini (jika laporan belum ada, auto-generate via AI).
    3. Sistem langsung submit ke MagangHub via Direct API.
    4. Menyimpan hasil ke `SubmitLog` dan mengirim notifikasi jika diatur.

### 5.7 Dashboard & Monitoring
- **Kalender Kehadiran**: Visual bulanan interaktif (Hijau = Hadir/Tersubmit, Merah = Gagal/Tidak Hadir, Kuning = Ready/Pending, Abu = Libur/Kosong).
- **History Laporan**: Detail riwayat laporan harian yang tersimpan dan status verifikasinya.
- **Submit Logs**: Catatan teknis setiap percobaan submit (timestamp, HTTP response code, error detail jika gagal).

---

## 6. Project Structure (Simple Scalable Architecture)

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Sidebar + topbar layout
│   │   ├── page.tsx                # Dashboard home (kalender & status)
│   │   ├── reports/
│   │   │   ├── page.tsx            # Daftar riwayat laporan
│   │   │   └── [id]/page.tsx       # Review & edit laporan harian
│   │   ├── settings/
│   │   │   ├── page.tsx            # Pengaturan umum & automasi cron
│   │   │   ├── maganghub/page.tsx  # Kredensial MagangHub
│   │   │   └── github/page.tsx     # Konfigurasi repo GitHub
│   │   └── admin/
│   │       ├── page.tsx            # Admin dashboard
│   │       └── users/page.tsx      # Manajemen pengguna
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── cron/trigger/route.ts   # Webhook trigger per-user (VPS / Railway / crontab)
│   │   ├── github/commits/route.ts
│   │   ├── reports/route.ts
│   │   └── maganghub/
│   │       ├── test/route.ts       # Test login Direct API
│   │       └── submit/route.ts     # Manual submit 1-klik
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                         # Primitif UI (Button, Input, Dialog, Badge)
│   ├── calendar-grid.tsx
│   ├── report-card.tsx
│   ├── status-badge.tsx
│   ├── webhook-curl-box.tsx        # Kotak copy-paste curl untuk crontab VPS/Railway
│   └── sidebar.tsx
├── lib/
│   ├── db.ts                       # Prisma client singleton
│   ├── auth.ts                     # NextAuth config
│   ├── crypto.ts                   # AES-256-GCM encrypt/decrypt
│   ├── github.ts                   # GitHub REST API client
│   ├── maganghub-api.ts            # Direct HTTP Client (SSO + Monev REST API)
│   ├── ai.ts                       # AI report generator
│   └── utils.ts
├── types/
│   └── index.ts
└── prisma/
    ├── schema.prisma
    └── seed.ts
```

---

## 7. Database Schema (Prisma)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id             String    @id @default(cuid())
  name           String?
  email          String    @unique
  emailVerified  DateTime?
  image          String?
  password       String?   // Hashed password untuk credentials login
  role           Role      @default(USER)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  accounts       Account[]
  sessions       Session[]
  maganghubCred  MaganghubCredential?
  githubRepos    GithubRepo[]
  reports        Report[]
  submitLogs     SubmitLog[]
  automation     AutomationConfig?
}

model MaganghubCredential {
  id                String   @id @default(cuid())
  userId            String   @unique
  encryptedEmail    String   // AES-256-GCM
  encryptedPassword String   // AES-256-GCM
  iv                String   // Initialization Vector (hex)
  authTag           String   // GCM Authentication Tag (hex)
  status            CredentialStatus @default(UNCHECKED)
  lastCheckedAt     DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model GithubRepo {
  id           String   @id @default(cuid())
  userId       String
  repoFullName String   // "owner/repo"
  branch       String   @default("main")
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([userId, repoFullName])
}

model Report {
  id          String       @id @default(cuid())
  userId      String
  date        DateTime     @db.Date
  activity    String       @db.Text  // Uraian Aktivitas (min 100 char)
  learning    String       @db.Text  // Pembelajaran (min 100 char)
  obstacles   String       @db.Text  // Kendala (min 100 char)
  sourceType  SourceType   @default(GITHUB)
  sourceData  Json?                  // Raw commits metadata yang digunakan
  status      ReportStatus @default(DRAFT)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  user       User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  submitLogs SubmitLog[]
  @@unique([userId, date])
}

model SubmitLog {
  id           String       @id @default(cuid())
  reportId     String?
  userId       String
  status       SubmitStatus
  message      String?      // Error message atau ringkasan response API
  httpCode     Int?
  triggeredBy  TriggerType  @default(MANUAL)
  attempt      Int          @default(1)
  createdAt    DateTime     @default(now())

  report Report? @relation(fields: [reportId], references: [id], onDelete: SetNull)
  user   User    @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model AutomationConfig {
  id           String      @id @default(cuid())
  userId       String      @unique
  isEnabled    Boolean     @default(false) // User toggle: apakah automasi aktif
  webhookKey   String      @unique @default(cuid()) // Secret token unik untuk curl crontab/VPS
  autoGenerate Boolean     @default(true) // Otomatis buat draft jika belum ada sebelum submit
  scheduleTime String      @default("13:50") // Preferensi jam submit
  timezone     String      @default("Asia/Jakarta")
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

enum Role {
  USER
  ADMIN
}

enum CredentialStatus {
  UNCHECKED
  VALID
  INVALID
  EXPIRED
}

enum SourceType {
  GITHUB
  VAULT
  MANUAL
}

enum ReportStatus {
  DRAFT
  READY
  SUBMITTED
  FAILED
}

enum SubmitStatus {
  SUCCESS
  FAILED
  SKIPPED_HOLIDAY
}

enum TriggerType {
  MANUAL
  CRON_WEBHOOK
  ADMIN_FORCE
}
```

---

## 8. Boundaries

### Always
- Gunakan Direct REST API MagangHub (zero browser dependencies).
- Enkripsi kredensial MagangHub dengan AES-256-GCM, jangan pernah log atau return password plaintext.
- User memiliki kendali penuh memilih automasi (cron) atau manual.
- Validasi semua input form dengan Zod di server actions / endpoints.
- Terapkan design tokens Supabase dari `DESIGN.md`.

### Never
- Jangan install Playwright/Puppeteer/Chromium.
- Jangan hardcode warna Tailwind (gunakan CSS variable / theme tokens).
- Jangan menyimpan `ENCRYPTION_KEY` di repository atau database.
