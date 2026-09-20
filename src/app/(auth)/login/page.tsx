"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Github, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Email atau password salah.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Terjadi kesalahan saat masuk.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-canvas-subtle border border-hairline rounded-md p-6 space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-xl font-semibold text-ink-primary">Masuk ke Akun</h1>
        <p className="text-xs text-ink-secondary">
          Kelola absensi & laporan MagangHub Anda
        </p>
      </div>

      {error && (
        <div className="p-3 bg-error/10 border border-error/20 rounded-sm text-xs text-error">
          {error}
        </div>
      )}

      <Button
        variant="secondary"
        className="w-full gap-2 border-hairline hover:border-hairline-prominent"
        onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
        type="button"
      >
        <Github className="w-4 h-4" />
        Masuk dengan GitHub
      </Button>

      <div className="relative flex items-center justify-center">
        <div className="border-t border-hairline w-full" />
        <span className="bg-canvas-subtle px-2 text-[10px] uppercase text-ink-muted absolute">
          atau email
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-ink-secondary">Email</label>
          <Input
            type="email"
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-xs font-medium text-ink-secondary">Password</label>
          </div>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button
          type="submit"
          variant="emerald"
          className="w-full"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Memproses...
            </>
          ) : (
            "Masuk"
          )}
        </Button>
      </form>

      <div className="text-center text-xs text-ink-muted">
        Belum punya akun?{" "}
        <Link href="/register" className="text-primary hover:underline">
          Daftar sekarang
        </Link>
      </div>
    </div>
  );
}
