"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { submitReportAction } from "@/actions/report-actions";
import { Send, CheckCircle2, AlertCircle, Loader2, KeyRound } from "lucide-react";

interface QuickSubmitCardProps {
  todayStatus?: string | null;
  hasCredential: boolean;
  todayDate: string;
  isAiReady?: boolean;
  aiModelName?: string;
}

export function QuickSubmitCard({
  todayStatus,
  hasCredential,
  todayDate,
  isAiReady = false,
  aiModelName,
}: QuickSubmitCardProps) {
  const [loading, setLoading] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!hasCredential) {
      toast.error("Harap konfigurasi email & password MagangHub Anda di menu Pengaturan terlebih dahulu.");
      return;
    }

    setLoading(true);

    const res = await submitReportAction();
    if ("error" in res && res.error) {
      toast.error(res.error);
    } else if ("message" in res) {
      if (res.success) {
        setSubmittedSuccess(true);
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    }
    setLoading(false);
  };

  const isSubmitted = todayStatus === "SUBMITTED" || submittedSuccess;

  return (
    <div className="bg-canvas-subtle border border-hairline rounded-md p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="space-y-1.5 sm:space-y-1">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <span className="text-[11px] sm:text-xs font-mono uppercase text-primary font-semibold">
            Status Hari Ini &bull; {todayDate}
          </span>
          {!hasCredential ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-warning/10 text-warning border border-warning/20">
              <AlertCircle className="w-3 h-3" /> Kredensial Belum Diatur
            </span>
          ) : isSubmitted ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-primary-soft text-primary border border-primary/20">
              <CheckCircle2 className="w-3 h-3" /> Hadir &amp; Laporan Terkirim
            </span>
          ) : todayStatus === "FAILED" ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-error/10 text-error border border-error/20">
              <AlertCircle className="w-3 h-3" /> Gagal Submit
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-warning/10 text-warning border border-warning/20">
              Menunggu Submit
            </span>
          )}

          {isAiReady ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary border border-primary/20">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              AI: {aiModelName || "Ready"}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-surface text-ink-muted border border-hairline" title="Belum ada key AI pribadi, menggunakan smart fallback">
              <span className="w-1.5 h-1.5 rounded-full bg-warning" />
              AI: Fallback 0-Token
            </span>
          )}
        </div>
        <p className="text-xs text-ink-secondary leading-relaxed">
          {!hasCredential
            ? "Akun MagangHub belum dikonfigurasi. Atur kredensial login Monev di menu Pengaturan terlebih dahulu untuk mengaktifkan fitur submit kehadiran."
            : isSubmitted
            ? "Kehadiran dan laporan harian Anda untuk hari ini sudah tercatat di Monev Kemnaker."
            : "Tekan tombol di samping untuk auto-generate dan submit laporan harian langsung ke portal Monev."}
        </p>
      </div>

      {!hasCredential ? (
        <Link href="/settings" className="w-full md:w-auto">
          <Button
            type="button"
            variant="outline"
            className="w-full md:w-auto gap-2 shrink-0 h-10 sm:h-9 text-xs font-semibold border-warning/40 text-warning hover:bg-warning/10 hover:border-warning"
          >
            <KeyRound className="w-4 h-4" />
            Atur Kredensial Sekarang
          </Button>
        </Link>
      ) : (
        <Button
          onClick={handleSubmit}
          disabled={loading || isSubmitted}
          variant="emerald"
          className="w-full md:w-auto gap-2 shrink-0 h-10 sm:h-9 text-xs font-semibold"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {loading
            ? "Mengirim ke Monev..."
            : isSubmitted
            ? "Sudah Terkirim"
            : "Submit Kehadiran Sekarang"}
        </Button>
      )}
    </div>
  );
}
