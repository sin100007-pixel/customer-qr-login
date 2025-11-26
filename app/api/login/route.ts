// app/api/login/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { withSessionCookie } from "../../../lib/session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { name, password, remember } = await req.json();

    const trimmedName = (name ?? "").trim();
    const rawPassword = (password ?? "").toString();

    if (!trimmedName || !rawPassword) {
      return NextResponse.json(
        { message: "이름/비밀번호를 입력하세요." },
        { status: 400 }
      );
    }

    // 1) 사용자 조회
    const user = await prisma.user.findFirst({
      where: { name: trimmedName },
    });

    if (!user) {
      return NextResponse.json(
        { message: "회원이 없습니다." },
        { status: 401 }
      );
    }

    // 2) 비밀번호 체크
    let ok = false;

    // passwordHash가 있으면 bcrypt로 검증
    if (user.passwordHash && user.passwordHash.length > 0) {
      ok = await bcrypt.compare(rawPassword, user.passwordHash);
    } else {
      // 없으면 전화번호 뒷자리(phoneLast4)와 문자열 비교
      ok = rawPassword === user.phoneLast4;
    }

    if (!ok) {
      return NextResponse.json(
        { message: "비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    // 3) 세션 쿠키 설정 후 응답
    const res = NextResponse.json({ ok: true });

    withSessionCookie(
      res,
      { uid: user.id, name: user.name },
      Boolean(remember)
    );

    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
