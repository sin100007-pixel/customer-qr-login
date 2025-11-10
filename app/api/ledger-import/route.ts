// app/api/ledger-import/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // 서버 전용 키
);

function normDate(s?: string | null): Date | null {
  if (!s) return null;
  const ten = s.slice(0, 10).replace(/[./]/g, "-");
  const t = Date.parse(ten);
  return Number.isNaN(t) ? null : new Date(t);
}

type UploadRow = {
  tx_date?: string | null;
  customer_name?: string | null;
  item_name: string;
  qty?: number | null;
  unit_price?: number | null;
  amount?: number | null;
  deposit?: number | null;
  curr_balance?: number | null;
  memo?: string | null;
  // 프로젝트에 있는 추가 컬럼이 있으면 여기에 더 넣고 아래 insert payload에도 매핑하세요.
};

// { baseDate: "YYYY-MM-DD", rows: UploadRow[] }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const baseDate: string | undefined = body?.baseDate;
    const rows: UploadRow[] | undefined = body?.rows;

    const base = normDate(baseDate);
    if (!base) return NextResponse.json({ ok: false, message: "기준일(baseDate)이 유효하지 않습니다." }, { status: 400 });
    if (!Array.isArray(rows) || rows.length === 0)
      return NextResponse.json({ ok: false, message: "업로드할 데이터가 없습니다." }, { status: 400 });

    const upload_base_date = base.toISOString().slice(0, 10);

    const payload = rows.map((r) => {
      const tx = r.tx_date ? normDate(r.tx_date) : null;
      return {
        upload_base_date,                                      // ✅ 기준일(모든 행 공통)
        tx_date: tx ? tx.toISOString().slice(0, 10) : null,    // 원본 거래일(있으면 보존)
        customer_name: r.customer_name ?? null,
        item_name: (r.item_name ?? "").toString().trim(),
        qty: r.qty ?? null,
        unit_price: r.unit_price ?? null,
        amount: r.amount ?? null,
        deposit: r.deposit ?? null,
        curr_balance: r.curr_balance ?? null,
        memo: r.memo ?? null,
      };
    });

    // ✅ 테이블명을 ledger_entries로 고정
    const { error } = await supabase.from("ledger_entries").insert(payload);
    if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, count: payload.length, baseDate: upload_base_date });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message || "서버 오류" }, { status: 500 });
  }
}

export function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
