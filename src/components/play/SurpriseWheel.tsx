/**
 * Surprise Wheel｜隨機探索轉盤
 * 七個類別，可旋轉、重抽、取消特定類別、直接進入活動；減少動畫時直接顯示結果。
 */
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { RotateCw } from 'lucide-react';
import { wheelItems, storyMap, socialStories, type WheelItem } from '../../content/play';
import { useStore } from '../../store/AppStore';
import { useToast } from '../ui/Toast';
import { CardView, drawCard } from './MoodBox';
import { randomQuest } from './QuestPicker';
import QuestPicker from './QuestPicker';

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export default function SurpriseWheel() {
  const { data, update } = useStore();
  const toast = useToast();
  const excluded = data.wheelExcluded;
  const items = wheelItems.filter((w) => !excluded.includes(w.id));
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<WheelItem | null>(null);
  const [nonce, setNonce] = useState(0);
  const timer = useRef<number>();
  const seg = 360 / Math.max(1, items.length);

  const spin = () => {
    if (!items.length || spinning) return;
    const idx = Math.floor(Math.random() * items.length);
    // 指針在正上方：讓第 idx 格的中心轉到 0 度
    const target = 360 * 5 + (360 - (idx * seg + seg / 2));
    setResult(null);
    const finish = () => { setSpinning(false); setResult(items[idx]); setNonce((n) => n + 1); };
    if (reducedMotion()) { setRotation(target % 360); finish(); return; }
    setSpinning(true);
    setRotation((r) => r - (r % 360) + target);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(finish, 2600);
  };
  const toggle = (id: string) => {
    if (!excluded.includes(id) && items.length <= 2) return toast('至少保留兩個類別，轉盤才轉得起來', 'info');
    update((p) => ({ ...p, wheelExcluded: excluded.includes(id) ? excluded.filter((x) => x !== id) : [...excluded, id] }));
    setResult(null);
  };
  const r = 120;
  const arc = (i: number) => {
    const a0 = ((i * seg - 90) * Math.PI) / 180;
    const a1 = (((i + 1) * seg - 90) * Math.PI) / 180;
    return `M${r} ${r} L${r + r * Math.cos(a0)} ${r + r * Math.sin(a0)} A${r} ${r} 0 ${seg > 180 ? 1 : 0} 1 ${r + r * Math.cos(a1)} ${r + r * Math.sin(a1)} Z`;
  };

  return (
    <div className="grid items-start gap-6 md:grid-cols-[auto_1fr]">
      <div className="mx-auto flex flex-col items-center">
        <div className="relative">
          <div className="absolute left-1/2 top-[-6px] z-10 h-0 w-0 -translate-x-1/2 border-x-[10px] border-t-[16px] border-x-transparent border-t-ink" aria-hidden />
          <svg viewBox="0 0 240 240" width="240" height="240" role="img" aria-label={`探索轉盤，共 ${items.length} 個類別`} style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? 'transform 2.5s cubic-bezier(.2,.8,.2,1)' : 'none' }}>
            {items.map((w, i) => {
              const mid = ((i * seg + seg / 2 - 90) * Math.PI) / 180;
              return (
                <g key={w.id}>
                  <path d={arc(i)} fill={w.color} stroke="#FAF8F4" strokeWidth="2" />
                  <text x={r + 78 * Math.cos(mid)} y={r + 78 * Math.sin(mid)} fontSize="12" fill="#303630" textAnchor="middle" dominantBaseline="middle" transform={`rotate(${i * seg + seg / 2} ${r + 78 * Math.cos(mid)} ${r + 78 * Math.sin(mid)})`}>{w.label}</text>
                </g>
              );
            })}
            <circle cx={r} cy={r} r="18" fill="#FAF8F4" stroke="#36594B" strokeWidth="3" />
          </svg>
        </div>
        <button className="btn-primary mt-4" onClick={spin} disabled={spinning}><RotateCw className="h-4 w-4" aria-hidden />{result ? '再轉一次' : '轉轉看'}</button>
        <Link to="/play/garden" className="btn-ghost btn-sm mt-1">今天只想看看</Link>
      </div>
      <div className="space-y-4">
        <div aria-live="polite">
          {spinning && <p className="text-muted">轉呀轉……</p>}
          {result && (
            <div key={nonce} className="space-y-3 motion-safe:animate-pop">
              <p className="text-sm text-muted">轉到了：</p>
              <p className="font-serif text-2xl font-bold">{result.label}</p>
              <p className="text-sm">{result.desc}</p>
              {result.action.kind === 'route' && <Link to={result.action.to} className="btn-primary">前往{result.label}</Link>}
              {result.action.kind === 'card' && <CardView card={drawCard(undefined, result.action.cardType)} />}
              {result.action.kind === 'quest' && <QuestPicker initial={randomQuest()} />}
              {result.action.kind === 'story' && (() => { const s = socialStories[Math.floor(Math.random() * socialStories.length)]; return <Link to={`/play/stories?story=${s.id}`} className="btn-primary">玩「{storyMap[s.id].title}」</Link>; })()}
            </div>
          )}
        </div>
        <fieldset className="rounded-2xl bg-soft/50 p-3">
          <legend className="px-1 text-sm font-medium">轉盤上要出現的類別（可取消不喜歡的）</legend>
          <div className="mt-1 flex flex-wrap gap-2">
            {wheelItems.map((w) => {
              const on = !excluded.includes(w.id);
              return <button key={w.id} type="button" aria-pressed={on} onClick={() => toggle(w.id)} className={on ? 'btn-secondary btn-sm' : 'btn-ghost btn-sm line-through opacity-60'}>{w.label}</button>;
            })}
          </div>
        </fieldset>
      </div>
    </div>
  );
}
