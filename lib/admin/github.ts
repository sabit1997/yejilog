import "server-only";
import { Octokit } from "octokit";
import { auth } from "@/lib/admin/auth";
import blogConfig from "@/blog.config";

const { owner, name: repo, branch } = blogConfig.repo;

async function getOctokit(): Promise<Octokit> {
  const session = await auth();
  const token = session?.accessToken;
  if (!token) throw new Error("Not authenticated");
  return new Octokit({ auth: token });
}

export async function writePost(opts: {
  path: string;
  content: string;
  message: string;
  sha?: string;
}): Promise<{ sha: string; commitSha: string }> {
  const octokit = await getOctokit();
  const encoded = Buffer.from(opts.content, "utf-8").toString("base64");

  const res = await octokit.rest.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: opts.path,
    message: opts.message,
    content: encoded,
    branch,
    sha: opts.sha,
  });

  return {
    sha: res.data.content?.sha ?? "",
    commitSha: res.data.commit.sha ?? "",
  };
}

export async function listPostPaths(): Promise<string[]> {
  const octokit = await getOctokit();
  const res = await octokit.rest.git.getTree({
    owner,
    repo,
    tree_sha: branch,
    recursive: "true",
  });
  return res.data.tree
    .filter(
      (entry) =>
        entry.type === "blob" &&
        entry.path?.startsWith("posts/") &&
        entry.path.endsWith(".md")
    )
    .map((entry) => entry.path as string);
}

export async function readPost(
  path: string
): Promise<{ content: string; sha: string } | null> {
  const octokit = await getOctokit();
  try {
    const res = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
    });
    if (Array.isArray(res.data) || res.data.type !== "file") return null;
    const content = Buffer.from(res.data.content, "base64").toString("utf-8");
    return { content, sha: res.data.sha };
  } catch (err) {
    if ((err as { status?: number }).status === 404) return null;
    throw err;
  }
}
