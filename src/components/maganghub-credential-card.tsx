"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  saveMaganghubCredential,
  testMaganghubConnection,
} from "@/app/(dashboard)/settings/actions";
import {
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Activity,
} from "lucide-react";

interface MaganghubCredentialCardProps {
  status?: string;
  hasCredential: boolean;
  lastCheckedAt?: Date | null;
}

export function MaganghubCredentialCard({
  status = "UNCHECKED",
  hasCredential,
  lastCheckedAt,
}: MaganghubCredentialCardProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    const res = await testMaganghubConnection();
    if ("error" in res && res.error) {
      setTestResult({ success: false, message: res.error });
    } else {
      setTestResult(res as { success: boolean; message: string });
    }
    setTesting(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const res = await saveMaganghubCredential(formData);

    if (res?.error) {
      setError(res.error);
    } else {
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
      setTimeout(() => setSuccess(false), 3000);
    }
    setLoading(false);
  };

  const getStatusBadge = () => {
    switch (status) {
      case "VALID":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-primary-soft text-primary border border-primary/20">
            <CheckCircle2 className="w-3 h-3" /> Valid
          </span>
        );
      case "INVALID":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-error/10 text-error border border-error/20">
            <AlertCircle className="w-3 h-3" /> Tidak Valid
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-surface text-ink-muted border border-hairline">
            {hasCredential ? "Belum Diverifikasi" : "Belum Dikonfigurasi"}
          </span>
        );
    }
  };

  return (
    <div className="bg-canvas-subtle border border-hairline rounded-md p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-sm bg-primary-soft border border-primary/20 flex items-center justify-center text-primary">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-ink-primary">
              Kredensial MagangHub (SSO Kemnaker)
            </h2>
            <p className="text-xs text-ink-secondary">
              Disimpan aman dengan enkripsi AES-256-GCM.
            </p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {success && (
        <div className="p-3 bg-primary-soft border border-primary/20 rounded-sm text-xs text-primary flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Kredensial berhasil disimpan dan dienkripsi.
        </div>
      )}

      {error && (
        <div className="p-3 bg-error/10 border border-error/20 rounded-sm text-xs text-error">
          {error}
        </div>
      )}

      {testResult && (
        <div
          className={`p-3 rounded-sm text-xs flex items-center gap-2 ${
            testResult.success
              ? "bg-primary-soft border border-primary/20 text-primary"
              : "bg-error/10 border border-error/20 text-error"
          }`}
        >
          {testResult.success ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{testResult.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-ink-secondary">
            Email Akun MagangHub / Kemnaker
          </label>
          <Input
            name="email"
            type="email"
            placeholder="nama@email.com"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-ink-secondary">
            Password Akun MagangHub / Kemnaker
          </label>
          <div className="relative">
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-primary p-1"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <span className="text-[11px] text-ink-muted">
            {lastCheckedAt
              ? `Terakhir dicek: ${new Date(lastCheckedAt).toLocaleString("id-ID")}`
              : "Belum pernah dicek"}
          </span>

          <div className="flex items-center gap-2">
            {hasCredential && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTestConnection}
                disabled={testing || loading}
                className="gap-1.5 text-xs h-9 border-hairline hover:border-primary text-ink-secondary hover:text-primary"
              >
                {testing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Activity className="w-3.5 h-3.5" />
                )}
                {testing ? "Menguji Login..." : "Uji Login Monev"}
              </Button>
            )}

            <Button
              type="submit"
              variant="emerald"
              disabled={loading || testing}
              className="gap-2 h-9 text-xs"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Simpan Kredensial
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
