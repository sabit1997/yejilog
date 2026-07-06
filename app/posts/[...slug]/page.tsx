import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { getAllSlugs, getPostContent, getPrevNextPosts } from "@/utils/posts";
import React from "react";
import UtterancesComments from "@/components/UtterancesComments";
import { components } from "@/components/markdown/MarkdownComponents";
import blogConfig from "@/blog.config";
import { formatDateTime } from "@/utils/formatDateTime";
import MovementBtn from "@/components/posts/MovementBtn";
import Link from "next/link";

const SITE_URL = "https://yejilog-mu.vercel.app";

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
    return { title: "글", robots: { index: false, follow: true } };

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

  return (
    <main>
      <div className="article-wrap">
        <Link href="/" className="back-btn">
          ← 목록으로
        </Link>

        <div className="pills" style={{ marginBottom: "14px" }}>
          <span className="pill">{post.category}</span>
          {post.tags?.map((t) => (
            <span key={t} className="pill pill-n">
              #{t}
            </span>
          ))}
        </div>

        <h1 className="art-h1">{post.title}</h1>

        {description && <p className="art-sub">{description}</p>}

        <div className="art-meta">
          <div className="art-avatar" />
          <span>
            {blogConfig.author} · {formatDateTime(post.date)}
          </span>
        </div>

        <article className="prose-blog">
          <MDXRemote
            source={post.markdown}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
              },
            }}
            components={components}
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

        <UtterancesComments />
      </div>
    </main>
  );
}
