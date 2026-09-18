import { Editor } from "@/components/admin/Editor";
import { listAllPostsForAdmin } from "@/lib/admin/posts";

export default function NewPostPage() {
  const posts = listAllPostsForAdmin();
  const categories = Array.from(new Set(posts.map((p) => p.category).filter(Boolean))).sort();

  return (
    <Editor
      mode="new"
      categories={categories}
      initial={{
        title: "",
        category: categories[0] ?? "",
        tags: [],
        isPrivate: true,
        body: "",
      }}
    />
  );
}
