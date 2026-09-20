import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-5 bg-canvas-subtle border border-hairline rounded-md p-8">
        <div className="w-12 h-12 rounded-full bg-surface border border-hairline flex items-center justify-center mx-auto text-ink-muted">
          <FileQuestion className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h1 className="text-lg font-semibold text-ink-primary">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-xs text-ink-secondary">
            Halaman yang Anda cari tidak ada atau telah dipindahkan.
          </p>
        </div>
        <Link href="/dashboard" className="inline-block">
          <Button variant="emerald" size="sm" className="gap-2 text-xs">
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
