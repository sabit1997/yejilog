import { NextResponse } from "next/server";
import { auth } from "@/lib/admin/auth";

const ADMIN_LOGIN = process.env.ADMIN_GITHUB_USERNAME;

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin/login") return;

  const isApi = pathname.startsWith("/api/admin");

  if (!req.auth) {
    if (isApi) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const loginUrl = new URL("/admin/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  const login = req.auth.user?.login;
  if (!ADMIN_LOGIN || login !== ADMIN_LOGIN) {
    return new NextResponse("Forbidden", { status: 403 });
  }
});

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
