"use client";
import { useState } from "react";

export default function Page() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password }),
    });
    setLoading(false);
    if (res.ok) {
      window.location.href = "/dashboard";
    } else {
      const j = await res.json().catch(() => ({ message: "로그인 실패" }));
      setError(j.message || "로그인 실패");
    }
  }

  return (
    <div style={{ background: "#111827", padding: 24, borderRadius: 16, boxShadow: "0 10px 30px rgba(0,0,0,.4)" }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>로그인</h1>
      <form onSubmit={onSubmit}>
        <label>이름</label>
        <input value={name} onChange={e=>setName(e.target.value)} required placeholder="고객 이름"
          style={{ display: "block", width: "100%", padding: 10, margin: "6px 0 12px", borderRadius: 8 }} />
        <label>비밀번호 (전화번호 뒷자리 4자리)</label>
        <input value={password} onChange={e=>setPassword(e.target.value)} required placeholder="예: 1234"
          type="password" style={{ display: "block", width: "100%", padding: 10, margin: "6px 0 12px", borderRadius: 8 }} />
        <button disabled={loading} type="submit" style={{ width: "100%", padding: 12, borderRadius: 10, background: "#2563eb", color: "#fff", fontWeight: 600 }}>
          {loading ? "로그인 중..." : "로그인"}
        </button>
        {error && <p style={{ color: "#fca5a5", marginTop: 8 }}>{error}</p>}
      </form>
      <p style={{ opacity: .8, marginTop: 12 }}>테스트: 배포 후 시드 넣고 사용</p>
    </div>
  );
}
