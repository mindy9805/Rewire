/**
 * 科學證據檢視卡（第 9 章／研究來源頁）
 * 依「研究主題、作者年份、設計、發現、樣本與限制、合理推論、過度簡化、原始連結」整理。
 */
import { useState } from 'react';
import { ExternalLink, ChevronDown } from 'lucide-react';
import { references, referenceMap } from '../../content/references';

export default function EvidenceCards({ ids }: { ids?: string[] }) {
  const list = (ids ? ids.map((id) => referenceMap[id]) : references.map((r) => referenceMap[r.id])).filter((r) => r?.evidence);
  const [open, setOpen] = useState<string | null>(list[0]?.id ?? null);
  return (
    <div className="space-y-3">
      {list.map((r) => {
        const e = r.evidence!;
        const isOpen = open === r.id;
        return (
          <article key={r.id} className="overflow-hidden rounded-2xl border border-line bg-surface">
            <h4 className="m-0">
              <button className="flex w-full items-center gap-3 p-4 text-left" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : r.id)}>
                <span className="flex-1">
                  <span className="chip mb-1">{e.topic}</span>
                  <span className="block font-sans font-medium">{r.authors.split(',')[0]} 等（{r.year}）</span>
                </span>
                <ChevronDown className={`h-5 w-5 shrink-0 transition ${isOpen ? 'rotate-180' : ''}`} aria-hidden />
              </button>
            </h4>
            {isOpen && (
              <dl className="grid gap-3 border-t border-line p-4 text-sm leading-relaxed sm:grid-cols-2">
                <div className="sm:col-span-2"><dt className="font-medium text-accent">作者與年份</dt><dd>{r.authors}（{r.year}）. <i>{r.title}</i>. {r.source}</dd></div>
                <div><dt className="font-medium text-accent">研究設計</dt><dd>{e.design}</dd></div>
                <div><dt className="font-medium text-accent">研究發現</dt><dd>{e.findings}</dd></div>
                <div><dt className="font-medium text-accent">樣本與限制</dt><dd>{e.sampleLimits}</dd></div>
                <div><dt className="font-medium text-accent">可以合理推論</dt><dd>{e.reasonable}</dd></div>
                <div className="sm:col-span-2 rounded-xl bg-apricot/30 p-3"><dt className="font-medium">⚠︎ 可能過度簡化的說法</dt><dd>{e.oversimplified}</dd></div>
                {r.url && (
                  <div className="sm:col-span-2">
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-accent underline">
                      原始研究連結（DOI: {r.doi}）<ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    </a>
                  </div>
                )}
              </dl>
            )}
          </article>
        );
      })}
    </div>
  );
}
