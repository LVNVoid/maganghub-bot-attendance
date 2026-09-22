import axios from "axios";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/crypto";

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

interface GitHubApiCommitItem {
  sha: string;
  commit: {
    message: string;
    author?: {
      name?: string;
      date?: string;
    };
  };
  html_url: string;
}

async function fetchCommitsFromAtomFeed({
  owner,
  repo,
  branch,
  since,
  until,
}: {
  owner: string;
  repo: string;
  branch: string;
  since: string;
  until: string;
}): Promise<{ commits: GitHubCommit[]; detectedBranch: string } | null> {
  const candidateBranches = [branch, "main", "master"].filter(
    (b, idx, arr) => arr.indexOf(b) === idx
  );

  const sinceTime = new Date(since).getTime();
  const untilTime = new Date(until).getTime();

  for (const b of candidateBranches) {
    const url = `https://github.com/${owner}/${repo}/commits/${b}.atom`;
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "MagangHub-Bot-Attendance" },
        next: { revalidate: 60 },
      });
      if (res.status === 404) continue;
      if (!res.ok) continue;

      const text = await res.text();
      const entries = text.split("<entry>").slice(1);
      const rawCommits: GitHubCommit[] = [];

      for (const entry of entries) {
        const sha = entry.match(/commit\/([a-f0-9]+)/)?.[1]?.substring(0, 7);
        const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim().replace(/\s+/g, " ");
        const updated = entry.match(/<updated>([\s\S]*?)<\/updated>/)?.[1]?.trim();
        const author = entry.match(/<author>[\s\S]*?<name>([\s\S]*?)<\/name>/)?.[1]?.trim();
        const link = entry.match(/<link[^>]*href="([^"]*)"/)?.[1];

        if (!sha || !updated) continue;

        const commitTime = new Date(updated).getTime();
        if (commitTime >= sinceTime && commitTime <= untilTime) {
          rawCommits.push({
            sha,
            message: cleanCommitMessage(title || ""),
            author: author || owner,
            date: updated,
            url: link || `https://github.com/${owner}/${repo}/commit/${sha}`,
          });
        }
      }

      const commits = rawCommits.filter((c) => isUsefulCommit(c.message));
      return { commits, detectedBranch: b };
    } catch {
      continue;
    }
  }

  return null;
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

  // If no token is available, prioritize public Atom feed to avoid Vercel shared IP rate limit
  if (!token) {
    const atomResult = await fetchCommitsFromAtomFeed({
      owner,
      repo,
      branch,
      since,
      until,
    });
    if (atomResult) {
      return atomResult;
    }
  }

  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "MagangHub-Bot-Attendance",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
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
    } catch (branchErr) {
      // If branch not found (404), fetch default branch from repo info
      if (axios.isAxiosError(branchErr) && branchErr.response?.status === 404) {
        const repoInfo = await axios.get<{ default_branch?: string }>(
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

    const rawCommits = (response.data as GitHubApiCommitItem[]).map((item) => ({
      sha: item.sha.substring(0, 7),
      message: cleanCommitMessage(item.commit.message),
      author: item.commit.author?.name || "Unknown",
      date: item.commit.author?.date || "",
      url: item.html_url,
    }));

    const commits = rawCommits.filter((c: GitHubCommit) => isUsefulCommit(c.message));
    return { commits, detectedBranch: activeBranch };
  } catch (error) {
    // Fallback to Atom feed on API error (e.g. 403 Rate Limit on Vercel shared IP)
    const atomFallback = await fetchCommitsFromAtomFeed({
      owner,
      repo,
      branch: activeBranch,
      since,
      until,
    });
    if (atomFallback) {
      return atomFallback;
    }

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error(`Repository ${owner}/${repo} tidak ditemukan atau private.`);
      }
      if (error.response?.status === 401) {
        throw new Error("Token GitHub tidak valid atau telah kadaluarsa.");
      }
      const dataMessage = (error.response?.data as { message?: string })?.message;
      throw new Error(dataMessage || "Gagal mengambil commit dari GitHub API.");
    }
    const msg = error instanceof Error ? error.message : "Gagal mengambil commit dari GitHub API.";
    throw new Error(msg);
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

  // Look for GitHub OAuth access token or personal access token from user accounts
  const ghAccount = await db.account.findFirst({
    where: {
      userId,
      provider: { in: ["github", "github_pat"] },
    },
    orderBy: { provider: "desc" }, // github_pat takes priority if explicitly provided
  });

  let token = process.env.GITHUB_TOKEN;
  if (ghAccount?.access_token) {
    try {
      const parsed = JSON.parse(ghAccount.access_token);
      if (parsed.ciphertext && parsed.iv && parsed.authTag) {
        token = decrypt(parsed.ciphertext, parsed.iv, parsed.authTag);
      } else {
        token = ghAccount.access_token;
      }
    } catch {
      token = ghAccount.access_token;
    }
  }

  const results = await Promise.allSettled(
    trackedRepos.map(async (r) => {
      const [owner, repo] = r.repoFullName.split("/");
      if (!owner || !repo) return null;

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
          return {
            repoFullName: r.repoFullName,
            branch: detectedBranch,
            commits,
          };
        }
        return null;
      } catch (err) {
        console.warn(`Could not fetch commits for ${r.repoFullName}:`, err);
        return null;
      }
    })
  );

  return results
    .filter(
      (res): res is PromiseFulfilledResult<RepoCommitGroup | null> =>
        res.status === "fulfilled"
    )
    .map((res) => res.value)
    .filter((item): item is RepoCommitGroup => item !== null);
}
