// lib/session.ts
import { cookies } from "next/headers";

type SessionPayload = { uid: string; name: string };

// 로그인 시 세션(쿠키) 저장
export function setSession(payload: SessionPayload) {
  cookies().set("session_user", encodeURIComponent(payload.name), {
    path: "/",
    // 필요 시 true로 바꾸세요(클라이언트에서 읽지 않으면 true 권장)
    httpOnly: false,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7일
  });
}

// (옵션) 세션 읽기
export function getSessionName(): string | null {
  const c = cookies().get("session_user");
  return c ? decodeURIComponent(c.value) : null;
}

// (옵션) 로그아웃용
export function clearSession() {
  cookies().delete("session_user");
}
