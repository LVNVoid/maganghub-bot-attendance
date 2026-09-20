import { RepoCommitGroup } from "@/lib/github";

export function formatCommitsToActivitySummary(groups: RepoCommitGroup[]): string {
  if (!groups || groups.length === 0) {
    return "Melakukan perbaikan bug, penyesuaian kode, dan pengujian fitur aplikasi secara lokal.";
  }

  const lines: string[] = [];

  for (const group of groups) {
    if (group.commits.length === 0) continue;

    const commitDescriptions = group.commits
      .map((c) => `${c.message} (${c.sha})`)
      .join("; ");

    lines.push(`- [${group.repoFullName}]: ${commitDescriptions}`);
  }

  if (lines.length === 0) {
    return "Melakukan perbaikan bug, penyesuaian kode, dan pengujian fitur aplikasi secara lokal.";
  }

  return lines.join("\n");
}
