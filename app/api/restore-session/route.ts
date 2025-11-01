// app/api/restore-session/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    if (!name) return NextResponse.json({ ok: false }, { status: 400 });

    const res = NextResponse.json({ ok: true });
    res.cookies.set("session_user", encodeURIComponent(name), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
