// pages/api/ledger-import.ts
// CSV/XLSX 업로드 → Supabase 업서트 (버퍼 기반 멀티파트 파서 / ByteString 완전 회피)

import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { parse as parseCsv } from "csv-parse/sync";
import * as XLSX from "xlsx";

export const config = { api: { bodyParser: false } };

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

// ---------- helpers ----------
type Raw = Record<string, any>;
const S = (v: any) => String(v ?? "").trim();
const N = (v: any) => {
  const n = Number(String(v ?? "").replace(/[, ]/g, ""));
  return Number.isFinite(n) ? n : 0;
};
const toISO = (v: any) => {
  const t = S(v);
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
  if (/^\d{8}$/.test(t)) return `${t.slice(0,4)}-${t.slice(4,6)}-${t.slice(6,8)}`;
  const n = Number(t);
  if (Number.isFinite(n) && n > 20000 && n < 80000) {
    const base = new Date(Date.UTC(1899, 11, 30));
    return new Date(base.getTime() + n * 86400000).toISOString().slice(0, 10);
  }
  return "";
};
// ASCII-only 고유키(유니코드 안전)
const keyOf = (parts: Array<string | number>) =>
  encodeURIComponent(parts.map(p => String(p ?? "")).join("|"));

// ---------- Buffer 기반 멀티파트 파서 ----------
function parseMultipartByBuffer(req: NextApiRequest): Promise<{ file?: Buffer; filename?: string; baseDate?: string }> {
  return new Promise(async (resolve, reject) => {
    try {
      const ct = req.headers["content-type"]?.toString() || "";
      const m = ct.match(/boundary=(.*)$/);
      if (!m) return reject(new Error("No multipart boundary"));

      const boundaryStr = "--" + m[1];
      const boundary = Buffer.from(boundaryStr, "utf8");
      const CRLF = Buffer.from("\r\n");
      const CRLFCRLF = Buffer.from("\r\n\r\n");

      // 요청 바디를 전부 Buffer로 수집
      const chunks: Buffer[] = [];
      for await (const c of req) chunks.push(Buffer.from(c as any));
      const body = Buffer.concat(chunks);

      const parts: Buffer[] = [];
      let start = body.indexOf(boundary);
      if (start < 0) return resolve({}); // 멀티파트 아님

      // boundary 사이 조각 추출
      while (start !== -1) {
        const next = body.indexOf(boundary, start + boundary.length);
        if (next === -1) break;
        // 각 파트(헤더+데이터) 버퍼
        const part = body.slice(start + boundary.length, next);
        parts.push(part);
        start = next;
      }

      let fileBuf: Buffer | undefined;
      let filename: string | undefined;
      let baseDate: string | undefined;

      for (const rawPart of parts) {
        // 각 part는 "\r\n"로 시작하고 마지막은 "--\r\n" 또는 "\r\n"
        let p = rawPart;
        // 맨 앞 CRLF 제거
        if (p.slice(0, 2).equals(CRLF)) p = p.slice(2);
        // 헤더/본문 분리
        const sep = p.indexOf(CRLFCRLF);
        if (sep < 0) continue;
        const headersBuf = p.slice(0, sep);
        let data = p.slice(sep + CRLFCRLF.length);

        // 맨 뒤 CRLF 또는 "--\r\n" 제거
        if (data.slice(-2).equals(CRLF)) data = data.slice(0, -2);
        if (data.slice(-4).equals(Buffer.from("--\r\n"))) data = data.slice(0, -4);

        const headers = headersBuf.toString("utf8");
        const name = headers.match(/name="([^"]+)"/)?.[1];
        const fname = headers.match(/filename="([^"]*)"/)?.[1];

        if (name === "file") {
          fileBuf = data;
          filename = fname || "upload.bin";
        } else if (name === "base_date") {
          baseDate = data.toString("utf8").trim();
        }
      }

      resolve({ file: fileBuf, filename, baseDate });
    } catch (e) {
      reject(e);
    }
  });
}

// ---------- 파일 파서 ----------
function rowsFromXLSX(buf: Buffer): Raw[] {
  const wb = XLSX.read(buf, { type: "buffer" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const table = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" }) as any[][];
  // 간단 헤더 탐지
  const LABELS = {
    code: ["거래처코드", "고객코드", "코드"],
    name: ["거래처명", "고객명", "상호", "거래처"],
    date: ["출고일자", "거래일자", "매출일자", "일자"],
    doc:  ["전표번호", "문서번호"],
    line: ["행번호", "라인번호", "순번"],
    debit:["공급가", "공급가액", "금액", "매출금액"],
    credit:["부가세", "세액", "VAT"],
    bal:  ["잔액", "총액", "합계"],
    desc: ["적요", "비고", "내용", "품명", "품목", "규격"],
  };
  const hit = (h: string, arr: string[]) => arr.some(k => h.includes(k));
  let hi = 0, best = -1;
  for (let r = 0; r < Math.min(8, table.length); r++) {
    const row = table[r] || [];
    const score = row.reduce((a: number, c: any) => {
      const h = S(c);
      return a
        + (hit(h, LABELS.code) ? 1 : 0)
        + (hit(h, LABELS.name) ? 1 : 0)
        + (hit(h, LABELS.date) ? 1 : 0)
        + (hit(h, LABELS.doc)  ? 1 : 0)
        + (hit(h, LABELS.line) ? 1 : 0)
        + (hit(h, LABELS.debit)? 1 : 0)
        + (hit(h, LABELS.credit)?1 : 0)
        + (hit(h, LABELS.bal)  ? 1 : 0)
        + (hit(h, LABELS.desc) ? 1 : 0);
    }, 0);
    if (score > best) { best = score; hi = r; }
  }
  const headers = (table[hi] || []).map(h => S(h));
  const rows = table.slice(hi + 1);
  const out: Raw[] = [];
  for (const r of rows) {
    if (!Array.isArray(r) || r.every(x => S(x) === "")) continue;
    const obj: Raw = {};
    headers.forEach((h, i) => obj[h] = r[i]);
    out.push(obj);
  }
  return out;
}

function rowsFromCSV(buf: Buffer): Raw[] {
  return parseCsv(buf, { columns: true, bom: true, skip_empty_lines: true, trim: true });
}

// ---------- 핸들러 ----------
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { file, filename, baseDate } = await parseMultipartByBuffer(req);
    if (!file) return res.status(400).json({ error: "파일이 없습니다.", route: "pages/api/ledger-import" });

    // XLSX/CSV 판별 (xlsx: "PK\x03\x04")
    const isXlsx = file[0] === 0x50 && file[1] === 0x4B;
    const raw = isXlsx ? rowsFromXLSX(file) : rowsFromCSV(file);

    const rows = raw.map((r) => {
      let tx_date = (r as any).tx_date || (r as any).출고일자 || (r as any).거래일자 || (r as any).매출일자 || (r as any).date || baseDate || "";
      tx_date = toISO(tx_date);

      let code = (r as any).erp_customer_code || (r as any).거래처코드 || (r as any).고객코드 || (r as any).코드 || "";
      let name = (r as any).customer_name || (r as any).거래처명 || (r as any).상호 || (r as any).거래처 || "";

      const doc  = (r as any).doc_no || (r as any).전표번호 || (r as any).문서번호 || "";
      const line = (r as any).line_no || (r as any).행번호 || (r as any).라인번호 || (r as any).순번 || "";

      const item = (r as any).품명 || (r as any).품목 || "";
      const spec = (r as any).규격 || "";
      const qty  = (r as any).수량 ?? "";
      const price= (r as any).단가 ?? "";
      const amt  = (r as any).매출금액 ?? (r as any).금액 ?? "";

      const desc = S(
        (r as any).description || (r as any).적요 || (r as any).비고 || (r as any).내용 ||
        [item, spec, qty && `x${qty}`, price && `@${price}`, amt && `=${amt}`].filter(Boolean).join(" ")
      );

      const debit   = N((r as any).debit ?? (r as any).공급가 ?? (r as any).공급가액 ?? (r as any).금액 ?? (r as any).매출금액 ?? amt);
      const credit  = N((r as any).credit ?? (r as any).부가세 ?? (r as any).세액 ?? 0);
      const balance = N((r as any).balance ?? 0);

      let key: string = (r as any).erp_row_key || (r as any).rowkey || (r as any).고유키 || "";
      if (!key) {
        key = (doc || line)
          ? keyOf([tx_date, doc, line, code || name])
          : keyOf([tx_date, code || name, item, spec, N(qty), N(price), N(amt)]);
      }
      if (!code && name) code = name;

      return {
        erp_customer_code: S(code),
        customer_name: S(name),
        tx_date,
        doc_no: S(doc),
        line_no: S(line),
        description: desc,
        debit, credit, balance,
        erp_row_key: S(key),
        updated_at: new Date().toISOString(),
      };
    })
    .filter(r => r.tx_date && (r.erp_customer_code || r.customer_name) && r.erp_row_key)
    .filter(r => !/합계|총계/.test(r.customer_name || "") && !/합계|총계/.test(r.description || ""));

    // 업서트(1000건 배치)
    let upserted = 0;
    for (let i = 0; i < rows.length; i += 1000) {
      const chunk = rows.slice(i, i + 1000);
      const { data, error } = await supabase
        .from("ledger_entries")
        .upsert(chunk, { onConflict: "erp_row_key" })
        .select();
      if (error) throw error;
      upserted += data?.length ?? 0;
    }

    return res.status(200).json({
      ok: true,
      route: "pages/api/ledger-import",
      file: filename || "",
      total: raw.length,
      valid: rows.length,
      upserted,
    });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || String(e), route: "pages/api/ledger-import" });
  }
}
