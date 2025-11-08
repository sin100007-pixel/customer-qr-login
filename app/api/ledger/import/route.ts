import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { parse as parseCsv } from "csv-parse/sync";
import * as XLSX from "xlsx";
import crypto from "node:crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // 서버에서만 사용
);

type Raw = Record<string, any>;
const norm = (v:any)=> String(v ?? "").trim();
const toNum = (v:any)=> {
  const n = Number(String(v??"").replace(/[, ]/g,""));
  return Number.isFinite(n) ? n : 0;
};
const toISO = (v:any)=> {
  // YYYY-MM-DD / YYYYMMDD / 엑셀 일련번호 지원
  const t = norm(v);
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
  if (/^\d{8}$/.test(t)) return `${t.slice(0,4)}-${t.slice(4,6)}-${t.slice(6,8)}`;
  const n = Number(t);
  if (Number.isFinite(n) && n > 20000 && n < 80000) {
    const base = new Date(Date.UTC(1899,11,30));
    return new Date(base.getTime()+n*86400000).toISOString().slice(0,10);
  }
  return new Date().toISOString().slice(0,10);
};

function rowsFromCSV(buf:Buffer): Raw[] {
  return parseCsv(buf, { columns:true, bom:true, skip_empty_lines:true, trim:true });
}
function rowsFromXLSX(buf:Buffer): Raw[] {
  const wb = XLSX.read(buf, { type:"buffer" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(ws, { defval:"" }) as Raw[];
}

// 한글/영문 헤더 자동 매핑
function mapHeader(h:string){
  return h.replace(/\s+/g,"").toLowerCase()
    .replace(/출고|거래/g,"tx")
    .replace(/일자|날짜/g,"date")
    .replace(/전표번호|전표no|문서번호/g,"docno")
    .replace(/라인번호|행번호/g,"lineno")
    .replace(/거래처코드|거래처id|고객코드/g,"erpcustomer")
    .replace(/거래처명|고객명/g,"customername")
    .replace(/차변|공급가|debitamount?/g,"debit")
    .replace(/대변|부가세|creditamount?/g,"credit")
    .replace(/잔액|balanceamount?/g,"balance")
    .replace(/적요|내용|비고/g,"desc")
    .replace(/erp_row_key|rowkey|키|고유키/g,"rowkey");
}
function buildKey(row:any, idx:number){
  if (row.rowkey) return norm(row.rowkey);
  const base = [
    norm(row.docno), norm(row.lineno), norm(row.txdate),
    norm(row.desc), toNum(row.debit), toNum(row.credit), toNum(row.balance)
  ].join("|");
  return crypto.createHash("sha1").update(base || String(idx)).digest("hex");
}

export async function POST(req: NextRequest){
  try{
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if(!file) return NextResponse.json({error:"파일이 없습니다"}, {status:400});

    const buf = Buffer.from(await file.arrayBuffer());
    const name = (file.name||"").toLowerCase();
    const isXlsx = name.endsWith(".xlsx") || name.endsWith(".xls") || /sheet|excel/.test(file.type);
    const raw = isXlsx ? rowsFromXLSX(buf) : rowsFromCSV(buf);

    // 컬럼 정규화
    const rows = raw.map((r,i)=>{
      const t:any = {};
      Object.entries(r).forEach(([k,v])=> t[mapHeader(String(k))]=v);

      const tx_date = toISO(t.txdate || t.tx_date || t.date);
      const doc_no  = norm(t.docno || t.doc_no);
      const line_no = norm(t.lineno || t.line_no);
      const code    = norm(t.erpcustomer || t.erp_customer_code);
      const name    = norm(t.customername || t.customer_name);
      const desc    = norm(t.desc || t.description);
      const debit   = toNum(t.debit);
      const credit  = toNum(t.credit);
      const balance = toNum(t.balance);
      const erp_row_key = buildKey(t, i);

      return {
        erp_customer_code: code,
        customer_name: name,
        tx_date, doc_no, line_no,
        description: desc, debit, credit, balance,
        erp_row_key, updated_at: new Date().toISOString()
      };
    }).filter(r => r.erp_customer_code && r.tx_date && r.erp_row_key);

    // 배치 업서트
    let upserted = 0;
    for (let i=0;i<rows.length;i+=1000){
      const chunk = rows.slice(i,i+1000);
      const { error, count } = await supabase
        .from("ledger_entries")
        .upsert(chunk, { onConflict:"erp_row_key" })
        .select("*",{ head:true, count:"exact" });
      if (error) throw error;
      upserted += count || 0;
    }

    return NextResponse.json({ ok:true, file:name, total:raw.length, valid:rows.length, upserted });
  }catch(e:any){
    return NextResponse.json({ error:e?.message || String(e) }, { status:500 });
  }
}
