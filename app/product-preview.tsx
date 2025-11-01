"use client";
import React, { useRef, useState, useEffect } from "react";

type Props = {
  /** 로그인/앱설치 버튼과 동일 스타일을 그대로 넘겨 받아 색/크기 통일 */
  primaryButtonStyle?: React.CSSProperties;
  /** 버튼 hover 시 배경색 (선택) */
  primaryButtonHover?: string;
  /** 미리보기로 보여줄 이미지 경로 (기본: /products/preview.jpg) */
  imageSrc?: string;
  /** 패널 제목 */
  title?: string;
  /** 하단 캡션 */
  caption?: string;
};

export default function ProductPreview({
  primaryButtonStyle,
  primaryButtonHover = "#1326D9",
  imageSrc = "/products/preview.jpg",
  title = "판매중인 상품",
  caption = "이미지를 누르면 닫혀요.",
}: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // 열릴 때 해당 영역으로 부드럽게 스크롤
  useEffect(() => {
    if (open && wrapRef.current) {
      wrapRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [open]);

  const onOpen = () => setOpen(true);
  const onClose = () => setOpen(false);

  return (
    <section ref={wrapRef} style={{ marginTop: 20 }}>
      {/* 보기 버튼 */}
      <button
        style={{ ...primaryButtonStyle }}
        onClick={onOpen}
        onMouseEnter={(e) => {
          if (primaryButtonHover) e.currentTarget.style.background = primaryButtonHover;
        }}
        onMouseLeave={(e) => {
          if (primaryButtonStyle?.background) {
            e.currentTarget.style.background = String(primaryButtonStyle.background);
          }
        }}
      >
        판매중인 상품 보기
      </button>

      {/* 펼쳐지는 패널 */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            marginTop: 12,
            borderRadius: 12,
            overflow: "hidden",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 12,
            }}
          >
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{title}</h2>
            <button
              onClick={onClose}
              style={{
                border: "1px solid rgba(255,255,255,0.3)",
                background: "transparent",
                color: "#fff",
                borderRadius: 8,
                padding: "6px 10px",
                cursor: "pointer",
              }}
            >
              닫기
            </button>
          </div>

          <div style={{ background: "#000", display: "grid", placeItems: "center" }}>
            {/* 이미지를 클릭해도 닫히게 */}
            <img
              src={imageSrc}
              alt="판매중인 상품 미리보기"
              style={{ width: "100%", height: "auto", display: "block", cursor: "zoom-out" }}
              onClick={onClose}
            />
          </div>

          <div style={{ padding: 12, color: "#cbd5e1", fontSize: 13 }}>{caption}</div>
        </div>
      )}
    </section>
  );
}