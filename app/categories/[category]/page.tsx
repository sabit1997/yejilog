import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PostList from "@/components/home/postList";
import {
  categoriesWithCount,
  categoryHref,
  getPostsByCategory,
  resolveCategory,
} from "@/utils/postCatalog";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export function generateStaticParams(): { category: string }[] {
  // 인코딩은 Next가 처리한다. 여기서는 원래 이름을 그대로 넘긴다.
  return categoriesWithCount.map(({ name }) => ({ category: name }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category: segment } = await params;
  const category = resolveCategory(segment);

  if (!category) {
    return {
      title: "페이지를 찾을 수 없어요",
      robots: { index: false, follow: true },
    };
  }

  const count = getPostsByCategory(category).length;

  return {
    title: `${category} | YEJILOG`,
    description: `${category} 카테고리의 글 ${count}개를 모아 둔 목록입니다.`,
    alternates: { canonical: categoryHref(category) },
  };
}

/**
 * 카테고리별 전체 목록.
 * 홈의 `?category=` 필터는 canonical이 `/`로 묶여 색인되지 않고, 목록도
 * 5개까지만 보여준다. 글이 15개인 React&JS처럼 큰 카테고리는 나머지 글이
 * 어디에서도 링크되지 않았다. 이 화면이 그 구멍을 메운다.
 */
export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: segment } = await params;
  const category = resolveCategory(segment);
  if (!category) return notFound();

  const posts = getPostsByCategory(category);

  return (
    <main id="main-content" className="wrap page-main">
      <div className="cat-row">
        <span className="cat-label">CATEGORY</span>
        <div className="cat-list" aria-label="카테고리 목록">
          <Link href="/archive" className="cat-chip">
            All
          </Link>
          {categoriesWithCount.map(({ name, count }) => (
            <Link
              key={name}
              href={categoryHref(name)}
              aria-current={name === category ? "page" : undefined}
              className={`cat-chip${name === category ? " active" : ""}`}
            >
              {name} <span className="cat-chip-count">{count}</span>
            </Link>
          ))}
        </div>
      </div>

      <PostList
        displayedPosts={posts}
        totalCount={posts.length}
        label={category}
        labelVerbatim
      />
    </main>
  );
}
