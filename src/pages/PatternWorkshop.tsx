/**
 * 習慣改變工作坊（七步驟）
 * 1 察覺模式 → 2 理解觸發 → 3 分析回饋 → 4 選擇替代行動 → 5 建立微承諾（If-Then）
 * → 6 每日練習（七句心智練習＋行動紀錄）→ 7 反思與調整（每七天回顧）
 * 每一步都會自動儲存，可隨時離開、之後繼續。
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Pencil, Plus } from 'lucide-react';
import { patternHabits, patternMap, workshopAdjustments, workshopSteps } from '../content/breakPattern';
import { affirmationMap } from '../content/dailyRewire';
import { useStore } from '../store/AppStore';
import { useToast } from '../components/ui/Toast';
import { EmptyState, SectionTitle, TextArea, TextField } from '../components/ui/basics';
import { DeleteButton } from '../components/pattern/EntryList';
import PracticeAffirmation from '../components/pattern/PracticeAffirmation';
import { nowIso, uid } from '../lib/id';
import { formatDate, isoToDateKey, toDateKey } from '../lib/date';
import type { PatternHabitId, Workshop } from '../types';

const newWorkshop = (habitId: PatternHabitId): Workshop => {
  const t = nowIso();
  return { id: uid(), habitId, step: 1, pattern: '', time: '', emotion: '', cue: '', shortGain: '', longCost: '', alternative: '', ifSituation: '', ifAction: '', ifBackup: '', planId: '', dailyNote: '', reviewNote: '', adjustments: [], reviewedAt: '', createdAt: t, updatedAt: t };
};

/** 下次回顧日：最近一次回顧（或建立日）後七天 */
export function nextReviewDate(w: Workshop): string {
  const d = new Date(w.reviewedAt || w.createdAt);
  d.setDate(d.getDate() + 7);
  return toDateKey(d);
}

export default function PatternWorkshop() {
  const { data, upsert } = useStore();
  const toast = useToast();
  const [w, setW] = useState<Workshop | null>(null);
  const [startHabit, setStartHabit] = useState<PatternHabitId>(data.patternFocus[0] ?? 'approval');
  const [celebrate, setCelebrate] = useState(false);

  const persist = (next: Workshop, msg?: string) => {
    const saved = { ...next, updatedAt: nowIso() };
    upsert('workshops', saved);
    setW(saved);
    if (msg) toast(msg);
  };
  const set = <K extends keyof Workshop>(k: K, v: Workshop[K]) => setW((x) => (x ? { ...x, [k]: v } : x));
  const go = (step: number) => w && persist({ ...w, step }, '已自動儲存進度');

  if (!w) {
    return (
      <div className="space-y-8 motion-safe:animate-fade-up">
        <nav aria-label="麵包屑" className="text-sm text-muted"><Link to="/pattern" className="hover:text-accent">打破慣性</Link> / 習慣改變工作坊</nav>
        <SectionTitle eyebrow="Habit Change Workshop" title="習慣改變工作坊" desc="結合七個習慣與本站的神經可塑性工具，用七個步驟設計一個屬於你的改變計畫。每一步都會自動儲存。" />
        <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {workshopSteps.map((s) => <li key={s.no} className="rounded-2xl bg-soft/60 p-3 text-sm"><span className="font-display text-lg text-accent">{s.no}</span> <strong>{s.title}</strong><span className="block text-xs text-muted">{s.desc}</span></li>)}
        </ol>
        <div className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="ws-habit" className="field-label">想處理的習慣</label>
            <select id="ws-habit" className="field" value={startHabit} onChange={(e) => setStartHabit(e.target.value as PatternHabitId)}>
              {patternHabits.map((h) => <option key={h.id} value={h.id}>{h.title}{data.patternFocus.includes(h.id) ? '（你選擇的焦點）' : ''}</option>)}
            </select>
          </div>
          <button className="btn-primary" onClick={() => persist(newWorkshop(startHabit), '已建立新的工作坊')}><Plus className="h-4 w-4" aria-hidden />開始新的工作坊</button>
        </div>
        <section aria-labelledby="ws-list">
          <h2 id="ws-list" className="mb-3 text-xl font-bold">我的工作坊</h2>
          {data.workshops.length === 0 ? <EmptyState title="還沒有工作坊" desc="選一個習慣，從「察覺模式」開始。" /> : (
            <ul className="space-y-2">
              {data.workshops.map((x) => {
                const due = nextReviewDate(x) <= toDateKey();
                return (
                  <li key={x.id} className="flex items-start gap-2 rounded-2xl border border-line bg-surface p-4 text-sm">
                    <div className="flex-1">
                      <p className="font-medium">{patternMap[x.habitId].title}</p>
                      <p className="text-xs text-muted">目前在第 {x.step} 步「{workshopSteps[x.step - 1].title}」・建立於 {formatDate(isoToDateKey(x.createdAt))}</p>
                      {x.alternative && <p className="mt-1">替代行動：{x.alternative}</p>}
                      <p className={`mt-1 text-xs ${due ? 'text-accent' : 'text-muted'}`}>{due ? '✦ 已經可以進行七天回顧了' : `下次回顧：${formatDate(nextReviewDate(x))}`}</p>
                    </div>
                    <button className="btn-secondary btn-sm" onClick={() => setW(x)}><Pencil className="h-4 w-4" aria-hidden />繼續</button>
                    <DeleteButton collection="workshops" id={x.id} label="工作坊" />
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    );
  }

  const h = patternMap[w.habitId];
  const todayKey = toDateKey();
  const todayCommitments = data.microCommitments.filter((m) => m.active);
  const createPlan = () => {
    const t = nowIso();
    const planId = w.planId || uid();
    const existing = data.plans.find((p) => p.id === planId);
    upsert('plans', { id: planId, goal: `打破慣性：${h.short}`, situation: w.ifSituation, action: w.ifAction, obstacle: '計畫中斷或狀態不好', backup: w.ifBackup, createdAt: existing?.createdAt ?? t, updatedAt: t });
    persist({ ...w, planId }, existing ? '已更新 If-Then 計畫' : '已建立 If-Then 計畫（可在 Brain Lab 查看）');
  };
  const createCommitment = () => {
    const t = nowIso();
    upsert('microCommitments', { id: uid(), habitId: w.habitId, text: w.ifAction, situation: w.ifSituation, level: 1, backup: w.ifBackup, active: true, createdAt: t, updatedAt: t });
    toast('已加入微承諾追蹤器，每天可以勾選');
  };
  const step = w.step;

  return (
    <div className="space-y-6 motion-safe:animate-fade-up">
      <button className="btn-ghost btn-sm" onClick={() => setW(null)}><ArrowLeft className="h-4 w-4" aria-hidden />回到工作坊列表</button>
      <header>
        <p className="font-display text-sm italic text-accent">Workshop · {h.concept}</p>
        <h1 className="text-2xl font-bold">{h.title}</h1>
      </header>
      <ol className="grid grid-cols-7 gap-1" aria-label="工作坊步驟">
        {workshopSteps.map((s) => (
          <li key={s.no}>
            <button onClick={() => go(s.no)} aria-current={s.no === step ? 'step' : undefined} className={`flex w-full flex-col items-center rounded-xl px-1 py-2 text-[11px] leading-tight transition ${s.no === step ? 'bg-accent text-onaccent' : s.no < step ? 'bg-soft text-accent' : 'bg-surface text-muted'}`}>
              <span className="font-display text-base">{s.no < step ? <Check className="h-4 w-4" aria-hidden /> : s.no}</span>
              <span className="hidden sm:block">{s.title}</span>
              <span className="sr-only sm:hidden">{s.title}</span>
            </button>
          </li>
        ))}
      </ol>

      <section aria-labelledby="ws-step" className="rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-7">
        <p className="text-xs text-muted">第 {step} 步／共 7 步</p>
        <h2 id="ws-step" className="font-serif text-xl font-bold">{workshopSteps[step - 1].title}</h2>
        <p className="mb-4 text-sm text-muted">{workshopSteps[step - 1].desc}</p>

        {step === 1 && (
          <div className="space-y-3">
            <p className="rounded-xl bg-soft/60 p-3 text-sm">常見行為：{h.behaviors.join('、')}</p>
            <TextArea label="我最常重複的行為是什麼？（盡量具體：做了什麼、多久、多常）" value={w.pattern} onChange={(e) => set('pattern', e.target.value)} placeholder={h.situations[0]} />
          </div>
        )}
        {step === 2 && (
          <div className="grid gap-3 sm:grid-cols-3">
            <TextField label="通常發生的時間" value={w.time} onChange={(e) => set('time', e.target.value)} placeholder="例如：晚上 11 點" />
            <TextField label="當時的情緒" value={w.emotion} onChange={(e) => set('emotion', e.target.value)} placeholder="例如：疲倦、焦慮" />
            <TextField label="環境提示" value={w.cue} onChange={(e) => set('cue', e.target.value)} placeholder="例如：躺上床、收到通知" />
            <p className="text-xs text-muted sm:col-span-3">想記錄更多次觀察？可以使用 <Link to="/lab/habit-detective" className="underline">習慣偵探</Link>。多個情境可用頓號分隔，儀表板會統計最常出現的觸發情境。</p>
          </div>
        )}
        {step === 3 && (
          <div className="grid gap-3 sm:grid-cols-2">
            <TextArea label="舊行為帶來的短期好處" value={w.shortGain} onChange={(e) => set('shortGain', e.target.value)} placeholder="例如：暫時放鬆、不用面對壓力" />
            <TextArea label="可能的長期成本" value={w.longCost} onChange={(e) => set('longCost', e.target.value)} placeholder="例如：睡眠不足、計畫延誤" />
            <p className="text-xs text-muted sm:col-span-2">舊行為一定有它的功能，承認它的好處，才能找到能滿足同樣需求的替代方式。</p>
          </div>
        )}
        {step === 4 && (
          <div className="space-y-3">
            <p className="text-sm">參考替代行動：</p>
            <div className="flex flex-wrap gap-2">{h.alternatives.map((a) => <button key={a} type="button" className="btn-secondary btn-sm text-left" onClick={() => set('alternative', a)}>{a}</button>)}</div>
            <TextArea label="我的替代行動（安全、具體、可執行）" value={w.alternative} onChange={(e) => set('alternative', e.target.value)} />
          </div>
        )}
        {step === 5 && (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField label="如果（情境）" value={w.ifSituation} onChange={(e) => set('ifSituation', e.target.value)} placeholder={w.cue || '例如：晚上 11 點躺上床時'} />
              <TextField label="我就（行動）" value={w.ifAction} onChange={(e) => set('ifAction', e.target.value)} placeholder={w.alternative || '例如：把手機放到書桌'} />
              <div className="sm:col-span-2"><TextField label="備用方案（做不到時的最小版本）" value={w.ifBackup} onChange={(e) => set('ifBackup', e.target.value)} placeholder="例如：至少開啟勿擾模式" /></div>
            </div>
            <p className="rounded-xl bg-soft/70 p-3 text-sm">預覽：如果{w.ifSituation || '……'}，我就{w.ifAction || '……'}。{w.ifBackup && `做不到時，我會${w.ifBackup}。`}</p>
            <div className="flex flex-wrap gap-2">
              <button className="btn-primary btn-sm" onClick={createPlan} disabled={!w.ifSituation.trim() || !w.ifAction.trim()}>{w.planId ? '更新 If-Then 計畫' : '建立 If-Then 計畫'}</button>
              <button className="btn-secondary btn-sm" onClick={createCommitment} disabled={!w.ifAction.trim()}>同時加入每日微承諾</button>
            </div>
          </div>
        )}
        {step === 6 && (
          <div className="space-y-4 text-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-soft/60 p-4">
                <p className="font-medium text-accent">每日七句心智練習</p>
                <p className="mt-1">與這個習慣相關的語句：{h.affirmationIds.map((id) => `「${affirmationMap[id].text}」`).join('、')}</p>
                <Link to="/daily/read" className="btn-secondary btn-sm mt-2">開始今日練習</Link>
              </div>
              <div className="rounded-2xl bg-soft/60 p-4">
                <p className="font-medium text-accent">今天的行動紀錄</p>
                {todayCommitments.length === 0 ? <p className="mt-1 text-muted">尚未建立微承諾，可回到第 5 步加入。</p> : (
                  <ul className="mt-1 space-y-1">{todayCommitments.map((m) => <li key={m.id}>{data.commitmentLogs.some((l) => l.commitmentId === m.id && l.date === todayKey && l.status === 'done') ? '✓' : '○'} {m.text}</li>)}</ul>
                )}
                <Link to="/pattern/promises#tool" className="btn-secondary btn-sm mt-2">到微承諾追蹤器勾選</Link>
              </div>
            </div>
            <TextArea label="練習筆記：這幾天執行得如何？" value={w.dailyNote} onChange={(e) => set('dailyNote', e.target.value)} />
          </div>
        )}
        {step === 7 && (
          <div className="space-y-3">
            <p className="text-sm text-muted">{w.reviewedAt ? `上次回顧：${formatDate(isoToDateKey(w.reviewedAt))}・` : ''}建議每七天回顧一次，下次回顧日：{formatDate(nextReviewDate(w))}</p>
            <TextArea label="這一週，我觀察到什麼？哪些有效、哪些需要調整？" value={w.reviewNote} onChange={(e) => set('reviewNote', e.target.value)} />
            <fieldset>
              <legend className="field-label">接下來的調整（可複選）</legend>
              <div className="flex flex-wrap gap-2">
                {workshopAdjustments.map((a) => {
                  const on = w.adjustments.includes(a);
                  return <button key={a} type="button" aria-pressed={on} onClick={() => set('adjustments', on ? w.adjustments.filter((x) => x !== a) : [...w.adjustments, a])} className={on ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}>{a}</button>;
                })}
              </div>
            </fieldset>
            <p className="text-xs text-muted">降低難度不是退步，而是讓改變更可持續的好判斷。</p>
            <button className="btn-primary" onClick={() => { persist({ ...w, reviewedAt: nowIso() }, '已完成本次回顧，七天後再看看'); setCelebrate(true); }}>完成本次回顧</button>
            {celebrate && <PracticeAffirmation ids={h.affirmationIds} onClose={() => setCelebrate(false)} />}
          </div>
        )}

        <div className="mt-6 flex justify-between gap-2 border-t border-line pt-4">
          <button className="btn-secondary" onClick={() => go(step - 1)} disabled={step === 1}><ArrowLeft className="h-4 w-4" aria-hidden />上一步</button>
          <button className="btn-ghost" onClick={() => persist(w, '已儲存')}>儲存</button>
          <button className="btn-primary" onClick={() => go(step + 1)} disabled={step === 7}>下一步<ArrowRight className="h-4 w-4" aria-hidden /></button>
        </div>
      </section>
    </div>
  );
}
