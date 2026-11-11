/**
 * 工具五：微小行動
 * 將大目標拆成微行動清單：可新增、勾選、刪除；提供拆解提示。
 */
import { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { useToast } from '../ui/Toast';
import { useConfirm } from '../ui/Confirm';
import { TextField } from '../ui/basics';
import { nowIso, uid } from '../../lib/id';
import type { SmallStepPlan } from '../../types';

const PROMPTS = ['準備：需要先拿出或打開什麼？', '2 分鐘版本：最小可以做到什麼程度？', '第一個看得見的動作是？', '完成後如何給自己一點回饋？'];

export default function SmallStepsTool() {
  const { data, upsert, remove } = useStore();
  const toast = useToast();
  const confirm = useConfirm();
  const [goal, setGoal] = useState('');
  const [steps, setSteps] = useState<string[]>(['']);

  const create = (e: React.FormEvent) => {
    e.preventDefault();
    const list = steps.map((s) => s.trim()).filter(Boolean);
    if (!goal.trim() || !list.length) return;
    upsert('smallSteps', { id: uid(), goal: goal.trim(), steps: list.map((text) => ({ id: uid(), text, done: false })), createdAt: nowIso() });
    toast('已建立微行動清單');
    setGoal(''); setSteps(['']);
  };
  const toggle = (p: SmallStepPlan, sid: string) => {
    const next = { ...p, steps: p.steps.map((s) => (s.id === sid ? { ...s, done: !s.done } : s)) };
    upsert('smallSteps', next);
    if (next.steps.find((s) => s.id === sid)?.done) toast('完成一個小步驟 ✓');
  };

  return (
    <div className="space-y-5">
      <form onSubmit={create} className="space-y-3">
        <TextField label="大目標" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="例如：完成期末報告" required />
        <fieldset>
          <legend className="field-label">拆成微行動（每一步都小到不太可能失敗）</legend>
          <p className="mb-2 text-xs text-muted">提示：{PROMPTS.join('／')}</p>
          <div className="space-y-2">
            {steps.map((s, i) => (
              <div key={i} className="flex gap-2">
                <label htmlFor={`step-${i}`} className="sr-only">第 {i + 1} 步</label>
                <input id={`step-${i}`} className="field" value={s} placeholder={i === 0 ? '例如：打開檔案，寫下標題' : `第 ${i + 1} 步`} onChange={(e) => setSteps((x) => x.map((v, j) => (j === i ? e.target.value : v)))} />
                {steps.length > 1 && <button type="button" className="icon-btn shrink-0" aria-label={`移除第 ${i + 1} 步`} onClick={() => setSteps((x) => x.filter((_, j) => j !== i))}><X className="h-4 w-4" aria-hidden /></button>}
              </div>
            ))}
          </div>
          <button type="button" className="btn-ghost btn-sm mt-2" onClick={() => setSteps((x) => [...x, ''])}><Plus className="h-4 w-4" aria-hidden />新增一步</button>
        </fieldset>
        <button className="btn-primary" type="submit" disabled={!goal.trim() || !steps.some((s) => s.trim())}>建立清單</button>
      </form>
      {data.smallSteps.map((p) => {
        const done = p.steps.filter((s) => s.done).length;
        return (
          <div key={p.id} className="rounded-2xl border border-line bg-surface p-4">
            <div className="flex items-start gap-2">
              <p className="flex-1 font-medium">{p.goal}<span className="ml-2 text-xs text-muted">{done}/{p.steps.length}</span></p>
              <button className="icon-btn" aria-label={`刪除清單：${p.goal}`} onClick={async () => { if (await confirm({ title: '刪除這份微行動清單？', confirmText: '刪除', danger: true })) { remove('smallSteps', p.id); toast('已刪除清單'); } }}><Trash2 className="h-4 w-4" aria-hidden /></button>
            </div>
            <ul className="mt-2 space-y-1">
              {p.steps.map((s) => (
                <li key={s.id}>
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <input type="checkbox" className="h-4 w-4 accent-[rgb(var(--accent))]" checked={s.done} onChange={() => toggle(p, s.id)} />
                    <span className={s.done ? 'text-muted line-through' : ''}>{s.text}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
