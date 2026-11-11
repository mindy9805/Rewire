/**
 * 七大習慣自我覺察評估（21 題，五點量表）
 * 結果：七個面向的自我回報頻率、優先改善的習慣（1–3 項）、相關章節與建議工具、歷次變化。
 * ⚠️ 僅供自我反思，不是醫學或心理診斷；分數不轉換為自律程度、人格優劣或成功機率。
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ASSESSMENT_DISCLAIMER, assessmentQuestions, assessmentScale, patternHabits, patternMap, suggestedTools } from '../content/breakPattern';
import { chapterMap } from '../content/chapters';
import { useStore } from '../store/AppStore';
import { useToast } from '../components/ui/Toast';
import { useConfirm } from '../components/ui/Confirm';
import { SectionTitle } from '../components/ui/basics';
import { scoreAssessment } from '../lib/pattern';
import { nowIso, uid } from '../lib/id';
import { formatDate, toDateKey } from '../lib/date';
import type { PatternAssessment as PA, PatternHabitId } from '../types';
import { weakeningLegacy } from '../content/legacyHabits';

/** 單次評估結果顯示 */
function Result({ a }: { a: PA }) {
  const scores = scoreAssessment(a.answers);
  return (
    <div className="space-y-4">
      <figure className="rounded-2xl border border-line bg-surface p-3">
        <figcaption className="mb-1 text-center text-xs text-muted">七個面向的自我回報頻率（1 幾乎沒有 ～ 5 幾乎總是）</figcaption>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={scores.map((s) => ({ name: s.short, 頻率: s.avg }))} layout="vertical" margin={{ top: 5, right: 16, left: 8, bottom: 5 }}>
              <CartesianGrid stroke="rgb(var(--line))" strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: 'rgb(var(--muted))' }} />
              <YAxis type="category" dataKey="name" width={96} tick={{ fontSize: 11, fill: 'rgb(var(--ink))' }} />
              <Tooltip contentStyle={{ background: 'rgb(var(--surface))', border: '1px solid rgb(var(--line))', borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="頻率" fill="#7E9C8C" radius={[0, 6, 6, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </figure>
      <table className="w-full text-left text-sm">
        <caption className="sr-only">各習慣的自我回報頻率</caption>
        <thead><tr className="text-xs text-muted"><th scope="col" className="py-1">習慣</th><th scope="col">平均</th><th scope="col">頻率描述</th></tr></thead>
        <tbody>{scores.map((s) => <tr key={s.habitId} className="border-t border-line"><th scope="row" className="py-1.5 font-normal"><Link to={`/pattern/${s.habitId}`} className="underline decoration-line hover:text-accent">{s.short}</Link></th><td>{s.avg || '—'}</td><td>{s.label}</td></tr>)}</tbody>
      </table>
      {a.priorityIds.length > 0 && (
        <div className="space-y-3">
          <p className="font-serif font-bold">你優先希望改善的習慣</p>
          {a.priorityIds.map((id) => {
            const h = patternMap[id];
            return (
              <div key={id} className="rounded-2xl bg-soft/60 p-4 text-sm">
                <Link to={`/pattern/${id}`} className="font-medium text-accent underline">{h.title}</Link>
                <p className="mt-2 text-muted">相關學習章節：{h.chapterIds.map((c) => <Link key={c} to={`/learn/${c}`} className="mr-2 underline">第 {chapterMap[c].number} 章</Link>)}</p>
                <p className="mt-1 text-muted">建議練習工具：{suggestedTools[id].map((t) => <Link key={t.to} to={t.to} className="mr-2 underline">{t.label}</Link>)}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function PatternAssessment() {
  const { data, upsert, update } = useStore();
  const toast = useToast();
  const confirm = useConfirm();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [priority, setPriority] = useState<PatternHabitId[]>([]);
  const [viewId, setViewId] = useState<string | null>(null);
  const answered = Object.keys(answers).length;
  const history = [...data.patternAssessments].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const viewing = history.find((h) => h.id === viewId) ?? (viewId === null ? history[0] : undefined);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answered < 21) return;
    const rec: PA = { id: uid(), date: toDateKey(), answers, priorityIds: priority, createdAt: nowIso() };
    upsert('patternAssessments', rec);
    if (priority.length) update((p) => ({ ...p, patternFocus: priority }));
    toast('已儲存評估結果');
    setAnswers({});
    setPriority([]);
    setViewId(rec.id);
    requestAnimationFrame(() => document.getElementById('result')?.scrollIntoView({ behavior: 'smooth' }));
  };

  return (
    <div className="space-y-10 motion-safe:animate-fade-up">
      <nav aria-label="麵包屑" className="text-sm text-muted"><Link to="/pattern" className="hover:text-accent">打破慣性</Link> / 自我覺察評估</nav>
      <SectionTitle eyebrow="Self-Awareness Check" title="七大習慣自我覺察評估" desc="21 題，請依最近兩週的情況作答。沒有好壞之分，只是幫助你看見目前的模式。" />
      <p className="rounded-2xl bg-apricot/25 px-4 py-3 text-sm leading-relaxed">{ASSESSMENT_DISCLAIMER}</p>

      <form onSubmit={submit} className="space-y-6">
        {patternHabits.map((h) => (
          <section key={h.id} aria-labelledby={`as-${h.id}`} className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
            <h2 id={`as-${h.id}`} className="font-serif text-lg font-bold">{h.no}. {h.short}</h2>
            {assessmentQuestions.filter((q) => q.habitId === h.id).map((q) => (
              <fieldset key={q.id} className="mt-4">
                <legend className="text-sm">{q.text}</legend>
                <div className="mt-2 grid grid-cols-5 gap-1.5">
                  {assessmentScale.map((s) => (
                    <label key={s.v} className={`flex cursor-pointer flex-col items-center rounded-xl border px-1 py-2 text-center text-xs transition focus-within:ring-2 focus-within:ring-accent ${answers[q.id] === s.v ? 'border-accent bg-accent text-onaccent' : 'border-line bg-bg hover:border-accent/50'}`}>
                      <input type="radio" name={q.id} value={s.v} className="sr-only" checked={answers[q.id] === s.v} onChange={() => setAnswers((a) => ({ ...a, [q.id]: s.v }))} />
                      <span className="font-display text-base">{s.v}</span>{s.label}
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </section>
        ))}
        <fieldset className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
          <legend className="px-1 font-serif text-lg font-bold">你優先希望改善哪些習慣？（選 1–3 項，可不選）</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {patternHabits.map((h) => {
              const on = priority.includes(h.id);
              return <button key={h.id} type="button" aria-pressed={on} disabled={!on && priority.length >= 3} onClick={() => setPriority((p) => (on ? p.filter((x) => x !== h.id) : [...p, h.id]))} className={on ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}>{h.short}</button>;
            })}
          </div>
          <p className="mt-2 text-xs text-muted">優先順序由你決定，不一定是頻率最高的項目。選擇後會同步為「你最想調整的習慣」。</p>
        </fieldset>
        <div className="sticky bottom-20 z-10 flex items-center gap-3 rounded-2xl border border-line bg-bg/95 p-3 backdrop-blur lg:bottom-4">
          <span className="text-sm text-muted" aria-live="polite">已作答 {answered}/21</span>
          <button className="btn-primary ml-auto" type="submit" disabled={answered < 21}>查看結果並儲存</button>
        </div>
      </form>

      {history.length > 0 && (
        <section id="result" aria-labelledby="result-h" className="scroll-mt-24">
          <h2 id="result-h" className="text-xl font-bold">評估結果</h2>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label htmlFor="as-history" className="text-sm text-muted">查看：</label>
            <select id="as-history" className="field w-auto" value={viewing?.id ?? ''} onChange={(e) => setViewId(e.target.value)}>
              {history.map((h) => <option key={h.id} value={h.id}>{formatDate(h.date)}</option>)}
            </select>
            {viewing && (
              <button className="btn-ghost btn-sm" onClick={async () => { if (await confirm({ title: '刪除這次評估？', message: '刪除後無法復原。', confirmText: '刪除', danger: true })) { update((p) => ({ ...p, patternAssessments: p.patternAssessments.filter((x) => x.id !== viewing.id) })); setViewId(null); toast('已刪除評估'); } }}>刪除這次評估</button>
            )}
          </div>
          {viewing && <div className="mt-4"><Result a={viewing} /></div>}
          <p className="mt-4 text-xs text-muted">多次評估的變化，可在<Link to="/dashboard" className="underline">學習儀表板</Link>查看。</p>
        </section>
      )}

      {data.habitAudits.length > 0 && (
        <details className="rounded-2xl border border-line bg-surface p-4 text-sm">
          <summary className="cursor-pointer font-medium">先前版本的簡易自我檢視（{data.habitAudits.length} 筆，已保留）</summary>
          <ul className="mt-2 space-y-1">
            {data.habitAudits.map((a) => (
              <li key={a.id} className="text-muted">{formatDate(a.date)}：{weakeningLegacy.map((x) => `${x.title} ${['幾乎沒有', '偶爾', '經常', '幾乎每天'][a.ratings[x.id] ?? 0]}`).join('、')}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
