import type { MetadataRoute } from "next";
import fs from "node:fs";
import path from "node:path";

const RAW_BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

const BASE_URL = RAW_BASE_URL.replace(/\/+$/, "");
export const revalidate = 86400;

const POSTS_DIR = path.join(process.cwd(), "posts");

function* walk(dir: string): Generator<string> {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (/\.(md|mdx)$/i.test(e.name)) yield p;
  }
}

function toPostPath(filePath: string) {
  const rel = path.relative(POSTS_DIR, filePath).replace(/\\/g, "/");
  const noExt = rel.replace(/\.(md|mdx)$/i, "");
  const encoded = noExt.split("/").map(encodeURIComponent).join("/");
  return `/posts/${encoded}`;
}

function getPostEntries(): MetadataRoute.Sitemap {
  if (!fs.existsSync(POSTS_DIR)) return [];
  const items: MetadataRoute.Sitemap = [];
  for (const filePath of walk(POSTS_DIR) ?? []) {
    const stat = fs.statSync(filePath);
    items.push({
      url: `${BASE_URL}${toPostPath(filePath)}`,
      lastModified: stat.mtime,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }
  return items;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/posts`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];
  return [...staticEntries, ...getPostEntries()];
}
