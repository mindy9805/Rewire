/**
 * 圖示卡片格：情境、例子、影響等「並列」的內容。手機 1–2 欄、桌機 3 欄。
 * 每張卡：圖示＋（可選）短標題＋原句。
 */
import type { LucideIcon } from 'lucide-react';

export interface IconCardItem { icon: LucideIcon; title?: string; text: string }

export default function IconCardGrid({ items, columns = 3 }: { items: IconCardItem[]; columns?: 2 | 3 }) {
  return (
    <ul className={`grid gap-2.5 ${columns === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
      {items.map(({ icon: Icon, title, text }, i) => (
        <li key={i} className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-3.5 sm:flex-col sm:items-center sm:text-center">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-soft text-accent"><Icon className="h-5 w-5" aria-hidden /></span>
          <span className="min-w-0 text-sm leading-relaxed">
            {title && <strong className="block font-serif text-base">{title}</strong>}
            {text}
          </span>
        </li>
      ))}
    </ul>
  );
}
