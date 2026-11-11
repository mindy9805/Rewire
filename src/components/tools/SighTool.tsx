/**
 * 工具一：生理性嘆息
 * 呼吸節奏動畫（吸氣 → 再補吸 → 緩慢長吐氣）＋練習計時器；完成或提前結束時記錄練習秒數。
 * 減少動畫偏好時，以文字提示取代縮放動畫。
 */
import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Square } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { useToast } from '../ui/Toast';
import { nowIso, uid } from '../../lib/id';

const PHASES = [
  { name: '用鼻子吸氣', secs: 2, scale: 0.85 },
  { name: '再短短補吸一口', secs: 1, scale: 1 },
  { name: '用嘴巴緩慢吐氣', secs: 6, scale: 0.45 },
];
const CYCLE = PHASES.reduce((s, p) => s + p.secs, 0);

export default function SighTool() {
  const [minutes, setMinutes] = useState(1);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const { upsert, data } = useStore();
  const toast = useToast();
  const timer = useRef<number>();
  const total = minutes * 60;

  useEffect(() => {
    if (!running) return;
    timer.current = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(timer.current);
  }, [running]);

  useEffect(() => {
    if (running && elapsed >= total) finish(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed, total, running]);

  const finish = (complete: boolean) => {
    setRunning(false);
    if (elapsed >= 10) {
      upsert('sessions', { id: uid(), tool: 'sigh', seconds: Math.min(elapsed, total), createdAt: nowIso() });
      toast(complete ? '完成練習，記得回到自然呼吸 🌬️' : `已記錄 ${elapsed} 秒的練習`);
    }
    setElapsed(0);
  };

  // 目前所在的呼吸階段
  let t = elapsed % CYCLE;
  let phase = PHASES[0];
  let phaseLeft = 0;
  for (const p of PHASES) {
    if (t < p.secs) { phase = p; phaseLeft = p.secs - t; break; }
    t -= p.secs;
  }
  const scale = running ? phase.scale : 0.6;
  const count = data.sessions.filter((s) => s.tool === 'sigh').length;

  return (
    <div className="grid items-center gap-6 md:grid-cols-2">
      <div className="flex flex-col items-center">
        <div className="relative flex h-56 w-56 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-soft" aria-hidden />
          <div
            className="absolute rounded-full bg-sage/70 motion-reduce:hidden"
            style={{ width: '100%', height: '100%', transform: `scale(${scale})`, transition: `transform ${running ? phase.secs : 0.4}s ease-in-out` }}
            aria-hidden
          />
          <div className="relative text-center" aria-live="polite">
            <p className="font-serif text-lg font-bold">{running ? phase.name : '準備開始'}</p>
            {running && <p className="text-sm text-muted">{phaseLeft} 秒</p>}
          </div>
        </div>
        <p className="mt-3 text-sm text-muted">
          {running ? `剩餘 ${Math.floor((total - elapsed) / 60)}:${String((total - elapsed) % 60).padStart(2, '0')}` : `已累計練習 ${count} 次`}
        </p>
      </div>
      <div className="space-y-4">
        <ul className="space-y-1 text-sm leading-relaxed">
          <li>① 用鼻子吸氣，快吸滿時再短短補吸一口。</li>
          <li>② 用嘴巴緩慢、完整地吐氣，吐氣比吸氣長。</li>
          <li>③ 自然舒適地練習，不需用力。</li>
        </ul>
        <fieldset>
          <legend className="field-label">練習時間</legend>
          <div className="flex gap-2">
            {[1, 3, 5].map((m) => (
              <button key={m} type="button" disabled={running} aria-pressed={minutes === m} onClick={() => setMinutes(m)} className={minutes === m ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}>
                {m} 分鐘
              </button>
            ))}
          </div>
        </fieldset>
        <div className="flex gap-2">
          <button className="btn-primary" onClick={() => setRunning((r) => !r)}>
            {running ? <><Pause className="h-4 w-4" aria-hidden />暫停</> : <><Play className="h-4 w-4" aria-hidden />{elapsed ? '繼續' : '開始練習'}</>}
          </button>
          <button className="btn-secondary" onClick={() => finish(false)} disabled={elapsed === 0}>
            <Square className="h-4 w-4" aria-hidden /> 結束
          </button>
        </div>
        <p className="rounded-xl bg-apricot/30 px-3 py-2 text-xs leading-relaxed">⚠︎ 適用於短暫壓力調節，不是醫療或治療方式。若感到頭暈、胸悶或任何不適，請立即停止並恢復自然呼吸。</p>
      </div>
    </div>
  );
}
