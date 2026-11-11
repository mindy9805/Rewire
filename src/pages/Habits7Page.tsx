/**
 * 7 Habits 單一習慣頁：十個學習面向＋互動工具＋章節完成體驗（測驗、應用情境、立即行動、反思、心智語句、延伸練習）
 */
import { useState, type ReactNode } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, FlaskConical, Sparkles, CheckCircle2 } from 'lucide-react';
import { h7Habits, h7Map, H7_STAGES, selfCheckScale } from '../content/habits7';
import { affirmationMap } from '../content/dailyRewire';
import { chapterMap } from '../content/chapters';
import { patternMap } from '../content/breakPattern';
import { getReferences } from '../content/references';
import { useStore } from '../store/AppStore';
import { useToast } from '../components/ui/Toast';
import { TextArea } from '../components/ui/basics';
import Quiz from '../components/interactive/Quiz';
import ReferenceList from '../components/ui/ReferenceList';
import AffirmationCard from '../components/daily/AffirmationCard';
import H7Tool from '../components/habits7/H7Tool';
import { H7Icon, SourceBadge, StatusChip } from '../components/habits7/shared';
import { DeleteButton } from '../components/pattern/EntryList';
import { h7Status, selfCheckAverage } from '../lib/habits7';
import { nowIso, uid } from '../lib/id';
import { formatDate, toDateKey } from '../lib/date';
import type { H7Id } from '../types';

function Sec({ id, no, title, children }: { id: string; no: number; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="mt-10 scroll-mt-24 motion-safe:animate-fade-up">
      <h2 id={`${id}-h`} className="mb-3 flex items-baseline gap-2 text-xl font-bold"><span className="font-display text-base italic text-sage">{String(no).padStart(2, '0')}</span>{title}</h2>
      {children}
    </section>
  );
}

export default function Habits7Page() {
  const { habitId } = useParams();
  const h = h7Map[habitId as H7Id];
  const { data, update, upsert } = useStore();
  const toast = useToast();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [reflection, setReflection] = useState('');
  if (!h) return <Navigate to="/habits7" replace />;

  const idx = h7Habits.findIndex((x) => x.id === h.id);
  const prev = h7Habits[idx - 1];
  const next = h7Habits[idx + 1];
  const status = h7Status(data, h.id);
  const stage = H7_STAGES.find((s) => s.id === h.stage)!;
  const checks = data.h7SelfChecks.filter((c) => c.habitId === h.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const setStatus = (s: 'learning' | 'done' | 'none') => {
    update((p) => {
      const progress = { ...p.h7Progress };
      if (s === 'none') delete progress[h.id];
      else progress[h.id] = { status: s, startedAt: p.h7Progress[h.id]?.startedAt || nowIso(), completedAt: s === 'done' ? nowIso() : undefined };
      return { ...p, h7Progress: progress };
    });
    toast(s === 'done' ? `已完成「${h.title}」🎉` : s === 'learning' ? '已標記為學習中' : '已重設為未開始', s === 'none' ? 'info' : 'success');
  };
  const scrollToTool = () => document.getElementById('tool')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <article className="motion-safe:animate-fade-up">
      <nav aria-label="麵包屑" className="text-sm text-muted"><Link to="/habits7" className="hover:text-accent">7 Habits</Link> / {stage.title} / 習慣{'一二三四五六七'[h.no - 1]}</nav>
      <header className="mt-3 flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-soft text-accent"><H7Icon h={h} className="h-7 w-7" /></span>
        <div>
          <p className="font-display text-sm italic text-accent">Habit {h.no} · {h.en}</p>
          <h1 className="text-3xl font-bold">{h.title}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">{stage.title}（{stage.en}）<StatusChip status={status} /></p>
        </div>
      </header>
      <div className="mt-4 flex flex-wrap gap-2">
        {status === '未開始' && <button className="btn-primary btn-sm" onClick={() => setStatus('learning')}>開始學習</button>}
        <button className="btn-secondary btn-sm" onClick={scrollToTool}><FlaskConical className="h-4 w-4" aria-hidden />互動工具：{h.toolTitle}</button>
      </div>

      <Sec id="definition" no={1} title="習慣定義與核心觀念">
        <p className="rounded-2xl bg-soft/60 p-4 font-serif text-lg leading-relaxed">{h.core}</p>
        <div className="prose-rw mt-4">{h.definition.map((p) => <p key={p}>{p}</p>)}</div>
        {h.importantNote && <aside className="rounded-2xl border-l-4 border-apricot bg-apricot/20 px-4 py-3 text-sm leading-relaxed"><strong>重要觀點：</strong>{h.importantNote}</aside>}
      </Sec>
      <Sec id="situations" no={2} title="生活與職場情境">
        <ul className="grid gap-3 md:grid-cols-3">{h.situations.map((s) => <li key={s.label} className="rounded-2xl border border-line bg-surface p-4 text-sm leading-relaxed"><span className="chip mb-2">{s.label}</span><p>{s.text}</p></li>)}</ul>
      </Sec>
      <Sec id="myths" no={3} title="常見認知誤區">
        <ul className="space-y-2">{h.misconceptions.map((m) => <li key={m.myth} className="grid gap-2 rounded-2xl border border-line bg-surface p-4 text-sm sm:grid-cols-2"><p><span className="text-muted">誤區：</span>{m.myth}</p><p><span className="text-accent">更貼近的理解：</span>{m.better}</p></li>)}</ul>
      </Sec>
      <Sec id="neuro" no={4} title="與神經可塑性的可能關聯">
        <p className="leading-relaxed">{h.neuro.text}</p>
        <p className="mt-2 rounded-xl bg-apricot/25 px-3 py-2 text-sm"><strong>解讀限制：</strong>{h.neuro.caution}</p>
      </Sec>
      <Sec id="concepts" no={5} title="心理學或管理學延伸概念">
        <dl className="grid gap-3 sm:grid-cols-2">{h.concepts.map((c) => <div key={c.term} className="rounded-2xl border border-line bg-surface p-4"><SourceBadge type={c.source} /><dt className="mt-2 font-serif font-bold">{c.term}</dt><dd className="mt-1 text-sm leading-relaxed">{c.text}</dd></div>)}</dl>
      </Sec>
      <Sec id="strategies" no={6} title="實際行動策略">
        <ol className="space-y-2">{h.strategies.map((s, i) => <li key={s} className="flex gap-3 rounded-xl bg-surface p-3 text-sm shadow-card"><span className="font-display text-lg text-sage">{i + 1}</span>{s}</li>)}</ol>
      </Sec>
      <section id="tool" aria-labelledby="tool-h" className="mt-10 scroll-mt-24">
        <h2 id="tool-h" className="mb-1 flex items-baseline gap-2 text-xl font-bold"><span className="font-display text-base italic text-sage">07</span>互動工具：{h.toolTitle}</h2>
        <p className="mb-3 text-sm text-muted"><SourceBadge type="tool" /> {h.toolDesc}</p>
        <div className="rounded-3xl border border-line bg-bg p-3 sm:p-5"><H7Tool id={h.id} /></div>
      </section>
      <Sec id="reflect" no={8} title="反思問題">
        <ul className="space-y-1.5 font-serif leading-relaxed">{h.reflections.map((r) => <li key={r}>・{r}</li>)}</ul>
      </Sec>
      <Sec id="selfcheck" no={9} title="自我評估">
        <p className="mb-3 text-sm text-muted">僅供自我觀察，沒有好壞之分，可以定期重做，看看自己的變化。</p>
        <form className="space-y-3 rounded-2xl border border-line bg-surface p-4" onSubmit={(e) => { e.preventDefault(); upsert('h7SelfChecks', { id: uid(), habitId: h.id, date: toDateKey(), answers, createdAt: nowIso() }); setAnswers({}); toast('已儲存自我評估'); }}>
          {h.selfCheck.map((q) => (
            <fieldset key={q.id}>
              <legend className="text-sm">{q.text}</legend>
              <div className="mt-1.5 grid grid-cols-5 gap-1">
                {selfCheckScale.map((l, i) => (
                  <label key={l} className={`flex cursor-pointer flex-col items-center rounded-xl border px-1 py-1.5 text-center text-[11px] focus-within:ring-2 focus-within:ring-accent ${answers[q.id] === i + 1 ? 'border-accent bg-accent text-onaccent' : 'border-line bg-bg'}`}>
                    <input type="radio" className="sr-only" name={`${h.id}-${q.id}`} checked={answers[q.id] === i + 1} onChange={() => setAnswers((a) => ({ ...a, [q.id]: i + 1 }))} /><span className="font-display text-sm">{i + 1}</span>{l}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          <button className="btn-primary btn-sm" type="submit" disabled={Object.keys(answers).length < 3}>儲存自我評估</button>
        </form>
        {checks.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {checks.map((c) => <li key={c.id} className="flex items-center gap-2 rounded-xl bg-soft/50 px-3 py-1.5 text-sm"><span className="flex-1">{formatDate(c.date)}・平均 {selfCheckAverage(c.answers)}／5</span><DeleteButton collection="h7SelfChecks" id={c.id} label="自我評估" /></li>)}
          </ul>
        )}
      </Sec>
      <Sec id="links" no={10} title="與 Rewire 其他模組的連結">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-soft/60 p-4 text-sm"><p className="font-medium text-accent">Break the Pattern</p><div className="mt-2 flex flex-wrap gap-1.5">{h.links.patternIds.map((id) => <Link key={id} to={`/pattern/${id}`} className="chip hover:bg-sage/40">{patternMap[id].short}</Link>)}</div></div>
          <div className="rounded-2xl bg-soft/60 p-4 text-sm"><p className="font-medium text-accent">神經可塑性章節與工具</p><div className="mt-2 flex flex-wrap gap-1.5">{h.links.chapterIds.map((id) => <Link key={id} to={`/learn/${id}`} className="chip hover:bg-sage/40">第 {chapterMap[id].number} 章</Link>)}{h.links.labTools.map((t) => <Link key={t.to} to={t.to} className="chip hover:bg-sage/40">{t.label}</Link>)}</div></div>
        </div>
        <h3 className="mt-6 flex items-center gap-2 font-serif text-lg font-bold"><Sparkles className="h-5 w-5 text-accent" aria-hidden />相關的每日心智語句</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">{h.links.affirmationIds.slice(0, h.links.affirmationIds.length > 2 ? 7 : 2).map((id) => <AffirmationCard key={id} a={affirmationMap[id]} compact />)}</div>
        <Link to={`/daily/read?back=${encodeURIComponent(`/habits7/${h.id}`)}`} className="btn-secondary mt-4">進入每日朗讀練習</Link>
      </Sec>

      <section aria-labelledby="finish-h" className="mt-14 rounded-3xl border border-accent/40 bg-surface p-5 sm:p-7">
        <h2 id="finish-h" className="flex items-center gap-2 text-2xl font-bold"><CheckCircle2 className="h-6 w-6 text-accent" aria-hidden />完成本章</h2>
        <h3 className="mt-5 font-serif text-lg font-bold">1. 知識測驗</h3>
        <div className="mt-3"><Quiz chapterId={`h7-${h.id}`} questions={h.quiz} saved={data.h7Quizzes[h.id]} onSave={(r) => update((p) => ({ ...p, h7Quizzes: { ...p.h7Quizzes, [h.id]: r } }))} /></div>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl bg-soft/60 p-4 text-sm"><p className="font-medium text-accent">2. 真實生活應用情境</p><p className="mt-1">{h.apply}</p></div>
          <div className="rounded-2xl bg-soft/60 p-4 text-sm"><p className="font-medium text-accent">3. 現在就能完成的行動</p><p className="mt-1">{h.quickAction}</p></div>
        </div>
        <div className="mt-4">
          <p className="font-medium text-accent">4. 反思問題</p>
          <p className="font-serif">{h.finalReflection}</p>
          <div className="mt-2"><TextArea label="寫下你的反思（存入筆記，標籤：7 Habits）" rows={2} value={reflection} onChange={(e) => setReflection(e.target.value)} /></div>
          <button className="btn-secondary btn-sm mt-2" disabled={!reflection.trim()} onClick={() => { const t = nowIso(); upsert('notes', { id: uid(), chapterId: 'general', kind: 'reflection', source: `7 Habits：${h.title}`, content: reflection.trim(), tags: ['7 Habits', h.title], createdAt: t, updatedAt: t }); setReflection(''); toast('已儲存反思'); }}>儲存反思</button>
        </div>
        <div className="mt-4 rounded-2xl bg-gradient-to-br from-soft to-apricot/25 p-4">
          <p className="text-xs font-medium text-accent">5. 對應的 Daily Rewire 語句</p>
          <p className="mt-1 font-serif text-xl font-bold">「{affirmationMap[h.links.affirmationIds[0]].text}」</p>
          <p className="text-sm text-muted">{affirmationMap[h.links.affirmationIds[0]].reflection}</p>
        </div>
        <p className="mt-4 text-sm"><span className="font-medium text-accent">6. 延伸練習（可選）：</span><Link to={h.extension.to} className="underline">{h.extension.label}</Link> — {h.extension.desc}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {status !== '已完成' ? <button className="btn-primary" onClick={() => setStatus('done')}><CheckCircle2 className="h-4 w-4" aria-hidden />標記本章為已完成</button> : <button className="btn-secondary" onClick={() => setStatus('learning')}>已完成（點擊改回學習中）</button>}
          {status !== '未開始' && <button className="btn-ghost btn-sm" onClick={() => setStatus('none')}>重設為未開始</button>}
        </div>
      </section>

      <section aria-labelledby="ref-h" className="mt-10">
        <h2 id="ref-h" className="mb-3 text-xl font-bold">研究與參考來源</h2>
        <ReferenceList refs={getReferences(h.referenceIds)} />
      </section>

      <nav aria-label="習慣切換" className="mt-14 grid gap-3 border-t border-line pt-6 sm:grid-cols-2">
        {prev ? <Link to={`/habits7/${prev.id}`} className="card-hover flex items-center gap-2 rounded-2xl border border-line bg-surface p-4"><ChevronLeft className="h-5 w-5 text-accent" aria-hidden /><span><span className="block text-xs text-muted">上一個習慣</span>{prev.title}</span></Link> : <span />}
        {next && <Link to={`/habits7/${next.id}`} className="card-hover flex items-center justify-end gap-2 rounded-2xl border border-line bg-surface p-4 text-right"><span><span className="block text-xs text-muted">下一個習慣</span>{next.title}</span><ChevronRight className="h-5 w-5 text-accent" aria-hidden /></Link>}
      </nav>
    </article>
  );
}
