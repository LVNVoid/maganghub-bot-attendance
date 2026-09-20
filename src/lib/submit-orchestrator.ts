import { db } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import { MagangHubApiClient } from "@/lib/maganghub-api";
import { fetchAllTrackedCommitsForUser } from "@/lib/github";
import { formatCommitsToActivitySummary } from "@/lib/activity-extractor";
import { generateReportFromActivity } from "@/lib/ai";
import { getTodayJakartaStr } from "@/lib/date-utils";
import { TriggerType } from "@prisma/client";

export interface SubmitOrchestratorResult {
  success: boolean;
  message: string;
  httpCode?: number;
  reportId?: string;
}

export async function executeUserDailySubmit(
  userId: string,
  triggeredBy: TriggerType = "MANUAL",
  targetDateStr?: string
): Promise<SubmitOrchestratorResult> {
  const dateStr = targetDateStr || getTodayJakartaStr();
  const dateObj = new Date(dateStr);

  // 1. Ambil kredensial MagangHub pengguna
  const cred = await db.maganghubCredential.findUnique({
    where: { userId },
  });

  if (!cred) {
    return {
      success: false,
      message: "Kredensial MagangHub belum dikonfigurasi. Harap isi di menu Pengaturan.",
    };
  }

  // 3. Dekripsi kredensial
  let email = "";
  let password = "";
  try {
    const decryptedJson = decrypt(cred.encryptedPassword, cred.iv, cred.authTag);
    const parsed = JSON.parse(decryptedJson);
    email = parsed.email;
    password = parsed.password;
  } catch (err) {
    console.error("Failed to decrypt credentials:", err);
    return {
      success: false,
      message: "Gagal mendekripsi kredensial MagangHub. Silakan simpan ulang kredensial Anda.",
    };
  }

  // 4. Ambil atau generate laporan untuk tanggal tersebut
  let report = await db.report.findUnique({
    where: {
      userId_date: {
        userId,
        date: dateObj,
      },
    },
  });

  if (!report) {
    // Generate draft otomatis
    try {
      const groups = await fetchAllTrackedCommitsForUser(userId, dateStr);
      const summary = formatCommitsToActivitySummary(groups);
      const generated = await generateReportFromActivity(summary);

      report = await db.report.create({
        data: {
          userId,
          date: dateObj,
          activity: generated.activity_log,
          learning: generated.lesson_learned,
          obstacles: generated.obstacles,
          sourceType: "GITHUB",
          sourceData: groups as unknown as object,
          status: "DRAFT",
        },
      });
    } catch (genErr) {
      const msg = genErr instanceof Error ? genErr.message : "Error generating report";
      console.error("Auto generate report failed:", genErr);
      return {
        success: false,
        message: `Gagal membuat draft laporan: ${msg}`,
      };
    }
  }

  // 5. Validasi Kelayakan Isi Laporan (Minimal 100 Karakter per Bagian)
  const actLen = (report.activity || "").trim().length;
  const learnLen = (report.learning || "").trim().length;
  const obsLen = (report.obstacles || "").trim().length;

  if (actLen < 100 || learnLen < 100 || obsLen < 100) {
    return {
      success: false,
      message: `Laporan belum memenuhi syarat minimal 100 karakter (Aktivitas: ${actLen}/100, Pembelajaran: ${learnLen}/100, Kendala: ${obsLen}/100). Harap lengkapi di menu Editor Laporan sebelum submit.`,
      reportId: report.id,
    };
  }

  // 6. Cegah duplikasi submit jika sudah berstatus SUBMITTED
  if (report.status === "SUBMITTED") {
    return {
      success: true,
      message: `Laporan untuk tanggal ${dateStr} sudah pernah disubmit ke Monev MagangHub sebelumnya.`,
      reportId: report.id,
    };
  }

  // 7. Login ke Monev SSO Kemnaker
  let authToken = "";
  try {
    const authResult = await MagangHubApiClient.login(email, password);
    authToken = authResult.accessToken;

    // Update status kredensial menjadi VALID
    await db.maganghubCredential.update({
      where: { userId },
      data: {
        status: "VALID",
        lastCheckedAt: new Date(),
      },
    });
  } catch (loginErr) {
    const loginErrMsg = loginErr instanceof Error ? loginErr.message : "Error login SSO";
    console.error("Monev SSO login failed:", loginErr);

    // Update status kredensial menjadi INVALID
    await db.maganghubCredential.update({
      where: { userId },
      data: {
        status: "INVALID",
        lastCheckedAt: new Date(),
      },
    });

    await db.submitLog.create({
      data: {
        userId,
        reportId: report.id,
        status: "FAILED",
        message: `Login SSO Gagal: ${loginErrMsg}`,
        triggeredBy,
        httpCode: 401,
      },
    });

    return {
      success: false,
      message: `Login ke portal SSO Kemnaker gagal: ${loginErrMsg}`,
      reportId: report.id,
    };
  }

  // 8. Submit kehadiran & laporan harian
  const submitResult = await MagangHubApiClient.submitDailyLog(authToken, {
    date: dateStr,
    status: "PRESENT",
    activity_log: report.activity,
    lesson_learned: report.learning,
    obstacles: report.obstacles,
  });

  // 9. Catat log dan update status laporan
  if (submitResult.success) {
    await db.report.update({
      where: { id: report.id },
      data: { status: "SUBMITTED" },
    });

    await db.submitLog.create({
      data: {
        userId,
        reportId: report.id,
        status: "SUCCESS",
        message: submitResult.message,
        triggeredBy,
        httpCode: submitResult.httpCode,
      },
    });

    return {
      success: true,
      message: submitResult.message,
      httpCode: submitResult.httpCode,
      reportId: report.id,
    };
  } else {
    await db.report.update({
      where: { id: report.id },
      data: { status: "FAILED" },
    });

    await db.submitLog.create({
      data: {
        userId,
        reportId: report.id,
        status: "FAILED",
        message: submitResult.message,
        triggeredBy,
        httpCode: submitResult.httpCode,
      },
    });

    return {
      success: false,
      message: submitResult.message,
      httpCode: submitResult.httpCode,
      reportId: report.id,
    };
  }
}
