/** 全站搜尋視窗：輸入即時搜尋，可用方向鍵與 Enter 選擇結果 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { search } from '../../lib/search';

export default function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const { data } = useStore();
  const navigate = useNavigate();
  const results = useMemo(() => search(q, data), [q, data]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      setQ('');
      setActive(0);
    } else if (!open && d.open) d.close();
  }, [open]);

  const go = (to: string) => {
    onClose();
    navigate(to);
  };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-label="搜尋"
      className="mt-[8vh] w-[min(94vw,40rem)] rounded-2xl border border-line bg-surface p-0 text-ink shadow-card backdrop:bg-ink/40"
    >
      <div className="flex items-center gap-2 border-b border-line px-4">
        <Search className="h-5 w-5 text-muted" aria-hidden />
        <label htmlFor="site-search" className="sr-only">
          搜尋關鍵字
        </label>
        <input
          id="site-search"
          autoFocus
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setActive(0);
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setActive((a) => Math.min(a + 1, results.length - 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            } else if (e.key === 'Enter' && results[active] && !e.nativeEvent.isComposing) {
              go(results[active].to);
            }
          }}
          placeholder="例如：習慣、66 天、自我慈悲、我的筆記…"
          className="h-14 flex-1 bg-transparent text-base outline-none"
          role="combobox"
          aria-expanded={results.length > 0}
          aria-controls="search-results"
          aria-activedescendant={results[active] ? `sr-${results[active].key}` : undefined}
        />
        <button className="icon-btn" onClick={onClose} aria-label="關閉搜尋">
          <X className="h-5 w-5" aria-hidden />
        </button>
      </div>
      <div className="max-h-[60vh] overflow-y-auto p-2">
        {q && results.length === 0 && <p className="px-3 py-8 text-center text-sm text-muted">找不到「{q}」相關的內容，試試其他關鍵字。</p>}
        {!q && <p className="px-3 py-6 text-center text-sm text-muted">可搜尋章節內容、核心概念、每日語句、14 天挑戰，以及你自己的筆記與日誌。</p>}
        <ul id="search-results" role="listbox" aria-label="搜尋結果">
          {results.map((r, i) => (
            <li key={r.key} id={`sr-${r.key}`} role="option" aria-selected={i === active}>
              <button onClick={() => go(r.to)} onMouseEnter={() => setActive(i)} className={`w-full rounded-xl px-3 py-2.5 text-left ${i === active ? 'bg-soft' : ''}`}>
                <span className="chip mr-2">{r.type}</span>
                <span className="font-medium">{r.title}</span>
                <span className="mt-0.5 line-clamp-2 block text-xs text-muted">{r.snippet}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </dialog>
  );
}
