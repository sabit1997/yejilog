import Link from "next/link";
import { auth, signOut } from "@/lib/admin/auth";
import { listAllPostsForAdmin } from "@/lib/admin/posts";

export default async function AdminPage() {
  const session = await auth();
  const posts = listAllPostsForAdmin();
  const drafts = posts.filter((p) => p.isPrivate);
  const published = posts.filter((p) => !p.isPrivate);

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-mono text-2xl font-semibold tracking-tight">
            YEJILOG Admin
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            @{session?.user?.login} · {published.length}편 발행 · {drafts.length}편 드래프트
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/new"
            className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800"
          >
            새 글
          </Link>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
          >
            <button
              type="submit"
              className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100"
            >
              로그아웃
            </button>
          </form>
        </div>
      </header>

      {drafts.length > 0 && (
        <PostSection
          title="드래프트"
          posts={drafts}
          emptyLabel="드래프트 없음"
          isDraft
        />
      )}

      <PostSection
        title="발행됨"
        posts={published}
        emptyLabel="발행된 글이 없습니다."
      />
    </main>
  );
}

function PostSection({
  title,
  posts,
  emptyLabel,
  isDraft = false,
}: {
  title: string;
  posts: {
    slug: string;
    title: string;
    date: string;
    category: string;
    tags: string[];
  }[];
  emptyLabel: string;
  isDraft?: boolean;
}) {
  return (
    <section className="mt-12">
      <h2 className="font-mono text-xs uppercase tracking-wider text-neutral-500">
        {title}
      </h2>

      {posts.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-400">{emptyLabel}</p>
      ) : (
        <ul className="mt-4 divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white/40">
          {posts.map((post) => (
            <li key={post.slug} className="flex items-center gap-4 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 truncate">
                  <span className="truncate text-sm font-medium text-neutral-900">
                    {post.title}
                  </span>
                  {isDraft && (
                    <span className="shrink-0 rounded-sm bg-amber-100 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-amber-800">
                      draft
                    </span>
                  )}
                </div>
                <p className="mt-0.5 truncate font-mono text-xs text-neutral-500">
                  {post.category && <span>{post.category} · </span>}
                  {post.date}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2 text-xs">
                {!isDraft && (
                  <Link
                    href={`/posts/${post.slug}`}
                    target="_blank"
                    className="rounded border border-neutral-200 px-2 py-1 text-neutral-600 hover:bg-neutral-50"
                  >
                    보기
                  </Link>
                )}
                <Link
                  href={`/admin/edit/${post.slug}`}
                  className="rounded border border-neutral-200 px-2 py-1 text-neutral-600 hover:bg-neutral-50"
                >
                  편집
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
