"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { aiConfigSchema } from "@/schemas/ai-config-schema";
import {
  saveUserAiConfig,
  deleteUserAiConfig,
  getDecryptedUserAiConfig,
} from "@/services/ai-config-service";
import axios from "axios";

export async function saveUserAiConfigAction(
  formData: FormData
): Promise<{ readonly success?: boolean; readonly error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const raw = {
    provider: formData.get("provider") || "openai_compatible",
    baseUrl: formData.get("baseUrl"),
    modelName: formData.get("modelName"),
    apiKey: formData.get("apiKey"),
  };

  const parsed = aiConfigSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Input tidak valid" };
  }

  try {
    await saveUserAiConfig(session.user.id, {
      provider: parsed.data.provider,
      baseUrl: parsed.data.baseUrl,
      modelName: parsed.data.modelName,
      apiKey: parsed.data.apiKey,
    });

    revalidatePath("/settings");
    revalidatePath("/reports");
    return { success: true };
  } catch (err) {
    console.error("Save AI config error:", err);
    return { error: "Gagal menyimpan konfigurasi AI." };
  }
}

export async function deleteUserAiConfigAction(): Promise<{
  readonly success?: boolean;
  readonly error?: string;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    await deleteUserAiConfig(session.user.id);
    revalidatePath("/settings");
    revalidatePath("/reports");
    return { success: true };
  } catch (err) {
    console.error("Delete AI config error:", err);
    return { error: "Gagal menghapus konfigurasi AI." };
  }
}

export async function testUserAiConfigAction(data?: {
  baseUrl?: string;
  modelName?: string;
  apiKey?: string;
}): Promise<{
  readonly success: boolean;
  readonly message: string;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized" };
  }

  let baseUrl = data?.baseUrl;
  let modelName = data?.modelName;
  let apiKey = data?.apiKey;

  // Jika tidak diberikan langsung dari form, ambil dari database
  if (!apiKey || !baseUrl || !modelName) {
    const saved = await getDecryptedUserAiConfig(session.user.id);
    if (!saved) {
      return {
        success: false,
        message: "Konfigurasi AI belum disimpan. Masukkan API Key terlebih dahulu.",
      };
    }
    baseUrl = baseUrl || saved.baseUrl;
    modelName = modelName || saved.modelName;
    apiKey = apiKey || saved.apiKey;
  }

  const endpoint = `${baseUrl.replace(/\/+$/, "")}/chat/completions`;

  try {
    const res = await axios.post(
      endpoint,
      {
        model: modelName,
        messages: [{ role: "user", content: "Halo, tes koneksi API." }],
        max_tokens: 10,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        timeout: 15000,
      }
    );

    if (res.status >= 200 && res.status < 300) {
      return {
        success: true,
        message: `Koneksi berhasil! Model ${modelName} merespons dengan baik.`,
      };
    }

    return {
      success: false,
      message: `Endpoint merespons dengan HTTP ${res.status}`,
    };
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message;
      return {
        success: false,
        message: `Koneksi gagal (${err.response?.status || "Network"}): ${msg}`,
      };
    }
    return {
      success: false,
      message: "Terjadi kesalahan saat menguji koneksi API.",
    };
  }
}
