import type { Metadata } from "next";
import Link from "next/link";
import PostList from "@/components/home/postList";
import {
  allPosts,
  categoriesWithCount,
  categoryHref,
} from "@/utils/postCatalog";

export const metadata: Metadata = {
  title: "Archive | YEJILOG",
  description: `지금까지 쓴 글 ${allPosts.length}개를 최신순으로 모아 둔 목록입니다.`,
  alternates: { canonical: "/archive" },
};

/**
 * 글 전체를 한 화면에 링크로 펼치는 허브.
 * 홈은 5개씩 무한 스크롤이라 크롤러가 나머지 글에 닿을 경로가 없었다.
 * 여기가 모든 글을 홈에서 두 단계 안으로 끌어오는 자리다.
 */
export default function ArchivePage() {
  return (
    <main id="main-content" className="wrap page-main">
      <div className="cat-row">
        <span className="cat-label">CATEGORY</span>
        <div className="cat-list" aria-label="카테고리 목록">
          {categoriesWithCount.map(({ name, count }) => (
            <Link key={name} href={categoryHref(name)} className="cat-chip">
              {name} <span className="cat-chip-count">{count}</span>
            </Link>
          ))}
        </div>
      </div>

      <PostList
        displayedPosts={allPosts}
        totalCount={allPosts.length}
        label="archive"
      />
    </main>
  );
}
