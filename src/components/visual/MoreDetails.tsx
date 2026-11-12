/**
 * 「看完整說明」：圖解下方的可展開區塊，收納原本的完整文字（內容一字不刪）。
 * 使用原生 <details>，鍵盤與螢幕閱讀器都能直接操作。
 */
import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

export default function MoreDetails({ label = '看完整說明', children, className = '' }: { label?: string; children: ReactNode; className?: string }) {
  return (
    <details className={`group mt-2 ${className}`}>
      <summary className="inline-flex min-h-[2.75rem] cursor-pointer list-none items-center gap-1 text-sm text-accent hover:underline [&::-webkit-details-marker]:hidden">
        <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden />{label}
      </summary>
      <div className="mt-1 space-y-2 text-sm leading-relaxed text-ink">{children}</div>
    </details>
  );
}
