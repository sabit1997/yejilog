import fs from "fs";
import path from "path";
import matter from "gray-matter";

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
}

export async function getPostContent(
  slug: string
): Promise<({ slug: string; markdown: string } & PostMeta) | null> {
  const safeSlug = slug.replace(/\.md$/, "");
  const fullPath = path.join(postsDirectory, ...safeSlug.split("/")) + ".md";

  if (!fs.existsSync(fullPath)) return null;

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    slug,
    markdown: content,
    ...(data as PostMeta),
  };
}

export function getAllSlugs(): string[][] {
  const allFiles = getAllMarkdownFiles(postsDirectory);
  return allFiles.map((fullPath) => {
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
      };
    })
    .filter((post) => post.isPrivate !== true)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPrevNextPosts(currentSlug: string) {
  const allPosts = getAllPostMeta();
  const index = allPosts.findIndex((post) => post.slug === currentSlug);

  return {
    prev: allPosts[index + 1] ?? null,
    next: allPosts[index - 1] ?? null,
  };
}
