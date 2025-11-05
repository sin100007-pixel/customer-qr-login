// app/components/TopSpacer.tsx
"use client";

/**
 * 어떤 환경(앱/PWA/브라우저)에서도
 * 상단에 얇은 시스템/웹뷰 진행바가 생겨도 로고를 가르지 못하게
 * 항상 위쪽에 얇은 여백을 깔아주는 컴포넌트.
 *
 * - 모바일 기본 8px, 데스크톱(>=768px)은 0px로 자동 축소
 * - 노치/상태바 높이는 env(safe-area-inset-top)로 보정
 */
export default function TopSpacer({ height = 8 }: { height?: number }) {
  const h = `${height}px`;
  return (
    <>
      <div
        style={{
          // 노치 영역 + 여백
          paddingTop: `calc(env(safe-area-inset-top, 0px) + ${h})`,
          background: "#0F0C2E",
        }}
      />
      <style>{`
        @media (min-width: 768px) {
          /* 데스크톱에선 여백 숨김 */
          div[style*="safe-area-inset-top"] { padding-top: calc(env(safe-area-inset-top, 0px) + 0px) !important; }
        }
      `}</style>
    </>
  );
}
