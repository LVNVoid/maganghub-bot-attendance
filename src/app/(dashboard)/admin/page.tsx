import { auth } from "@/lib/auth";
import { getAdminOverview } from "@/services/admin-service";
import { redirect } from "next/navigation";
import { AdminDashboardView } from "@/components/admin-dashboard-view";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userRole = (session.user as { role?: string }).role || "USER";
  if (userRole !== "ADMIN") {
    redirect("/dashboard");
  }

  const overview = await getAdminOverview();

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-lg sm:text-xl font-semibold text-ink-primary">
          Admin Panel &amp; Monitoring Peserta
        </h1>
        <p className="text-xs text-ink-secondary mt-1">
          Pantau seluruh peserta magang yang terdaftar, status automasi cron, performa submit, dan feedback kendala
        </p>
      </div>

      <AdminDashboardView
        users={overview.users}
        totalReports={overview.totalReports}
        totalLogs={overview.totalLogs}
        todayReportsCount={overview.todayReportsCount}
        successLogsCount={overview.successLogsCount}
        successRate={overview.successRate}
        feedbacks={overview.feedbacks}
        feedbackStats={overview.feedbackStats}
      />
    </div>
  );
}
