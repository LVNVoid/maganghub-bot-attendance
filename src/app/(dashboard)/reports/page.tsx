import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ReportForm } from "@/components/report-form";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  // Fetch today's report
  const todayReport = await db.report.findFirst({
    where: {
      userId,
      date: new Date(todayStr),
    },
  });

  // Fetch recent reports
  const recentReports = await db.report.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 15,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-primary-soft text-primary border border-primary/20">
            <CheckCircle2 className="w-3 h-3" /> Submitted
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-error/10 text-error border border-error/20">
            <AlertCircle className="w-3 h-3" /> Gagal
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-surface text-ink-muted border border-hairline">
            <Clock className="w-3 h-3" /> Draft
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-ink-primary">
          Manajemen Laporan Harian
        </h1>
        <p className="text-xs text-ink-secondary mt-1">
          Buat, periksa, dan submit laporan aktivitas magang ke portal Monev Kemnaker
        </p>
      </div>

      <ReportForm
        initialReport={
          todayReport
            ? {
                id: todayReport.id,
                date: todayReport.date.toISOString().split("T")[0],
                activity: todayReport.activity,
                learning: todayReport.learning,
                obstacles: todayReport.obstacles,
                status: todayReport.status,
              }
            : null
        }
        selectedDate={todayStr}
      />

      {/* History Table */}
      <div className="bg-canvas-subtle border border-hairline rounded-md p-6 space-y-4">
        <h2 className="text-sm font-semibold text-ink-primary">
          Riwayat Laporan Terakhir
        </h2>

        {recentReports.length === 0 ? (
          <div className="text-center py-6 text-xs text-ink-muted">
            Belum ada riwayat laporan tersimpan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-hairline text-ink-muted">
                  <th className="py-2.5 px-3 font-medium">Tanggal</th>
                  <th className="py-2.5 px-3 font-medium">Status</th>
                  <th className="py-2.5 px-3 font-medium">Sumber</th>
                  <th className="py-2.5 px-3 font-medium">Ringkasan Aktivitas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {recentReports.map((r) => (
                  <tr key={r.id} className="hover:bg-canvas-deep/50">
                    <td className="py-3 px-3 font-mono text-ink-primary whitespace-nowrap">
                      {new Date(r.date).toLocaleDateString("id-ID", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {getStatusBadge(r.status)}
                    </td>
                    <td className="py-3 px-3 text-ink-muted font-mono text-[11px] whitespace-nowrap">
                      {r.sourceType}
                    </td>
                    <td className="py-3 px-3 text-ink-secondary truncate max-w-md">
                      {r.activity.substring(0, 90)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
