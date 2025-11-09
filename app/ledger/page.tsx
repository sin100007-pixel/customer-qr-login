"use client";
import { useEffect, useState } from "react";

type Row = {
  tx_date: string; erp_customer_code: string; customer_name: string;
  doc_no: string; line_no: string; description: string;
  debit: number; credit: number; balance: number; erp_row_key: string;
};

export default function MyLedgerPage() {
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [range, setRange] = useState<{ from: string; to: string }>({ from: "", to: "" });
  const [rows, setRows] = useState<Row[]>([]);
  const [sum, setSum] = useState({ debit: 0, credit: 0, balance: 0 });
  const number = (n: number) => (n ?? 0).toLocaleString("ko-KR");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/my-ledger", { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "조회 실패");
        setName(json.name); setRange({ from: json.date_from, to: json.date_to });
        setRows(json.rows || []); setSum(json.sum || { debit:0, credit:0, balance:0 });
      } catch (e: any) { alert(e?.message || String(e)); }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="mx-auto max-w-6xl p-4 text-white">
      <h1 className="text-2xl font-bold mb-2">내 거래 내역 (최근 3개월)</h1>
      <div className="opacity-80 mb-4">
        {name ? (<span><b className="opacity-100">{name}</b> 님, 기간: {range.from} ~ {range.to}</span>) : (<span>로그인 정보를 확인합니다…</span>)}
      </div>

      <div className="rounded-lg bg-white/5 border border-white/10 p-3 mb-3 text-sm">
        <div className="flex flex-wrap gap-6">
          <div><span className="opacity-70 mr-2">건수</span><b>{rows.length.toLocaleString()}건</b></div>
          <div><span className="opacity-70 mr-2">공급가 합계</span><b>{number(sum.debit)}원</b></div>
          <div><span className="opacity-70 mr-2">부가세 합계</span><b>{number(sum.credit)}원</b></div>
          <div><span className="opacity-70 mr-2">잔액 합계</span><b>{number(sum.balance)}원</b></div>
        </div>
      </div>

      <div className="overflow-auto rounded-lg border border-white/10">
        <table className="min-w-full text-sm">
          <thead className="bg-white/10 sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left">일자</th>
              <th className="px-3 py-2 text-left">전표</th>
              <th className="px-3 py-2 text-right">라인</th>
              <th className="px-3 py-2 text-left">적요</th>
              <th className="px-3 py-2 text-right">공급가</th>
              <th className="px-3 py-2 text-right">부가세</th>
              <th className="px-3 py-2 text-right">잔액</th>
            </tr>
          </thead>
          <tbody>
            {!loading && rows.length===0 && <tr><td className="px-3 py-6 text-center opacity-70" colSpan={7}>최근 3개월 거래가 없습니다.</td></tr>}
            {rows.map(r=>(
              <tr key={r.erp_row_key} className="odd:bg-white/0 even:bg-white/5">
                <td className="px-3 py-2 whitespace-nowrap">{r.tx_date}</td>
                <td className="px-3 py-2">{r.doc_no}</td>
                <td className="px-3 py-2 text-right">{r.line_no}</td>
                <td className="px-3 py-2">{r.description}</td>
                <td className="px-3 py-2 text-right">{number(r.debit)}</td>
                <td className="px-3 py-2 text-right">{number(r.credit)}</td>
                <td className="px-3 py-2 text-right">{number(r.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
