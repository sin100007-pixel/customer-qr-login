"use client";
import React, { useState } from "react";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const onLogout = async () => {
    if (loading) return;
    setLoading(true);
    try {
      // 서버 쿠키 삭제
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      }).catch(() => {});

      // 로컬 저장 삭제 + '방금 로그아웃' 플래그 1회 설정
      try {
        localStorage.removeItem("session_user");
        sessionStorage.setItem("justLoggedOut", "1");
      } catch {}

      // 로그인 화면으로 이동 (자동복구가 이번엔 건너뜀)
      location.replace("/");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={onLogout} style={{ color: "#a5b4fc" }} disabled={loading}>
      {loading ? "로그아웃 중..." : "로그아웃"}
    </button>
  );
}