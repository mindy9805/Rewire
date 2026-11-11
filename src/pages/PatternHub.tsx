/**
 * Break the Pattern 模組首頁：核心理念、自律定義、休息與便利的正面功能、七個習慣、
 * 評估／工作坊／挑戰入口、結尾六句話。
 */
import { Link } from 'react-router-dom';
import { ClipboardList, Hammer, CalendarCheck, ArrowRight } from 'lucide-react';
import { DISCIPLINE_DEFINITION, PATTERN_CORE, PATTERN_MODULE, PATTERN_SUBTITLE, PATTERN_TITLE, POSITIVE_FUNCTIONS, patternHabits } from '../content/breakPattern';
import { FocusPicker, HabitIcon, PatternClosing } from '../components/pattern/shared';
import { useStore } from '../store/AppStore';

export default function PatternHub() {
  const { data } = useStore();
  const entries = [
    { to: '/pattern/assessment', icon: ClipboardList, title: '七大習慣自我覺察評估', desc: `21 題，約 3 分鐘。已完成 ${data.patternAssessments.length} 次。` },
    { to: '/pattern/workshop', icon: Hammer, title: '習慣改變工作坊', desc: `七個步驟，從察覺模式到反思調整。已建立 ${data.workshops.length} 份。` },
    { to: '/challenge?type=pattern', icon: CalendarCheck, title: '14 天打破慣性挑戰', desc: data.patternChallenge.status === 'active' ? '挑戰進行中，繼續今天的練習。' : '選一個習慣，展開 14 天練習。' },
  ];
  return (
    <div className="space-y-12 motion-safe:animate-fade-up">
      <header className="rounded-3xl bg-gradient-to-br from-soft via-bg to-apricot/30 p-6 sm:p-10">
        <p className="font-display text-sm italic text-accent">{PATTERN_MODULE}</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">{PATTERN_TITLE}</h1>
        <p className="mt-3 text-lg text-muted">{PATTERN_SUBTITLE}</p>
        <div className="mt-6 space-y-2 border-l-2 border-accent pl-4 leading-relaxed">
          {PATTERN_CORE.map((l) => <p key={l}>{l}</p>)}
        </div>
      </header>

      <section aria-labelledby="def-h" className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-line bg-surface p-5">
          <h2 id="def-h" className="font-serif text-lg font-bold">本模組如何定義「自律」</h2>
          <p className="mt-2 leading-relaxed">{DISCIPLINE_DEFINITION}</p>
          <p className="mt-3 text-sm text-muted">這裡描述的是「可能消耗能量的行為模式」，不是在評斷你這個人。看見模式，就有機會重新選擇。</p>
        </div>
        <div className="rounded-2xl bg-soft/60 p-5">
          <h2 className="font-serif text-lg font-bold">它們也有正面功能</h2>
          <ul className="mt-2 grid grid-cols-2 gap-2 text-sm">
            {POSITIVE_FUNCTIONS.map((p) => <li key={p.title} className="rounded-xl bg-surface p-3"><strong className="text-accent">{p.title}</strong><span className="mt-1 block text-muted">{p.text}</span></li>)}
          </ul>
        </div>
      </section>

      <section aria-labelledby="entries-h">
        <h2 id="entries-h" className="sr-only">練習入口</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {entries.map(({ to, icon: Icon, title, desc }) => (
            <Link key={to} to={to} className="card-hover rounded-2xl border border-line bg-surface p-5">
              <Icon className="h-6 w-6 text-accent" aria-hidden />
              <p className="mt-2 font-serif font-bold">{title}</p>
              <p className="mt-1 text-sm text-muted">{desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <FocusPicker />

      <section aria-labelledby="all-h">
        <h2 id="all-h" className="text-xl font-bold">七個習慣的完整學習頁</h2>
        <ol className="mt-4 space-y-2">
          {patternHabits.map((h) => (
            <li key={h.id}>
              <Link to={`/pattern/${h.id}`} className="card-hover flex items-center gap-4 rounded-2xl border border-line bg-surface p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-soft text-accent"><HabitIcon h={h} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-xs text-muted">Habit 0{h.no} · {h.concept}</span>
                  <span className="block font-serif font-bold">{h.title}</span>
                  <span className="block text-sm text-muted">互動工具：{h.toolTitle}</span>
                </span>
                <ArrowRight className="h-5 w-5 shrink-0 text-accent" aria-hidden />
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <PatternClosing />
    </div>
  );
}
