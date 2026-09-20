"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, RefreshCw, Terminal } from "lucide-react";
import { regenerateWebhookKey } from "@/app/(dashboard)/dashboard/settings/actions";

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
  const [regenerating, setRegenerating] = useState(false);

  // Compute crontab time from autoSubmitTime (HH:MM)
  const [hour = "14", minute = "00"] = autoSubmitTime.split(":");
  const cronExpression = `${parseInt(minute, 10)} ${parseInt(hour, 10)} * * 1-6`;

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://your-domain.com";

  const curlCommand = `curl -s -X POST ${baseUrl}/api/cron/trigger \\
  -H "Authorization: Bearer ${currentKey}"`;

  const crontabSnippet = `# MagangHub Bot: Setiap Senin-Sabtu jam ${autoSubmitTime} WIB
${cronExpression} ${curlCommand} >> /var/log/maganghub.log 2>&1`;

  const handleCopy = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = async () => {
    if (!confirm("Regenerate webhook key? Cron job lama Anda akan berhenti berfungsi sampai Anda memperbarui key.")) {
      return;
    }
    setRegenerating(true);
    const res = await regenerateWebhookKey();
    if (res?.webhookKey) {
      setCurrentKey(res.webhookKey);
    }
    setRegenerating(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono text-ink-secondary">
          <Terminal className="w-3.5 h-3.5 text-primary" />
          <span>Webhook Endpoint Token</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRegenerate}
          disabled={regenerating}
          className="h-7 text-[11px] gap-1.5"
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

      <div className="space-y-2 text-xs text-ink-secondary">
        <div className="font-medium text-ink-primary">Format Crontab VPS:</div>
        <div className="bg-canvas-deep border border-hairline rounded-sm p-2.5 font-mono text-[11px] text-ink-muted overflow-x-auto">
          <pre>{crontabSnippet}</pre>
        </div>
        <p className="text-[11px] text-ink-muted">
          Pasang perintah ini di crontab VPS pribadi Anda (`crontab -e`) atau Cron Job Scheduler seperti Railway / Render.
        </p>
      </div>
    </div>
  );
}
