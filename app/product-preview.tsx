// app/product-preview.tsx
"use client";

import { useState } from "react";

type Props = {
  /** 버튼 스타일을 부모와 통일하고 싶을 때 주입 */
  buttonStyle?: React.CSSProperties;
  /** 호버 시 바뀔 배경색(선택) */
  hoverColor?: string;
  /** 처음부터 열어둘지 여부(선택, 기본 false) */
  initialOpen?: boolean;
};

const IMG_SRC = "/products/preview.jpg"; // ✅ public/products/preview.jpg 절대경로

export default function ProductPreview({
  buttonStyle,
  hoverColor = "",
  initialOpen = false,
}: Props) {
  const [open, setOpen] = useState(initialOpen);

  return (
    <div style={{ width: "100%" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={(e) => {
          if (hoverColor) (e.currentTarget as HTMLButtonElement).style.background = hoverColor;
        }}
        onMouseLeave={(e) => {
          if (buttonStyle?.background)
            (e.currentTarget as HTMLButtonElement).style.background = String(buttonStyle.background);
        }}
        style={{
          display: "block",
          width: "100%",
          padding: 12,
          border: "none",
          borderRadius: 12,
          cursor: "pointer",
          color: "#fff",
          fontWeight: 700,
          background: "#1739f7",
          ...buttonStyle,
        }}
      >
        {open ? "상품 사진 닫기(확대해서 보세요.)" : "판매중인 상품 보기"}
      </button>

      {open && (
        <>
          <div
            style={{
              marginTop: 12,
              borderRadius: 12,
              overflow: "hidden",
              background: "#111827",
            }}
          >
            <img
              src={IMG_SRC} // ✅ 대시보드에서도 잘 뜸
              alt="판매중인 상품 미리보기"
              style={{ display: "block", width: "100%", height: "auto" }}
            />
          </div>
          <p style={{ color: "#ef4444", marginTop: 8, fontSize: 14 }}>
            이미지를 확대 할 수 있습니다.
          </p>
        </>
      )}
    </div>
  );
}
