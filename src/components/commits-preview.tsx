"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { RepoCommitGroup, GitHubCommit } from "@/lib/github";
import {
  GitCommit,
  GitBranch,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Plus,
  History,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCommitsPagination } from "@/hooks/use-commits-pagination";

interface CommitsPreviewProps {
  groups: RepoCommitGroup[];
  recentGroups?: RepoCommitGroup[];
  date: string;
  trackedRepoCount?: number;
}

interface FlattenedCommit extends GitHubCommit {
  repoFullName: string;
  branch: string;
}

function formatShortDate(dateStr: string) {
  if (!dateStr) return "-";
  try {
    const parts = dateStr.split("-").map(Number);
    if (parts.length !== 3) return dateStr;
    const [y, m, d] = parts;
    const months = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
    ];
    return `${String(d).padStart(2, "0")} ${months[m - 1]} ${y}`;
  } catch {
    return dateStr;
  }
}

export function CommitsPreview({
  groups,
  recentGroups = [],
  date,
  trackedRepoCount = 0,
}: CommitsPreviewProps) {
  const [viewMode, setViewMode] = useState<"today" | "all">("today");

  // Flatten and sort today commits
  const todayCommits: FlattenedCommit[] = useMemo(() => {
    return groups
      .flatMap((group) =>
        group.commits.map((c) => ({
          ...c,
          repoFullName: group.repoFullName,
          branch: group.branch,
        }))
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [groups]);

  // Flatten and sort all recent commits
  const recentCommits: FlattenedCommit[] = useMemo(() => {
    return recentGroups
      .flatMap((group) =>
        group.commits.map((c) => ({
          ...c,
          repoFullName: group.repoFullName,
          branch: group.branch,
        }))
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [recentGroups]);

  const activeCommits = viewMode === "today" ? todayCommits : recentCommits;
  const totalCommits = activeCommits.length;

  const PAGE_SIZE = 5;
  const {
    currentPage,
    setCurrentPage,
    paginatedItems: currentCommits,
    totalPages,
  } = useCommitsPagination(activeCommits, PAGE_SIZE);

  // If no repos are tracked at all
  if (trackedRepoCount === 0) {
    return (
      <div className="p-6 rounded-md bg-canvas-subtle border border-hairline text-center space-y-3">
        <GitCommit className="w-8 h-8 text-ink-muted mx-auto" />
        <div className="text-xs font-semibold text-ink-primary">
          Belum Ada Repository yang Dihubungkan
        </div>
        <p className="text-[11px] text-ink-secondary max-w-sm mx-auto leading-relaxed">
          Hubungkan repository GitHub Anda di menu Pengaturan agar commit harian dapat diekstrak otomatis sebagai bahan laporan.
        </p>
        <Link href="/settings" className="inline-block">
          <Button variant="secondary" size="sm" className="gap-1.5 text-xs h-8">
            <Plus className="w-3.5 h-3.5" />
            <span>Hubungkan Repository</span>
          </Button>
        </Link>
      </div>
    );
  }

  const startIndex = (currentPage - 1) * PAGE_SIZE;

  return (
    <div className="bg-canvas-subtle border border-hairline rounded-md p-4 sm:p-5 space-y-4">
      {/* Header with Mode Switcher */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-hairline">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-sm bg-canvas-deep border border-hairline flex items-center justify-center text-primary shrink-0">
            <GitCommit className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-semibold text-ink-primary truncate">
              {viewMode === "today"
                ? "Aktivitas Commit Hari Ini"
                : "Riwayat Commit Terakhir"}
            </h3>
            <p className="text-[11px] text-ink-muted truncate">
              {viewMode === "today"
                ? `${formatShortDate(date)} • ${totalCommits} commit`
                : `${trackedRepoCount} repository • ${totalCommits} commit`}
            </p>
          </div>
        </div>

        {/* View Toggle Buttons */}
        <div className="flex items-center bg-canvas-deep p-0.5 rounded-sm border border-hairline shrink-0">
          <button
            type="button"
            onClick={() => {
              setViewMode("today");
              setCurrentPage(1);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xs text-xs font-medium transition-all ${
              viewMode === "today"
                ? "bg-surface-elevated text-ink-primary shadow-xs border border-hairline"
                : "text-ink-muted hover:text-ink-secondary"
            }`}
          >
            <Calendar className="w-3 h-3 text-primary" />
            <span>Hari Ini</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                todayCommits.length > 0
                  ? "bg-primary-soft text-primary font-semibold"
                  : "bg-surface text-ink-muted"
              }`}
            >
              {todayCommits.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setViewMode("all");
              setCurrentPage(1);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xs text-xs font-medium transition-all ${
              viewMode === "all"
                ? "bg-surface-elevated text-ink-primary shadow-xs border border-hairline"
                : "text-ink-muted hover:text-ink-secondary"
            }`}
          >
            <History className="w-3 h-3 text-primary" />
            <span>Semua Riwayat</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                recentCommits.length > 0
                  ? "bg-primary-soft text-primary font-semibold"
                  : "bg-surface text-ink-muted"
              }`}
            >
              {recentCommits.length}
            </span>
          </button>
        </div>
      </div>

      {/* Commit List or Empty State */}
      {totalCommits === 0 ? (
        <div className="py-8 px-4 text-center space-y-3">
          <GitCommit className="w-8 h-8 text-ink-muted mx-auto" />
          <div className="text-xs font-medium text-ink-secondary">
            {viewMode === "today"
              ? `Belum ada aktivitas commit pada ${date}`
              : "Belum ada riwayat commit pada repository yang terhubung."}
          </div>
          <p className="text-[11px] text-ink-muted max-w-sm mx-auto leading-relaxed">
            {viewMode === "today"
              ? `Sistem sedang memantau ${trackedRepoCount} repository. Commit yang Anda push ke branch yang di-track akan muncul otomatis di sini.`
              : "Pastikan repository dan branch yang terhubung di pengaturan sudah memiliki riwayat commit."}
          </p>

          {viewMode === "today" && recentCommits.length > 0 && (
            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setViewMode("all");
                  setCurrentPage(1);
                }}
                className="gap-1.5 text-xs h-8 border-hairline hover:border-primary/40"
              >
                <History className="w-3.5 h-3.5 text-primary" />
                <span>Lihat Semua Riwayat ({recentCommits.length})</span>
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {currentCommits.map((c) => (
            <div
              key={`${c.repoFullName}-${c.sha}`}
              className="flex items-start justify-between gap-3 text-xs p-2.5 rounded-xs bg-canvas-deep border border-hairline hover:border-hairline-prominent transition-colors"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-xs bg-surface border border-hairline text-ink-secondary">
                    {c.repoFullName}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-ink-muted font-mono">
                    <GitBranch className="w-2.5 h-2.5" /> {c.branch}
                  </span>
                </div>
                <p className="text-ink-primary font-mono text-xs truncate" title={c.message}>
                  {c.message}
                </p>
                <div className="text-[10px] text-ink-muted">
                  oleh {c.author} &bull;{" "}
                  {new Date(c.date).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  {new Date(c.date).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  WIB
                </div>
              </div>

              <a
                href={c.url}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 flex items-center gap-1 text-[10px] font-mono text-primary hover:underline pt-0.5"
                title="Lihat di GitHub"
              >
                <span>{c.sha.slice(0, 7)}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-hairline text-xs">
          <span className="text-[11px] text-ink-muted">
            Menampilkan {startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, totalCommits)} dari{" "}
            {totalCommits} commit
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-0.5" />
              Prev
            </Button>
            <span className="text-[11px] font-mono text-ink-secondary px-1.5">
              {currentPage} / {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
