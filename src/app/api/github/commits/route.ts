import { auth } from "@/lib/auth";
import { fetchAllTrackedCommitsForUser } from "@/lib/github";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date =
    searchParams.get("date") || new Date().toISOString().split("T")[0];

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "Format tanggal tidak valid. Gunakan format YYYY-MM-DD" },
      { status: 400 }
    );
  }

  try {
    const groups = await fetchAllTrackedCommitsForUser(session.user.id, date);
    return NextResponse.json({ date, groups });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Gagal mengambil data commit";
    console.error("Fetch commits API error:", error);
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
