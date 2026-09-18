import { NextRequest, NextResponse } from "next/server";
import dayjs from "dayjs";
import { auth } from "@/lib/admin/auth";
import { writePost } from "@/lib/admin/github";
import { buildMarkdown } from "@/lib/admin/frontmatter";
import { toSafeSlug } from "@/lib/admin/slug";

interface SaveBody {
  title: string;
  category: string;
  tags: string[];
  isPrivate: boolean;
  body: string;
  slug?: string;
  sha?: string;
  mode: "new" | "edit";
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.login) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const data = (await req.json()) as SaveBody;

  if (!data.title?.trim()) {
    return new NextResponse("title required", { status: 400 });
  }
  if (!data.category?.trim()) {
    return new NextResponse("category required", { status: 400 });
  }

  const slug = data.mode === "edit" && data.slug ? data.slug : toSafeSlug(data.title);
  const category = data.category.trim();
  const path = `posts/${category}/${slug.split("/").pop()}.md`;

  const markdown = buildMarkdown(
    {
      title: data.title.trim(),
      date: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      category,
      tags: data.tags,
      isPrivate: data.isPrivate,
    },
    data.body ?? ""
  );

  const message =
    data.mode === "edit"
      ? `post(update): ${data.title.trim()}`
      : `post: ${data.title.trim()}`;

  try {
    await writePost({ path, content: markdown, message, sha: data.sha });
  } catch (err) {
    const status = (err as { status?: number }).status ?? 500;
    const msg = (err as Error).message ?? "commit failed";
    return new NextResponse(msg, { status });
  }

  return NextResponse.json({ slug: `${category}/${slug.split("/").pop()}` });
}
