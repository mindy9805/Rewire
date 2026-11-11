/**
 * 14 天神經可塑性練習
 * - 進度條、天數選擇（可補做、可重新練習、不強迫連續）
 * - 每日：主題、知識、行動、反思、完成勾選、個人紀錄
 * - 今日心智語句：閱讀 → 心理意涵 → 反思 → 微小行動 → 感受（與 Daily Rewire 紀錄分開儲存）
 * - 挑戰總結與 JSON／Markdown 匯出
 */
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Circle, Download, Sparkles, BookOpen, FileJson } from 'lucide-react';
import { challengeDays, gentleFeedback } from '../content/challenge';
import { affirmationMap } from '../content/dailyRewire';
import { chapterMap } from '../content/chapters';
import { useStore } from '../store/AppStore';
import { useToast } from '../components/ui/Toast';
import { ProgressBar, SectionTitle, TextArea, TextField } from '../components/ui/basics';
import { nowIso } from '../lib/id';
import { downloadText } from '../lib/clipboard';
import { challengeToMarkdown, stamp } from '../lib/exporters';
import type { ChallengeDayRecord } from '../types';
import PatternChallenge from '../components/pattern/PatternChallenge';

const emptyRecord: ChallengeDayRecord = { completed: false, note: '', affirmationReflection: '', microActionDone: false, feeling: '' };

function NeuroChallenge() {
  const { data, update } = useStore();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const firstUndone = challengeDays.find((d) => !data.challenge[d.day]?.completed)?.day ?? 1;
  const day = Math.min(14, Math.max(1, Number(params.get('day')) || firstUndone));
  const info = challengeDays[day - 1];
  const aff = affirmationMap[info.affirmationId];
  const saved = data.challenge[String(day)] ?? emptyRecord;
  const [form, setForm] = useState<ChallengeDayRecord>(saved);
  const [feedback, setFeedback] = useState('');
  const done = Object.values(data.challenge).filter((c) => c.completed).length;

  // 切換天數時載入該天的紀錄
  useEffect(() => {
    setForm(data.challenge[String(day)] ?? emptyRecord);
    setFeedback('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day]);

  const persist = (rec: ChallengeDayRecord) =>
    update((p) => ({ ...p, challenge: { ...p.challenge, [String(day)]: { ...rec, updatedAt: nowIso() } } }));

  const saveText = () => {
    persist({ ...form, completed: data.challenge[String(day)]?.completed ?? form.completed, completedAt: data.challenge[String(day)]?.completedAt });
    toast(`已儲存 Day ${day} 的紀錄`);
  };
  const toggleDone = () => {
    const completed = !saved.completed;
    const rec = { ...form, completed, completedAt: completed ? nowIso() : undefined };
    setForm(rec);
    persist(rec);
    if (completed) {
      const msg = gentleFeedback[(day - 1) % gentleFeedback.length];
      setFeedback(msg);
      toast(`Day ${day} 完成 · ${msg}`);
    } else {
      setFeedback('');
      toast('已取消完成勾選，隨時可以重新練習。', 'info');
    }
  };
  const goDay = (d: number) => setParams({ day: String(d) });

  return (
    <div>
      <ProgressBar label="挑戰完成進度" value={done} max={14} />

      <nav aria-label="選擇天數" className="mt-5">
        <ol className="grid grid-cols-7 gap-2">
          {challengeDays.map((d) => {
            const c = data.challenge[String(d.day)]?.completed;
            return (
              <li key={d.day}>
                <button onClick={() => goDay(d.day)} aria-current={d.day === day ? 'step' : undefined} aria-label={`Day ${d.day}：${d.theme}${c ? '（已完成）' : ''}`}
                  className={`flex aspect-square w-full flex-col items-center justify-center rounded-xl border text-sm transition ${d.day === day ? 'border-accent bg-accent text-onaccent' : c ? 'border-sage bg-soft text-accent' : 'border-line bg-surface hover:border-accent/50'}`}>
                  <span className="font-display">{d.day}</span>
                  {c && <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <article className="mt-8 rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-8" aria-labelledby="day-title">
        <p className="font-display text-sm italic text-accent">Day {day} / 14</p>
        <h2 id="day-title" className="mt-1 font-serif text-2xl font-bold">{info.theme}</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-soft/60 p-4 text-sm leading-relaxed"><p className="mb-1 font-medium text-accent">簡短知識</p>{info.knowledge}</div>
          <div className="rounded-2xl bg-soft/60 p-4 text-sm leading-relaxed"><p className="mb-1 font-medium text-accent">具體行動</p>{info.action}</div>
          <div className="rounded-2xl bg-soft/60 p-4 text-sm leading-relaxed"><p className="mb-1 font-medium text-accent">反思問題</p>{info.reflection}</div>
        </div>
        {(day === 1 || day === 14) && (
          <p className="mt-3 rounded-xl bg-apricot/25 px-3 py-2 text-sm">
            {day === 1 ? '不確定從哪個習慣開始？' : '想規劃下一階段？'}先做一次
            <Link to="/pattern/assessment" className="mx-1 text-accent underline">七大習慣自我覺察評估</Link>
            ，找出最想調整的一項。
          </p>
        )}
        <Link to={`/learn/${info.chapterId}`} className="mt-3 inline-flex items-center gap-1 text-sm text-accent underline">
          <BookOpen className="h-4 w-4" aria-hidden />延伸閱讀：第 {chapterMap[info.chapterId].number} 章 {chapterMap[info.chapterId].title}
        </Link>

        <div className="mt-6">
          <TextArea label="我的紀錄與反思" rows={4} value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} placeholder="寫下今天的觀察、行動或任何想法。" />
        </div>

        {/* 今日心智語句（與 Daily Rewire 完成狀態分開儲存） */}
        <section aria-labelledby="day-aff" className="mt-8 rounded-2xl bg-gradient-to-br from-soft to-apricot/25 p-5">
          <p className="flex items-center gap-1 text-xs font-medium text-accent"><Sparkles className="h-4 w-4" aria-hidden />今日心智語句</p>
          <h3 id="day-aff" className="mt-2 font-serif text-2xl font-bold">「{aff.text}」</h3>
          <ol className="mt-4 space-y-3 text-sm leading-relaxed">
            <li><strong>1. 閱讀這句話：</strong>慢慢讀一次，可以小聲唸出來。</li>
            <li><strong>2. 理解心理意涵：</strong>{aff.meaning}</li>
            <li>
              <strong>3. 回答反思問題：</strong>{aff.reflection}
              <div className="mt-2"><TextArea label="我的回答" rows={2} value={form.affirmationReflection} onChange={(e) => setForm((f) => ({ ...f, affirmationReflection: e.target.value }))} /></div>
            </li>
            <li>
              <strong>4. 完成一個微小行動：</strong>{aff.action}
              <label className="mt-2 flex items-center gap-2"><input type="checkbox" className="h-4 w-4 accent-[rgb(var(--accent))]" checked={form.microActionDone} onChange={(e) => setForm((f) => ({ ...f, microActionDone: e.target.checked }))} />我完成了這個微小行動</label>
            </li>
            <li>
              <strong>5. 紀錄自己的感受：</strong>
              <div className="mt-2"><TextField label="此刻的感受" value={form.feeling} onChange={(e) => setForm((f) => ({ ...f, feeling: e.target.value }))} placeholder="例如：有點懷疑，但願意試試" /></div>
            </li>
          </ol>
          {aff.note && <p className="mt-3 text-xs">備註：{aff.note}</p>}
          <p className="mt-3 text-xs text-muted">暫時沒有認同感也沒關係，這只是一個練習提示。</p>
          <Link to={`/daily/read?back=${encodeURIComponent(`/challenge?day=${day}`)}`} className="btn-secondary btn-sm mt-3">進入七句朗讀模式（另存於每日心智練習）</Link>
        </section>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button className="btn-secondary" onClick={saveText}>儲存紀錄</button>
          <button className={saved.completed ? 'btn-secondary' : 'btn-primary'} onClick={toggleDone} aria-pressed={saved.completed}>
            {saved.completed ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : <Circle className="h-4 w-4" aria-hidden />}
            {saved.completed ? '已完成（點擊取消）' : '儲存並標記完成'}
          </button>
        </div>
        {feedback && <p className="mt-4 rounded-xl bg-soft px-4 py-3 text-sm text-accent" role="status">🌱 {feedback}</p>}
        <div className="mt-6 flex justify-between">
          <button className="btn-ghost btn-sm" disabled={day === 1} onClick={() => goDay(day - 1)}>← Day {day - 1 || ''}</button>
          <button className="btn-ghost btn-sm" disabled={day === 14} onClick={() => goDay(day + 1)}>Day {day < 14 ? day + 1 : ''} →</button>
        </div>
      </article>

      {/* 挑戰總結 */}
      <section aria-labelledby="summary-h" className="mt-10">
        <h2 id="summary-h" className="text-xl font-bold">挑戰總結</h2>
        {done === 0 && !Object.values(data.challenge).some((c) => c.note) ? (
          <p className="mt-2 text-sm text-muted">完成任何一天後，這裡會整理你的進度與紀錄。</p>
        ) : (
          <div className="mt-3 space-y-3">
            <p className="text-sm">你已完成 <strong>{done}</strong> 天，{done === 14 ? '恭喜你走完 14 天！花點時間感謝這段時間的自己。' : '每一天的練習都算數，按照自己的步調就好。'}</p>
            <ul className="space-y-2">
              {challengeDays.filter((d) => data.challenge[String(d.day)]?.note || data.challenge[String(d.day)]?.completed).map((d) => (
                <li key={d.day} className="rounded-xl border border-line bg-surface p-3 text-sm">
                  <button className="font-medium text-accent underline" onClick={() => goDay(d.day)}>Day {d.day}：{d.theme}</button>
                  {data.challenge[String(d.day)]?.completed && <span className="ml-2 text-xs">✓</span>}
                  {data.challenge[String(d.day)]?.note && <p className="mt-1 line-clamp-2 text-muted">{data.challenge[String(d.day)].note}</p>}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn-secondary btn-sm" onClick={() => { downloadText(`rewire-14days-${stamp()}.md`, challengeToMarkdown(data), 'text/markdown'); toast('已匯出 Markdown'); }}>
            <Download className="h-4 w-4" aria-hidden />匯出 Markdown
          </button>
          <button className="btn-secondary btn-sm" onClick={() => { downloadText(`rewire-14days-${stamp()}.json`, JSON.stringify({ app: 'rewire', type: 'challenge', exportedAt: nowIso(), challenge: data.challenge }, null, 2), 'application/json'); toast('已匯出 JSON'); }}>
            <FileJson className="h-4 w-4" aria-hidden />匯出 JSON
          </button>
        </div>
      </section>
    </div>
  );
}

/**
 * 14 天挑戰頁：兩種挑戰類型（完成狀態分開儲存）
 * - 14 天神經可塑性練習（原有內容）
 * - 14 天打破慣性挑戰（Break the Pattern，依所選習慣產生任務）
 */
export default function Challenge() {
  const [params, setParams] = useSearchParams();
  const type = params.get('type') === 'pattern' ? 'pattern' : 'neuro';
  return (
    <div className="motion-safe:animate-fade-up">
      <SectionTitle eyebrow="14-Day Challenge" title="14 天練習" desc="每天一個小主題、一個具體行動。不需要連續，也可以隨時補做、重新練習或暫停——重要的是持續回來。" />
      <div role="tablist" aria-label="挑戰類型" className="mb-6 inline-flex flex-wrap rounded-full border border-line bg-surface p-1">
        {([['neuro', '神經可塑性練習'], ['pattern', '打破慣性挑戰']] as const).map(([t, label]) => (
          <button key={t} role="tab" aria-selected={type === t} className={`rounded-full px-4 py-2 text-sm ${type === t ? 'bg-accent text-onaccent' : 'text-ink'}`} onClick={() => setParams(t === 'pattern' ? { type: 'pattern' } : {})}>
            {label}
          </button>
        ))}
      </div>
      <p className="-mt-3 mb-6 text-sm text-muted">另有獨立的學習方案：<Link to="/habits7/plan" className="text-accent underline">21 天七習慣探索計畫</Link>（進度與這裡的挑戰分開保存）。</p>
      <div role="tabpanel">{type === 'pattern' ? <PatternChallenge /> : <NeuroChallenge />}</div>
    </div>
  );
}
