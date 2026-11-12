/**
 * 章節閱讀頁
 * 圖解版：深入解釋每一小節以「第一句話」作為重點卡（原文第一句，不另寫），其餘段落收在「看完整說明」；
 *       生活案例為兩格故事卡（情境 → 怎麼理解）；實際應用為步驟卡；第 6 章加上研究數據範圍圖（Lally 等人，2010）。
 * 結構：學習目標 → 核心概念 → 深入解釋（可收藏段落）→ 示意圖 → 生活案例 → 實際應用
 *       → 互動練習 → 反思問題 → 測驗 → 重點摘要 → 研究來源 → 對應每日心智語句 → 本章筆記
 */
import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowDown, ArrowRight, Bookmark, BookmarkCheck, CheckCircle2, ChevronLeft, ChevronRight, Clock, Target, Lightbulb, Users, Wrench, MessageCircleQuestion, ListChecks, Library, Sparkles, NotebookPen, FlaskConical, ShieldCheck } from 'lucide-react';
import { chapterMap, chapters } from '../content/chapters';
import { affirmationMap } from '../content/dailyRewire';
import { getReferences } from '../content/references';
import { patternHabits } from '../content/breakPattern';
import { useStore } from '../store/AppStore';
import { useToast } from '../components/ui/Toast';
import ChapterDiagram from '../components/diagrams/ChapterDiagram';
import Quiz from '../components/interactive/Quiz';
import InteractiveBlock, { INTERACTIVE_META } from '../components/interactive/InteractiveBlock';
import AffirmationCard from '../components/daily/AffirmationCard';
import ReferenceList from '../components/ui/ReferenceList';
import NoteEditor from '../components/notes/NoteEditor';
import NoteList from '../components/notes/NoteList';
import { nowIso, uid } from '../lib/id';
import type { ChapterId } from '../types';
import type { ReactNode } from 'react';
import Phrased from '../components/ui/Phrased';
import SectionProgress from '../components/ui/SectionProgress';
import { celebrate } from '../lib/celebrate';
import CompletionCard from '../components/ui/CompletionCard';
import { unlockSpeech } from '../lib/speech';
import { IconCardGrid, MoreDetails, RangeChart, StepCards, WatercolorSpot } from '../components/visual';

function Block({ id, icon: Icon, title, children }: { id: string; icon: typeof Target; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="mt-12">
      <h2 id={`${id}-h`} className="mb-4 flex items-center gap-2 text-xl font-bold sm:text-2xl">
        <Icon className="h-5 w-5 text-accent" aria-hidden />
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function ChapterPage() {
  const { chapterId } = useParams();
  const chapter = chapterMap[chapterId as ChapterId];
  const { data, update, upsert, remove } = useStore();
  const toast = useToast();
  const [reflection, setReflection] = useState('');

  // 記錄最後造訪時間
  useEffect(() => {
    if (!chapter) return;
    update((p) => ({ ...p, chapters: { ...p.chapters, [chapter.id]: { ...p.chapters[chapter.id], completed: p.chapters[chapter.id]?.completed ?? false, lastVisitedAt: nowIso() } } }));
  }, [chapter, update]);

  if (!chapter) return <Navigate to="/learn" replace />;
  const idx = chapters.findIndex((c) => c.id === chapter.id);
  const prev = chapters[idx - 1];
  const next = chapters[idx + 1];
  const progress = data.chapters[chapter.id];
  const notes = data.notes.filter((n) => n.chapterId === chapter.id);
  const relatedHabits = patternHabits.filter((h) => h.chapterIds.includes(chapter.id));
  // 閱讀模式：完整版／精簡版（只看學習目標、核心概念、互動練習、測驗與摘要），設定會記住
  const full = data.settings.readingMode !== 'brief';
  const setMode = (m: 'full' | 'brief') => update((p) => ({ ...p, settings: { ...p.settings, readingMode: m } }));
  const highlightOf = (source: string) => notes.find((n) => n.kind === 'highlight' && n.source === source);

  const toggleHighlight = (source: string, content: string) => {
    const existing = highlightOf(source);
    if (existing) {
      remove('notes', existing.id);
      toast('已取消收藏');
    } else {
      const t = nowIso();
      upsert('notes', { id: uid(), chapterId: chapter.id, kind: 'highlight', source, content, tags: [], createdAt: t, updatedAt: t });
      toast('已收藏到筆記');
    }
  };
  const toggleComplete = () => {
    const done = !progress?.completed;
    update((p) => ({ ...p, chapters: { ...p.chapters, [chapter.id]: { ...p.chapters[chapter.id], completed: done, completedAt: done ? nowIso() : undefined } } }));
    // 完成時由下方的完成卡說明，不再另外跳提示（避免和解鎖提示疊在一起）
    if (done) celebrate();
    else toast('已取消完成標記', 'info');
  };
  const saveReflection = () => {
    const t = nowIso();
    upsert('notes', { id: uid(), chapterId: chapter.id, kind: 'reflection', source: `反思：${chapter.reflection}`, content: reflection.trim(), tags: ['章節反思'], createdAt: t, updatedAt: t });
    setReflection('');
    toast('已儲存反思');
  };

  return (
    <article className="motion-safe:animate-fade-up">
      <nav aria-label="麵包屑" className="text-sm text-muted">
        <Link to="/learn" className="hover:text-accent">主題學習</Link> / 第 {chapter.number} 章
      </nav>
      <header className="mt-3">
        <p className="font-display text-sm italic text-accent">Chapter {chapter.number} · {chapter.enTitle}</p>
        <h1 className="mt-1 text-3xl font-bold leading-tight sm:text-4xl"><Phrased text={chapter.title} /></h1>
        <p className="mt-2 text-lg text-muted">{chapter.subtitle}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <span className="flex items-center gap-1 text-muted"><Clock className="h-4 w-4" aria-hidden />約 {chapter.minutes} 分鐘</span>
          <a href="#interactive" className="flex items-center gap-1 text-accent underline"><FlaskConical className="h-4 w-4" aria-hidden />跳到互動練習</a>
          <a href="#quiz" className="text-accent underline">跳到測驗</a>
          {progress?.completed && <span className="flex items-center gap-1 text-accent"><CheckCircle2 className="h-4 w-4" aria-hidden />已完成</span>}
        </div>
        <div role="group" aria-label="閱讀模式" aria-describedby="mode-hint" className="mt-4 inline-flex rounded-full border border-line bg-surface p-1 text-sm">
          {([['full', `完整版・約 ${chapter.minutes} 分鐘`], ['brief', '精簡版']] as const).map(([m, label]) => (
            <button key={m} type="button" aria-pressed={(m === 'full') === full} onClick={() => setMode(m)} className={`rounded-full px-3 py-1.5 ${(m === 'full') === full ? 'bg-accent text-onaccent' : 'text-ink'}`}>{label}</button>
          ))}
        </div>
        {/* 完整版較長：用淺杏色提示框提醒可以切換精簡版 */}
        <p id="mode-hint" className={`mt-2 text-xs ${full ? 'inline-block rounded-xl bg-apricot/25 px-3 py-1.5 text-ink' : 'text-muted'}`}>{full ? `完整版約 ${chapter.minutes} 分鐘。想先抓重點？精簡版只看學習目標、核心概念、互動練習、摘要與測驗。` : '精簡版：只看學習目標、核心概念、互動練習、摘要與測驗。'}</p>
      </header>
      {/* 黏在頂部的段落進度列：本章共有十多段，隨時知道讀到哪、可直接跳段 */}
      <SectionProgress pageKey={`${chapter.id}-${full ? 'full' : 'brief'}`} />

      <Block id="objectives" icon={Target} title="學習目標">
        {/* 學習目標：勾選清單式的圖示卡 */}
        <IconCardGrid columns={2} items={chapter.objectives.map((text) => ({ icon: CheckCircle2, text }))} />
      </Block>

      <Block id="concepts" icon={Lightbulb} title="核心概念">
        <div data-visual="concepts" className="grid gap-3 sm:grid-cols-2">
          {chapter.coreConcepts.map((k) => {
            const src = `概念：${k.term}`;
            const saved = !!highlightOf(src);
            return (
              <div key={k.term} className="relative rounded-2xl border border-line bg-surface p-4 pr-12">
                <dl>
                  <dt className="flex items-center gap-2 font-serif font-bold text-accent"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-soft"><Lightbulb className="h-4 w-4" aria-hidden /></span>{k.term}</dt>
                  <dd className="mt-1 text-sm leading-relaxed">{k.definition}</dd>
                </dl>
                <button className="icon-btn absolute right-2 top-2" aria-pressed={saved} aria-label={saved ? `取消收藏「${k.term}」` : `收藏「${k.term}」`} onClick={() => toggleHighlight(src, `${k.term}：${k.definition}`)}>
                  {saved ? <BookmarkCheck className="h-4 w-4 text-accent" aria-hidden /> : <Bookmark className="h-4 w-4" aria-hidden />}
                </button>
              </div>
            );
          })}
        </div>
      </Block>

      {full && (<>
      <section aria-label="深入解釋" className="mt-12">
        <h2 className="mb-2 text-xl font-bold sm:text-2xl">深入解釋</h2>
        <p className="mb-6 text-sm text-muted">點擊段落右側的書籤，即可把重點收藏到筆記。</p>
        {chapter.sections.map((s) => {
          const saved = !!highlightOf(s.heading);
          return (
            <section key={s.id} id={`sec-${s.id}`} className="group relative mb-10">
              <div className="flex items-start gap-2">
                <h3 className="flex-1 text-lg font-bold leading-snug sm:text-xl">{s.heading}</h3>
                <button className="icon-btn shrink-0" aria-pressed={saved} aria-label={saved ? `取消收藏「${s.heading}」` : `收藏「${s.heading}」為重點`} onClick={() => toggleHighlight(s.heading, s.paragraphs.join('\n'))}>
                  {saved ? <BookmarkCheck className="h-5 w-5 text-accent" aria-hidden /> : <Bookmark className="h-5 w-5 text-muted" aria-hidden />}
                </button>
              </div>
              {(() => {
                // 重點卡：第一段的第一句話；剩下的文字放進「看完整說明」，一字不刪
                const [first, ...rest] = s.paragraphs.join('\n').split(/(?<=[。！？])/);
                const restText = rest.join('').trim();
                return (
                  <div data-visual="keypoint" className="mt-3 rounded-2xl border border-line bg-surface p-4">
                    <p className="flex gap-3 font-medium leading-relaxed"><Lightbulb className="mt-1 h-5 w-5 shrink-0 text-amber" aria-hidden />{first}</p>
                    {restText && (
                      <MoreDetails>
                        <div className="prose-rw">{restText.split('\n').filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}</div>
                      </MoreDetails>
                    )}
                  </div>
                );
              })()}
              {chapter.id === 'ch6' && s.id === 'variation' && (
                <div className="mt-4"><RangeChart title="達到自動化高原期所需天數（研究估計）" min={18} max={254} median={66} axisMax={260} unit="天" source="Lally 等人（2010）" /></div>
              )}
              {s.callout && (
                <div role="note" className="rounded-2xl border-l-4 border-apricot bg-apricot/20 px-4 py-3 text-sm leading-relaxed">
                  <p className="font-medium">{s.callout.label}</p>
                  <p>{s.callout.text}</p>
                </div>
              )}
            </section>
          );
        })}
      </section>

      <section aria-label="概念示意圖" className="mt-4">
        <ChapterDiagram id={chapter.id} caption={chapter.diagramCaption} />
      </section>

      <Block id="cases" icon={Users} title="生活案例">
        {/* 兩格故事卡：情境 → 怎麼理解（原文只有兩部分，不另外編第三格） */}
        <div className="space-y-4">
          {chapter.cases.map((c) => {
            const [first, ...rest] = c.insight.split(/(?<=[。！？])/);
            return (
              <div key={c.title} className="rounded-2xl border border-line bg-surface p-4">
                <p className="font-serif font-bold">{c.title}</p>
                <div data-visual="story" className="mt-3 grid items-stretch gap-2 sm:grid-cols-[1fr_auto_1fr]">
                  <div className="rounded-xl bg-apricot/25 p-3 text-sm leading-relaxed"><p className="mb-1 flex items-center gap-1 text-xs font-bold text-rose"><Users className="h-3.5 w-3.5" aria-hidden />情境</p>{c.story}</div>
                  <ArrowRight className="mx-auto hidden h-5 w-5 self-center text-accent sm:block" aria-hidden />
                  <ArrowDown className="mx-auto h-5 w-5 text-accent sm:hidden" aria-hidden />
                  <div className="rounded-xl bg-soft p-3 text-sm leading-relaxed"><p className="mb-1 flex items-center gap-1 text-xs font-bold text-accent"><Lightbulb className="h-3.5 w-3.5" aria-hidden />怎麼理解</p>{first}
                    {rest.join('').trim() && <MoreDetails>{rest.join('').trim()}</MoreDetails>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Block>

      <Block id="apply" icon={Wrench} title="實際應用方式">
        <StepCards steps={chapter.applications.map((text) => ({ text }))} />
      </Block>

      </>)}

      <Block id="interactive" icon={FlaskConical} title={`互動練習：${INTERACTIVE_META[chapter.interactive].title}`}>
        <p className="-mt-2 mb-4 text-sm text-muted">{INTERACTIVE_META[chapter.interactive].desc}</p>
        <div className="rounded-3xl border border-line bg-bg p-3 sm:p-5">
          <InteractiveBlock kind={chapter.interactive} />
        </div>
      </Block>

      {full && (
      <Block id="reflection" icon={MessageCircleQuestion} title="反思問題">
        <div data-visual="questions" className="rounded-2xl bg-gradient-to-br from-soft to-apricot/20 p-5">
          <p className="flex gap-3 font-serif text-lg leading-relaxed"><MessageCircleQuestion className="mt-1 h-6 w-6 shrink-0 text-accent" aria-hidden />{chapter.reflection}</p>
          <label htmlFor="ch-reflection" className="sr-only">寫下你的反思</label>
          <textarea id="ch-reflection" className="field mt-4 min-h-[6rem]" value={reflection} onChange={(e) => setReflection(e.target.value)} placeholder="沒有標準答案，寫下此刻真實的想法就好。" />
          <button className="btn-secondary mt-3" onClick={saveReflection} disabled={!reflection.trim()}>儲存反思</button>
        </div>
      </Block>

      )}

      <Block id="quiz" icon={ListChecks} title={`互動測驗（${chapter.quiz.length} 題）`}>
        {/* 測驗先收合，想做時再打開；已作答過的章節預設展開以便查看結果 */}
        <MoreDetails label={`開始測驗（${chapter.quiz.length} 題）`} defaultOpen={!!data.quizzes[chapter.id]}>
          <Quiz chapterId={chapter.id} questions={chapter.quiz} />
        </MoreDetails>
      </Block>

      <Block id="summary" icon={ListChecks} title="本章重點摘要">
        {/* 重點摘要：編號步驟卡，一眼看完本章重點 */}
        <StepCards steps={chapter.summary.map((text) => ({ text }))} />
        <button onClick={toggleComplete} className={`mt-5 ${progress?.completed ? 'btn-secondary' : 'btn-primary'}`} aria-pressed={!!progress?.completed}>
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          {progress?.completed ? '已完成本章（點擊取消）' : '標記本章為已完成'}
        </button>
        {/* 完成卡：帶走一句話＋一個下一步（下一章，最後一章則回到學習總覽） */}
        {progress?.completed && (
          <CompletionCard title={`第 ${chapter.number} 章完成了`} takeaway={chapter.summary[0]}
            next={next ? { to: `/learn/${next.id}`, label: `下一章：第 ${next.number} 章` } : { to: '/learning', label: '回到「學習」看看其他系統' }}
            note={{ chapterId: chapter.id, source: `第 ${chapter.number} 章重點`, tags: ['完成卡', '主題學習'] }} />
        )}
      </Block>

      {!full && (
        <p className="mt-10 rounded-2xl bg-soft/60 p-4 text-sm">目前是精簡版。想看深入解釋、生活案例、反思問題、本章筆記與研究來源，<button type="button" className="text-accent underline" onClick={() => setMode('full')}>切換到完整版</button>。</p>
      )}

      {full && (<>
      <Block id="daily" icon={Sparkles} title="對應的每日心智語句">
        <p className="-mt-2 mb-4 text-sm text-muted">把本章的知識帶進每天的自我對話。</p>
        {/* 延伸內容收合：先顯示句子本身（短），完整卡片想看再展開 */}
        <ul className="flex flex-wrap gap-2">{chapter.affirmationIds.map((id) => <li key={id} className="chip text-sm">「{affirmationMap[id].text}」</li>)}</ul>
        <MoreDetails label={`看 ${chapter.affirmationIds.length} 句心智語句的說明與練習`}>
          <div className="grid gap-4 md:grid-cols-2">
            {chapter.affirmationIds.map((id) => <AffirmationCard key={id} a={affirmationMap[id]} compact />)}
          </div>
        </MoreDetails>
        <Link onClick={unlockSpeech} to={`/daily/read?back=${encodeURIComponent(`/learn/${chapter.id}`)}`} className="btn-secondary mt-4">
          <Sparkles className="h-4 w-4" aria-hidden /> 進入每日朗讀練習
        </Link>
      </Block>

      {relatedHabits.length > 0 && (
        <Block id="pattern" icon={ShieldCheck} title="打破慣性：相關的日常習慣">
          <p className="-mt-2 mb-4 text-sm text-muted">本章的概念，可以幫助你理解這些在不知不覺中消耗能量的行為模式，並找到可以實際練習的工具。</p>
          <ul className="grid gap-3 md:grid-cols-2">
            {relatedHabits.map((h) => (
              <li key={h.id}>
                <Link to={`/pattern/${h.id}`} className="card-hover flex h-full gap-3 rounded-2xl border border-line bg-surface p-4">
                  <span className="w-20 shrink-0"><WatercolorSpot kind={h.id} /></span>
                  <span className="min-w-0">
                  <span className="chip">Habit 0{h.no} · {h.concept}</span>
                  <span className="mt-2 block font-serif font-bold">{h.title}</span>
                  <span className="mt-1 block text-sm text-muted">互動工具：{h.toolTitle}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Block>
      )}

      <Block id="notes" icon={NotebookPen} title="本章筆記">
        <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
          <NoteEditor secondary label="新增個人反思或筆記" onSubmit={(content, tags) => {
            const t = nowIso();
            upsert('notes', { id: uid(), chapterId: chapter.id, kind: 'reflection', content, tags, createdAt: t, updatedAt: t });
            toast('已儲存筆記');
          }} />
        </div>
        <div className="mt-4">
          <NoteList notes={notes} emptyText="本章還沒有筆記。收藏段落或寫下反思後會出現在這裡。" />
        </div>
      </Block>

      <Block id="references" icon={Library} title="研究來源">
        <MoreDetails label={`看 ${chapter.referenceIds.length} 筆研究來源`}>
          <ReferenceList refs={getReferences(chapter.referenceIds)} />
        </MoreDetails>
      </Block>
      </>)}

      <nav aria-label="章節切換" className="mt-14 grid gap-3 border-t border-line pt-6 sm:grid-cols-2">
        {prev ? (
          <Link to={`/learn/${prev.id}`} className="card-hover flex items-center gap-2 rounded-2xl border border-line bg-surface p-4">
            <ChevronLeft className="h-5 w-5 text-accent" aria-hidden />
            <span><span className="block text-xs text-muted">上一章</span>{prev.title}</span>
          </Link>
        ) : <span />}
        {next && (
          <Link to={`/learn/${next.id}`} className="card-hover flex items-center justify-end gap-2 rounded-2xl border border-line bg-surface p-4 text-right">
            <span><span className="block text-xs text-muted">下一章</span>{next.title}</span>
            <ChevronRight className="h-5 w-5 text-accent" aria-hidden />
          </Link>
        )}
      </nav>
    </article>
  );
}
