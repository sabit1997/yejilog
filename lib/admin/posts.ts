import "server-only";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { toValidDate } from "@/utils/posts";

const postsDirectory = path.join(process.cwd(), "posts");

export interface AdminPostSummary {
  slug: string;
  title: string;
  date: string;
  category: string;
  tags: string[];
  isPrivate: boolean;
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

export function listAllPostsForAdmin(): AdminPostSummary[] {
  const files = collectMarkdownFiles(postsDirectory);

  return files
    .map((fullPath) => {
      const relative = path.relative(postsDirectory, fullPath);
      const { data } = matter(fs.readFileSync(fullPath, "utf8"));

      return {
        slug: relative.replace(/\.md$/, "").split(path.sep).join("/"),
        title: typeof data.title === "string" ? data.title : relative,
        date: toDateString(data.date),
        category: typeof data.category === "string" ? data.category : "",
        tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
        isPrivate: data.isPrivate === true,
      } satisfies AdminPostSummary;
    })
    .sort((a, b) => {
      const ta = toValidDate(a.date)?.getTime() ?? 0;
      const tb = toValidDate(b.date)?.getTime() ?? 0;
      return tb - ta;
    });
}
