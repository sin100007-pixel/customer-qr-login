// app/dashboard/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
// 별칭(@/lib/...)이 환경에 따라 안 먹는 경우가 있어 상대경로로도 제공.
// 기존에 '@/lib/prisma'가 잘 동작했다면 아래 줄 한 줄만 남겨도 됩니다.
import { prisma } from "../../lib/prisma";

import SaveName from "../components/SaveName";
import LogoutButton from "../components/LogoutButton";
import ProductPreview from "../product-preview";

export default async function DashboardPage() {
  // 1) 세션 확인
  const sessionCookie = cookies().get("session_user");
  if (!sessionCookie) redirect("/");

  // 2) 쿠키에서 이름 복원
  const name = decodeURIComponent(sessionCookie.value || "");

  // 3) DB에서 사용자 조회 (없으면 홈으로)
  const user = await prisma.user.findFirst({ where: { name } });
  if (!user) redirect("/");

  return (
    <>
      {/* 자동복구용 로컬 백업 */}
      <SaveName name={name} />

      <div style={{ padding: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
          {name}님의 QR
        </h1>

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

        <p style={{ marginTop: 12, opacity: 0.8 }}>
          전화번호 뒷자리: {user.phoneLast4}
        </p>

        {/* 로그아웃 */}
        <p style={{ marginTop: 16 }}>
          <LogoutButton />
        </p>

        {/* 판매중인 상품보기 (로그아웃 아래) */}
        <div style={{ marginTop: 24 }}>
          <ProductPreview
            primaryButtonStyle={{
              display: "block",
              width: "100%",
              boxSizing: "border-box",
              padding: 12,
              margin: "0 0 12px 0",
              borderRadius: 10,
              border: "1px solid transparent",
              background: "#0019C9",
              color: "#ffffff",
              fontWeight: 700,
              cursor: "pointer",
            }}
            primaryButtonHover="#1326D9"
          />
        </div>
      </div>
    </>
  );
}