import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Users, FileCheck, ShieldAlert, CheckCircle2, AlertCircle } from "lucide-react";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userRole = (session.user as { role?: string }).role || "USER";
  if (userRole !== "ADMIN") {
    redirect("/dashboard");
  }

  // Fetch all users with their credentials, automation configs, and latest submit logs in parallel
  const [users, totalReports, totalLogs, todayReportsCount, successLogsCount] =
    await Promise.all([
      db.user.findMany({
        include: {
          maganghubCred: {
            select: {
              status: true,
              lastCheckedAt: true,
            },
          },
          automation: {
            select: {
              isEnabled: true,
              scheduleTime: true,
            },
          },
          _count: {
            select: {
              reports: true,
              submitLogs: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      db.report.count({
        where: { status: "SUBMITTED" },
      }),
      db.submitLog.count(),
      db.report.count({
        where: {
          date: new Date(new Date().toISOString().split("T")[0]),
          status: "SUBMITTED",
        },
      }),
      db.submitLog.count({
        where: { status: "SUCCESS" },
      }),
    ]);

  const successRate = totalLogs > 0 ? Math.round((successLogsCount / totalLogs) * 100) : 100;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-ink-primary">
          Admin Panel &amp; Monitoring Peserta
        </h1>
        <p className="text-xs text-ink-secondary mt-1">
          Pantau seluruh peserta magang yang terdaftar, status automasi cron, dan performa submit
        </p>
      </div>

      {/* Aggregate Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-canvas-subtle border border-hairline rounded-md p-4 space-y-2">
          <div className="flex items-center justify-between text-ink-secondary">
            <span className="text-xs font-medium">Total Peserta</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-semibold font-mono text-ink-primary">
            {users.length}
          </div>
          <p className="text-[11px] text-ink-muted">Akun aktif terdaftar</p>
        </div>

        <div className="bg-canvas-subtle border border-hairline rounded-md p-4 space-y-2">
          <div className="flex items-center justify-between text-ink-secondary">
            <span className="text-xs font-medium">Laporan Hari Ini</span>
            <FileCheck className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-semibold font-mono text-ink-primary">
            {todayReportsCount}
          </div>
          <p className="text-[11px] text-ink-muted">Telah berhasil disubmit</p>
        </div>

        <div className="bg-canvas-subtle border border-hairline rounded-md p-4 space-y-2">
          <div className="flex items-center justify-between text-ink-secondary">
            <span className="text-xs font-medium">Success Rate</span>
            <CheckCircle2 className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-semibold font-mono text-ink-primary">
            {successRate}%
          </div>
          <p className="text-[11px] text-ink-muted">Tingkat keberhasilan API</p>
        </div>

        <div className="bg-canvas-subtle border border-hairline rounded-md p-4 space-y-2">
          <div className="flex items-center justify-between text-ink-secondary">
            <span className="text-xs font-medium">Total Submit Terkirim</span>
            <ShieldAlert className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-semibold font-mono text-ink-primary">
            {totalReports}
          </div>
          <p className="text-[11px] text-ink-muted">Kumulatif seluruh user</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-canvas-subtle border border-hairline rounded-md p-6 space-y-4">
        <h2 className="text-sm font-semibold text-ink-primary">
          Daftar Pengguna / Peserta Magang
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-hairline text-ink-muted">
                <th className="py-2.5 px-3 font-medium">Pengguna</th>
                <th className="py-2.5 px-3 font-medium">Role</th>
                <th className="py-2.5 px-3 font-medium">Kredensial Monev</th>
                <th className="py-2.5 px-3 font-medium">Mode Automasi</th>
                <th className="py-2.5 px-3 font-medium">Total Laporan</th>
                <th className="py-2.5 px-3 font-medium">Terdaftar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {users.map((u) => {
                const credStatus = u.maganghubCred?.status || "BELUM";
                const isAuto = u.automation?.isEnabled;

                return (
                  <tr key={u.id} className="hover:bg-canvas-deep/50">
                    <td className="py-3 px-3">
                      <div className="font-medium text-ink-primary">
                        {u.name || "Anonim"}
                      </div>
                      <div className="text-[11px] text-ink-muted font-mono">
                        {u.email}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex px-1.5 py-0.5 rounded-xs text-[10px] font-mono ${
                          u.role === "ADMIN"
                            ? "bg-primary-soft text-primary border border-primary/20"
                            : "bg-surface text-ink-muted border border-hairline"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      {credStatus === "VALID" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-primary">
                          <CheckCircle2 className="w-3 h-3" /> Valid
                        </span>
                      ) : credStatus === "INVALID" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-error">
                          <AlertCircle className="w-3 h-3" /> Invalid
                        </span>
                      ) : (
                        <span className="text-[11px] text-ink-muted">
                          {credStatus === "UNCHECKED" ? "Unchecked" : "Belum Isi"}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      {isAuto ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-primary font-mono">
                          Cron {u.automation?.scheduleTime} WIB
                        </span>
                      ) : (
                        <span className="text-[11px] text-ink-muted">Manual</span>
                      )}
                    </td>

                    <td className="py-3 px-3 font-mono text-ink-primary">
                      {u._count.reports}
                    </td>

                    <td className="py-3 px-3 text-ink-muted text-[11px] whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
