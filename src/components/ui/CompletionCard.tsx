/**
 * 統一的「完成卡」：章節、14 天練習的某一天、高效能生活章節完成時顯示。
 * 依照「一句帶走的話 → 一個建議的下一步 → 存到筆記」的順序收尾；
 * 只有一個主要按鈕（下一步），存到筆記是次要動作。已存過的內容會顯示「已存到筆記」。
 */
import { Link } from 'react-router-dom';
import { ArrowRight, BookmarkPlus, Check, PartyPopper } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { useToast } from './Toast';
import { nowIso, uid } from '../../lib/id';
import type { ChapterId } from '../../types';

export interface CompletionCardProps {
  title: string;
  /** 帶走的話（或小行動） */
  takeaway: string;
  takeawayLabel?: string;
  next: { to: string; label: string };
  /** 存到筆記時使用的章節與標籤 */
  note: { chapterId: ChapterId | 'general'; source: string; tags: string[] };
}

export default function CompletionCard({ title, takeaway, takeawayLabel = '帶走一句話', next, note }: CompletionCardProps) {
  const { data, upsert } = useStore();
  const toast = useToast();
  const saved = data.notes.some((n) => n.kind === 'highlight' && n.content === takeaway);
  const save = () => {
    const t = nowIso();
    upsert('notes', { id: uid(), chapterId: note.chapterId, kind: 'highlight', source: note.source, content: takeaway, tags: note.tags, createdAt: t, updatedAt: t });
    toast('已存到筆記，可以在「反思日誌 → 章節筆記」找到');
  };
  return (
    <div role="status" className="mt-5 rounded-3xl border border-accent/40 bg-gradient-to-br from-soft to-apricot/25 p-5 motion-safe:animate-pop sm:p-6" data-testid="completion-card">
      <p className="flex items-center gap-2 font-serif text-lg font-bold"><PartyPopper className="h-5 w-5 text-accent" aria-hidden />{title}</p>
      <p className="mt-3 text-xs font-medium text-accent">{takeawayLabel}</p>
      <p className="mt-1 font-serif text-lg leading-relaxed">「{takeaway}」</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link to={next.to} className="btn-primary btn-sm">{next.label}<ArrowRight className="h-3.5 w-3.5" aria-hidden /></Link>
        {saved
          ? <span className="inline-flex items-center gap-1 px-2 text-sm text-accent"><Check className="h-4 w-4" aria-hidden />已存到筆記</span>
          : <button type="button" className="btn-ghost btn-sm" onClick={save}><BookmarkPlus className="h-4 w-4" aria-hidden />存到筆記</button>}
      </div>
    </div>
  );
}
