// app/api/login/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { withSessionCookie } from "../../../lib/session";

export const runtime = "nodejs";
const prisma = new PrismaClient();

// user-agent 문자열을 기반으로 기기 유형 대략 분류
function detectDeviceType(userAgent: string | null): string {
  if (!userAgent) return "unknown";
  const ua = userAgent.toLowerCase();

  if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod")) {
    return "ios";
  }
  if (ua.includes("android")) {
    return "android";
  }
  if (ua.includes("windows")) {
    return "windows";
  }
  if (ua.includes("mac os x") || ua.includes("macintosh")) {
    return "macos";
  }
  if (ua.includes("linux")) {
    return "linux";
  }
  return "other";
}

export async function POST(req: Request) {
  try {
    const { name, password, remember } = await req.json();

    if (!name || !password) {
      return NextResponse.json(
        { message: "이름/비밀번호를 입력하세요." },
        { status: 400 }
      );
    }

    // 1) 사용자 조회 (이름은 유일하다고 가정)
    const user = await prisma.user.findFirst({ where: { name } });
    if (!user) {
      return NextResponse.json(
        { message: "회원이 없습니다." },
        { status: 401 }
      );
    }

    // 2) 비밀번호 확인
    let ok = false;
    if (user.passwordHash) {
      ok = await bcrypt.compare(password, user.passwordHash);
    } else {
      ok = password === user.phoneLast4;
    }

    if (!ok) {
      return NextResponse.json(
        { message: "비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    // 2.5) ✅ 로그인 성공 시, 로그인 로그 남기기
    try {
      const userAgent = req.headers.get("user-agent") || "";
      const forwardedFor =
        req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        "";
      const ip =
        forwardedFor
          .split(",")[0]
          .trim() || null;
      const deviceType = detectDeviceType(userAgent);

      await prisma.loginLog.create({
        data: {
          userName: user.name,
          deviceType,
          userAgent,
          ip,
        },
      });
    } catch (logError) {
      // 로그 남기기가 실패해도 로그인 자체는 막지 않음
      console.error("login log insert error", logError);
    }

    // 3) 응답 + 세션 쿠키
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
