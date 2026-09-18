import { notFound } from "next/navigation";
import { Editor } from "@/components/admin/Editor";
import { readPost } from "@/lib/admin/github";
import { parseMarkdown } from "@/lib/admin/frontmatter";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug: slugParts } = await params;
  const slug = slugParts.map((p) => decodeURIComponent(p)).join("/");
  const path = `posts/${slug}.md`;

  const remote = await readPost(path);
  if (!remote) notFound();

  const { front, body } = parseMarkdown(remote.content);

  return (
    <Editor
      mode="edit"
      categories={[front.category]}
      initial={{
        title: front.title,
        category: front.category,
        tags: front.tags,
        isPrivate: front.isPrivate,
        body,
        slug,
        sha: remote.sha,
        date: front.date,
        publishAt: front.publishAt,
      }}
    />
  );
}
