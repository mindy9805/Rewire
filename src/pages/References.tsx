/**
 * 研究來源與延伸閱讀
 * 文獻有八十多筆，手機上很長，因此：
 * - 可依模組篩選（深度導讀／打破慣性／7 Habits），並可搜尋作者、標題、期刊或年份
 * - 預設只列出前 10 筆，需要時再「顯示全部」
 * - 科學證據檢視卡維持展開，方便練習批判性閱讀
 */
import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { references, referenceMap } from '../content/references';
import { chapters } from '../content/chapters';
import { patternHabits } from '../content/breakPattern';
import { h7Habits } from '../content/habits7';
import ReferenceList from '../components/ui/ReferenceList';
import EvidenceCards from '../components/interactive/EvidenceCards';
import { SectionTitle } from '../components/ui/basics';

type Filter = 'all' | 'learn' | 'pattern' | 'habits7';
const FILTERS: { id: Filter; label: string; ids: Set<string> | null }[] = [
  { id: 'all', label: '全部', ids: null },
  { id: 'learn', label: '深度導讀', ids: new Set(chapters.flatMap((c) => c.referenceIds)) },
  { id: 'pattern', label: '打破慣性', ids: new Set(patternHabits.flatMap((h) => h.referenceIds)) },
  { id: 'habits7', label: '7 Habits', ids: new Set(h7Habits.flatMap((h) => h.referenceIds)) },
];
const PREVIEW = 10;

export default function References() {
  const all = references.map((r) => referenceMap[r.id]);
  const [filter, setFilter] = useState<Filter>('all');
  const [q, setQ] = useState('');
  const [showAll, setShowAll] = useState(false);
  const list = useMemo(() => {
    const ids = FILTERS.find((f) => f.id === filter)!.ids;
    const kw = q.trim().toLowerCase();
    return all.filter((r) => (!ids || ids.has(r.id)) && (!kw || `${r.authors} ${r.title} ${r.source} ${r.year}`.toLowerCase().includes(kw)));
  }, [all, filter, q]);
  const shown = showAll || q ? list : list.slice(0, PREVIEW);

  return (
    <div className="space-y-10 motion-safe:animate-fade-up">
      <SectionTitle level={1} title="研究來源" desc="本站優先引用同行評審論文與學術專書。作者、標題、年份與 DOI 依原始出版資訊整理；無法完整確認的資料標示「待查證」。建議點擊 DOI 連結閱讀原文。" />
      <section aria-labelledby="ev-h">
        <h2 id="ev-h" className="mb-3 text-xl font-bold">科學證據檢視卡</h2>
        <p className="mb-4 text-sm text-muted">用「研究設計、樣本與限制、合理推論、過度簡化」等問題，練習批判性閱讀。</p>
        <EvidenceCards />
      </section>
      <section aria-labelledby="all-h">
        <h2 id="all-h" className="mb-3 text-xl font-bold">完整文獻清單（{all.length}）</h2>
        <div className="mb-4 space-y-3">
          <div role="group" aria-label="依模組篩選" className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button key={f.id} type="button" aria-pressed={filter === f.id} onClick={() => { setFilter(f.id); setShowAll(false); }} className="btn-toggle">
                {f.label}{f.ids && <span className="ml-1 opacity-70">{all.filter((r) => f.ids!.has(r.id)).length}</span>}
              </button>
            ))}
          </div>
          <label className="relative block max-w-md">
            <span className="sr-only">搜尋文獻</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
            <input type="search" className="field pl-9" placeholder="搜尋作者、標題、期刊或年份…" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          <p className="text-xs text-muted" aria-live="polite">符合 {list.length} 筆{!showAll && !q && list.length > PREVIEW ? `，先顯示前 ${PREVIEW} 筆` : ''}</p>
        </div>
        {list.length ? <ReferenceList refs={shown} /> : <p className="rounded-xl bg-soft/60 p-4 text-sm text-muted">找不到符合的文獻，換個關鍵字試試。</p>}
        {!showAll && !q && list.length > PREVIEW && (
          <button type="button" className="btn-secondary btn-sm mt-4" onClick={() => setShowAll(true)}>顯示全部 {list.length} 筆</button>
        )}
      </section>
      <section className="rounded-2xl bg-soft/60 p-5 text-sm leading-relaxed">
        <h2 className="font-serif text-lg font-bold">內容與著作權說明</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>本站所有學習解說皆為重新組織的原創文字，不複製書籍或影片中的長篇內容。</li>
          <li>研究發現與限制為摘要整理，可能無法涵蓋原文所有細節，請以原始論文為準。</li>
          <li>本站內容僅供學習與自我覺察，不構成醫療或心理治療建議。</li>
        </ul>
      </section>
    </div>
  );
}
