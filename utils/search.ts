import type { Post } from "@/types/post";

export interface TagSearchResult { name: string; count: number; }
export interface SearchResults { posts: Post[]; tags: TagSearchResult[]; }

export function normalizeSearchText(value: string): string {
  return value.normalize("NFKC").toLocaleLowerCase().replace(/\s+/g, " ").trim();
}

function scorePost(post: Post, query: string): number {
  const title = normalizeSearchText(post.title);
  const category = normalizeSearchText(post.category);
  const tags = post.tags.map(normalizeSearchText);
  const body = normalizeSearchText(post.searchText);
  let score = 0;

  if (title === query) score += 120;
  else if (title.startsWith(query)) score += 90;
  else if (title.includes(query)) score += 70;
  if (tags.some((tag) => tag === query)) score += 60;
  else if (tags.some((tag) => tag.includes(query))) score += 45;
  if (category === query) score += 40;
  else if (category.includes(query)) score += 30;
  if (body.includes(query)) score += 10;
  return score;
}

export function searchPosts(posts: Post[], rawQuery: string, limit = 8): SearchResults {
  const query = normalizeSearchText(rawQuery);
  if (!query) return { posts: [], tags: [] };

  const rankedPosts = posts
    .map((post, index) => ({ post, index, score: scorePost(post, query) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map(({ post }) => post);

  const tagCounts = new Map<string, TagSearchResult>();
  for (const post of posts) {
    for (const tag of post.tags) {
      const normalizedTag = normalizeSearchText(tag);
      const current = tagCounts.get(normalizedTag);
      tagCounts.set(normalizedTag, { name: current?.name ?? tag, count: (current?.count ?? 0) + 1 });
    }
  }

  const tags = [...tagCounts.entries()]
    .filter(([normalizedTag]) => normalizedTag.includes(query))
    .map(([, result]) => result)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, limit);

  return { posts: rankedPosts, tags };
}
