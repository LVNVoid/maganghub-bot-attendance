import { db } from "@/services/db";
import {
  getAllFeedbacks,
  getFeedbackStats,
  type FeedbackItem,
  type FeedbackStats,
} from "@/services/feedback-service";

export interface AdminUserItem {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: Date;
  maganghubCred: {
    status: string;
    lastCheckedAt: Date | null;
  } | null;
  automation: {
    isEnabled: boolean;
    scheduleTime: string;
  } | null;
  _count: {
    reports: number;
    submitLogs: number;
  };
}

export interface AdminOverviewData {
  users: AdminUserItem[];
  totalReports: number;
  totalLogs: number;
  todayReportsCount: number;
  successLogsCount: number;
  successRate: number;
  feedbacks: FeedbackItem[];
  feedbackStats: FeedbackStats;
}

export async function getAdminOverview(): Promise<AdminOverviewData> {
  const todayStr = new Date().toISOString().split("T")[0];
  const todayDate = new Date(todayStr);

  const [
    users,
    totalReports,
    totalLogs,
    todayReportsCount,
    successLogsCount,
    feedbacks,
    feedbackStats,
  ] = await Promise.all([
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
        date: todayDate,
        status: "SUBMITTED",
      },
    }),
    db.submitLog.count({
      where: { status: "SUCCESS" },
    }),
    getAllFeedbacks(),
    getFeedbackStats(),
  ]);

  const successRate =
    totalLogs > 0 ? Math.round((successLogsCount / totalLogs) * 100) : 100;

  return {
    users,
    totalReports,
    totalLogs,
    todayReportsCount,
    successLogsCount,
    successRate,
    feedbacks,
    feedbackStats,
  };
}
