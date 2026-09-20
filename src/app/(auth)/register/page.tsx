"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerUser } from "@/actions/auth-actions";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      setLoading(false);
      return;
    }

    try {
      const res = await registerUser(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        router.push("/login?registered=true");
      }
    } catch {
      setError("Terjadi kesalahan saat pendaftaran.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-canvas-subtle border border-hairline rounded-md p-4 sm:p-6 space-y-5 sm:space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-lg sm:text-xl font-semibold text-ink-primary">Daftar Akun Baru</h1>
        <p className="text-xs text-ink-secondary">
          Mulai otomatisasi laporan magang Anda
        </p>
      </div>

      {error && (
        <div className="p-3 bg-error/10 border border-error/20 rounded-sm text-xs text-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-ink-secondary">Nama Lengkap</label>
          <Input
            name="name"
            type="text"
            placeholder="John Doe"
            required
            className="h-10 sm:h-9 text-base sm:text-xs"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-ink-secondary">Email</label>
          <Input
            name="email"
            type="email"
            placeholder="nama@email.com"
            required
            className="h-10 sm:h-9 text-base sm:text-xs"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-ink-secondary">Password</label>
          <Input
            name="password"
            type="password"
            placeholder="Minimal 6 karakter"
            required
            className="h-10 sm:h-9 text-base sm:text-xs"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-ink-secondary">Konfirmasi Password</label>
          <Input
            name="confirmPassword"
            type="password"
            placeholder="Ketik ulang password"
            required
            className="h-10 sm:h-9 text-base sm:text-xs"
          />
        </div>

        <Button
          type="submit"
          variant="emerald"
          className="w-full h-10 sm:h-9 text-xs font-semibold"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Mendaftar...
            </>
          ) : (
            "Daftar"
          )}
        </Button>
      </form>

      <div className="text-center text-xs text-ink-muted">
        Sudah memiliki akun?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Masuk sekarang
        </Link>
      </div>
    </div>
  );
}
