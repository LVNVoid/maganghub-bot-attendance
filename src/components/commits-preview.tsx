"use client";

import { RepoCommitGroup } from "@/lib/github";
import { GitCommit, GitBranch, ExternalLink } from "lucide-react";

interface CommitsPreviewProps {
  groups: RepoCommitGroup[];
  date: string;
}

export function CommitsPreview({ groups, date }: CommitsPreviewProps) {
  const totalCommits = groups.reduce((acc, g) => acc + g.commits.length, 0);

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

      <div className="space-y-4">
        {groups.map((group) => (
          <div key={group.repoFullName} className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-ink-secondary">
              <span>{group.repoFullName}</span>
              <span className="flex items-center gap-1 text-[10px] text-ink-muted font-mono">
                <GitBranch className="w-3 h-3" /> {group.branch}
              </span>
            </div>

            <div className="space-y-1.5 pl-2 border-l border-hairline">
              {group.commits.map((c) => (
                <div
                  key={c.sha}
                  className="flex items-start justify-between gap-3 text-xs p-2 rounded-xs bg-canvas-deep border border-hairline"
                >
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-ink-primary font-mono text-xs truncate">
                      {c.message}
                    </p>
                    <div className="text-[10px] text-ink-muted">
                      oleh {c.author} &bull; {new Date(c.date).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>

                  <a
                    href={c.url}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 flex items-center gap-1 text-[10px] font-mono text-primary hover:underline"
                  >
                    <span>{c.sha}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
