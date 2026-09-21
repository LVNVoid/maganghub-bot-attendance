import { z } from "zod";

export const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL wajib diisi"),
  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET wajib diisi"),
  ENCRYPTION_KEY: z.string().min(32, "ENCRYPTION_KEY minimal 32 karakter"),
  GITHUB_TOKEN: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_BASE_URL: z.string().optional(),
  OPENAI_MODEL: z.string().optional(),
  MAGANGHUB_PROXY_URL: z.string().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("❌ Invalid environment variables:", result.error.format());
    return null;
  }
  return result.data;
}
