import { Suspense } from "react";
import postsData from "../public/posts.json";
import blogConfig from "@/blog.config";
import CategorySection from "@/components/home/categorySection";
import PostList from "@/components/home/postList";
import ProfileSection from "@/components/home/profileSection";
import TagSection from "@/components/home/tagSection";
import ProjectsSection from "@/components/home/ProjectsSection";
import type { Post } from "@/types/post";
import Link from "next/link";

const typedPosts = postsData as Post[];
const sortedPosts = [...typedPosts].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
);
const categories = [
  "All",
  ...Array.from(new Set(sortedPosts.map((p) => p.category))),
];
const allTags = Array.from(new Set(typedPosts.flatMap((p) => p.tags)));

interface HomeProps {
  searchParams?: Promise<{
    category?: string;
    tags?: string;
    limit?: string;
  }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = (await searchParams) ?? {};

  const selectedCategory =
    params.category && categories.includes(params.category)
      ? params.category
      : "All";

  const selectedTags = params.tags
    ? params.tags.split(",").filter((t) => allTags.includes(t))
    : [];

  const requestedLimit = Number(params.limit);
  const visibleCount =
    Number.isFinite(requestedLimit) && requestedLimit > 0
      ? requestedLimit
      : blogConfig.configs.countOfInitialPost;

  const filteredPosts = sortedPosts.filter((post) => {
    const categoryMatch =
      selectedCategory === "All" || post.category === selectedCategory;
    const tagMatch =
      selectedTags.length === 0 ||
      selectedTags.some((t) => post.tags.includes(t));
    return categoryMatch && tagMatch;
  });

  const displayedPosts = filteredPosts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPosts.length;

  const loadMoreParams = new URLSearchParams();
  if (selectedCategory !== "All") loadMoreParams.set("category", selectedCategory);
  if (selectedTags.length > 0) loadMoreParams.set("tags", selectedTags.join(","));
  loadMoreParams.set(
    "limit",
    String(visibleCount + blogConfig.configs.countOfInitialPost)
  );

  return (
    <main>
      <div className="wrap">
        <ProfileSection />
        <div id="posts" className="filter-wrap">
          <CategorySection
            selectedCategory={selectedCategory}
            selectedTags={selectedTags}
            categories={categories}
          />
          <Suspense>
            <TagSection allTags={allTags} initialTags={selectedTags} />
          </Suspense>
        </div>
        <PostList
          displayedPosts={displayedPosts}
          totalCount={filteredPosts.length}
        />
        {hasMore && (
          <div style={{ display: "flex", justifyContent: "center", padding: "24px 0" }}>
            <Link
              href={`/?${loadMoreParams.toString()}`}
              scroll={false}
              className="cat-chip"
            >
              더 보기
            </Link>
          </div>
        )}
        <ProjectsSection />
      </div>
    </main>
  );
}
