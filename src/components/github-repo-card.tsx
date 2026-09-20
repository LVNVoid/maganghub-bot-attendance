"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  addGithubRepo,
  deleteGithubRepo,
  toggleTrackRepo,
} from "@/app/(dashboard)/settings/actions";
import { Github, Plus, Trash2, GitBranch, Loader2, Check } from "lucide-react";

export interface TrackedRepo {
  id: string;
  repoFullName: string;
  branch: string;
  isActive: boolean;
}

interface GithubRepoCardProps {
  repos: TrackedRepo[];
}

export function GithubRepoCard({ repos }: GithubRepoCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const res = await addGithubRepo(formData);

    if (res?.error) {
      setError(res.error);
    } else {
      (e.target as HTMLFormElement).reset();
    }
    setLoading(false);
  };

  return (
    <div className="bg-canvas-subtle border border-hairline rounded-md p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-sm bg-primary-soft border border-primary/20 flex items-center justify-center text-primary">
            <Github className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-ink-primary">
              GitHub Repositories (Sumber Aktivitas)
            </h2>
            <p className="text-xs text-ink-secondary">
              Commit history akan diekstrak otomatis sebagai dasar pembuatan laporan harian
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-error/10 border border-error/20 rounded-sm text-xs text-error">
          {error}
        </div>
      )}

      {/* Add Repo Form */}
      <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            name="repo"
            placeholder="owner/nama-repo atau URL GitHub"
            required
          />
        </div>
        <div className="w-full sm:w-36">
          <Input name="branch" placeholder="main" defaultValue="main" />
        </div>
        <Button
          type="submit"
          variant="secondary"
          disabled={loading}
          className="gap-1.5 shrink-0"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
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
                  onClick={() => toggleTrackRepo(r.id, !r.isActive)}
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
                  onClick={() => deleteGithubRepo(r.id)}
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
