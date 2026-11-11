/**
 * 習慣養成模擬器（第 6 章）
 * 依習慣難度與執行頻率，以漸近曲線繪製「假設性」的自動化發展過程。
 * 模型：自動化 = 100 × (1 − e^(−k × 執行次數))，k 依難度設定；中斷期間曲線暫停並略為下降。
 * ⚠️ 概念模型：模擬值不是經過驗證的個人神經變化數據。
 */
import { useMemo, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Disclaimer } from '../ui/basics';

const difficulties = [
  { id: 'easy', label: '簡單（例如：早餐後喝一杯水）', k: 0.075 },
  { id: 'medium', label: '中等（例如：午餐後散步 10 分鐘）', k: 0.045 },
  { id: 'hard', label: '困難（例如：晨跑 30 分鐘）', k: 0.025 },
];
const frequencies = [
  { id: '7', label: '每天', perWeek: 7 },
  { id: '5', label: '每週 5 天', perWeek: 5 },
  { id: '3', label: '每週 3 天', perWeek: 3 },
];

/** 依參數產生 0–200 天的模擬資料 */
export function simulate(k: number, perWeek: number, breakStart: number | null, days = 200) {
  const out: { day: number; value: number }[] = [];
  let reps = 0;
  for (let d = 0; d <= days; d++) {
    const inBreak = breakStart !== null && d >= breakStart && d < breakStart + 7;
    if (d > 0 && !inBreak && d % 7 < perWeek) reps += 1;
    if (inBreak) reps = Math.max(0, reps - 0.6); // 中斷時略為下降，而非歸零
    out.push({ day: d, value: Math.round(100 * (1 - Math.exp(-k * reps)) * 10) / 10 });
  }
  return out;
}

export default function HabitCurveSim() {
  const [diff, setDiff] = useState('medium');
  const [freq, setFreq] = useState('7');
  const [withBreak, setWithBreak] = useState(false);
  const k = difficulties.find((d) => d.id === diff)!.k;
  const perWeek = frequencies.find((f) => f.id === freq)!.perWeek;

  const rows = useMemo(() => {
    const mine = simulate(k, perWeek, withBreak ? 40 : null);
    const ref = simulate(difficulties[0].k, 7, null);
    return mine.filter((_, i) => i % 2 === 0).map((r) => ({ day: r.day, 你的設定: r.value, 參考_每天簡單: ref[r.day].value }));
  }, [k, perWeek, withBreak]);
  const reach = rows.find((r) => r.你的設定 >= 95)?.day;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="hc-diff" className="field-label">習慣難度</label>
          <select id="hc-diff" className="field" value={diff} onChange={(e) => setDiff(e.target.value)}>
            {difficulties.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="hc-freq" className="field-label">執行頻率</label>
          <select id="hc-freq" className="field" value={freq} onChange={(e) => setFreq(e.target.value)}>
            {frequencies.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
          </select>
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" className="h-4 w-4 accent-[rgb(var(--accent))]" checked={withBreak} onChange={(e) => setWithBreak(e.target.checked)} />
        模擬第 40 天起中斷一週
      </label>
      <figure className="rounded-2xl border border-line bg-surface p-3">
        <p className="mb-1 text-center text-xs font-medium text-accent">【概念模型】假設性的自動化程度曲線</p>
        <div className="h-64 w-full sm:h-72">
          <ResponsiveContainer>
            <LineChart data={rows} margin={{ top: 10, right: 16, left: -16, bottom: 0 }}>
              <CartesianGrid stroke="rgb(var(--line))" strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'rgb(var(--muted))' }} label={{ value: '天數', position: 'insideBottomRight', offset: -2, fontSize: 11, fill: 'rgb(var(--muted))' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'rgb(var(--muted))' }} />
              <Tooltip contentStyle={{ background: 'rgb(var(--surface))', border: '1px solid rgb(var(--line))', borderRadius: 12, fontSize: 12 }} formatter={(v: number) => `${v}（模擬值）`} labelFormatter={(l) => `第 ${l} 天`} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <ReferenceLine x={66} stroke="rgb(var(--apricot))" strokeDasharray="4 4" label={{ value: '66 天（研究中位數）', fontSize: 10, fill: 'rgb(var(--muted))', position: 'top' }} />
              <Line type="monotone" dataKey="你的設定" stroke="rgb(var(--accent))" strokeWidth={3} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="參考_每天簡單" name="參考：每天＋簡單" stroke="rgb(var(--sage))" strokeDasharray="6 4" dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <figcaption className="px-2 text-xs text-muted">
          模型示意：在此設定下，曲線約在第 {reach ?? '200 天以後'}{reach ? ' 天' : ''}接近高原（95%）。真實情況因人、行為與情境而有很大差異（研究估計約 18–254 天）。
        </figcaption>
      </figure>
      <Disclaimer>這是「概念模型」，參數為教學示意，並非由研究資料擬合，也不是經過驗證的個人神經變化數據。它只用來說明：難度越高、頻率越低，曲線通常越長；中斷一週不會讓一切歸零。</Disclaimer>
    </div>
  );
}
