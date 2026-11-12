/**
 * 光譜對照：健康 ←→ 過度。上方漸層條表示「是程度，不是二分」，下方左右兩欄列出原文項目。
 * 不只靠顏色：兩欄各有圖示與標題。
 */
import { Check, TriangleAlert } from 'lucide-react';

export default function SpectrumBar({ left, right, note, leftLabel = '健康', rightLabel = '需要留意' }: { left: string[]; right: string[]; note?: string; leftLabel?: string; rightLabel?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex justify-between text-xs text-muted"><span>{leftLabel}</span><span>{rightLabel}</span></div>
      <div className="mt-1.5 h-3 rounded-full bg-gradient-to-r from-[#9DB596] via-[#E8CCB2] to-[#D9A28F]" role="img" aria-label={`從「${leftLabel}」到「${rightLabel}」的光譜：多數行為落在中間，重點是程度`} />
      <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
        <div className="rounded-xl bg-soft p-3">
          <p className="flex items-center gap-1.5 text-sm font-bold"><Check className="h-4 w-4 text-accent" aria-hidden />{leftLabel}</p>
          <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm">{left.map((t) => <li key={t}>{t}</li>)}</ul>
        </div>
        <div className="rounded-xl bg-apricot/30 p-3">
          <p className="flex items-center gap-1.5 text-sm font-bold"><TriangleAlert className="h-4 w-4 text-rose" aria-hidden />過度</p>
          <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm">{right.map((t) => <li key={t}>{t}</li>)}</ul>
        </div>
      </div>
      {note && <p className="mt-3 border-l-2 border-accent pl-3 text-sm text-muted">{note}</p>}
    </div>
  );
}
