// lib/session.ts
import { NextResponse } from "next/server";

type SessionPayload = { uid: string; name: string };

/** 
 * remember=true  → 30일 유지
 * remember=false → 12시간 유지
 */
export function withSessionCookie(
  res: NextResponse,
  payload: SessionPayload,
  remember: boolean = false
) {
  res.cookies.set("session_user", encodeURIComponent(payload.name), {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: remember ? 60 * 60 * 24 * 30 : 60 * 60 * 12,
  });
  return res;
}
