import "server-only";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { toValidDate } from "@/utils/posts";
import { listPostPaths, readPost } from "@/lib/admin/github";

const postsDirectory = path.join(process.cwd(), "posts");

export interface AdminPostSummary {
  slug: string;
  title: string;
  date: string;
  category: string;
  tags: string[];
  isPrivate: boolean;
  /** ISO or 'YYYY-MM-DD HH:mm:ss'. 미래 값이면 공개 페이지에는 아직 안 뜬다. */
  publishAt?: string;
  /** true면 로컬 FS/배포본에는 아직 없고 GitHub에만 있는 파일 */
  pendingDeploy?: boolean;
}

function collectMarkdownFiles(dir: string, files: string[] = []): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collectMarkdownFiles(full, files);
    else if (entry.name.endsWith(".md")) files.push(full);
  }
  return files;
}

function toDateString(value: unknown): string {
  if (value instanceof Date)
    return Number.isNaN(value.getTime())
      ? ""
      : value.toISOString().slice(0, 16).replace("T", " ");
  return typeof value === "string" ? value : "";
}

function parseFrontmatter(
  relativePath: string,
  raw: string,
  pendingDeploy = false
): AdminPostSummary {
  const { data } = matter(raw);
  const publishAt = data.publishAt ? toDateString(data.publishAt) : undefined;
  return {
    slug: relativePath.replace(/\.md$/, "").split(path.sep).join("/"),
    title: typeof data.title === "string" ? data.title : relativePath,
    date: toDateString(data.date),
    category: typeof data.category === "string" ? data.category : "",
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    isPrivate: data.isPrivate === true,
    ...(publishAt ? { publishAt } : {}),
    ...(pendingDeploy ? { pendingDeploy } : {}),
  };
}

export function listAllPostsForAdmin(): AdminPostSummary[] {
  const files = collectMarkdownFiles(postsDirectory);
  return files
    .map((fullPath) => {
      const relative = path.relative(postsDirectory, fullPath);
      const raw = fs.readFileSync(fullPath, "utf8");
      return parseFrontmatter(relative, raw);
    })
    .sort(sortByDateDesc);
}

/**
 * FS + GitHub 병합 목록. FS에 없지만 리포에 있는 파일(방금 커밋된 것 등)은 pendingDeploy=true로 붙는다.
 */
export async function listAllPostsForAdminFresh(): Promise<AdminPostSummary[]> {
  const fsList = listAllPostsForAdmin();
  const fsPaths = new Set(fsList.map((p) => `posts/${p.slug}.md`));

  let remotePaths: string[] = [];
  try {
    remotePaths = await listPostPaths();
  } catch {
    return fsList;
  }

  const missing = remotePaths.filter((p) => !fsPaths.has(p));
  if (missing.length === 0) return fsList;

  const fetched = await Promise.all(
    missing.map(async (p) => {
      const res = await readPost(p);
      if (!res) return null;
      const relative = p.replace(/^posts\//, "");
      return parseFrontmatter(relative, res.content, true);
    })
  );

  return [...fsList, ...fetched.filter((x): x is AdminPostSummary => !!x)].sort(
    sortByDateDesc
  );
}

function sortByDateDesc(a: AdminPostSummary, b: AdminPostSummary) {
  const ta = toValidDate(a.date)?.getTime() ?? 0;
  const tb = toValidDate(b.date)?.getTime() ?? 0;
  return tb - ta;
}
