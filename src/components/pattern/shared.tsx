/**
 * Break the Pattern 共用元件：習慣圖示、焦點習慣選擇卡片、結尾六句話
 */
import { Link } from 'react-router-dom';
import { Users, Sofa, ShoppingBag, Leaf, Handshake, Sprout, Hourglass, Check, ArrowRight, type LucideIcon } from 'lucide-react';
import { patternHabits, PATTERN_CLOSING, type PatternHabit } from '../../content/breakPattern';
import { useStore } from '../../store/AppStore';
import { useToast } from '../ui/Toast';
import type { PatternHabitId } from '../../types';

export const HABIT_ICONS: Record<PatternHabit['icon'], LucideIcon> = {
  users: Users, sofa: Sofa, shopping: ShoppingBag, leaf: Leaf, handshake: Handshake, sprout: Sprout, hourglass: Hourglass,
};

export function HabitIcon({ h, className = 'h-5 w-5' }: { h: PatternHabit; className?: string }) {
  const Icon = HABIT_ICONS[h.icon];
  return <Icon className={className} aria-hidden />;
}

/** 「你最想調整哪一個習慣？」七張卡片，可選 1–3 項 */
export function FocusPicker({ headingLevel = 2 }: { headingLevel?: 2 | 3 }) {
  const { data, update } = useStore();
  const toast = useToast();
  const focus = data.patternFocus;
  const H = headingLevel === 2 ? 'h2' : 'h3';
  const toggle = (id: PatternHabitId) => {
    if (focus.includes(id)) {
      update((p) => ({ ...p, patternFocus: p.patternFocus.filter((x) => x !== id) }));
      toast('已取消選擇', 'info');
    } else if (focus.length >= 3) {
      toast('最多選擇三項，先專注在少數幾個就好', 'info');
    } else {
      update((p) => ({ ...p, patternFocus: [...p.patternFocus, id] }));
      toast('已加入你想調整的習慣');
    }
  };
  return (
    <section aria-labelledby="focus-h">
      <H id="focus-h" className="font-serif text-2xl font-bold">你最想調整哪一個習慣？</H>
      <p className="mt-1 text-sm text-muted">選擇一至三項目前最想改善的習慣（已選 {focus.length}/3）。選擇會顯示在儀表板，也會作為工作坊與挑戰的預設選項。</p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {patternHabits.map((h) => {
          const on = focus.includes(h.id);
          return (
            <li key={h.id} className={`flex flex-col rounded-2xl border bg-surface p-4 shadow-card transition ${on ? 'border-accent ring-2 ring-accent/30' : 'border-line'}`}>
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-soft text-accent"><HabitIcon h={h} /></span>
                <span className="font-display text-sm italic text-muted">0{h.no}</span>
              </div>
              <p className="mt-2 font-serif text-lg font-bold">{h.short}</p>
              <p className="mt-1 text-sm text-muted">{h.cardScene}</p>
              <p className="mt-2 text-sm">💭 {h.cardPrompt}</p>
              <div className="mt-auto flex flex-wrap gap-2 pt-3">
                <button className={on ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'} aria-pressed={on} onClick={() => toggle(h.id)} aria-label={`${on ? '取消選擇' : '選擇'}「${h.short}」`}>
                  {on && <Check className="h-4 w-4" aria-hidden />}{on ? '已選擇' : '我想調整'}
                </button>
                <Link to={`/pattern/${h.id}`} className="btn-ghost btn-sm" aria-label={`開始探索「${h.short}」`}>開始探索 <ArrowRight className="h-4 w-4" aria-hidden /></Link>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** 結尾六句話：簡約、有力量的排版 */
export function PatternClosing() {
  return (
    <section aria-label="給自己的話" className="relative overflow-hidden rounded-3xl bg-forest px-6 py-10 text-[#FAF8F4] sm:px-12">
      <svg aria-hidden className="absolute -right-10 -top-10 h-48 w-48 text-[#A8BBA3]/25" viewBox="0 0 100 100"><path d="M10 90 C 30 40, 60 70, 90 10" stroke="currentColor" strokeWidth="3" fill="none" /><circle cx="90" cy="10" r="5" fill="currentColor" /></svg>
      <p className="font-serif text-2xl font-bold leading-snug sm:text-3xl">{PATTERN_CLOSING[0]}</p>
      <ul className="mt-6 space-y-2 font-serif text-lg leading-relaxed text-[#E9EEE7] sm:text-xl">
        {PATTERN_CLOSING.slice(1, 5).map((l) => <li key={l}>{l}</li>)}
      </ul>
      <p className="mt-6 inline-block rounded-full bg-[#E8CCB2] px-4 py-2 font-serif text-base font-bold text-[#36594B] sm:text-lg">{PATTERN_CLOSING[5]}</p>
    </section>
  );
}
