/**
 * 朗讀檢查：讓非技術使用者也能回報朗讀問題。
 * 顯示：瀏覽器是否支援、是否為 App 內建瀏覽器、中文聲音數量、目前使用的聲音、最後一次朗讀結果。
 * 「複製檢查結果」只複製這些技術資訊與瀏覽器版本，不含任何個人紀錄。
 */
import { useEffect, useState } from 'react';
import { ClipboardCopy, Stethoscope, Volume2 } from 'lucide-react';
import { chineseVoicesNow, isInAppBrowser, isTaiwanFemale, loadChineseVoices, speak, speechSupported } from '../../lib/speech';
import { useSpeechState } from '../../lib/useSpeech';
import { copyText } from '../../lib/clipboard';
import { useStore } from '../../store/AppStore';
import { useToast } from './Toast';

const RESULT: Record<string, string> = { none: '還沒有朗讀過', success: '成功', blocked: '被擋下（沒有開始發聲）', error: '發生錯誤' };
const SAMPLE = '你好，這是朗讀測試。我現在是安全的。';

export default function SpeechCheck() {
  const s = useSpeechState();
  const toast = useToast();
  const { data } = useStore();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(() => chineseVoicesNow());
  useEffect(() => { void loadChineseVoices().then(setVoices); }, []);
  const supported = speechSupported();
  const inApp = isInAppBrowser();
  const chosen = voices.find((v) => v.voiceURI === data.settings.voiceURI) ?? voices[0];
  const rows: [string, string][] = [
    ['支援朗讀', supported ? '是' : '否'],
    ['App 內建瀏覽器', inApp ? '是（建議改用 Safari／Chrome）' : '否'],
    ['中文聲音數量', `${voices.length}（台灣女聲 ${voices.filter(isTaiwanFemale).length}）`],
    ['目前使用的聲音', chosen ? `${chosen.name}（${chosen.lang}）` : '交給系統挑選（zh-TW）'],
    ['最後一次朗讀', `${RESULT[s.lastResult]}${s.lastError ? `（${s.lastError}）` : ''}`],
  ];
  const report = () => [
    'Rewire 朗讀檢查',
    ...rows.map(([k, v]) => `${k}：${v}`),
    `瀏覽器：${typeof navigator !== 'undefined' ? navigator.userAgent : ''}`,
    `檢查時間：${new Date().toLocaleString('zh-TW')}`,
  ].join('\n');

  return (
    <details className="rounded-2xl border border-line bg-bg p-4">
      <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium"><Stethoscope className="h-4 w-4 text-accent" aria-hidden />朗讀檢查（聽不到聲音時使用）</summary>
      <dl className="mt-3 grid gap-x-4 gap-y-1.5 text-sm sm:grid-cols-[auto_1fr]" data-testid="speech-check">
        {rows.map(([k, v]) => <div key={k} className="contents"><dt className="text-muted">{k}</dt><dd>{v}</dd></div>)}
      </dl>
      <div className="mt-3 flex flex-wrap gap-2">
        {supported && <button type="button" className="btn-secondary btn-sm" onClick={() => speak(SAMPLE)}><Volume2 className="h-4 w-4" aria-hidden />播放測試句</button>}
        <button type="button" className="btn-ghost btn-sm" onClick={async () => toast((await copyText(report())) ? '已複製檢查結果，可以貼給我們' : '無法複製，請手動截圖', 'info')}><ClipboardCopy className="h-4 w-4" aria-hidden />複製檢查結果</button>
      </div>
      <p className="mt-2 text-xs text-muted">只複製上面的技術資訊與瀏覽器版本，不包含你的任何紀錄。</p>
    </details>
  );
}
