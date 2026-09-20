import { z } from "zod";

export const saveCredentialSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password tidak boleh kosong"),
});

export type SaveCredentialPayload = z.infer<typeof saveCredentialSchema>;
