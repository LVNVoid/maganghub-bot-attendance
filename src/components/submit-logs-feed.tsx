"use client";

import { CheckCircle2, AlertCircle, Terminal, User, Clock } from "lucide-react";

export interface LogItem {
  id: string;
  status: string;
  message?: string | null;
  triggeredBy: string;
  createdAt: Date;
}

interface SubmitLogsFeedProps {
  logs: LogItem[];
}

export function SubmitLogsFeed({ logs }: SubmitLogsFeedProps) {
  if (logs.length === 0) {
    return (
      <div className="bg-canvas-subtle border border-hairline rounded-md p-6 text-center text-xs text-ink-muted">
        Belum ada catatan riwayat eksekusi bot.
      </div>
    );
  }

  return (
    <div className="bg-canvas-subtle border border-hairline rounded-md p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink-primary">
          Log Eksekusi Bot Terakhir
        </h2>
        <span className="text-[11px] font-mono text-ink-muted">
          {logs.length} catatan terbaru
        </span>
      </div>

      <div className="space-y-2">
        {logs.map((log) => {
          const isSuccess = log.status === "SUCCESS";
          const isCron = log.triggeredBy === "CRON_WEBHOOK";

          return (
            <div
              key={log.id}
              className="flex items-start justify-between gap-3 p-3 rounded-sm bg-canvas-deep border border-hairline text-xs"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {isSuccess ? (
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-error" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-semibold ${
                        isSuccess ? "text-ink-primary" : "text-error"
                      }`}
                    >
                      {isSuccess ? "Submit Berhasil" : "Submit Gagal"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-ink-muted px-1.5 py-0.5 rounded-xs bg-surface border border-hairline">
                      {isCron ? (
                        <>
                          <Terminal className="w-3 h-3 text-primary" /> Cron Webhook
                        </>
                      ) : (
                        <>
                          <User className="w-3 h-3" /> Manual Web
                        </>
                      )}
                    </span>
                  </div>

                  {log.message && (
                    <p className="text-[11px] text-ink-secondary">
                      {log.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 text-[10px] font-mono text-ink-muted shrink-0">
                <Clock className="w-3 h-3" />
                {new Date(log.createdAt).toLocaleString("id-ID", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
