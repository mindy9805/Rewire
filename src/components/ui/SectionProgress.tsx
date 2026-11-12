/**
 * 長頁面的「段落進度列」：黏在頂部列下方，顯示「目前第幾段／共幾段」與段落名稱，
 * 點一下展開所有段落，可直接跳到任何一段。章節頁、打破慣性學習頁、高效能生活學習頁共用。
 *
 * 段落清單是浮在內容上方的下拉選單，開關時不會推動頁面內容。
 * 運作方式：掃描 <main> 中「直接含有 h2 的 section」當作段落（不需要每頁另外設定），
 * 捲動時以畫面上方附近的段落為目前位置。pageKey 改變（例如換章節）時重新掃描。
 */
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ListTree } from 'lucide-react';
import { scrollBehavior } from '../../lib/motion';
import { expandAllSections, openSection } from './CollapsibleSection';

type Item = { el: HTMLElement; title: string };
/** 頂部列高度＋進度列高度，跳轉時讓段落標題不被遮住 */
const OFFSET = 128;

export default function SectionProgress({ pageKey }: { pageKey: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [current, setCurrent] = useState(0);
  const [open, setOpen] = useState(false);
  const self = useRef<HTMLDivElement>(null);

  // 掃描段落（等這一輪畫面完成後再掃，確保內容已經渲染）
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const found = [...document.querySelectorAll<HTMLElement>('main section')]
        .filter((s) => s.querySelector(':scope > h2'))
        .filter((s, _, all) => !all.some((o) => o !== s && o.contains(s)))
        .map((el) => ({ el, title: (el.querySelector(':scope > h2')!.textContent ?? '').replace(/^\d+\s*/, '').trim() }));
      setItems(found);
    });
    setOpen(false);
    return () => cancelAnimationFrame(id);
  }, [pageKey]);

  // 依捲動位置更新目前段落
  useEffect(() => {
    if (!items.length) return;
    const onScroll = () => {
      let idx = 0;
      items.forEach((it, i) => { if (it.el.getBoundingClientRect().top <= OFFSET + 16) idx = i; });
      setCurrent(idx);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [items]);

  // Esc 或點到外面時收起清單
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onClick = (e: MouseEvent) => !self.current?.contains(e.target as Node) && setOpen(false);
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onClick);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('mousedown', onClick); };
  }, [open]);

  if (items.length < 3) return null;
  const hasCollapsed = items.some((it) => it.el.dataset.collapsible === 'closed');
  const go = (i: number) => {
    setOpen(false);
    // 可展開段落：先展開再捲動
    if (items[i].el.id) openSection(items[i].el.id);
    const top = items[i].el.getBoundingClientRect().top + window.scrollY - OFFSET + 8;
    window.scrollTo({ top, behavior: scrollBehavior() });
  };
  const pct = Math.round(((current + 1) / items.length) * 100);

  return (
    <div ref={self} className="no-print sticky top-[4.1rem] mt-6 z-30 -mx-4 border-b border-line bg-bg px-4 sm:mx-0 sm:rounded-2xl sm:border" data-testid="section-progress">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="section-list"
        className="flex min-h-[2.75rem] w-full items-center gap-2 text-left text-sm">
        <ListTree className="h-4 w-4 shrink-0 text-accent" aria-hidden />
        <span className="shrink-0 text-xs text-muted">第 {current + 1}／{items.length} 段</span>
        <span className="min-w-0 truncate font-medium">{items[current]?.title}</span>
        <span className="ml-auto flex shrink-0 items-center gap-1 text-xs text-accent">段落<ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden /></span>
      </button>
      <div className="-mx-4 h-0.5 bg-soft sm:mx-0" aria-hidden><div className="h-full bg-accent transition-[width] duration-300" style={{ width: `${pct}%` }} /></div>
      {open && (
        // 浮在內容上方的下拉清單：開關時不改變頁面版面，跳轉位置才會準確
        <ol id="section-list" className="absolute inset-x-0 top-full max-h-[60vh] overflow-y-auto border-b border-line bg-bg px-2 py-2 shadow-card sm:mt-1 sm:rounded-2xl sm:border" aria-label="本頁段落">
          {items.map((it, i) => (
            <li key={i}>
              <button type="button" onClick={() => go(i)} aria-current={i === current ? 'location' : undefined}
                className={`flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-sm hover:bg-soft ${i === current ? 'font-medium text-accent' : ''}`}>
                <span className="w-6 shrink-0 text-right font-display text-xs text-muted">{i + 1}</span>{it.title}
              </button>
            </li>
          ))}
          {hasCollapsed && (
            <li className="mt-1 border-t border-line pt-1">
              <button type="button" className="w-full rounded-xl px-2 py-2 text-left text-sm text-accent hover:bg-soft" onClick={() => { expandAllSections(); setOpen(false); }}>展開全部段落</button>
            </li>
          )}
        </ol>
      )}
    </div>
  );
}
