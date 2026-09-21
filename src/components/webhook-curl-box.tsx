"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Copy, Check, RefreshCw, Terminal, Clock } from "lucide-react";
import { regenerateWebhookKey } from "@/actions/settings-actions";

interface WebhookCurlBoxProps {
  webhookKey: string;
  autoSubmitTime?: string;
}

export function WebhookCurlBox({
  webhookKey,
  autoSubmitTime = "14:00",
}: WebhookCurlBoxProps) {
  const [currentKey, setCurrentKey] = useState(webhookKey);
  const [copied, setCopied] = useState(false);
  const [copiedCron, setCopiedCron] = useState(false);
  const [tzMode, setTzMode] = useState<"wib" | "utc">("wib");
  const [regenerating, setRegenerating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Compute crontab time from autoSubmitTime (HH:MM) in WIB (UTC+7)
  const [hour = "14", minute = "00"] = autoSubmitTime.split(":");
  const wibHour = parseInt(hour, 10) || 0;
  const wibMinute = parseInt(minute, 10) || 0;

  // Convert WIB (UTC+7) to UTC for standard Linux VPS running in UTC
  const utcHour = (wibHour - 7 + 24) % 24;
  const utcMinute = wibMinute;
  const utcHourStr = utcHour.toString().padStart(2, "0");
  const utcMinuteStr = utcMinute.toString().padStart(2, "0");

  const cronWib = `${wibMinute} ${wibHour} * * 1-6`;
  const cronUtc = `${utcMinute} ${utcHour} * * 1-6`;

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://maganghub-bot-attendance.vercel.app";

  const curlCommand = `curl -s -X POST ${baseUrl}/api/cron/trigger \\
  -H "Authorization: Bearer ${currentKey}"`;

  const singleLineCurl = `curl -s -X POST ${baseUrl}/api/cron/trigger -H "Authorization: Bearer ${currentKey}"`;

  const crontabSnippetWib = `# MagangHub Bot: Setiap Senin-Sabtu jam ${autoSubmitTime} WIB
CRON_TZ=Asia/Jakarta
${cronWib} ${singleLineCurl} >> /var/log/maganghub.log 2>&1`;

  const crontabSnippetUtc = `# MagangHub Bot: Jam ${utcHourStr}:${utcMinuteStr} UTC (= ${autoSubmitTime} WIB) Senin-Sabtu
${cronUtc} ${singleLineCurl} >> /var/log/maganghub.log 2>&1`;

  const activeCronSnippet = tzMode === "wib" ? crontabSnippetWib : crontabSnippetUtc;

  const handleCopy = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopied(true);
    toast.success("Perintah curl berhasil disalin!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCron = () => {
    navigator.clipboard.writeText(activeCronSnippet);
    setCopiedCron(true);
    toast.success("Baris crontab berhasil disalin!");
    setTimeout(() => setCopiedCron(false), 2000);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-mono text-ink-secondary">
          <Terminal className="w-3.5 h-3.5 text-primary shrink-0" />
          <span>Webhook Endpoint Token</span>
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

      <div className="relative group bg-canvas-deep border border-hairline rounded-sm p-3 font-mono text-xs text-ink-primary overflow-x-auto">
        <pre className="whitespace-pre-wrap break-all leading-relaxed">
          {curlCommand}
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-1.5 rounded-xs bg-surface border border-hairline hover:border-hairline-prominent text-ink-secondary hover:text-ink-primary transition-colors"
          title="Salin perintah curl"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5 text-ink-secondary" />}
        </button>
      </div>

      <div className="space-y-2.5 text-xs text-ink-secondary">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="font-medium text-ink-primary flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>Format Crontab VPS:</span>
          </div>

          {/* Timezone Selector Tabs */}
          <div className="inline-flex rounded-xs bg-canvas border border-hairline p-0.5 self-start sm:self-auto text-[11px]">
            <button
              type="button"
              onClick={() => setTzMode("wib")}
              className={`px-2.5 py-1 rounded-xs transition-colors font-mono ${
                tzMode === "wib"
                  ? "bg-primary text-white font-semibold"
                  : "text-ink-secondary hover:text-ink-primary"
              }`}
            >
              CRON_TZ=WIB (Rekomendasi)
            </button>
            <button
              type="button"
              onClick={() => setTzMode("utc")}
              className={`px-2.5 py-1 rounded-xs transition-colors font-mono ${
                tzMode === "utc"
                  ? "bg-primary text-white font-semibold"
                  : "text-ink-secondary hover:text-ink-primary"
              }`}
            >
              UTC (Server Default)
            </button>
          </div>
        </div>

        {/* Crontab Snippet Code Block */}
        <div className="relative group bg-canvas-deep border border-hairline rounded-sm p-3 font-mono text-[11px] text-ink-muted overflow-x-auto">
          <pre className="whitespace-pre-wrap break-all leading-relaxed font-mono">
            {activeCronSnippet}
          </pre>
          <button
            onClick={handleCopyCron}
            className="absolute top-2 right-2 p-1.5 rounded-xs bg-surface border border-hairline hover:border-hairline-prominent text-ink-secondary hover:text-ink-primary transition-colors"
            title="Salin baris crontab"
          >
            {copiedCron ? (
              <Check className="w-3.5 h-3.5 text-primary" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-ink-secondary" />
            )}
          </button>
        </div>

        {/* Helper Note */}
        <p className="text-[11px] text-ink-muted leading-relaxed">
          {tzMode === "wib" ? (
            <>
              Gunakan opsi <strong>CRON_TZ=Asia/Jakarta</strong> agar jadwal crontab di VPS Linux (Ubuntu/Debian) berjalan tepat pada jam <strong>{autoSubmitTime} WIB</strong> tanpa terpengaruh zona waktu server.
            </>
          ) : (
            <>
              Gunakan format <strong>UTC</strong> jika server VPS atau Cloud Scheduler Anda (Railway/GitHub Actions) terkunci pada zona UTC. Jam <strong>{autoSubmitTime} WIB</strong> dikonversi otomatis menjadi <strong>{utcHourStr}:{utcMinuteStr} UTC</strong>.
            </>
          )}
        </p>
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
