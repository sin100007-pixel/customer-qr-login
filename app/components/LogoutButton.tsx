"use client";
import React, { useState } from "react";

type Props = {
  style?: React.CSSProperties;   // 대시보드에서 스타일 주입
  hoverColor?: string;           // 호버 색 (선택)
  label?: string;                // 버튼 라벨 (선택)
};

export default function LogoutButton({
  style,
  hoverColor = "#1326D9",
  label = "로그아웃",
}: Props) {
  const [loading, setLoading] = useState(false);

  // 호버 후 원복할 기본 배경색 기억
  const baseBg = (style?.background as string) || "";

  const onLogout = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      }).catch(() => {});

      // 자동복구 1회 차단 + 로컬 백업 삭제
      try {
        localStorage.removeItem("session_user");
        sessionStorage.setItem("justLoggedOut", "1");
      } catch {}

      location.replace("/");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onLogout}
      style={style}
      onMouseEnter={(e) => {
        if (hoverColor) (e.currentTarget as HTMLButtonElement).style.background = hoverColor;
      }}
      onMouseLeave={(e) => {
        if (baseBg) (e.currentTarget as HTMLButtonElement).style.background = baseBg;
      }}
    >
      {loading ? "로그아웃 중..." : label}
    </button>
  );
}