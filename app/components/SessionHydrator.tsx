"use client";
import { useEffect } from "react";

/** 
 * 앱이 시작됐는데 쿠키가 없고 localStorage에만 이름이 남아있다면
 * 쿠키 재발급을 시도한다.
 */
export default function SessionHydrator() {
  useEffect(() => {
    const hasCookie = document.cookie.includes("session_user=");
    if (hasCookie) return;

    const stored = localStorage.getItem("session_user");
    if (!stored) return;

    fetch("/api/restore-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: decodeURIComponent(stored) }),
    }).catch(() => {});
  }, []);

  return null;
}
