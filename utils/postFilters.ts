export interface FilterablePost {
  category: string;
  tags: string[];
}

export function matchesPostFilters(
  post: FilterablePost,
  category: string,
  tags: string[]
): boolean {
  const matchesCategory = category === "All" || post.category === category;
  return matchesCategory && tags.every((tag) => post.tags.includes(tag));
}

export function countPostsForTag(
  posts: FilterablePost[],
  category: string,
  selectedTags: string[],
  candidateTag: string
): number {
  const requiredTags = selectedTags.includes(candidateTag)
    ? selectedTags
    : [...selectedTags, candidateTag];
  return posts.filter((post) => matchesPostFilters(post, category, requiredTags)).length;
}
