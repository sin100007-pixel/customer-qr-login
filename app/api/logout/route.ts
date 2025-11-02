// app/api/logout/route.ts
import { NextResponse } from "next/server";

function clearSession() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("session_user", "", {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 0, // 즉시 만료
  });
  return res;
}

export async function POST() {
  return clearSession();
}

export async function GET() {
  // 실수로 GET으로 접근해도 안전하게 처리
  return clearSession();
}