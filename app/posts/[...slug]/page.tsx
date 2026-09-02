import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { getAllSlugs, getPostContent, getPrevNextPosts } from "@/utils/posts";
import React from "react";
import UtterancesComments from "@/components/UtterancesComments";
import { getUtterancesIssueTerm } from "@/utils/comments";
import { createMarkdownComponents } from "@/components/markdown/MarkdownComponents";
import blogConfig from "@/blog.config";
import { formatDateTime } from "@/utils/formatDateTime";
import MovementBtn from "@/components/posts/MovementBtn";
import Link from "next/link";
import PostTableOfContents, { PostTableOfContentsProvider } from "@/components/posts/PostTableOfContents";
import ReadingProgress from "@/components/posts/ReadingProgress";
import Image from "next/image";
import { getReadingTime } from "@/utils/readingTime";
import { categoryHref } from "@/utils/postCatalog";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://yejilog-mu.vercel.app";

function toDescription(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[[^\]]+\]\([^)]+\)/g, " ")
    .replace(/[#>*_\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
}

export async function generateStaticParams(): Promise<{ slug: string[] }[]> {
  return getAllSlugs().map((slugArr) => ({ slug: slugArr }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostContent(decodeURIComponent(slug.join("/")));
  if (!post)
    return {
      title: "페이지를 찾을 수 없어요",
      robots: { index: false, follow: true },
    };

  const description = toDescription(post.markdown) || blogConfig.description;
  const canonicalPath = `/posts/${post.slug}`;

  return {
    title: post.title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url: `${SITE_URL}${canonicalPath}`,
      images: [{ url: `${SITE_URL}/og-default.png`, width: 1200, height: 630 }],
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const slugPath = decodeURIComponent(slug.join("/"));
  const post = await getPostContent(slugPath);
  if (!post) return notFound();

  const { prev, next } = getPrevNextPosts(slugPath);
  const description = toDescription(post.markdown);
  const readingTime = getReadingTime(post.markdown);
  const markdownComponents = createMarkdownComponents();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description,
    datePublished: post.date,
    author: { "@type": "Person", name: blogConfig.author },
    url: `${SITE_URL}/posts/${post.slug}`,
  };

  return (
    <main id="main-content">
      <ReadingProgress />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PostTableOfContentsProvider items={post.tableOfContents}>
      <div className="post-layout">
        <div className="article-wrap">
          <Link href="/" className="back-btn">
            ← 목록으로
          </Link>

          {/* 글 하나에서 나가는 링크가 이전·다음 글뿐이라 목록으로 되돌아갈
              길이 없었다. 카테고리와 태그를 실제 링크로 내보낸다. */}
          <div className="pills" style={{ marginBottom: "14px" }}>
            <Link href={categoryHref(post.category)} className="pill">
              {post.category}
            </Link>
            {/* 태그 필터는 canonical이 `/`로 묶여 색인되지 않는다. 태그 94개
                중 71개가 글 1개짜리여서, 크롤을 유도하면 예산만 쓰고
                얻는 게 없다. 사람에게는 그대로 열어 두고 크롤만 막는다. */}
            {post.tags?.map((t) => (
              <Link
                key={t}
                href={`/?tags=${encodeURIComponent(t)}`}
                className="pill pill-n"
                rel="nofollow"
              >
                #{t}
              </Link>
            ))}
          </div>

          <h1 className="art-h1">{post.title}</h1>

          <div className="art-meta">
            <Image
              className="art-avatar"
              src={blogConfig.profile.image}
              alt=""
              width={28}
              height={28}
            />
            <span>
              {blogConfig.author} · {formatDateTime(post.date)} · {readingTime}분
            </span>
          </div>

          <PostTableOfContents
            items={post.tableOfContents}
            variant="mobile"
          />

          <article className="prose-blog">
            <MDXRemote
              source={post.markdown}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                },
              }}
              components={markdownComponents}
            />
          </article>

          <nav className="post-nav">
            {prev ? (
              <MovementBtn title={prev.title} slug={prev.slug} type="prev" />
            ) : (
              <div />
            )}
            {next ? (
              <MovementBtn title={next.title} slug={next.slug} type="next" />
            ) : (
              <div />
            )}
          </nav>

          <UtterancesComments
            issueTerm={getUtterancesIssueTerm(`/posts/${encodeURI(post.slug)}`)}
          />
        </div>
        <PostTableOfContents items={post.tableOfContents} variant="desktop" />
      </div>
      </PostTableOfContentsProvider>
    </main>
  );
}
