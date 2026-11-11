/** 研究來源清單（APA 風格），附 DOI 連結與「待查證」標示 */
import { ExternalLink } from 'lucide-react';
import type { Reference } from '../../types';

export default function ReferenceList({ refs }: { refs: Reference[] }) {
  return (
    <ol className="space-y-3 text-sm leading-relaxed">
      {refs.map((r) => (
        <li key={r.id} className="rounded-xl border border-line bg-surface p-3">
          <p>
            {r.authors}（{r.year}）. <i>{r.title}</i>. {r.source}.
            {!r.verified && <span className="ml-1 rounded bg-apricot/60 px-1.5 text-xs text-ink">待查證</span>}
          </p>
          {r.note && <p className="mt-1 text-xs text-muted">{r.note}</p>}
          {r.url && (
            <a href={r.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-accent underline">
              DOI: {r.doi} <ExternalLink className="h-3 w-3" aria-hidden />
              <span className="sr-only">（另開新視窗）</span>
            </a>
          )}
        </li>
      ))}
    </ol>
  );
}
