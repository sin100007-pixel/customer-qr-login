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
      {/* 토글 버튼 */}
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

      {/* 내용 */}
      {open && (
        <div style={{ marginTop: 12 }}>
          {/* 네 프로젝트의 ProductPreview가 버튼 스타일을 받을 수 있다면 그대로 전달 */}
          <ProductPreview
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