import postsData from "@/public/posts.json";
import type { Post } from "@/types/post";
import blogConfig from "@/blog.config";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://yejilog-mu.vercel.app";

function escapeXml(value: string) {
  return value.replace(/[<>&"']/g, (character) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    '"': "&quot;",
    "'": "&apos;",
  })[character] ?? character);
}

export function GET() {
  const items = (postsData as Post[])
    .toSorted((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((post) => `
      <item>
        <title>${escapeXml(post.title)}</title>
        <link>${SITE_URL}/posts/${encodeURI(post.slug)}</link>
        <guid isPermaLink="true">${SITE_URL}/posts/${encodeURI(post.slug)}</guid>
        <pubDate>${new Date(post.date).toUTCString()}</pubDate>
        <description>${escapeXml(post.excerpt)}</description>
        <category>${escapeXml(post.category)}</category>
      </item>`)
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0">
      <channel>
        <title>${escapeXml(blogConfig.title)}</title>
        <link>${SITE_URL}</link>
        <description>${escapeXml(blogConfig.description)}</description>
        <language>ko</language>${items}
      </channel>
    </rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
