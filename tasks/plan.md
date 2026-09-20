# tasks/plan.md — MagangHub Bot Attendance

> Phase 2: Technical Architecture & Dependency Mapping
> Arsitektur: Pure HTTP Client (Direct REST API, Zero Browser) + User-Choice Automation (Manual / External Cron VPS/Railway).

---

## Dependency Graph

```
Layer 0 — Foundation
  ├── Project Init (Next.js 16.3.5, Tailwind v4, Prisma, PostgreSQL di Neon)
  ├── Design Tokens (globals.css @theme dari DESIGN.md)
  └── Encryption Module (lib/crypto.ts, AES-256-GCM)

Layer 1 — Auth
  ├── Prisma Schema (User, Account, Session)
  ├── NextAuth v5 config (GitHub OAuth + credentials)
  └── Auth middleware (protected routes)
  depends: Layer 0

Layer 2 — Credential & Automation Config
  ├── MaganghubCredential model + encrypt/decrypt
  ├── GithubRepo model + GitHub OAuth scope
  ├── AutomationConfig model (toggle isEnabled, unique webhookKey)
  └── Settings UI (MagangHub, GitHub, Automation/Cron pages)
  depends: Layer 1

Layer 3 — Data Ingestion
  ├── GitHub API client (fetch commits per day per repo)
  ├── Vault log parser (read session logs from GitHub repo)
  └── Source selector logic (GITHUB | VAULT | MANUAL)
  depends: Layer 2

Layer 4 — Report Generation
  ├── Report model (CRUD)
  ├── AI summarization (commits → 3-section report)
  ├── Report review/edit UI
  └── Manual report creation
  depends: Layer 3

Layer 5 — Direct REST API Client & Submit
  ├── MagangHub Direct API client (lib/maganghub-api.ts, SSO login + token exchange + submit)
  ├── 1-Click Manual Submit action & UI
  ├── User Webhook Endpoint (POST /api/cron/trigger with user secret key)
  └── Submit status tracking (SubmitLog)
  depends: Layer 4, Layer 2

Layer 6 — Dashboard & Monitoring
  ├── Calendar grid (monthly attendance view)
  ├── Report history table
  ├── Status panel (MagangHub + GitHub connection)
  ├── Webhook curl setup guide (for user crontab/VPS/Railway)
  └── Submit log table
  depends: Layer 4, Layer 5

Layer 7 — Admin
  ├── Admin dashboard (aggregate stats)
  ├── User management table
  └── Force re-submit action
  depends: Layer 6
```

---

## Vertical Slices

| Slice | Scope | Layers |
| :--- | :--- | :--- |
| S1: Foundation + Auth | Init project, tokens, auth flow complete | L0 + L1 |
| S2: Credential & Automation | MagangHub creds + GitHub repo + Webhook automation UI | L2 |
| S3: GitHub Ingestion | Fetch commits, preview raw data | L3 |
| S4: Report Generation | AI generate + CRUD + review UI | L4 |
| S5: Direct API & Submit | Direct HTTP client + 1-Click Submit + Webhook trigger | L5 |
| S6: Dashboard & Logs | Calendar, history, curl box, submit logs | L6 |
| S7: Admin | Admin panel, user management, force submit | L7 |

---

## API Contract (Key Endpoints)

### Auth
- `GET/POST /api/auth/[...nextauth]` — NextAuth handlers

### MagangHub Credential
- `POST /api/maganghub/save` — Save encrypted credential
- `POST /api/maganghub/test` — Test direct login ke SSO Kemnaker & Monev API
- `DELETE /api/maganghub/delete` — Remove credential

### GitHub
- `GET /api/github/repos` — List user's GitHub repos
- `POST /api/github/repos/track` — Track a repo
- `GET /api/github/commits?repo=X&date=Y` — Fetch commits for date

### Reports
- `GET /api/reports` — List user reports (paginated)
- `GET /api/reports/[id]` — Get single report
- `POST /api/reports/generate` — Generate report from commits
- `PATCH /api/reports/[id]` — Edit report
- `DELETE /api/reports/[id]` — Delete draft report

### Submit & Automation
- `POST /api/maganghub/submit` — 1-Click Manual submit dari dashboard
- `POST /api/cron/trigger` — Webhook endpoint per-user (dijalankan dari crontab VPS / Railway / curl)
  - Headers: `Authorization: Bearer <USER_WEBHOOK_KEY>`
  - Action: auto-generate (jika belum ada) + auto-submit via Direct API

### Admin
- `GET /api/admin/users` — List all users + status
- `GET /api/admin/stats` — Aggregate statistics
- `POST /api/admin/force-submit` — Force submit for user

---

## Risk Assessment

| Risk | Impact | Mitigation |
| :--- | :--- | :--- |
| SSO Kemnaker session expired / flow change | Login gagal | Deteksi error granular (invalid creds vs SSO down), logging lengkap |
| Credential leak | Critical security | AES-256-GCM, env-only key, never log/return decrypted values |
| AI generates bad report | Laporan <100 char / tidak baku | Validasi panjang karakter per bagian, fallback retry |
| GitHub API rate limit | Commits fetch fails | Cache commits per (repo, date), batch requests |
| Webhook abuse / brute-force | Unauthorized submit | CUID2/UUID token acak, rate limiting per token |

---

## Key Technical Decisions

1. **Direct HTTP REST API over Browser Automation**: Zero Chromium/Playwright. Ringan (<1 MB), cepat (<1 detik), bebas timeout Vercel, serverless-native.
2. **User-Choice Automation Model**:
   - Manual submit: 0 server eksternal, cukup buka web app.
   - Automasi: User dapat webhook URL unik untuk dipasang di crontab VPS pribadi, Railway cron, GitHub Actions, atau cron-job.org.
3. **Server Actions over API Routes** untuk mutasi UI internal; API Routes murni untuk webhook eksternal (`/api/cron/trigger`) dan OAuth callback.
4. **Single Encryption Key** via `ENCRYPTION_KEY` env var dengan AES-256-GCM (IV acak 12-byte per row).
