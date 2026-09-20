import { auth } from "@/lib/auth";
import { getUserReports } from "@/services/report-service";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ReportHistoryTable } from "@/components/report-history-table";
import { Button } from "@/components/ui/button";
import { Plus, History } from "lucide-react";

export default async function ReportHistoryPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const reports = await getUserReports(session.user.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-semibold text-ink-primary">
              Riwayat Laporan Harian
            </h1>
          </div>
          <p className="text-xs text-ink-secondary mt-1">
            Daftar lengkap seluruh laporan aktivitas magang, status submit Monev, serta pengelolaan draft yang dapat diedit atau dihapus.
          </p>
        </div>

        <Link href="/reports">
          <Button variant="emerald" size="sm" className="gap-1.5 h-8 text-xs">
            <Plus className="w-3.5 h-3.5" />
            <span>Editor Laporan Baru</span>
          </Button>
        </Link>
      </div>

      <ReportHistoryTable reports={reports} />
    </div>
  );
}
