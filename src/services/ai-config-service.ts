import { db } from "@/services/db";
import { encrypt, decrypt } from "@/lib/crypto";

export interface DecryptedAiConfig {
  provider: string;
  baseUrl: string;
  modelName: string;
  apiKey: string;
}

export async function getUserAiConfig(userId: string) {
  return db.userAiConfig.findUnique({
    where: { userId },
  });
}

export async function getDecryptedUserAiConfig(
  userId: string
): Promise<DecryptedAiConfig | null> {
  const config = await getUserAiConfig(userId);
  if (!config) return null;

  try {
    const apiKey = decrypt(config.encryptedApiKey, config.iv, config.authTag);
    return {
      provider: config.provider,
      baseUrl: config.baseUrl,
      modelName: config.modelName,
      apiKey,
    };
  } catch (error) {
    console.error("Gagal mendekripsi AI API Key user:", error);
    return null;
  }
}

export async function saveUserAiConfig(
  userId: string,
  data: {
    provider?: string;
    baseUrl: string;
    modelName: string;
    apiKey: string;
  }
) {
  const encrypted = encrypt(data.apiKey);

  return db.userAiConfig.upsert({
    where: { userId },
    update: {
      provider: data.provider || "openai_compatible",
      baseUrl: data.baseUrl,
      modelName: data.modelName,
      encryptedApiKey: encrypted.ciphertext,
      iv: encrypted.iv,
      authTag: encrypted.authTag,
    },
    create: {
      userId,
      provider: data.provider || "openai_compatible",
      baseUrl: data.baseUrl,
      modelName: data.modelName,
      encryptedApiKey: encrypted.ciphertext,
      iv: encrypted.iv,
      authTag: encrypted.authTag,
    },
  });
}

export async function deleteUserAiConfig(userId: string) {
  return db.userAiConfig.deleteMany({
    where: { userId },
  });
}
