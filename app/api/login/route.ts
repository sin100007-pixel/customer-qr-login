import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { setSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, password } = await req.json();
    if (!name || !password) {
      return NextResponse.json({ message: "이름과 비밀번호가 필요합니다." }, { status: 400 });
    }
    const user = await prisma.user.findFirst({ where: { name } });
    if (!user) {
      return NextResponse.json({ message: "존재하지 않는 사용자입니다." }, { status: 401 });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return NextResponse.json({ message: "비밀번호가 올바르지 않습니다." }, { status: 401 });
    await setSession({ uid: user.id, name: user.name });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ message: "서버 오류" }, { status: 500 });
  }
}
