/**
 * 朗讀檢查：讓非技術使用者也能回報朗讀問題。
 * 顯示：瀏覽器是否支援、是否為 App 內建瀏覽器、中文聲音數量、目前使用的聲音、最後一次朗讀結果與實際發聲時間。
 * 「播放測試音」播一段非語音的提示音，用來分辨是整支手機網頁沒聲音（靜音／音量），還是只有朗讀沒聲音。
 * 「複製檢查結果」只複製這些技術資訊與瀏覽器版本，不含任何個人紀錄。
 */
import { useEffect, useState } from 'react';
import { Bell, ClipboardCopy, Stethoscope, Volume2 } from 'lucide-react';
import { chineseVoicesNow, isGoogleTaiwan, isInAppBrowser, isTaiwanFemale, loadChineseVoices, speak, speechSupported, SYSTEM_VOICE } from '../../lib/speech';
import { playTestTone } from '../../lib/testTone';
import { useSpeechState } from '../../lib/useSpeech';
import { copyText } from '../../lib/clipboard';
import { useStore } from '../../store/AppStore';
import { useToast } from './Toast';

const RESULT: Record<string, string> = { none: '還沒有朗讀過', success: '成功', blocked: '被擋下（沒有開始發聲）', error: '發生錯誤' };
const SAMPLE = '你好，這是朗讀測試。我現在是安全的。';
const TONE: Record<string, string> = { none: '還沒有播放', ok: '已播放（有聽到嗎？）', fail: '無法播放' };

/** 把實際發聲時間翻成白話判讀：每個字至少約 0.12 秒才算真的有唸出來 */
function durationText(ms: number, chars: number): string {
  if (ms < 0) return '尚未量到';
  const sec = (ms / 1000).toFixed(1);
  if (chars > 0 && ms < chars * 120) return `${sec} 秒（太快結束，可能是語音資料沒有下載完整）`;
  return `${sec} 秒（時間正常；若仍聽不到，請檢查靜音模式與媒體音量）`;
}

export default function SpeechCheck() {
  const s = useSpeechState();
  const toast = useToast();
  const { data } = useStore();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(() => chineseVoicesNow());
  const [tone, setTone] = useState<'none' | 'ok' | 'fail'>('none');
  useEffect(() => { void loadChineseVoices().then(setVoices); }, []);
  const supported = speechSupported();
  const inApp = isInAppBrowser();
  const system = data.settings.voiceURI === SYSTEM_VOICE;
  const chosen = system ? undefined : voices.find((v) => v.voiceURI === data.settings.voiceURI) ?? voices[0];
  const rows: [string, string][] = [
    ['支援朗讀', supported ? '是' : '否'],
    ['App 內建瀏覽器', inApp ? '是（建議改用 Safari／Chrome）' : '否'],
    ['中文聲音數量', `${voices.length}（台灣女聲 ${voices.filter(isTaiwanFemale).length}；不含中國大陸聲音）`],
    ['Google 國語（臺灣）', voices.some(isGoogleTaiwan) ? '有' : '沒有'],
    ['目前使用的聲音', chosen ? `${chosen.name}（${chosen.lang}）` : system ? '相容模式：交給系統挑選（zh-TW）' : '交給系統挑選（zh-TW）'],
    ['最後一次朗讀', `${RESULT[s.lastResult]}${s.lastError ? `（${s.lastError}）` : ''}`],
    ['實際發聲時間', durationText(s.lastDurationMs, s.lastChars)],
    ['測試音', TONE[tone]],
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
        {/* play() 必須在點擊事件內同步呼叫，iOS 才允許發聲 */}
        <button type="button" className="btn-secondary btn-sm" onClick={() => { void playTestTone().then((ok) => setTone(ok ? 'ok' : 'fail')); }}><Bell className="h-4 w-4" aria-hidden />播放測試音</button>
        <button type="button" className="btn-ghost btn-sm" onClick={async () => toast((await copyText(report())) ? '已複製檢查結果，可以貼給我們' : '無法複製，請手動截圖', 'info')}><ClipboardCopy className="h-4 w-4" aria-hidden />複製檢查結果</button>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted">判讀：測試音也聽不到 → 多半是靜音模式（iPhone 側邊開關）或媒體音量太小，請在播放時按音量鍵調大；測試音聽得到、朗讀聽不到 → 多半是 iPhone 靜音開關只擋了朗讀（網頁音效不受影響），請把側邊開關切到有聲音再試，或在上方「朗讀聲音」改選「相容模式」再試一次。</p>
      <p className="mt-1 text-xs text-muted">只複製上面的技術資訊與瀏覽器版本，不包含你的任何紀錄。</p>
    </details>
  );
}
