import { db } from "@/services/db";
import type { SaveReportPayload, ReportItem } from "@/schemas/report-schema";

export async function getUserReports(userId: string): Promise<ReportItem[]> {
  const reports = await db.report.findMany({
    where: { userId },
    orderBy: { date: "desc" },
  });

  return reports.map((r) => ({
    id: r.id,
    date: r.date.toISOString().split("T")[0],
    activity: r.activity,
    learning: r.learning,
    obstacles: r.obstacles,
    status: r.status as ReportItem["status"],
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));
}

export async function getReportByDate(
  userId: string,
  dateStr: string
): Promise<ReportItem | null> {
  const dateObj = new Date(dateStr);
  const report = await db.report.findUnique({
    where: {
      userId_date: {
        userId,
        date: dateObj,
      },
    },
  });

  if (!report) return null;

  return {
    id: report.id,
    date: dateStr,
    activity: report.activity,
    learning: report.learning,
    obstacles: report.obstacles,
    status: report.status as ReportItem["status"],
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
  };
}

export async function getReportById(
  id: string,
  userId: string
): Promise<ReportItem | null> {
  const report = await db.report.findFirst({
    where: { id, userId },
  });

  if (!report) return null;

  return {
    id: report.id,
    date: report.date.toISOString().split("T")[0],
    activity: report.activity,
    learning: report.learning,
    obstacles: report.obstacles,
    status: report.status as ReportItem["status"],
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
  };
}

export async function saveReport(
  userId: string,
  payload: SaveReportPayload
): Promise<ReportItem> {
  const dateObj = new Date(payload.date);
  const report = await db.report.upsert({
    where: {
      userId_date: {
        userId,
        date: dateObj,
      },
    },
    update: {
      activity: payload.activity,
      learning: payload.learning,
      obstacles: payload.obstacles,
    },
    create: {
      userId,
      date: dateObj,
      activity: payload.activity,
      learning: payload.learning,
      obstacles: payload.obstacles,
      status: "DRAFT",
    },
  });

  return {
    id: report.id,
    date: payload.date,
    activity: report.activity,
    learning: report.learning,
    obstacles: report.obstacles,
    status: report.status as ReportItem["status"],
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
  };
}

export async function deleteReport(id: string, userId: string): Promise<void> {
  await db.submitLog.deleteMany({
    where: { reportId: id },
  });

  await db.report.delete({
    where: { id, userId },
  });
}
