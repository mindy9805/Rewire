/**
 * 習慣四工具：雙贏協商工作坊
 * 整理雙方需求、共同目標、不可妥協的界線、可調整條件與互利方案；為方案評分並顯示比較表。
 * 提醒：雙贏需考慮權力關係；拒絕合作、暫停協商或尋求第三方協助也可能是合理選擇。
 */
import { useState } from 'react';
import { Pencil, Plus, X } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { useToast } from '../ui/Toast';
import { EmptyState, TextArea } from '../ui/basics';
import { nowIso, uid } from '../../lib/id';
import type { Negotiation } from '../../types';
import { DeleteButton, EntryCard } from '../pattern/EntryList';

type Form = Omit<Negotiation, 'id' | 'createdAt' | 'updatedAt'>;
const blank: Form = { situation: '', myNeeds: '', theirNeeds: '', commonGoal: '', boundaries: '', flexible: '', options: [], note: '' };
const FIELDS: { key: keyof Omit<Form, 'options' | 'situation' | 'note'>; label: string; ph: string }[] = [
  { key: 'myNeeds', label: '我的需求', ph: '例如：週末需要完整時間準備考試' },
  { key: 'theirNeeds', label: '對方可能的需求', ph: '例如：希望家人能聚在一起' },
  { key: 'commonGoal', label: '雙方共同目標', ph: '例如：維持好的家庭關係' },
  { key: 'boundaries', label: '不可妥協的界線', ph: '例如：考前一週不能整天外出' },
  { key: 'flexible', label: '可以調整的條件', ph: '例如：聚會時間、地點、方式' },
];

/** 方案的互利指標：雙方分數取較低者（避免一方大贏一方大輸），再加上可行性 */
export const mutualScore = (o: Negotiation['options'][number]) => Math.min(o.mine, o.theirs) * 2 + o.feasible;

function Score({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="flex items-center gap-1 text-xs">
      <span className="text-muted">{label}</span>
      <select className="rounded border border-line bg-bg px-1 py-0.5" value={value} onChange={(e) => onChange(Number(e.target.value))} aria-label={label}>
        {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
      </select>
    </label>
  );
}

export default function NegotiationTool() {
  const { data, upsert } = useStore();
  const toast = useToast();
  const [f, setF] = useState<Form>(blank);
  const [editing, setEditing] = useState<Negotiation | null>(null);
  const [opt, setOpt] = useState('');
  const sorted = [...f.options].sort((a, b) => mutualScore(b) - mutualScore(a));

  const save = () => {
    if (!f.situation.trim()) return;
    const t = nowIso();
    upsert('negotiations', editing ? { ...editing, ...f, updatedAt: t } : { id: uid(), ...f, createdAt: t, updatedAt: t });
    toast(editing ? '已更新協商紀錄' : '已儲存協商紀錄');
    setF(blank);
    setEditing(null);
  };
  const setOption = (id: string, patch: Partial<Form['options'][number]>) => setF((x) => ({ ...x, options: x.options.map((o) => (o.id === id ? { ...o, ...patch } : o)) }));

  return (
    <div className="space-y-5">
      <TextArea label="衝突或協商情境" required rows={2} value={f.situation} onChange={(e) => setF({ ...f, situation: e.target.value })} placeholder="例如：家人希望我週末回家，但我需要準備考試" />
      <div className="grid gap-3 sm:grid-cols-2">
        {FIELDS.map((x) => <TextArea key={x.key} label={x.label} rows={2} value={f[x.key]} onChange={(e) => setF({ ...f, [x.key]: e.target.value })} placeholder={x.ph} />)}
      </div>
      <section aria-labelledby="neg-opts" className="rounded-2xl border border-line bg-surface p-4">
        <h4 id="neg-opts" className="font-serif font-bold">可能的互利方案</h4>
        <p className="text-xs text-muted">為每個方案評估：對我的好處、對對方的好處、可行性（1–5）。</p>
        <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (!opt.trim()) return; setF((x) => ({ ...x, options: [...x.options, { id: uid(), text: opt.trim(), mine: 3, theirs: 3, feasible: 3 }] })); setOpt(''); }}>
          <label htmlFor="neg-opt" className="sr-only">新增方案</label>
          <input id="neg-opt" className="field" value={opt} onChange={(e) => setOpt(e.target.value)} placeholder="例如：週六回家吃午餐，下午回來讀書" />
          <button className="btn-secondary shrink-0" type="submit" disabled={!opt.trim()}><Plus className="h-4 w-4" aria-hidden />新增</button>
        </form>
        {f.options.length > 0 && (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[34rem] text-left text-sm">
              <caption className="sr-only">協商方案比較表</caption>
              <thead className="text-xs text-muted"><tr><th scope="col" className="py-1">方案</th><th scope="col">評分</th><th scope="col">互利指標</th><th scope="col"><span className="sr-only">刪除</span></th></tr></thead>
              <tbody>
                {sorted.map((o, i) => (
                  <tr key={o.id} className={`border-t border-line align-top ${i === 0 && f.options.length > 1 ? 'bg-soft/60' : ''}`}>
                    <th scope="row" className="py-2 pr-2 font-normal">{i === 0 && f.options.length > 1 && <span className="chip mr-1">目前最互利</span>}{o.text}</th>
                    <td className="py-2"><div className="flex flex-wrap gap-2"><Score label="我" value={o.mine} onChange={(v) => setOption(o.id, { mine: v })} /><Score label="對方" value={o.theirs} onChange={(v) => setOption(o.id, { theirs: v })} /><Score label="可行性" value={o.feasible} onChange={(v) => setOption(o.id, { feasible: v })} /></div></td>
                    <td className="py-2 font-display">{mutualScore(o)}</td>
                    <td className="py-2"><button className="icon-btn h-7 w-7" aria-label={`移除方案：${o.text}`} onClick={() => setF((x) => ({ ...x, options: x.options.filter((y) => y.id !== o.id) }))}><X className="h-3.5 w-3.5" aria-hidden /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-muted">互利指標 = 雙方分數中較低者 × 2 ＋ 可行性。用較低者計算，是為了避免「一方大贏、一方大輸」的方案排在前面。這只是參考，最後仍由你判斷。</p>
          </div>
        )}
      </section>
      <p className="rounded-xl bg-apricot/25 px-3 py-2 text-sm leading-relaxed">雙贏需要考慮實際的權力關係與利益分配。如果對方不願合作、存在明顯的不對等，或你感到不安全，拒絕合作、暫停協商，或尋求主管、人資、調解等第三方協助，也都是合理的選擇。</p>
      <TextArea label="我的備註與下一步" rows={2} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} />
      <div className="flex gap-2">
        <button className="btn-primary" onClick={save} disabled={!f.situation.trim()}>{editing ? '儲存修改' : '儲存協商紀錄'}</button>
        {editing && <button className="btn-ghost" onClick={() => { setEditing(null); setF(blank); }}>取消編輯</button>}
      </div>
      {data.negotiations.length === 0 ? <EmptyState title="還沒有協商紀錄" /> : (
        <ul className="space-y-2">
          {data.negotiations.map((n) => {
            const best = [...n.options].sort((a, b) => mutualScore(b) - mutualScore(a))[0];
            return (
              <EntryCard key={n.id} title={n.situation} at={n.updatedAt} actions={<>
                <button className="icon-btn h-9 w-9" aria-label="編輯協商紀錄" onClick={() => { setEditing(n); setF({ situation: n.situation, myNeeds: n.myNeeds, theirNeeds: n.theirNeeds, commonGoal: n.commonGoal, boundaries: n.boundaries, flexible: n.flexible, options: n.options, note: n.note }); window.scrollBy({ top: -9999, behavior: 'smooth' }); }}><Pencil className="h-4 w-4" aria-hidden /></button>
                <DeleteButton collection="negotiations" id={n.id} label="協商紀錄" />
              </>}>
                {n.commonGoal && <p><span className="text-muted">共同目標：</span>{n.commonGoal}</p>}
                <p><span className="text-muted">方案：</span>{n.options.length} 個{best && `，目前最互利：${best.text}`}</p>
              </EntryCard>
            );
          })}
        </ul>
      )}
    </div>
  );
}
