/**
 * 可展開的學習段落（打破慣性、7 Habits 學習頁共用）
 * - 標題本身是按鈕，可展開／收合；預設狀態由 defaultOpen 決定（有動手練習的段落預設展開）
 * - 收到「展開全部」或「展開指定段落」事件時自動展開（段落進度列跳段時使用）
 * - 結構維持 <section> > <h2>，段落進度列可以照常掃描
 */
import { useEffect, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

export const EXPAND_ALL_EVENT = 'rewire:expand-all';
export const OPEN_SECTION_EVENT = 'rewire:open-section';

/** 展開指定段落（供段落進度列跳段時呼叫） */
export const openSection = (id: string) => window.dispatchEvent(new CustomEvent(OPEN_SECTION_EVENT, { detail: id }));
export const expandAllSections = () => window.dispatchEvent(new CustomEvent(EXPAND_ALL_EVENT));

export default function CollapsibleSection({ id, no, title, defaultOpen = false, className = '', children }: { id: string; no: number; title: string; defaultOpen?: boolean; className?: string; children: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  useEffect(() => {
    const all = () => setOpen(true);
    const one = (e: Event) => (e as CustomEvent<string>).detail === id && setOpen(true);
    window.addEventListener(EXPAND_ALL_EVENT, all);
    window.addEventListener(OPEN_SECTION_EVENT, one);
    return () => { window.removeEventListener(EXPAND_ALL_EVENT, all); window.removeEventListener(OPEN_SECTION_EVENT, one); };
  }, [id]);
  return (
    <section id={id} aria-labelledby={`${id}-h`} className={`mt-6 scroll-mt-24 border-b border-line/70 pb-4 ${className}`} data-collapsible={open ? 'open' : 'closed'}>
      <h2 id={`${id}-h`} className="text-xl font-bold">
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls={`${id}-body`}
          className="flex w-full items-baseline gap-2 rounded-lg py-1 text-left hover:text-accent">
          <span className="font-display text-base italic text-sageink">{String(no).padStart(2, '0')}</span>
          <span className="flex-1">{title}</span>
          <ChevronDown className={`h-5 w-5 shrink-0 self-center text-muted transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
        </button>
      </h2>
      <div id={`${id}-body`} hidden={!open} className="mt-3">{children}</div>
    </section>
  );
}
