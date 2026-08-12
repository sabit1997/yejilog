import { remark } from "remark";
import remarkParse from "remark-parse";

export interface TableOfContentsItem {
  id: string;
  text: string;
  level: 1 | 2 | 3;
}

interface MarkdownNode {
  type: string;
  depth?: number;
  value?: string;
  alt?: string;
  children?: MarkdownNode[];
}

function getMarkdownNodeText(node: MarkdownNode): string {
  if (node.type === "image") return node.alt ?? "";
  if (node.type === "html") return (node.value ?? "").replace(/<[^>]+>/g, "");
  if (node.value !== undefined) return node.value;
  if (!node.children) return "";

  return node.children.map(getMarkdownNodeText).join("");
}

export function slugifyHeading(text: string): string {
  return (
    text
      .normalize("NFKC")
      .toLocaleLowerCase("ko-KR")
      .trim()
      .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
      .replace(/[\s-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section"
  );
}

export function createHeadingSlugger() {
  const occurrences = new Map<string, number>();

  return {
    slug(text: string) {
      const base = slugifyHeading(text);
      const count = (occurrences.get(base) ?? 0) + 1;
      occurrences.set(base, count);
      return count === 1 ? base : `${base}-${count}`;
    },
  };
}

export function extractTableOfContents(
  markdown: string
): TableOfContentsItem[] {
  const tree = remark().use(remarkParse).parse(markdown) as MarkdownNode;
  const slugger = createHeadingSlugger();
  const items: TableOfContentsItem[] = [];

  function visit(node: MarkdownNode) {
    if (
      node.type === "heading" &&
      node.depth !== undefined &&
      node.depth >= 1 &&
      node.depth <= 3
    ) {
      const text = getMarkdownNodeText(node).trim();
      items.push({
        id: slugger.slug(text),
        text,
        level: node.depth as TableOfContentsItem["level"],
      });
    }

    node.children?.forEach(visit);
  }

  visit(tree);
  return items;
}
