/**
 * 研究數據範圍圖：用真實研究的「範圍＋中位數」畫成橫條（例如習慣自動化所需天數）。
 * 只能放研究中實際報告的數字，並附出處；不畫個別資料點，不做推估。
 */
export default function RangeChart({ min, max, median, axisMax, unit, title, source }: { min: number; max: number; median: number; axisMax: number; unit: string; title: string; source: string }) {
  const pct = (n: number) => `${(n / axisMax) * 100}%`;
  const ticks = [0, Math.round(axisMax / 4), Math.round(axisMax / 2), Math.round((axisMax * 3) / 4), axisMax];
  return (
    <figure data-visual="range" className="rounded-2xl border border-line bg-surface p-4">
      <figcaption className="text-sm font-bold">{title}</figcaption>
      <div className="relative mt-8 h-10" role="img" aria-label={`${title}：範圍約 ${min}–${max} ${unit}，中位數約 ${median} ${unit}（出處：${source}）`}>
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-soft" />
        {/* 範圍 */}
        <div className="absolute top-1/2 h-4 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#9DB596] to-[#E8CCB2]" style={{ left: pct(min), width: `calc(${pct(max)} - ${pct(min)})` }} />
        {/* 中位數 */}
        <div className="absolute top-0 h-full w-0.5 bg-rose" style={{ left: pct(median) }} />
        <span className="absolute -top-6 -translate-x-1/2 whitespace-nowrap rounded-full bg-rose px-2 py-0.5 text-xs font-bold text-surface" style={{ left: pct(median) }}>中位數 {median}</span>
        <span className="absolute top-full mt-1 -translate-x-1/2 text-xs text-muted" style={{ left: pct(min) }}>{min}</span>
        <span className="absolute top-full mt-1 -translate-x-1/2 text-xs text-muted" style={{ left: pct(max) }}>{max}</span>
      </div>
      <div className="mt-6 flex justify-between text-[11px] text-muted" aria-hidden>{ticks.map((t) => <span key={t}>{t}</span>)}</div>
      <p className="mt-2 text-xs text-muted">單位：{unit}。出處：{source}。實際數字依個人與行為而異。</p>
    </figure>
  );
}
