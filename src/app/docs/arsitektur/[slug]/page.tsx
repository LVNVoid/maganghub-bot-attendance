import {
  DocsPage,
  DocsTitle,
  DocsDescription,
  DocsBody,
} from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ShieldCheck, Database, Layers, Lock, Zap } from "lucide-react";

interface ArchitecturePageProps {
  params: Promise<{ slug: string }>;
}

const ARCHITECTURE_DOCS: Record<
  string,
  {
    title: string;
    description: string;
    prev?: { title: string; href: string };
    next?: { title: string; href: string };
    content: React.ReactNode;
  }
> = {
  sistem: {
    title: "Arsitektur Sistem (Simple Scalable Architecture)",
    description: "Pola arsitektur, pemisahan layer kode, dan prinsip skalabilitas yang diterapkan pada MagangHub Bot.",
    prev: { title: "7. Riwayat & Hapus Draft", href: "/docs/panduan/riwayat-laporan" },
    next: { title: "API Webhook & Keamanan", href: "/docs/arsitektur/api-keamanan" },
    content: (
      <>
        <h2>Prinsip Simple Scalable Architecture (SSA)</h2>
        <p>
          Aplikasi ini dibangun menggunakan pola Simple Scalable Architecture (SSA) pada Next.js App Router dengan pemisahan tanggung jawab (Separation of Concerns) yang ketat dan bebas dari tipe <code>any</code>:
        </p>

        <div className="space-y-3 my-4 not-prose">
          <div className="p-4 rounded-md border border-hairline bg-surface space-y-1">
            <div className="flex items-center gap-2 text-primary font-semibold text-xs">
              <Layers className="w-4 h-4" />
              <span>1. Layer Actions (<code>src/actions/</code>)</span>
            </div>
            <p className="text-xs text-ink-secondary">
              Berfungsi sebagai gerbang Server Actions publik. Bertugas memvalidasi input via Zod, memverifikasi sesi autentikasi, memanggil service layer, dan memicu <code>revalidatePath</code>. Tidak mengandung query database langsung.
            </p>
          </div>

          <div className="p-4 rounded-md border border-hairline bg-surface space-y-1">
            <div className="flex items-center gap-2 text-primary font-semibold text-xs">
              <Database className="w-4 h-4" />
              <span>2. Layer Services (<code>src/services/</code>)</span>
            </div>
            <p className="text-xs text-ink-secondary">
              Berisi query Prisma Client dan pemrosesan data murni. Terisolasi dari objek request/response HTTP sehingga mudah diuji dan digunakan kembali di route handlers maupun cron scripts.
            </p>
          </div>

          <div className="p-4 rounded-md border border-hairline bg-surface space-y-1">
            <div className="flex items-center gap-2 text-primary font-semibold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>3. Layer Schemas (<code>src/schemas/</code>)</span>
            </div>
            <p className="text-xs text-ink-secondary">
              Sumber kebenaran tunggal (Single Source of Truth) untuk validasi skema form dan domain entity menggunakan Zod. Menghasilkan tipe TypeScript otomatis (<code>z.infer</code>).
            </p>
          </div>

          <div className="p-4 rounded-md border border-hairline bg-surface space-y-1">
            <div className="flex items-center gap-2 text-primary font-semibold text-xs">
              <Zap className="w-4 h-4" />
              <span>4. Layer Lib &amp; Utils (<code>src/lib/</code> &amp; <code>src/utils/</code>)</span>
            </div>
            <p className="text-xs text-ink-secondary">
              Berisi klien eksternal (Axios HTTP client untuk portal Kemnaker, GitHub API client, modul AI synthesizer, kriptografi AES-256-GCM, dan fungsi styling <code>cn</code>).
            </p>
          </div>
        </div>

        <h2>Database &amp; Prisma ORM v7</h2>
        <p>
          Aplikasi menggunakan <strong>Prisma ORM v7.10.0</strong> dengan driver adapter <code>@prisma/adapter-pg</code> dan file konfigurasi <code>prisma.config.ts</code>. Skema database di-deploy ke serverless PostgreSQL di Neon dengan connection pooling otomatis.
        </p>

        <h2>Zero Browser Automation</h2>
        <p>
          Berbeda dengan bot konvensional yang menggunakan Chromium/Puppeteer (yang memakan RAM 500MB+ per sesi), bot ini menggunakan <strong>Direct REST API</strong> ke SSO Kemnaker dan Monev API. Setiap request submit hanya membutuhkan waktu beberapa ratus milidetik dan konsumsi memori kurang dari 50MB.
        </p>
      </>
    ),
  },
  "api-keamanan": {
    title: "API Webhook & Keamanan Enkripsi",
    description: "Spesifikasi endpoint cron webhook, proteksi rate limiting, dan standar enkripsi kredensial.",
    prev: { title: "Arsitektur Sistem (SSA)", href: "/docs/arsitektur/sistem" },
    content: (
      <>
        <h2>Endpoint Webhook Cron</h2>
        <p>
          Endpoint <code>POST /api/cron/trigger</code> digunakan oleh scheduler eksternal untuk memicu submit harian.
        </p>

        <div className="bg-canvas-deep border border-hairline rounded-md p-4 space-y-2 my-4 text-xs font-mono">
          <div><span className="text-primary font-bold">POST</span> /api/cron/trigger</div>
          <div className="text-ink-secondary">Header: Authorization: Bearer &lt;webhookKey&gt;</div>
          <div className="text-ink-secondary">Content-Type: application/json</div>
        </div>

        <h3>Respon Sukses (HTTP 200)</h3>
        <pre className="bg-canvas-deep p-3 rounded text-xs font-mono my-2 text-ink-primary border border-hairline">
{`{
  "success": true,
  "message": "Laporan harian berhasil dikirim ke Monev MagangHub",
  "httpCode": 200,
  "user": "Elvien",
  "date": "2026-09-20"
}`}
        </pre>

        <h3>Respon Konflik / Presensi Sudah Ada (HTTP 409)</h3>
        <pre className="bg-canvas-deep p-3 rounded text-xs font-mono my-2 text-ink-primary border border-hairline">
{`{
  "success": false,
  "message": "Presensi sudah ada",
  "httpCode": 409,
  "user": "Elvien",
  "date": "2026-09-20"
}`}
        </pre>

        <h2>Mekanisme Proteksi &amp; Keamanan</h2>
        <div className="space-y-3 my-4 not-prose">
          <div className="p-4 rounded-md border border-hairline bg-surface space-y-1">
            <div className="flex items-center gap-2 text-primary font-semibold text-xs">
              <Lock className="w-4 h-4" />
              <span>Enkripsi AES-256-GCM</span>
            </div>
            <p className="text-xs text-ink-secondary">
              Kunci enkripsi simetris 256-bit (<code>ENCRYPTION_KEY</code>) digunakan untuk mengenkripsi kata sandi akun Kemnaker dan API Key pengguna. Setiap enkripsi menggunakan IV 96-bit yang di-generate secara acak serta authentication tag 128-bit untuk mencegah pemalsuan data ciphertext.
            </p>
          </div>

          <div className="p-4 rounded-md border border-hairline bg-surface space-y-1">
            <div className="flex items-center gap-2 text-primary font-semibold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>Sliding Window Rate Limiter</span>
            </div>
            <p className="text-xs text-ink-secondary">
              Endpoint <code>/api/cron/trigger</code> dibatasi maksimal 10 permintaan per menit per alamat IP. Permintaan yang melebihi kuota akan menerima respon HTTP 429 Too Many Requests.
            </p>
          </div>

          <div className="p-4 rounded-md border border-hairline bg-surface space-y-1">
            <div className="flex items-center gap-2 text-primary font-semibold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>HTTP Security Headers</span>
            </div>
            <p className="text-xs text-ink-secondary">
              Aplikasi dilengkapi dengan security headers lengkap (HSTS, <code>X-Frame-Options: DENY</code>, <code>X-Content-Type-Options: nosniff</code>, <code>Referrer-Policy</code>, dan <code>poweredByHeader: false</code>).
            </p>
          </div>
        </div>
      </>
    ),
  },
};

export default async function ArchitectureDetailPage({
  params,
}: ArchitecturePageProps) {
  const { slug } = await params;
  const doc = ARCHITECTURE_DOCS[slug];

  if (!doc) {
    notFound();
  }

  return (
    <DocsPage>
      <DocsTitle>{doc.title}</DocsTitle>
      <DocsDescription>{doc.description}</DocsDescription>

      <DocsBody>{doc.content}</DocsBody>

      <div className="mt-12 pt-6 border-t border-hairline flex items-center justify-between">
        {doc.prev ? (
          <Link
            href={doc.prev.href}
            className="inline-flex items-center gap-1.5 text-xs text-ink-secondary hover:text-ink-primary"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{doc.prev.title}</span>
          </Link>
        ) : (
          <div />
        )}

        {doc.next ? (
          <Link
            href={doc.next.href}
            className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
          >
            <span>{doc.next.title}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        ) : (
          <div />
        )}
      </div>
    </DocsPage>
  );
}
