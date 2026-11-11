/**
 * 神經道路模擬器（第 1 章）
 * 點擊「執行一次新習慣」時，草叢中的小徑逐漸清晰、舊大道逐漸長草。
 * ⚠️ 概念示意：無法代表真實大腦中的突觸變化。
 */
import { Footprints, RotateCcw, CloudRain } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { Disclaimer } from '../ui/basics';
import { useToast } from '../ui/Toast';

const MAX = 30;
const stages = [
  { at: 0, text: '草叢茂密，新的小徑幾乎看不見。一開始很費力是正常的。' },
  { at: 3, text: '踩出了一點痕跡。你仍常常不自覺走回大道，沒關係。' },
  { at: 8, text: '小徑變得比較清楚，走起來沒那麼吃力了。' },
  { at: 15, text: '小徑越來越平坦，舊大道的邊緣開始長出草。' },
  { at: 24, text: '新路已經相當好走，但舊大道仍在，壓力大時偶爾還會走上去。' },
];

export default function NeuralPathSim() {
  const { data, update } = useStore();
  const toast = useToast();
  const reps = data.neuralReps;
  const p = Math.min(reps, MAX) / MAX; // 0–1 熟悉度（示意）
  const stage = [...stages].reverse().find((s) => reps >= s.at)!;
  const setReps = (n: number) => update((prev) => ({ ...prev, neuralReps: Math.max(0, n) }));

  return (
    <div>
      <svg viewBox="0 0 600 260" className="h-auto w-full rounded-2xl bg-soft/60" role="img" aria-label={`神經道路示意：新小徑清晰度約 ${Math.round(p * 100)}%`}>
        {/* 草叢 */}
        {Array.from({ length: 70 }).map((_, i) => {
          const x = (i * 83) % 600;
          const y = 20 + ((i * 47) % 220);
          return <path key={i} d={`M${x} ${y + 10} l3 -10 l3 10`} stroke="rgb(var(--sage))" strokeWidth={1.5} fill="none" opacity={0.7} />;
        })}
        {/* 舊習慣：柏油大道 */}
        <path d="M40 200 C 200 200, 400 200, 560 200" stroke="rgb(var(--muted))" strokeWidth={34 - p * 14} strokeLinecap="round" fill="none" opacity={0.55 - p * 0.25} />
        <text x="300" y="245" textAnchor="middle" fontSize="13" fill="rgb(var(--muted))">舊習慣：柏油大道</text>
        {/* 新習慣：小徑 */}
        <path d="M40 200 C 150 60, 300 140, 380 80 S 520 60, 560 70" stroke="rgb(var(--apricot))" strokeWidth={4 + p * 20} strokeLinecap="round" fill="none" opacity={0.25 + p * 0.75} strokeDasharray={p < 0.3 ? '6 10' : undefined} className="transition-all duration-500" />
        <text x="420" y="40" textAnchor="middle" fontSize="13" fill="rgb(var(--ink))">新習慣：小徑</text>
        <circle cx="40" cy="200" r="16" fill="rgb(var(--accent))" />
        <text x="40" y="205" textAnchor="middle" fontSize="11" fill="rgb(var(--onaccent))">提示</text>
        <circle cx="560" cy="70" r="16" fill="rgb(var(--sage))" />
        <circle cx="560" cy="200" r="16" fill="rgb(var(--muted))" opacity={0.6} />
      </svg>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          className="btn-primary"
          onClick={() => {
            setReps(reps + 1);
            if (reps + 1 === 8 || reps + 1 === 15 || reps + 1 === 24) toast('小徑又清楚了一些 🌿');
          }}
        >
          <Footprints className="h-4 w-4" aria-hidden /> 執行一次新習慣
        </button>
        <button className="btn-secondary" onClick={() => setReps(reps - 2)} disabled={reps === 0}>
          <CloudRain className="h-4 w-4" aria-hidden /> 有幾天沒練習
        </button>
        <button className="btn-ghost" onClick={() => setReps(0)} disabled={reps === 0}>
          <RotateCcw className="h-4 w-4" aria-hidden /> 重設
        </button>
      </div>
      <p className="mt-3 text-sm" aria-live="polite">
        已練習 <strong>{reps}</strong> 次 · {stage.text}
      </p>
      <p className="mt-1 text-xs text-muted">「有幾天沒練習」只會讓小徑稍微模糊，而不是歸零——中斷後仍可以重新開始。</p>
      <Disclaimer>這是概念示意動畫，用來說明「重複練習與行為熟悉度」的關聯，無法直接代表真實大腦中的突觸變化，次數與清晰度也不對應任何真實數據。</Disclaimer>
    </div>
  );
}
