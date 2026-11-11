/**
 * 習慣二工具：人生羅盤 Life Compass
 * 八個生活領域 × 五個問題；可編輯的個人願景宣言、年度關鍵字、年度目標與行動計畫。
 */
import { useState } from 'react';
import { ChevronDown, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { useToast } from '../ui/Toast';
import { useConfirm } from '../ui/Confirm';
import { TextArea, TextField } from '../ui/basics';
import { compassAreas, compassQuestions } from '../../content/habits7';
import { nowIso, uid } from '../../lib/id';
import { formatDateTime } from '../../lib/date';
import type { CompassArea, LifeCompass } from '../../types';

const emptyArea: CompassArea = { values: '', why: '', oneYear: '', adjust: '', next: '' };

export default function LifeCompassTool() {
  const { data, update } = useStore();
  const toast = useToast();
  const confirm = useConfirm();
  const c = data.lifeCompass;
  const [open, setOpen] = useState<string | null>(null);
  const [draft, setDraft] = useState<CompassArea>(emptyArea);
  const [vision, setVision] = useState(c.vision);
  const [keyword, setKeyword] = useState(c.keyword);
  const [goal, setGoal] = useState('');
  const setC = (fn: (x: LifeCompass) => LifeCompass) => update((p) => ({ ...p, lifeCompass: { ...fn(p.lifeCompass), updatedAt: nowIso() } }));
  const filled = compassAreas.filter((a) => Object.values(c.areas[a.id] ?? {}).some((v) => v.trim())).length;

  return (
    <div className="space-y-6">
      <section aria-labelledby="lc-areas">
        <h4 id="lc-areas" className="font-serif text-lg font-bold">探索八個生活領域（已填寫 {filled}/8）</h4>
        <p className="text-sm text-muted">不需要一次全部完成，從最在意的一兩個領域開始。</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {compassAreas.map((a) => {
            const isOpen = open === a.id;
            const has = Object.values(c.areas[a.id] ?? {}).some((v) => v.trim());
            return (
              <div key={a.id} className={`rounded-2xl border bg-surface ${isOpen ? 'border-accent sm:col-span-2' : 'border-line'}`}>
                <button className="flex w-full items-center gap-2 p-3 text-left" aria-expanded={isOpen} onClick={() => { setOpen(isOpen ? null : a.id); setDraft(c.areas[a.id] ?? emptyArea); }}>
                  <span className="flex-1 font-medium">{a.label}{has && <span className="ml-2 text-xs text-accent">✓ 已填寫</span>}</span>
                  <ChevronDown className={`h-4 w-4 transition ${isOpen ? 'rotate-180' : ''}`} aria-hidden />
                </button>
                {!isOpen && has && <p className="px-3 pb-3 text-xs text-muted line-clamp-2">下一步：{c.areas[a.id]?.next || '—'}</p>}
                {isOpen && (
                  <form className="space-y-2 border-t border-line p-3" onSubmit={(e) => { e.preventDefault(); setC((x) => ({ ...x, areas: { ...x.areas, [a.id]: draft } })); toast(`已儲存「${a.label}」`); setOpen(null); }}>
                    {compassQuestions.map(({ key, q }) => <TextArea key={key} label={q} rows={2} value={draft[key]} onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))} />)}
                    <button className="btn-primary btn-sm" type="submit">儲存這個領域</button>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="lc-vision" className="rounded-2xl bg-gradient-to-br from-soft to-apricot/25 p-4 sm:p-5">
        <h4 id="lc-vision" className="font-serif text-lg font-bold">個人願景宣言</h4>
        <p className="text-sm text-muted">用 3–5 句話描述你希望成為什麼樣的人、重視什麼。隨時可以修改。</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_12rem]">
          <TextArea label="我的願景" rows={4} value={vision} onChange={(e) => setVision(e.target.value)} placeholder="例如：我希望成為一個身體健康、持續學習，並讓身邊的人感到被支持的人……" />
          <TextField label="年度關鍵字" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="例如：穩定" />
        </div>
        <button className="btn-primary btn-sm mt-2" onClick={() => { setC((x) => ({ ...x, vision: vision.trim(), keyword: keyword.trim() })); toast('已儲存願景宣言'); }}>儲存願景</button>
        {c.updatedAt && <p className="mt-1 text-xs text-muted">最後更新：{formatDateTime(c.updatedAt)}</p>}
      </section>

      <section aria-labelledby="lc-goals">
        <h4 id="lc-goals" className="font-serif text-lg font-bold">年度目標與行動計畫</h4>
        <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (!goal.trim()) return; setC((x) => ({ ...x, goals: [...x.goals, { id: uid(), text: goal.trim(), plan: '', done: false }] })); setGoal(''); toast('已新增年度目標'); }}>
          <label htmlFor="lc-goal" className="sr-only">新增年度目標</label>
          <input id="lc-goal" className="field" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="例如：完成一門線上課程" />
          <button className="btn-secondary shrink-0" type="submit" disabled={!goal.trim()}><Plus className="h-4 w-4" aria-hidden />新增</button>
        </form>
        <ul className="mt-3 space-y-2">
          {c.goals.map((g) => (
            <li key={g.id} className="rounded-2xl border border-line bg-surface p-3">
              <div className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4 accent-[rgb(var(--accent))]" checked={g.done} aria-label={`完成：${g.text}`} onChange={() => { setC((x) => ({ ...x, goals: x.goals.map((y) => (y.id === g.id ? { ...y, done: !y.done } : y)) })); if (!g.done) toast('恭喜完成一個年度目標 🎉'); }} />
                <label htmlFor={`gt-${g.id}`} className="sr-only">目標內容</label>
                <input id={`gt-${g.id}`} className={`flex-1 bg-transparent font-medium outline-none ${g.done ? 'text-muted line-through' : ''}`} defaultValue={g.text} onBlur={(e) => e.target.value.trim() && e.target.value !== g.text && setC((x) => ({ ...x, goals: x.goals.map((y) => (y.id === g.id ? { ...y, text: e.target.value.trim() } : y)) }))} />
                <button className="icon-btn h-8 w-8" aria-label={`刪除目標：${g.text}`} onClick={async () => { if (await confirm({ title: '刪除這個年度目標？', confirmText: '刪除', danger: true })) { setC((x) => ({ ...x, goals: x.goals.filter((y) => y.id !== g.id) })); toast('已刪除'); } }}><Trash2 className="h-4 w-4" aria-hidden /></button>
              </div>
              <label htmlFor={`gp-${g.id}`} className="mt-2 block text-xs text-muted">行動計畫（離開欄位時自動儲存）</label>
              <textarea id={`gp-${g.id}`} className="field mt-1 text-sm" rows={2} defaultValue={g.plan} placeholder="例如：每週二、四晚上 9 點上課 30 分鐘" onBlur={(e) => e.target.value !== g.plan && (setC((x) => ({ ...x, goals: x.goals.map((y) => (y.id === g.id ? { ...y, plan: e.target.value } : y)) })), toast('已儲存行動計畫'))} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
