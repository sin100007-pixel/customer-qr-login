// app/logout/page.tsx
"use client";

import { useEffect } from "react";

export default function LogoutPage() {
  useEffect(() => {
    try {
      // 자동 복구에 쓰이던 로컬 백업 제거
      localStorage.removeItem("session_user");
      // 이번 페이지 로드 동안은 자동복구 비활성화
      sessionStorage.setItem("justLoggedOut", "1");
    } catch {}

    // 홈으로 복귀
    window.location.replace("/");
  }, []);

  return (
    <div style={{ padding: 24, color: "#fff", fontWeight: 700 }}>
      로그아웃 중...
    </div>
  );
}
