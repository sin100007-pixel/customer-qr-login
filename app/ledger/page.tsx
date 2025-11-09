"use client";

import React, { useEffect, useMemo, useState } from "react";

/* ---------- 유틸 ---------- */
const fmt = (n: number | string | null | undefined) => {
  if (n === null || n === undefined || n === "") return "";
  const v = typeof n === "string" ? Number(n) : n;
  if (Number.isNaN(v)) return "";
  return v.toLocaleString("ko-KR");
};
const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

/** 7글자 초과 시 말줄임 */
const trim7 = (s: string) => (s?.length ?? 0) > 7 ? s.slice(0, 7) + "…" : (s || "");

/* ---------- 타입 ---------- */
type Row = {
  tx_date: string;
  item_name: string;
  qty: number | null;
  unit_price: number | null;
  amount: number | null;
  deposit: number | null;
  curr_balance: number | null;
  memo?: string | null;
};
type ApiResp = { ok: boolean; rows?: Row[]; message?: string };

/* ---------- 말풍선 팝오버 ---------- */
type Side = "right" | "left" | "mobile";

const InlinePopover: React.FC<{
  anchorEl: HTMLButtonElement | null;
  title: string;
  content: string;
  onClose: () => void;
}> = ({ anchorEl, title, content, onClose }) => {
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [side, setSide] = useState<Side>("right");

  useEffect(() => {
    if (!anchorEl) return;

    const calc = () => {
      const isMobile = window.innerWidth <= 480;
      if (isMobile) {
        // 📱 모바일: 화면 중앙 카드
        const w = Math.min(window.innerWidth * 0.92, 420);
        const h = Math.min(window.innerHeight * 0.6, 360);
        setStyle({
          position: "fixed",
          left: (window.innerWidth - w) / 2,
          top: Math.max(20, window.innerHeight * 0.18),
          width: w,
          height: h,
          zIndex: 999,
        });
        setSide("mobile");
        return;
      }

      // 🖥️ 데스크톱: i 옆 말풍선
      const rect = anchorEl.getBoundingClientRect();
      const pad = 10;
      const panelWidth = 340;
      const panelHeight = 220;

      // 기본: 오른쪽
      let left = rect.right + pad;
      let top = rect.top + rect.height / 2 - panelHeight / 2;
      let s: Side = "right";

      // 우측 넘치면 왼쪽으로
      if (left + panelWidth > window.innerWidth - 8) {
        left = rect.left - pad - panelWidth;
        s = "left";
      }
      // 상하 보정
      if (top < 8) top = 8;
      if (top + panelHeight > window.innerHeight - 8) {
        top = window.innerHeight - panelHeight - 8;
      }

      setStyle({
        position: "fixed",
        left,
        top,
        width: panelWidth,
        height: panelHeight,
        zIndex: 999,
      });
      setSide(s);
    };

    calc();
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const onClickAway = (e: MouseEvent) => {
      const panel = document.getElementById("inline-popover-panel");
      if (
        panel &&
        !panel.contains(e.target as Node) &&
        !anchorEl.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    window.addEventListener("resize", calc);
    window.addEventListener("scroll", calc, true);
    window.addEventListener("keydown", onEsc);
    window.addEventListener("mousedown", onClickAway);
    return () => {
      window.removeEventListener("resize", calc);
      window.removeEventListener("scroll", calc, true);
      window.removeEventListener("keydown", onEsc);
      window.removeEventListener("mousedown", onClickAway);
    };
  }, [anchorEl, onClose]);

  if (!anchorEl) return null;

  return (
    <>
      {/* 배경 컨트라스트(살짝 어두운 베일) — 모바일에서 특히 가독성 ↑ */}
      <div
        className="fixed inset-0 z-[998] bg-black/20"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        id="inline-popover-panel"
        style={style}
        className={`popover-bubble ${side}`}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="bubble-header">
          <div className="bubble-title" title={title || "상세"}>
            {title || "상세"}
          </div>
          <button className="bubble-close" onClick={onClose}>닫기</button>
        </div>
        <div className="bubble-body">
          {content}
        </div>
      </div>

      {/* 말풍선 스타일 */}
      <style jsx>{`
        .popover-bubble {
          border-radius: 14px;
          border: 1px solid #ffffffcc;
          background: linear-gradient(180deg, #1a1d3a 0%, #0f1129 100%);
          color: #fff;
          box-shadow:
            0 10px 30px rgba(0,0,0,.45),
            inset 0 1px 0 rgba(255,255,255,.08);
          overflow: hidden;
        }
        .bubble-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 8px 10px;
          background: rgba(255,255,255,.06);
          border-bottom: 1px solid #ffffff88;
        }
        .bubble-title { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-right: 8px; }
        .bubble-close {
          font-size: 12px; padding: 3px 8px; border-radius: 8px;
          border: 1px solid #fff; background: transparent; color: #fff;
        }
        .bubble-close:hover { background:#fff; color:#0b0d21; }

        .bubble-body {
          padding: 10px;
          font-size: 13px;
          line-height: 1.5;
          white-space: pre-wrap;
          overflow: auto;
          height: calc(100% - 40px);
        }

        /* 말풍선 화살표 */
        .popover-bubble.right::after,
        .popover-bubble.left::after {
          content: "";
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 0; height: 0;
          border: 10px solid transparent;
        }
        .popover-bubble.right::after {
          left: -20px;
          border-right-color: #1a1d3a; /* 배경과 유사 색 */
        }
        .popover-bubble.left::after {
          right: -20px;
          border-left-color: #1a1d3a;
        }

        /* 모바일 카드에서는 화살표 숨김 */
        .popover-bubble.mobile::after { display: none; }
      `}</style>
    </>
  );
};

/* ---------- 페이지 ---------- */
export default function LedgerPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // 팝오버 상태
  const [popover, setPopover] = useState<{
    open: boolean;
    title: string;
    content: string;
    anchorEl: HTMLButtonElement | null;
  }>({ open: false, title: "", content: "", anchorEl: null });

  // 기간: 최근 3개월
  const date_to = useMemo(() => new Date(), []);
  const date_from = useMemo(() => {
    const d = new Date(date_to);
    d.setMonth(d.getMonth() - 3);
    return d;
  }, [date_to]);

  const [loginName, setLoginName] = useState("");

  // 로그인 이름 확보
  useEffect(() => {
    const getName = async () => {
      const usp = new URLSearchParams(window.location.search);
      const urlName = (usp.get("name") || "").trim();
      if (urlName) {
        setLoginName(urlName);
        try { localStorage.setItem("session_user", urlName); } catch {}
        return;
      }
      try {
        const r = await fetch("/api/whoami", { cache: "no-store" });
        const d = await r.json();
        if (d?.name) {
          setLoginName(d.name);
          try { localStorage.setItem("session_user", d.name); } catch {}
          return;
        }
      } catch {}
      try {
        const ls = (localStorage.getItem("session_user") || "").trim();
        if (ls) {
          setLoginName(ls);
          return;
        }
      } catch {}
      setLoginName("");
    };
    getName();
  }, []);

  // 데이터 로드
  useEffect(() => {
    const run = async () => {
      setErr("");
      setRows([]);
      if (!loginName) {
        setLoading(false);
        setErr("로그인 이름을 확인할 수 없습니다.");
        return;
      }
      setLoading(true);
      try {
        const q = encodeURIComponent(loginName);
        const url =
          `/api/ledger-search?order=excel&limit=2000` +
          `&date_from=${ymd(date_from)}` +
          `&date_to=${ymd(date_to)}` +
          `&q=${q}`;
        const r = await fetch(url, { cache: "no-store" });
        const data: ApiResp = await r.json();
        if (!data.ok) throw new Error(data.message || "불러오기 실패");
        setRows(data.rows || []);
      } catch (e: any) {
        setErr(e?.message || "에러가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [loginName, date_from, date_to]);

  const isDepositRow = (r: Row) =>
    (r.deposit ?? 0) > 0 && (r.amount ?? 0) === 0;

  return (
    <div className="ledger-wrap p-4 md:p-6 text-white" style={{ background: "#0b0d21" }}>
      <h1 className="text-[24px] md:text-[34px] font-extrabold mb-3">내 거래 내역 (최근 3개월)</h1>

      <div className="mb-3 text-white/80 text-sm md:text-base">
        <span className="mr-2">{loginName || "고객"} 님,</span>
        기간: <span className="font-semibold">{ymd(date_from)}</span> ~{" "}
        <span className="font-semibold">{ymd(date_to)}</span>
      </div>

      <div className="relative overflow-auto rounded-lg">
        <table className="ledger-table w-full text-[14px] md:text-[15px] leading-tight">
          <thead className="bg-[#12132a]">
            <tr>
              <th className="col-date">일자</th>
              <th className="col-name">품명</th>
              <th className="col-qty">수량</th>
              <th>단가</th>
              <th>공급가</th>
              <th>입금액</th>
              <th>잔액</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr><td className="py-3" colSpan={7}>불러오는 중…</td></tr>
            ) : err ? (
              <tr><td className="py-3 text-red-300" colSpan={7}>{err}</td></tr>
            ) : rows.length === 0 ? (
              <tr><td className="py-5 text-white/80" colSpan={7}>표시할 내역이 없습니다.</td></tr>
            ) : (
              rows.map((r, i) => {
                const shortName = trim7(r.item_name || "");
                const needInfo =
                  (r.item_name?.length || 0) > 7 || (r.memo && r.memo.trim().length > 0);

                return (
                  <tr key={`${r.tx_date}-${i}`} className="bg-[#0b0d21]">
                    <td className="col-date">{r.tx_date?.slice(5)}</td>

                    <td className="col-name">
                      <div className="inline-flex items-center justify-center gap-1 max-w-full">
                        <span className="truncate max-w-[60vw] md:max-w-[260px]">{shortName}</span>
                        {needInfo && (
                          <button
                            type="button"
                            onClick={(e) =>
                              setPopover({
                                open: true,
                                title: r.item_name || "",
                                content: (r.memo && r.memo.trim()) || r.item_name || "",
                                anchorEl: e.currentTarget,
                              })
                            }
                            className="ml-0.5 shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full border border-white text-[11px] hover:bg-white hover:text-[#0b0d21] transition"
                            title="상세 보기" aria-label="상세 보기"
                          >i</button>
                        )}
                      </div>
                    </td>

                    <td className="col-qty">{!isDepositRow(r) ? (r.qty ?? "") : ""}</td>
                    <td>{!isDepositRow(r) ? fmt(r.unit_price) : ""}</td>
                    <td>{!isDepositRow(r) ? fmt(r.amount) : ""}</td>
                    <td>{fmt(r.deposit)}</td>
                    <td>{fmt(r.curr_balance)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 말풍선 팝오버 */}
      {popover.open && (
        <InlinePopover
          anchorEl={popover.anchorEl}
          title={popover.title}
          content={popover.content}
          onClose={() => setPopover({ open: false, title: "", content: "", anchorEl: null })}
        />
      )}

      {/* ✅ 표 전용(스코프) 1px 흰색 테두리 + 가운데정렬 + 모바일 최적화 */}
      <style jsx>{`
        .ledger-table {
          border-collapse: collapse;
          width: 100%;
          table-layout: auto;
          border: 1px solid #ffffff;
          text-align: center;
        }
        .ledger-table th,
        .ledger-table td {
          border: 1px solid #ffffff;
          padding-block: 8px;
          padding-inline: 1ch;
          vertical-align: middle;
          white-space: nowrap;
        }
        .ledger-table thead th {
          border-bottom: 1px solid #ffffff;
          font-weight: 700;
        }

        /* 데스크톱 기본 최소폭 */
        .ledger-table .col-date { min-width: 96px; }
        .ledger-table .col-name { min-width: 320px; }
        .ledger-table .col-qty  { min-width: 84px; }

        /* 📱 모바일: 일자·품명·수량 한 화면 */
        @media (max-width: 480px) {
          .ledger-table { font-size: 13px; }
          .ledger-table th,
          .ledger-table td {
            padding-block: 6px;
            padding-inline: 0.6ch;
          }
          .ledger-table .col-date { width: 22vw; min-width: 60px; }
          .ledger-table .col-name { width: 56vw; min-width: 0; }
          .ledger-table .col-qty  { width: 22vw; min-width: 54px; }
          .ledger-table .col-name .truncate { max-width: 52vw; }
        }
      `}</style>
    </div>
  );
}
