import fs from "fs";
import path from "path";
import matter from "gray-matter";
import {
  extractTableOfContents,
  type TableOfContentsItem,
} from "@/utils/headings";

const postsDirectory = path.join(process.cwd(), "posts");

function getAllMarkdownFiles(dirPath: string, files: string[] = []): string[] {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      getAllMarkdownFiles(fullPath, files);
    } else if (entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }
  return files;
}

export interface PostMeta {
  title: string;
  date: string;
  category: string;
  tags?: string[];
  isPrivate: boolean;
  /** 본문을 고친 시각. 있으면 sitemap lastModified 기준이 된다. */
  updated?: string;
  /** 이 시각까지 공개하지 않는다. 없으면 즉시 공개. */
  publishAt?: string;
}

/** publishAt이 있고 지금보다 미래면 아직 공개되면 안 된다. */
export function isScheduledForFuture(publishAt: unknown): boolean {
  const d = toValidDate(publishAt);
  if (!d) return false;
  return d.getTime() > Date.now();
}

/** 유효한 Date만 통과시킨다. frontmatter에는 `18:06:77` 같은 값도 섞여 있다. */
export function toValidDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value !== "string" && typeof value !== "number") return null;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * 글이 마지막으로 갱신된 시각.
 * frontmatter `updated` → 파일 mtime 순으로 찾고, 둘 다 못 믿으면 null을 준다.
 * Vercel은 git clone으로 빌드하므로 mtime은 사실상 빌드 시각이 된다.
 */
function getUpdatedAt(fullPath: string, data: Record<string, unknown>): Date | null {
  const fromFrontmatter = toValidDate(data.updated);
  if (fromFrontmatter) return fromFrontmatter;

  try {
    return toValidDate(fs.statSync(fullPath).mtime);
  } catch {
    return null;
  }
}

export interface PostContent extends PostMeta {
  slug: string;
  markdown: string;
  tableOfContents: TableOfContentsItem[];
}

export async function getPostContent(
  slug: string
): Promise<PostContent | null> {
  const safeSlug = slug.replace(/\.md$/, "");
  const fullPath = path.resolve(postsDirectory, ...safeSlug.split("/")) + ".md";
  const postsRoot = `${path.resolve(postsDirectory)}${path.sep}`;

  if (!fullPath.startsWith(postsRoot) || !fs.existsSync(fullPath)) return null;

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const meta = data as PostMeta;
  if (meta.isPrivate === true) return null;
  if (isScheduledForFuture(meta.publishAt)) return null;

  return {
    slug,
    markdown: content,
    tableOfContents: extractTableOfContents(content),
    ...meta,
  };
}

export function getAllSlugs(): string[][] {
  const allFiles = getAllMarkdownFiles(postsDirectory);
  return allFiles
    .filter((fullPath) => {
      const { data } = matter(fs.readFileSync(fullPath, "utf8"));
      if (data.isPrivate === true) return false;
      if (isScheduledForFuture(data.publishAt)) return false;
      return true;
    })
    .map((fullPath) => {
      const relativePath = path
        .relative(postsDirectory, fullPath)
        .replace(/\.md$/, "");
      return relativePath.split(path.sep);
    });
}

export function getAllPostMeta(): {
  slug: string;
  date: string;
  title: string;
  isPrivate?: boolean;
  publishAt?: string;
  updatedAt: Date | null;
}[] {
  const files = getAllMarkdownFiles(postsDirectory);

  return files
    .map((fullPath) => {
      const relativePath = path.relative(postsDirectory, fullPath);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data } = matter(fileContents);

      return {
        slug: relativePath.replace(/\.md$/, "").split(path.sep).join("/"),
        title: data.title,
        date: data.date,
        isPrivate: data.isPrivate ?? false,
        publishAt: data.publishAt,
        updatedAt: getUpdatedAt(fullPath, data),
      };
    })
    .filter((post) => post.isPrivate !== true)
    .filter((post) => !isScheduledForFuture(post.publishAt))
    .sort(
      (a, b) =>
        (toValidDate(b.date)?.getTime() ?? 0) - (toValidDate(a.date)?.getTime() ?? 0)
    );
}

export function getPrevNextPosts(currentSlug: string) {
  const allPosts = getAllPostMeta();
  const index = allPosts.findIndex((post) => post.slug === currentSlug);

  return {
    prev: allPosts[index + 1] ?? null,
    next: allPosts[index - 1] ?? null,
  };
}
