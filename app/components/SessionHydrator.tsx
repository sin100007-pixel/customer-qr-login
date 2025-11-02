"use client";
import { useEffect } from "react";

/**
 * 앱 시작 시 쿠키가 없고 localStorage에만 이름이 남아있다면
 * 복구 API로 쿠키를 재발급하고, 홈(/)이면 자동으로 /dashboard로 이동.
 */
export default function SessionHydrator() {
  useEffect(() => {
    // 이미 쿠키가 있으면 아무것도 하지 않음
    const hasCookie = document.cookie.includes("session_user=");
    if (hasCookie) return;

    const stored = typeof window !== "undefined" ? localStorage.getItem("session_user") : null;
    if (!stored) return;

    (async () => {
      try {
        const res = await fetch("/api/restore-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // ← 쿠키 저장 보장
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