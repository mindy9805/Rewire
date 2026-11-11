/**
 * Habit 01 工具：認可依賴覺察器
 * 記錄一個近期決策並回答五個問題；可編輯、刪除。
 */
import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { useToast } from '../ui/Toast';
import { TextArea, TextField } from '../ui/basics';
import { nowIso, uid } from '../../lib/id';
import type { ValidationEntry } from '../../types';
import { DeleteButton, EntryCard } from './EntryList';
import PracticeAffirmation from './PracticeAffirmation';

const Q: { key: keyof Omit<ValidationEntry, 'id' | 'kind' | 'habitId' | 'createdAt' | 'updatedAt' | 'decision'>; q: string }[] = [
  { key: 'wanted', q: '1. 我原本真正想做什麼？' },
  { key: 'worry', q: '2. 我擔心別人如何評價？' },
  { key: 'values', q: '3. 這個決定符合我的價值觀嗎？' },
  { key: 'without', q: '4. 如果沒有他人的認可，我還會做同樣的選擇嗎？' },
  { key: 'balance', q: '5. 我可以如何兼顧自己與他人的需求？' },
];
const blank = { decision: '', wanted: '', worry: '', values: '', without: '', balance: '' };

export default function ValidationTool({ affirmationIds }: { affirmationIds: number[] }) {
  const { data, upsert } = useStore();
  const toast = useToast();
  const [f, setF] = useState(blank);
  const [editing, setEditing] = useState<ValidationEntry | null>(null);
  const [done, setDone] = useState(false);
  const list = data.patternEntries.filter((e): e is ValidationEntry => e.kind === 'validation');

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.decision.trim()) return;
    const t = nowIso();
    upsert('patternEntries', editing ? { ...editing, ...f, updatedAt: t } : { id: uid(), kind: 'validation', habitId: 'approval', ...f, createdAt: t, updatedAt: t });
    toast(editing ? '已更新紀錄' : '已儲存這次的覺察');
    setF(blank);
    setEditing(null);
    setDone(true);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={save} className="space-y-3">
        <TextField label="最近的一個決策" required value={f.decision} onChange={(e) => setF({ ...f, decision: e.target.value })} placeholder="例如：答應週末幫同事代班" />
        {Q.map(({ key, q }) => <TextArea key={key} label={q} rows={2} value={f[key]} onChange={(e) => setF({ ...f, [key]: e.target.value })} />)}
        <div className="flex gap-2">
          <button className="btn-primary" type="submit" disabled={!f.decision.trim()}>{editing ? '儲存修改' : '儲存覺察紀錄'}</button>
          {editing && <button type="button" className="btn-ghost" onClick={() => { setEditing(null); setF(blank); }}>取消編輯</button>}
        </div>
      </form>
      <p className="rounded-xl bg-soft/70 px-3 py-2 text-xs">行動練習：每天做出一個符合自己價值觀的小決定。在乎別人的感受很正常，目標是讓自己的價值也有一席之地。</p>
      {done && <PracticeAffirmation ids={affirmationIds} onClose={() => setDone(false)} />}
      {list.length > 0 && (
        <ul className="space-y-2">
          {list.map((v) => (
            <EntryCard key={v.id} title={v.decision} at={v.updatedAt} actions={<>
              <button className="icon-btn h-9 w-9" aria-label="編輯這筆覺察紀錄" onClick={() => { setEditing(v); setF({ decision: v.decision, wanted: v.wanted, worry: v.worry, values: v.values, without: v.without, balance: v.balance }); }}><Pencil className="h-4 w-4" aria-hidden /></button>
              <DeleteButton collection="patternEntries" id={v.id} label="覺察紀錄" />
            </>}>
              {Q.map(({ key, q }) => v[key] && <p key={key}><span className="text-muted">{q.slice(3)}</span> {v[key]}</p>)}
            </EntryCard>
          ))}
        </ul>
      )}
    </div>
  );
}
