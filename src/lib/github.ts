import axios from "axios";
import { db } from "@/lib/db";

export interface GitHubCommit {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
}

export interface RepoCommitGroup {
  repoFullName: string;
  branch: string;
  commits: GitHubCommit[];
}

export function cleanCommitMessage(msg: string): string {
  // Take first line of commit message
  const firstLine = msg.split("\n")[0].trim();
  return firstLine;
}

export function isUsefulCommit(msg: string): boolean {
  const lower = msg.toLowerCase();
  // Filter out merge commits and trivial noise
  if (lower.startsWith("merge pull request") || lower.startsWith("merge branch")) {
    return false;
  }
  if (lower.startsWith("wip") && lower.length < 5) {
    return false;
  }
  return true;
}

export async function fetchRepoCommits({
  owner,
  repo,
  branch = "main",
  date,
  token,
}: {
  owner: string;
  repo: string;
  branch?: string;
  date: string; // YYYY-MM-DD
  token?: string;
}): Promise<GitHubCommit[]> {
  const since = `${date}T00:00:00Z`;
  const until = `${date}T23:59:59Z`;

  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "MagangHub-Bot-Attendance",
  };

  if (token) {
    headers.Authorization = `token ${token}`;
  }

  try {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/commits`,
      {
        params: {
          sha: branch,
          since,
          until,
          per_page: 50,
        },
        headers,
        timeout: 10000,
      }
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawCommits = response.data.map((item: any) => ({
      sha: item.sha.substring(0, 7),
      message: cleanCommitMessage(item.commit.message),
      author: item.commit.author?.name || "Unknown",
      date: item.commit.author?.date || "",
      url: item.html_url,
    }));

    return rawCommits.filter((c: GitHubCommit) => isUsefulCommit(c.message));
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error(`Repository ${owner}/${repo} tidak ditemukan atau private.`);
    }
    if (error.response?.status === 401) {
      throw new Error("Token GitHub tidak valid atau telah kadaluarsa.");
    }
    throw new Error(
      error.response?.data?.message || "Gagal mengambil commit dari GitHub API."
    );
  }
}

export async function fetchAllTrackedCommitsForUser(
  userId: string,
  date: string
): Promise<RepoCommitGroup[]> {
  const trackedRepos = await db.githubRepo.findMany({
    where: { userId, isActive: true },
  });

  if (trackedRepos.length === 0) {
    return [];
  }

  const results: RepoCommitGroup[] = [];

  for (const r of trackedRepos) {
    const [owner, repo] = r.repoFullName.split("/");
    if (!owner || !repo) continue;

    try {
      const commits = await fetchRepoCommits({
        owner,
        repo,
        branch: r.branch,
        date,
      });

      if (commits.length > 0) {
        results.push({
          repoFullName: r.repoFullName,
          branch: r.branch,
          commits,
        });
      }
    } catch (err) {
      console.warn(`Could not fetch commits for ${r.repoFullName}:`, err);
    }
  }

  return results;
}
