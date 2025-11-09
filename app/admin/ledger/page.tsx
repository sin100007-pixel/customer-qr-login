"use client";
import { useEffect, useMemo, useState } from "react";
import DangerZone from "./DangerZone"; // ⬅️ 추가

type Row = {
  tx_date: string; erp_customer_code: string; customer_name: string;
  doc_no: string; line_no: string; description: string;
  debit: number; credit: number; balance: number; erp_row_key: string;
};

export default function LedgerDashboardPage() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");

  const [dateFrom, setDateFrom] = useState(`${yyyy}-${mm}-01`);
  const [dateTo, setDateTo] = useState(`${yyyy}-${mm}-${dd}`);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [sum, setSum] = useState({ debit: 0, credit: 0, balance: 0 });
  const pages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);
  const number = (n: number) => (n ?? 0).toLocaleString("ko-KR");

  const fetchData = async (goPage = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        date_from: dateFrom || "", date_to: dateTo || "", q,
        page: String(goPage), limit: String(limit),
      });
      const res = await fetch(`/api/ledger-search?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "조회 실패");
      setRows(json.rows || []); setTotal(json.total || 0); setSum(json.sum || { debit:0,credit:0,balance:0 });
      setPage(goPage);
    } catch (e: any) { alert(e?.message || String(e)); }
    finally { setLoading(false); }
  };

  const exportCSV = () => {
    const p = new URLSearchParams({ date_from: dateFrom, date_to: dateTo, q, page: "1", limit: String(limit), format: "csv" });
    window.location.href = `/api/ledger-search?${p.toString()}`;
  };

  useEffect(() => { fetchData(1); }, []);

  return (
    <div className="mx-auto max-w-6xl p-4 text-white">
      <h1 className="text-2xl font-bold mb-4">원장 조회 대시보드</h1>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end mb-3">
        <div className="md:col-span-2">
          <label className="block text-sm opacity-80">시작일</label>
          <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} className="w-full rounded-md px-3 py-2 text-black"/>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm opacity-80">종료일</label>
          <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} className="w-full rounded-md px-3 py-2 text-black"/>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm opacity-80">검색어(거래처/코드/전표)</label>
          <input value={q} onChange={e=>setQ(e.target.value)} className="w-full rounded-md px-3 py-2 text-black"/>
        </div>
        <div className="md:col-span-6 flex gap-2">
          <button onClick={()=>fetchData(1)} className="rounded-md bg-blue-600 hover:bg-blue-700 px-4 py-2 font-semibold" disabled={loading}>{loading?"조회 중...":"조회"}</button>
          <button onClick={exportCSV} className="rounded-md bg-emerald-600 hover:bg-emerald-700 px-4 py-2 font-semibold">CSV 다운로드</button>
          <div className="ml-auto flex items-center gap-2">
            <span className="opacity-80 text-sm">행/페이지</span>
            <select value={limit} onChange={e=>setLimit(Number(e.target.value))} className="rounded-md px-2 py-1 text-black">
              {[25,50,100,200].map(n=><option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-white/5 border border-white/10 p-3 mb-3 text-sm">
        <div className="flex flex-wrap gap-6">
          <div><span className="opacity-70 mr-2">총 건수</span><b>{total.toLocaleString()}건</b></div>
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
              <th className="px-3 py-2 text-left">거래처코드</th>
              <th className="px-3 py-2 text-left">거래처명</th>
              <th className="px-3 py-2 text-left">전표</th>
              <th className="px-3 py-2 text-right">라인</th>
              <th className="px-3 py-2 text-left">적요</th>
              <th className="px-3 py-2 text-right">공급가</th>
              <th className="px-3 py-2 text-right">부가세</th>
              <th className="px-3 py-2 text-right">잔액</th>
            </tr>
          </thead>
          <tbody>
            {rows.length===0 && <tr><td className="px-3 py-6 text-center opacity-70" colSpan={9}>데이터가 없습니다.</td></tr>}
            {rows.map(r=>(
              <tr key={r.erp_row_key} className="odd:bg-white/0 even:bg-white/5">
                <td className="px-3 py-2 whitespace-nowrap">{r.tx_date}</td>
                <td className="px-3 py-2">{r.erp_customer_code}</td>
                <td className="px-3 py-2">{r.customer_name}</td>
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

      <div className="mt-3 flex items-center gap-2">
        <button onClick={()=>fetchData(Math.max(1, page-1))} disabled={page<=1||loading} className="rounded-md bg-white/10 hover:bg-white/20 px-3 py-1 disabled:opacity-40">이전</button>
        <span className="opacity-80 text-sm">{page} / {pages}</span>
        <button onClick={()=>fetchData(Math.min(pages, page+1))} disabled={page>=pages||loading} className="rounded-md bg-white/10 hover:bg-white/20 px-3 py-1 disabled:opacity-40">다음</button>
        <div className="ml-auto opacity-70 text-xs">정렬: 일자 ↓, 전표↑, 라인↑</div>
      </div>

      {/* ⬇️ 삭제 버튼 섹션 추가 */}
      <DangerZone />
    </div>
  );
}
