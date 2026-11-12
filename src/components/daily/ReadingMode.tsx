/**
 * 每日朗讀模式（沉浸式介面）
 * - 一次呈現一句，文字置中；可上一句／下一句／重新開始／離開；顯示進度（例如 3／7）。
 * - 鍵盤：← → 切換、Esc 離開。
 * - 朗讀輔助：瀏覽器支援時可用 SpeechSynthesis 朗讀；不支援時提示自行朗讀。
 *   手機（特別是 iPhone）只允許在點擊當下開始朗讀，所以「朗讀這句」「自動朗讀開關」「上一句／下一句／重新開始」
 *   都在點擊（或按鍵）事件中直接呼叫 speak()，不放在 useEffect 裡。
 * - 讀完七句後顯示今日反思問題與紀錄表單；抵達最後一頁即記錄「今日已完成朗讀」。
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, RotateCcw, X, Volume2, VolumeX } from 'lucide-react';
import { affirmations, noPressureNote } from '../../content/dailyRewire';
import { useStore } from '../../store/AppStore';
import { getDailyLog } from '../../lib/daily';
import { nowIso } from '../../lib/id';
import { speak, speechSupported, stopSpeaking } from '../../lib/speech';
import SpeechStatus from '../ui/SpeechStatus';
import DailyLogForm from './DailyLogForm';
import WatercolorSpot from '../visual/WatercolorSpot';

const TOTAL = affirmations.length;

export default function ReadingMode() {
  const [step, setStep] = useState(0);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [saved, setSaved] = useState(false);
  const { data, upsert } = useStore();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const backTo = params.get('back') || '/daily';
  const heading = useRef<HTMLHeadingElement>(null);
  const canSpeak = speechSupported();
  const markedRef = useRef(false);
  const stepRef = useRef(step);
  stepRef.current = step;

  const exit = useCallback(() => {
    stopSpeaking();
    navigate(backTo);
  }, [navigate, backTo]);

  // 每次換句時把焦點移到語句，讓螢幕閱讀器讀出（朗讀改在點擊事件中處理）
  useEffect(() => {
    heading.current?.focus();
  }, [step]);

  /** 換句：在點擊／按鍵事件中呼叫；開啟自動朗讀時同步念出新的一句 */
  const autoRef = useRef(autoSpeak);
  autoRef.current = autoSpeak;
  const goTo = useCallback((next: number) => {
    const n = Math.max(0, Math.min(next, TOTAL));
    setStep(n);
    if (autoRef.current && n < TOTAL) speak(affirmations[n].text);
    else stopSpeaking();
  }, []);
  /** 自動朗讀開關：打開時立刻在這次點擊中念出目前這句（也同時解除手機的朗讀限制） */
  const toggleAuto = () => {
    if (autoSpeak) { stopSpeaking(); setAutoSpeak(false); return; }
    setAutoSpeak(true);
    if (step < TOTAL) speak(affirmations[step].text);
  };

  // 抵達完成頁：記錄今日已完成朗讀（只記一次，不覆蓋既有反思內容）
  useEffect(() => {
    if (step === TOTAL && !markedRef.current) {
      markedRef.current = true;
      const log = getDailyLog(data);
      if (!log.completedReading) upsert('dailyLogs', { ...log, completedReading: true, updatedAt: nowIso() });
    }
  }, [step, data, upsert]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (['INPUT', 'TEXTAREA'].includes(tag)) return;
      if (e.key === 'ArrowRight') goTo(stepRef.current + 1);
      if (e.key === 'ArrowLeft') goTo(stepRef.current - 1);
      if (e.key === 'Escape') exit();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      stopSpeaking();
    };
  }, [exit, goTo]);

  const a = affirmations[step];
  const done = step === TOTAL;

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-bg">
      {/* 背景：柔和的水彩色塊（裝飾，不影響閱讀） */}
      <div aria-hidden className="pointer-events-none fixed -left-24 -top-24 h-72 w-72 rounded-full bg-apricot/30 blur-3xl" />
      <div aria-hidden className="pointer-events-none fixed -right-20 top-1/3 h-64 w-64 rounded-full bg-sage/25 blur-3xl" />
      {/* 背景：植物生長與光點意象 */}
      <svg aria-hidden className="pointer-events-none fixed inset-x-0 bottom-0 h-64 w-full text-sage/30" viewBox="0 0 400 120" preserveAspectRatio="none">
        <path d={`M200 120 C 200 ${100 - step * 8}, ${190 - step * 3} ${90 - step * 9}, 200 ${80 - step * 10}`} stroke="currentColor" strokeWidth="3" fill="none" className="transition-all duration-700" />
        {Array.from({ length: Math.min(step, TOTAL) }).map((_, i) => (
          <ellipse key={i} cx={i % 2 ? 214 : 186} cy={104 - i * 10} rx="12" ry="5" fill="currentColor" transform={`rotate(${i % 2 ? -25 : 25} ${i % 2 ? 214 : 186} ${104 - i * 10})`} />
        ))}
      </svg>

      <header className="relative z-10 flex items-center justify-between px-4 py-3 sm:px-8">
        <button className="btn-ghost btn-sm" onClick={exit} aria-label="離開朗讀模式">
          <X className="h-4 w-4" aria-hidden /> 離開
        </button>
        <p className="font-display text-sm text-muted" aria-live="polite">
          {done ? '完成 7／7' : `${step + 1}／${TOTAL}`}
        </p>
        {canSpeak ? (
          <button className="btn-ghost btn-sm" onClick={toggleAuto} aria-pressed={autoSpeak}>
            {autoSpeak ? <Volume2 className="h-4 w-4" aria-hidden /> : <VolumeX className="h-4 w-4" aria-hidden />}
            {autoSpeak ? '自動朗讀：開' : '自動朗讀：關'}
          </button>
        ) : (
          <span className="max-w-[12rem] text-right text-xs text-muted">這個瀏覽器不支援朗讀，可以改用 Safari／Chrome，或自己慢慢唸</span>
        )}
      </header>

      {/* 進度點 */}
      <div className="relative z-10 mx-auto flex gap-1.5" aria-hidden>
        {affirmations.map((x, i) => (
          <span key={x.id} className={`h-1.5 w-6 rounded-full transition ${i < step || done ? 'bg-accent' : i === step ? 'bg-sage' : 'bg-line'}`} />
        ))}
      </div>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
        {!done ? (
          <div key={step} className="max-w-2xl motion-safe:animate-fade-up">
            {/* 與句意相關的水彩小插畫 */}
            <div className="mx-auto mb-2 w-28 sm:w-36"><WatercolorSpot kind={`aff${a.id}`} /></div>
            <p className="font-display text-lg italic text-sageink">{String(a.id).padStart(2, '0')}｜{a.theme}</p>
            {getDailyLog(data).practiceId === a.id && <p className="mt-2"><span className="chip">✦ 你今天選擇練習的句子</span></p>}
            <h1 ref={heading} tabIndex={-1} className="mt-4 font-serif text-4xl font-bold leading-tight text-ink outline-none sm:text-5xl md:text-6xl">
              {a.text}
            </h1>
            <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-muted">{a.meaning}</p>
            {a.note && <p className="mx-auto mt-4 max-w-md rounded-xl bg-apricot/30 px-3 py-2 text-xs">{a.note}</p>}
            {canSpeak && (
              <div className="mt-6 flex flex-col items-center gap-3">
                <button className="btn-secondary btn-sm" onClick={() => speak(a.text)}>
                  <Volume2 className="h-4 w-4" aria-hidden /> 朗讀這句
                </button>
                <SpeechStatus />
              </div>
            )}
          </div>
        ) : (
          <div className="w-full max-w-2xl text-left motion-safe:animate-fade-up">
            <h1 ref={heading} tabIndex={-1} className="text-center font-serif text-3xl font-bold outline-none">今天的七句話完成了 🌿</h1>
            <p className="mt-3 text-center text-muted">謝謝你花這幾分鐘陪伴自己。接下來，可以簡單記錄今天的感受。</p>
            <p className="mt-3 rounded-xl bg-soft/70 px-4 py-3 text-sm leading-relaxed">{noPressureNote}</p>
            <div className="mt-6 rounded-2xl border border-line bg-surface p-5 shadow-card">
              <h2 className="mb-4 font-serif text-lg font-bold">今日反思</h2>
              <DailyLogForm markCompleted onSaved={() => setSaved(true)} />
              {saved && (
                <p className="mt-4 text-sm text-accent" role="status">
                  已儲存！你可以在「每日心智練習」頁面隨時回顧與編輯。
                </p>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="relative z-10 flex items-center justify-center gap-2 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <button className="btn-secondary" onClick={() => goTo(step - 1)} disabled={step === 0}>
          <ArrowLeft className="h-4 w-4" aria-hidden /> 上一句
        </button>
        <button className="btn-ghost" onClick={() => { goTo(0); setSaved(false); }}>
          <RotateCcw className="h-4 w-4" aria-hidden /> 重新開始
        </button>
        {!done ? (
          <button className="btn-primary" onClick={() => goTo(step + 1)}>
            {step === TOTAL - 1 ? '完成' : '下一句'} <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        ) : (
          <button className="btn-primary" onClick={exit}>
            結束練習
          </button>
        )}
      </footer>
    </div>
  );
}
