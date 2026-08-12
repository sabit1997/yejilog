import assert from "node:assert/strict";
import test from "node:test";
import { countPostsForTag, matchesPostFilters } from "../utils/postFilters.ts";

const posts = [
  { category: "Nextjs", tags: ["React", "Hydration"] },
  { category: "Nextjs", tags: ["React"] },
  { category: "CSS", tags: ["React", "Layout"] },
];

test("multiple tags use AND semantics", () => {
  assert.equal(posts.filter((post) => matchesPostFilters(post, "All", ["React", "Hydration"])).length, 1);
});

test("candidate counts include category and pending tags", () => {
  assert.equal(countPostsForTag(posts, "Nextjs", ["Hydration"], "React"), 1);
  assert.equal(countPostsForTag(posts, "Nextjs", ["Hydration"], "Layout"), 0);
});
