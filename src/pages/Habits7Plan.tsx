/**
 * 21 天七習慣探索計畫
 * 每個習慣三天（理解概念 → 行動實驗 → 反思調整）；每日任務、進度儲存、個人反思、
 * 可編輯的行動計畫、中斷後繼續，以及課程結束回顧。
 * ⚠️ 21 天為課程設計長度，不代表完成後即可養成永久習慣。
 */
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Circle } from 'lucide-react';
import { h7Map, PHASE_LABEL, planDays, PLAN_NOTE } from '../content/habits7';
import { affirmationMap } from '../content/dailyRewire';
import { useStore } from '../store/AppStore';
import { useToast } from '../components/ui/Toast';
import { ProgressBar, SectionTitle, TextArea } from '../components/ui/basics';
import { H7Icon } from '../components/habits7/shared';
import { nowIso } from '../lib/id';
import { formatDate, isoToDateKey } from '../lib/date';
import { planProgress } from '../lib/habits7';
import type { H7PlanDay } from '../types';

const emptyDay: H7PlanDay = { completed: false, reflection: '', actionPlan: '' };

export default function Habits7Plan() {
  const { data, update } = useStore();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const pp = planProgress(data);
  const day = Math.min(21, Math.max(1, Number(params.get('day')) || pp.nextDay || 21));
  const info = planDays[day - 1];
  const h = h7Map[info.habitId];
  const rec = data.h7Plan.days[String(day)] ?? emptyDay;
  const [form, setForm] = useState<H7PlanDay>(rec);
  const [review, setReview] = useState(data.h7Plan.finalReview);

  useEffect(() => {
    setForm(data.h7Plan.days[String(day)] ?? emptyDay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day]);

  const persist = (d: H7PlanDay) => update((p) => ({ ...p, h7Plan: { ...p.h7Plan, startedAt: p.h7Plan.startedAt || nowIso(), days: { ...p.h7Plan.days, [String(day)]: { ...d, updatedAt: nowIso() } } } }));
  const toggle = () => {
    const completed = !rec.completed;
    const d = { ...form, completed, completedAt: completed ? nowIso() : undefined };
    setForm(d);
    persist(d);
    toast(completed ? `第 ${day} 天完成，做得很好 🌱` : '已取消完成，隨時可以重新練習', completed ? 'success' : 'info');
  };
  const aff = affirmationMap[h.links.affirmationIds[(day - 1) % h.links.affirmationIds.length]];

  return (
    <div className="space-y-6 motion-safe:animate-fade-up">
      <nav aria-label="麵包屑" className="text-sm text-muted"><Link to="/habits7" className="hover:text-accent">7 Habits</Link> / 21 天探索計畫</nav>
      <SectionTitle eyebrow="21-Day Exploration" title="21 天七習慣探索計畫" desc="每個習慣三天：第一天理解概念、第二天完成行動實驗、第三天反思並調整策略。不需要連續完成，中斷後隨時可以繼續。" />
      <p className="rounded-2xl bg-apricot/25 px-4 py-3 text-sm">{PLAN_NOTE}</p>
      <ProgressBar label="探索計畫進度" value={pp.done} max={21} />
      {data.h7Plan.startedAt && <p className="text-xs text-muted">開始於 {formatDate(isoToDateKey(data.h7Plan.startedAt))}</p>}

      <nav aria-label="選擇天數">
        <ol className="grid grid-cols-7 gap-1.5">
          {planDays.map((p) => {
            const c = data.h7Plan.days[String(p.day)]?.completed;
            return (
              <li key={p.day}>
                <button onClick={() => setParams({ day: String(p.day) })} aria-current={p.day === day ? 'step' : undefined} aria-label={`第 ${p.day} 天：${p.title}${c ? '（已完成）' : ''}`}
                  className={`flex aspect-square w-full flex-col items-center justify-center rounded-xl border text-xs ${p.day === day ? 'border-accent bg-accent text-onaccent' : c ? 'border-sage bg-soft text-accent' : 'border-line bg-surface hover:border-accent/50'}`}>
                  <span className="font-display text-sm">{p.day}</span>{c && <CheckCircle2 className="h-3 w-3" aria-hidden />}
                </button>
              </li>
            );
          })}
        </ol>
        <p className="mt-1 text-xs text-muted">每一列代表一週；每三格對應一個習慣。</p>
      </nav>

      <article aria-labelledby="pd-h" className="rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-7">
        <p className="flex items-center gap-2 text-sm text-accent"><H7Icon h={h} className="h-4 w-4" />Day {day} / 21・習慣{'一二三四五六七'[h.no - 1]}「{h.title}」・{PHASE_LABEL[info.phase]}</p>
        <h2 id="pd-h" className="mt-1 font-serif text-2xl font-bold">{info.title}</h2>
        <div className="mt-4 rounded-2xl bg-soft/60 p-4"><p className="text-xs font-medium text-accent">今日任務</p><p className="mt-1 leading-relaxed">{info.task}</p></div>
        <Link to={info.phase === 'experiment' ? `/habits7/${h.id}#tool` : `/habits7/${h.id}`} className="btn-secondary btn-sm mt-3">前往「{h.title}」{info.phase === 'experiment' ? '互動工具' : '章節'}</Link>
        <div className="mt-5"><p className="text-sm font-medium">今日反思：{info.reflection}</p><div className="mt-2"><TextArea label="我的反思" rows={3} value={form.reflection} onChange={(e) => setForm((f) => ({ ...f, reflection: e.target.value }))} /></div></div>
        <div className="mt-3"><TextArea label="我的行動計畫（可隨時編輯）" rows={2} value={form.actionPlan} onChange={(e) => setForm((f) => ({ ...f, actionPlan: e.target.value }))} placeholder="例如：明早 8 點先做第二象限的事" /></div>
        <div className="mt-4 rounded-2xl bg-gradient-to-br from-soft to-apricot/25 p-4 text-sm"><p className="text-xs font-medium text-accent">今日心智語句</p><p className="font-serif text-lg font-bold">「{aff.text}」</p></div>
        <div className="mt-5 flex flex-wrap gap-3">
          <button className="btn-secondary" onClick={() => { persist({ ...form, completed: rec.completed, completedAt: rec.completedAt }); toast(`已儲存第 ${day} 天的紀錄`); }}>儲存紀錄</button>
          <button className={rec.completed ? 'btn-secondary' : 'btn-primary'} aria-pressed={rec.completed} onClick={toggle}>{rec.completed ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : <Circle className="h-4 w-4" aria-hidden />}{rec.completed ? '已完成（點擊取消）' : '儲存並標記完成'}</button>
        </div>
        <div className="mt-6 flex justify-between">
          <button className="btn-ghost btn-sm" disabled={day === 1} onClick={() => setParams({ day: String(day - 1) })}>← 前一天</button>
          <button className="btn-ghost btn-sm" disabled={day === 21} onClick={() => setParams({ day: String(day + 1) })}>後一天 →</button>
        </div>
      </article>

      <section aria-labelledby="review-h" className="rounded-3xl bg-forest p-6 text-[#FAF8F4] sm:p-8">
        <h2 id="review-h" className="font-serif text-xl font-bold">課程結束回顧</h2>
        <p className="mt-1 text-sm text-[#E9EEE7]">已完成 {pp.done}/21 天。{pp.done === 21 ? '恭喜走完 21 天！這是探索的結束，也是持續練習的開始。' : '隨時可以先寫下目前的回顧，之後再更新。'}</p>
        <label htmlFor="final-review" className="mt-3 block text-sm">這 21 天，我最想帶走的是哪一個習慣？下一步想怎麼繼續？</label>
        <textarea id="final-review" className="mt-2 w-full rounded-xl border-0 bg-white/10 p-3 text-[#FAF8F4] placeholder:text-[#E9EEE7]/60 focus:outline-none focus:ring-2 focus:ring-[#E8CCB2]" rows={4} value={review} onChange={(e) => setReview(e.target.value)} />
        <button className="btn mt-2 bg-[#FAF8F4] text-[#36594B] hover:bg-[#E9EEE7]" onClick={() => { update((p) => ({ ...p, h7Plan: { ...p.h7Plan, finalReview: review.trim() } })); toast('已儲存回顧'); }}>儲存回顧</button>
      </section>
    </div>
  );
}
