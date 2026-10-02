"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Copy, Check, RefreshCw, Terminal, Clock, Zap, CheckCircle2 } from "lucide-react";
import { regenerateWebhookKey } from "@/actions/settings-actions";
import { formatScheduleDays } from "@/lib/date-utils";

interface WebhookCurlBoxProps {
  webhookKey: string;
  autoSubmitTime?: string;
  scheduleDays?: string;
}

export function WebhookCurlBox({
  webhookKey,
  autoSubmitTime = "14:00",
  scheduleDays = "1,2,3,4,5,6",
}: WebhookCurlBoxProps) {
  const [origin, setOrigin] = useState("");
  const [currentKey, setCurrentKey] = useState(webhookKey);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"oneclick" | "crontab" | "curl">("oneclick");
  const [tzMode, setTzMode] = useState<"wib" | "utc">("wib");
  const [regenerating, setRegenerating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  // Compute crontab time from autoSubmitTime (HH:MM) in WIB (UTC+7)
  const [hour = "14", minute = "00"] = autoSubmitTime.split(":");
  const wibHour = parseInt(hour, 10) || 0;
  const wibMinute = parseInt(minute, 10) || 0;

  // Convert WIB (UTC+7) to UTC for standard Linux VPS running in UTC
  const utcHour = (wibHour - 7 + 24) % 24;
  const utcMinute = wibMinute;
  const utcHourStr = utcHour.toString().padStart(2, "0");
  const utcMinuteStr = utcMinute.toString().padStart(2, "0");

  const { cronDays, label: daysLabel } = formatScheduleDays(scheduleDays);

  const cronWib = `${wibMinute} ${wibHour} * * ${cronDays}`;
  const cronUtc = `${utcMinute} ${utcHour} * * ${cronDays}`;

  const baseUrl = origin || "https://maganghub-bot-attendance.vercel.app";

  const curlCommand = `curl -sS -X POST ${baseUrl}/api/cron/trigger \\
  -H "Authorization: Bearer ${currentKey}"`;

  const singleLineCurl = `/usr/bin/curl -sS -X POST ${baseUrl}/api/cron/trigger -H "Authorization: Bearer ${currentKey}"`;

  const cronTime = tzMode === "wib" ? cronWib : cronUtc;
  const singleLineCron = `${cronTime} ${singleLineCurl} >> /var/log/maganghub.log 2>&1`;

  // One-click Linux VPS command: deletes previous maganghub cron trigger if any to prevent duplicate,
  // appends the new cron entry, and sets up log file permissions so non-root cron jobs can write to /var/log/
  const oneClickInstallCmd = `(crontab -l 2>/dev/null | grep -v "/api/cron/trigger"; echo "${singleLineCron}") | crontab - && sudo touch /var/log/maganghub.log && sudo chmod 666 /var/log/maganghub.log`;

  const crontabSnippet = `# MagangHub Bot: Setiap ${daysLabel} jam ${autoSubmitTime} WIB${tzMode === "utc" ? ` (${utcHourStr}:${utcMinuteStr} UTC)` : ""}\n${singleLineCron}`;

  const currentDisplayCommand =
    viewMode === "oneclick"
      ? oneClickInstallCmd
      : viewMode === "crontab"
      ? crontabSnippet
      : curlCommand;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentDisplayCommand);
    setCopied(true);
    toast.success(
      viewMode === "oneclick"
        ? "Perintah 1-klik terminal berhasil disalin!"
        : viewMode === "crontab"
        ? "Baris crontab berhasil disalin!"
        : "Perintah curl berhasil disalin!"
    );
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    const res = await regenerateWebhookKey();
    setShowConfirm(false);
    if (res?.webhookKey) {
      setCurrentKey(res.webhookKey);
      toast.success("Webhook token berhasil diperbarui.");
    } else {
      toast.error("Gagal memperbarui webhook token.");
    }
    setRegenerating(false);
  };

  return (
    <div className="space-y-4">
      {/* Header & Regenerate */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-mono text-ink-secondary">
          <Terminal className="w-3.5 h-3.5 text-primary shrink-0" />
          <span>Webhook Endpoint & Otomatisasi Cron</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowConfirm(true)}
          disabled={regenerating}
          className="h-8 sm:h-7 text-[11px] gap-1.5 w-full sm:w-auto"
        >
          <RefreshCw className={`w-3 h-3 ${regenerating ? "animate-spin" : ""}`} />
          Regenerate Key
        </Button>
      </div>

      {/* Mode Selector Tabs & Timezone Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pt-1">
        <div className="inline-flex rounded-xs bg-canvas border border-hairline p-0.5 self-start overflow-x-auto max-w-full text-[11px]">
          <button
            type="button"
            onClick={() => setViewMode("oneclick")}
            className={`px-2.5 py-1 rounded-xs transition-colors flex items-center gap-1.5 whitespace-nowrap font-medium ${
              viewMode === "oneclick"
                ? "bg-primary text-white font-semibold shadow-xs"
                : "text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>Perintah 1-Klik VPS (Rekomendasi)</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("crontab")}
            className={`px-2.5 py-1 rounded-xs transition-colors flex items-center gap-1.5 whitespace-nowrap font-medium ${
              viewMode === "crontab"
                ? "bg-primary text-white font-semibold shadow-xs"
                : "text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>Baris Crontab (Manual)</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("curl")}
            className={`px-2.5 py-1 rounded-xs transition-colors flex items-center gap-1.5 whitespace-nowrap font-medium ${
              viewMode === "curl"
                ? "bg-primary text-white font-semibold shadow-xs"
                : "text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <Terminal className="w-3 h-3" />
            <span>Uji Coba Curl</span>
          </button>
        </div>

        {/* Timezone Switcher (Only for cron modes) */}
        {viewMode !== "curl" && (
          <div className="inline-flex rounded-xs bg-canvas border border-hairline p-0.5 self-start md:self-auto text-[11px]">
            <button
              type="button"
              onClick={() => setTzMode("wib")}
              className={`px-2 py-1 rounded-xs transition-colors font-mono ${
                tzMode === "wib"
                  ? "bg-primary text-white font-semibold"
                  : "text-ink-secondary hover:text-ink-primary"
              }`}
            >
              WIB (UTC+7)
            </button>
            <button
              type="button"
              onClick={() => setTzMode("utc")}
              className={`px-2 py-1 rounded-xs transition-colors font-mono ${
                tzMode === "utc"
                  ? "bg-primary text-white font-semibold"
                  : "text-ink-secondary hover:text-ink-primary"
              }`}
            >
              UTC (Server Default)
            </button>
          </div>
        )}
      </div>

      {/* Command Display Box */}
      <div className="relative group bg-canvas-deep border border-hairline rounded-sm p-3.5 font-mono text-xs text-ink-primary overflow-x-auto shadow-inner">
        <pre className="whitespace-pre-wrap break-all leading-relaxed font-mono text-[11px] sm:text-xs" suppressHydrationWarning>
          {currentDisplayCommand}
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-2.5 right-2.5 p-1.5 rounded-xs bg-surface border border-hairline hover:border-hairline-prominent text-ink-secondary hover:text-ink-primary transition-colors"
          title="Salin perintah"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5 text-ink-secondary" />}
        </button>
      </div>

      {/* Guide & Help Section */}
      <div className="bg-canvas border border-hairline rounded-sm p-3.5 text-xs text-ink-secondary space-y-2.5">
        <div className="font-semibold text-ink-primary flex items-center gap-1.5 text-xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
          <span>Panduan Setup di Terminal VPS (Ubuntu / Debian / Linux)</span>
        </div>

        <ol className="list-decimal list-inside space-y-1.5 text-[11px] leading-relaxed text-ink-muted">
          <li>
            <strong className="text-ink-secondary">Pasang Otomatis:</strong> Salin perintah pada tab{" "}
            <span className="text-primary font-medium">Perintah 1-Klik VPS</span> di atas dan jalankan langsung di terminal SSH VPS. Perintah ini otomatis mendaftarkan jadwal ke crontab tanpa memicu error <em>bad minute</em>, menghapus entri ganda, dan menyiapkan file log.
          </li>
          <li>
            <strong className="text-ink-secondary">Verifikasi Crontab:</strong> Jalankan perintah{" "}
            <code className="text-ink-primary bg-canvas-deep px-1 py-0.5 rounded border border-hairline">crontab -l</code> untuk memastikan jadwal automasi sudah aktif.
          </li>
          <li>
            <strong className="text-ink-secondary">Pantau Log Eksekusi:</strong> Pantau hasil eksekusi bot secara real-time kapan saja dengan perintah{" "}
            <code className="text-ink-primary bg-canvas-deep px-1 py-0.5 rounded border border-hairline">tail -f /var/log/maganghub.log</code>.
          </li>
          <li>
            <strong className="text-ink-secondary">Cek Jam Server:</strong> Jalankan{" "}
            <code className="text-ink-primary bg-canvas-deep px-1 py-0.5 rounded border border-hairline">date</code> di terminal VPS. Jika VPS Anda berjalan pada zona UTC (bukan WIB), pilih opsi zona <strong className="text-ink-secondary">UTC (Server Default)</strong> di atas.
          </li>
        </ol>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleRegenerate}
        title="Regenerate Webhook Token"
        description="Cron job lama yang menggunakan token saat ini akan berhenti berfungsi sampai Anda memperbarui token di scheduler Anda. Lanjutkan?"
        confirmText="Ya, Regenerate"
        cancelText="Batal"
        variant="warning"
        loading={regenerating}
      />
    </div>
  );
}
