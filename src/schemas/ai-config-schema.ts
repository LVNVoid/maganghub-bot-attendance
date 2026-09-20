import { z } from "zod";

export const aiConfigSchema = z.object({
  provider: z.string().default("openai_compatible"),
  baseUrl: z
    .string()
    .url("Base URL harus berupa URL valid (contoh: https://api.groq.com/openai/v1)"),
  modelName: z
    .string()
    .min(1, "Nama model tidak boleh kosong (contoh: llama-3.3-70b-versatile)"),
  apiKey: z.string().min(1, "API Key tidak boleh kosong"),
});

export type AiConfigInput = z.infer<typeof aiConfigSchema>;

export const testAiConfigSchema = z.object({
  baseUrl: z.string().url("Base URL tidak valid"),
  modelName: z.string().min(1, "Nama model wajib diisi"),
  apiKey: z.string().optional(),
});
