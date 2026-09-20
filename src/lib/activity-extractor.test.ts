import { describe, it, expect } from "vitest";
import { formatCommitsToActivitySummary } from "./activity-extractor";
import { RepoCommitGroup } from "./github";

describe("Activity Extractor", () => {
  it("should format repo commits into clear readable activity summary", () => {
    const mockGroups: RepoCommitGroup[] = [
      {
        repoFullName: "acme/frontend",
        branch: "main",
        commits: [
          {
            sha: "a1b2c3d",
            message: "feat: add dark mode theme toggle",
            author: "Developer",
            date: "2026-09-20T10:00:00Z",
            url: "https://github.com",
          },
          {
            sha: "e4f5g6h",
            message: "fix: resolve hydration mismatch",
            author: "Developer",
            date: "2026-09-20T11:00:00Z",
            url: "https://github.com",
          },
        ],
      },
    ];

    const result = formatCommitsToActivitySummary(mockGroups);
    expect(result).toContain("[acme/frontend]");
    expect(result).toContain("feat: add dark mode theme toggle (a1b2c3d)");
    expect(result).toContain("fix: resolve hydration mismatch (e4f5g6h)");
  });

  it("should return fallback activity when no commits exist", () => {
    const result = formatCommitsToActivitySummary([]);
    expect(result.length).toBeGreaterThan(20);
  });
});
