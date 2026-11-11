/**
 * 習慣一工具：關注圈與影響圈
 * 輸入困難 → 新增相關事項 → 拖曳（或用選單）分類為「能直接控制／可以嘗試影響／目前超出控制」
 * → 選擇一項行動建立微承諾（寫入既有的微承諾追蹤器）。
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GripVertical, Plus, X } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { useToast } from '../ui/Toast';
import { EmptyState, TextField } from '../ui/basics';
import { nowIso, uid } from '../../lib/id';
import type { CircleEntry, CircleZone } from '../../types';
import { DeleteButton } from '../pattern/EntryList';
import { draggable, dropZone } from './dnd';

const ZONES: { id: CircleZone; title: string; desc: string; tone: string }[] = [
  { id: 'control', title: '我能直接控制的事情', desc: '自己的行動、準備、回應', tone: 'bg-sage/30' },
  { id: 'influence', title: '我可以嘗試影響的事情', desc: '透過溝通、合作或請求', tone: 'bg-apricot/30' },
  { id: 'outside', title: '目前超出我控制範圍的事情', desc: '承認它，並把心力放回前兩區', tone: 'bg-soft' },
];

function Board({ entry }: { entry: CircleEntry }) {
  const { upsert } = useStore();
  const toast = useToast();
  const [text, setText] = useState('');
  const [over, setOver] = useState<CircleZone | null>(null);
  const save = (next: CircleEntry) => upsert('circles', { ...next, updatedAt: nowIso() });
  const move = (id: string, zone: CircleZone) => save({ ...entry, items: entry.items.map((i) => (i.id === id ? { ...i, zone } : i)) });
  const commit = (itemId: string) => {
    const item = entry.items.find((i) => i.id === itemId);
    if (!item) return;
    const t = nowIso();
    const cid = uid();
    upsert('microCommitments', { id: cid, habitId: 'general', text: item.text, situation: `關於「${entry.problem}」`, level: 1, backup: '', active: true, createdAt: t, updatedAt: t });
    save({ ...entry, actionItemId: itemId, commitmentId: cid });
    toast('已建立微承諾，可在微承諾追蹤器每天勾選');
  };

  return (
    <section className="rounded-2xl border border-line bg-surface p-4" aria-label={`困難：${entry.problem}`}>
      <div className="flex items-start gap-2">
        <h4 className="flex-1 font-serif text-lg font-bold">{entry.problem}</h4>
        <DeleteButton collection="circles" id={entry.id} label="影響圈整理" />
      </div>
      <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (!text.trim()) return; save({ ...entry, items: [...entry.items, { id: uid(), text: text.trim(), zone: 'influence' }] }); setText(''); }}>
        <label htmlFor={`ci-${entry.id}`} className="sr-only">新增相關事項</label>
        <input id={`ci-${entry.id}`} className="field" value={text} onChange={(e) => setText(e.target.value)} placeholder="新增一件相關的事，例如：練習自我介紹" />
        <button className="btn-secondary shrink-0" type="submit" disabled={!text.trim()}><Plus className="h-4 w-4" aria-hidden />新增</button>
      </form>
      <p className="mt-1 text-xs text-muted">把卡片拖曳到合適的區域；手機或鍵盤可使用每張卡片的「移動到」選單。</p>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        {ZONES.map((z) => (
          <div key={z.id} {...dropZone((id) => move(id, z.id), (v) => setOver(v ? z.id : null))} className={`min-h-[8rem] rounded-xl p-3 transition ${z.tone} ${over === z.id ? 'ring-2 ring-accent' : ''}`} aria-label={z.title}>
            <p className="text-sm font-medium">{z.title}</p>
            <p className="text-xs text-muted">{z.desc}</p>
            <ul className="mt-2 space-y-1.5">
              {entry.items.filter((i) => i.zone === z.id).map((i) => (
                <li key={i.id} {...draggable(i.id)} className={`cursor-grab rounded-lg bg-surface px-2 py-1.5 text-sm shadow-sm ${entry.actionItemId === i.id ? 'ring-2 ring-accent' : ''}`}>
                  <div className="flex items-start gap-1">
                    <GripVertical className="drag-handle mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden />
                    <span className="flex-1">{i.text}</span>
                    <button className="rounded p-0.5 hover:bg-soft" aria-label={`移除：${i.text}`} onClick={() => save({ ...entry, items: entry.items.filter((x) => x.id !== i.id) })}><X className="h-3.5 w-3.5" aria-hidden /></button>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1">
                    <label className="sr-only" htmlFor={`mv-${i.id}`}>移動「{i.text}」到</label>
                    <select id={`mv-${i.id}`} className="rounded border border-line bg-bg px-1 py-0.5 text-xs" value={i.zone} onChange={(e) => move(i.id, e.target.value as CircleZone)}>
                      {ZONES.map((x) => <option key={x.id} value={x.id}>移動到：{x.title.slice(0, 6)}</option>)}
                    </select>
                    {z.id !== 'outside' && entry.actionItemId !== i.id && <button className="text-xs text-accent underline" onClick={() => commit(i.id)}>選為行動並建立微承諾</button>}
                    {entry.actionItemId === i.id && <span className="text-xs text-accent">✓ 已建立微承諾</span>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {entry.commitmentId && <p className="mt-3 text-sm"><Link to="/pattern/promises#tool" className="text-accent underline">前往微承諾追蹤器，每天勾選 →</Link></p>}
    </section>
  );
}

export default function CirclesTool() {
  const { data, upsert } = useStore();
  const toast = useToast();
  const [problem, setProblem] = useState('');
  const create = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem.trim()) return;
    const t = nowIso();
    upsert('circles', { id: uid(), problem: problem.trim(), items: [], actionItemId: '', commitmentId: '', createdAt: t, updatedAt: t });
    toast('已建立，接著新增相關的事情並分類');
    setProblem('');
  };
  return (
    <div className="space-y-4">
      <form onSubmit={create} className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1"><TextField label="目前遇到的困難" value={problem} onChange={(e) => setProblem(e.target.value)} placeholder="例如：找工作一直沒有好消息" /></div>
        <button className="btn-primary" type="submit" disabled={!problem.trim()}>開始整理</button>
      </form>
      {data.circles.length === 0 ? <EmptyState title="還沒有整理過的困難" desc="寫下一個困難，把相關的事分成三類，再選一個行動。" /> : data.circles.map((c) => <Board key={c.id} entry={c} />)}
    </div>
  );
}
