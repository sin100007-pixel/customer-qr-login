// app/dashboard/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SaveName from "@/app/components/SaveName";
import LogoutButton from "@/app/components/LogoutButton";

export default async function DashboardPage() {
  // 1) 세션 확인
  const sessionCookie = cookies().get("session_user");
  if (!sessionCookie) redirect("/");

  // 2) 쿠키에 저장된 이름 복원
  const name = decodeURIComponent(sessionCookie.value || "");

  // 3) 사용자 조회
  const user = await prisma.user.findFirst({ where: { name } });
  if (!user) {
    // 유저가 없으면 세션이 잘못된 것이므로 홈으로
    redirect("/");
  }

  return (
    <>
      {/* 로컬스토리지 백업 */}
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

        <p style={{ marginTop: 16 }}>
          <LogoutButton />
        </p>
      </div>
    </>
  );
}