/**
 * 朗讀狀態列：朗讀中顯示「正在朗讀…」與停止按鈕；
 * 按下後約 1.5 秒仍未開始（或出錯）時，顯示溫和的排除方法。
 */
import { Square } from 'lucide-react';
import { isInAppBrowser, isIOS, stopSpeaking } from '../../lib/speech';
import { useSpeechState } from '../../lib/useSpeech';

export default function SpeechStatus({ className = '' }: { className?: string }) {
  const s = useSpeechState();
  if (s.status === 'starting' || s.status === 'speaking') {
    return (
      <div role="status" className={`inline-flex flex-wrap items-center gap-2 rounded-2xl bg-soft px-3 py-1.5 text-sm text-accent ${className}`}>
        <span className="relative flex h-2.5 w-2.5" aria-hidden><span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 motion-safe:animate-ping" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" /></span>
        {s.status === 'starting' ? '準備朗讀…' : '正在朗讀…'}
        <button type="button" className="btn-ghost btn-sm -my-1 -mr-2" onClick={stopSpeaking} aria-label="停止朗讀"><Square className="h-3.5 w-3.5" aria-hidden />停止</button>
        {/* iPhone 的朗讀會被側邊靜音開關消音，網頁無法繞過，只能提醒 */}
        {isIOS() && <span className="basis-full text-xs text-muted">沒聽到聲音？請確認 iPhone 側邊的靜音開關（看得到橘色代表靜音）。</span>}
      </div>
    );
  }
  if (s.status === 'blocked' || s.status === 'error') {
    return (
      <div role="alert" className={`max-w-md rounded-2xl bg-apricot/25 p-3 text-left text-sm leading-relaxed ${className}`}>
        <p className="font-medium">好像沒有聽到聲音？可以試試：</p>
        <ul className="mt-1 list-disc space-y-0.5 pl-5">
          <li>確認音量已打開；iPhone 請關閉靜音模式後再按一次「朗讀」。</li>
          {isInAppBrowser() && <li>你現在是在 App 內建的瀏覽器（例如 LINE、Facebook、Instagram），請改用 Safari 或 Chrome 開啟本站。</li>}
          <li>裝置可能沒有中文語音：可到「資料與隱私 → 朗讀聲音」查看安裝方式與「朗讀檢查」。</li>
        </ul>
      </div>
    );
  }
  return null;
}
