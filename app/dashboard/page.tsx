import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export default async function Dashboard() {
  const session = await getSession();
  if (!session) {
    return <div>세션이 없습니다. <a href="/">로그인</a></div>;
  }

  const user = await prisma.user.findUnique({ where: { id: session.uid } });
  if (!user) {
    return <div>사용자를 찾을 수 없습니다. <a href="/">로그인</a></div>;
  }

  return (
    <div style={{ background: "#111827", padding: 24, borderRadius: 16, boxShadow: "0 10px 30px rgba(0,0,0,.4)" }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>{user.name}님 QR코드</h1>
      <img src={user.qrUrl} alt="QR Code" width={220} height={220} style={{ background: "#fff", padding: 12, borderRadius: 12 }} />
      <p style={{ marginTop: 12, opacity: .8 }}>전화번호 뒷자리: {user.phoneLast4}</p>
      <p style={{ marginTop: 16 }}><a href="/api/logout">로그아웃</a></p>
    </div>
  );
}
