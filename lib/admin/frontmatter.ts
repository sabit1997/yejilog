import matter from "gray-matter";

export interface PostFrontmatter {
  title: string;
  date: string;
  category: string;
  tags: string[];
  isPrivate: boolean;
  updated?: string;
  /** ISO or 'YYYY-MM-DD HH:mm:ss'. 이 시각까지 공개하지 않는다. */
  publishAt?: string;
}

function escapeYaml(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export function buildMarkdown(front: PostFrontmatter, body: string): string {
  const tags = front.tags.map((t) => `"${escapeYaml(t)}"`).join(", ");
  const lines = [
    "---",
    `title: "${escapeYaml(front.title)}"`,
    `date: ${front.date}`,
    `category: "${escapeYaml(front.category)}"`,
    `tags: [${tags}]`,
    `isPrivate: ${front.isPrivate}`,
  ];
  if (front.updated) lines.push(`updated: ${front.updated}`);
  if (front.publishAt) lines.push(`publishAt: ${front.publishAt}`);
  lines.push("---", "");
  return `${lines.join("\n")}\n${body.trimStart()}`;
}

function toStringSafe(value: unknown): string {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? ""
      : value.toISOString().slice(0, 19).replace("T", " ");
  }
  return typeof value === "string" ? value : "";
}

export function parseMarkdown(raw: string): {
  front: PostFrontmatter;
  body: string;
} {
  const { data, content } = matter(raw);
  return {
    front: {
      title: typeof data.title === "string" ? data.title : "",
      date: toStringSafe(data.date),
      category: typeof data.category === "string" ? data.category : "",
      tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
      isPrivate: data.isPrivate === true,
      updated: data.updated ? toStringSafe(data.updated) : undefined,
      publishAt: data.publishAt ? toStringSafe(data.publishAt) : undefined,
    },
    body: content,
  };
}
