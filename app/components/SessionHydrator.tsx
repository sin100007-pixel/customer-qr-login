"use client";
import { useEffect } from "react";

/**
 * 앱 시작 시 쿠키가 없고 localStorage에만 이름이 남아있다면
 * 복구 API로 쿠키를 재발급.
 * 단, '방금 로그아웃' 플래그가 있으면 이번 실행에서는 건너뜀.
 */
export default function SessionHydrator() {
  useEffect(() => {
    // 1) 방금 로그아웃했다면(1회용 플래그) 자동복구 건너뜀
    try {
      const justLoggedOut = sessionStorage.getItem("justLoggedOut");
      if (justLoggedOut === "1") {
        sessionStorage.removeItem("justLoggedOut");
        return;
      }
    } catch {}

    // 2) 이미 쿠키가 있으면 아무것도 안 함
    const hasCookie = document.cookie.includes("session_user=");
    if (hasCookie) return;

    // 3) 로컬백업이 없으면 종료
    const stored = typeof window !== "undefined" ? localStorage.getItem("session_user") : null;
    if (!stored) return;

    (async () => {
      try {
        const res = await fetch("/api/restore-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // 쿠키 저장
          body: JSON.stringify({ name: decodeURIComponent(stored) }),
          cache: "no-store",
        });
        if (res.ok && location.pathname === "/") {
          location.replace("/dashboard");
        }
      } catch {}
    })();
  }, []);

  return null;
}