import assert from "node:assert/strict";
import test from "node:test";
import { getRecentPosts, normalizeSearchText, searchPosts } from "../utils/search.ts";
import type { Post } from "../types/post.ts";

const posts: Post[] = [
  { slug: "body", title: "다른 제목", date: "2026-01-01", category: "Nextjs", tags: ["SSR"], excerpt: "Hydration 본문", searchText: "Hydration 본문" },
  { slug: "title", title: "Hydration 해결", date: "2026-01-02", category: "React", tags: ["Hydration"], excerpt: "설명", searchText: "설명" },
];

test("search normalization is whitespace and case stable", () => {
  assert.equal(normalizeSearchText("  HYDRATION\n오류  "), "hydration 오류");
});

test("title matches rank above body-only matches and tags are grouped", () => {
  const result = searchPosts(posts, "hydration");
  assert.deepEqual(result.posts.map((post) => post.slug), ["title", "body"]);
  assert.deepEqual(result.tags, [{ name: "Hydration", count: 1 }]);
});

test("recent posts are sorted by date instead of source file order", () => {
  const unsorted = [
    { ...posts[0], slug: "old", date: "2022-01-01" },
    { ...posts[0], slug: "latest", date: "2026-03-03" },
    { ...posts[0], slug: "middle", date: "2025-08-13" },
  ];

  assert.deepEqual(getRecentPosts(unsorted, 2).map((post) => post.slug), ["latest", "middle"]);
});
