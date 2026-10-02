"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  createFeedbackSchema,
  updateFeedbackStatusSchema,
  type CreateFeedbackInput,
  type UpdateFeedbackStatusInput,
} from "@/schemas/feedback-schema";
import {
  createFeedback,
  getUserFeedbacks,
  updateFeedbackStatus,
  type FeedbackItem,
} from "@/services/feedback-service";

export async function submitFeedbackAction(
  input: CreateFeedbackInput
): Promise<{ success?: boolean; error?: string; data?: FeedbackItem }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Silakan login terlebih dahulu untuk mengirim feedback" };
  }

  const parsed = createFeedbackSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Data feedback tidak valid" };
  }

  try {
    const feedback = await createFeedback(session.user.id, parsed.data);
    revalidatePath("/admin");
    return { success: true, data: feedback };
  } catch (error) {
    console.error("Gagal menyimpan feedback:", error);
    return { error: "Terjadi kesalahan sistem saat mengirim feedback. Silakan coba lagi." };
  }
}

export async function getMyFeedbacksAction(): Promise<{
  success?: boolean;
  error?: string;
  data?: FeedbackItem[];
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const feedbacks = await getUserFeedbacks(session.user.id);
    return { success: true, data: feedbacks };
  } catch (error) {
    console.error("Gagal mengambil riwayat feedback:", error);
    return { error: "Gagal memuat riwayat feedback" };
  }
}

export async function updateFeedbackStatusAction(
  input: UpdateFeedbackStatusInput
): Promise<{ success?: boolean; error?: string; data?: FeedbackItem }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const role = (session.user as { role?: string }).role || "USER";
  if (role !== "ADMIN") {
    return { error: "Akses ditolak. Fitur ini hanya untuk administrator." };
  }

  const parsed = updateFeedbackStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Input status tidak valid" };
  }

  try {
    const updated = await updateFeedbackStatus(parsed.data);
    revalidatePath("/admin");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Gagal memperbarui status feedback:", error);
    return { error: "Terjadi kesalahan saat memperbarui status feedback" };
  }
}
