/**
 * 今日心智練習紀錄表單
 * 欄位：最有感觸的句子、為什麼有意義、今天的小行動、情緒狀態。
 * 一天一筆，可重新編輯；儲存至 LocalStorage 的 dailyLogs。
 */
import { useState } from 'react';
import { affirmations } from '../../content/dailyRewire';
import { useStore } from '../../store/AppStore';
import { useToast } from '../ui/Toast';
import { MoodPicker, TextArea, TextField } from '../ui/basics';
import { getDailyLog } from '../../lib/daily';
import { nowIso } from '../../lib/id';
import { formatDate, toDateKey } from '../../lib/date';
import type { DailyLog } from '../../types';

export default function DailyLogForm({ date = toDateKey(), markCompleted = false, onSaved }: { date?: string; markCompleted?: boolean; onSaved?: () => void }) {
  const { data, upsert } = useStore();
  const toast = useToast();
  const existing = getDailyLog(data, date);
  const [form, setForm] = useState<DailyLog>(existing);
  const set = <K extends keyof DailyLog>(k: K, v: DailyLog[K]) => setForm((f) => ({ ...f, [k]: v }));

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    // 以「日期」為準合併：若同一天已有紀錄（例如朗讀完成時剛建立），沿用其 id，避免同日重複兩筆
    const current = data.dailyLogs.find((l) => l.date === date);
    const saved: DailyLog = {
      ...form,
      id: current?.id ?? form.id,
      createdAt: current?.createdAt ?? form.createdAt,
      completedReading: form.completedReading || markCompleted || !!current?.completedReading,
      // 保留其他頁面（例如打破慣性練習後）設定的「今日練習句」
      practiceId: current?.practiceId ?? form.practiceId ?? 0,
      updatedAt: nowIso(),
    };
    upsert('dailyLogs', saved);
    setForm(saved);
    toast('已儲存今日練習 🌱');
    onSaved?.();
  };

  return (
    <form onSubmit={save} className="space-y-4">
      <p className="text-sm text-muted">紀錄日期：{formatDate(date)}</p>
      <fieldset>
        <legend className="field-label">今天最有感觸的是哪一句？</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {affirmations.map((a) => (
            <label key={a.id} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${form.favoriteId === a.id ? 'border-accent bg-soft' : 'border-line bg-bg hover:border-accent/60'}`}>
              <input type="radio" name={`fav-${date}`} className="accent-[rgb(var(--accent))]" checked={form.favoriteId === a.id} onChange={() => set('favoriteId', a.id)} />
              <span className="font-display italic text-sage">{String(a.id).padStart(2, '0')}</span>
              {a.text}
            </label>
          ))}
        </div>
      </fieldset>
      <TextArea label="為什麼這句話對我有意義？" value={form.why} onChange={(e) => set('why', e.target.value)} placeholder="也可以寫下「今天沒有特別的感覺」，這也是真實的紀錄。" />
      <TextField label="今天準備採取什麼小行動？" value={form.action} onChange={(e) => set('action', e.target.value)} placeholder="例如：午餐後散步 5 分鐘" />
      <MoodPicker label="今天的情緒狀態" value={form.mood} onChange={(v) => set('mood', v)} />
      <TextField label="用一兩個詞描述情緒（選填）" value={form.moodWords} onChange={(e) => set('moodWords', e.target.value)} placeholder="例如：有點疲倦、但平靜" />
      <div className="flex flex-wrap gap-2">
        <button type="submit" className="btn-primary">儲存今日練習</button>
        {!markCompleted && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="h-4 w-4 accent-[rgb(var(--accent))]" checked={form.completedReading} onChange={(e) => set('completedReading', e.target.checked)} />
            已完成七句朗讀
          </label>
        )}
      </div>
    </form>
  );
}
