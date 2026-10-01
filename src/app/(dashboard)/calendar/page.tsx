import { auth } from "@/lib/auth";
import { getCalendarReports } from "@/services/report-service";
import { redirect } from "next/navigation";
import { CalendarGrid } from "@/components/calendar-grid";

export default async function CalendarPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const formattedReports = await getCalendarReports(session.user.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-ink-primary">
          Kalender Kehadiran &amp; Laporan
        </h1>
        <p className="text-xs text-ink-secondary mt-1">
          Pantau status submit absensi dan laporan harian MagangHub secara visual per bulan
        </p>
      </div>

      <CalendarGrid reports={formattedReports} />

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-6 p-4 rounded-md bg-canvas-subtle border border-hairline text-xs">
        <span className="text-ink-muted">Keterangan:</span>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-xs bg-primary" />
          <span className="text-ink-secondary">Terkirim (Submitted)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-xs bg-warning" />
          <span className="text-ink-secondary">Draft / Menunggu</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-xs bg-error" />
          <span className="text-ink-secondary">Gagal Submit</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-xs bg-hairline" />
          <span className="text-ink-secondary">Belum Diisi</span>
        </div>
      </div>
    </div>
  );
}
