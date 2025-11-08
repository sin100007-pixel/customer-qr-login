"use client";
import { useState } from "react";

export default function LedgerUploadPage(){
  const [file, setFile] = useState<File|null>(null);
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent){
    e.preventDefault();
    if(!file) return setMsg("CSV 또는 XLSX 파일을 선택하세요.");
    setMsg("업로드 중…");
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/ledger/import", { method:"POST", body: fd });
    const j = await res.json();
    setMsg(res.ok ? `완료: 총 ${j.total}건 / 유효 ${j.valid}건 / 업서트 ${j.upserted}건`
                  : `오류: ${j.error || res.statusText}`);
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">원장 업로드(CSV/XLSX)</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input type="file" accept=".csv,.xlsx" onChange={e=>setFile(e.target.files?.[0]||null)} />
        <button className="w-full h-12 bg-blue-600 text-white rounded-lg font-semibold">업로드 & 반영</button>
      </form>
      {msg && <p className="text-sm">{msg}</p>}
      <details className="text-sm text-gray-600">
        <summary>허용 헤더 예시</summary>
        <pre className="whitespace-pre-wrap">
{`표준: erp_customer_code, customer_name, tx_date, doc_no, line_no, description, debit, credit, balance, erp_row_key

한글 가능: 거래처코드, 거래처명, 출고일자/거래일자, 전표번호, 행번호/라인번호, 적요/비고, 공급가/차변, 부가세/대변, 잔액`}
        </pre>
      </details>
    </div>
  );
}
