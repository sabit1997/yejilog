import type { MetadataRoute } from "next";
import { glob } from "glob";
import path from "node:path";
import fs from "node:fs";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://yejilog-mu.vercel.app";

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    {
      url: `${BASE_URL}/posts`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
  ];

  const postFiles = await glob("posts/**/*.{md,mdx}");

  const postPages = postFiles.map((file) => {
    const pathWithoutExt = file.replace(/\.(md|mdx)$/, "");
    const stat = fs.statSync(path.join(process.cwd(), file));

    return {
      url: `${BASE_URL}/${pathWithoutExt}`,
      lastModified: stat.mtime,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    };
  });

  return [...staticPages, ...postPages];
}
