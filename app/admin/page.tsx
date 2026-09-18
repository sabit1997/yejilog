import { auth, signOut } from "@/lib/admin/auth";

export default async function AdminPage() {
  const session = await auth();

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-mono text-2xl font-semibold tracking-tight">
            YEJILOG Admin
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {session?.user?.login
              ? `@${session.user.login} 로그인됨`
              : "세션 없음"}
          </p>
        </div>
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
      </header>

      <section className="mt-12 rounded-lg border border-neutral-200 bg-white/50 p-6">
        <h2 className="font-mono text-sm uppercase tracking-wider text-neutral-500">
          다음 단계
        </h2>
        <ul className="mt-4 space-y-2 text-sm text-neutral-700">
          <li>· 2단계: 글 목록 (드래프트/발행)</li>
          <li>· 3단계: 새 글 에디터</li>
          <li>· 4단계: 기존 글 편집</li>
          <li>· 5단계: 이미지 드래그 업로드</li>
        </ul>
      </section>
    </main>
  );
}
