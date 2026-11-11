/**
 * Habit 02 工具：舒適圈探索地圖
 * 輸入一件想嘗試但一直逃避的事，拆成「容易開始／稍有挑戰／需要更多準備」三階段；
 * 可自行新增步驟、調整難度（上移／下移階段）、勾選完成。
 */
import { useState } from 'react';
import { ArrowDown, ArrowUp, Plus, X } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { useToast } from '../ui/Toast';
import { EmptyState, TextField } from '../ui/basics';
import { nowIso, uid } from '../../lib/id';
import type { ComfortMapEntry } from '../../types';
import { DeleteButton } from './EntryList';
import PracticeAffirmation from './PracticeAffirmation';

const LEVELS: { v: 1 | 2 | 3; label: string; color: string }[] = [
  { v: 1, label: '容易開始', color: 'bg-soft' },
  { v: 2, label: '稍有挑戰', color: 'bg-apricot/30' },
  { v: 3, label: '需要更多準備', color: 'bg-sage/30' },
];

function StepAdder({ onAdd }: { onAdd: (text: string) => void }) {
  const [t, setT] = useState('');
  return (
    <form className="mt-2 flex gap-1" onSubmit={(e) => { e.preventDefault(); if (t.trim()) { onAdd(t.trim()); setT(''); } }}>
      <input className="field py-1.5 text-sm" value={t} onChange={(e) => setT(e.target.value)} placeholder="新增一步…" aria-label="新增步驟" />
      <button className="icon-btn shrink-0" type="submit" aria-label="加入步驟" disabled={!t.trim()}><Plus className="h-4 w-4" aria-hidden /></button>
    </form>
  );
}

export default function ComfortMapTool({ affirmationIds }: { affirmationIds: number[] }) {
  const { data, upsert } = useStore();
  const toast = useToast();
  const [task, setTask] = useState('');
  const [celebrate, setCelebrate] = useState(false);
  const maps = data.patternEntries.filter((e): e is ComfortMapEntry => e.kind === 'comfort');

  const create = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim()) return;
    const t = nowIso();
    upsert('patternEntries', {
      id: uid(), kind: 'comfort', habitId: 'convenience', task: task.trim(), createdAt: t, updatedAt: t,
      steps: [
        { id: uid(), text: '花 5 分鐘了解這件事需要什麼', level: 1, done: false },
        { id: uid(), text: '試做一次最小版本', level: 2, done: false },
        { id: uid(), text: '安排一段完整時間投入', level: 3, done: false },
      ],
    });
    toast('已建立探索地圖，可自行修改步驟');
    setTask('');
  };
  const save = (m: ComfortMapEntry, steps: ComfortMapEntry['steps']) => upsert('patternEntries', { ...m, steps, updatedAt: nowIso() });

  return (
    <div className="space-y-4">
      <form onSubmit={create} className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1"><TextField label="一件想嘗試、但一直逃避的事" value={task} onChange={(e) => setTask(e.target.value)} placeholder="例如：開始學游泳" /></div>
        <button className="btn-primary" type="submit" disabled={!task.trim()}>建立探索地圖</button>
      </form>
      <p className="rounded-xl bg-soft/70 px-3 py-2 text-xs">行動練習：每天選擇一件小幅具有挑戰性、且安全可行的事情。請依自己的健康、時間與資源調整難度。</p>
      {celebrate && <PracticeAffirmation ids={affirmationIds} onClose={() => setCelebrate(false)} />}
      {maps.length === 0 && <EmptyState title="還沒有探索地圖" desc="輸入一件想嘗試的事，系統會先放入三個範例步驟，你可以自由修改。" />}
      {maps.map((m) => (
        <section key={m.id} className="rounded-2xl border border-line bg-surface p-4" aria-label={`探索地圖：${m.task}`}>
          <div className="flex items-center gap-2">
            <h4 className="flex-1 font-serif text-lg font-bold">{m.task}</h4>
            <span className="text-xs text-muted">{m.steps.filter((s) => s.done).length}/{m.steps.length}</span>
            <DeleteButton collection="patternEntries" id={m.id} label="探索地圖" />
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {LEVELS.map((lv) => (
              <div key={lv.v} className={`rounded-xl p-3 ${lv.color}`}>
                <p className="text-sm font-medium">{lv.v}. {lv.label}</p>
                <ul className="mt-2 space-y-1.5">
                  {m.steps.filter((s) => s.level === lv.v).map((s) => (
                    <li key={s.id} className="flex items-start gap-1 rounded-lg bg-surface px-2 py-1.5 text-sm">
                      <input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-[rgb(var(--accent))]" checked={s.done} aria-label={`完成：${s.text}`}
                        onChange={() => { save(m, m.steps.map((x) => (x.id === s.id ? { ...x, done: !x.done } : x))); if (!s.done) { toast('完成一個挑戰步驟 🌱'); setCelebrate(true); } }} />
                      <span className={`flex-1 ${s.done ? 'text-muted line-through' : ''}`}>{s.text}</span>
                      <button className="rounded p-0.5 hover:bg-soft disabled:opacity-30" disabled={s.level === 1} aria-label="調整為較容易的階段" onClick={() => save(m, m.steps.map((x) => (x.id === s.id ? { ...x, level: (x.level - 1) as 1 | 2 | 3 } : x)))}><ArrowUp className="h-3.5 w-3.5" aria-hidden /></button>
                      <button className="rounded p-0.5 hover:bg-soft disabled:opacity-30" disabled={s.level === 3} aria-label="調整為較困難的階段" onClick={() => save(m, m.steps.map((x) => (x.id === s.id ? { ...x, level: (x.level + 1) as 1 | 2 | 3 } : x)))}><ArrowDown className="h-3.5 w-3.5" aria-hidden /></button>
                      <button className="rounded p-0.5 hover:bg-soft" aria-label={`移除步驟：${s.text}`} onClick={() => save(m, m.steps.filter((x) => x.id !== s.id))}><X className="h-3.5 w-3.5" aria-hidden /></button>
                    </li>
                  ))}
                </ul>
                <StepAdder onAdd={(text) => save(m, [...m.steps, { id: uid(), text, level: lv.v, done: false }])} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
