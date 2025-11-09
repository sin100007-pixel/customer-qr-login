import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  // 서버에서 쿠키 읽기
  const jar = cookies();
  const raw = jar.get("session_user")?.value || "";
  const name = raw ? decodeURIComponent(raw) : "";

  return NextResponse.json({ ok: true, name });
}
