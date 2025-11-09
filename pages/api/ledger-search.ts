import type { NextApiRequest, NextApiResponse } from "next";
import * as https from "https";
import { URL } from "url";

export const config = { api: { bodyParser: false } };

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/[\r\n]+/g, "").replace(/\/+$/g, "").trim();
const SERVICE_ROLE = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").replace(/[\r\n]+/g, "").trim();

function httpsRequest(urlStr: string, method: string, headers: Record<string, string>) {
  return new Promise<{ status: number; text: string; headers: any }>((resolve, reject) => {
    try {
      const u = new URL(urlStr);
      const req = https.request({ method, hostname: u.hostname, path: u.pathname + u.search, headers }, (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (d) => chunks.push(d as Buffer));
        res.on("end", () => resolve({ status: res.statusCode || 0, text: Buffer.concat(chunks).toString("utf8"), headers: res.headers }));
      });
      req.on("error", reject);
      req.end();
    } catch (e) { reject(e); }
  });
}

function buildFilterURL(base: string, p: any, select: string, order?: string) {
  const u = new URL(base);
  u.searchParams.set("select", select);
  if (p.date_from) u.searchParams.set("tx_date", `gte.${p.date_from}`);
  if (p.date_to) u.searchParams.append("tx_date", `lte.${p.date_to}`);
  if (p.q) {
    const q = p.q.replace(/[%]/g, "");
    u.searchParams.set("or", `(customer_name.ilike.*${q}*,erp_customer_code.ilike.*${q}*,doc_no.ilike.*${q}*)`);
  }
  if (order) u.searchParams.set("order", order);
  return u.toString();
}

function toCSV(rows: any[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: any) => `"${String(v ?? "").replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
  const lines = [headers.join(",")].concat(rows.map((r) => headers.map((h) => escape(r[h])).join(",")));
  return lines.join("\r\n");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "GET") { res.setHeader("Allow", "GET"); return res.status(405).json({ error: "Method Not Allowed" }); }
    if (!SUPABASE_URL || !SERVICE_ROLE) return res.status(500).json({ error: "ENV missing" });

    const p = {
      date_from: (req.query.date_from as string) || "",
      date_to: (req.query.date_to as string) || "",
      q: (req.query.q as string) || "",
      page: Number(req.query.page || 1),
      limit: Math.min(200, Math.max(1, Number(req.query.limit || 50))),
      format: (req.query.format as string) || "",
    };

    const apiBase = `${SUPABASE_URL}/rest/v1/ledger_entries`;
    const from = (p.page - 1) * p.limit;
    const to = from + p.limit - 1;

    const listURL = buildFilterURL(apiBase, p, "tx_date,erp_customer_code,customer_name,doc_no,line_no,description,debit,credit,balance,erp_row_key", "tx_date.desc,doc_no.asc,line_no.asc");
    const listRes = await httpsRequest(listURL, "GET", { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}`, Prefer: "count=exact", Range: `${from}-${to}` });
    if (listRes.status < 200 || listRes.status >= 300) return res.status(500).json({ error: `List fail (${listRes.status}) ${listRes.text}` });
    const rows = JSON.parse(listRes.text || "[]");
    const totalCount = Number(listRes.headers["content-range"]?.toString().split("/")[1] || "0");

    if (p.format === "csv") {
      const csv = toCSV(rows);
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="ledger_export.csv"`);
      return res.status(200).send(csv);
    }

    const sumURL = buildFilterURL(apiBase, p, "debit.sum(),credit.sum(),balance.sum()");
    const sumRes = await httpsRequest(sumURL, "GET", { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` });
    let sum = { debit: 0, credit: 0, balance: 0 };
    try {
      const arr = JSON.parse(sumRes.text || "[]");
      if (Array.isArray(arr) && arr[0]) {
        sum.debit = Number(arr[0]["debit_sum"] ?? 0);
        sum.credit = Number(arr[0]["credit_sum"] ?? 0);
        sum.balance = Number(arr[0]["balance_sum"] ?? 0);
      }
    } catch {}

    return res.status(200).json({ ok: true, page: p.page, limit: p.limit, total: totalCount, rows, sum });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || String(e) });
  }
}
