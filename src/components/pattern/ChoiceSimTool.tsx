/**
 * Habit 07 工具：短期與長期選擇模擬器
 * 輸入當下想做的事、立即好處、可能成本、長期目標與折衷方案 → 產生三個選項的比較表。
 * ⚠️ 不將娛樂判定為不良習慣：三個選項都可能是合理的選擇。
 */
import { useState } from 'react';
import { useStore } from '../../store/AppStore';
import { useToast } from '../ui/Toast';
import { TextField } from '../ui/basics';
import { nowIso, uid } from '../../lib/id';
import type { ChoiceSimEntry } from '../../types';
import { DeleteButton, EntryCard } from './EntryList';
import PracticeAffirmation from './PracticeAffirmation';

type Form = Pick<ChoiceSimEntry, 'want' | 'benefit' | 'cost' | 'goal' | 'compromise' | 'next'>;
const blank: Form = { want: '', benefit: '', cost: '', goal: '', compromise: '', next: '' };

/** 依輸入產生比較表的三列 */
export function choiceRows(f: Form) {
  return [
    { option: `照當下想做：${f.want || '……'}`, gain: f.benefit || '—', cost: f.cost || '—', fit: '享受當下；若偶爾為之、或今天特別需要放鬆，也可以是好的選擇。' },
    { option: `折衷方案：${f.compromise || '（尚未填寫）'}`, gain: '保留部分當下的享受', cost: '可能需要一點調整與自我提醒', fit: f.goal ? `同時照顧當下與「${f.goal}」。` : '同時照顧當下與長期需求。' },
    { option: `長期優先：先做和「${f.goal || '長期目標'}」有關的事`, gain: '往長期目標前進一小步', cost: '暫時放下當下想做的事', fit: '與長期目標最一致；完成後仍可安排休息與娛樂。' },
  ];
}

export default function ChoiceSimTool({ affirmationIds }: { affirmationIds: number[] }) {
  const { data, upsert } = useStore();
  const toast = useToast();
  const [f, setF] = useState<Form>(blank);
  const [shown, setShown] = useState(false);
  const [done, setDone] = useState(false);
  const list = data.patternEntries.filter((e): e is ChoiceSimEntry => e.kind === 'choice');
  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) => setF((x) => ({ ...x, [k]: e.target.value }));

  const save = () => {
    const t = nowIso();
    upsert('patternEntries', { id: uid(), kind: 'choice', habitId: 'shortterm', ...f, createdAt: t, updatedAt: t });
    toast('已儲存這次的選擇比較');
    setF(blank); setShown(false); setDone(true);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField label="當下想做的事" required value={f.want} onChange={set('want')} placeholder="例如：繼續看影片一小時" />
        <TextField label="立即獲得的好處" value={f.benefit} onChange={set('benefit')} placeholder="例如：放鬆、好玩" />
        <TextField label="可能付出的成本" value={f.cost} onChange={set('cost')} placeholder="例如：睡太晚、明天沒精神" />
        <TextField label="長期希望達成的目標" value={f.goal} onChange={set('goal')} placeholder="例如：每天睡滿 7 小時" />
        <TextField label="是否有折衷方案？" value={f.compromise} onChange={set('compromise')} placeholder="例如：先完成睡前準備，再看一集" />
        <TextField label="下一次可以怎麼選擇？" value={f.next} onChange={set('next')} placeholder="例如：關閉自動播放" />
      </div>
      <button className="btn-secondary" onClick={() => setShown(true)} disabled={!f.want.trim()}>產生比較表</button>
      {shown && f.want.trim() && (
        <div className="motion-safe:animate-fade-up">
          <div className="overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <caption className="sr-only">短期與長期選擇比較表</caption>
              <thead className="bg-soft/70">
                <tr><th scope="col" className="p-3">選項</th><th scope="col" className="p-3">立即好處</th><th scope="col" className="p-3">可能成本</th><th scope="col" className="p-3">與長期目標的關係</th></tr>
              </thead>
              <tbody>
                {choiceRows(f).map((r) => (
                  <tr key={r.option} className="border-t border-line bg-surface align-top">
                    <th scope="row" className="p-3 font-medium">{r.option}</th><td className="p-3">{r.gain}</td><td className="p-3">{r.cost}</td><td className="p-3">{r.fit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted">三個選項沒有絕對的對錯。練習的重點是「有意識地選擇」，讓享受與長期需求取得適合你的平衡。</p>
          <button className="btn-primary mt-3" onClick={save}>儲存這次比較</button>
        </div>
      )}
      {done && <PracticeAffirmation ids={affirmationIds} onClose={() => setDone(false)} />}
      {list.length > 0 && (
        <ul className="space-y-2">
          {list.map((c) => (
            <EntryCard key={c.id} title={c.want} at={c.createdAt} actions={<DeleteButton collection="patternEntries" id={c.id} label="選擇比較" />}>
              {c.goal && <p><span className="text-muted">長期目標：</span>{c.goal}</p>}
              {c.compromise && <p><span className="text-muted">折衷方案：</span>{c.compromise}</p>}
              {c.next && <p><span className="text-muted">下一次：</span>{c.next}</p>}
            </EntryCard>
          ))}
        </ul>
      )}
    </div>
  );
}
