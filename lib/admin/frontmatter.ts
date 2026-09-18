export interface PostFrontmatter {
  title: string;
  date: string;
  category: string;
  tags: string[];
  isPrivate: boolean;
}

function escapeYaml(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export function buildMarkdown(front: PostFrontmatter, body: string): string {
  const tags = front.tags.map((t) => `"${escapeYaml(t)}"`).join(", ");
  const yaml = [
    "---",
    `title: "${escapeYaml(front.title)}"`,
    `date: ${front.date}`,
    `category: "${escapeYaml(front.category)}"`,
    `tags: [${tags}]`,
    `isPrivate: ${front.isPrivate}`,
    "---",
    "",
  ].join("\n");
  return `${yaml}\n${body.trimStart()}`;
}
