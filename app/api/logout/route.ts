// app/api/logout/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** 공통: 세션 쿠키 삭제 */
function clearSessionCookie(res: NextResponse) {
  res.cookies.set("session_user", "", {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 0, // 즉시 만료
  });
}

/** POST /api/logout -> /logout 로 리다이렉트 */
export async function POST(req: Request) {
  const res = NextResponse.redirect(new URL("/logout", req.url), 302);
  clearSessionCookie(res);
  return res;
}

/** GET /api/logout -> /logout 로 리다이렉트 (직접 접근도 처리) */
export async function GET(req: Request) {
  const res = NextResponse.redirect(new URL("/logout", req.url), 302);
  clearSessionCookie(res);
  return res;
}
