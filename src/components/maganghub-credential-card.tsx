"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  saveMaganghubCredential,
  deleteMaganghubCredential,
  testMaganghubConnection,
} from "@/actions/settings-actions";
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleTestConnection = async () => {
    setTesting(true);

    const res = await testMaganghubConnection();
    if ("error" in res && res.error) {
      toast.error(res.error);
    } else if ("message" in res) {
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    }
    setTesting(false);
  };

  const handleDelete = async () => {
    setDeleting(true);

    const res = await deleteMaganghubCredential();
    setShowDeleteConfirm(false);
    if (res?.error) {
      toast.error(res.error);
    } else {
      setIsEditing(false);
      toast.success("Kredensial MagangHub berhasil dihapus.");
    }
    setDeleting(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await saveMaganghubCredential(formData);

    if (res?.error) {
      toast.error(res.error);
    } else {
      setIsEditing(false);
      toast.success("Kredensial MagangHub berhasil disimpan.");
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
    <div className="bg-canvas-subtle border border-hairline rounded-md p-4 sm:p-6 space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-sm bg-primary-soft border border-primary/20 flex items-center justify-center text-primary shrink-0">
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
        <div>{getStatusBadge()}</div>
      </div>

      {hasCredential && !isEditing ? (
        <div className="space-y-3 sm:space-y-4">
          <div className="p-3.5 sm:p-4 rounded-sm bg-canvas border border-hairline flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary-soft/50 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs sm:text-sm font-medium text-ink-primary truncate">
                    {emailDisplay || "Kredensial Tersimpan"}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface text-ink-muted border border-hairline font-mono shrink-0">
                    AES-256-GCM
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-ink-muted mt-0.5">
                  Password tersimpan aman terenkripsi di database.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto pt-2 md:pt-0 border-t border-hairline/60 md:border-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTestConnection}
                disabled={testing || deleting}
                className="flex-1 sm:flex-initial gap-1.5 text-xs h-9 sm:h-8 border-hairline hover:border-primary text-ink-secondary hover:text-primary"
              >
                {testing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Activity className="w-3.5 h-3.5" />
                )}
                {testing ? "Menguji..." : "Uji Login"}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                disabled={testing || deleting}
                className="flex-1 sm:flex-initial gap-1.5 text-xs h-9 sm:h-8 border-hairline text-ink-secondary hover:text-ink-primary"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={testing || deleting}
                className="flex-1 sm:flex-initial gap-1.5 text-xs h-9 sm:h-8 border-hairline border-error/30 text-error hover:bg-error/10 hover:border-error"
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

      {/* Confirm Dialog Hapus Kredensial */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Hapus Kredensial MagangHub"
        description="Apakah Anda yakin ingin menghapus kredensial MagangHub yang tersimpan? Bot tidak akan dapat melakukan absensi atau mengirimkan laporan otomatis sampai kredensial baru ditambahkan."
        confirmText="Ya, Hapus Kredensial"
        cancelText="Batal"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
