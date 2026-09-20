"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

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

  try {
    const existing = await db.user.findUnique({
      where: { email },
    });

    if (existing) {
      return { error: "Email sudah terdaftar. Silakan masuk." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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
