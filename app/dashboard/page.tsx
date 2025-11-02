// app/dashboard/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/withRetry";

import SaveName from "../components/SaveName";
import LogoutButton from "../components/LogoutButton";
import KakaoChatButton from "../components/KakaoChatButton";
import ProductToggle from "../components/ProductToggle";

// Prisma는 Edge에서 동작하지 않음
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
  // 1) 세션 확인
  const sessionCookie = cookies().get("session_user");
  if (!sessionCookie) redirect("/");
  const name = decodeURIComponent(sessionCookie.value || "");

  // 2) 사용자 조회 (일시 연결 이슈 시 재시도)
  const user = await withRetry(
    () => prisma.user.findFirst({ where: { name } }),
    { retries: 2, delayMs: 500 }
  );
  if (!user) redirect("/");

  return (
    <main className="min-h-screen w-full max-w-md mx-auto p-4">
      <SaveName name={name} />

      <header className="mb-6">
        <h1 className="text-xl font-bold">{name}님의 QR</h1>
      </header>

      {/* QR */}
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

      {/* 액션 버튼 */}
      <div className="mt-6">
        <LogoutButton style={buttonStyle} hoverColor={BTN_BLUE_HOVER} label="로그아웃" />

        <div style={{ marginTop: 8 }}>
          <KakaoChatButton style={buttonStyle} hoverColor={BTN_BLUE_HOVER} label="카카오 채팅문의" />
        </div>

        {/* ✅ 카카오 채팅문의 아래 → 판매중인 상품 보기 토글 */}
        <div style={{ marginTop: 8 }}>
          <ProductToggle
            buttonStyle={buttonStyle}
            hoverColor={BTN_BLUE_HOVER}
            initialOpen={false}
          />
        </div>
      </div>
    </main>
  );
}
