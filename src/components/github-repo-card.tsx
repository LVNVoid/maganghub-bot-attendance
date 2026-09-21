"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  addGithubRepo,
  deleteGithubRepo,
  toggleTrackRepo,
  savePersonalGithubToken,
  deletePersonalGithubToken,
} from "@/actions/settings-actions";
import {
  Github,
  Plus,
  Trash2,
  GitBranch,
  Loader2,
  Check,
  KeyRound,
  ShieldCheck,
  Info,
} from "lucide-react";

export interface TrackedRepo {
  id: string;
  repoFullName: string;
  branch: string;
  isActive: boolean;
}

interface GithubRepoCardProps {
  repos: TrackedRepo[];
  hasToken?: boolean;
  tokenType?: "OAUTH" | "PAT";
}

export function GithubRepoCard({
  repos,
  hasToken = false,
  tokenType,
}: GithubRepoCardProps) {
  const [loading, setLoading] = useState(false);
  const [tokenInput, setTokenInput] = useState("");
  const [savingToken, setSavingToken] = useState(false);
  const [deletingToken, setDeletingToken] = useState(false);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await addGithubRepo(formData);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Repository berhasil ditambahkan.");
      (e.target as HTMLFormElement).reset();
    }
    setLoading(false);
  };

  const handleToggle = async (id: string, nextActive: boolean) => {
    const res = await toggleTrackRepo(id, nextActive);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success(nextActive ? "Repository diaktifkan." : "Tracking repository dijeda.");
    }
  };

  const handleDelete = async (id: string, repoName: string) => {
    const res = await deleteGithubRepo(id);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success(`Repository ${repoName} dihapus.`);
    }
  };

  const handleSaveToken = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSavingToken(true);
    const res = await savePersonalGithubToken(tokenInput);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Token GitHub berhasil disimpan.");
      setTokenInput("");
    }
    setSavingToken(false);
  };

  const handleDeleteToken = async () => {
    setDeletingToken(true);
    const res = await deletePersonalGithubToken();
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Token GitHub dihapus.");
    }
    setDeletingToken(false);
  };

  return (
    <div className="bg-canvas-subtle border border-hairline rounded-md p-4 sm:p-6 space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-sm bg-primary-soft border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Github className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-ink-primary">
              GitHub Repositories (Sumber Aktivitas)
            </h2>
            <p className="text-xs text-ink-secondary">
              Commit history diekstrak otomatis sebagai dasar laporan harian.
            </p>
          </div>
        </div>
      </div>

      {/* GitHub Access Token Section (Multi-User) */}
      <div className="p-3 sm:p-4 rounded-sm bg-canvas border border-hairline space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <KeyRound className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="text-xs font-semibold text-ink-primary">
              Akses &amp; Token GitHub (Multi-User)
            </span>
          </div>

          {hasToken && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-primary-soft text-primary border border-primary/20">
                <ShieldCheck className="w-3 h-3" />
                {tokenType === "OAUTH" ? "OAuth Terhubung (5.000 req/jam)" : "Personal Token Aktif"}
              </span>
              {tokenType === "PAT" && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={deletingToken}
                  onClick={handleDeleteToken}
                  className="h-6 px-2 text-[11px] text-error hover:bg-error/10"
                >
                  {deletingToken ? "Menghapus..." : "Hapus Token"}
                </Button>
              )}
            </div>
          )}
        </div>

        {!hasToken && (
          <form onSubmit={handleSaveToken} className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <Input
                type="password"
                placeholder="Personal Access Token (ghp_... atau github_pat_...)"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                required
                className="text-xs h-9 sm:h-8"
              />
            </div>
            <Button
              type="submit"
              variant="secondary"
              disabled={savingToken || !tokenInput.trim()}
              className="h-9 sm:h-8 px-3 text-xs shrink-0 font-medium"
            >
              {savingToken ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
              ) : (
                <KeyRound className="w-3.5 h-3.5 mr-1" />
              )}
              Simpan Token
            </Button>
          </form>
        )}

        <p className="text-[11px] text-ink-muted leading-relaxed flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-ink-secondary" />
          <span>
            {hasToken
              ? "Token ini digunakan untuk mengekstrak commit dari akun GitHub Anda dengan kuota 5.000 req/jam serta mendukung repository Private."
              : "Jika Anda mendaftar via Email & Password atau ingin mengakses repository Private, masukkan GitHub Personal Access Token (classic `ghp_` dengan scope `repo`)."}
          </span>
        </p>
      </div>

      {/* Add Repo Form */}
      <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
        <div className="flex-1">
          <Input
            name="repo"
            placeholder="owner/nama-repo atau URL GitHub"
            required
            className="text-xs h-9 sm:h-8"
          />
        </div>
        <div className="w-full sm:w-32">
          <Input name="branch" placeholder="main" defaultValue="main" className="text-xs h-9 sm:h-8" />
        </div>
        <Button
          type="submit"
          variant="secondary"
          disabled={loading}
          className="gap-1.5 shrink-0 w-full sm:w-auto h-9 sm:h-8 text-xs"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Plus className="w-3.5 h-3.5" />
          )}
          Tambah Repo
        </Button>
      </form>

      {/* Tracked Repos List */}
      <div className="space-y-2 pt-2 border-t border-hairline">
        {repos.length === 0 ? (
          <div className="text-center py-6 text-xs text-ink-muted">
            Belum ada repository yang dihubungkan. Tambahkan di atas.
          </div>
        ) : (
          repos.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between p-3 rounded-sm bg-canvas-deep border border-hairline hover:border-hairline-prominent transition-colors"
            >
              <div className="flex items-center gap-3">
                <Github className="w-4 h-4 text-ink-secondary" />
                <div>
                  <div className="text-xs font-medium text-ink-primary">
                    {r.repoFullName}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-ink-muted">
                    <GitBranch className="w-3 h-3" />
                    <span>branch: {r.branch}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggle(r.id, !r.isActive)}
                  className={`h-7 text-[11px] gap-1 ${
                    r.isActive ? "text-primary border-primary/30" : "text-ink-muted"
                  }`}
                >
                  {r.isActive && <Check className="w-3 h-3" />}
                  {r.isActive ? "Tracked" : "Paused"}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(r.id, r.repoFullName)}
                  className="h-7 w-7 p-0 text-ink-muted hover:text-error"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
