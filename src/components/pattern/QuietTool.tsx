/**
 * Habit 04 工具：安靜五分鐘
 * 可自訂時間的安靜計時器、簡約呼吸動畫（可關閉；系統「減少動畫」時自動隱藏）、練習後反思欄位。
 */
import { useEffect, useRef, useState } from 'react';
import { Pause, Play, Square } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { useToast } from '../ui/Toast';
import { TextArea } from '../ui/basics';
import { nowIso, uid } from '../../lib/id';
import type { QuietEntry } from '../../types';
import { DeleteButton, EntryCard } from './EntryList';
import PracticeAffirmation from './PracticeAffirmation';

const QS: { key: 'thoughts' | 'feelings' | 'need' | 'organize'; q: string }[] = [
  { key: 'thoughts', q: '我剛才在想什麼？' },
  { key: 'feelings', q: '有哪些感受浮現？' },
  { key: 'need', q: '我現在真正需要什麼？' },
  { key: 'organize', q: '今天有什麼事情值得整理？' },
];

export default function QuietTool({ affirmationIds }: { affirmationIds: number[] }) {
  const { data, upsert } = useStore();
  const toast = useToast();
  const [minutes, setMinutes] = useState(5);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [reflect, setReflect] = useState(false);
  const [f, setF] = useState({ thoughts: '', feelings: '', need: '', organize: '' });
  const [done, setDone] = useState(false);
  const timer = useRef<number>();
  const total = minutes * 60;
  const list = data.patternEntries.filter((e): e is QuietEntry => e.kind === 'quiet');

  useEffect(() => {
    if (!running) return;
    timer.current = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(timer.current);
  }, [running]);
  useEffect(() => {
    if (running && elapsed >= total) {
      setRunning(false);
      setReflect(true);
      toast('時間到了，慢慢回到當下');
    }
  }, [elapsed, total, running, toast]);

  const stop = () => { setRunning(false); if (elapsed > 0) setReflect(true); };
  const save = () => {
    const t = nowIso();
    upsert('patternEntries', { id: uid(), kind: 'quiet', habitId: 'solitude', seconds: Math.min(elapsed, total), ...f, createdAt: t, updatedAt: t });
    toast('已儲存這次的安靜練習');
    setF({ thoughts: '', feelings: '', need: '', organize: '' });
    setElapsed(0);
    setReflect(false);
    setDone(true);
  };
  const left = Math.max(0, total - elapsed);
  const inhale = Math.floor(elapsed / 5) % 2 === 0; // 5 秒吸、5 秒吐的簡約節奏

  return (
    <div className="space-y-4">
      <div className="grid items-center gap-6 md:grid-cols-2">
        <div className="flex flex-col items-center">
          <div className="relative flex h-48 w-48 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-soft" aria-hidden />
            {animate && (
              <div className="absolute inset-0 rounded-full bg-sage/60 motion-reduce:hidden" aria-hidden style={{ transform: `scale(${running ? (inhale ? 0.95 : 0.55) : 0.6})`, transition: `transform ${running ? 5 : 0.3}s ease-in-out` }} />
            )}
            <div className="relative text-center" aria-live="polite">
              <p className="font-display text-3xl">{Math.floor(left / 60)}:{String(left % 60).padStart(2, '0')}</p>
              {running && <p className="text-sm text-muted">{inhale ? '慢慢吸氣' : '慢慢吐氣'}</p>}
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-sm leading-relaxed">找一個舒服的姿勢，放下手機以外的所有內容。不需要「清空大腦」，只是讓念頭來來去去。</p>
          <div>
            <label htmlFor="quiet-min" className="field-label">練習時間（分鐘）</label>
            <input id="quiet-min" type="number" min={1} max={60} className="field w-28" value={minutes} disabled={running} onChange={(e) => { setMinutes(Math.min(60, Math.max(1, Number(e.target.value) || 1))); setElapsed(0); }} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="h-4 w-4 accent-[rgb(var(--accent))]" checked={animate} onChange={(e) => setAnimate(e.target.checked)} />顯示呼吸動畫
          </label>
          <div className="flex gap-2">
            <button className="btn-primary" onClick={() => setRunning((r) => !r)}>
              {running ? <><Pause className="h-4 w-4" aria-hidden />暫停</> : <><Play className="h-4 w-4" aria-hidden />{elapsed ? '繼續' : '開始安靜'}</>}
            </button>
            <button className="btn-secondary" onClick={stop} disabled={elapsed === 0}><Square className="h-4 w-4" aria-hidden />結束並反思</button>
          </div>
        </div>
      </div>
      {reflect && (
        <div className="space-y-3 rounded-2xl border border-line bg-surface p-4 motion-safe:animate-fade-up">
          <p className="font-serif font-bold">練習後的反思（安靜了 {Math.floor(Math.min(elapsed, total) / 60)} 分 {Math.min(elapsed, total) % 60} 秒）</p>
          {QS.map(({ key, q }) => <TextArea key={key} label={q} rows={2} value={f[key]} onChange={(e) => setF({ ...f, [key]: e.target.value })} />)}
          <button className="btn-primary" onClick={save}>儲存這次安靜練習</button>
        </div>
      )}
      {done && <PracticeAffirmation ids={affirmationIds} onClose={() => setDone(false)} />}
      {list.length > 0 && (
        <ul className="space-y-2">
          {list.slice(0, 10).map((q) => (
            <EntryCard key={q.id} title={`安靜 ${Math.round(q.seconds / 60)} 分鐘`} at={q.createdAt} actions={<DeleteButton collection="patternEntries" id={q.id} label="安靜練習紀錄" />}>
              {QS.map(({ key, q: label }) => q[key] && <p key={key}><span className="text-muted">{label}</span> {q[key]}</p>)}
            </EntryCard>
          ))}
        </ul>
      )}
    </div>
  );
}
