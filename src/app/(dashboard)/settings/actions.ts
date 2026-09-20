"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { encrypt } from "@/lib/crypto";
import { revalidatePath } from "next/cache";
import crypto from "node:crypto";
import { z } from "zod";

const credentialSchema = z.object({
  email: z.string().email("Format email MagangHub tidak valid"),
  password: z.string().min(1, "Password tidak boleh kosong"),
});

export async function saveMaganghubCredential(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = credentialSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Input tidak valid" };
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

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (err) {
    console.error("Save credential error:", err);
    return { error: "Gagal menyimpan kredensial." };
  }
}

export async function toggleAutomation(enabled: boolean) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

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

    revalidatePath("/dashboard/settings");
    return { success: true, isEnabled: enabled };
  } catch (err) {
    console.error("Toggle automation error:", err);
    return { error: "Gagal memperbarui status otomasi." };
  }
}

export async function regenerateWebhookKey() {
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

    revalidatePath("/dashboard/settings");
    return { success: true, webhookKey: updated.webhookKey };
  } catch (err) {
    console.error("Regenerate webhook key error:", err);
    return { error: "Gagal generate webhook key baru." };
  }
}

export async function updateAutomationPreferences(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const scheduleTime = formData.get("scheduleTime") as string;

  try {
    await db.automationConfig.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        scheduleTime: scheduleTime || "13:50",
        webhookKey: crypto.randomBytes(24).toString("hex"),
      },
      update: {
        scheduleTime: scheduleTime || "13:50",
      },
    });

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (err) {
    console.error("Update preferences error:", err);
    return { error: "Gagal menyimpan preferensi." };
  }
}

export async function addGithubRepo(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const repoInput = (formData.get("repo") as string)?.trim();
  const branch = (formData.get("branch") as string)?.trim() || "main";

  if (!repoInput) return { error: "Nama repository wajib diisi" };

  let owner = "";
  let repo = "";

  const clean = repoInput.replace(/^https?:\/\/github\.com\//, "").replace(/\.git$/, "");
  const parts = clean.split("/");
  if (parts.length >= 2) {
    owner = parts[0];
    repo = parts[1];
  } else {
    return { error: "Format repository harus 'owner/repo' atau URL GitHub" };
  }

  const repoFullName = `${owner}/${repo}`;

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
        branch,
        isActive: true,
      },
      update: {
        branch,
        isActive: true,
      },
    });

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (err) {
    console.error("Add repo error:", err);
    return { error: "Gagal menambahkan repository." };
  }
}

export async function deleteGithubRepo(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await db.githubRepo.delete({
      where: { id, userId: session.user.id },
    });

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (err) {
    console.error("Delete repo error:", err);
    return { error: "Gagal menghapus repository." };
  }
}

export async function toggleTrackRepo(id: string, isActive: boolean) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await db.githubRepo.update({
      where: { id, userId: session.user.id },
      data: { isActive },
    });

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (err) {
    console.error("Toggle repo error:", err);
    return { error: "Gagal memperbarui status tracking." };
  }
}
