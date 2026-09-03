import { MetadataRoute } from "next";
import { getAllPostMeta } from "@/utils/posts";
import { categoriesWithCount, categoryHref } from "@/utils/postCatalog";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://yejilog-mu.vercel.app";

  const posts = getAllPostMeta();
  const encodeSlugPath = (slug: string) =>
    slug
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");

  // 작성일을 lastModified로 쓰면 리뉴얼로 화면이 전부 바뀌어도 크롤러에게는
  // "변경 없음"으로 보여 재색인이 밀린다. 갱신 시각을 기준으로 잡는다.
  const buildTime = new Date();

  const postUrls = posts.map((post) => ({
    url: `${baseUrl}/posts/${encodeSlugPath(post.slug)}`,
    lastModified: post.updatedAt ?? buildTime,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const staticUrls = [
    {
      url: baseUrl,
      lastModified: buildTime,
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: buildTime,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: buildTime,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/archive`,
      lastModified: buildTime,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
  ];

  // 카테고리 허브는 글 목록으로 가는 통로다. 색인 대상으로 함께 알린다.
  const categoryUrls = categoriesWithCount.map(({ name }) => ({
    url: `${baseUrl}${categoryHref(name)}`,
    lastModified: buildTime,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticUrls, ...categoryUrls, ...postUrls];
}
