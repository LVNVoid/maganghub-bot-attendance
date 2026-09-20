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
}): Promise<{ commits: GitHubCommit[]; detectedBranch: string }> {
  // Use Jakarta timezone (WIB, UTC+7) window
  const since = new Date(`${date}T00:00:00+07:00`).toISOString();
  const until = new Date(`${date}T23:59:59+07:00`).toISOString();

  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "MagangHub-Bot-Attendance",
  };

  if (token) {
    headers.Authorization = `token ${token}`;
  }

  let activeBranch = branch;

  try {
    let response;
    try {
      response = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/commits`,
        {
          params: {
            sha: activeBranch,
            since,
            until,
            per_page: 50,
          },
          headers,
          timeout: 10000,
        }
      );
    } catch (branchErr: any) {
      // If branch not found (404), fetch default branch from repo info
      if (branchErr.response?.status === 404) {
        const repoInfo = await axios.get(
          `https://api.github.com/repos/${owner}/${repo}`,
          { headers, timeout: 8000 }
        );
        const defaultBranch = repoInfo.data?.default_branch || "master";
        if (defaultBranch !== activeBranch) {
          activeBranch = defaultBranch;
          response = await axios.get(
            `https://api.github.com/repos/${owner}/${repo}/commits`,
            {
              params: {
                sha: activeBranch,
                since,
                until,
                per_page: 50,
              },
              headers,
              timeout: 10000,
            }
          );
        } else {
          throw branchErr;
        }
      } else {
        throw branchErr;
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawCommits = response.data.map((item: any) => ({
      sha: item.sha.substring(0, 7),
      message: cleanCommitMessage(item.commit.message),
      author: item.commit.author?.name || "Unknown",
      date: item.commit.author?.date || "",
      url: item.html_url,
    }));

    const commits = rawCommits.filter((c: GitHubCommit) => isUsefulCommit(c.message));
    return { commits, detectedBranch: activeBranch };
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

  // Look for GitHub OAuth access token from user accounts
  const ghAccount = await db.account.findFirst({
    where: { userId, provider: "github" },
  });
  const token = ghAccount?.access_token || process.env.GITHUB_TOKEN;

  const results: RepoCommitGroup[] = [];

  for (const r of trackedRepos) {
    const [owner, repo] = r.repoFullName.split("/");
    if (!owner || !repo) continue;

    try {
      const { commits, detectedBranch } = await fetchRepoCommits({
        owner,
        repo,
        branch: r.branch,
        date,
        token,
      });

      // Update repo branch in DB if auto-detected different branch
      if (detectedBranch !== r.branch) {
        await db.githubRepo.update({
          where: { id: r.id },
          data: { branch: detectedBranch },
        });
      }

      if (commits.length > 0) {
        results.push({
          repoFullName: r.repoFullName,
          branch: detectedBranch,
          commits,
        });
      }
    } catch (err) {
      console.warn(`Could not fetch commits for ${r.repoFullName}:`, err);
    }
  }

  return results;
}
