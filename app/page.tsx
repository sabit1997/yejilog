import postsData from "../public/posts.json";
import blogConfig from "@/blog.config";
import HomeClient from "@/components/home/HomeClient";
import type { Post } from "@/types/post";

const typedPosts = postsData as Post[];
const categories = [
  "All",
  ...Array.from(new Set(typedPosts.map((p) => p.category))),
];
const allTags = Array.from(new Set(typedPosts.flatMap((p) => p.tags)));

export default function Home() {
  return (
    <HomeClient
      posts={typedPosts}
      categories={categories}
      allTags={allTags}
      initialVisibleCount={blogConfig.configs.countOfInitialPost}
    />
  );
}
