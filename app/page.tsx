"use client";
import { useState } from "react";
import postsData from "../public/posts.json";
import ProfileSection from "@/components/home/profileSection";
import CategorySection from "@/components/home/categorySection";
import TagSection from "@/components/home/tagSection";
import PostList from "@/components/home/postList";

export interface Post {
  slug: string;
  title: string;
  date: string;
  category: string;
  tags: string[];
}

const typedPosts = postsData as Post[];

const categories = [
  "All",
  ...Array.from(new Set(typedPosts.map((p) => p.category))),
];
const allTags = Array.from(new Set(typedPosts.flatMap((p) => p.tags)));

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const filteredPosts = typedPosts.filter((post) => {
    const catMatch =
      selectedCategory === "All" || post.category === selectedCategory;
    const tagMatch = !selectedTag || post.tags.includes(selectedTag);
    return catMatch && tagMatch;
  });

  const displayedPosts = [...filteredPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <main className="w-full flex flex-col flex-1 pb-4 gap-12">
      <ProfileSection />
      <CategorySection
        selectedCategory={selectedCategory}
        categories={categories}
        setSelectedCategory={setSelectedCategory}
      />
      <TagSection
        selectedTag={selectedTag}
        allTags={allTags}
        setSelectedTag={setSelectedTag}
      />
      <PostList displayedPosts={displayedPosts} />
    </main>
  );
}
