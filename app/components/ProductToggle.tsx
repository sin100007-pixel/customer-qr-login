// app/components/ProductToggle.tsx
"use client";

import React, { useState } from "react";
import ProductPreview from "../product-preview";

type Props = {
  buttonStyle: React.CSSProperties;
  hoverColor: string;
  initialOpen?: boolean;
};

export default function ProductToggle({
  buttonStyle,
  hoverColor,
  initialOpen = false,
}: Props) {
  const [open, setOpen] = useState(initialOpen);

  return (
    <div>
      {/* 부모 토글 버튼 */}
      <button
        type="button"
        style={buttonStyle}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = hoverColor;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background =
            (buttonStyle.background as string) || "";
        }}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "상품 사진 닫기(확대해서 보세요.)" : "판매중인 상품 보기"}
      </button>

      {/* 열렸을 때만 프리뷰, 내부 토글은 숨김 */}
      {open && (
        <div style={{ marginTop: 12 }}>
          <ProductPreview
            showToggle={false}                 // ✅ 내부 버튼 숨김
            primaryButtonStyle={buttonStyle}
            primaryButtonHover={hoverColor}
          />
          <p style={{ color: "#ef4444", marginTop: 8, fontSize: 14 }}>
            이미지를 확대 할 수 있습니다.
          </p>
        </div>
      )}
    </div>
  );
}