// app/dashboard/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/withRetry";

import SaveName from "../components/SaveName";
import LogoutButton from "../components/LogoutButton";
import KakaoChatButton from "../components/KakaoChatButton";

// Prisma는 Edge 런타임에서 동작하지 않음
export const runtime = "nodejs";

const BTN_BLUE = "#0019C9";
const BTN_BLUE_HOVER = "#1326D9";

const buttonStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  padding: 12,
  margin: "0 0 12px 0",
  borderRadius: 12,
  border: "1px solid transparent",
  background: BTN_BLUE,
  color: "#ffffff",
  fontWeight: 700,
  cursor: "pointer",
  textAlign: "center",
};

export default async function DashboardPage() {
  // 1) 세션 쿠키 확인
  const sessionCookie = cookies().get("session_user");
  if (!sessionCookie) redirect("/");

  const name = decodeURIComponent(sessionCookie.value || "");

  // 2) DB 조회 (일시적 연결 문제를 흡수하도록 재시도)
  const user = await withRetry(
    () =>
      prisma.user.findFirst({
        where: { name },
      }),
    { retries: 2, delayMs: 500 }
  );

  if (!user) {
    // 사용자가 없으면 로그인 페이지로
    redirect("/");
  }

  return (
    <main className="min-h-screen w-full max-w-md mx-auto p-4">
      {/* 클라이언트 측 이름 백업/동기화 */}
      <SaveName name={name} />

      <header className="mb-6">
        <h1 className="text-xl font-bold">{name}님의 QR</h1>
      </header>

      {/* QR 이미지 (next/image 대신 img 사용) */}
      <div className="flex flex-col items-center">
        <img
          src={user.qrUrl}
          alt="QR"
          style={{
            width: 260,
            height: 260,
            objectFit: "contain",
            background: "#111",
            borderRadius: 12,
          }}
        />
        <p className="mt-3 opacity-80">전화번호 뒷자리: {user.phoneLast4}</p>
      </div>

      {/* 액션 버튼들 */}
      <div className="mt-6">
        {/* 로그아웃 버튼 */}
        <LogoutButton style={buttonStyle} hoverColor={BTN_BLUE_HOVER} label="로그아웃" />

        {/* 카카오 채팅문의 버튼 (로그아웃 아래 동일 스타일) */}
        <div style={{ marginTop: 8 }}>
          <KakaoChatButton
            style={buttonStyle}
            hoverColor={BTN_BLUE_HOVER}
            label="카카오 채팅문의"
          />
        </div>
      </div>

      {/* 안내 문구 (선택) */}
      <p className="mt-4 text-sm text-red-500">이미지를 확대할 수 있습니다.</p>
    </main>
  );
}