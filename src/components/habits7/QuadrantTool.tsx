/**
 * 習慣三工具：四象限優先矩陣＋本週三件要事
 * 新增、拖曳（或選單）調整象限、截止日期、完成狀態、提醒備註、編輯刪除、每週任務分布圖。
 */
import { useState } from 'react';
import { Pencil, Trash2, Plus, Star, GripVertical } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useStore } from '../../store/AppStore';
import { useToast } from '../ui/Toast';
import { useConfirm } from '../ui/Confirm';
import { TextField } from '../ui/basics';
import { quadrants, Q2_EXAMPLES } from '../../content/habits7';
import { nowIso, uid } from '../../lib/id';
import { formatDate, shortDate, toDateKey } from '../../lib/date';
import { quadrantDistribution, weekKey } from '../../lib/habits7';
import type { Big3Week, QuadrantTask } from '../../types';
import { draggable, dropZone } from './dnd';

type Form = { title: string; quadrant: 1 | 2 | 3 | 4; due: string; note: string };
const blank: Form = { title: '', quadrant: 2, due: '', note: '' };

function Big3() {
  const { data, upsert } = useStore();
  const toast = useToast();
  const wk = weekKey();
  const week: Big3Week = data.big3Weeks.find((w) => w.id === wk) ?? { id: wk, items: [], updatedAt: '' };
  const [text, setText] = useState('');
  const [when, setWhen] = useState('');
  const save = (items: Big3Week['items'], msg?: string) => { upsert('big3Weeks', { ...week, items, updatedAt: nowIso() }); if (msg) toast(msg); };
  const q2 = data.quadrantTasks.filter((t) => t.quadrant === 2 && !t.done && !week.items.some((i) => i.text === t.title));
  return (
    <section aria-labelledby="big3-h" className="rounded-2xl bg-gradient-to-br from-soft to-apricot/25 p-4 sm:p-5">
      <h4 id="big3-h" className="flex items-center gap-2 font-serif text-lg font-bold"><Star className="h-5 w-5 text-accent" aria-hidden />本週三件要事（{formatDate(wk)} 起）</h4>
      <p className="text-sm text-muted">選出本週最重要的三件事，並寫下具體執行時間。</p>
      <ol className="mt-3 space-y-2">
        {week.items.map((i, idx) => (
          <li key={i.id} className="flex items-center gap-2 rounded-xl bg-surface px-3 py-2 text-sm">
            <span className="font-display text-lg text-sage">{idx + 1}</span>
            <input type="checkbox" className="h-4 w-4 accent-[rgb(var(--accent))]" checked={i.done} aria-label={`完成：${i.text}`} onChange={() => save(week.items.map((x) => (x.id === i.id ? { ...x, done: !x.done } : x)), i.done ? undefined : '完成一件要事 ✓')} />
            <span className={`flex-1 ${i.done ? 'text-muted line-through' : ''}`}>{i.text}{i.when && <span className="ml-2 text-xs text-muted">⏰ {i.when}</span>}</span>
            <button className="icon-btn h-8 w-8" aria-label={`移除要事：${i.text}`} onClick={() => save(week.items.filter((x) => x.id !== i.id), '已移除')}><Trash2 className="h-4 w-4" aria-hidden /></button>
          </li>
        ))}
      </ol>
      {week.items.length < 3 && (
        <form className="mt-3 grid gap-2 sm:grid-cols-[1fr_12rem_auto] sm:items-end" onSubmit={(e) => { e.preventDefault(); if (!text.trim()) return; save([...week.items, { id: uid(), text: text.trim(), when: when.trim(), done: false }], '已加入本週要事'); setText(''); setWhen(''); }}>
          <TextField label={`第 ${week.items.length + 1} 件要事`} value={text} onChange={(e) => setText(e.target.value)} placeholder="例如：完成提案初稿" list="big3-q2" />
          <datalist id="big3-q2">{q2.map((t) => <option key={t.id} value={t.title} />)}</datalist>
          <TextField label="執行時間" value={when} onChange={(e) => setWhen(e.target.value)} placeholder="例如：週三 9:00–11:00" />
          <button className="btn-primary" type="submit" disabled={!text.trim()}>加入</button>
        </form>
      )}
      {week.items.length === 3 && <p className="mt-2 text-xs text-muted">已選滿三件。完成後也別忘了休息。</p>}
    </section>
  );
}

export default function QuadrantTool() {
  const { data, upsert, remove } = useStore();
  const toast = useToast();
  const confirm = useConfirm();
  const [form, setForm] = useState<Form>(blank);
  const [editing, setEditing] = useState<QuadrantTask | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const tasks = data.quadrantTasks;
  const today = toDateKey();
  const dist = quadrantDistribution(tasks);
  const hasWeek = dist.some((d) => d.進行中 + d.已完成 > 0);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const t = nowIso();
    upsert('quadrantTasks', editing ? { ...editing, ...form, title: form.title.trim(), updatedAt: t } : { id: uid(), ...form, title: form.title.trim(), done: false, createdAt: t, updatedAt: t });
    toast(editing ? '已更新任務' : '已新增任務');
    setForm({ ...blank, quadrant: form.quadrant });
    setEditing(null);
  };
  const move = (id: string, q: 1 | 2 | 3 | 4) => {
    const task = tasks.find((x) => x.id === id);
    if (task && task.quadrant !== q) { upsert('quadrantTasks', { ...task, quadrant: q, updatedAt: nowIso() }); toast(`已移到第${'一二三四'[q - 1]}象限`); }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={save} className="grid gap-3 rounded-2xl border border-line bg-surface p-4 sm:grid-cols-2">
        <div className="sm:col-span-2"><TextField label={editing ? '編輯任務' : '新增任務'} required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="例如：預約健康檢查" /></div>
        <div>
          <label htmlFor="qt-q" className="field-label">象限</label>
          <select id="qt-q" className="field" value={form.quadrant} onChange={(e) => setForm({ ...form, quadrant: Number(e.target.value) as Form['quadrant'] })}>
            {quadrants.map((q) => <option key={q.q} value={q.q}>{q.title}：{q.desc}</option>)}
          </select>
        </div>
        <TextField label="截止日期（選填）" type="date" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} />
        <div className="sm:col-span-2"><TextField label="提醒備註（選填）" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="例如：先查好診所時間" /></div>
        <div className="flex gap-2 sm:col-span-2">
          <button className="btn-primary" type="submit" disabled={!form.title.trim()}><Plus className="h-4 w-4" aria-hidden />{editing ? '儲存修改' : '新增任務'}</button>
          {editing && <button type="button" className="btn-ghost" onClick={() => { setEditing(null); setForm(blank); }}>取消編輯</button>}
        </div>
        <p className="text-xs text-muted sm:col-span-2">第二象限靈感：{Q2_EXAMPLES.join('、')}</p>
      </form>

      <div className="grid gap-3 md:grid-cols-2">
        {quadrants.map((q) => {
          const list = tasks.filter((t) => t.quadrant === q.q).sort((a, b) => Number(a.done) - Number(b.done) || (a.due || '9').localeCompare(b.due || '9'));
          return (
            <section key={q.q} aria-label={`${q.title}：${q.desc}`} {...dropZone((id) => move(id, q.q), (v) => setOver(v ? q.q : null))}
              className={`min-h-[10rem] rounded-2xl border p-3 transition ${q.tone} ${q.q === 2 ? 'border-accent/60' : 'border-line'} ${over === q.q ? 'ring-2 ring-accent' : ''}`}>
              <p className="font-medium">{q.title}<span className="ml-2 text-sm font-normal text-muted">{q.desc}</span>{q.q === 2 && <span className="chip ml-2">優先保護</span>}</p>
              {list.length === 0 && <p className="mt-2 text-xs text-muted">把任務拖曳到這裡，或用新增表單選擇此象限。</p>}
              <ul className="mt-2 space-y-1.5">
                {list.map((t) => {
                  const overdue = t.due && !t.done && t.due < today;
                  return (
                    <li key={t.id} {...draggable(t.id)} className="cursor-grab rounded-xl bg-surface px-3 py-2 text-sm shadow-sm">
                      <div className="flex items-start gap-2">
                        <GripVertical className="drag-handle mt-1 h-4 w-4 shrink-0 text-muted" aria-hidden />
                        <input type="checkbox" className="mt-1 h-4 w-4 accent-[rgb(var(--accent))]" checked={t.done} aria-label={`完成：${t.title}`} onChange={() => { upsert('quadrantTasks', { ...t, done: !t.done, updatedAt: nowIso() }); if (!t.done) toast('完成一項任務 ✓'); }} />
                        <div className="min-w-0 flex-1">
                          <p className={t.done ? 'text-muted line-through' : ''}>{t.title}</p>
                          {(t.due || t.note) && <p className="text-xs text-muted">{t.due && <span className={overdue ? 'text-[#9B3D35] dark:text-[#E8A39A]' : ''}>截止 {shortDate(t.due)}{overdue ? '（已過期）' : ''}</span>}{t.due && t.note && '・'}{t.note}</p>}
                        </div>
                        <label htmlFor={`mq-${t.id}`} className="sr-only">移動「{t.title}」到</label>
                        <select id={`mq-${t.id}`} className="rounded border border-line bg-bg px-1 py-0.5 text-xs" value={t.quadrant} onChange={(e) => move(t.id, Number(e.target.value) as 1 | 2 | 3 | 4)}>
                          {quadrants.map((x) => <option key={x.q} value={x.q}>Q{x.q}</option>)}
                        </select>
                        <button className="icon-btn h-7 w-7" aria-label={`編輯任務：${t.title}`} onClick={() => { setEditing(t); setForm({ title: t.title, quadrant: t.quadrant, due: t.due, note: t.note }); }}><Pencil className="h-3.5 w-3.5" aria-hidden /></button>
                        <button className="icon-btn h-7 w-7" aria-label={`刪除任務：${t.title}`} onClick={async () => { if (await confirm({ title: '刪除這項任務？', confirmText: '刪除', danger: true })) { remove('quadrantTasks', t.id); toast('已刪除任務'); } }}><Trash2 className="h-3.5 w-3.5" aria-hidden /></button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      <figure className="rounded-2xl border border-line bg-surface p-3">
        <figcaption className="mb-1 text-center text-xs text-muted">本週任務分布（依截止日或建立日計算）</figcaption>
        {hasWeek ? (
          <div className="h-52">
            <ResponsiveContainer>
              <BarChart data={dist} margin={{ top: 10, right: 0, left: -24, bottom: 0 }}>
                <CartesianGrid stroke="rgb(var(--line))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'rgb(var(--muted))' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'rgb(var(--muted))' }} />
                <Tooltip contentStyle={{ background: 'rgb(var(--surface))', border: '1px solid rgb(var(--line))', borderRadius: 12, fontSize: 12 }} cursor={{ fill: 'rgb(var(--soft))' }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="進行中" stackId="q" fill="#A8BBA3" isAnimationActive={false} />
                <Bar dataKey="已完成" stackId="q" fill="#36594B" isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : <p className="py-6 text-center text-sm text-muted">本週還沒有任務。</p>}
      </figure>

      <Big3 />
    </div>
  );
}
