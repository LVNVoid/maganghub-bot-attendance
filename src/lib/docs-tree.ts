import type { Root } from "fumadocs-core/page-tree";

export const docsPageTree: Root = {
  name: "Dokumentasi",
  children: [
    {
      type: "page",
      name: "Pengenalan & Fitur",
      url: "/docs",
    },
    {
      type: "folder",
      name: "Panduan Penggunaan (User Guide)",
      defaultOpen: true,
      children: [
        {
          type: "page",
          name: "1. Registrasi & Login",
          url: "/docs/panduan/registrasi",
        },
        {
          type: "page",
          name: "2. Kredensial MagangHub",
          url: "/docs/panduan/kredensial-maganghub",
        },
        {
          type: "page",
          name: "3. Konfigurasi AI Pribadi (BYOK)",
          url: "/docs/panduan/ai-byok",
        },
        {
          type: "page",
          name: "4. Hubungkan Repository GitHub",
          url: "/docs/panduan/github-repo",
        },
        {
          type: "page",
          name: "5. Submit Laporan & Absensi",
          url: "/docs/panduan/submit-laporan",
        },
        {
          type: "page",
          name: "6. Automasi Terjadwal (Cron VPS)",
          url: "/docs/panduan/automasi-cron",
        },
        {
          type: "page",
          name: "7. Riwayat & Hapus Draft",
          url: "/docs/panduan/riwayat-laporan",
        },
      ],
    },
    {
      type: "folder",
      name: "Arsitektur & Spesifikasi",
      defaultOpen: true,
      children: [
        {
          type: "page",
          name: "Arsitektur Sistem (SSA)",
          url: "/docs/arsitektur/sistem",
        },
        {
          type: "page",
          name: "API Webhook & Keamanan",
          url: "/docs/arsitektur/api-keamanan",
        },
      ],
    },
  ],
};
