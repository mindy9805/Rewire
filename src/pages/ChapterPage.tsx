/**
 * 章節閱讀頁
 * 結構：學習目標 → 核心概念 → 深入解釋（可收藏段落）→ 示意圖 → 生活案例 → 實際應用
 *       → 互動練習 → 反思問題 → 測驗 → 重點摘要 → 研究來源 → 對應每日心智語句 → 本章筆記
 */
import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Bookmark, BookmarkCheck, CheckCircle2, ChevronLeft, ChevronRight, Clock, Target, Lightbulb, Users, Wrench, MessageCircleQuestion, ListChecks, Library, Sparkles, NotebookPen, FlaskConical, ShieldCheck } from 'lucide-react';
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
    toast(done ? `已完成第 ${chapter.number} 章 🎉` : '已取消完成標記', done ? 'success' : 'info');
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
        <Link to="/learn" className="hover:text-accent">深度導讀</Link> / 第 {chapter.number} 章
      </nav>
      <header className="mt-3">
        <p className="font-display text-sm italic text-accent">Chapter {chapter.number} · {chapter.enTitle}</p>
        <h1 className="mt-1 text-3xl font-bold leading-tight sm:text-4xl">{chapter.title}</h1>
        <p className="mt-2 text-lg text-muted">{chapter.subtitle}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <span className="flex items-center gap-1 text-muted"><Clock className="h-4 w-4" aria-hidden />約 {chapter.minutes} 分鐘</span>
          <a href="#interactive" className="flex items-center gap-1 text-accent underline"><FlaskConical className="h-4 w-4" aria-hidden />跳到互動練習</a>
          <a href="#quiz" className="text-accent underline">跳到測驗</a>
          {progress?.completed && <span className="flex items-center gap-1 text-accent"><CheckCircle2 className="h-4 w-4" aria-hidden />已完成</span>}
        </div>
      </header>

      <Block id="objectives" icon={Target} title="學習目標">
        <ul className="grid gap-2 sm:grid-cols-2">
          {chapter.objectives.map((o) => <li key={o} className="rounded-xl bg-soft/60 px-4 py-3 text-sm leading-relaxed">✓ {o}</li>)}
        </ul>
      </Block>

      <Block id="concepts" icon={Lightbulb} title="核心概念">
        <dl className="grid gap-3 sm:grid-cols-2">
          {chapter.coreConcepts.map((k) => {
            const src = `概念：${k.term}`;
            const saved = !!highlightOf(src);
            return (
              <div key={k.term} className="relative rounded-2xl border border-line bg-surface p-4 pr-12">
                <dt className="font-serif font-bold text-accent">{k.term}</dt>
                <dd className="mt-1 text-sm leading-relaxed">{k.definition}</dd>
                <button className="icon-btn absolute right-2 top-2" aria-pressed={saved} aria-label={saved ? `取消收藏「${k.term}」` : `收藏「${k.term}」`} onClick={() => toggleHighlight(src, `${k.term}：${k.definition}`)}>
                  {saved ? <BookmarkCheck className="h-4 w-4 text-accent" aria-hidden /> : <Bookmark className="h-4 w-4" aria-hidden />}
                </button>
              </div>
            );
          })}
        </dl>
      </Block>

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
              <div className="prose-rw mt-3">
                {s.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
              </div>
              {s.callout && (
                <aside className="rounded-2xl border-l-4 border-apricot bg-apricot/20 px-4 py-3 text-sm leading-relaxed">
                  <p className="font-medium">{s.callout.label}</p>
                  <p>{s.callout.text}</p>
                </aside>
              )}
            </section>
          );
        })}
      </section>

      <section aria-label="概念示意圖" className="mt-4">
        <ChapterDiagram id={chapter.id} caption={chapter.diagramCaption} />
      </section>

      <Block id="cases" icon={Users} title="生活案例">
        <div className="grid gap-4 md:grid-cols-2">
          {chapter.cases.map((c) => (
            <div key={c.title} className="rounded-2xl border border-line bg-surface p-5">
              <p className="font-serif font-bold">{c.title}</p>
              <p className="mt-2 text-sm leading-relaxed">{c.story}</p>
              <p className="mt-3 rounded-xl bg-soft/70 p-3 text-sm leading-relaxed"><strong className="text-accent">怎麼理解：</strong>{c.insight}</p>
            </div>
          ))}
        </div>
      </Block>

      <Block id="apply" icon={Wrench} title="實際應用方式">
        <ol className="space-y-2">
          {chapter.applications.map((a, i) => (
            <li key={a} className="flex gap-3 rounded-xl bg-surface p-3 text-sm leading-relaxed shadow-card">
              <span className="font-display text-lg text-sage">{i + 1}</span>{a}
            </li>
          ))}
        </ol>
      </Block>

      <Block id="interactive" icon={FlaskConical} title={`互動練習：${INTERACTIVE_META[chapter.interactive].title}`}>
        <p className="-mt-2 mb-4 text-sm text-muted">{INTERACTIVE_META[chapter.interactive].desc}</p>
        <div className="rounded-3xl border border-line bg-bg p-3 sm:p-5">
          <InteractiveBlock kind={chapter.interactive} />
        </div>
      </Block>

      <Block id="reflection" icon={MessageCircleQuestion} title="反思問題">
        <div className="rounded-2xl bg-gradient-to-br from-soft to-apricot/20 p-5">
          <p className="font-serif text-lg leading-relaxed">{chapter.reflection}</p>
          <label htmlFor="ch-reflection" className="sr-only">寫下你的反思</label>
          <textarea id="ch-reflection" className="field mt-4 min-h-[6rem]" value={reflection} onChange={(e) => setReflection(e.target.value)} placeholder="沒有標準答案，寫下此刻真實的想法就好。" />
          <button className="btn-primary mt-3" onClick={saveReflection} disabled={!reflection.trim()}>儲存反思</button>
        </div>
      </Block>

      <Block id="quiz" icon={ListChecks} title={`互動測驗（${chapter.quiz.length} 題）`}>
        <Quiz chapterId={chapter.id} questions={chapter.quiz} />
      </Block>

      <Block id="summary" icon={ListChecks} title="本章重點摘要">
        <ul className="space-y-2 rounded-2xl border border-line bg-surface p-5">
          {chapter.summary.map((s) => <li key={s} className="flex gap-2 text-sm leading-relaxed"><span className="text-accent">●</span>{s}</li>)}
        </ul>
        <button onClick={toggleComplete} className={`mt-5 ${progress?.completed ? 'btn-secondary' : 'btn-primary'}`} aria-pressed={!!progress?.completed}>
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          {progress?.completed ? '已完成本章（點擊取消）' : '標記本章為已完成'}
        </button>
      </Block>

      <Block id="daily" icon={Sparkles} title="對應的每日心智語句">
        <p className="-mt-2 mb-4 text-sm text-muted">把本章的知識帶進每天的自我對話。</p>
        <div className="grid gap-4 md:grid-cols-2">
          {chapter.affirmationIds.map((id) => <AffirmationCard key={id} a={affirmationMap[id]} compact />)}
        </div>
        <Link to={`/daily/read?back=${encodeURIComponent(`/learn/${chapter.id}`)}`} className="btn-secondary mt-4">
          <Sparkles className="h-4 w-4" aria-hidden /> 進入每日朗讀練習
        </Link>
      </Block>

      {relatedHabits.length > 0 && (
        <Block id="pattern" icon={ShieldCheck} title="打破慣性：相關的日常習慣">
          <p className="-mt-2 mb-4 text-sm text-muted">本章的概念，可以幫助你理解這些在不知不覺中消耗能量的行為模式，並找到可以實際練習的工具。</p>
          <ul className="grid gap-3 md:grid-cols-2">
            {relatedHabits.map((h) => (
              <li key={h.id}>
                <Link to={`/pattern/${h.id}`} className="card-hover block h-full rounded-2xl border border-line bg-surface p-4">
                  <span className="chip">Habit 0{h.no} · {h.concept}</span>
                  <span className="mt-2 block font-serif font-bold">{h.title}</span>
                  <span className="mt-1 block text-sm text-muted">互動工具：{h.toolTitle}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Block>
      )}

      <Block id="notes" icon={NotebookPen} title="本章筆記">
        <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
          <NoteEditor label="新增個人反思或筆記" onSubmit={(content, tags) => {
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
        <ReferenceList refs={getReferences(chapter.referenceIds)} />
      </Block>

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
