/**
 * 單一習慣學習頁：10 個段落（定義、情境、機制、影響、界線、神經可塑性、替代行動、反思、行動實驗、研究證據）
 * ＋互動工具＋對應心智語句＋相關章節。
 */
import { useState, type ReactNode } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, FlaskConical, BookOpen, Sparkles } from 'lucide-react';
import { patternHabits, patternMap } from '../content/breakPattern';
import { affirmationMap } from '../content/dailyRewire';
import { chapterMap } from '../content/chapters';
import { getReferences } from '../content/references';
import { useStore } from '../store/AppStore';
import { useToast } from '../components/ui/Toast';
import { TextArea } from '../components/ui/basics';
import ReferenceList from '../components/ui/ReferenceList';
import AffirmationCard from '../components/daily/AffirmationCard';
import PatternTool from '../components/pattern/PatternTool';
import PracticeAffirmation from '../components/pattern/PracticeAffirmation';
import { HabitIcon } from '../components/pattern/shared';
import { h7Map, recommendationRules } from '../content/habits7';
import { DeleteButton } from '../components/pattern/EntryList';
import { nowIso, uid } from '../lib/id';
import { formatDate, toDateKey } from '../lib/date';
import type { PatternHabitId } from '../types';

function Sec({ id, no, title, children }: { id: string; no: number; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="mt-10 scroll-mt-24">
      <h2 id={`${id}-h`} className="mb-3 flex items-baseline gap-2 text-xl font-bold">
        <span className="font-display text-base italic text-sage">{String(no).padStart(2, '0')}</span>{title}
      </h2>
      {children}
    </section>
  );
}

export default function PatternHabitPage() {
  const { habitId } = useParams();
  const h = patternMap[habitId as PatternHabitId];
  const { data, upsert, update } = useStore();
  const toast = useToast();
  const [result, setResult] = useState('');
  const [reflection, setReflection] = useState('');
  const [celebrate, setCelebrate] = useState(false);
  if (!h) return <Navigate to="/pattern" replace />;

  const idx = patternHabits.findIndex((x) => x.id === h.id);
  const prev = patternHabits[idx - 1];
  const next = patternHabits[idx + 1];
  const experiments = data.counterChoices.filter((c) => c.habitId === h.id);
  const focused = data.patternFocus.includes(h.id);

  const saveExperiment = () => {
    upsert('counterChoices', { id: uid(), date: toDateKey(), habitId: h.id, choice: `【${h.experiment.title}】${result.trim()}`, createdAt: nowIso() });
    setResult('');
    toast('已記錄行動實驗 🌱');
    setCelebrate(true);
  };
  const saveReflection = () => {
    const t = nowIso();
    upsert('notes', { id: uid(), chapterId: 'general', kind: 'reflection', source: `打破慣性：${h.title}`, content: reflection.trim(), tags: ['打破慣性', h.short], createdAt: t, updatedAt: t });
    setReflection('');
    toast('已存入反思筆記');
  };
  const toggleFocus = () => {
    if (!focused && data.patternFocus.length >= 3) return toast('最多選擇三項', 'info');
    update((p) => ({ ...p, patternFocus: focused ? p.patternFocus.filter((x) => x !== h.id) : [...p.patternFocus, h.id] }));
    toast(focused ? '已從想調整的習慣中移除' : '已加入想調整的習慣');
  };

  return (
    <article className="motion-safe:animate-fade-up">
      <nav aria-label="麵包屑" className="text-sm text-muted"><Link to="/pattern" className="hover:text-accent">打破慣性</Link> / Habit 0{h.no}</nav>
      <header className="mt-3 flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-soft text-accent"><HabitIcon h={h} className="h-7 w-7" /></span>
        <div>
          <p className="font-display text-sm italic text-accent">Habit 0{h.no} · {h.concept}</p>
          <h1 className="text-3xl font-bold leading-tight">{h.title}</h1>
        </div>
      </header>
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="btn-primary btn-sm" onClick={() => document.getElementById('tool')?.scrollIntoView({ behavior: 'smooth' })}><FlaskConical className="h-4 w-4" aria-hidden />互動工具：{h.toolTitle}</button>
        <button className="btn-secondary btn-sm" aria-pressed={focused} onClick={toggleFocus}>{focused ? '✓ 我正在調整這個習慣' : '我想調整這個習慣'}</button>
        <Link to={`/challenge?type=pattern&habit=${h.id}`} className="btn-ghost btn-sm">用 14 天挑戰練習</Link>
      </div>

      <Sec id="definition" no={1} title="行為定義">
        <p className="leading-relaxed">{h.definition}</p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">{h.behaviors.map((b) => <li key={b} className="rounded-xl bg-soft/60 px-3 py-2 text-sm">・{b}</li>)}</ul>
      </Sec>
      <Sec id="situations" no={2} title="常見生活情境">
        <ul className="space-y-2">{h.situations.map((s) => <li key={s} className="rounded-2xl border border-line bg-surface p-4 text-sm leading-relaxed">{s}</li>)}</ul>
      </Sec>
      <Sec id="mechanisms" no={3} title="可能的心理機制">
        <dl className="grid gap-3 sm:grid-cols-2">{h.mechanisms.map((m) => <div key={m.term} className="rounded-2xl border border-line bg-surface p-4"><dt className="font-serif font-bold text-accent">{m.term}</dt><dd className="mt-1 text-sm leading-relaxed">{m.text}</dd></div>)}</dl>
      </Sec>
      <Sec id="impacts" no={4} title="可能產生的長期影響">
        <ul className="space-y-1.5 text-sm leading-relaxed">{h.impacts.map((i) => <li key={i}>・{i}</li>)}</ul>
        <p className="mt-2 text-xs text-muted">「可能」代表這些影響因人、因程度與情境而異，並非必然發生。</p>
      </Sec>
      <Sec id="boundary" no={5} title="健康行為與過度行為的界線">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-soft/70 p-4 text-sm"><p className="font-medium text-accent">健康、有功能的時候</p><ul className="mt-1 space-y-1">{h.boundary.healthy.map((x) => <li key={x}>・{x}</li>)}</ul></div>
          <div className="rounded-2xl bg-apricot/25 p-4 text-sm"><p className="font-medium">可能過度的訊號</p><ul className="mt-1 space-y-1">{h.boundary.excessive.map((x) => <li key={x}>・{x}</li>)}</ul></div>
        </div>
        <aside className="mt-3 rounded-2xl border-l-4 border-accent bg-surface px-4 py-3 text-sm leading-relaxed"><strong>重要辨證：</strong>{h.boundary.note}</aside>
      </Sec>
      <Sec id="neuro" no={6} title="與神經可塑性的關聯">
        <p className="leading-relaxed">{h.neuro}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">{h.chapterIds.map((id) => <Link key={id} to={`/learn/${id}`} className="chip hover:bg-sage/40"><BookOpen className="mr-1 h-3 w-3" aria-hidden />第 {chapterMap[id].number} 章 {chapterMap[id].title}</Link>)}</div>
      </Sec>
      <Sec id="alternatives" no={7} title="可執行的替代行動">
        <ol className="space-y-2">{h.alternatives.map((a, i) => <li key={a} className="flex gap-3 rounded-xl bg-surface p-3 text-sm shadow-card"><span className="font-display text-lg text-sage">{i + 1}</span>{a}</li>)}</ol>
      </Sec>
      <Sec id="reflections" no={8} title="自我反思問題">
        <ul className="space-y-1.5 font-serif leading-relaxed">{h.reflections.map((r) => <li key={r}>・{r}</li>)}</ul>
        <div className="mt-3"><TextArea label="寫下你的反思（會存入筆記，標籤：打破慣性）" rows={3} value={reflection} onChange={(e) => setReflection(e.target.value)} /></div>
        <button className="btn-secondary btn-sm mt-2" onClick={saveReflection} disabled={!reflection.trim()}>儲存反思</button>
      </Sec>
      <Sec id="experiment" no={9} title={`行動實驗：${h.experiment.title}`}>
        <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
          <p className="text-sm text-muted">建議期間：{h.experiment.duration}</p>
          <ol className="mt-2 space-y-1 text-sm">{h.experiment.steps.map((s, i) => <li key={s}>{i + 1}. {s}</li>)}</ol>
          <div className="mt-3"><TextArea label="完成實驗後，記錄你的觀察與結果" rows={2} value={result} onChange={(e) => setResult(e.target.value)} /></div>
          <button className="btn-primary btn-sm mt-2" onClick={saveExperiment} disabled={!result.trim()}>記錄完成的行動實驗</button>
          {celebrate && <div className="mt-3"><PracticeAffirmation ids={h.affirmationIds} onClose={() => setCelebrate(false)} /></div>}
          {experiments.length > 0 && (
            <ul className="mt-4 space-y-2">
              {experiments.map((c) => (
                <li key={c.id} className="flex items-start gap-2 rounded-xl bg-soft/50 px-3 py-2 text-sm">
                  <span className="flex-1">{c.choice}<span className="block text-xs text-muted">{formatDate(c.date)}</span></span>
                  <DeleteButton collection="counterChoices" id={c.id} label="行動實驗紀錄" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </Sec>
      <Sec id="evidence" no={10} title="研究證據與適用限制">
        <p className="leading-relaxed">{h.evidence.text}</p>
        <p className="mt-2 rounded-xl bg-apricot/25 px-3 py-2 text-sm"><strong>適用限制：</strong>{h.evidence.limits}</p>
        <div className="mt-4"><ReferenceList refs={getReferences(h.referenceIds)} /></div>
      </Sec>

      <section id="tool" aria-labelledby="tool-h" className="mt-12 scroll-mt-24">
        <h2 id="tool-h" className="mb-1 flex items-center gap-2 text-2xl font-bold"><FlaskConical className="h-5 w-5 text-accent" aria-hidden />互動工具：{h.toolTitle}</h2>
        <p className="mb-4 text-sm text-muted">所有紀錄只存在這台裝置的瀏覽器，可隨時編輯或刪除。</p>
        <div className="rounded-3xl border border-line bg-bg p-3 sm:p-5"><PatternTool habit={h} /></div>
      </section>

      <section aria-labelledby="aff-h" className="mt-12">
        <h2 id="aff-h" className="mb-4 flex items-center gap-2 text-xl font-bold"><Sparkles className="h-5 w-5 text-accent" aria-hidden />對應的每日心智語句</h2>
        <div className="grid gap-4 md:grid-cols-2">{h.affirmationIds.map((id) => <AffirmationCard key={id} a={affirmationMap[id]} compact />)}</div>
      </section>

      {(() => {
        const rule = recommendationRules.find((r) => r.patternId === h.id);
        if (!rule) return null;
        return (
          <section aria-labelledby="h7rec-h" className="mt-12 rounded-2xl bg-soft/50 p-5">
            <h2 id="h7rec-h" className="font-serif text-lg font-bold">延伸學習：7 Habits</h2>
            <p className="mt-1 text-sm text-muted">{rule.reason}（依公開的推薦規則）</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {rule.habits.map((id) => <Link key={id} to={`/habits7/${id}`} className="btn-secondary btn-sm">習慣{h7Map[id].no}：{h7Map[id].title}</Link>)}
              {rule.practices.map((p) => <Link key={p.to} to={p.to} className="btn-ghost btn-sm">{p.label}</Link>)}
            </div>
          </section>
        );
      })()}

      <nav aria-label="習慣切換" className="mt-14 grid gap-3 border-t border-line pt-6 sm:grid-cols-2">
        {prev ? <Link to={`/pattern/${prev.id}`} className="card-hover flex items-center gap-2 rounded-2xl border border-line bg-surface p-4"><ChevronLeft className="h-5 w-5 text-accent" aria-hidden /><span><span className="block text-xs text-muted">上一個</span>{prev.title}</span></Link> : <span />}
        {next && <Link to={`/pattern/${next.id}`} className="card-hover flex items-center justify-end gap-2 rounded-2xl border border-line bg-surface p-4 text-right"><span><span className="block text-xs text-muted">下一個</span>{next.title}</span><ChevronRight className="h-5 w-5 text-accent" aria-hidden /></Link>}
      </nav>
    </article>
  );
}
