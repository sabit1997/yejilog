import { signIn } from "@/lib/admin/auth";

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6">
      <h1 className="font-mono text-2xl font-semibold tracking-tight">
        Admin 로그인
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        yejilog 관리자 계정만 접근할 수 있습니다.
      </p>

      <form
        action={async () => {
          "use server";
          await signIn("github", { redirectTo: "/admin" });
        }}
        className="mt-8"
      >
        <button
          type="submit"
          className="w-full rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
        >
          GitHub으로 로그인
        </button>
      </form>

      <ErrorHint searchParams={searchParams} />
    </main>
  );
}

async function ErrorHint({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  if (!params?.error) return null;
  return (
    <p className="mt-4 text-sm text-red-600">
      로그인에 실패했습니다. 관리자 계정으로 다시 시도해주세요.
    </p>
  );
}
