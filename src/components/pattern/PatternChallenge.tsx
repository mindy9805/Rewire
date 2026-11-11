/**
 * 14 天打破慣性挑戰
 * - 使用者選擇一個習慣，依所選習慣產生每日任務：今日行動、今日反思、今日心智語句、習慣追蹤、完成紀錄。
 * - 可切換挑戰（各習慣進度分開保存）、調整難度（輕量版／標準版）、暫停與恢復；中斷時保留既有進度。
 * - 與原本的「14 天神經可塑性練習」完成狀態分開儲存。
 */
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Circle, Pause, Play, BookOpen } from 'lucide-react';
import { challengeAction, challengeAffirmation, patternChallengeReflections, patternHabits, patternMap } from '../../content/breakPattern';
import { affirmationMap } from '../../content/dailyRewire';
import { gentleFeedback } from '../../content/challenge';
import { useStore } from '../../store/AppStore';
import { useToast } from '../ui/Toast';
import { ProgressBar, TextArea } from '../ui/basics';
import { nowIso } from '../../lib/id';
import { patternChallengeDone } from '../../lib/pattern';
import type { PatternChallengeState, PatternDayRecord, PatternHabitId } from '../../types';
import { HabitIcon } from './shared';

const emptyDay: PatternDayRecord = { completed: false, note: '', reflection: '', oldPattern: '', usedAlternative: false };
const OLD = [
  { v: 'none', label: '今天沒有出現' },
  { v: 'once', label: '出現一次' },
  { v: 'many', label: '出現多次' },
] as const;

export default function PatternChallenge() {
  const { data, update } = useStore();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const pc = data.patternChallenge;
  const queryHabit = params.get('habit') as PatternHabitId | null;
  const [pick, setPick] = useState<PatternHabitId>(queryHabit && patternMap[queryHabit] ? queryHabit : (pc.activeHabitId || data.patternFocus[0] || 'approval'));
  const active = pc.activeHabitId ? patternMap[pc.activeHabitId] : null;
  const progress = active ? pc.progress[active.id] ?? {} : {};
  const firstOpen = active ? (Array.from({ length: 14 }, (_, i) => i + 1).find((d) => !progress[d]?.completed) ?? 14) : 1;
  const day = Math.min(14, Math.max(1, Number(params.get('pday')) || firstOpen));
  const record = progress[String(day)] ?? emptyDay;
  const [form, setForm] = useState<PatternDayRecord>(record);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    setForm(record);
    setFeedback('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day, pc.activeHabitId]);

  const setPC = (fn: (p: PatternChallengeState) => PatternChallengeState) => update((d) => ({ ...d, patternChallenge: fn(d.patternChallenge) }));
  const start = () => {
    const resumed = !!pc.progress[pick] && Object.keys(pc.progress[pick]!).length > 0;
    setPC((p) => ({ ...p, activeHabitId: pick, status: 'active', progress: { ...p.progress, [pick]: p.progress[pick] ?? {} } }));
    params.delete('pday');
    params.set('type', 'pattern');
    setParams(params);
    toast(resumed ? `已切換到「${patternMap[pick].short}」，之前的進度都保留著` : `開始「${patternMap[pick].short}」14 天挑戰`);
  };
  const persist = (rec: PatternDayRecord) => {
    if (!active) return;
    setPC((p) => ({ ...p, progress: { ...p.progress, [active.id]: { ...(p.progress[active.id] ?? {}), [String(day)]: { ...rec, updatedAt: nowIso() } } } }));
  };
  const toggleDone = () => {
    const completed = !record.completed;
    const rec = { ...form, completed, completedAt: completed ? nowIso() : undefined };
    setForm(rec);
    persist(rec);
    if (completed) {
      const msg = gentleFeedback[(day + 2) % gentleFeedback.length];
      setFeedback(msg);
      toast(`Day ${day} 完成 · ${msg}`);
    } else toast('已取消完成勾選，隨時可以重新練習', 'info');
  };
  const goDay = (d: number) => { params.set('pday', String(d)); params.set('type', 'pattern'); setParams(params); };

  return (
    <div className="space-y-6">
      <section aria-labelledby="pc-setup" className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
        <h2 id="pc-setup" className="font-serif text-lg font-bold">選擇想練習的習慣</h2>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="pc-habit" className="field-label">習慣</label>
            <select id="pc-habit" className="field" value={pick} onChange={(e) => setPick(e.target.value as PatternHabitId)}>
              {patternHabits.map((h) => <option key={h.id} value={h.id}>{h.title}（已完成 {patternChallengeDone(data, h.id)}/14）</option>)}
            </select>
          </div>
          <button className="btn-primary" onClick={start} disabled={pc.status === 'active' && pc.activeHabitId === pick}>
            {pc.activeHabitId && pc.activeHabitId !== pick ? '切換到這個挑戰' : pc.status === 'none' ? '開始挑戰' : pc.status === 'paused' && pc.activeHabitId === pick ? '恢復挑戰' : '進行中'}
          </button>
        </div>
        {active && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3 text-sm">
            <span className="text-muted">難度：</span>
            {(['gentle', 'standard'] as const).map((l) => (
              <button key={l} aria-pressed={pc.level === l} className={pc.level === l ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'} onClick={() => { setPC((p) => ({ ...p, level: l })); toast(l === 'gentle' ? '已切換為輕量版' : '已切換為標準版'); }}>
                {l === 'gentle' ? '輕量版' : '標準版'}
              </button>
            ))}
            {pc.status === 'active' ? (
              <button className="btn-ghost btn-sm ml-auto" onClick={() => { setPC((p) => ({ ...p, status: 'paused' })); toast('已暫停挑戰，進度會完整保留', 'info'); }}><Pause className="h-4 w-4" aria-hidden />暫停挑戰</button>
            ) : pc.status === 'paused' ? (
              <button className="btn-ghost btn-sm ml-auto" onClick={() => { setPC((p) => ({ ...p, status: 'active' })); toast('歡迎回來，從上次的地方繼續'); }}><Play className="h-4 w-4" aria-hidden />恢復挑戰</button>
            ) : null}
          </div>
        )}
      </section>

      {!active ? (
        <p className="rounded-2xl bg-soft/60 p-5 text-sm">選擇一個習慣並按「開始挑戰」，系統會依照這個習慣產生 14 天的每日任務。不需要連續完成，也可以隨時暫停或切換。</p>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-soft text-accent"><HabitIcon h={active} /></span>
            <div className="flex-1">
              <p className="font-serif text-lg font-bold">{active.title}{pc.status === 'paused' && <span className="chip ml-2">已暫停</span>}</p>
              <ProgressBar label="打破慣性挑戰進度" value={patternChallengeDone(data, active.id)} max={14} />
            </div>
          </div>
          {pc.status === 'paused' && <p className="rounded-xl bg-apricot/25 px-4 py-2 text-sm">挑戰暫停中。你仍可查看與補寫紀錄；準備好時按「恢復挑戰」即可。</p>}
          <nav aria-label="選擇天數">
            <ol className="grid grid-cols-7 gap-2">
              {Array.from({ length: 14 }, (_, i) => i + 1).map((d) => {
                const c = progress[String(d)]?.completed;
                return (
                  <li key={d}>
                    <button onClick={() => goDay(d)} aria-current={d === day ? 'step' : undefined} aria-label={`第 ${d} 天${c ? '（已完成）' : ''}`}
                      className={`flex aspect-square w-full flex-col items-center justify-center rounded-xl border text-sm ${d === day ? 'border-accent bg-accent text-onaccent' : c ? 'border-sage bg-soft text-accent' : 'border-line bg-surface hover:border-accent/50'}`}>
                      <span className="font-display">{d}</span>{c && <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />}
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>

          <article aria-labelledby="pc-day" className="rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-7">
            <p className="font-display text-sm italic text-accent">Break the Pattern · Day {day} / 14</p>
            <h3 id="pc-day" className="mt-1 font-serif text-xl font-bold">今日行動</h3>
            <p className="mt-2 leading-relaxed">{challengeAction(active, day, pc.level)}</p>

            <div className="mt-5">
              <p className="font-medium text-accent">今日反思</p>
              <p className="text-sm">{patternChallengeReflections[day - 1]}</p>
              <div className="mt-2"><TextArea label="我的反思" rows={2} value={form.reflection} onChange={(e) => setForm((f) => ({ ...f, reflection: e.target.value }))} /></div>
            </div>

            {(() => {
              const a = affirmationMap[challengeAffirmation(active, day)];
              return (
                <div className="mt-5 rounded-2xl bg-gradient-to-br from-soft to-apricot/25 p-4">
                  <p className="text-xs font-medium text-accent">今日心智語句</p>
                  <p className="mt-1 font-serif text-xl font-bold">「{a.text}」</p>
                  <p className="mt-1 text-sm text-muted">{a.reflection}</p>
                </div>
              );
            })()}

            <fieldset className="mt-5">
              <legend className="field-label">習慣追蹤：今天舊模式出現的情況</legend>
              <div className="flex flex-wrap gap-2">
                {OLD.map((o) => <button key={o.v} type="button" aria-pressed={form.oldPattern === o.v} onClick={() => setForm((f) => ({ ...f, oldPattern: f.oldPattern === o.v ? '' : o.v }))} className={form.oldPattern === o.v ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}>{o.label}</button>)}
              </div>
              <label className="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-[rgb(var(--accent))]" checked={form.usedAlternative} onChange={(e) => setForm((f) => ({ ...f, usedAlternative: e.target.checked }))} />今天有嘗試替代行動</label>
              <p className="mt-1 text-xs text-muted">舊模式出現很正常，記錄它本身就是覺察。</p>
            </fieldset>

            <div className="mt-5"><TextArea label="完成紀錄" rows={3} value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} placeholder="今天做了什麼？有什麼發現？" /></div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button className="btn-secondary" onClick={() => { persist({ ...form, completed: record.completed, completedAt: record.completedAt }); toast(`已儲存第 ${day} 天的紀錄`); }}>儲存紀錄</button>
              <button className={record.completed ? 'btn-secondary' : 'btn-primary'} aria-pressed={record.completed} onClick={toggleDone}>
                {record.completed ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : <Circle className="h-4 w-4" aria-hidden />}
                {record.completed ? '已完成（點擊取消）' : '儲存並標記完成'}
              </button>
            </div>
            {feedback && <p className="mt-4 rounded-xl bg-soft px-4 py-3 text-sm text-accent" role="status">🌱 {feedback}</p>}
            <Link to={`/pattern/${active.id}`} className="mt-4 inline-flex items-center gap-1 text-sm text-accent underline"><BookOpen className="h-4 w-4" aria-hidden />複習「{active.title}」學習頁與互動工具</Link>
          </article>
        </>
      )}
    </div>
  );
}
