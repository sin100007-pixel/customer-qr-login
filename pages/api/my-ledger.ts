import type { NextApiRequest, NextApiResponse } from "next";
import * as https from "https";
import { URL } from "url";

export const config = { api: { bodyParser: false } };

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/[\r\n]+/g, "").replace(/\/+$/g, "").trim();
const SERVICE_ROLE = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").replace(/[\r\n]+/g, "").trim();

function httpsGet(urlStr: string, headers: Record<string,string>) {
  return new Promise<{status:number;text:string;headers:any}>((resolve, reject) => {
    const u = new URL(urlStr);
    const req = https.request({ method: "GET", hostname: u.hostname, path: u.pathname + u.search, headers }, (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (d) => chunks.push(d as Buffer));
      res.on("end", () => resolve({ status: res.statusCode || 0, text: Buffer.concat(chunks).toString("utf8"), headers: res.headers }));
    });
    req.on("error", reject);
    req.end();
  });
}

function ymd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "GET") { res.setHeader("Allow", "GET"); return res.status(405).json({ error: "Method Not Allowed" }); }
    if (!SUPABASE_URL || !SERVICE_ROLE) return res.status(500).json({ error: "ENV missing" });

    const raw = req.cookies?.session_user || "";
    const name = decodeURIComponent(raw || "");
    if (!name) return res.status(401).json({ error: "로그인이 필요합니다." });

    const to = new Date();
    const from = new Date(to);
    from.setMonth(from.getMonth() - 3);
    const date_from = ymd(from);
    const date_to = ymd(to);

    const base = `${SUPABASE_URL}/rest/v1/ledger_entries`;
    const list = new URL(base);
    list.searchParams.set("select", "tx_date,erp_customer_code,customer_name,doc_no,line_no,description,debit,credit,balance,erp_row_key");
    list.searchParams.set("customer_name", `eq.${encodeURIComponent(name)}`);
    list.searchParams.set("tx_date", `gte.${date_from}`);
    list.searchParams.append("tx_date", `lte.${date_to}`);
    list.searchParams.set("order", "tx_date.desc,doc_no.asc,line_no.asc");

    const headers = { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}`, Prefer: "count=exact" } as Record<string, string>;
    const listRes = await httpsGet(list.toString(), headers);
    if (listRes.status < 200 || listRes.status >= 300) return res.status(500).json({ error: `list fail ${listRes.status}`, detail: listRes.text });
    const rows = JSON.parse(listRes.text || "[]");

    const sumUrl = new URL(base);
    sumUrl.searchParams.set("select", "debit.sum(),credit.sum(),balance.sum()");
    sumUrl.searchParams.set("customer_name", `eq.${encodeURIComponent(name)}`);
    sumUrl.searchParams.set("tx_date", `gte.${date_from}`);
    sumUrl.searchParams.append("tx_date", `lte.${date_to}`);

    const sumRes = await httpsGet(sumUrl.toString(), { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` });
    let sum = { debit: 0, credit: 0, balance: 0 };
    try {
      const arr = JSON.parse(sumRes.text || "[]");
      if (Array.isArray(arr) && arr[0]) {
        sum.debit = Number(arr[0]["debit_sum"] ?? 0);
        sum.credit = Number(arr[0]["credit_sum"] ?? 0);
        sum.balance = Number(arr[0]["balance_sum"] ?? 0);
      }
    } catch {}

    return res.status(200).json({ ok: true, name, date_from, date_to, total: rows.length, rows, sum });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || String(e) });
  }
}
