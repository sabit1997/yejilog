import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import dayjs from "dayjs";
import { auth } from "@/lib/admin/auth";

const MAX_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED = /^image\//;

function sanitizeFilename(name: string): string {
  return name
    .replace(/[^\p{L}\p{N}._-]/gu, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.login) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return new NextResponse("file required", { status: 400 });
  }
  if (!ALLOWED.test(file.type)) {
    return new NextResponse("image only", { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return new NextResponse("too large (max 10MB)", { status: 413 });
  }

  const stamp = dayjs().format("YYYY/MM");
  const unique = Date.now().toString(36);
  const key = `posts/${stamp}/${unique}-${sanitizeFilename(file.name)}`;

  const blob = await put(key, file, {
    access: "public",
    addRandomSuffix: false,
    contentType: file.type,
  });

  return NextResponse.json({ url: blob.url });
}
