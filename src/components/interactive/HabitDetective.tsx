/**
 * 習慣偵探 Habit Detective（第 5 章）
 * 記錄習慣的情境、情緒、提示、需求、回饋、代價與替代行動；可編輯、刪除，並統計常見提示與情緒。
 */
import { useState } from 'react';
import { Pencil, Trash2, Search } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { useToast } from '../ui/Toast';
import { useConfirm } from '../ui/Confirm';
import { EmptyState, TextArea, TextField } from '../ui/basics';
import { nowIso, uid } from '../../lib/id';
import { formatDateTime } from '../../lib/date';
import type { HabitLog } from '../../types';

type Form = Omit<HabitLog, 'id' | 'createdAt' | 'updatedAt'>;
const blank: Form = { behavior: '', time: '', place: '', emotion: '', cue: '', need: '', reward: '', cost: '', alternative: '' };
const fields: { key: keyof Form; label: string; ph: string; long?: boolean }[] = [
  { key: 'behavior', label: '我做了什麼？', ph: '例如：滑手機 40 分鐘' },
  { key: 'time', label: '發生時間', ph: '例如：晚上 11 點、下班後' },
  { key: 'place', label: '發生地點', ph: '例如：床上' },
  { key: 'emotion', label: '當時情緒', ph: '例如：疲倦、焦慮' },
  { key: 'cue', label: '觸發提示', ph: '例如：躺上床、收到通知' },
  { key: 'need', label: '當時真正的需求', ph: '例如：想放鬆、不想面對明天的報告' },
  { key: 'reward', label: '行為提供的立即回饋', ph: '例如：暫時不用想煩惱', long: true },
  { key: 'cost', label: '行為造成的長期成本', ph: '例如：睡太晚、隔天沒精神', long: true },
  { key: 'alternative', label: '下一次準備採取的替代行動', ph: '例如：手機放客廳充電，躺床後聽 10 分鐘音樂', long: true },
];

/** 計算最常出現的值（簡單字串比對） */
function topValues(logs: HabitLog[], key: keyof Form) {
  const c: Record<string, number> = {};
  logs.forEach((l) => l[key].split(/[、,，\s]+/).filter(Boolean).forEach((v) => (c[v] = (c[v] ?? 0) + 1)));
  return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 4);
}

export default function HabitDetective() {
  const { data, upsert, remove } = useStore();
  const toast = useToast();
  const confirm = useConfirm();
  const [form, setForm] = useState<Form>(blank);
  const [editing, setEditing] = useState<HabitLog | null>(null);
  const logs = data.habitLogs;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.behavior.trim()) return;
    const t = nowIso();
    upsert('habitLogs', editing ? { ...editing, ...form, updatedAt: t } : { id: uid(), ...form, createdAt: t, updatedAt: t });
    toast(editing ? '已更新紀錄' : '已新增一筆習慣紀錄 🔍');
    setForm(blank);
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
        <p className="mb-3 flex items-center gap-2 font-serif font-bold">
          <Search className="h-4 w-4 text-accent" aria-hidden />
          {editing ? '編輯紀錄' : '新增一筆觀察'}
        </p>
        <p className="mb-4 text-sm text-muted">用好奇心取代責備：每一筆紀錄都是理解自己的線索。</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {fields.map((f) =>
            f.long ? (
              <div key={f.key} className="sm:col-span-2">
                <TextArea label={f.label} placeholder={f.ph} rows={2} value={form[f.key]} onChange={(e) => setForm((x) => ({ ...x, [f.key]: e.target.value }))} required={f.key === 'behavior'} />
              </div>
            ) : (
              <TextField key={f.key} label={f.label} placeholder={f.ph} value={form[f.key]} onChange={(e) => setForm((x) => ({ ...x, [f.key]: e.target.value }))} required={f.key === 'behavior'} />
            ),
          )}
        </div>
        <div className="mt-4 flex gap-2">
          <button type="submit" className="btn-primary" disabled={!form.behavior.trim()}>{editing ? '儲存修改' : '新增紀錄'}</button>
          {editing && <button type="button" className="btn-ghost" onClick={() => { setEditing(null); setForm(blank); }}>取消編輯</button>}
        </div>
      </form>

      {logs.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {(['cue', 'emotion'] as const).map((k) => (
            <div key={k} className="rounded-2xl bg-soft/60 p-4 text-sm">
              <p className="font-medium">{k === 'cue' ? '最常見的觸發提示' : '最常見的情緒'}</p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {topValues(logs, k).map(([v, n]) => <li key={v} className="chip">{v} × {n}</li>)}
                {topValues(logs, k).length === 0 && <li className="text-muted">尚未填寫</li>}
              </ul>
            </div>
          ))}
        </div>
      )}

      {logs.length === 0 ? (
        <EmptyState title="還沒有習慣紀錄" desc="下次習慣出現時，花一分鐘記下來，就能慢慢看見它的模式。" />
      ) : (
        <ul className="space-y-3">
          {logs.map((l) => (
            <li key={l.id} className="rounded-2xl border border-line bg-surface p-4 text-sm">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <p className="font-medium">{l.behavior}</p>
                  <p className="text-xs text-muted">{formatDateTime(l.createdAt)}{l.time && ` · ${l.time}`}{l.place && ` · ${l.place}`}</p>
                </div>
                <button className="icon-btn" aria-label="編輯這筆紀錄" onClick={() => { setEditing(l); setForm({ behavior: l.behavior, time: l.time, place: l.place, emotion: l.emotion, cue: l.cue, need: l.need, reward: l.reward, cost: l.cost, alternative: l.alternative }); window.scrollBy({ top: -9999, behavior: 'smooth' }); }}>
                  <Pencil className="h-4 w-4" aria-hidden />
                </button>
                <button className="icon-btn" aria-label="刪除這筆紀錄" onClick={async () => { if (await confirm({ title: '刪除這筆習慣紀錄？', message: '刪除後無法復原。', confirmText: '刪除', danger: true })) { remove('habitLogs', l.id); toast('已刪除紀錄'); } }}>
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </div>
              <dl className="mt-2 grid gap-x-4 gap-y-1 sm:grid-cols-2">
                {fields.slice(3).map((f) => l[f.key] && (
                  <div key={f.key}>
                    <dt className="inline text-muted">{f.label}：</dt>
                    <dd className="inline">{l[f.key]}</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
