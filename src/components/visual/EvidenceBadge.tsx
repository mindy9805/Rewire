/**
 * 證據標籤＋研究卡：標示內容的證據類型，避免把推論說成定論。
 * kind：research 研究支持／preliminary 初步或相關性證據／inference 延伸推論／philosophy 管理哲學／tool 本站工具
 */
import type { ReactNode } from 'react';
import { Compass, FlaskConical, Lightbulb, Wrench, type LucideIcon } from 'lucide-react';
import MoreDetails from './MoreDetails';

export type EvidenceKind = 'research' | 'preliminary' | 'inference' | 'philosophy' | 'tool';
const KIND: Record<EvidenceKind, { label: string; icon: LucideIcon; cls: string }> = {
  research: { label: '研究支持', icon: FlaskConical, cls: 'bg-soft text-accent' },
  preliminary: { label: '初步證據', icon: FlaskConical, cls: 'bg-amber/15 text-amber' },
  inference: { label: '延伸推論', icon: Lightbulb, cls: 'bg-amber/15 text-amber' },
  philosophy: { label: '管理哲學', icon: Compass, cls: 'bg-soft text-accent' },
  tool: { label: '本站工具', icon: Wrench, cls: 'bg-apricot/40 text-ink' },
};

export function EvidenceTag({ kind, label }: { kind: EvidenceKind; label?: string }) {
  const k = KIND[kind];
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${k.cls}`}><k.icon className="h-3.5 w-3.5" aria-hidden />{label ?? k.label}</span>;
}

export default function EvidenceBadge({ kind, label, summary, meta = [], children, moreLabel = '看完整說明與研究來源' }: { kind: EvidenceKind; label?: string; summary?: string; meta?: [string, string][]; children?: ReactNode; moreLabel?: string }) {
  return (
    <div data-visual="evidence" className="rounded-2xl border border-line bg-surface p-4">
      <EvidenceTag kind={kind} label={label} />
      {summary && <p className="mt-2 text-sm leading-relaxed">{summary}</p>}
      {meta.length > 0 && (
        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
          {meta.map(([k, v]) => <div key={k} className="contents"><dt className="text-muted">{k}</dt><dd>{v}</dd></div>)}
        </dl>
      )}
      {children && <MoreDetails label={moreLabel}>{children}</MoreDetails>}
    </div>
  );
}
