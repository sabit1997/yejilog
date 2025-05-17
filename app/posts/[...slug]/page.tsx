import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { getAllSlugs, getPostContent, getPrevNextPosts } from "@/utils/posts";
import Image from "next/image";
import React from "react";
import Link from "next/link";
import UtterancesComments from "@/components/UtterancesComments";
import { components } from "@/components/markdown/MarkdownComponents";

export async function generateStaticParams(): Promise<{ slug: string[] }[]> {
  const slugs = getAllSlugs();
  return slugs.map((slugArr) => ({
    slug: slugArr.map(encodeURIComponent),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  return {
    title: decodeURIComponent(slug.at(-1) || "글"),
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
    <main className="mx-auto max-w-3xl bg-[#F5F5F5] mb-20 pb-10 dark:bg-transparent">
      <div className="w-full bg-point/50 pt-10 px-6">
        <h1 className="text-4xl font-bold mb-2">{post.title}</h1>
        <div className="flex justify-between items-end pb-6">
          <div className="text-sm text-gray-500 flex items-center gap-2 dark:text-gray-200">
            <span>
              {typeof post.date === "string"
                ? post.date
                : post.date.toLocaleDateString("ko-KR")}
            </span>
            <span>·</span>
            <span>{post.category}</span>
            {post.tags?.map((t) => (
              <span key={t} className="custom-badge">
                #{t}
              </span>
            ))}
          </div>
          <div className="flex flex-col gap-2 items-center">
            <Image
              src="/profile.jpg"
              alt="profile"
              width={40}
              height={40}
              className="rounded-full border-3 border-point"
            />
            <span className="text-sm text-gray-500 dark:text-gray-200">
              정예지
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
          <Link
            href={`/posts/${prev.slug}`}
            className="text-sm text-white dark:text-white bg-point2 px-3 py-2 font-bold rounded-md overflow-ellipsis overflow-hidden hover:bg-point hover:text-point2 whitespace-nowrap max-w-[260px] w-full"
          >
            ← 이전 글: {prev.title}
          </Link>
        ) : (
          <div />
        )}
        {next ? (
          <Link
            href={`/posts/${next.slug}`}
            className="text-sm text-white dark:text-white bg-point2 px-3 py-2 font-bold rounded-md overflow-ellipsis overflow-hidden hover:bg-point hover:text-point2 whitespace-nowrap max-w-[260px] w-full"
          >
            다음 글: {next.title} →
          </Link>
        ) : (
          <div />
        )}
      </nav>
      <UtterancesComments />
    </main>
  );
}
