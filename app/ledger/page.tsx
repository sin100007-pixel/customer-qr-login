// app/ledger/page.tsx
import { cookies, headers } from "next/headers";

type Row = {
  tx_date: string;
  row_no: number | null;
  erp_customer_code: string | null;
  customer_name: string | null;
  item_name: string | null;
  spec: string | null;
  qty: number | null;
  unit_price: number | null;
  amount: number | null;
  prev_balance: number | null;
  deposit: number | null;
  curr_balance: number | null;
  memo: string | null;
  price?: number | null;
  debit?: number | null;
  balance?: number | null;
};

const fmt = (n: number | null | undefined) => (n == null ? "0" : n.toLocaleString());
const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export default async function LedgerMyPage() {
  const sessionCookie = cookies().get("session_user");
  const sessionName = decodeURIComponent(sessionCookie?.value ?? "").trim();

  const today = new Date();
  const from = new Date();
  from.setMonth(from.getMonth() - 3);
  const date_from = ymd(from);
  const date_to = ymd(today);

  // ── 절대 URL 만들기 (Vercel/프록시 환경 대응)
  const h = headers();
  const proto = h.get("x-forwarded-proto") || "https";
  const host = h.get("x-forwarded-host") || h.get("host") || "";
  const base = `${proto}://${host}`;

  let rows: Row[] = [];
  let errorMsg = "";

  if (!sessionName) {
    errorMsg = "로그인 세션이 없습니다.";
  } else {
    const apiPath =
      `/api/ledger-search?order=excel&limit=2000` +
      `&date_from=${encodeURIComponent(date_from)}` +
      `&date_to=${encodeURIComponent(date_to)}` +
      `&q=${encodeURIComponent(sessionName)}`;

    try {
      const resp = await fetch(`${base}${apiPath}`, { cache: "no-store" });
      if (!resp.ok) {
        const t = await resp.text();
        errorMsg = `조회 실패: ${resp.status} ${t}`;
      } else {
        const json = await resp.json();
        rows = (json?.rows ?? []) as Row[];
      }
    } catch (e: any) {
      errorMsg = String(e?.message || e);
    }
  }

  const sumSupply = rows.reduce((a, r) => a + (r.amount || 0), 0);
  const endBalance = rows.reduce((a, r) => a + (r.curr_balance || 0), 0);

  return (
    <main className="p-6 text-white">
      <h1 className="text-3xl font-extrabold mb-4">내 거래 내역 (최근 3개월)</h1>
      <p className="mb-2">{sessionName ? `${sessionName} 님, 기간: ${date_from} ~ ${date_to}` : "로그인 필요"}</p>

      {errorMsg ? (
        <p className="text-red-400">{errorMsg}</p>
      ) : (
        <>
          <p>건수 {rows.length}건</p>
          <p>공급가 합계 {fmt(sumSupply)}원</p>
          <p>부가세 합계 0원</p>
          <p>잔액 합계 {fmt(endBalance)}원</p>

          <p className="mt-4 mb-2 font-semibold">일자 전표 라인 적요 공급가 부가세 잔액</p>

          {rows.length === 0 ? (
            <p>최근 3개월 거래가 없습니다.</p>
          ) : (
            <table className="min-w-full text-sm border-separate border-spacing-y-1">
              <thead className="text-gray-300">
                <tr>
                  <th className="text-left pr-4">일자</th>
                  <th className="text-left pr-4">적요</th>
                  <th className="text-right pr-4">수량</th>
                  <th className="text-right pr-4">단가</th>
                  <th className="text-right pr-4">공급가</th>
                  <th className="text-right pr-4">입금액</th>
                  <th className="text-right">잔액</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const isDeposit = r.item_name == null && (r.deposit ?? 0) > 0;
                  const desc = isDeposit ? "입금" : r.item_name || r.memo || "";
                  return (
                    <tr key={`${r.tx_date}-${i}`}>
                      <td className="pr-4">{r.tx_date}</td>
                      <td className="pr-4">{desc}</td>
                      <td className="text-right pr-4">{!isDeposit ? (r.qty ?? "") : ""}</td>
                      <td className="text-right pr-4">{!isDeposit ? fmt(r.unit_price) : ""}</td>
                      <td className="text-right pr-4">{!isDeposit ? fmt(r.amount) : "0"}</td>
                      <td className="text-right pr-4">{fmt(r.deposit)}</td>
                      <td className="text-right">{fmt(r.curr_balance)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </>
      )}
    </main>
  );
}
