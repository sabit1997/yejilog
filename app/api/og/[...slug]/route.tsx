import { ImageResponse } from "next/og";
import { getPostContent } from "@/utils/posts";

export const runtime = "nodejs";

const SIZE = { width: 1200, height: 630 };

// satori는 woff2를 못 읽는다. fontsource에서 woff(v1)로 받아 캐시.
const FONT_URLS = {
  regular:
    "https://cdn.jsdelivr.net/npm/@fontsource/ibm-plex-sans-kr@5.0.5/files/ibm-plex-sans-kr-korean-400-normal.woff",
  semibold:
    "https://cdn.jsdelivr.net/npm/@fontsource/ibm-plex-sans-kr@5.0.5/files/ibm-plex-sans-kr-korean-600-normal.woff",
};

async function fetchFont(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url, { cache: "force-cache" });
  if (!res.ok) throw new Error(`font fetch failed: ${res.status}`);
  return res.arrayBuffer();
}

function formatDate(value: unknown): string {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? ""
      : value.toISOString().slice(0, 10);
  }
  return typeof value === "string" ? value.slice(0, 10) : "";
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const post = await getPostContent(decodeURIComponent(slug.join("/")));
  if (!post) return new Response("Not found", { status: 404 });

  const [semibold, regular] = await Promise.all([
    fetchFont(FONT_URLS.semibold),
    fetchFont(FONT_URLS.regular),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "#faf7ec",
          padding: "72px 80px",
          justifyContent: "space-between",
          fontFamily: "IBM Plex Sans KR",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "22px",
            color: "#7a5c00",
            fontWeight: 400,
          }}
        >
          <span style={{ color: "#ffd64d", fontSize: "28px" }}>##</span>
          <span>{post.category}</span>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: post.title.length > 30 ? "56px" : "68px",
            fontWeight: 600,
            lineHeight: 1.3,
            color: "#151308",
            letterSpacing: "-0.02em",
            maxWidth: "1040px",
          }}
        >
          {post.title}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "#5f5a49",
            fontSize: "22px",
            borderTop: "1px solid #e2ded0",
            paddingTop: "20px",
          }}
        >
          <span style={{ fontWeight: 600, color: "#151308" }}>
            yeji<span style={{ color: "#ffd64d" }}>.log</span>
          </span>
          <span>{formatDate(post.date)}</span>
        </div>
      </div>
    ),
    {
      ...SIZE,
      fonts: [
        { name: "IBM Plex Sans KR", data: semibold, weight: 600 },
        { name: "IBM Plex Sans KR", data: regular, weight: 400 },
      ],
    }
  );
}
