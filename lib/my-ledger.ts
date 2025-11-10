// lib/my-ledger.ts
export type MyLedger = {
  id: number;
  tx_date: string | null;          // 원본 거래일(있을 수도 있음)
  upload_base_date: string;        // ✅ 업로드 기준일(모든 행 공통)
  customer_name?: string | null;   // 고객명(검색용)
  item_name: string;
  qty: number | null;
  unit_price: number | null;
  amount: number | null;
  deposit: number | null;
  curr_balance: number | null;
  memo: string | null;
  created_at?: string;
};
