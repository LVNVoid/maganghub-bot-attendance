"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { encrypt } from "@/lib/crypto";
import { saveCredentialSchema } from "@/schemas/credential-schema";
import {
  addRepoSchema,
  deleteRepoSchema,
  toggleTrackRepoSchema,
} from "@/schemas/repo-schema";
import {
  updateAutomationPreferencesSchema,
  toggleAutomationSchema,
} from "@/schemas/automation-schema";

export async function saveMaganghubCredential(
  formData: FormData
): Promise<{ readonly success?: boolean; readonly error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = saveCredentialSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Input tidak valid" };
  }

  const { email, password } = parsed.data;

  try {
    const credentialBundle = JSON.stringify({ email, password });
    const encryptedBundle = encrypt(credentialBundle);

    await db.maganghubCredential.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        encryptedEmail: encryptedBundle.ciphertext,
        encryptedPassword: encryptedBundle.ciphertext,
        iv: encryptedBundle.iv,
        authTag: encryptedBundle.authTag,
        status: "UNCHECKED",
      },
      update: {
        encryptedEmail: encryptedBundle.ciphertext,
        encryptedPassword: encryptedBundle.ciphertext,
        iv: encryptedBundle.iv,
        authTag: encryptedBundle.authTag,
        status: "UNCHECKED",
      },
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (err) {
    console.error("Save credential error:", err);
    return { error: "Gagal menyimpan kredensial." };
  }
}

export async function deleteMaganghubCredential(): Promise<{
  readonly success?: boolean;
  readonly error?: string;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    await db.maganghubCredential.deleteMany({
      where: { userId: session.user.id },
    });

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("Delete credential error:", err);
    return { error: "Gagal menghapus kredensial." };
  }
}

export async function testMaganghubConnection(): Promise<{
  readonly success: boolean;
  readonly message: string;
  readonly error?: string;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized", error: "Unauthorized" };
  }

  const cred = await db.maganghubCredential.findUnique({
    where: { userId: session.user.id },
  });

  if (!cred) {
    return {
      success: false,
      message: "Kredensial belum disimpan. Harap simpan email & password terlebih dahulu.",
      error: "Kredensial belum disimpan. Harap simpan email & password terlebih dahulu.",
    };
  }

  try {
    const { decrypt } = await import("@/lib/crypto");
    const { MagangHubApiClient } = await import("@/lib/maganghub-api");

    const decryptedJson = decrypt(cred.encryptedPassword, cred.iv, cred.authTag);
    const { email, password } = JSON.parse(decryptedJson);

    // Call direct REST API login
    await MagangHubApiClient.login(email, password);

    await db.maganghubCredential.update({
      where: { userId: session.user.id },
      data: {
        status: "VALID",
        lastCheckedAt: new Date(),
      },
    });

    revalidatePath("/settings");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Koneksi berhasil! Akun valid dan berhasil terautentikasi di SSO Kemnaker / Monev.",
    };
  } catch (err) {
    const msg =
      err instanceof Error
        ? err.message
        : "Login gagal. Periksa kembali email dan password Anda.";
    console.error("Test connection error:", err);

    await db.maganghubCredential.update({
      where: { userId: session.user.id },
      data: {
        status: "INVALID",
        lastCheckedAt: new Date(),
      },
    });

    revalidatePath("/settings");
    revalidatePath("/dashboard");

    return {
      success: false,
      message: msg,
    };
  }
}

export async function toggleAutomation(
  enabled: boolean
): Promise<{ readonly success?: boolean; readonly isEnabled?: boolean; readonly error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const parsed = toggleAutomationSchema.safeParse({ isEnabled: enabled });
  if (!parsed.success) {
    return { error: "Input status automasi tidak valid" };
  }

  try {
    await db.automationConfig.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        isEnabled: enabled,
        webhookKey: crypto.randomBytes(24).toString("hex"),
      },
      update: {
        isEnabled: enabled,
      },
    });

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    return { success: true, isEnabled: enabled };
  } catch (err) {
    console.error("Toggle automation error:", err);
    return { error: "Gagal memperbarui status otomasi." };
  }
}

export async function regenerateWebhookKey(): Promise<{
  readonly success?: boolean;
  readonly webhookKey?: string;
  readonly error?: string;
}> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const newKey = crypto.randomBytes(24).toString("hex");
    const updated = await db.automationConfig.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        isEnabled: false,
        webhookKey: newKey,
      },
      update: {
        webhookKey: newKey,
      },
    });

    revalidatePath("/settings");
    return { success: true, webhookKey: updated.webhookKey };
  } catch (err) {
    console.error("Regenerate webhook key error:", err);
    return { error: "Gagal generate webhook key baru." };
  }
}

export async function updateAutomationPreferences(
  formData: FormData
): Promise<{ readonly success?: boolean; readonly error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const raw = {
    scheduleTime: formData.get("scheduleTime"),
    scheduleDays: formData.get("scheduleDays"),
  };

  const parsed = updateAutomationPreferencesSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Format data tidak valid" };
  }

  const { scheduleTime, scheduleDays } = parsed.data;

  try {
    await db.automationConfig.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        scheduleTime,
        scheduleDays,
        webhookKey: crypto.randomBytes(24).toString("hex"),
      },
      update: {
        scheduleTime,
        scheduleDays,
      },
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (err) {
    console.error("Update preferences error:", err);
    return { error: "Gagal menyimpan preferensi." };
  }
}

export async function addGithubRepo(
  formData: FormData
): Promise<{ readonly success?: boolean; readonly error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const raw = {
    repo: (formData.get("repo") as string)?.trim(),
    branch: (formData.get("branch") as string)?.trim() || "main",
  };

  const parsed = addRepoSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Input repo tidak valid" };
  }

  const clean = parsed.data.repo
    .replace(/^https?:\/\/github\.com\//, "")
    .replace(/\.git$/, "");
  const parts = clean.split("/");
  if (parts.length < 2) {
    return { error: "Format repository harus 'owner/repo' atau URL GitHub" };
  }

  const repoFullName = `${parts[0]}/${parts[1]}`;

  try {
    await db.githubRepo.upsert({
      where: {
        userId_repoFullName: {
          userId: session.user.id,
          repoFullName,
        },
      },
      create: {
        userId: session.user.id,
        repoFullName,
        branch: parsed.data.branch,
        isActive: true,
      },
      update: {
        branch: parsed.data.branch,
        isActive: true,
      },
    });

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    revalidatePath("/reports");
    return { success: true };
  } catch (err) {
    console.error("Add repo error:", err);
    return { error: "Gagal menambahkan repository." };
  }
}

export async function deleteGithubRepo(
  id: string
): Promise<{ readonly success?: boolean; readonly error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const parsed = deleteRepoSchema.safeParse({ repoId: id });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "ID repository tidak valid" };
  }

  try {
    await db.githubRepo.delete({
      where: { id, userId: session.user.id },
    });

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    revalidatePath("/reports");
    return { success: true };
  } catch (err) {
    console.error("Delete repo error:", err);
    return { error: "Gagal menghapus repository." };
  }
}

export async function toggleTrackRepo(
  id: string,
  isActive: boolean
): Promise<{ readonly success?: boolean; readonly error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const parsed = toggleTrackRepoSchema.safeParse({ repoId: id, isActive });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Parameter tidak valid" };
  }

  try {
    await db.githubRepo.update({
      where: { id, userId: session.user.id },
      data: { isActive },
    });

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    revalidatePath("/reports");
    return { success: true };
  } catch (err) {
    console.error("Toggle repo error:", err);
    return { error: "Gagal memperbarui status tracking." };
  }
}

export async function savePersonalGithubToken(
  token: string
): Promise<{ readonly success?: boolean; readonly error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const cleanToken = token.trim();
  if (!cleanToken) {
    return { error: "Token GitHub tidak boleh kosong" };
  }

  if (!cleanToken.startsWith("ghp_") && !cleanToken.startsWith("github_pat_")) {
    return { error: "Format token tidak valid. Harus diawali 'ghp_' atau 'github_pat_'" };
  }

  try {
    await db.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: "github_pat",
          providerAccountId: session.user.id,
        },
      },
      create: {
        userId: session.user.id,
        type: "personal_access_token",
        provider: "github_pat",
        providerAccountId: session.user.id,
        access_token: cleanToken,
      },
      update: {
        access_token: cleanToken,
      },
    });

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    revalidatePath("/reports");
    return { success: true };
  } catch (err) {
    console.error("Save personal GitHub token error:", err);
    return { error: "Gagal menyimpan token GitHub." };
  }
}

export async function deletePersonalGithubToken(): Promise<{
  readonly success?: boolean;
  readonly error?: string;
}> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await db.account.deleteMany({
      where: {
        userId: session.user.id,
        provider: "github_pat",
      },
    });

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    revalidatePath("/reports");
    return { success: true };
  } catch (err) {
    console.error("Delete personal GitHub token error:", err);
    return { error: "Gagal menghapus token GitHub." };
  }
}
