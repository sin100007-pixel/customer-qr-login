"use client";
import React, { useState } from "react";

export default function LedgerUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [baseDate, setBaseDate] = useState<string>("");
  const [msg, setMsg] = useState<string>("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("업로드 중…");

    if (!file) {
      setMsg("파일을 선택하세요.");
      return;
    }
    if (!baseDate) {
      setMsg("기준일(YYYY-MM-DD)을 선택하세요.");
      return;
    }

    const fd = new FormData();
    fd.append("file", file);
    fd.append("base_date", baseDate);

    try {
      const res = await fetch("/api/ledger-import", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) {
        setMsg(`오류: ${json?.error || "업로드 실패"}`);
        return;
      }
      setMsg(
        `완료: 총 ${json.total}건 / 유효 ${json.valid}건 / 업서트 ${json.upserted}건`
      );
    } catch (err: any) {
      setMsg(`요청 오류: ${err?.message || String(err)}`);
    }
  }

  return (
    <div style={{ maxWidth: 560, margin: "40px auto", color: "#fff" }}>
      <h2>원장 업로드 (CSV/XLSX)</h2>
      <form onSubmit={onSubmit}>
        <div style={{ margin: "16px 0" }}>
          <input
            type="file"
            name="file"
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <div style={{ margin: "16px 0" }}>
          <label>
            기준일:
            <input
              type="date"
              value={baseDate}
              onChange={(e) => setBaseDate(e.target.value)}
              style={{ marginLeft: 8 }}
            />
          </label>
        </div>
        <button type="submit">업로드 & 반영</button>
      </form>
      <div style={{ marginTop: 16, whiteSpace: "pre-wrap" }}>{msg}</div>
    </div>
  );
}
