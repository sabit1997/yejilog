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
  /** edit 모드에서만 사용. "카테고리/파일명" 형태 */
  slug?: string;
  sha?: string;
  /** edit 모드에서 원본 생성일 유지용 */
  date?: string;
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

  const now = dayjs().format("YYYY-MM-DD HH:mm:ss");
  const isEdit = data.mode === "edit" && data.slug;

  // edit는 원본 경로/카테고리 유지 (이동/개명은 별도 액션)
  const category = isEdit
    ? data.slug!.split("/").slice(0, -1).join("/")
    : data.category.trim();
  const filenameNoExt = isEdit
    ? data.slug!.split("/").pop()!
    : toSafeSlug(data.title);
  const path = `posts/${category}/${filenameNoExt}.md`;

  const markdown = buildMarkdown(
    {
      title: data.title.trim(),
      date: isEdit && data.date ? data.date : now,
      category,
      tags: data.tags,
      isPrivate: data.isPrivate,
      ...(isEdit ? { updated: now } : {}),
    },
    data.body ?? ""
  );

  const message = isEdit
    ? `post(update): ${data.title.trim()}`
    : `post: ${data.title.trim()}`;

  try {
    await writePost({ path, content: markdown, message, sha: data.sha });
  } catch (err) {
    const status = (err as { status?: number }).status ?? 500;
    const msg = (err as Error).message ?? "commit failed";
    return new NextResponse(msg, { status });
  }

  return NextResponse.json({ slug: `${category}/${filenameNoExt}` });
}
