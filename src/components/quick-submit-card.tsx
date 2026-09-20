"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { submitReportAction } from "@/actions/report-actions";
import { Send, CheckCircle2, AlertCircle, Loader2, CalendarOff } from "lucide-react";

interface QuickSubmitCardProps {
  todayStatus?: string | null;
  hasCredential: boolean;
  todayDate: string;
  isHoliday?: boolean;
}

export function QuickSubmitCard({
  todayStatus,
  hasCredential,
  todayDate,
  isHoliday = false,
}: QuickSubmitCardProps) {
  const [loading, setLoading] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleSubmit = async () => {
    if (isHoliday) {
      toast.error("Hari Minggu adalah hari libur magang. Pengiriman laporan harian dinonaktifkan.");
      return;
    }

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
    <div className="bg-canvas-subtle border border-hairline rounded-md p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono uppercase text-primary font-semibold">
            Status Hari Ini &bull; {todayDate}
          </span>
          {isHoliday && !isSubmitted ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-surface text-ink-secondary border border-hairline">
              <CalendarOff className="w-3 h-3 text-ink-muted" /> Hari Libur (Minggu)
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
        </div>
        <p className="text-xs text-ink-secondary">
          {isHoliday && !isSubmitted
            ? "Hari ini adalah hari Minggu (hari libur magang Kemnaker). Tidak ada kewajiban absensi atau pengiriman laporan harian."
            : isSubmitted
            ? "Kehadiran dan laporan harian Anda untuk hari ini sudah tercatat di Monev Kemnaker."
            : "Tekan tombol di samping untuk auto-generate dan submit laporan harian langsung ke portal Monev."}
        </p>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={loading || isSubmitted || isHoliday}
        variant={isHoliday ? "outline" : "emerald"}
        className="gap-2 shrink-0 h-9 text-xs"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isHoliday ? (
          <CalendarOff className="w-4 h-4 text-ink-muted" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        {loading
          ? "Mengirim ke Monev..."
          : isHoliday
          ? "Hari Libur (Minggu)"
          : isSubmitted
          ? "Sudah Terkirim"
          : "Submit Kehadiran Sekarang"}
      </Button>
    </div>
  );
}
