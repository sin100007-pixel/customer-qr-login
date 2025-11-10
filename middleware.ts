import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 보호할 경로들(대시보드 이하)
const PROTECTED_PREFIXES = ["/dashboard"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const sess = req.cookies.get("session_user");
  if (!sess) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // 슬라이딩 세션: 접근할 때마다 30일로 연장
  const res = NextResponse.next();
  res.cookies.set("session_user", sess.value, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};


