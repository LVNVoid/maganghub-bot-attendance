import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ReportForm } from "@/components/report-form";
import { Button } from "@/components/ui/button";
import { getTodayJakartaStr } from "@/lib/date-utils";
import { CheckCircle2, Clock, AlertCircle, History, ArrowRight } from "lucide-react";

interface ReportsPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const resolvedParams = await searchParams;
  const targetDateStr = resolvedParams.date || getTodayJakartaStr();

  // Fetch report for target date
  const targetReport = await db.report.findFirst({
    where: {
      userId,
      date: new Date(targetDateStr),
    },
  });

  // Fetch recent reports summary (top 5)
  const recentReports = await db.report.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 5,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-ink-primary">
            Editor Laporan Harian
          </h1>
          <p className="text-xs text-ink-secondary mt-1">
            Buat, periksa, dan simpan laporan aktivitas magang ke portal Monev Kemnaker
          </p>
        </div>

        <Link href="/reports/history">
          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
            <History className="w-3.5 h-3.5" />
            <span>Kelola Riwayat Laporan</span>
            <ArrowRight className="w-3 h-3 ml-0.5" />
          </Button>
        </Link>
      </div>

      <ReportForm
        initialReport={
          targetReport
            ? {
                id: targetReport.id,
                date: targetReport.date.toISOString().split("T")[0],
                activity: targetReport.activity,
                learning: targetReport.learning,
                obstacles: targetReport.obstacles,
                status: targetReport.status,
              }
            : null
        }
        selectedDate={targetDateStr}
      />

      {/* History Preview Card */}
      <div className="bg-canvas-subtle border border-hairline rounded-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-ink-primary">
              Riwayat Laporan Terakhir
            </h2>
            <p className="text-[11px] text-ink-secondary mt-0.5">
              Draft pengerjaan yang belum disubmit dapat dikelola dan dihapus pada halaman riwayat.
            </p>
          </div>

          <Link href="/reports/history">
            <Button variant="ghost" size="sm" className="text-xs text-primary gap-1">
              <span>Buka Halaman Riwayat Lengkap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

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
                  <th className="py-2.5 px-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {recentReports.map((r) => {
                  const dateStr = r.date.toISOString().split("T")[0];
                  return (
                    <tr key={r.id} className="hover:bg-canvas-deep/50">
                      <td className="py-3 px-3 font-mono text-ink-primary whitespace-nowrap">
                        {dateStr}
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
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <Link href={`/reports?date=${dateStr}`}>
                          <Button variant="outline" size="sm" className="h-6 px-2 text-[10px]">
                            Buka
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
