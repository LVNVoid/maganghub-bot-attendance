"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application runtime error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-5 bg-canvas-subtle border border-hairline rounded-md p-8">
        <div className="w-12 h-12 rounded-full bg-error/10 border border-error/20 flex items-center justify-center mx-auto text-error">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h1 className="text-lg font-semibold text-ink-primary">
            Terjadi Kesalahan
          </h1>
          <p className="text-xs text-ink-secondary">
            Sistem mengalami kendala saat memproses permintaan Anda.
          </p>
        </div>
        <Button
          onClick={() => reset()}
          variant="outline"
          size="sm"
          className="gap-2 text-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Coba Lagi
        </Button>
      </div>
    </div>
  );
}
