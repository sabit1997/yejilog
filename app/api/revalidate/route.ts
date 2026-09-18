import { NextRequest, NextResponse } from "next/server";

const DEPLOY_HOOK = process.env.VERCEL_DEPLOY_HOOK_URL;
const CRON_SECRET = process.env.CRON_SECRET;

/**
 * Vercel Cron이 주기적으로 호출한다. publishAt이 지난 예약 글을 반영하려면
 * 재빌드가 필요하므로 Deploy Hook을 트리거한다.
 *
 * Vercel Cron은 CRON_SECRET 환경변수가 설정돼 있으면 자동으로
 * `Authorization: Bearer <CRON_SECRET>` 헤더를 붙여 보낸다.
 * 그 외 (예: 로컬에서 curl로 수동 트리거)에도 같은 헤더를 요구한다.
 */
export async function GET(req: NextRequest) {
  if (!CRON_SECRET) {
    return new NextResponse("CRON_SECRET not set", { status: 500 });
  }
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${CRON_SECRET}`) {
    return new NextResponse("Forbidden", { status: 403 });
  }
  if (!DEPLOY_HOOK) {
    return new NextResponse("VERCEL_DEPLOY_HOOK_URL not set", { status: 500 });
  }

  const res = await fetch(DEPLOY_HOOK, { method: "POST" });
  if (!res.ok) {
    return new NextResponse(`deploy hook failed: ${res.status}`, {
      status: 502,
    });
  }

  return NextResponse.json({ ok: true, triggeredAt: new Date().toISOString() });
}
