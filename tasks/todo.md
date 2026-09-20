# tasks/todo.md — MagangHub Bot Attendance

> Phase 3: Actionable Task Breakdown
> Arsitektur: Pure HTTP Client (Direct REST API, Zero Browser) + User-Choice Automation (Manual / External Cron VPS/Railway).
> Setiap task max ~5 files. Acceptance criteria + verification command.

---

## Slice 1: Foundation + Auth

### Task 1.1 — Project Init & Design Tokens [x]
- **Deskripsi**: Init Next.js 16.3.5 App Router + TypeScript + Tailwind v4 + Prisma (PostgreSQL Neon). Setup `globals.css` dengan `@theme inline` dari DESIGN.md. Install axios.
- **Files**: `package.json`, `src/app/globals.css`, `src/app/layout.tsx`, `prisma/schema.prisma`
- **Acceptance Criteria**:
  - [x] `npm dev` / `npm build` berjalan tanpa error.
  - [x] Semua design token dari DESIGN.md terpetakan di `@theme inline`.
  - [x] shadcn/ui primitives terpasang mengikuti token Supabase dark.
- **Verification**: `npm run build && npm run typecheck`
- **Dependencies**: Tidak ada

### Task 1.2 — Prisma Schema (Full Database Model) [x]
- **Deskripsi**: Definisikan seluruh model Prisma sesuai SPEC.md section 7: User, Account, Session, MaganghubCredential, GithubRepo, Report, SubmitLog, AutomationConfig + semua enum.
- **Files**: `prisma/schema.prisma`
- **Acceptance Criteria**:
  - [x] Schema valid, `npx prisma validate` & `generate` sukses.
  - [x] Model `AutomationConfig` mencakup `isEnabled`, `webhookKey` (unique), dan preference fields.
  - [x] Enum Role, CredentialStatus, SourceType, ReportStatus, SubmitStatus, TriggerType terdefinisi.
- **Verification**: `npx prisma validate`
- **Dependencies**: 1.1

### Task 1.3 — Encryption Module (AES-256-GCM) [x]
- **Deskripsi**: Implementasi `lib/crypto.ts` dengan AES-256-GCM menggunakan native `node:crypto`. Fungsi `encrypt(plaintext)` dan `decrypt(encrypted, iv, authTag)`.
- **Files**: `src/lib/crypto.ts`, `src/lib/crypto.test.ts`
- **Acceptance Criteria**:
  - [x] Encrypt → decrypt round-trip menghasilkan string asli.
  - [x] Setiap encrypt menghasilkan IV unik 12-byte (non-deterministic).
  - [x] Auth tag 16-byte diverifikasi saat decrypt (tamper-proof).
  - [x] Key divalidasi 32-byte dari `ENCRYPTION_KEY`.
- **Verification**: `npx vitest run src/lib/crypto.test.ts` (5/5 passed)
- **Dependencies**: 1.1

### Task 1.4 — NextAuth v5 Setup (GitHub OAuth + Credentials) [x]
- **Deskripsi**: Setup NextAuth v5 dengan Prisma adapter. GitHub OAuth (dengan scope repo) + credentials provider. Proxy protected routes.
- **Files**: `src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/proxy.ts`, `.env.example`
- **Acceptance Criteria**:
  - [x] GitHub OAuth login flow berfungsi.
  - [x] Credentials login (email+password hash) berfungsi.
  - [x] Session tersimpan di database PostgreSQL.
  - [x] Role (ADMIN/USER) tersedia di session user.
  - [x] Protected route `/dashboard/*` redirect ke `/login` jika belum auth.
- **Verification**: `npm run build && npm run typecheck`
- **Dependencies**: 1.2

### Task 1.5 — Auth Pages (Login & Register) [x]
- **Deskripsi**: Halaman login & register menggunakan token Supabase dark. Tombol GitHub OAuth + form email/password.
- **Files**: `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx`, `src/app/(auth)/layout.tsx`
- **Acceptance Criteria**:
  - [x] Visual dark-first sesuai DESIGN.md (near black canvas `#171717`, border `#2e2e2e`, emerald CTA `#3ecf8e`).
  - [x] Client validation Zod.
  - [x] Error alert jika login salah.
- **Verification**: `npm run build && npm run typecheck`
- **Dependencies**: 1.4

---

**🔍 CHECKPOINT 1**: Auth flow lengkap. User bisa login GitHub / email, session tersimpan, protected dashboard route aktif.

---

## Slice 2: Credential & Automation Settings

### Task 2.1 — Dashboard Shell (Sidebar + Topbar) [x]
- **Deskripsi**: Layout responsif dengan sidebar navigation dan header. Link: Dashboard, Reports, Settings, Admin (jika role ADMIN).
- **Files**: `src/app/(dashboard)/layout.tsx`, `src/components/sidebar.tsx`, `src/components/topbar.tsx`
- **Acceptance Criteria**:
  - [x] Mobile drawer menu + desktop fixed sidebar.
  - [x] Active link styling dengan emerald accent.
  - [x] User menu dropdown di topbar (profil & sign out).
- **Verification**: `npm run build && npm run typecheck`
- **Dependencies**: 1.5

### Task 2.2 — MagangHub Credential Settings [x]
- **Deskripsi**: Form input kredensial MagangHub (email + password). Simpan terenkripsi AES-256-GCM.
- **Files**: `src/app/(dashboard)/settings/page.tsx`, `src/components/maganghub-credential-card.tsx`, `src/app/(dashboard)/settings/actions.ts`
- **Acceptance Criteria**:
  - [x] Password input dengan toggle show/hide, tidak pernah di-return plaintext.
  - [x] Simpan encryptedEmail, encryptedPassword, iv, authTag ke DB.
  - [x] Status badge: UNCHECKED, VALID, INVALID, EXPIRED.
- **Verification**: `npm run build && npm run typecheck`
- **Dependencies**: 1.3, 2.1

### Task 2.3 — GitHub Repo Settings [x]
- **Deskripsi**: Komponen untuk menghubungkan repo yang di-track. List repo, toggle track/untrack, hapus.
- **Files**: `src/components/github-repo-card.tsx`, `src/lib/github.ts`, `src/app/(dashboard)/settings/actions.ts`
- **Acceptance Criteria**:
  - [x] Input repo owner/repo atau URL.
  - [x] Simpan repo aktif ke tabel `GithubRepo`.
  - [x] Pilihan branch aktif (default: main).
- **Verification**: `npm run build && npm run typecheck`
- **Dependencies**: 2.1

### Task 2.4 — Automation & Webhook Settings (User-Choice) [x]
- **Deskripsi**: Konfigurasi pilihan automasi. Toggle automasi aktif/non-aktif, generate/regenerate Webhook Key, dan box instruksi crontab curl untuk VPS/Railway.
- **Files**: `src/app/(dashboard)/settings/page.tsx`, `src/components/webhook-curl-box.tsx`, `src/components/automation-config-card.tsx`
- **Acceptance Criteria**:
  - [x] Toggle: "Aktifkan Automasi Eksternal".
  - [x] Tampilkan Webhook Key rahasia dengan tombol Copy & Regenerate.
  - [x] Component `webhook-curl-box`: Menampilkan perintah curl siap pakai untuk crontab Linux/VPS atau HTTP request di Railway.
  - [x] Pilihan auto-generate draft jika belum ada saat webhook dipanggil.
- **Verification**: `npm run build && npm run typecheck`
- **Dependencies**: 2.1

---

**🔍 CHECKPOINT 2**: Pengaturan lengkap (Kredensial MagangHub aman, GitHub repos terhubung, Webhook curl siap pakai untuk VPS/Railway).

---

## Slice 3: GitHub Commits Ingestion

### Task 3.1 — GitHub Commits Fetcher [x]
- **Deskripsi**: Module `lib/github.ts` untuk mengambil commit messages hari ini dari repo yang di-track.
- **Files**: `src/lib/github.ts`, `src/lib/github.test.ts`
- **Acceptance Criteria**:
  - [x] Ambil commits berdasarkan rentang tanggal hari ini (UTC / Asia/Jakarta).
  - [x] Filter commits berdasarkan author (user yang bersangkutan).
  - [x] Menggabungkan commit messages dari multiple active repos jika ada.
  - [x] Format clean commit messages (hapus noise, merge commits).
- **Verification**: `npx vitest run src/lib/github.test.ts`
- **Dependencies**: 2.3

### Task 3.2 — Commits Live Preview UI [x]
- **Deskripsi**: Preview commits hari ini langsung di dashboard / halaman generate.
- **Files**: `src/components/commits-preview.tsx`, `src/app/api/github/commits/route.ts`
- **Acceptance Criteria**:
  - [x] Menampilkan list commit messages hari ini, repo, sha ringkas, dan timestamp.
  - [x] Empty state ramah jika belum ada commit hari ini ("Belum ada aktivitas commit").
- **Verification**: `npm run build && npm run typecheck`
- **Dependencies**: 3.1

---

## Slice 4: AI Report Generation

### Task 4.1 — AI Summarization Module [x]
- **Deskripsi**: Module `lib/ai.ts` untuk mensintesis kumpulan commit messages menjadi narasi baku laporan MagangHub 3 bagian.
- **Files**: `src/lib/ai.ts`, `src/lib/ai.test.ts`
- **Acceptance Criteria**:
  - [x] Input array commit messages → Output `{ activity_log, lesson_learned, obstacles }`.
  - [x] Format baku bahasa Indonesia non-teknis (tanpa function name / code jargon).
  - [x] Karakter tiap bagian dijamin ≥ 100 karakter (enforced by code check/padding).
  - [x] Fallback graceful jika API AI down/rate-limit.
- **Verification**: `npx vitest run src/lib/ai.test.ts` (4/4 passed)
- **Dependencies**: 3.1

### Task 4.2 — Report CRUD & Review Interface [x]
- **Deskripsi**: Halaman riwayat laporan (`/reports`) dan form editor dengan live character counter.
- **Files**: `src/app/(dashboard)/reports/page.tsx`, `src/components/report-form.tsx`, `src/app/(dashboard)/reports/actions.ts`
- **Acceptance Criteria**:
  - [x] Tombol "Generate AI" (menghasilkan draft baru via AI).
  - [x] Edit form 3 textarea dengan live character counter (indikator hijau saat ≥100 char).
  - [x] Status flow: DRAFT → READY → SUBMITTED / FAILED.
  - [x] Simpan Draft ke database.
- **Verification**: `npm run build && npm run typecheck`
- **Dependencies**: 4.1, 3.2

---

**🔍 CHECKPOINT 3**: Siklus laporan lengkap (Ambil commit → Sintesis AI → Review/Edit 3 bagian → Simpan status Ready).

---

## Slice 5: Direct REST API Client & Submit

### Task 5.1 — Direct HTTP Client MagangHub [x]
- **Deskripsi**: Module `lib/maganghub-api.ts` menggunakan Axios untuk autentikasi SSO Kemnaker dan submit ke API Monev MagangHub (zero browser).
- **Files**: `src/lib/maganghub-api.ts`, `src/lib/maganghub-api.test.ts`
- **Acceptance Criteria**:
  - [x] `login(username, password)`: Jalankan flow SSO → return Bearer access token Monev.
  - [x] `submitDailyLog(token, payload)`: POST ke `/attendances/with-daily-log`.
  - [x] Handle error: password salah, sesi expired, server error dengan pesan jelas.
  - [x] Respon cepat (< 2 detik).
- **Verification**: `npx vitest run src/lib/maganghub-api.test.ts` (2/2 passed)
- **Dependencies**: 1.3

### Task 5.2 — 1-Click Manual Submit (UI Action) [x]
- **Deskripsi**: Tombol submit langsung dari halaman detail laporan / dashboard.
- **Files**: `src/lib/submit-orchestrator.ts`, `src/app/(dashboard)/reports/actions.ts`
- **Acceptance Criteria**:
  - [x] Tombol "Submit ke MagangHub" dengan konfirmasi dialog.
  - [x] Loading state instan & toast feedback.
  - [x] Menyimpan status `SUBMITTED` dan record di `SubmitLog`.
- **Verification**: `npm run build && npm run typecheck`
- **Dependencies**: 5.1, 4.2

### Task 5.3 — Webhook Trigger Endpoint (Untuk VPS / Railway / Crontab) [x]
- **Deskripsi**: Public API endpoint yang di-trigger via HTTP POST dengan Header Bearer token milik user.
- **Files**: `src/app/api/cron/trigger/route.ts`
- **Acceptance Criteria**:
  - [x] Validasi `Authorization: Bearer <USER_...Y>`.
  - [x] Cek apakah `automation.isEnabled === true`.
  - [x] Jika belum ada laporan hari ini dan `autoGenerate === true`: fetch commits → generate AI → create report.
  - [x] Dekripsi kredensial MagangHub → submit via Direct API.
  - [x] Record hasil ke `SubmitLog` dengan `triggeredBy: CRON_WEBHOOK`.
  - [x] Return status JSON `{ success: true, message: "..." }`.
- **Verification**: `npm run build && npm run typecheck`
- **Dependencies**: 5.1, 5.2, 4.1

---

**🔍 CHECKPOINT 4**: Pipeline submit selesai 100%. Manual 1-klik jalan, webhook untuk VPS/Railway crontab jalan, zero browser.

---

## Slice 6: Dashboard, Monitoring & Logs

### Task 6.1 — Attendance Calendar Grid [x]
- **Deskripsi**: Tampilan kalender bulanan interaktif status absensi di dashboard home.
- **Files**: `src/app/(dashboard)/calendar/page.tsx`, `src/components/calendar-grid.tsx`
- **Acceptance Criteria**:
  - [x] Grid 1 bulan dengan status warna (Hijau=Submitted, Merah=Gagal, Kuning=Draft/Ready, Abu=Libur).
  - [x] Klik tanggal → buka modal / link ke laporan tanggal tersebut.
  - [x] Ringkasan statistik kehadiran bulan aktif.
- **Verification**: `npm run build && npm run typecheck`
- **Dependencies**: 4.2, 5.2

### Task 6.2 — Activity & Submit Log Table [x]
- **Deskripsi**: Tabel log audit setiap percobaan submit (manual maupun webhook cron).
- **Files**: `src/components/submit-logs-feed.tsx`, `src/app/(dashboard)/dashboard/page.tsx`
- **Acceptance Criteria**:
  - [x] List riwayat: Waktu, Mode (Manual/Webhook), Status (Success/Failed), HTTP code, Pesan server.
  - [x] Status badge semantik (Hijau / Merah / Kuning).
- **Verification**: `npm run build && npm run typecheck`
- **Dependencies**: 5.2, 5.3

---

## Slice 7: Admin Panel

### Task 7.1 — Admin User Management & Stats [x]
- **Deskripsi**: Dashboard admin untuk monitoring user terdaftar dan status submit harian.
- **Files**: `src/app/(dashboard)/admin/page.tsx`
- **Acceptance Criteria**:
  - [x] Metrik agregat: total user, laporan hari ini, success rate.
  - [x] Tabel user: Nama, email, status kredensial MagangHub, status automasi, last submit.
  - [x] Role guard ketat (hanya role ADMIN yang bisa akses).
- **Verification**: `npm run build && npm run typecheck`
- **Dependencies**: 6.1, 6.2

---

**🔍 CHECKPOINT 5 (Final)**: Seluruh fitur terintegrasi. Full regression test & production build clean.

---

## Summary

| Slice | Tasks | Est. Files |
| :--- | :--- | :--- |
| S1: Foundation + Auth | 1.1 – 1.5 | ~12 |
| S2: Credential & Automation | 2.1 – 2.4 | ~8 |
| S3: GitHub Ingestion | 3.1 – 3.2 | ~4 |
| S4: Report Generation | 4.1 – 4.2 | ~5 |
| S5: Direct REST API & Submit | 5.1 – 5.3 | ~5 |
| S6: Dashboard & Logs | 6.1 – 6.2 | ~4 |
| S7: Admin Panel | 7.1 | ~2 |
| **Total** | **17 tasks** | **~40 files** |
