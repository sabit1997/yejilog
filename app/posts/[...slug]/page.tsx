import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { getAllSlugs, getPostContent, getPrevNextPosts } from "@/utils/posts";
import Image from "next/image";
import React from "react";
import UtterancesComments from "@/components/UtterancesComments";
import { components } from "@/components/markdown/MarkdownComponents";
import blogConfig from "@/blog.config";
import { formatDateTime } from "@/utils/formatDateTime";
import Badge from "@/components/Badge";
import MovementBtn from "@/components/posts/MovementBtn";

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
  const slugs = getAllSlugs();
  return slugs.map((slugArr) => ({
    slug: slugArr,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const slugPath = decodeURIComponent(slug.join("/"));
  const post = await getPostContent(slugPath);

  if (!post) {
    return {
      title: "글",
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  const description = toDescription(post.markdown) || blogConfig.description;
  const canonicalPath = `/posts/${post.slug}`;

  return {
    title: post.title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
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

  return (
    <main className="w-full max-w-3xl bg-[#F5F5F5] mb-20 pb-10 dark:bg-transparent">
      <div className="w-full bg-point/50 pt-10 px-6 dark:bg-dark-point/50">
        <h1 className="text-4xl font-bold mb-2">{post.title}</h1>
        <div className="flex justify-between items-end pb-6">
          <div className="text-sm text-gray-500 flex items-center gap-2 dark:text-gray-200 flex-wrap">
            <span>{formatDateTime(post.date)}</span>
            <span>·</span>
            <span>{post.category}</span>
            {post.tags?.map((t) => (
              <Badge key={t}>#{t}</Badge>
            ))}
          </div>
          <div className="flex flex-col gap-2 items-center">
            <Image
              src="/profile.jpg"
              alt="profile"
              width={40}
              height={40}
              className="rounded-full border-3 border-point dark:border-dark-point"
            />
            <span className="text-sm text-gray-500 dark:text-gray-200 break-keep">
              {blogConfig.author}
            </span>
          </div>
        </div>
      </div>

      <article className="prose prose-gray dark:prose-invert [&_pre]:whitespace-pre-wrap [&_pre]:break-words py-7 px-6">
        <MDXRemote
          source={post.markdown}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [rehypeHighlight],
            },
          }}
          components={components}
        />
      </article>

      <nav className="flex justify-between items-center pt-6 px-6 mt-10 gap-6">
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
    </main>
  );
}
