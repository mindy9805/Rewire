/**
 * 重點卡：一句重點（必要時配一張水彩小插畫或圖示），取代長段落的開頭。
 * 完整文字放在 children，收在「看完整說明」裡。
 */
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import MoreDetails from './MoreDetails';

export default function KeyPointCard({ text, spot, icon: Icon, children, moreLabel }: { text: string; spot?: ReactNode; icon?: LucideIcon; children?: ReactNode; moreLabel?: string }) {
  return (
    <div data-visual="keypoint" className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
      <div className="flex items-center gap-4">
        {spot && <div className="w-24 shrink-0 sm:w-36">{spot}</div>}
        {!spot && Icon && <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-soft text-accent"><Icon className="h-5 w-5" aria-hidden /></span>}
        {/* 短句（≤ 30 字）用大字粗體當標語；較長的句子用一般字級，避免一段粗體壓得太重 */}
        <p className={text.length <= 30 ? 'font-serif text-lg font-bold leading-snug sm:text-xl' : 'text-[0.95rem] font-medium leading-relaxed sm:text-base'}>{text}</p>
      </div>
      {children && <MoreDetails label={moreLabel}>{children}</MoreDetails>}
    </div>
  );
}
