/**
 * 高效能生活單一習慣頁：十個學習面向＋互動工具＋章節完成體驗（測驗、應用情境、立即行動、反思、心智語句、延伸練習）
 */
import { useState, type ReactNode } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, FlaskConical, Sparkles, CheckCircle2 } from 'lucide-react';
import { h7Habits, H7_TAG, h7Map, H7_STAGES, selfCheckScale } from '../content/habits7';
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
import { scrollBehavior } from '../lib/motion';
import Phrased from '../components/ui/Phrased';
import SectionProgress from '../components/ui/SectionProgress';
import CollapsibleSection from '../components/ui/CollapsibleSection';
import { celebrate } from '../lib/celebrate';
import CompletionCard from '../components/ui/CompletionCard';
import { unlockSpeech } from '../lib/speech';
import { CompareColumns, EvidenceBadge, IconCardGrid, KeyPointCard, MoreDetails, StepCards } from '../components/visual';
import { situationIcon } from '../components/habits7/visualIcons';
import { MessageCircleQuestion } from 'lucide-react';

/** 段落：預設展開有動手練習的段落，其他段落可點標題展開（見 CollapsibleSection） */
const OPEN_BY_DEFAULT = new Set(['definition', 'strategies', 'selfcheck']);
const Sec = (props: { id: string; no: number; title: string; children: ReactNode }) => <CollapsibleSection {...props} defaultOpen={VISUAL || OPEN_BY_DEFAULT.has(props.id)} />;
/** 圖解版：每段先以圖解呈現（重點卡、情境圖示卡、誤區對照、延伸推論標籤、步驟卡），完整文字收在「看完整說明」；段落預設展開 */
const VISUAL = true;

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
    // 完成時由完成卡說明，不再另外跳提示
    if (s === 'done') celebrate();
    else toast(s === 'learning' ? '已標記為學習中' : '已重設為未開始', s === 'none' ? 'info' : 'success');
  };
  const scrollToTool = () => document.getElementById('tool')?.scrollIntoView({ behavior: scrollBehavior() });

  return (
    // key＝習慣 id：換到另一個習慣時重新建立頁面，段落展開狀態不會沿用上一個習慣
    <article key={h.id} className="motion-safe:animate-fade-up">
      <nav aria-label="麵包屑" className="text-sm text-muted"><Link to="/habits7" className="hover:text-accent">高效能生活</Link> / {stage.title} / 習慣{'一二三四五六七'[h.no - 1]}</nav>
      <header className="mt-3 flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-soft text-accent"><H7Icon h={h} className="h-7 w-7" /></span>
        <div>
          <p className="font-display text-sm italic text-accent">Habit {h.no} · {h.en}</p>
          <h1 className="text-3xl font-bold"><Phrased text={h.title} /></h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">{stage.title}（{stage.en}）<StatusChip status={status} /></p>
        </div>
      </header>
      <div className="mt-4 flex flex-wrap gap-2">
        {status === '未開始' && <button className="btn-primary btn-sm" onClick={() => setStatus('learning')}>開始學習</button>}
        <button className="btn-secondary btn-sm" onClick={scrollToTool}><FlaskConical className="h-4 w-4" aria-hidden />互動工具：{h.toolTitle}</button>
      </div>
      <SectionProgress pageKey={h.id} />

      <Sec id="definition" no={1} title="習慣定義與核心觀念">
        <KeyPointCard text={h.core} spot={<span className="flex aspect-square w-full items-center justify-center rounded-3xl bg-gradient-to-br from-soft to-apricot/40 text-accent"><H7Icon h={h} className="h-10 w-10" /></span>} moreLabel="看完整定義">
          {h.definition.map((p) => <p key={p}>{p}</p>)}
        </KeyPointCard>
        {h.importantNote && <div role="note" className="mt-3 rounded-2xl border-l-4 border-apricot bg-apricot/20 px-4 py-3 text-sm leading-relaxed"><strong>重要觀點：</strong>{h.importantNote}</div>}
      </Sec>
      <Sec id="situations" no={2} title="生活與職場情境">
        <IconCardGrid items={h.situations.map((x) => ({ icon: situationIcon(x.label), title: x.label, text: x.text }))} />
      </Sec>
      <Sec id="myths" no={3} title="常見認知誤區">
        <CompareColumns leftTitle="常見誤解" rightTitle="更貼近的理解" rows={h.misconceptions.map((m) => ({ left: m.myth, right: m.better }))} />
      </Sec>
      <Sec id="neuro" no={4} title="與神經可塑性的可能關聯">
        <EvidenceBadge kind="inference" summary={h.neuro.text.split(/(?<=[。！？])/)[0]} meta={[['解讀限制', h.neuro.caution]]} moreLabel="看完整說明">
          <p className="leading-relaxed">{h.neuro.text}</p>
        </EvidenceBadge>
      </Sec>
      <Sec id="concepts" no={5} title="心理學或管理學延伸概念">
        {/* 延伸概念：先看概念名稱與來源類型；說明收在「看完整說明」 */}
        <ul data-visual="concepts" className="grid gap-2 sm:grid-cols-2">{h.concepts.map((c) => <li key={c.term} className="flex items-center gap-2 rounded-2xl border border-line bg-surface p-3"><SourceBadge type={c.source} /><span className="min-w-0 font-serif text-sm font-bold">{c.term.split(/ (?=[A-Z])/)[0]}</span></li>)}</ul>
        <MoreDetails label={`看 ${h.concepts.length} 個概念的完整說明`}>
        <dl className="grid gap-3 sm:grid-cols-2">{h.concepts.map((c) => <div key={c.term} className="rounded-2xl border border-line bg-surface p-4"><dt className="font-serif font-bold"><SourceBadge type={c.source} /><span className="mt-2 block">{c.term}</span></dt><dd className="mt-1 text-sm leading-relaxed">{c.text}</dd></div>)}</dl>
        </MoreDetails>
      </Sec>
      <Sec id="strategies" no={6} title="實際行動策略">
        <StepCards steps={h.strategies.map((text) => ({ text }))} />
      </Sec>
      <section id="tool" aria-labelledby="tool-h" className="mt-10 scroll-mt-24">
        <h2 id="tool-h" className="mb-1 flex items-baseline gap-2 text-xl font-bold"><span className="font-display text-base italic text-sageink">07</span>互動工具：{h.toolTitle}</h2>
        <p className="mb-3 text-sm text-muted"><SourceBadge type="tool" /> {h.toolDesc}</p>
        <div className="rounded-3xl border border-line bg-bg p-3 sm:p-5"><H7Tool id={h.id} /></div>
      </section>
      <Sec id="reflect" no={8} title="反思問題">
        <ul data-visual="questions" className="grid gap-2 sm:grid-cols-3">{h.reflections.map((r) => <li key={r} className="flex gap-2 rounded-2xl bg-gradient-to-br from-soft to-apricot/20 p-3 font-serif text-sm leading-relaxed"><MessageCircleQuestion className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />{r}</li>)}</ul>
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
          <button className="btn-secondary btn-sm" type="submit" disabled={Object.keys(answers).length < 3}>儲存自我評估</button>
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
        <Link onClick={unlockSpeech} to={`/daily/read?back=${encodeURIComponent(`/habits7/${h.id}`)}`} className="btn-secondary mt-4">進入每日朗讀練習</Link>
      </Sec>

      <section aria-labelledby="finish-h" className="mt-14 rounded-3xl border border-accent/40 bg-surface p-5 sm:p-7">
        <h2 id="finish-h" className="flex items-center gap-2 text-2xl font-bold"><CheckCircle2 className="h-6 w-6 text-accent" aria-hidden />完成本章</h2>
        <h3 className="mt-5 font-serif text-lg font-bold">1. 知識測驗</h3>
        <MoreDetails label={`開始測驗（${h.quiz.length} 題）`} defaultOpen={!!data.h7Quizzes[h.id]}>
          <Quiz chapterId={`h7-${h.id}`} questions={h.quiz} saved={data.h7Quizzes[h.id]} onSave={(r) => update((p) => ({ ...p, h7Quizzes: { ...p.h7Quizzes, [h.id]: r } }))} />
        </MoreDetails>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl bg-soft/60 p-4 text-sm"><p className="font-medium text-accent">2. 真實生活應用情境</p><p className="mt-1">{h.apply}</p></div>
          <div className="rounded-2xl bg-soft/60 p-4 text-sm"><p className="font-medium text-accent">3. 現在就能完成的行動</p><p className="mt-1">{h.quickAction}</p></div>
        </div>
        <div className="mt-4">
          <p className="font-medium text-accent">4. 反思問題</p>
          <p className="font-serif">{h.finalReflection}</p>
          <div className="mt-2"><TextArea label="寫下你的反思（存入筆記，標籤：高效能生活）" rows={2} value={reflection} onChange={(e) => setReflection(e.target.value)} /></div>
          <button className="btn-secondary btn-sm mt-2" disabled={!reflection.trim()} onClick={() => { const t = nowIso(); upsert('notes', { id: uid(), chapterId: 'general', kind: 'reflection', source: `高效能生活：${h.title}`, content: reflection.trim(), tags: [H7_TAG, h.title], createdAt: t, updatedAt: t }); setReflection(''); toast('已儲存反思'); }}>儲存反思</button>
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
        {status === '已完成' && (
          <CompletionCard title={`習慣${'一二三四五六七'[h.no - 1]}「${h.title}」完成了`} takeaway={h.quickAction} takeawayLabel="帶走一個小行動"
            next={next ? { to: `/habits7/${next.id}`, label: `下一個習慣：${next.title}` } : { to: '/habits7/plan', label: '看看 21 天探索計畫' }}
            note={{ chapterId: 'general', source: `高效能生活：${h.title}`, tags: ['完成卡', H7_TAG, h.title] }} />
        )}
      </section>

      <section aria-labelledby="ref-h" className="mt-10">
        <h2 id="ref-h" className="mb-3 text-xl font-bold">研究與參考來源</h2>
        <MoreDetails label={`看 ${h.referenceIds.length} 筆研究來源`}>
          <ReferenceList refs={getReferences(h.referenceIds)} />
        </MoreDetails>
      </section>

      <nav aria-label="習慣切換" className="mt-14 grid gap-3 border-t border-line pt-6 sm:grid-cols-2">
        {prev ? <Link to={`/habits7/${prev.id}`} className="card-hover flex items-center gap-2 rounded-2xl border border-line bg-surface p-4"><ChevronLeft className="h-5 w-5 text-accent" aria-hidden /><span><span className="block text-xs text-muted">上一個習慣</span>{prev.title}</span></Link> : <span />}
        {next && <Link to={`/habits7/${next.id}`} className="card-hover flex items-center justify-end gap-2 rounded-2xl border border-line bg-surface p-4 text-right"><span><span className="block text-xs text-muted">下一個習慣</span>{next.title}</span><ChevronRight className="h-5 w-5 text-accent" aria-hidden /></Link>}
      </nav>
    </article>
  );
}
