import { Suspense } from "react";
import Link from "next/link";
import blogConfig from "@/blog.config";
import CategorySection from "@/components/home/categorySection";
import PostList from "@/components/home/postList";
import ProfileSection from "@/components/home/profileSection";
import TagSection from "@/components/home/tagSection";
import InfinitePostLoader from "@/components/home/InfinitePostLoader";
import { matchesPostFilters } from "@/utils/postFilters";
import {
  allPosts as sortedPosts,
  allTags,
  categoryNames,
} from "@/utils/postCatalog";

const typedPosts = sortedPosts;
const categories = ["All", ...categoryNames];

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

  const filteredPosts = sortedPosts.filter((post) =>
    matchesPostFilters(post, selectedCategory, selectedTags)
  );

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
    <main id="main-content">
      <div className="wrap home-wrap">
        <ProfileSection />
        <div id="filter" className="filter-wrap">
          <CategorySection
            selectedCategory={selectedCategory}
            selectedTags={selectedTags}
            categories={categories}
          />
          <Suspense>
            <TagSection
              posts={typedPosts.map(({ category, tags }) => ({ category, tags }))}
              selectedCategory={selectedCategory}
              allTags={allTags}
              initialTags={selectedTags}
            />
          </Suspense>
        </div>
        <PostList
          displayedPosts={displayedPosts}
          totalCount={filteredPosts.length}
        />
        {hasMore && (
          <InfinitePostLoader
            nextHref={`/?${loadMoreParams.toString()}`}
            visibleCount={displayedPosts.length}
            totalCount={filteredPosts.length}
          />
        )}

        {/* 무한 스크롤은 크롤러가 따라올 수 없다. 전체 목록으로 가는
            링크를 항상 두어 모든 글이 홈에서 두 단계 안에 들어오게 한다. */}
        <Link href="/archive" className="back-btn archive-link">
          전체 글 {sortedPosts.length}개 보기 →
        </Link>
      </div>
    </main>
  );
}
