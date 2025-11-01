// app/api/logout/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // 현재 요청의 도메인 기준으로 루트('/')로 리다이렉트
  const res = NextResponse.redirect(new URL("/", req.url));
  // 세션 쿠키 제거
  res.cookies.set("session", "", { httpOnly: true, maxAge: 0, path: "/" });
  return res;
}
