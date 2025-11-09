import { clearAll, clearRange, clearByName } from './actions';

export default function DangerZone() {
  return (
    <div className="mt-8 rounded-2xl border border-red-500/40 p-5 bg-red-950/20">
      <h2 className="text-red-300 font-bold text-lg">🧨 위험 구역: 데이터 삭제</h2>
      <p className="text-red-200/80 text-sm mb-4">
        되돌릴 수 없습니다. 필요 시 CSV로 먼저 백업하세요.
      </p>

      {/* 전체 삭제 */}
      <form action={clearAll} className="mb-4">
        <button
          type="submit"
          className="rounded-xl px-4 py-2 bg-red-600 text-white hover:bg-red-700"
        >
          전체 삭제
        </button>
      </form>

      {/* 기간 삭제 */}
      <form action={clearRange} className="mb-4 flex flex-wrap gap-2 items-end">
        <div className="flex flex-col">
          <label className="text-xs text-red-200/80 mb-1">시작일</label>
          <input
            name="date_from"
            type="date"
            required
            className="rounded-md px-3 py-2 bg-black/30 border border-white/20 text-white"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-red-200/80 mb-1">종료일</label>
          <input
            name="date_to"
            type="date"
            required
            className="rounded-md px-3 py-2 bg-black/30 border border-white/20 text-white"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl px-4 py-2 bg-red-600 text-white hover:bg-red-700"
        >
          기간 삭제
        </button>
      </form>

      {/* 고객명으로 삭제 */}
      <form action={clearByName} className="mb-1 flex flex-wrap gap-2 items-end">
        <div className="flex flex-col min-w-[220px]">
          <label className="text-xs text-red-200/80 mb-1">고객명(거래처명)</label>
          <input
            name="customer_name"
            placeholder="예: 고동희"
            required
            className="rounded-md px-3 py-2 bg-black/30 border border-white/20 text-white"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl px-4 py-2 bg-red-600 text-white hover:bg-red-700"
        >
          해당 고객 삭제
        </button>
      </form>
    </div>
  );
}
