"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  saveMaganghubCredential,
  deleteMaganghubCredential,
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
  ShieldCheck,
  Pencil,
  Trash2,
} from "lucide-react";

interface MaganghubCredentialCardProps {
  status?: string;
  hasCredential: boolean;
  lastCheckedAt?: Date | null;
  emailDisplay?: string;
}

export function MaganghubCredentialCard({
  status = "UNCHECKED",
  hasCredential,
  lastCheckedAt,
  emailDisplay,
}: MaganghubCredentialCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [deleting, setDeleting] = useState(false);
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

  const handleDelete = async () => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus kredensial MagangHub yang tersimpan?")) {
      return;
    }
    setDeleting(true);
    setError(null);
    setTestResult(null);

    const res = await deleteMaganghubCredential();
    if (res?.error) {
      setError(res.error);
    } else {
      setIsEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setDeleting(false);
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
      setIsEditing(false);
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
          Operasi kredensial berhasil diproses.
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

      {hasCredential && !isEditing ? (
        <div className="space-y-4">
          <div className="p-4 rounded-sm bg-canvas border border-hairline flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-soft/50 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-ink-primary">
                    {emailDisplay || "Kredensial Tersimpan"}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface text-ink-muted border border-hairline font-mono">
                    AES-256-GCM
                  </span>
                </div>
                <p className="text-xs text-ink-muted mt-0.5">
                  Password tersimpan aman terenkripsi di database.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTestConnection}
                disabled={testing || deleting}
                className="gap-1.5 text-xs h-9 border-hairline hover:border-primary text-ink-secondary hover:text-primary"
              >
                {testing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Activity className="w-3.5 h-3.5" />
                )}
                {testing ? "Menguji Login..." : "Uji Login Monev"}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                disabled={testing || deleting}
                className="gap-1.5 text-xs h-9 border-hairline text-ink-secondary hover:text-ink-primary"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={testing || deleting}
                className="gap-1.5 text-xs h-9 border-hairline border-error/30 text-error hover:bg-error/10 hover:border-error"
              >
                {deleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                Hapus
              </Button>
            </div>
          </div>

          <div className="text-[11px] text-ink-muted">
            {lastCheckedAt
              ? `Terakhir dicek: ${new Date(lastCheckedAt).toLocaleString("id-ID")}`
              : "Belum pernah dicek"}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-ink-secondary">
              Email Akun MagangHub / Kemnaker
            </label>
            <Input
              name="email"
              type="email"
              placeholder="nama@email.com"
              defaultValue={isEditing ? emailDisplay : ""}
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
              {isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                  className="h-9 text-xs border-hairline text-ink-secondary"
                >
                  Batal
                </Button>
              )}

              <Button
                type="submit"
                variant="emerald"
                disabled={loading || testing}
                className="gap-2 h-9 text-xs"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isEditing ? "Perbarui Kredensial" : "Simpan Kredensial"}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
