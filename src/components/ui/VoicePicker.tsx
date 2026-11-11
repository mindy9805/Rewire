/**
 * 朗讀聲音設定：列出裝置上的中文聲音（台灣女聲排最前面），可試聽與指定。
 * 預設「自動」＝挑選分數最高的聲音（台灣中文＋女聲＋自然語音優先）。
 * 裝置沒有台灣女聲時，提示各平台安裝方式（聲音由裝置提供，本站無法自行下載）。
 */
import { useEffect, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { useStore } from '../../store/AppStore';
import { isTaiwanFemale, loadChineseVoices, speak, speechSupported } from '../../lib/speech';
import SpeechStatus from './SpeechStatus';
import SpeechCheck from './SpeechCheck';

const SAMPLE = '我現在是安全的。今天是新的機會。';

export default function VoicePicker() {
  const { data, update } = useStore();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[] | null>(null);
  useEffect(() => { void loadChineseVoices().then(setVoices); }, []);
  if (!speechSupported()) return <div className="space-y-2"><p className="text-sm text-muted">這個瀏覽器不支援朗讀，可以改用 Safari／Chrome，或自己慢慢唸。</p><SpeechCheck /></div>;
  if (!voices) return <p className="text-sm text-muted" role="status">正在讀取裝置上的聲音…</p>;
  const current = data.settings.voiceURI;
  const auto = voices[0];
  const hasTwFemale = voices.some(isTaiwanFemale);
  const label = (v: SpeechSynthesisVoice) => `${v.name}（${v.lang}${isTaiwanFemale(v) ? '・台灣女聲' : ''}）`;
  return (
    <div className="space-y-2">
      <label htmlFor="voice" className="field-label">朗讀聲音</label>
      <div className="flex flex-wrap items-center gap-2">
        <select id="voice" className="field w-auto max-w-full" value={voices.some((v) => v.voiceURI === current) ? current : ''}
          onChange={(e) => update((p) => ({ ...p, settings: { ...p.settings, voiceURI: e.target.value } }))}>
          <option value="">自動（{auto ? label(auto) : '裝置預設'}）</option>
          {voices.map((v) => <option key={v.voiceURI} value={v.voiceURI}>{label(v)}</option>)}
        </select>
        <button type="button" className="btn-secondary btn-sm" onClick={() => speak(SAMPLE)}><Volume2 className="h-4 w-4" aria-hidden />試聽</button>
      </div>
      <SpeechStatus />
      {/* 沒有任何中文聲音，或沒有台灣女聲時，都提供安裝方式 */}
      {!hasTwFemale && (
        <p className="rounded-xl bg-apricot/25 p-3 text-xs leading-relaxed">
          {voices.length === 0 ? '這台裝置目前沒有中文聲音，朗讀時會交給系統處理，可能沒有聲音或發音不正確。' : '這台裝置目前沒有「台灣中文女聲」，會先用最接近的聲音。'}想安裝台灣女聲可以這樣做：
          iPhone／iPad：設定 → 輔助使用 → 朗讀內容 → 聲音 → 中文（台灣）→ 美佳；
          Mac：系統設定 → 輔助使用 → 朗讀內容 → 系統聲音 → 管理聲音 → 中文（台灣）；
          Windows：設定 → 時間與語言 → 語音 → 新增語音 → 中文（台灣）；
          Android：設定 → 文字轉語音 → Google 語音服務 → 中文（台灣）。安裝後重新整理頁面即可。
        </p>
      )}
      <SpeechCheck />
    </div>
  );
}
