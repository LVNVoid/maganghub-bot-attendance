import { db } from "@/services/db";

export interface DashboardMetrics {
  credential: { status: string } | null;
  automation: { isEnabled: boolean; scheduleTime: string } | null;
  totalSubmitted: number;
  todayReport: { status: string } | null;
  recentLogs: Array<{
    id: string;
    status: string;
    message: string | null;
    triggeredBy: string;
    createdAt: Date;
  }>;
  aiConfig: { modelName: string } | null;
  trackedRepoCount: number;
}

export async function getDashboardMetrics(
  userId: string,
  todayStr: string
): Promise<DashboardMetrics> {
  const todayDateObj = new Date(todayStr);

  const [
    credential,
    automation,
    totalSubmitted,
    todayReport,
    recentLogs,
    aiConfig,
    trackedRepoCount,
  ] = await Promise.all([
    db.maganghubCredential.findUnique({
      where: { userId },
      select: { status: true },
    }),
    db.automationConfig.findUnique({
      where: { userId },
      select: { isEnabled: true, scheduleTime: true },
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
      select: { status: true },
    }),
    db.submitLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        status: true,
        message: true,
        triggeredBy: true,
        createdAt: true,
      },
    }),
    db.userAiConfig.findUnique({
      where: { userId },
      select: { modelName: true },
    }),
    db.githubRepo.count({
      where: { userId, isActive: true },
    }),
  ]);

  return {
    credential,
    automation,
    totalSubmitted,
    todayReport,
    recentLogs,
    aiConfig,
    trackedRepoCount,
  };
}
