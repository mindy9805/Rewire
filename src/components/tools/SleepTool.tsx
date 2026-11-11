/**
 * 工具七：睡眠與記憶鞏固
 * 簡易睡眠紀錄（就寢、起床、主觀品質）與趨勢圖。⚠️ 非醫療診斷工具。
 */
import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useStore } from '../../store/AppStore';
import { useToast } from '../ui/Toast';
import { useConfirm } from '../ui/Confirm';
import { EmptyState, TextField } from '../ui/basics';
import { nowIso, uid } from '../../lib/id';
import { formatDate, shortDate, sleepHours, toDateKey } from '../../lib/date';

const facts = [
  ['睡眠與記憶', '睡眠參與新學習的鞏固，白天練習的技能常在睡後更穩定。'],
  ['睡眠與情緒', '睡眠不足時，情緒反應較強、較難調節。'],
  ['睡眠與注意力', '睡眠不足會降低專注與反應速度。'],
  ['睡眠與自我調節', '疲憊時更容易選擇立即滿足的行為。'],
  ['規律作息', '固定的就寢與起床時間有助維持日夜節律。'],
];

export default function SleepTool() {
  const { data, upsert, remove } = useStore();
  const toast = useToast();
  const confirm = useConfirm();
  const [date, setDate] = useState(toDateKey());
  const [bed, setBed] = useState('23:30');
  const [wake, setWake] = useState('07:00');
  const [quality, setQuality] = useState(3);
  const [note, setNote] = useState('');
  const hours = sleepHours(bed, wake);
  const logs = [...data.sleepLogs].sort((a, b) => a.date.localeCompare(b.date));
  const chart = logs.slice(-14).map((l) => ({ date: shortDate(l.date), 睡眠時數: l.hours, 主觀品質: l.quality }));

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const existing = data.sleepLogs.find((l) => l.date === date);
    upsert('sleepLogs', { id: existing?.id ?? uid(), date, bedtime: bed, waketime: wake, hours, quality, note: note.trim(), createdAt: existing?.createdAt ?? nowIso() });
    toast(existing ? '已更新這天的睡眠紀錄' : '已新增睡眠紀錄');
    setNote('');
  };

  return (
    <div className="space-y-5">
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {facts.map(([t, d]) => (
          <li key={t} className="rounded-xl bg-soft/60 p-3 text-sm"><p className="font-medium">{t}</p><p className="text-muted">{d}</p></li>
        ))}
      </ul>
      <form onSubmit={save} className="rounded-2xl border border-line bg-surface p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <TextField label="日期（起床當天）" type="date" value={date} max={toDateKey()} onChange={(e) => setDate(e.target.value)} required />
          <TextField label="就寢時間" type="time" value={bed} onChange={(e) => setBed(e.target.value)} required />
          <TextField label="起床時間" type="time" value={wake} onChange={(e) => setWake(e.target.value)} required />
        </div>
        <div className="mt-3">
          <label htmlFor="sleep-q" className="field-label">主觀睡眠品質：{quality}／5</label>
          <input id="sleep-q" type="range" min={1} max={5} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full accent-[rgb(var(--accent))]" />
        </div>
        <div className="mt-3"><TextField label="備註（選填）" value={note} onChange={(e) => setNote(e.target.value)} placeholder="例如：睡前喝了咖啡" /></div>
        <p className="mt-3 text-sm">推算睡眠時數：<strong>{hours}</strong> 小時</p>
        <button className="btn-primary mt-3" type="submit">儲存紀錄</button>
      </form>
      {logs.length === 0 ? (
        <EmptyState title="還沒有睡眠紀錄" desc="連續記錄幾天後，這裡會顯示你的睡眠時數與品質趨勢。" />
      ) : (
        <>
          <figure className="rounded-2xl border border-line bg-surface p-3">
            <figcaption className="mb-1 text-center text-xs text-muted">最近 {chart.length} 筆睡眠紀錄（自我觀察用）</figcaption>
            <div className="h-60">
              <ResponsiveContainer>
                <LineChart data={chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="rgb(var(--line))" strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'rgb(var(--muted))' }} />
                  <YAxis yAxisId="h" domain={[0, 12]} tick={{ fontSize: 11, fill: 'rgb(var(--muted))' }} />
                  <YAxis yAxisId="q" orientation="right" domain={[0, 5]} hide />
                  <Tooltip contentStyle={{ background: 'rgb(var(--surface))', border: '1px solid rgb(var(--line))', borderRadius: 12, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line yAxisId="h" dataKey="睡眠時數" stroke="rgb(var(--accent))" strokeWidth={2.5} isAnimationActive={false} />
                  <Line yAxisId="q" dataKey="主觀品質" stroke="rgb(var(--sage))" strokeDasharray="5 4" isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </figure>
          <ul className="space-y-2">
            {[...logs].reverse().slice(0, 14).map((l) => (
              <li key={l.id} className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-sm">
                <span className="flex-1">{formatDate(l.date)}・{l.bedtime}–{l.waketime}・{l.hours} 小時・品質 {l.quality}{l.note && `・${l.note}`}</span>
                <button className="icon-btn" aria-label={`刪除 ${l.date} 的睡眠紀錄`} onClick={async () => { if (await confirm({ title: '刪除這筆睡眠紀錄？', confirmText: '刪除', danger: true })) { remove('sleepLogs', l.id); toast('已刪除'); } }}><Trash2 className="h-4 w-4" aria-hidden /></button>
              </li>
            ))}
          </ul>
        </>
      )}
      <p className="rounded-xl bg-apricot/30 px-3 py-2 text-xs leading-relaxed">⚠︎ 本紀錄僅供自我觀察，不是醫療診斷工具，無法評估睡眠障礙。若長期失眠、打鼾嚴重或白天極度疲倦，請諮詢醫療專業人員。</p>
    </div>
  );
}
