import { MetadataRoute } from "next";
import { getAllPostMeta } from "@/utils/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://yejilog-mu.vercel.app";

  const posts = getAllPostMeta();
  const postUrls = posts.map((post) => ({
    url: `${baseUrl}/posts/${decodeURIComponent(post.slug).replace(
      /&/g,
      "&amp;"
    )}`,
    lastModified: new Date(post.date),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const categories = [...new Set(posts.map((post) => post.slug.split("/")[0]))];
  const categoryUrls = categories.map((category) => ({
    url: `${baseUrl}/posts/${decodeURIComponent(category).replace(
      /&/g,
      "&amp;"
    )}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  const staticUrls = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
  ];

  return [...staticUrls, ...categoryUrls, ...postUrls];
}
