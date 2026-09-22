"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";

const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(100),
  email: z.string().email("Format email tidak valid").toLowerCase().trim(),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

const BCRYPT_SALT_ROUNDS = 12;

export async function registerUser(formData: FormData) {
  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = registerSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Input tidak valid" };
  }

  const { name, email, password } = parsed.data;

  const rateLimitKey = `register:${email}`;
  const rateCheck = checkRateLimit(rateLimitKey, { windowMs: 60_000, maxRequests: 3 });
  if (!rateCheck.allowed) {
    return { error: "Terlalu banyak percobaan pendaftaran. Silakan coba lagi nanti." };
  }

  try {
    const existing = await db.user.findUnique({
      where: { email },
    });

    if (existing) {
      return { error: "Email sudah terdaftar. Silakan masuk." };
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        automation: {
          create: {},
        },
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Register error:", error);
    return { error: "Gagal mendaftarkan akun. Silakan coba lagi." };
  }
}
