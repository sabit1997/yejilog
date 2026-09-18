import postsData from "@/public/posts.json";
import type { Post } from "@/types/post";
import blogConfig from "@/blog.config";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://yejilog-mu.vercel.app";
const FEED_ITEM_COUNT = 20;

function escapeXml(value: string) {
  return value.replace(/[<>&"']/g, (character) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    '"': "&quot;",
    "'": "&apos;",
  })[character] ?? character);
}

function encodeSlugPath(slug: string) {
  return slug
    .split("/")
    .map((s) => encodeURIComponent(s))
    .join("/");
}

export function GET() {
  const items = (postsData as Post[])
    .toSorted((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, FEED_ITEM_COUNT)
    .map((post) => {
      const url = `${SITE_URL}/posts/${encodeSlugPath(post.slug)}`;
      return `
      <item>
        <title>${escapeXml(post.title)}</title>
        <link>${url}</link>
        <guid isPermaLink="true">${url}</guid>
        <pubDate>${new Date(post.date).toUTCString()}</pubDate>
        <description>${escapeXml(post.excerpt)}</description>
        <category>${escapeXml(post.category)}</category>
      </item>`;
    })
    .join("");

  const buildDate = new Date().toUTCString();
  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(blogConfig.title)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(blogConfig.description)}</description>
    <language>ko-KR</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
