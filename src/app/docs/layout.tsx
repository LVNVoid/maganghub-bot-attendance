import Link from "next/link";
import { Bot, ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Dokumentasi | MagangHub Bot Attendance",
  description:
    "Panduan lengkap setup kredensial Kemnaker, konfigurasi model AI (BYOK), webhook cron VPS, dan integrasi GitHub untuk bot absensi MagangHub Kemnaker.",
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink-primary">
      {/* Public Header */}
      <header className="sticky top-0 z-40 h-14 border-b border-hairline bg-canvas/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
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

          <nav className="hidden sm:flex items-center gap-4 text-xs font-medium text-ink-secondary">
            <Link
              href="/"
              className="hover:text-ink-primary transition-colors py-1"
            >
              Beranda
            </Link>
            <Link
              href="/#fitur"
              className="hover:text-ink-primary transition-colors py-1"
            >
              Fitur
            </Link>
            <Link
              href="/docs"
              className="text-primary font-semibold py-1 flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Dokumentasi
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="emerald" size="sm" className="gap-1.5 text-xs">
              <span>Buka Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        {children}
      </main>

      {/* Public Footer */}
      <footer className="border-t border-hairline bg-canvas-deep py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-muted">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-primary" />
            <span>MagangHub Bot Attendance &copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-ink-primary transition-colors">
              Beranda
            </Link>
            <Link href="/docs" className="hover:text-ink-primary transition-colors">
              Dokumentasi
            </Link>
            <Link href="/login" className="hover:text-ink-primary transition-colors">
              Masuk
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
