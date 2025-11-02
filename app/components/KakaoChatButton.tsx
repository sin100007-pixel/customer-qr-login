"use client";

import React, { useState } from "react";

type Props = {
  /** 로그인/로그아웃 버튼과 동일한 inline 스타일 객체 */
  style?: React.CSSProperties;
  /** hover 시 바뀔 배경색 (LogoutButton과 동일한 파라미터명/동작) */
  hoverColor?: string;
  /** 버튼 라벨 변경 가능 */
  label?: string;
};

export default function KakaoChatButton({
  style,
  hoverColor = "#1326D9",
  label = "카카오 채팅문의",
}: Props) {
  const [hover, setHover] = useState(false);
  const baseBg = (style?.background as string) || "";

  const mergedStyle: React.CSSProperties = {
    // 로그인/로그아웃 버튼과 동일한 베이스 스타일을 그대로 받는다
    ...style,
    // hover 처리
    background: hover ? hoverColor : baseBg,
    // 앵커를 버튼처럼 보이게
    display: "block",
    width: "100%",
    textAlign: "center",
    textDecoration: "none",
    cursor: "pointer",
  };

  return (
    <a
      href="http://pf.kakao.com/_IxgdJj/chat"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="카카오 채팅으로 문의하기"
      style={mergedStyle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {label}
    </a>
  );
}