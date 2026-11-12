/**
 * 時間軸：多天計畫的進度（已完成／今天／之後）。以點與連線呈現，自動換行，不會造成橫向捲動。
 * onSelect 提供時，每個點都是按鈕（鍵盤可操作）。
 */
import { Check } from 'lucide-react';

export interface TimelineItem { label: string; state: 'done' | 'today' | 'later'; title?: string }

export default function Timeline({ items, onSelect, current, ariaLabel }: { items: TimelineItem[]; onSelect?: (i: number) => void; current?: number; ariaLabel: string }) {
  return (
    <ol className="grid grid-cols-7 gap-y-3" aria-label={ariaLabel}>
      {items.map((it, i) => {
        const cls = it.state === 'done' ? 'bg-accent text-onaccent border-accent' : it.state === 'today' ? 'border-amber bg-surface text-amber ring-2 ring-amber/40' : 'border-line bg-surface text-muted';
        const label = `${it.title ?? it.label}${it.state === 'done' ? '（已完成）' : it.state === 'today' ? '（下一個）' : ''}`;
        const dot = <span className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold ${cls} ${current === i ? 'outline outline-2 outline-offset-2 outline-accent' : ''}`}>{it.state === 'done' ? <Check className="h-4 w-4" aria-hidden /> : it.label}</span>;
        return (
          <li key={i} className="relative flex justify-center">
            {/* 連線：每列最後一個不畫 */}
            {(i + 1) % 7 !== 0 && i < items.length - 1 && <span aria-hidden className={`absolute left-1/2 top-1/2 h-0.5 w-full -translate-y-1/2 ${it.state === 'done' ? 'bg-accent' : 'bg-line'}`} />}
            {onSelect ? <button type="button" onClick={() => onSelect(i)} aria-label={label} aria-current={current === i ? 'step' : undefined} className="rounded-full">{dot}</button> : <span aria-label={label} role="img">{dot}</span>}
          </li>
        );
      })}
    </ol>
  );
}
