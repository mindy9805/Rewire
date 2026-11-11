/**
 * 習慣七工具：四維成長儀表板
 * - 自訂各面向重視程度（1–5，不強制相同權重）與行動目標；價值與意義面向可自訂名稱。
 * - 每週自我評估（1–10）＋雷達圖、每週反思與目標調整。
 * - 習慣追蹤（最近七天）、休息與恢復紀錄。
 */
import { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { useStore } from '../../store/AppStore';
import { useToast } from '../ui/Toast';
import { TextArea, TextField } from '../ui/basics';
import { renewDims, restKinds } from '../../content/habits7';
import { nowIso, uid } from '../../lib/id';
import { formatDate, shortDate, toDateKey, lastNDays } from '../../lib/date';
import { renewalRadar, weekKey } from '../../lib/habits7';
import type { RenewDim } from '../../types';
import { DeleteButton } from '../pattern/EntryList';

export default function RenewalTool() {
  const { data, update, upsert, remove } = useStore();
  const toast = useToast();
  const s = data.renewalSettings;
  const label = (d: RenewDim) => (d === 'spiritual' ? s.spiritualLabel || '價值與意義' : renewDims.find((x) => x.id === d)!.label);
  const wk = weekKey();
  const thisWeek = data.renewalChecks.find((c) => c.weekKey === wk);
  const [scores, setScores] = useState<Record<RenewDim, number>>(thisWeek?.scores ?? { physical: 5, mental: 5, spiritual: 5, social: 5 });
  const [reflection, setReflection] = useState(thisWeek?.reflection ?? '');
  const [adjustment, setAdjustment] = useState(thisWeek?.adjustment ?? '');
  const [habitText, setHabitText] = useState('');
  const [habitDim, setHabitDim] = useState<RenewDim>('physical');
  const [rest, setRest] = useState({ kind: restKinds[1], minutes: 20, note: '' });
  const radar = renewalRadar(data, label);
  const today = toDateKey();
  const days = lastNDays(7);
  const setS = (patch: Partial<typeof s>) => update((p) => ({ ...p, renewalSettings: { ...p.renewalSettings, ...patch } }));

  const saveCheck = () => {
    const t = nowIso();
    upsert('renewalChecks', { id: thisWeek?.id ?? uid(), weekKey: wk, scores, reflection: reflection.trim(), adjustment: adjustment.trim(), createdAt: thisWeek?.createdAt ?? t, updatedAt: t });
    toast(thisWeek ? '已更新本週自評' : '已儲存本週自評');
  };
  const toggleHabit = (hid: string) => {
    const log = data.renewalHabitLogs.find((l) => l.habitId === hid && l.date === today);
    if (log) { remove('renewalHabitLogs', log.id); toast('已取消今天的勾選', 'info'); } else { upsert('renewalHabitLogs', { id: uid(), habitId: hid, date: today }); toast('今天也照顧了自己 ✓'); }
  };

  return (
    <div className="space-y-6">
      <section aria-labelledby="rn-set" className="rounded-2xl border border-line bg-surface p-4">
        <h4 id="rn-set" className="font-serif text-lg font-bold">設定：重視程度與行動目標</h4>
        <p className="text-sm text-muted">四個面向不需要相同權重，請依目前的人生階段調整。</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {renewDims.map((d) => (
            <div key={d.id} className="rounded-xl bg-soft/50 p-3">
              <p className="font-medium">{label(d.id)} <span className="text-xs font-normal text-muted">（{d.items.join('、')}）</span></p>
              {d.id === 'spiritual' && (
                <div className="mt-2"><TextField label="自訂這個面向的名稱（可依信仰或非宗教價值觀）" defaultValue={s.spiritualLabel} onBlur={(e) => e.target.value.trim() !== s.spiritualLabel && setS({ spiritualLabel: e.target.value.trim() || '價值與意義' })} /></div>
              )}
              <label htmlFor={`w-${d.id}`} className="mt-2 block text-sm">重視程度：{s.weights[d.id]}／5</label>
              <input id={`w-${d.id}`} type="range" min={1} max={5} value={s.weights[d.id]} onChange={(e) => setS({ weights: { ...s.weights, [d.id]: Number(e.target.value) } })} className="w-full accent-[rgb(var(--accent))]" />
              <label htmlFor={`g-${d.id}`} className="mt-1 block text-sm">行動目標（離開欄位時自動儲存）</label>
              <input id={`g-${d.id}`} className="field mt-1 text-sm" defaultValue={s.goals[d.id]} placeholder="例如：每週運動三次" onBlur={(e) => e.target.value !== s.goals[d.id] && (setS({ goals: { ...s.goals, [d.id]: e.target.value } }), toast('已儲存目標'))} />
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="rn-check" className="rounded-2xl border border-line bg-surface p-4">
        <h4 id="rn-check" className="font-serif text-lg font-bold">每週自我評估（{formatDate(wk)} 這週）</h4>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {renewDims.map((d) => (
            <div key={d.id}>
              <label htmlFor={`sc-${d.id}`} className="text-sm">{label(d.id)}：{scores[d.id]}／10</label>
              <input id={`sc-${d.id}`} type="range" min={1} max={10} value={scores[d.id]} onChange={(e) => setScores((x) => ({ ...x, [d.id]: Number(e.target.value) }))} className="w-full accent-[rgb(var(--accent))]" />
            </div>
          ))}
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <TextArea label="每週反思：這週哪個面向被照顧得最好？哪個最需要關心？" rows={2} value={reflection} onChange={(e) => setReflection(e.target.value)} />
          <TextArea label="目標調整：下週想怎麼調整？" rows={2} value={adjustment} onChange={(e) => setAdjustment(e.target.value)} />
        </div>
        <button className="btn-primary mt-3" onClick={saveCheck}>{thisWeek ? '更新本週自評' : '儲存本週自評'}</button>
        <figure className="mt-4">
          <figcaption className="text-center text-xs text-muted">個人成長雷達圖（自評 1–10，{radar.count ? `共 ${radar.count} 週紀錄` : '尚無紀錄'}）</figcaption>
          {radar.count === 0 ? <p className="py-6 text-center text-sm text-muted">完成第一次每週自評後，這裡會顯示雷達圖。</p> : (
            <div className="h-64">
              <ResponsiveContainer>
                <RadarChart data={radar.rows} outerRadius="70%">
                  <PolarGrid stroke="rgb(var(--line))" />
                  <PolarAngleAxis dataKey="dim" tick={{ fontSize: 12, fill: 'rgb(var(--ink))' }} />
                  <PolarRadiusAxis domain={[0, 10]} tick={{ fontSize: 10, fill: 'rgb(var(--muted))' }} />
                  <Radar name="本次" dataKey="本次" stroke="#36594B" fill="#36594B" fillOpacity={0.35} isAnimationActive={false} />
                  {radar.prev && <Radar name="上次" dataKey="上次" stroke="#C9A88A" fill="#C9A88A" fillOpacity={0.15} isAnimationActive={false} />}
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: 'rgb(var(--surface))', border: '1px solid rgb(var(--line))', borderRadius: 12, fontSize: 12 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
          <p className="text-xs text-muted">雷達圖只呈現你的自評，不是健康或能力的測量；各面向理想的平衡因人而異。</p>
        </figure>
      </section>

      <section aria-labelledby="rn-habits" className="rounded-2xl border border-line bg-surface p-4">
        <h4 id="rn-habits" className="font-serif text-lg font-bold">習慣追蹤</h4>
        <form className="mt-2 grid gap-2 sm:grid-cols-[10rem_1fr_auto] sm:items-end" onSubmit={(e) => { e.preventDefault(); if (!habitText.trim()) return; upsert('renewalHabits', { id: uid(), dim: habitDim, text: habitText.trim(), active: true, createdAt: nowIso() }); setHabitText(''); toast('已新增習慣'); }}>
          <div>
            <label htmlFor="rh-dim" className="field-label">面向</label>
            <select id="rh-dim" className="field" value={habitDim} onChange={(e) => setHabitDim(e.target.value as RenewDim)}>{renewDims.map((d) => <option key={d.id} value={d.id}>{label(d.id)}</option>)}</select>
          </div>
          <TextField label="習慣" value={habitText} onChange={(e) => setHabitText(e.target.value)} placeholder="例如：睡前讀 10 頁書" />
          <button className="btn-secondary" type="submit" disabled={!habitText.trim()}><Plus className="h-4 w-4" aria-hidden />新增</button>
        </form>
        <ul className="mt-3 space-y-2">
          {data.renewalHabits.map((h) => {
            const doneToday = data.renewalHabitLogs.some((l) => l.habitId === h.id && l.date === today);
            return (
              <li key={h.id} className="rounded-xl bg-soft/40 p-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="chip">{label(h.dim)}</span>
                  <span className="flex-1">{h.text}</span>
                  <button className={doneToday ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'} aria-pressed={doneToday} onClick={() => toggleHabit(h.id)}><Check className="h-4 w-4" aria-hidden />{doneToday ? '今天已完成' : '今天完成'}</button>
                  <DeleteButton collection="renewalHabits" id={h.id} label="習慣" />
                </div>
                <ol className="mt-2 flex gap-1" aria-label={`「${h.text}」最近七天`}>
                  {days.map((d) => {
                    const ok = data.renewalHabitLogs.some((l) => l.habitId === h.id && l.date === d);
                    return <li key={d} className="flex flex-col items-center text-[10px] text-muted"><span className={`h-5 w-5 rounded-full ${ok ? 'bg-accent' : 'border border-line'}`} aria-hidden />{shortDate(d)}<span className="sr-only">{ok ? '完成' : '未記錄'}</span></li>;
                  })}
                </ol>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="rn-rest" className="rounded-2xl border border-line bg-surface p-4">
        <h4 id="rn-rest" className="font-serif text-lg font-bold">休息與恢復紀錄</h4>
        <p className="text-sm text-muted">休息也是成長的一部分。記錄真正讓你恢復的活動。</p>
        <form className="mt-2 grid gap-2 sm:grid-cols-[10rem_7rem_1fr_auto] sm:items-end" onSubmit={(e) => { e.preventDefault(); upsert('restLogs', { id: uid(), date: today, ...rest, note: rest.note.trim(), createdAt: nowIso() }); setRest({ ...rest, note: '' }); toast('已記錄休息 🌿'); }}>
          <div>
            <label htmlFor="rs-kind" className="field-label">類型</label>
            <select id="rs-kind" className="field" value={rest.kind} onChange={(e) => setRest({ ...rest, kind: e.target.value })}>{restKinds.map((k) => <option key={k}>{k}</option>)}</select>
          </div>
          <TextField label="分鐘" type="number" min={1} value={rest.minutes} onChange={(e) => setRest({ ...rest, minutes: Math.max(1, Number(e.target.value) || 1) })} />
          <TextField label="感受（選填）" value={rest.note} onChange={(e) => setRest({ ...rest, note: e.target.value })} />
          <button className="btn-secondary" type="submit">記錄</button>
        </form>
        <ul className="mt-3 space-y-1.5">
          {[...data.restLogs].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8).map((r) => (
            <li key={r.id} className="flex items-center gap-2 rounded-xl bg-soft/40 px-3 py-1.5 text-sm">
              <span className="flex-1">{formatDate(r.date)}・{r.kind} {r.minutes} 分鐘{r.note && `・${r.note}`}</span>
              <DeleteButton collection="restLogs" id={r.id} label="休息紀錄" />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
