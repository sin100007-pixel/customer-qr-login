// app/product-preview.tsx
"use client";

import React, { useState } from "react";

type Props = {
  /** (선택) 부모에서 버튼 스타일 통일할 때 사용 */
  primaryButtonStyle?: React.CSSProperties;
  /** (선택) 호버 시 바뀔 배경색 */
  primaryButtonHover?: string;
  /** ✅ 추가: 내부 토글 버튼을 보일지 여부 (기본값 true) */
  showToggle?: boolean;
};

export default function ProductPreview({
  primaryButtonStyle,
  primaryButtonHover = "",
  showToggle = true, // ← 기본은 기존 동작 그대로
}: Props) {
  const [open, setOpen] = useState(false);

  const InternalToggleButton = (
    <button
      type="button"
      style={primaryButtonStyle}
      onMouseEnter={(e) => {
        if (primaryButtonHover)
          (e.currentTarget as HTMLButtonElement).style.background =
            primaryButtonHover;
      }}
      onMouseLeave={(e) => {
        if (primaryButtonStyle?.background)
          (e.currentTarget as HTMLButtonElement).style.background = String(
            primaryButtonStyle.background
          );
      }}
      onClick={() => setOpen((v) => !v)}
    >
      {open ? "상품 사진 닫기(확대해서 보세요.)" : "판매중인 상품 보기"}
    </button>
  );

  return (
    <div>
      {/* ✅ 내부 토글은 필요할 때만 노출 */}
      {showToggle && InternalToggleButton}

      {open && (
        <div style={{ marginTop: 12 }}>
          {/* ↓↓↓ 여기부터는 기존에 쓰던 이미지/그리드 렌더링 그대로 두세요 ↓↓↓ */}
          {/* 예: <img src="..." alt="..." style={{ ... }} /> 등 */}
          {/* ... 이미지 목록 ... */}
          {/* ↑↑↑ 기존 구현 유지 */}
          <p style={{ color: "#ef4444", marginTop: 8, fontSize: 14 }}>
            이미지를 확대 할 수 있습니다.
          </p>
        </div>
      )}
    </div>
  );
}