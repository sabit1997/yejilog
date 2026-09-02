import postsData from "@/public/posts.json";
import type { Post } from "@/types/post";

/**
 * 홈·아카이브·카테고리 화면이 같은 목록을 보게 하는 단일 출처.
 * 정렬과 카테고리 집계가 화면마다 따로 굴러가면 링크 구조가 어긋난다.
 */
export const allPosts: Post[] = [...(postsData as Post[])].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
);

/** 글이 많은 카테고리를 앞에 둔다. 아카이브에서 훑기 쉬운 순서다. */
export const categoriesWithCount: { name: string; count: number }[] = Object.entries(
  allPosts.reduce<Record<string, number>>((acc, post) => {
    acc[post.category] = (acc[post.category] ?? 0) + 1;
    return acc;
  }, {})
)
  .map(([name, count]) => ({ name, count }))
  .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

/** 홈 필터가 쓰는 목록. "All"이 먼저 오고 나머지는 글 등장 순서를 지킨다. */
export const categoryNames: string[] = Array.from(
  new Set(allPosts.map((post) => post.category))
);

export const allTags: string[] = Array.from(
  new Set((postsData as Post[]).flatMap((post) => post.tags))
);

export function getPostsByCategory(category: string): Post[] {
  return allPosts.filter((post) => post.category === category);
}

/**
 * URL 세그먼트를 실제 카테고리 이름으로 되돌린다.
 * `React&JS`, `Web API`처럼 인코딩이 필요한 이름이 있어 정확히 일치하는
 * 카테고리가 없으면 null을 주고, 호출한 쪽에서 404로 처리한다.
 */
export function resolveCategory(segment: string): string | null {
  let decoded = segment;
  try {
    decoded = decodeURIComponent(segment);
  } catch {
    return null;
  }

  return categoryNames.find((name) => name === decoded) ?? null;
}

export function categoryHref(category: string): string {
  return `/categories/${encodeURIComponent(category)}`;
}

export function postHref(slug: string): string {
  return `/posts/${encodeURI(slug)}`;
}
