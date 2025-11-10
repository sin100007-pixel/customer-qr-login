// app/api/ledger-search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function normDate(s?: string | null): Date | null {
  if (!s) return null;
  const ten = s.slice(0, 10).replace(/[./]/g, "-");
  const t = Date.parse(ten);
  return Number.isNaN(t) ? null : new Date(t);
}
function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const limit = Number(searchParams.get("limit") || "2000");
    const order = (searchParams.get("order") || "excel").toLowerCase();
    const dateFromRaw = searchParams.get("date_from");
    const dateToRaw = searchParams.get("date_to");

    // 최신 업로드 기준일을 먼저 한 건 가져와 기본 기간 계산
    const { data: latest, error: latestErr } = await supabase
      .from("ledger_entries")
      .select("upload_base_date")
      .order("upload_base_date", { ascending: false })
      .limit(1);

    if (latestErr) return NextResponse.json({ ok: false, message: latestErr.message }, { status: 500 });

    const baseTo = latest?.[0]?.upload_base_date as string | undefined;
    let to = normDate(dateToRaw) || (baseTo ? normDate(baseTo) : new Date());
    let from = normDate(dateFromRaw);
    if (!from) {
      const f = new Date(to!);
      f.setMonth(f.getMonth() - 3);
      from = f;
    }
    const fromStr = ymd(from!);
    const toStr = ymd(to!);

    let query = supabase
      .from("ledger_entries")
      .select(
        [
          "id",
          "upload_base_date",
          "tx_date",
          "customer_name",
          "item_name",
          "qty",
          "unit_price",
          "amount",
          "deposit",
          "curr_balance",
          "memo",
          "created_at",
        ].join(",")
      )
      .gte("upload_base_date", fromStr)
      .lte("upload_base_date", toStr)
      .limit(limit);

    if (q) query = query.ilike("customer_name", `%${q}%`);

    query = order === "excel"
      ? query.order("upload_base_date", { ascending: false }).order("id", { ascending: true })
      : query.order("id", { ascending: true });

    const { data, error } = await query;
    if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, used_date_from: fromStr, used_date_to: toStr, rows: data ?? [] });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message || "서버 오류" }, { status: 500 });
  }
}

export function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
