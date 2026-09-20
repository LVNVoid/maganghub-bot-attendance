"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { fetchAllTrackedCommitsForUser } from "@/lib/github";
import { formatCommitsToActivitySummary } from "@/lib/activity-extractor";
import { generateReportFromActivity } from "@/lib/ai";
import { revalidatePath } from "next/cache";

export async function generateReportDraft(dateStr: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const userId = session.user.id;
  const dateObj = new Date(dateStr);

  try {
    // 1. Fetch user's commits
    const groups = await fetchAllTrackedCommitsForUser(userId, dateStr);

    // 2. Format commits
    const summary = formatCommitsToActivitySummary(groups);

    // 3. Generate 3-part report via AI (with fallback)
    const generated = await generateReportFromActivity(summary);

    // 4. Save to DB as DRAFT
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
        sourceData: groups as any,
        status: "DRAFT",
      },
      update: {
        activity: generated.activity_log,
        learning: generated.lesson_learned,
        obstacles: generated.obstacles,
        sourceType: "GITHUB",
        sourceData: groups as any,
      },
    });

    revalidatePath("/reports");
    revalidatePath("/reports/history");
    return { success: true, report };
  } catch (error: any) {
    console.error("Generate report draft error:", error);
    return { error: error.message || "Gagal membuat draft laporan." };
  }
}

export async function saveReportDraft(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const userId = session.user.id;
  const dateStr = formData.get("date") as string;
  const activity = (formData.get("activity") as string)?.trim();
  const learning = (formData.get("learning") as string)?.trim();
  const obstacles = (formData.get("obstacles") as string)?.trim();

  if (!dateStr || !activity || !learning || !obstacles) {
    return { error: "Seluruh bagian laporan wajib diisi." };
  }

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
    return { success: true, report };
  } catch (error: any) {
    console.error("Save report draft error:", error);
    return { error: "Gagal menyimpan draft laporan." };
  }
}

export async function submitReportAction(reportId?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const { executeUserDailySubmit } = await import("@/lib/submit-orchestrator");
    const result = await executeUserDailySubmit(session.user.id, "MANUAL");

    revalidatePath("/dashboard");
    revalidatePath("/reports");
    revalidatePath("/reports/history");

    return result;
  } catch (error: any) {
    console.error("Submit report action error:", error);
    return { success: false, message: error.message || "Gagal submit laporan." };
  }
}

export async function deleteReportAction(reportId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const userId = session.user.id;

  try {
    const report = await db.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return { error: "Laporan tidak ditemukan." };
    }

    if (report.userId !== userId) {
      return { error: "Anda tidak memiliki izin untuk menghapus laporan ini." };
    }

    if (report.status === "SUBMITTED") {
      return { error: "Laporan yang sudah terkirim (SUBMITTED) tidak dapat dihapus." };
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
  } catch (error: any) {
    console.error("Delete report error:", error);
    return { error: error.message || "Gagal menghapus laporan." };
  }
}

