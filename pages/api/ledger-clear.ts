import type { NextApiRequest, NextApiResponse } from "next";
import * as https from "https";
import { URL } from "url";

export const config = { api: { bodyParser: true } };

// 안전을 위해 관리자 토큰 필요
const ADMIN_CLEAR_TOKEN = (process.env.ADMIN_CLEAR_TOKEN ?? "").trim();
const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/[\r\n]+/g, "").replace(/\/+$/g, "").trim();
const SERVICE_ROLE = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").replace(/[\r\n]+/g, "").trim();

function httpsRequest(urlStr: string, method: string, headers: Record<string, string>) {
  return new Promise<{ status: number; text: string }>((resolve, reject) => {
    try {
      const u = new URL(urlStr);
      const req = https.request(
        { method, hostname: u.hostname, path: u.pathname + u.search, headers },
        (res) => {
          const chunks: Buffer[] = [];
          res.on("data", (d) => chunks.push(d as Buffer));
          res.on("end", () => resolve({ status: res.statusCode || 0, text: Buffer.concat(chunks).toString("utf8") }));
        }
      );
      req.on("error", reject);
      req.end();
    } catch (e) { reject(e); }
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "Method Not Allowed" }); }
    if (!SUPABASE_URL || !SERVICE_ROLE) return res.status(500).json({ error: "ENV missing" });
    if (!ADMIN_CLEAR_TOKEN) return res.status(500).json({ error: "ADMIN_CLEAR_TOKEN not set" });

    const token = req.headers["x-admin-token"];
    if (token !== ADMIN_CLEAR_TOKEN) return res.status(401).json({ error: "Unauthorized" });

    const { scope, date_from, date_to, customer_name } = (req.body || {}) as {
      scope: "all" | "date" | "name";
      date_from?: string; date_to?: string; customer_name?: string;
    };

    const base = `${SUPABASE_URL}/rest/v1/ledger_entries`;
    const u = new URL(base);

    if (scope === "all") {
      // 전체 삭제 (PostgREST는 필터 없이는 삭제 금지 → not.is.null 필터 사용)
      u.searchParams.set("erp_row_key", "not.is.null");
    } else if (scope === "date") {
      if (!date_from || !date_to) return res.status(400).json({ error: "date_from/date_to required" });
      u.searchParams.set("tx_date", `gte.${date_from}`);
      u.searchParams.append("tx_date", `lte.${date_to}`);
    } else if (scope === "name") {
      if (!customer_name) return res.status(400).json({ error: "customer_name required" });
      u.searchParams.set("customer_name", `eq.${encodeURIComponent(customer_name)}`);
    } else {
      return res.status(400).json({ error: "invalid scope" });
    }

    const headers: Record<string, string> = {
      apikey: SERVICE_ROLE,
      Authorization: `Bearer ${SERVICE_ROLE}`,
      Prefer: "return=minimal",
    };

    const { status, text } = await httpsRequest(u.toString(), "DELETE", headers);
    if (status < 200 || status >= 300) return res.status(500).json({ error: `delete fail ${status}`, detail: text });

    return res.status(200).json({ ok: true, scope, date_from, date_to, customer_name });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || String(e) });
  }
}
