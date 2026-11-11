/**
 * If-Then 行動計畫產生器（第 8 章）
 * 填寫目標、情境、行動、障礙、備用方案，自動產生可儲存、編輯、複製的行動計畫。
 */
import { useState } from 'react';
import { Copy, Pencil, Trash2 } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { useToast } from '../ui/Toast';
import { useConfirm } from '../ui/Confirm';
import { EmptyState, TextField } from '../ui/basics';
import { copyText } from '../../lib/clipboard';
import { nowIso, uid } from '../../lib/id';
import { formatDateTime } from '../../lib/date';
import type { IfThenPlan } from '../../types';

type Form = Omit<IfThenPlan, 'id' | 'createdAt' | 'updatedAt'>;
const blank: Form = { goal: '', situation: '', action: '', obstacle: '', backup: '' };

/** 將欄位組合成完整的行動計畫文字 */
export function planText(p: Form): string {
  const lines = [`🎯 目標：${p.goal || '（未填）'}`, `如果${p.situation || '……'}，我就${p.action || '……'}。`];
  if (p.obstacle || p.backup) lines.push(`如果遇到${p.obstacle || '障礙'}，我會改為${p.backup || '……'}。`);
  return lines.join('\n');
}

export default function IfThenPlanner() {
  const { data, upsert, remove } = useStore();
  const toast = useToast();
  const confirm = useConfirm();
  const [form, setForm] = useState<Form>(blank);
  const [editing, setEditing] = useState<IfThenPlan | null>(null);
  const valid = form.goal.trim() && form.situation.trim() && form.action.trim();
  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    const t = nowIso();
    upsert('plans', editing ? { ...editing, ...form, updatedAt: t } : { id: uid(), ...form, createdAt: t, updatedAt: t });
    toast(editing ? '已更新行動計畫' : '已儲存行動計畫');
    setForm(blank);
    setEditing(null);
  };
  const copy = async (p: Form) => toast((await copyText(planText(p))) ? '已複製行動計畫' : '複製失敗', 'info');

  return (
    <div className="space-y-6">
      <form onSubmit={save} className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
        <p className="mb-3 font-serif font-bold">{editing ? '編輯行動計畫' : '建立 If-Then 行動計畫'}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2"><TextField label="我的目標" required value={form.goal} onChange={set('goal')} placeholder="例如：每週運動三次" /></div>
          <TextField label="可能出現的情境（如果……）" required value={form.situation} onChange={set('situation')} placeholder="例如：週一三五晚上 8 點吃完晚餐" hint="越具體越好：時間、地點、前一個動作" />
          <TextField label="準備執行的行動（我就……）" required value={form.action} onChange={set('action')} placeholder="例如：換上運動鞋出門走 20 分鐘" hint="寫成看得見的動作" />
          <TextField label="可能遇到的障礙" value={form.obstacle} onChange={set('obstacle')} placeholder="例如：下雨或加班" />
          <TextField label="備用方案" value={form.backup} onChange={set('backup')} placeholder="例如：在家做 10 分鐘伸展" />
        </div>
        <div className="mt-4 rounded-xl bg-soft/70 p-3 text-sm" aria-live="polite">
          <p className="text-xs font-medium text-accent">即時預覽</p>
          <p className="mt-1 whitespace-pre-line">{planText(form)}</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn-primary" type="submit" disabled={!valid}>{editing ? '儲存修改' : '儲存計畫'}</button>
          <button className="btn-secondary" type="button" onClick={() => copy(form)} disabled={!valid}><Copy className="h-4 w-4" aria-hidden />複製</button>
          {editing && <button className="btn-ghost" type="button" onClick={() => { setEditing(null); setForm(blank); }}>取消編輯</button>}
        </div>
        {!valid && <p className="mt-2 text-xs text-muted">請至少填寫目標、情境與行動。</p>}
      </form>

      {data.plans.length === 0 ? (
        <EmptyState title="還沒有行動計畫" desc="寫下第一份 If-Then 計畫，讓目標連結到具體情境。" />
      ) : (
        <ul className="space-y-3">
          {data.plans.map((p) => (
            <li key={p.id} className="rounded-2xl border border-line bg-surface p-4">
              <p className="whitespace-pre-line text-sm leading-relaxed">{planText(p)}</p>
              <div className="mt-2 flex items-center gap-1">
                <span className="mr-auto text-xs text-muted">更新於 {formatDateTime(p.updatedAt)}</span>
                <button className="icon-btn" aria-label="複製這份計畫" onClick={() => copy(p)}><Copy className="h-4 w-4" aria-hidden /></button>
                <button className="icon-btn" aria-label="編輯這份計畫" onClick={() => { setEditing(p); setForm({ goal: p.goal, situation: p.situation, action: p.action, obstacle: p.obstacle, backup: p.backup }); }}><Pencil className="h-4 w-4" aria-hidden /></button>
                <button className="icon-btn" aria-label="刪除這份計畫" onClick={async () => { if (await confirm({ title: '刪除這份行動計畫？', message: '刪除後無法復原。', confirmText: '刪除', danger: true })) { remove('plans', p.id); toast('已刪除計畫'); } }}><Trash2 className="h-4 w-4" aria-hidden /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
