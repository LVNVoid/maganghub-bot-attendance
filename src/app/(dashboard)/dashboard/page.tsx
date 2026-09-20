import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { QuickSubmitCard } from "@/components/quick-submit-card";
import { CommitsPreview } from "@/components/commits-preview";
import { SubmitLogsFeed } from "@/components/submit-logs-feed";
import { fetchAllTrackedCommitsForUser } from "@/lib/github";
import { getTodayJakartaStr } from "@/lib/date-utils";
import { getUserAiConfig } from "@/services/ai-config-service";
import { FileCheck, Activity, KeyRound, Cpu, Sparkles } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const todayStr = getTodayJakartaStr();
  const todayDateObj = new Date(todayStr);

  // Parallel data fetching
  const [
    credential,
    automation,
    totalSubmitted,
    todayReport,
    commitsGroups,
    recentLogs,
    aiConfig,
  ] = await Promise.all([
    db.maganghubCredential.findUnique({
      where: { userId },
    }),
    db.automationConfig.findUnique({
      where: { userId },
    }),
    db.report.count({
      where: { userId, status: "SUBMITTED" },
    }),
    db.report.findUnique({
      where: {
        userId_date: {
          userId,
          date: todayDateObj,
        },
      },
    }),
    fetchAllTrackedCommitsForUser(userId, todayStr),
    db.submitLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    getUserAiConfig(userId),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg sm:text-xl font-semibold text-ink-primary">
          Ringkasan &amp; Dashboard Bot
        </h1>
        <p className="text-xs text-ink-secondary mt-1">
          Pantau status absensi harian dan otomasi sinkronisasi aktivitas ke Monev Kemnaker
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Metric 1: Total Laporan */}
        <div className="bg-canvas-subtle border border-hairline rounded-md p-3 sm:p-4 space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between text-ink-secondary">
            <span className="text-xs font-medium">Laporan Terkirim</span>
            <FileCheck className="w-4 h-4 text-primary" />
          </div>
          <div className="text-xl sm:text-2xl font-semibold font-mono text-ink-primary">
            {totalSubmitted}
          </div>
          <p className="text-[10px] sm:text-[11px] text-ink-muted">Total hari absensi berhasil</p>
        </div>

        {/* Metric 2: Status Hari Ini */}
        <div className="bg-canvas-subtle border border-hairline rounded-md p-3 sm:p-4 space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between text-ink-secondary">
            <span className="text-xs font-medium">Status Hari Ini</span>
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <div className="text-xs sm:text-sm font-semibold text-ink-primary pt-0.5 sm:pt-1 truncate">
            {todayReport?.status === "SUBMITTED" ? (
              <span className="text-primary">Terkirim</span>
            ) : todayReport?.status === "FAILED" ? (
              <span className="text-error">Gagal</span>
            ) : (
              <span className="text-warning">Belum Dikirim</span>
            )}
          </div>
          <p className="text-[10px] sm:text-[11px] text-ink-muted font-mono">{todayStr}</p>
        </div>

        {/* Metric 3: Kredensial */}
        <div className="bg-canvas-subtle border border-hairline rounded-md p-4 space-y-2">
          <div className="flex items-center justify-between text-ink-secondary">
            <span className="text-xs font-medium">Kredensial Monev</span>
            <KeyRound className="w-4 h-4 text-primary" />
          </div>
          <div className="text-sm font-semibold text-ink-primary pt-1">
            {credential?.status === "VALID" ? (
              <span className="text-primary">Valid &amp; Aktif</span>
            ) : credential?.status === "INVALID" ? (
              <span className="text-error">Tidak Valid</span>
            ) : (
              <span className="text-ink-muted">Belum Dicek</span>
            )}
          </div>
          <p className="text-[11px] text-ink-muted">Enkripsi AES-256-GCM</p>
        </div>

        {/* Metric 4: Status AI Generator */}
        <div className="bg-canvas-subtle border border-hairline rounded-md p-4 space-y-2">
          <div className="flex items-center justify-between text-ink-secondary">
            <span className="text-xs font-medium">Status Model AI</span>
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div className="text-sm font-semibold text-ink-primary pt-1 flex items-center gap-1.5">
            {aiConfig ? (
              <>
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
                <span className="text-primary truncate" title={aiConfig.modelName}>
                  Siap (BYOK)
                </span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-warning shrink-0" />
                <span className="text-warning truncate">Fallback (0-Token)</span>
              </>
            )}
          </div>
          <p className="text-[11px] text-ink-muted truncate">
            {aiConfig ? aiConfig.modelName : "Local Synthesizer"}
          </p>
        </div>

        {/* Metric 5: Mode Automasi */}
        <div className="bg-canvas-subtle border border-hairline rounded-md p-4 space-y-2">
          <div className="flex items-center justify-between text-ink-secondary">
            <span className="text-xs font-medium">Mode Eksekusi</span>
            <Cpu className="w-4 h-4 text-primary" />
          </div>
          <div className="text-sm font-semibold text-ink-primary pt-1">
            {automation?.isEnabled ? (
              <span className="text-primary">Cron VPS Aktif</span>
            ) : (
              <span className="text-ink-secondary">Manual Web</span>
            )}
          </div>
          <p className="text-[11px] text-ink-muted">
            {automation?.isEnabled ? `Target jam ${automation.scheduleTime} WIB` : "1-Klik Submit"}
          </p>
        </div>
      </div>

      {/* Quick Action Card */}
      <QuickSubmitCard
        todayStatus={todayReport?.status}
        hasCredential={!!credential}
        todayDate={todayStr}
        isAiReady={!!aiConfig}
        aiModelName={aiConfig?.modelName}
      />

      {/* Grid: Commits Preview + Recent Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CommitsPreview groups={commitsGroups} date={todayStr} />
        <SubmitLogsFeed logs={recentLogs} />
      </div>
    </div>
  );
}
