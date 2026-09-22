import { db } from "@/services/db";

export async function getUserMaganghubCredential(userId: string) {
  return db.maganghubCredential.findUnique({
    where: { userId },
  });
}

export async function saveUserMaganghubCredential(
  userId: string,
  encryptedEmail: string,
  encryptedPassword: string,
  iv: string,
  authTag: string
) {
  return db.maganghubCredential.upsert({
    where: { userId },
    update: {
      encryptedEmail,
      encryptedPassword,
      iv,
      authTag,
      status: "UNCHECKED",
    },
    create: {
      userId,
      encryptedEmail,
      encryptedPassword,
      iv,
      authTag,
      status: "UNCHECKED",
    },
  });
}

export async function deleteUserMaganghubCredential(userId: string) {
  return db.maganghubCredential.deleteMany({
    where: { userId },
  });
}

export async function getUserAutomationConfig(userId: string) {
  return db.automationConfig.findUnique({
    where: { userId },
  });
}

export async function updateAutomationConfig(
  userId: string,
  data: {
    isEnabled?: boolean;
    scheduleTime?: string;
    scheduleDays?: string;
    autoGenerate?: boolean;
    webhookKey?: string;
  }
) {
  return db.automationConfig.upsert({
    where: { userId },
    update: data,
    create: {
      userId,
      isEnabled: data.isEnabled ?? false,
      scheduleTime: data.scheduleTime ?? "13:50",
      scheduleDays: data.scheduleDays ?? "1,2,3,4,5,6",
      autoGenerate: data.autoGenerate ?? true,
      webhookKey: data.webhookKey,
    },
  });
}

export async function getUserTrackedRepos(userId: string) {
  return db.githubRepo.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function addTrackedRepo(
  userId: string,
  repoFullName: string,
  branch: string
) {
  return db.githubRepo.create({
    data: {
      userId,
      repoFullName,
      branch,
      isActive: true,
    },
  });
}

export async function deleteTrackedRepo(id: string, userId: string) {
  return db.githubRepo.deleteMany({
    where: { id, userId },
  });
}

export async function toggleTrackedRepo(
  id: string,
  userId: string,
  isActive: boolean
) {
  return db.githubRepo.updateMany({
    where: { id, userId },
    data: { isActive },
  });
}

export async function getUserGithubAccount(userId: string) {
  return db.account.findFirst({
    where: {
      userId,
      provider: { in: ["github", "github_pat"] },
    },
    select: {
      id: true,
      provider: true,
      access_token: true,
    },
  });
}
