import { db } from "@/lib/db";
import { executeUserDailySubmit } from "@/lib/submit-orchestrator";
import { getTodayJakartaStr } from "@/lib/date-utils";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Header Authorization Bearer token wajib disertakan." },
      { status: 401 }
    );
  }

  const webhookKey = authHeader.replace("Bearer ", "").trim();
  if (!webhookKey) {
    return NextResponse.json(
      { error: "Webhook token tidak boleh kosong." },
      { status: 401 }
    );
  }

  try {
    // 1. Cari user berdasarkan webhook key
    const config = await db.automationConfig.findUnique({
      where: { webhookKey },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!config) {
      return NextResponse.json(
        { error: "Webhook key tidak ditemukan." },
        { status: 404 }
      );
    }

    if (!config.isEnabled) {
      return NextResponse.json(
        {
          error: "Otomasi dinonaktifkan oleh pengguna. Aktifkan di menu Pengaturan web app.",
        },
        { status: 403 }
      );
    }

    // 2. Eksekusi submit harian untuk user tersebut
    const result = await executeUserDailySubmit(config.userId, "CRON_WEBHOOK");

    return NextResponse.json({
      success: result.success,
      message: result.message,
      httpCode: result.httpCode,
      user: config.user.name || config.user.email,
      date: new Date().toISOString().split("T")[0],
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Internal server error saat eksekusi cron.";
    console.error("Cron webhook error:", error);
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
