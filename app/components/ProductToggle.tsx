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
      {/* 부모 쪽 토글 버튼 */}
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

      {open && (
        <div style={{ marginTop: 12 }}>
          {/* ✅ 내부 토글 숨김(showToggle={false}) */}
          <ProductPreview
            showToggle={false}
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