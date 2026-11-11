/**
 * 每日心智語句卡片
 * - 顯示編號、原始語句、主題與簡短說明；點擊可展開心理意涵、反思問題與行動練習。
 * - 支援收藏與複製單句。
 */
import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Copy, Heart, BookOpen } from 'lucide-react';
import type { Affirmation } from '../../types';
import { useStore } from '../../store/AppStore';
import { useToast } from '../ui/Toast';
import { copyText } from '../../lib/clipboard';
import { chapterMap } from '../../content/chapters';
import { patternHabits } from '../../content/breakPattern';
import { h7Habits } from '../../content/habits7';

export default function AffirmationCard({ a, defaultOpen = false, compact = false }: { a: Affirmation; defaultOpen?: boolean; compact?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const { data, update } = useStore();
  const toast = useToast();
  const panelId = useId();
  const fav = data.dailyFavorites.includes(a.id);

  const toggleFav = () => {
    update((p) => ({ ...p, dailyFavorites: fav ? p.dailyFavorites.filter((x) => x !== a.id) : [...p.dailyFavorites, a.id] }));
    toast(fav ? '已取消收藏' : '已加入收藏');
  };
  const copy = async () => toast((await copyText(a.text)) ? '已複製語句' : '複製失敗，請手動選取文字', 'info');

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
      {/* 背景的神經連結光點裝飾 */}
      <svg aria-hidden className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 text-sage/40" viewBox="0 0 100 100">
        <path d="M10 80 Q 40 40 60 55 T 95 15" stroke="currentColor" strokeWidth="2" fill="none" />
        <circle cx="10" cy="80" r="4" fill="currentColor" />
        <circle cx="60" cy="55" r="3" className="motion-safe:animate-twinkle" fill="rgb(var(--apricot))" />
        <circle cx="95" cy="15" r="4" fill="currentColor" />
      </svg>
      <div className="p-5">
        <div className="flex items-start gap-3">
          <span className="font-display text-2xl italic text-sage">{String(a.id).padStart(2, '0')}</span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium tracking-wider text-accent">{a.theme}</p>
            <h3 className={`mt-1 font-serif font-bold leading-snug text-ink ${compact ? 'text-lg' : 'text-xl'}`}>{a.text}</h3>
          </div>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted">{a.meaning}</p>

        <div className="mt-3 flex flex-wrap items-center gap-1">
          <button className="btn-ghost btn-sm" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls={panelId}>
            <ChevronDown className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} aria-hidden />
            {open ? '收合' : '反思與行動'}
          </button>
          <button className="btn-ghost btn-sm" onClick={toggleFav} aria-pressed={fav} aria-label={fav ? `取消收藏「${a.text}」` : `收藏「${a.text}」`}>
            <Heart className={`h-4 w-4 ${fav ? 'fill-current text-[#C0675A]' : ''}`} aria-hidden />
            {fav ? '已收藏' : '收藏'}
          </button>
          <button className="btn-ghost btn-sm" onClick={copy} aria-label={`複製「${a.text}」`}>
            <Copy className="h-4 w-4" aria-hidden />
            複製
          </button>
        </div>

        {open && (
          <div id={panelId} className="mt-3 space-y-3 border-t border-line pt-3 text-sm leading-relaxed motion-safe:animate-fade-up">
            <div>
              <p className="font-medium text-accent">反思問題</p>
              <p>{a.reflection}</p>
            </div>
            <div>
              <p className="font-medium text-accent">行動練習</p>
              <p>{a.action}</p>
            </div>
            {a.note && <p className="rounded-xl bg-apricot/30 px-3 py-2 text-xs">備註：{a.note}</p>}
            <div>
              <p className="font-medium text-accent">對應學習主題</p>
              <p className="text-muted">{a.topics}</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {patternHabits.filter((h) => h.affirmationIds.includes(a.id)).map((h) => (
                  <Link key={h.id} to={`/pattern/${h.id}`} className="chip hover:bg-sage/40">打破慣性：{h.short}</Link>
                ))}
                {h7Habits.filter((h) => h.id !== 'renew' && h.links.affirmationIds.includes(a.id)).map((h) => (
                  <Link key={h.id} to={`/habits7/${h.id}`} className="chip hover:bg-sage/40">7 Habits：{h.title}</Link>
                ))}
                {a.chapterIds.map((id) => (
                  <Link key={id} to={`/learn/${id}`} className="chip hover:bg-sage/40">
                    <BookOpen className="mr-1 h-3 w-3" aria-hidden />第 {chapterMap[id].number} 章
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
