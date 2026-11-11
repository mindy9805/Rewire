/**
 * Habit 05 工具：微承諾追蹤器
 * 建立每日微承諾（具體情境、難度、備用方案）→ 每天勾選完成或記錄中斷原因 → 回顧最近七天。
 * 可調整難度、暫停／恢復、刪除。每個承諾每天只有一筆紀錄（可改寫）。
 */
import { useState } from 'react';
import { Check, Pause, Play, X } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { useToast } from '../ui/Toast';
import { EmptyState, TextField } from '../ui/basics';
import { nowIso, uid } from '../../lib/id';
import { shortDate, toDateKey } from '../../lib/date';
import { commitmentDays } from '../../lib/pattern';
import type { MicroCommitment, PatternHabitId } from '../../types';
import { DeleteButton } from './EntryList';
import PracticeAffirmation from './PracticeAffirmation';

const LEVEL = { 1: '輕鬆', 2: '適中', 3: '標準' } as const;
const EXAMPLES = ['早餐後閱讀兩頁書。', '晚上睡前將手機放到書桌。', '每天散步五分鐘。'];

export default function MicroCommitTool({ affirmationIds, habitId = 'promises' }: { affirmationIds: number[]; habitId?: PatternHabitId }) {
  const { data, upsert, remove } = useStore();
  const toast = useToast();
  const [text, setText] = useState('');
  const [situation, setSituation] = useState('');
  const [level, setLevel] = useState<1 | 2 | 3>(1);
  const [backup, setBackup] = useState('');
  const [missing, setMissing] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [done, setDone] = useState(false);
  const today = toDateKey();
  const list = data.microCommitments;

  const create = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const t = nowIso();
    upsert('microCommitments', { id: uid(), habitId, text: text.trim(), situation: situation.trim(), level, backup: backup.trim(), active: true, createdAt: t, updatedAt: t });
    toast('已建立微承諾');
    setText(''); setSituation(''); setBackup(''); setLevel(1);
  };
  /** 記錄今天的狀態；同一天已有紀錄則覆寫 */
  const log = (c: MicroCommitment, status: 'done' | 'missed', why = '') => {
    const existing = data.commitmentLogs.find((l) => l.commitmentId === c.id && l.date === today);
    if (existing && existing.status === status && status === 'done') {
      remove('commitmentLogs', existing.id);
      toast('已取消今天的完成勾選', 'info');
      return;
    }
    upsert('commitmentLogs', { id: existing?.id ?? uid(), commitmentId: c.id, date: today, status, reason: why, createdAt: nowIso() });
    if (status === 'done') { toast('說到做到，做得好 ✓'); setDone(true); } else toast('已記錄中斷原因，明天可以用備用方案重新開始', 'info');
  };
  const patch = (c: MicroCommitment, p: Partial<MicroCommitment>) => upsert('microCommitments', { ...c, ...p, updatedAt: nowIso() });

  return (
    <div className="space-y-4">
      <form onSubmit={create} className="grid gap-3 rounded-2xl border border-line bg-surface p-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <TextField label="每日微承諾" required value={text} onChange={(e) => setText(e.target.value)} placeholder={EXAMPLES[0]} hint={`範例：${EXAMPLES.join('／')}`} />
        </div>
        <TextField label="具體執行情境" value={situation} onChange={(e) => setSituation(e.target.value)} placeholder="例如：吃完早餐、坐到沙發上時" />
        <TextField label="備用方案" value={backup} onChange={(e) => setBackup(e.target.value)} placeholder="例如：太忙時只讀一段" />
        <fieldset className="sm:col-span-2">
          <legend className="field-label">難度</legend>
          <div className="flex gap-2">
            {([1, 2, 3] as const).map((l) => <button key={l} type="button" aria-pressed={level === l} onClick={() => setLevel(l)} className={level === l ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}>{LEVEL[l]}</button>)}
          </div>
        </fieldset>
        <button className="btn-primary justify-self-start" type="submit" disabled={!text.trim()}>建立微承諾</button>
      </form>
      {done && <PracticeAffirmation ids={affirmationIds} onClose={() => setDone(false)} />}
      {list.length === 0 ? <EmptyState title="還沒有微承諾" desc="從一個 2 分鐘內可以完成的小行動開始。" /> : (
        <ul className="space-y-3">
          {list.map((c) => {
            const days = commitmentDays(c, data.commitmentLogs);
            const todayLog = days[6].log;
            return (
              <li key={c.id} className={`rounded-2xl border bg-surface p-4 text-sm ${c.active ? 'border-line' : 'border-dashed border-line opacity-70'}`}>
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{c.text} <span className="chip ml-1">{LEVEL[c.level]}</span>{!c.active && <span className="chip ml-1">已暫停</span>}</p>
                    {c.situation && <p className="text-muted">情境：{c.situation}</p>}
                    {c.backup && <p className="text-muted">備用方案：{c.backup}</p>}
                  </div>
                  <button className="icon-btn h-9 w-9" aria-label={c.active ? '暫停這個微承諾' : '恢復這個微承諾'} onClick={() => { patch(c, { active: !c.active }); toast(c.active ? '已暫停，進度會保留' : '已恢復'); }}>
                    {c.active ? <Pause className="h-4 w-4" aria-hidden /> : <Play className="h-4 w-4" aria-hidden />}
                  </button>
                  <DeleteButton collection="microCommitments" id={c.id} label="微承諾" />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button className={todayLog?.status === 'done' ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'} aria-pressed={todayLog?.status === 'done'} disabled={!c.active} onClick={() => log(c, 'done')}>
                    <Check className="h-4 w-4" aria-hidden />{todayLog?.status === 'done' ? '今天已完成' : '今天完成了'}
                  </button>
                  <button className="btn-ghost btn-sm" disabled={!c.active} onClick={() => { setMissing(c.id); setReason(todayLog?.reason ?? ''); }}>記錄中斷原因</button>
                  <label htmlFor={`lv-${c.id}`} className="ml-auto text-xs text-muted">調整難度</label>
                  <select id={`lv-${c.id}`} className="field w-24 py-1 text-sm" value={c.level} onChange={(e) => { patch(c, { level: Number(e.target.value) as 1 | 2 | 3 }); toast('已調整難度'); }}>
                    {([1, 2, 3] as const).map((l) => <option key={l} value={l}>{LEVEL[l]}</option>)}
                  </select>
                </div>
                {missing === c.id && (
                  <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); log(c, 'missed', reason.trim()); setMissing(null); }}>
                    <label htmlFor={`reason-${c.id}`} className="sr-only">中斷原因</label>
                    <input id={`reason-${c.id}`} className="field" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="例如：加班太累，沒有時間" />
                    <button className="btn-secondary btn-sm shrink-0" type="submit">儲存</button>
                    <button className="icon-btn shrink-0" type="button" aria-label="取消" onClick={() => setMissing(null)}><X className="h-4 w-4" aria-hidden /></button>
                  </form>
                )}
                {todayLog?.status === 'missed' && todayLog.reason && <p className="mt-1 text-xs text-muted">今天的中斷原因：{todayLog.reason}</p>}
                <ol className="mt-3 flex gap-1.5" aria-label="最近七天執行情況">
                  {days.map(({ date, log: l }) => (
                    <li key={date} className="flex flex-col items-center gap-0.5 text-[10px] text-muted">
                      <span className={`flex h-6 w-6 items-center justify-center rounded-full ${l?.status === 'done' ? 'bg-accent text-onaccent' : l?.status === 'missed' ? 'bg-apricot/60' : 'border border-line'}`} title={l?.reason}>
                        {l?.status === 'done' ? '✓' : l?.status === 'missed' ? '–' : ''}
                      </span>
                      <span>{shortDate(date)}</span>
                      <span className="sr-only">{l?.status === 'done' ? '完成' : l?.status === 'missed' ? `中斷${l.reason ? `：${l.reason}` : ''}` : '無紀錄'}</span>
                    </li>
                  ))}
                </ol>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
