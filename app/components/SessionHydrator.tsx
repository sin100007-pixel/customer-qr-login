// app/components/SessionHydrator.tsx
"use client";
import { useEffect } from "react";

/**
 * 앱 시작 시 쿠키가 없고 localStorage에만 이름이 남아있다면
 * 복구 API로 쿠키를 재발급.
 * 단, 로그아웃 직후(/logout 또는 justLoggedOut 플래그)에는 동작하지 않음.
 */
export default function SessionHydrator() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 0) 로그아웃 페이지에서는 무조건 비활성화
    if (window.location.pathname === "/logout") return;

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
    const stored = localStorage.getItem("session_user");
    if (!stored) return;

    // 4) 복구 시도
    (async () => {
      try {
        const res = await fetch("/api/restore-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // 쿠키 저장
          body: JSON.stringify({ name: decodeURIComponent(stored) }),
          cache: "no-store",
        });
        // 홈에서 복구되면 대시보드로 안내
        if (res.ok && location.pathname === "/") {
          location.replace("/dashboard");
        }
      } catch {
        // 네트워크 오류 등은 묵음 처리
      }
    })();
  }, []);

  return null;
}
