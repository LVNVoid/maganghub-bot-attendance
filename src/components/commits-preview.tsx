"use client";

import { useState } from "react";
import { RepoCommitGroup, GitHubCommit } from "@/lib/github";
import { GitCommit, GitBranch, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CommitsPreviewProps {
  groups: RepoCommitGroup[];
  date: string;
}

interface FlattenedCommit extends GitHubCommit {
  repoFullName: string;
  branch: string;
}

const PAGE_SIZE = 5;

export function CommitsPreview({ groups, date }: CommitsPreviewProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Flatten and sort commits by date descending
  const allCommits: FlattenedCommit[] = groups
    .flatMap((group) =>
      group.commits.map((c) => ({
        ...c,
        repoFullName: group.repoFullName,
        branch: group.branch,
      }))
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalCommits = allCommits.length;

  if (totalCommits === 0) {
    return (
      <div className="p-6 rounded-md bg-canvas-subtle border border-hairline text-center space-y-2">
        <GitCommit className="w-8 h-8 text-ink-muted mx-auto" />
        <div className="text-xs font-medium text-ink-secondary">
          Belum ada aktivitas commit pada {date}
        </div>
        <p className="text-[11px] text-ink-muted max-w-sm mx-auto">
          Commit yang Anda push ke branch yang di-track akan muncul otomatis di sini sebagai bahan laporan harian.
        </p>
      </div>
    );
  }

  const totalPages = Math.ceil(totalCommits / PAGE_SIZE);
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const currentCommits = allCommits.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <div className="bg-canvas-subtle border border-hairline rounded-md p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitCommit className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-ink-primary">
            Aktivitas Commit ({date})
          </span>
        </div>
        <span className="text-[11px] font-mono text-ink-muted">
          {totalCommits} commit ditemukan
        </span>
      </div>

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
                oleh {c.author} &bull; {new Date(c.date).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-hairline text-xs">
          <span className="text-[11px] text-ink-muted">
            Menampilkan {startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, totalCommits)} dari {totalCommits} commit
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
              disabled={safePage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-0.5" />
              Prev
            </Button>
            <span className="text-[11px] font-mono text-ink-secondary px-1.5">
              {safePage} / {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
              disabled={safePage === totalPages}
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
