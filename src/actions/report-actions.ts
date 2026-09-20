"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { fetchAllTrackedCommitsForUser } from "@/lib/github";
import { formatCommitsToActivitySummary } from "@/lib/activity-extractor";
import { generateReportFromActivity } from "@/lib/ai";
import {
  saveReportSchema,
  deleteReportSchema,
  generateReportSchema,
  type ReportItem,
} from "@/schemas/report-schema";
import type { ApiResponse } from "@/types/api";

export async function generateReportDraft(
  dateStr: string
): Promise<ApiResponse<ReportItem>> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: { code: "UNAUTHORIZED", message: "Unauthorized" },
    };
  }

  const parsed = generateReportSchema.safeParse({ date: dateStr });
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.issues[0]?.message || "Format tanggal tidak valid",
      },
    };
  }

  const userId = session.user.id;
  const targetDate = parsed.data.date || dateStr;
  const dateObj = new Date(targetDate);

  try {
    const groups = await fetchAllTrackedCommitsForUser(userId, targetDate);
    const summary = formatCommitsToActivitySummary(groups);
    const generated = await generateReportFromActivity(summary);

    const report = await db.report.upsert({
      where: {
        userId_date: {
          userId,
          date: dateObj,
        },
      },
      create: {
        userId,
        date: dateObj,
        activity: generated.activity_log,
        learning: generated.lesson_learned,
        obstacles: generated.obstacles,
        sourceType: "GITHUB",
        sourceData: groups as unknown as object,
        status: "DRAFT",
      },
      update: {
        activity: generated.activity_log,
        learning: generated.lesson_learned,
        obstacles: generated.obstacles,
        sourceType: "GITHUB",
        sourceData: groups as unknown as object,
      },
    });

    revalidatePath("/reports");
    revalidatePath("/reports/history");

    return {
      success: true,
      data: {
        id: report.id,
        date: targetDate,
        activity: report.activity,
        learning: report.learning,
        obstacles: report.obstacles,
        sourceType: report.sourceType,
        status: report.status as ReportItem["status"],
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
      },
      message: "Draft laporan berhasil di-generate",
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Gagal membuat draft laporan.";
    console.error("Generate report draft error:", error);
    return {
      success: false,
      error: { code: "SERVER_ERROR", message: msg },
    };
  }
}

export async function saveReportDraft(
  formData: FormData
): Promise<ApiResponse<ReportItem>> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: { code: "UNAUTHORIZED", message: "Unauthorized" },
    };
  }

  const raw = {
    date: formData.get("date") as string,
    activity: (formData.get("activity") as string)?.trim(),
    learning: (formData.get("learning") as string)?.trim(),
    obstacles: (formData.get("obstacles") as string)?.trim(),
  };

  const parsed = saveReportSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.issues[0]?.message || "Input tidak valid",
        details: parsed.error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        })),
      },
    };
  }

  const userId = session.user.id;
  const { date: dateStr, activity, learning, obstacles } = parsed.data;
  const dateObj = new Date(dateStr);

  try {
    const report = await db.report.upsert({
      where: {
        userId_date: {
          userId,
          date: dateObj,
        },
      },
      create: {
        userId,
        date: dateObj,
        activity,
        learning,
        obstacles,
        status: "DRAFT",
      },
      update: {
        activity,
        learning,
        obstacles,
      },
    });

    revalidatePath("/reports");
    revalidatePath("/reports/history");

    return {
      success: true,
      data: {
        id: report.id,
        date: dateStr,
        activity: report.activity,
        learning: report.learning,
        obstacles: report.obstacles,
        sourceType: report.sourceType,
        status: report.status as ReportItem["status"],
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
      },
      message: "Draft laporan berhasil disimpan",
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Gagal menyimpan draft laporan.";
    console.error("Save report draft error:", error);
    return {
      success: false,
      error: { code: "SERVER_ERROR", message: msg },
    };
  }
}

export async function submitReportAction(): Promise<{
  readonly success: boolean;
  readonly message: string;
  readonly error?: string;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized", error: "Unauthorized" };
  }

  try {
    const { executeUserDailySubmit } = await import("@/lib/submit-orchestrator");
    const result = await executeUserDailySubmit(session.user.id, "MANUAL");

    revalidatePath("/dashboard");
    revalidatePath("/reports");
    revalidatePath("/reports/history");

    return result;
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Gagal submit laporan.";
    console.error("Submit report action error:", error);
    return { success: false, message: msg, error: msg };
  }
}

export async function deleteReportAction(
  reportId: string
): Promise<{ readonly success: boolean; readonly message?: string; readonly error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = deleteReportSchema.safeParse({ id: reportId });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "ID laporan tidak valid",
    };
  }

  const userId = session.user.id;

  try {
    const report = await db.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return { success: false, error: "Laporan tidak ditemukan." };
    }

    if (report.userId !== userId) {
      return {
        success: false,
        error: "Anda tidak memiliki izin untuk menghapus laporan ini.",
      };
    }

    if (report.status === "SUBMITTED") {
      return {
        success: false,
        error: "Laporan yang sudah terkirim (SUBMITTED) tidak dapat dihapus.",
      };
    }

    // Hapus juga submitLog terkait jika ada
    await db.submitLog.deleteMany({
      where: { reportId },
    });

    await db.report.delete({
      where: { id: reportId },
    });

    revalidatePath("/reports");
    revalidatePath("/reports/history");
    revalidatePath("/dashboard");
    revalidatePath("/calendar");

    return { success: true, message: "Laporan berhasil dihapus." };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Gagal menghapus laporan.";
    console.error("Delete report error:", error);
    return { success: false, error: msg };
  }
}
